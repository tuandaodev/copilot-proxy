import { App } from '@tinyhttp/app';
import { ensureInternalToken } from '../middlewares/ensure-internal-token.js';
import { extractOAuthToken } from '../middlewares/extract-oauth-token.js';
import { proxyToCopilot } from '../middlewares/proxy-to-copilot.js';

const app = new App();

// Set up the app with middleware
app.use(extractOAuthToken).use(ensureInternalToken).use(proxyToCopilot);

export { app as proxyApp };
