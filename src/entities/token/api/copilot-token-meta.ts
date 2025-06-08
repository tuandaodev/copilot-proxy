import { COPILOT_TOKEN_API_URL } from '@/shared/config/config';
import { updateMetaByToken } from '@/entities/token/api/token-storage';

// Token cache storing {token, expiresAt} keyed by oauthToken
const cacheMap = new Map();

// Function to check if a cached token is still valid (with 5 min buffer)
const isTokenValid = (meta) => {
  if (!meta) return false;
  const bufferDuration = 5 * 60 * 1000; // 5 minutes
  return Date.now() < meta.expiresAt - bufferDuration;
};

async function fetchMeta(oauthToken) {
  const res = await fetch(COPILOT_TOKEN_API_URL, {
    method: 'GET',
    headers: {
      'User-Agent': 'CopilotProxy',
      Authorization: `token ${oauthToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch token: ${res.status} ${res.statusText}`);
  }

  const {
    token,
    expires_at,
    limited_user_quotas: { chat: chatQuota, completions: completionsQuota },
    limited_user_reset_date: resetDate,
  } = await res.json();
  const expiresAt = expires_at ? new Date(expires_at).getTime() : Date.now() + 60 * 60 * 1000;

  return { token, expiresAt, resetTime: resetDate * 1000, chatQuota, completionsQuota };
}

export async function refreshMeta(oauthToken) {
  const meta = await fetchMeta(oauthToken);

  cacheMap.set(oauthToken, meta);
  await updateMetaByToken(oauthToken, meta);
  return meta;
}

export async function getBearerToken(oauthToken) {
  let meta = cacheMap.get(oauthToken);
  if (!isTokenValid(meta)) {
    meta = await refreshMeta(oauthToken);
  }
  return meta.token;
}
