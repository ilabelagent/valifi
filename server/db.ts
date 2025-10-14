import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
// In Replit development environment, handle self-signed certificates
if (process.env.NODE_ENV === 'development') {
  neonConfig.webSocketConstructor = function(url, protocols) {
    return new ws(url, protocols, {
      rejectUnauthorized: false,
      handshakeTimeout: 10000
    });
  };
} else {
  neonConfig.webSocketConstructor = ws;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
