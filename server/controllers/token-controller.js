import { maskToken } from '../libs/mask-token.js';
import { startLogin, startPolling } from '../token-resource.js';
import * as tokenStorage from '../token-storage.js';

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
  tokens.forEach((item) => {
    item.token = maskToken(item.token);
    item.default = defaultToken && defaultToken.id === item.id;
  });

  res.json(tokens.sort((a, b) => b.createdAt - a.createdAt));
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
