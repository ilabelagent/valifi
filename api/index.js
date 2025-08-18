import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import the top‑level API router
import apiRoutes from './routes/index.js';
import { initializeSchema } from './lib/db.js';

// Load environment variables from a .env file if present
dotenv.config();

// --- Global Error Handlers ---
// These will catch any errors that are not handled within a specific route.
// This is crucial for Vercel logging and debugging.
process.on('uncaughtException', (error) => {
  console.error('--- UNCAUGHT EXCEPTION ---');
  console.error(error);
  process.exit(1); // Exit process, Vercel will restart the serverless function
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('--- UNHANDLED REJECTION ---');
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1); // Exit process
});


const app = express();

// Default to port 3001 if no PORT env var is provided
const PORT = process.env.PORT || 3001;

// Initialize Database Schema on startup. In a production Vercel env, this won't run.
// You need to manually initialize the schema via the Turso shell for production.
if (process.env.NODE_ENV !== 'production') {
    initializeSchema().catch(err => {
        console.error('Database initialization failed:', err);
        process.exit(1);
    });
}


// Enable CORS for all origins
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Mount the API routes under the configured base URL.  If API_BASE_URL is
// undefined, fall back to `/api` as the root for all endpoints.
const baseUrl = process.env.API_BASE_URL || '/api';
app.use(baseUrl, apiRoutes);


// --- Express Error Handling Middleware ---
// This middleware must be the last one in the chain.
// It catches any errors that occur in the route handlers.
app.use((err, req, res, next) => {
    // Log the full error to Vercel's logs for debugging
    console.error('--- EXPRESS ERROR ---');
    console.error(`[${req.method}] ${req.url}`);
    console.error(err.stack);

    // Send a generic error response to the client
    // to avoid leaking implementation details.
    res.status(500).json({ 
        status: 'error', 
        message: 'An internal server error occurred. Our team has been notified.' 
    });
});


// Start listening for connections.  The callback logs the URL to the
// console for convenience when running locally.
app.listen(PORT, () => {
  // Intentionally silent in production
});

export default app;
