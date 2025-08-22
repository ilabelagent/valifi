
import { logger } from '../lib/logger.js';

export function errorHandler(err, req, res, _next) {
  const status = Number(err.status) || 500;
  const code = err.code || 'SERVER_ERROR';
  const correlationId = req.id || req.headers['x-request-id'];

  if (status >= 500) {
    logger.error({ err, correlationId }, 'Unhandled error');
  } else {
    logger.warn({ err, correlationId }, 'Handled error');
  }

  res.status(status).json({
    ok: false,
    code,
    message: status >= 500 ? 'Something went wrong' : err.message,
    correlationId,
    details: status >= 500 ? undefined : err.details,
  });
}
