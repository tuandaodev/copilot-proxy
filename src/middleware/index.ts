import { log } from '@/shared/lib/logger';
import { createMiddleware } from '@solidjs/start/middleware';
import type { FetchEvent } from '@solidjs/start/server';

function truncate(str: string, maxLength = 100) {
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.slice(0, maxLength)}...`;
}

export default createMiddleware({
  onBeforeResponse: ({ request, response, clientAddress }: FetchEvent) => {
    log.info(
      {
        clientAddress,
        method: request.method,
        url: truncate(request.url),
        status: response.status,
        statusText: response.statusText,
      },
      'Response info',
    );
  },
});
