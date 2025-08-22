
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import the top‑level API router
import apiRoutes from './routes/index.js';
import { initializeSchema } from './lib/db.js';

// Load environment variables from a .env file if present
dotenv.config();

// --- Environment Variable Validation ---
const requiredEnvVars = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'API_KEY'];
for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
        console.error(`FATAL ERROR: Environment variable ${varName} is not defined.`);
        console.error('Please check your .env file or Vercel project settings.');
        process.exit(1);
    }
}

// --- Global Error Handlers ---
process.on('uncaughtException', (error) => {
  console.error('--- UNCAUGHT EXCEPTION ---');
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('--- UNHANDLED REJECTION ---');
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});


const app = express();

// Set trust proxy for Vercel deployment if using cookies with secure flag
app.set('trust proxy', 1);

// Default to port 3001 if no PORT env var is provided
const PORT = process.env.PORT || 3001;

// Initialize Database Schema on startup.
if (process.env.NODE_ENV !== 'production') {
    initializeSchema().catch(err => {
        console.error('Database initialization failed:', err);
        process.exit(1);
    });
}


// Enable CORS for all origins
app.use(cors({
    origin: true, // Reflect request origin, or configure for specific domains
    credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Mount the API routes under the configured base URL.
const baseUrl = process.env.API_BASE_URL || '/api';
app.use(baseUrl, apiRoutes);


// --- Express Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error('--- EXPRESS ERROR ---');
    console.error(`[${req.method}] ${req.url}`);
    console.error(err.stack);
    res.status(500).json({ 
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred. Our team has been notified.' 
    });
});


// Start listening for connections.
app.listen(PORT, () => {
  // Silent in production
});

export default app;
