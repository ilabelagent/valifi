// Test script to verify Turso connection and auth
// Run with: node test-connection.js

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🧪 Testing Valifi Database Connection...\n');

// Check environment variables
console.log('1. Checking environment variables:');
console.log(`   TURSO_DATABASE_URL: ${process.env.TURSO_DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`   TURSO_AUTH_TOKEN: ${process.env.TURSO_AUTH_TOKEN ? '✅ Set' : '❌ Missing'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing (using default)'}`);

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('\n❌ Missing required environment variables!');
  console.log('Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local');
  process.exit(1);
}

// Initialize client WITHOUT syncUrl
console.log('\n2. Initializing database client (WITHOUT syncUrl)...');
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
  // NO syncUrl - this was the issue!
});

// Test connection
console.log('\n3. Testing connection...');
try {
  const result = await db.execute('SELECT 1 AS ok');
  console.log('   ✅ Connection successful!');
} catch (error) {
  console.error('   ❌ Connection failed:', error.message);
  process.exit(1);
}

// Check if tables exist
console.log('\n4. Checking database tables:');
try {
  const tables = await db.execute(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name
  `);
  
  if (tables.rows.length === 0) {
    console.log('   ⚠️  No tables found. Creating tables...');
    
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
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
    console.log('   ✅ Created users table');
    
    // Create sessions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        refresh_token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✅ Created sessions table');
    
    // Create portfolios table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT NOT NULL,
        total_value_usd REAL DEFAULT 0,
        cash_balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('   ✅ Created portfolios table');
    
  } else {
    console.log('   Tables found:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.name}`);
    });
  }
} catch (error) {
  console.error('   ❌ Error checking tables:', error.message);
}

// Count users
console.log('\n5. Checking user count:');
try {
  const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
  console.log(`   Total users: ${userCount.rows[0].count}`);
} catch (error) {
  console.error('   ❌ Error counting users:', error.message);
}

console.log('\n✅ All tests completed!');
console.log('\n📝 Next steps:');
console.log('1. Run: npm run build');
console.log('2. Run: npm run start');
console.log('3. Visit: http://localhost:3000/api/health');
console.log('4. Deploy to Vercel: vercel --prod');

process.exit(0);