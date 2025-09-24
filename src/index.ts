import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { healthRouter } from './routes/health';
import { apiRouter } from './routes/api';
import { authRouter } from './routes/auth';
import { financeRouter } from './routes/finance';
import { tradingRouter } from './routes/trading';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { config } from './config/config';

const app = new Elysia()
  .use(cors({
    origin: config.CORS_ORIGIN || '*',
    credentials: true
  }))
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Valifi Fintech Platform API',
        version: '5.0.0',
        description: 'Unified Fintech Platform with Banking, Trading & Investment Services'
      },
      tags: [
        { name: 'Authentication', description: 'User authentication & authorization' },
        { name: 'Finance', description: 'Banking & financial operations' },
        { name: 'Trading', description: 'Stock trading & portfolio management' },
        { name: 'Items', description: 'Legacy CRUD operations' },
        { name: 'System', description: 'System health & monitoring' }
      ]
    }
  }))
  .use(errorHandler)
  .use(healthRouter)
  .use(authRouter)
  .use(financeRouter)
  .use(tradingRouter)
  .use(apiRouter)
  .get('/', () => ({
    name: 'Valifi Fintech Platform',
    version: '5.0.0',
    status: 'running',
    endpoints: {
      documentation: '/docs',
      health: '/health',
      authentication: '/auth',
      finance: '/api/v1/finance',
      trading: '/api/v1/trading'
    }
  }))
  .onError(({ error, code }) => {
    logger.error(`Error ${code}: ${error.message}`, { stack: error.stack });
    return {
      success: false,
      error: config.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
      code
    };
  })
  .listen(config.PORT);

logger.info(`🚀 Valifi Fintech Platform running at ${app.server?.hostname}:${app.server?.port}`);
logger.info(`📚 API Documentation: http://localhost:${config.PORT}/docs`);
logger.info(`🔐 Authentication: http://localhost:${config.PORT}/auth`);
logger.info(`💰 Finance API: http://localhost:${config.PORT}/api/v1/finance`);
logger.info(`📈 Trading API: http://localhost:${config.PORT}/api/v1/trading`);

export default app;