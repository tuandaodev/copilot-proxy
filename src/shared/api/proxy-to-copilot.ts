import { COPILOT_API_HOST, COPILOT_HEADERS } from '@/shared/config/config';
import { log } from '@/shared/lib/logger';
import { json as responseJson } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';
import OpenAI from 'openai';

import { Langfuse, observeOpenAI } from 'langfuse';
import { readJson } from '../lib/stream-helper';

const langfuse = new Langfuse();

interface HandlerConfig {
  bearerToken: string;
  headers: Headers;
  bodyJson: Record<string, any>;
  targetUrl: string;
  targetPath: string;
  request: Request;
}

async function chatCompletionHandler(config: HandlerConfig) {
  const { bearerToken, headers, bodyJson } = config;
  const trace = langfuse.trace({
    name: 'copilot-proxy',
  });
  const span = trace.span({ name: 'proxy-chat-completions' });

  const client = new OpenAI({
    apiKey: bearerToken,
    baseURL: `https://${COPILOT_API_HOST}`,
    fetchOptions: {
      headers,
    } as any,
  });
  const wrappedClient = observeOpenAI(client, {
    parent: span,
    generationName: 'proxy-chat-generation',
  });

  const completions = await wrappedClient.chat.completions.create(
    bodyJson as OpenAI.ChatCompletionCreateParams,
  );
  span.end();

  if (!bodyJson.stream) {
    return responseJson(completions);
  }

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of completions) {
        controller.enqueue(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
    },
  });
}

async function commonHandler(config: HandlerConfig) {
  const { headers, request, targetUrl } = config;
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body;

  log.info(`Proxying to: ${request.method} ${targetUrl}`);

  // Proxy the request
  const proxyResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    duplex: 'half',
  });

  log.info(`Proxy response: ${proxyResponse.status} ${proxyResponse.statusText}`);

  return proxyResponse;
}

async function getHandlerConfig(event: APIEvent, bearerToken: string): Promise<HandlerConfig> {
  const url = new URL(event.request.url);
  const targetPath = url.pathname.replace(/^\/api/, '');
  const targetUrl = `https://${COPILOT_API_HOST}${targetPath}${url.search}`;

  // Prepare headers
  const headers = new Headers(event.request.headers);
  COPILOT_HEADERS && Object.entries(COPILOT_HEADERS).forEach(([k, v]) => headers.set(k, v));
  headers.set('authorization', `Bearer ${bearerToken}`);
  headers.set('host', COPILOT_API_HOST);
  log.debug(headers, 'Headers for proxying to Copilot');

  // clone body to avoid reading original body stream
  const clonedBody = event.request.clone().body;
  const bodyJson = clonedBody ? await readJson(clonedBody) : {};

  const config = {
    bearerToken,
    headers,
    bodyJson,
    targetUrl,
    targetPath,
    request: event.request,
  };

  return config;
}

export async function proxyToCopilot(event: APIEvent, bearerToken: string) {
  const config = await getHandlerConfig(event, bearerToken);

  if (config.targetPath.startsWith('/chat/completions')) {
    return chatCompletionHandler(config);
  }

  return commonHandler(config);
}
