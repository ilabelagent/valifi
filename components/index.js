import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import the top‑level API router
import apiRoutes from './routes/index.js';

// Load environment variables from a .env file if present
dotenv.config();

const app = express();

// Default to port 3001 if no PORT env var is provided
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Mount the API routes under the configured base URL.  If API_BASE_URL is
// undefined, fall back to `/api` as the root for all endpoints.
const baseUrl = process.env.API_BASE_URL || '/api';
app.use(baseUrl, apiRoutes);

// Start listening for connections.  The callback logs the URL to the
// console for convenience when running locally.
app.listen(PORT, () => {
  console.log(`Valifi backend running on http://localhost:${PORT}${baseUrl}`);
});

export default app;