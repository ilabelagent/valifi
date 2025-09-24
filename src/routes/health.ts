import { Elysia, t } from 'elysia';
import { logger } from '../utils/logger';

export const healthRouter = new Elysia()
  .get('/health', () => {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      version: process.version
    };
    logger.info('Health check performed', healthcheck);
    return healthcheck;
  }, {
    detail: {
      summary: 'Health Check',
      description: 'Get server health status',
      tags: ['System']
    }
  })
  .get('/ready', async () => {
    // Add database/service connectivity checks here
    const checks = {
      server: 'ready',
      timestamp: new Date().toISOString()
    };
    
    return checks;
  }, {
    detail: {
      summary: 'Readiness Check',
      description: 'Check if server is ready to accept traffic',
      tags: ['System']
    }
  });