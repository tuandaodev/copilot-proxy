import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { refreshMeta } from "@/server/libs/token-store/copilot-token-meta.js";
import * as tokenStorage from "@/server/libs/token-store/token-storage.js";

export const PUT = async (event: APIEvent) => {
  const { id } = event.params;
  try {
    const { token } = await tokenStorage.getToken(id);
    const meta = await refreshMeta(token);
    return json(meta);
  } catch (e) {
    return new Response(null, { status: 404 });
  }
};
