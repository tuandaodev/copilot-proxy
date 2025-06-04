import { maskToken } from '@/server/libs/mask-token.js';
import { refreshMeta } from '@/server/libs/token-store/copilot-token-meta.js';
import * as tokenStorage from '@/server/libs/token-store/token-storage.js';
import { action, query, revalidate } from '@solidjs/router';
import type { TokenItem } from './types';

function transformTokenItem(tokenItem, defaultToken?): TokenItem {
  return {
    ...tokenItem,
    token: maskToken(tokenItem.token),
    default: defaultToken && defaultToken.id === tokenItem.id,
  };
}

export const getTokenList = query(async () => {
  'use server';
  const tokens = await tokenStorage.getTokens();
  const defaultToken = await tokenStorage.getSelectedToken();
  const results = tokens
    .map((item) => transformTokenItem(item, defaultToken))
    .sort((a, b) => b.createdAt - a.createdAt);

  return results;
}, 'tokens');

export const refetchTokenList = () => revalidate(getTokenList.key);

async function fetchTokens() {
  return {};
}

async function removeTokenItem(id: string) {
  await fetch(`/admin/tokens/${id}`, {
    method: 'DELETE',
  });
  return true;
}

async function putTokenDefault(id: string) {
  await fetch('/admin/tokens/default', {
    method: 'PUT',
    body: JSON.stringify({ id }),
  });
  return true;
}

async function patchTokenName(id: string, name: string) {
  await fetch(`/admin/tokens/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
  return true;
}

async function postToken(name: string, token: string) {
  const res = await fetch('/admin/tokens', {
    method: 'POST',
    body: JSON.stringify({ name, token }),
  });
  return res.json();
}

export const setDefaultToken = action(async (id: string) => {
  'use server';
  await tokenStorage.selectToken(id);
}, 'setDefaultToken');

export const removeToken = action(async (id: string) => {
  'use server';
  await tokenStorage.removeToken(id);
}, 'removeToken');

export const renameToken = action(async (id: string, name: string) => {
  'use server';
  await tokenStorage.updateName(id, name);
}, 'renameToken');

export const refreshTokenMeta = action(async (id: string) => {
  'use server';
  const { token } = await tokenStorage.getToken(id);
  const meta = await refreshMeta(token);
  await tokenStorage.updateMetaByToken(token, meta);
  return meta;
}, 'refreshTokenMeta');

export const addToken = action(async (name: string, token: string): Promise<TokenItem | null> => {
  'use server';

  if (!name || !token) {
    return null;
  }
  try {
    const item = await tokenStorage.storeToken({ name, token });
    return transformTokenItem(item);
  } catch (e) {
    return null;
  }
}, 'addToken');
