import { refreshMeta } from '@/server/libs/token-store/copilot-token-meta.js';
import * as tokenStorage from '@/server/libs/token-store/token-storage.js';
import type { APIEvent } from '@solidjs/start/server';

export const PUT = async (event: APIEvent) => {
  const { id } = event.params;
  try {
    const { token } = await tokenStorage.getToken(id);
    const meta = await refreshMeta(token);
    return meta;
  } catch (e) {
    return new Response(e.message, { status: 400 });
  }
};
