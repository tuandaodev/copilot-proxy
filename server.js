#!/usr/bin/env node

import 'dotenv/config';
import { App } from '@tinyhttp/app';
import { logger } from '@tinyhttp/logger';
import sirv from 'sirv';
import { adminApp } from './server/apps/admin-app.js';
import { proxyApp } from './server/apps/proxy-app.js';
import { COPILOT_API_HOST, COPILOT_HEADERS } from './server/config.js';

// Configuration
const PORT = Number.parseInt(process.env.PORT) || 3000;

const app = new App();

// Set up the app with middleware
app
  .use(logger()) // Add request logging
  .use(sirv('dist', { dev: process.env.NODE_ENV !== 'production' })) // Serve static files
  .use('/admin', adminApp)
  .use('/api', proxyApp);

// Start the server
app.listen(
  PORT,
  () => {
    console.log(`Copilot proxy server running on port ${PORT}`);
    console.log(`Forwarding requests to ${COPILOT_API_HOST}`);
    console.log(`Adding headers: ${JSON.stringify(COPILOT_HEADERS, null, 2)}`);
  },
  '127.0.0.1',
);
