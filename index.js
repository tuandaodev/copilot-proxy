#!/usr/bin/env node

import 'dotenv/config';
import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import { COPILOT_API_HOST, COPILOT_HEADERS } from './src/config.js';
import { proxyApp } from './src/proxy-app.js';

// Configuration
const PORT = process.env.PORT || 3000;

const app = new App();

// Set up the app with middleware
app
  .use(logger()) // Add request logging
  .use('/api', proxyApp);

// Start the server
app.listen(PORT, () => {
  console.log(`Copilot proxy server running on port ${PORT}`);
  console.log(`Forwarding requests to ${COPILOT_API_HOST}`);
  console.log(`Adding headers: ${JSON.stringify(COPILOT_HEADERS, null, 2)}`);
});
