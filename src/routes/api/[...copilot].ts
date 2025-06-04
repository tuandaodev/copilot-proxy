import { ensureInternalToken } from '@/server/middlewares/ensure-internal-token.js';
import { proxyToCopilot } from '@/server/middlewares/proxy-to-copilot.js';
import type { APIEvent } from '@solidjs/start/server';

// Catch-all API route for proxying to Copilot
const ALL = async (event: APIEvent) => {
  const { bearerToken, error } = await ensureInternalToken(event);
  if (error) return error;

  return proxyToCopilot(event, bearerToken);
};

export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const PATCH = ALL;
export const DELETE = ALL;
