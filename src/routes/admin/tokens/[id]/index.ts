import type { APIEvent } from "@solidjs/start/server";
import * as tokenStorage from "@/server/libs/token-store/token-storage.js";

export const PATCH = async (event: APIEvent) => {
  const { id } = event.params;
  const body = await event.request.json();
  const { name } = body;
  try {
    await tokenStorage.updateName(id, name);
  } catch (e) {
    return new Response(null, { status: 404 });
  }
  return new Response(null, { status: 204 });
};

export const DELETE = async (event: APIEvent) => {
  const { id } = event.params;
  await tokenStorage.removeToken(id);
  return new Response(null, { status: 204 });
};
