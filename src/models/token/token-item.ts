import { createResource } from 'solid-js';
import type { TokenItem } from './types';

async function fetchTokens() {
  const res = await fetch('/admin/tokens', {
    method: 'GET',
  });
  return res.json();
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

export const removeToken = async (id: string) => {
  const succeed = await removeTokenItem(id);
  succeed && mutate((tokens) => tokens.filter((token) => token.id !== id));
};

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

export const addToken = async (name: string, token: string) => {
  const addedToken = await postToken(name, token);
  mutate((tokens) => [addedToken, ...tokens]);
};

export { tokenList, refetch as refetchTokenList };
