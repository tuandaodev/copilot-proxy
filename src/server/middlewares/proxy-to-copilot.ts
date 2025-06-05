import { COPILOT_API_HOST, COPILOT_HEADERS } from '@/server/config';
import { log } from '@/server/libs/logger';

// Refactored: utility for API routes, not Express middleware
export async function proxyToCopilot(event, bearerToken) {
  const url = new URL(event.request.url);
  const targetPath = url.pathname.replace(/^\/api/, '');
  const targetUrl = `https://${COPILOT_API_HOST}${targetPath}${url.search}`;

  log.info(`Proxying to: ${targetUrl}`);

  // Prepare headers
  const headers = new Headers(event.request.headers);
  COPILOT_HEADERS && Object.entries(COPILOT_HEADERS).forEach(([k, v]) => headers.set(k, v));
  headers.set('authorization', `Bearer ${bearerToken}`);
  headers.set('host', COPILOT_API_HOST);

  // Proxy the request
  const proxyResponse = await fetch(targetUrl, {
    method: event.request.method,
    headers,
    body: ['GET', 'HEAD'].includes(event.request.method) ? undefined : event.request.body,
    duplex: 'half',
  });

  // Return proxied response
  return new Response(proxyResponse.body, {
    status: proxyResponse.status,
    headers: proxyResponse.headers,
  });
}
