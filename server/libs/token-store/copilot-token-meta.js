import { COPILOT_TOKEN_API_URL } from '../../config.js';
import { updateMetaByToken } from './token-storage.js';

// Token cache storing {token, expiresAt} keyed by oauthToken
const cacheMap = new Map();

// Function to check if a cached token is still valid (with 5 min buffer)
const isTokenValid = (meta) => {
  if (!meta) return false;
  const bufferDuration = 5 * 60 * 1000; // 5 minutes
  return Date.now() < meta.expiresAt - bufferDuration;
};

async function fetchAndCacheMeta(oauthToken) {
  let meta = cacheMap.get(oauthToken);
  if (isTokenValid(meta)) {
    return meta;
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

  const {
    token,
    expires_at,
    limited_user_quotas: { chat: chatQuota, completions: completionsQuota },
    limited_user_reset_date: resetDate,
  } = await tokenRes.json();
  const expiresAt = expires_at ? new Date(expires_at).getTime() : Date.now() + 60 * 60 * 1000;

  meta = { token, expiresAt, resetTime: resetDate * 1000, chatQuota, completionsQuota };
  cacheMap.set(oauthToken, meta);
  await updateMetaByToken(oauthToken, meta);
  return meta;
}

export async function getBearerToken(oauthToken) {
  const meta = await fetchAndCacheMeta(oauthToken);
  return meta.token;
}
