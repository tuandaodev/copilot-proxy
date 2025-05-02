import { COPILOT_TOKEN_API_URL } from '../config.js';
import { maskToken } from '../libs/mask-token.js';
import { getSelectedToken } from '../token-storage.js';

// Token cache storing {token, expiresAt} keyed by oauthToken
const tokenCache = new Map();

// Function to check if a cached token is still valid (with 5 min buffer)
const isTokenValid = (cachedToken) => {
  if (!cachedToken) return false;
  const bufferDuration = 5 * 60 * 1000; // 5 minutes
  return Date.now() < cachedToken.expiresAt - bufferDuration;
};

// Function to get Bearer token using OAuth token
const getBearerToken = async (oauthToken) => {
  const cachedToken = tokenCache.get(oauthToken);
  if (isTokenValid(cachedToken)) {
    return cachedToken.token;
  }

  const tokenRes = await fetch(COPILOT_TOKEN_API_URL, {
    method: 'GET',
    headers: {
      'User-Agent': 'CopilotProxy',
      Authorization: `token ${oauthToken}`,
    },
  });

  if (!tokenRes.ok) {
    throw new Error(`Failed to fetch token: ${tokenRes.status} ${tokenRes.statusText}`);
  }

  const response = await tokenRes.json();
  const token = response.token;
  const expiresAt = response.expires_at
    ? new Date(response.expires_at).getTime()
    : Date.now() + 60 * 60 * 1000;

  tokenCache.set(oauthToken, { token, expiresAt });
  return token;
};

export async function ensureInternalToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const oauthToken =
    authHeader?.replace(/^(token|Bearer) /, '') || (await getSelectedToken()).token || null;

  if (!oauthToken) {
    res.status(401).send('Do login or provide a GitHub token in the Authorization header');
    return;
  }
  console.log('Use token:', maskToken(oauthToken));

  try {
    req.bearerToken = await getBearerToken(oauthToken);
    next();
  } catch (error) {
    console.error(`Error fetching Bearer token: ${error.message}`);
    res.status(500).send(`Internal server error: ${error.message}`);
  }
}
