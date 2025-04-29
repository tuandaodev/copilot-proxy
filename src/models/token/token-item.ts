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

const [tokenList, { refetch, mutate }] = createResource<TokenItem[]>(fetchTokens);

const removeToken = async (id: string) => {
  const succeed = await removeTokenItem(id);
  succeed && mutate((tokens) => tokens.filter((token) => token.id !== id));
};

export { tokenList, refetch as refetchTokenList, removeToken };
