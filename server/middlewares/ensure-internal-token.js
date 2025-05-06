import { log } from '../libs/logger.js';
import { maskToken } from '../libs/mask-token.js';
import { getBearerToken } from '../libs/token-store/copilot-token-meta.js';
import { getSelectedToken } from '../libs/token-store/token-storage.js';

export async function ensureInternalToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const oauthToken =
    authHeader?.replace(/^(token|Bearer) /, '') || (await getSelectedToken()).token || null;

  if (!oauthToken) {
    res.status(401).send('Do login or provide a GitHub token in the Authorization header');
    return;
  }
  log.info({ 'Use token': maskToken(oauthToken) });

  try {
    req.bearerToken = await getBearerToken(oauthToken);
    next();
  } catch (error) {
    log.error(`Error fetching Bearer token from ${oauthToken}: ${error.message}`);
    res.status(500).send(`Internal server error: ${error.message}`);
  }
}
