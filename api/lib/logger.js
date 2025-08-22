
import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  base: undefined,
  redact: ['req.headers.authorization', 'req.headers.cookie']
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req, _res) => req.headers['x-request-id'] || randomUUID(),
});
