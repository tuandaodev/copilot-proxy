import pino from 'pino';
import pinoHttp from 'pino-http';

export const log = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true, // Enable colors
      singleLine: false, // Easier reading
    },
  },
});

export const logHttp = pinoHttp({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true, // Enable colors
      singleLine: false, // Easier reading
    },
  },
});
