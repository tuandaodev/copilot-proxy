import { COPILOT_API_HOST, COPILOT_HEADERS } from '@/shared/config/config';
import { log } from '@/shared/lib/logger';

// Refactored: utility for API routes, not Express middleware
export async function proxyToCopilot(event, bearerToken) {
  const url = new URL(event.request.url);
  const targetPath = url.pathname.replace(/^\/api/, '');
  const targetUrl = `https://${COPILOT_API_HOST}${targetPath}${url.search}`;

  // Prepare headers
  const headers = new Headers(event.request.headers);
  COPILOT_HEADERS && Object.entries(COPILOT_HEADERS).forEach(([k, v]) => headers.set(k, v));
  headers.set('authorization', `Bearer ${bearerToken}`);
  headers.set('host', COPILOT_API_HOST);

  const body =
    event.request.method === 'GET' || event.request.method === 'HEAD'
      ? undefined
      : event.request.body;

  log.info(`Proxying to: ${event.request.method} ${targetUrl}`);

  // Proxy the request
  const proxyResponse = await fetch(targetUrl, {
    method: event.request.method,
    headers,
    body,
    duplex: 'half',
  });

  // Return proxied response
  return new Response(proxyResponse.body, {
    status: proxyResponse.status,
    headers: proxyResponse.headers,
  });
}
