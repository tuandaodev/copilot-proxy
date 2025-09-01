/**
 * Get basic auth configuration from environment variables
 */
function getBasicAuthConfig() {
  return {
    enabled: process.env.BASIC_AUTH_ENABLED !== 'false',
    username: process.env.BASIC_AUTH_USERNAME || 'admin',
    password: process.env.BASIC_AUTH_PASSWORD || 'password',
  };
}

/**
 * Validates basic auth credentials from the Authorization header
 */
export function validateBasicAuth(authHeader: string | null): boolean {
  const config = getBasicAuthConfig();
  
  if (!config.enabled) {
    return true; // Skip auth if disabled
  }

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    const base64Credentials = authHeader.slice(6); // Remove 'Basic ' prefix
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    return username === config.username && password === config.password;
  } catch (error) {
    return false;
  }
}

/**
 * Creates a 401 Unauthorized response with WWW-Authenticate header
 */
export function createUnauthorizedResponse(): Response {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Copilot Proxy Admin"',
      'Content-Type': 'text/plain',
    },
  });
}

/**
 * Middleware function to check basic auth for protected routes
 */
export function requireBasicAuth(request: Request): Response | null {
  const config = getBasicAuthConfig();
  
  if (!config.enabled) {
    return null; // Skip auth if disabled
  }

  const authHeader = request.headers.get('Authorization');
  
  if (!validateBasicAuth(authHeader)) {
    return createUnauthorizedResponse();
  }

  return null; // Auth passed
}
