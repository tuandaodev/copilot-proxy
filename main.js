const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const PORT = 3000;
const TARGET_HOST = 'api.githubcopilot.com';
const CUSTOM_HEADERS = {
  'Editor-Version': 'CopilotProxy/0.1.0',
  'Copilot-Integration-Id': 'vscode-chat',
};

// Create proxy server
const server = http.createServer((req, res) => {
  console.log(`Received request for: ${req.url}`);

  // Parse the request URL
  const parsedUrl = url.parse(req.url);

  // Set up the options for the forwarded request
  const options = {
    hostname: TARGET_HOST,
    port: 443,
    path: parsedUrl.path,
    method: req.method,
    headers: {
      ...req.headers,
      ...CUSTOM_HEADERS
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
});

// Start the server
server.listen(PORT, () => {
  console.log(`Copilot proxy server running on port ${PORT}`);
  console.log(`Forwarding requests to https://${TARGET_HOST}`);
  console.log(`Adding headers: ${JSON.stringify(CUSTOM_HEADERS, null, 2)}`);
});
