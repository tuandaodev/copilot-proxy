import { maskToken } from '../libs/mask-token.js';
import * as tokenStorage from '../libs/token-store/token-storage.js';
import { startLogin, startPolling } from '../token-resource.js';

function transformTokenItem(tokenItem, defaultToken) {
  return {
    ...tokenItem,
    token: maskToken(tokenItem.token),
    default: defaultToken && defaultToken.id === tokenItem.id,
  };
}

export async function createToken(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  const jsonWriter = (obj) => {
    res.write(JSON.stringify(obj));
    return obj;
  };
  await startLogin().then(jsonWriter);
  const { accessToken } = await startPolling().then(jsonWriter);
  if (accessToken) {
    tokenStorage.storeToken({
      name: `Token-${Date.now()}`,
      token: accessToken,
    });
  }
  res.end();
}

export async function removeToken(req, res) {
  const { id } = req.params;
  await tokenStorage.removeToken(id);
  res.status(204).end();
}

export async function getTokens(req, res) {
  const tokens = await tokenStorage.getTokens();
  const defaultToken = await tokenStorage.getSelectedToken();
  const results = tokens
    .map((item) => transformTokenItem(item, defaultToken))
    .sort((a, b) => b.createdAt - a.createdAt);

  res.json(results);
}

export async function setDefaultToken(req, res) {
  const { id } = req.body;
  try {
    await tokenStorage.selectToken(id);
  } catch (e) {
    return res.status(404).end();
  }
  res.status(204).end();
}
