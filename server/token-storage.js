import storage from 'node-persist';
import { v4 as uuid } from 'uuid';

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
  if (!id) {
    id = uuid();
  }
  await tokenStorage.setItem(id, { id, name, token });
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
