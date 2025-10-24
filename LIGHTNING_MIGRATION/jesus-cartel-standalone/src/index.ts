/**
 * JESUS CARTEL - STANDALONE MUSIC PUBLISHING PLATFORM
 *
 * Extracted from Valifi Kingdom for independent deployment on Lightning AI
 *
 * Features:
 * - Music publishing automation (Song → NFT → Token)
 * - Multi-chain NFT deployment (Ethereum, Polygon, BSC, Arbitrum, Optimism)
 * - ERC-20 token creation for songs
 * - Release management and streaming analytics
 * - Event management
 */

import express from "express";
import cors from "cors";
import { jesusCartelService } from "./services/jesusCartelService";
import { setupRoutes } from "./routes";
import { db } from "./database/db";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "jesus-cartel",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Setup API routes
setupRoutes(app);

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║              JESUS CARTEL PUBLISHING PLATFORM             ║
║              Standalone Edition - Lightning AI            ║
║                                                          ║
║  Service: Music Publishing Automation                    ║
║  Port: ${PORT}                                              ║
║  Status: RUNNING                                         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export { app, jesusCartelService };
