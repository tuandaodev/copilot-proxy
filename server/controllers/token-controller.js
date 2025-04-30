import * as tokenStorage from '../token-storage.js';

export async function getTokens(req, res) {
  const tokens = await tokenStorage.getTokens();
  const defaultToken = await tokenStorage.getSelectedToken();
  tokens.forEach((item) => {
    item.token = `${item.token.slice(0, 5)}...${item.token.slice(-5)}`;
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
