#!/usr/bin/env node

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { App } from '@tinyhttp/app';
import { json } from 'milliparsec';
import sirv from 'sirv';
import { adminApp } from './server/apps/admin-app.js';
import { proxyApp } from './server/apps/proxy-app.js';
import { COPILOT_API_HOST } from './server/config.js';
import { log, logHttp } from './server/libs/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { version } = JSON.parse(readFileSync(path.resolve(__dirname, './package.json'), 'utf-8'));

// Configuration
const PORT = Number.parseInt(process.env.PORT) || 3000;

const app = new App();

// Set up the app with middleware
app
  .use(logHttp) // Add request logging
  .use(sirv(path.resolve(__dirname, './dist'), { dev: process.env.NODE_ENV !== 'production' })) // Serve static files
  .use('/admin', json(), adminApp)
  .use('/api', proxyApp);

// Start the server
app.listen(
  PORT,
  () => {
    log.info(`Copilot Proxy ${version}`);
    log.info(`Copilot proxy server running on port ${PORT}`);
    log.info(`Forwarding requests to ${COPILOT_API_HOST}`);
  },
  '127.0.0.1',
);
