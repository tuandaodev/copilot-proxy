import { json as responseJson } from '@solidjs/router';
import OpenAI from 'openai';
import { Langfuse, observeOpenAI } from 'langfuse';
import type { HandlerConfig } from './types';

const langfuse = new Langfuse();

export async function chatCompletionHandler(config: HandlerConfig) {
  const { bearerToken, headers, bodyJson } = config;
  const trace = langfuse.trace({
    name: 'copilot-proxy',
  });
  const span = trace.span({ name: 'proxy-chat-completions' });

  const client = new OpenAI({
    apiKey: bearerToken,
    baseURL: `https://${headers.get('host')}`,
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
