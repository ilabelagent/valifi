import { createClient } from '@libsql/client';

// Test script to verify Turso connection
async function testTursoConnection() {
  console.log('🔄 Testing Turso Database Connection...\n');

  const db = createClient({
    url: 'libsql://database-rose-yacht-vercel-icfg-hpuwabhqvob9btjcpaebhxip.aws-us-east-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTU5MjUxMjYsImlkIjoiYTI5OGI0YzktOWI0Zi00NDYwLTkyZWItN2EwNTExOWJiM2MwIiwicmlkIjoiNTMxYjlmZWYtYWQ5OC00MWQ5LWFkMTQtMDhjZjg4NDNhYzlmIn0.y5z6YNDy-VIblAJcWNWrHdC5qqaVbfBpyhUeL_QrrKfAzosRl8FYl5R_SKNIQQfUMqn0eL-aqfTXHLv8hpuSDw'
  });

  try {
    // Test connection
    console.log('Testing connection...');
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Connection successful!\n');

    // Create tables
    console.log('Creating tables...');
    
    // Users table
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
    console.log('✅ Users table created');

    // Sessions table
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
    console.log('✅ Sessions table created');

    // Portfolios table
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
    console.log('✅ Portfolios table created');

    // Assets table
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
    console.log('✅ Assets table created');

    // Transactions table
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
    console.log('✅ Transactions table created');

    // Check existing data
    console.log('\n📊 Database Statistics:');
    const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
    console.log(`   Users: ${userCount.rows[0].count}`);
    
    const sessionCount = await db.execute('SELECT COUNT(*) as count FROM sessions');
    console.log(`   Sessions: ${sessionCount.rows[0].count}`);
    
    const portfolioCount = await db.execute('SELECT COUNT(*) as count FROM portfolios');
    console.log(`   Portfolios: ${portfolioCount.rows[0].count}`);

    console.log('\n✨ Database setup complete!');
    console.log('🚀 Your Valifi app is ready to use with Turso!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testTursoConnection();