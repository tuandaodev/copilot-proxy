import { getToken } from '../token-storage.js';

// Middleware to check and extract OAuth token
export const extractOAuthToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const oauthToken = authHeader?.replace(/^(token|Bearer) /, '') || getToken() || null;

  if (!oauthToken) {
    res.status(401).send('Do login or provide a GitHub token in the Authorization header');
    return;
  }

  req.oauthToken = oauthToken;
  next();
};
