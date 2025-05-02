import storage from 'node-persist';
import { v4 as uuid } from 'uuid';
import tokenMeta from './copilot-token-meta.js';

const tokenStorage = storage.create({
  dir: '.storage/tokens',
  ttl: false, // tokens never expire by default
});

const selectedTokenStorage = storage.create({
  dir: '.storage/selected-token',
  ttl: false, // tokens never expire by default
});

await tokenStorage.init();
await selectedTokenStorage.init();

// Store a new token: { name, token }
export async function storeToken({ id, name, token }) {
  const item = id
    ? await tokenStorage.getItem(id)
    : { id: uuid(), name, token, createdAt: Date.now() };
  const meta = tokenMeta.get(token);
  await tokenStorage.setItem(item.id, { ...item, name, token, meta });
}

// Get all tokens
export async function getTokens() {
  return (await tokenStorage.values()) || [];
}

// Remove a token by id
export async function removeToken(id) {
  await tokenStorage.removeItem(id);
}

export async function selectToken(id) {
  await selectedTokenStorage.setItem('selected-token-id', id);
}

export async function getSelectedToken() {
  const id = await selectedTokenStorage.getItem('selected-token-id');
  if (!id) {
    return null;
  }
  return await tokenStorage.getItem(id);
}
