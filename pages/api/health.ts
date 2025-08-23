import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@libsql/client';

// Initialize Turso client directly WITHOUT syncUrl
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || ''
  // No syncUrl - this was causing the migration jobs 400 error
});

// Test database connection
async function testConnection() {
  try {
    const result = await db.execute('SELECT 1 AS ok');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Initialize database tables (runs even in production)
async function initializeDatabase() {
  try {
    // Create users table with all required fields
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        is_verified INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        refresh_token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create portfolios table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL,
        total_value_usd REAL DEFAULT 0,
        cash_balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create assets table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        portfolio_id TEXT NOT NULL,
        type TEXT NOT NULL,
        ticker TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity REAL DEFAULT 0,
        value_usd REAL DEFAULT 0,
        change_24h REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
      )
    `);

    // Create transactions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount_usd REAL NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Always return JSON to prevent parse errors
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      ok: false,
      error: 'Method not allowed' 
    });
  }

  try {
    // Check if database is configured
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      return res.status(503).json({
        ok: false,
        status: 'error',
        message: 'Database not configured',
        details: {
          url: process.env.TURSO_DATABASE_URL ? 'Configured' : 'Missing',
          authToken: process.env.TURSO_AUTH_TOKEN ? 'Configured' : 'Missing'
        }
      });
    }

    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return res.status(503).json({
        ok: false,
        status: 'error',
        message: 'Database connection failed',
        details: 'Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN'
      });
    }

    // Initialize tables on every health check (safe - CREATE IF NOT EXISTS)
    // This ensures tables exist even in production
    const initialized = await initializeDatabase();
    if (!initialized) {
      console.warn('Database initialization check failed, but continuing...');
    }

    // Try to get database stats (wrapped in try-catch to prevent crashes)
    let stats = {
      users: 0,
      activeSessions: 0,
      portfolios: 0
    };

    try {
      const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
      const sessionCount = await db.execute('SELECT COUNT(*) as count FROM sessions WHERE expires_at > datetime("now")');
      const portfolioCount = await db.execute('SELECT COUNT(*) as count FROM portfolios');
      
      stats = {
        users: Number(userCount.rows[0]?.count) || 0,
        activeSessions: Number(sessionCount.rows[0]?.count) || 0,
        portfolios: Number(portfolioCount.rows[0]?.count) || 0
      };
    } catch (statsError) {
      console.warn('Could not get database stats:', statsError);
    }

    // Always return valid JSON
    return res.status(200).json({
      ok: true,
      status: 'healthy',
      message: 'Database is connected and operational',
      stats,
      database: {
        url: 'Configured',
        authToken: 'Configured',
        initialized: initialized
      }
    });

  } catch (error: any) {
    console.error('Database health check error:', error);
    
    // Always return valid JSON even on error
    return res.status(503).json({
      ok: false,
      status: 'error',
      message: 'Database health check failed',
      error: error.message || 'Unknown error'
    });
  }
}