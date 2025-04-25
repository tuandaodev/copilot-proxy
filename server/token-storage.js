import storage from 'node-persist';

const TOKEN_STORAGE_KEY = '@@token_storage';

async function initStorage() {
  await storage.init({
    dir: '.storage', // Optional: custom directory for tokens
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false, // can enable true for debugging
    ttl: false, // tokens never expire by default
  });
}

// Call this once when your app starts
initStorage();

// To store a token
export async function storeToken(token) {
  await storage.setItem(TOKEN_STORAGE_KEY, token);
}

// To retrieve a token
export async function getToken() {
  return await storage.getItem(TOKEN_STORAGE_KEY);
}

// To remove a token
export async function removeToken() {
  await storage.removeItem(TOKEN_STORAGE_KEY);
}
