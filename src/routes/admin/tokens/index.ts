import { maskToken } from '@/server/libs/mask-token.js';
import * as tokenStorage from '@/server/libs/token-store/token-storage.js';
import { json } from '@solidjs/router';
import type { APIEvent } from '@solidjs/start/server';

function transformTokenItem(tokenItem, defaultToken) {
  return {
    ...tokenItem,
    token: maskToken(tokenItem.token),
    default: defaultToken && defaultToken.id === tokenItem.id,
  };
}

export const GET = async (event: APIEvent) => {
  const tokens = await tokenStorage.getTokens();
  const defaultToken = await tokenStorage.getSelectedToken();
  const results = tokens
    .map((item) => transformTokenItem(item, defaultToken))
    .sort((a, b) => b.createdAt - a.createdAt);

  return json(results);
};

export const POST = async (event: APIEvent) => {
  const body = await event.request.json();
  const { name, token } = body;
  if (!name || !token) {
    return new Response(null, { status: 400 });
  }
  try {
    const item = await tokenStorage.storeToken({ name, token });
    return json(transformTokenItem(item));
  } catch (e) {
    return new Response(null, { status: 409 });
  }
};

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
