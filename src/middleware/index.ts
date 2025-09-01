import { logHttp } from '@/shared/lib/logger';
import { requireBasicAuth } from '@/shared/lib/basic-auth';
import { createMiddleware } from '@solidjs/start/middleware';
import type { FetchEvent } from '@solidjs/start/server';

export default createMiddleware({
  onRequest: ({ request, nativeEvent }: FetchEvent) => {
    const url = new URL(request.url);
    
    // Apply basic auth to admin and API routes
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) {
      const authResponse = requireBasicAuth(request);
      if (authResponse) {
        return authResponse;
      }
    }
  },
  onBeforeResponse: ({ nativeEvent }: FetchEvent) => {
    logHttp(nativeEvent.node.req, nativeEvent.node.res);
  },
});
