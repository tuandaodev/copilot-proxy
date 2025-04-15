import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import https from 'https';
import { URL } from 'url';

// Configuration
const PORT = 3000;
const TARGET_HOST = 'api.githubcopilot.com';
const CUSTOM_HEADERS = {
  'Editor-Version': 'CopilotProxy/0.1.0',
  'Copilot-Integration-Id': 'vscode-chat',
  'User-Agent': 'CopilotProxy',
};

const app = new App();

// Token cache storing {token, expiresAt} keyed by oauthToken
const tokenCache = new Map();

// Function to check if a cached token is still valid (with 5 min buffer)
function isTokenValid(cachedToken) {
  if (!cachedToken) return false;
  // Add 5 minutes buffer before expiration
  return Date.now() < (cachedToken.expiresAt - 5 * 60 * 1000);
}

// Function to get Bearer token using OAuth token
async function getBearerToken(oauthToken) {
  if (!oauthToken) {
    throw new Error('OAuth token is required');
  }

  // Check cache first
  const cachedToken = tokenCache.get(oauthToken);
  if (isTokenValid(cachedToken)) {
    return cachedToken.token;
  }

  // If no valid cached token, request a new one
  const tokenOptions = {
    hostname: 'api.github.com',
    port: 443,
    path: '/copilot_internal/v2/token',
    method: 'GET',
    headers: {
      'User-Agent': 'CopilotProxy',
      'Authorization': `token ${oauthToken}`
    }
  };

  return new Promise((resolve, reject) => {
    const tokenReq = https.request(tokenOptions, (tokenRes) => {
      let data = '';

      tokenRes.on('data', (chunk) => {
        data += chunk;
      });

      tokenRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          const token = response.token;
          // GitHub Copilot tokens typically expire in 1 hour
          // If expires_at is not provided, default to 1 hour from now
          const expiresAt = response.expires_at
            ? new Date(response.expires_at).getTime()
            : Date.now() + 60 * 60 * 1000;

          // Cache the token with expiration
          tokenCache.set(oauthToken, { token, expiresAt });
          resolve(token);
        } catch (error) {
          reject(new Error(`Failed to parse token response: ${error.message}`));
        }
      });
    });

    tokenReq.on('error', (error) => {
      reject(error);
    });


    tokenReq.end();
  });

}

// Middleware to check and extract OAuth token
const extractOAuthToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const oauthToken = authHeader ? authHeader.replace('token ', '').replace('Bearer ', '') : null;

  if (!oauthToken) {
    res.status(401).send('GitHub OAuth token is required in the Authorization header');
    return;
  }

  req.oauthToken = oauthToken;
  next();
};

// Middleware to get Bearer token
const getBearerTokenMiddleware = async (req, res, next) => {
  try {
    req.bearerToken = await getBearerToken(req.oauthToken);
    next();
  } catch (error) {
    console.error(`Error getting token: ${error.message}`);
    res.status(500).send(`Error getting token: ${error.message}`);
  }
};

// Proxy middleware
const proxyMiddleware = async (req, res) => {
  try {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);


    const options = {
      hostname: TARGET_HOST,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
      headers: {
        ...req.headers,
        ...CUSTOM_HEADERS,
        'Authorization': `Bearer ${req.bearerToken}`,
        'host': TARGET_HOST
      }
    };

    console.log(`Proxying to: ${TARGET_HOST}${parsedUrl.pathname + parsedUrl.search}`);


    const proxyReq = https.request(options, (proxyRes) => {
      res.status(proxyRes.statusCode);
      Object.entries(proxyRes.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      proxyRes.pipe(res);
    });


    proxyReq.on('error', (error) => {
      console.error(`Proxy request error: ${error.message}`);
      res.status(500).send(`Proxy error: ${error.message}`);
    });

    req.pipe(proxyReq);
  } catch (error) {
    console.error(`Proxy error: ${error.message}`);
    res.status(500).send(`Proxy error: ${error.message}`);
  }
};

// Set up the app with middleware
app
  .use(logger())  // Add request logging
  .use(extractOAuthToken)
  .use(getBearerTokenMiddleware)
  .use(proxyMiddleware);

// Start the server
app.listen(PORT, () => {
  console.log(`Copilot proxy server running on port ${PORT}`);
  console.log(`Forwarding requests to https://${TARGET_HOST}`);
  console.log(`Adding headers: ${JSON.stringify(CUSTOM_HEADERS, null, 2)}`);
});
