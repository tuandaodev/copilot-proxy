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
  const item = id
    ? await tokenStorage.getItem(id)
    : { id: uuid(), name, token, createdAt: Date.now() };
  await tokenStorage.setItem(item.id, { ...item, name, token });
}

export async function updateMetaByToken(oauthToken, meta) {
  const tokens = await tokenStorage.values();
  const tokenItem = tokens.find((item) => item.token === oauthToken);
  if (!tokenItem) {
    // may be a user-provided token, do nothing
    return;
  }
  await tokenStorage.setItem(tokenItem.id, { ...tokenItem, meta });
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
