import fetch from 'node-fetch';

import { COPILOT_TOKEN_API_URL } from '../config.js';

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
  if (!oauthToken) {
    throw new Error('OAuth token is required');
  }

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
  if (!req.oauthToken) {
    res.status(401).send('Do login or provide a GitHub token in the Authorization header');
    return;
  }

  try {
    req.bearerToken = await getBearerToken(req.oauthToken);
    next();
  } catch (error) {
    console.error(`Error fetching Bearer token: ${error.message}`);
    res.status(500).send(`Internal server error: ${error.message}`);
  }
}
