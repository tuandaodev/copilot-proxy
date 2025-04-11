import http from 'http';
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

// Create proxy server
const server = http.createServer(async (req, res) => {
  console.log(`Received request for: ${req.url}`);

  try {
    // Get OAuth token from request headers
    const authHeader = req.headers['authorization'];
    const oauthToken = authHeader ? authHeader.replace('token ', '') : null;
    if (!oauthToken) {
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('GitHub OAuth token is required in the Authorization header');
      return;
    }

    // Get Bearer token using OAuth token
    const token = await getBearerToken(oauthToken);

    // Parse the request URL
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);

    // Set up the options for the forwarded request
    const options = {
      hostname: TARGET_HOST,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
      headers: {
        ...req.headers,
        ...CUSTOM_HEADERS,
        'Authorization': `Bearer ${token}`
      }
    };

    // Remove host header to avoid conflicts
    if (options.headers.host) {
      options.headers.host = TARGET_HOST;
    }


    console.log(`Proxying to: ${TARGET_HOST}${parsedUrl.path}`);

    // Create the proxied request
    const proxyReq = https.request(options, (proxyRes) => {
      // Forward the status code
      res.writeHead(proxyRes.statusCode, proxyRes.headers);

      // Pipe the response back to the client
      proxyRes.pipe(res, { end: true });
    });

    // Handle errors
    proxyReq.on('error', (error) => {
      console.error(`Proxy request error: ${error.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Proxy error: ${error.message}`);
    });

    // Pipe the request body to the proxied request
    req.pipe(proxyReq, { end: true });

  } catch (error) {
    console.error(`Error getting token: ${error.message}`);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Error getting token: ${error.message}`);
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Copilot proxy server running on port ${PORT}`);
  console.log(`Forwarding requests to https://${TARGET_HOST}`);
  console.log(`Adding headers: ${JSON.stringify(CUSTOM_HEADERS, null, 2)}`);
});
