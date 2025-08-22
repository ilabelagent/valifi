
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { httpLogger } from './lib/logger.js';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import { errorHandler } from './middleware/error.js';

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(httpLogger);

// CORS
const origin = process.env.FRONTEND_ORIGIN?.split(',').map(s => s.trim());
app.use(cors({ origin, credentials: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

// 404
app.use((_req, res) => res.status(404).json({ ok: false, code: 'NOT_FOUND', message: 'Route not found' }));

// Errors
app.use(errorHandler);

export default app;