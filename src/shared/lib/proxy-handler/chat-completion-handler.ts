import { json as responseJson } from '@solidjs/router';
import { Langfuse, observeOpenAI } from 'langfuse';
import OpenAI from 'openai';
import type { HandlerConfig } from './types';

import { maskToken } from '@/shared/lib/mask-token';

const langfuse = new Langfuse();

export async function chatCompletionHandler(config: HandlerConfig) {
  const { bearerToken, headers, bodyJson } = config;
  const trace = langfuse.trace({
    name: 'copilot-proxy-chat-completions',
    input: bodyJson.messages,
    metadata: {
      maskedToken: maskToken(bearerToken),
      stream: bodyJson.stream,
      model: bodyJson.model,
    },
  });

  const client = new OpenAI({
    apiKey: bearerToken,
    baseURL: `https://${headers.get('host')}`,
    fetchOptions: {
      headers,
    } as any,
  });
  const wrappedClient = observeOpenAI(client, {
    parent: trace,
    generationName: 'proxy-chat-generation',
  });

  const completions = await wrappedClient.chat.completions.create(
    bodyJson as OpenAI.ChatCompletionCreateParams,
  );

  if (!bodyJson.stream) {
    trace.update({ output: completions });
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
