import { log } from '../libs/logger.js';
import { maskToken } from '../libs/mask-token.js';
import { getBearerToken } from '../libs/token-store/copilot-token-meta.js';
import { getSelectedToken } from '../libs/token-store/token-storage.js';

const EMPTY_TOKEN = '_';

export async function ensureInternalToken(req, res, next) {
  const authHeader = req.headers.authorization;
  // Extract token from Authorization header. If the header is "Bearer _", it will be replaced with the default token.
  const providedToken = authHeader?.replace(/^(token|Bearer) ?/, '') || EMPTY_TOKEN;
  const oauthToken =
    providedToken === EMPTY_TOKEN ? (await getSelectedToken()).token : providedToken;

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
