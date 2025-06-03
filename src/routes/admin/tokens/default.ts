import type { APIEvent } from "@solidjs/start/server";
import * as tokenStorage from "@/server/libs/token-store/token-storage.js";

export const PUT = async (event: APIEvent) => {
  const body = await event.request.json();
  const { id } = body;
  try {
    await tokenStorage.selectToken(id);
  } catch (e) {
    return new Response(null, { status: 404 });
  }
  return new Response(null, { status: 204 });
};
