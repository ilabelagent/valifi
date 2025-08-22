// This is the ONLY serverless function file for Vercel
// All API logic is handled through this single entry point

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import the router from src
import apiRoutes from './src/routes/index.js';
import { initializeSchema } from './src/lib/db.js';

// Load environment variables
dotenv.config();

// Environment Variable Validation
const requiredEnvVars = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'API_KEY'];
for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        console.error(`FATAL ERROR: Environment variable ${varName} is not defined.`);
        console.error('Please check your .env file or Vercel project settings.');
        // Don't exit in production/Vercel, just log the error
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
}

// Global Error Handlers
process.on('uncaughtException', (error) => {
    console.error('--- UNCAUGHT EXCEPTION ---');
    console.error(error);
    // Don't exit in production
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('--- UNHANDLED REJECTION ---');
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit in production
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

// Create Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Initialize Database Schema (only in dev)
if (process.env.NODE_ENV !== 'production') {
    initializeSchema().catch(err => {
        console.error('Database initialization failed:', err);
    });
}

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

// Mount API routes
const baseUrl = process.env.API_BASE_URL || '/api';
app.use(baseUrl, apiRoutes);

// Express Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('--- EXPRESS ERROR ---');
    console.error(`[${req.method}] ${req.url}`);
    console.error(err.stack);
    res.status(500).json({ 
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred. Our team has been notified.' 
    });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
export default app;