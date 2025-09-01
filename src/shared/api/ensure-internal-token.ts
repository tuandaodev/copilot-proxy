import { getBearerToken } from '@/entities/token/api/copilot-token-meta';
import { getSelectedToken } from '@/entities/token/api/token-storage';
import { log } from '@/shared/lib/logger';
import { maskToken } from '@/shared/lib/mask-token';
import type { APIEvent } from '@solidjs/start/server';

const EMPTY_TOKEN = '_';

/**
 * Checks if the authorization header contains basic auth credentials
 */
function isBasicAuth(authHeader: string | null): boolean {
  return authHeader?.toLowerCase().startsWith('basic ') ?? false;
}

// Refactored: utility for API routes, not Express middleware
export async function ensureInternalToken(event: APIEvent) {
  const authHeader = event.request.headers.get('authorization');
  let oauthToken: string | undefined = undefined;
  if (isBasicAuth(authHeader)) {
    const selectedToken = await getSelectedToken();
    oauthToken = selectedToken?.token;
  } else {
    // Standard token handling for Bearer/token auth
    const providedToken = authHeader?.replace(/^(token|Bearer) ?/, '') || EMPTY_TOKEN;
    const selectedToken = await getSelectedToken();
    oauthToken = providedToken === EMPTY_TOKEN ? selectedToken?.token : providedToken;
  }

  if (!oauthToken) {
    return {
      error: new Response('Do login or provide a GitHub token in the Authorization header', {
        status: 401,
      }),
    };
  }
  log.info({ 'Use token': maskToken(oauthToken) });

  try {
    const bearerToken = await getBearerToken(oauthToken);
    return { bearerToken };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.error(`Error fetching Bearer token from ${oauthToken}: ${errorMessage}`);
    return { error: new Response(`Internal server error: ${errorMessage}`, { status: 500 }) };
  }
}
