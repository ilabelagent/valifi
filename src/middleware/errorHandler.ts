import { Elysia } from 'elysia';
import { logger } from '../utils/logger';

export const errorHandler = new Elysia()
  .onError(({ code, error, set }) => {
    logger.error(`Error occurred: ${error.message}`, { code, stack: error.stack });
    
    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return { success: false, error: 'Validation failed', details: error.message };
      case 'NOT_FOUND':
        set.status = 404;
        return { success: false, error: 'Resource not found' };
      case 'INTERNAL_SERVER_ERROR':
        set.status = 500;
        return { success: false, error: 'Internal server error' };
      default:
        set.status = 500;
        return { success: false, error: 'An unexpected error occurred' };
    }
  });