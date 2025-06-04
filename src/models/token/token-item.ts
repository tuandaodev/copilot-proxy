import { maskToken } from '@/server/libs/mask-token.js';
import * as tokenStorage from '@/server/libs/token-store/token-storage.js';
import { action, query, revalidate } from '@solidjs/router';
import { createResource } from 'solid-js';
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

async function putTokenMeta(id: string) {
  const res = await fetch(`/admin/tokens/${id}/meta`, {
    method: 'PUT',
  });
  return res.json();
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

const [tokenList, { refetch, mutate }] = createResource<TokenItem[]>(fetchTokens);

export const setDefaultToken = async (id: string) => {
  const succeed = await putTokenDefault(id);
  if (succeed) {
    mutate((tokens) =>
      tokens.map((token) => ({
        ...token,
        default: token.id === id,
      })),
    );
  }
};

export const removeToken = action(async (id: string) => {
  'use server';
  await tokenStorage.removeToken(id);
}, 'removeToken');

export const renameToken = async (id: string, name: string) => {
  const succeed = await patchTokenName(id, name);
  if (succeed) {
    mutate((tokens) =>
      tokens.map((token) => ({
        ...token,
        name: token.id === id ? name : token.name,
      })),
    );
  }
};

export const refreshTokenMeta = async (id: string) => {
  const meta = await putTokenMeta(id);
  mutate((tokens) =>
    tokens.map((token) => ({
      ...token,
      meta: token.id === id ? meta : token.meta,
    })),
  );
};

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

export { tokenList };
