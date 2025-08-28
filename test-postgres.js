// Test PostgreSQL connection for Valifi Platform
// Run with: node test-postgres.js

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🧪 Testing Valifi PostgreSQL Connection...\n');

// Check environment variables
console.log('1. Checking environment variables:');
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`   USE_POSTGRES: ${process.env.USE_POSTGRES ? '✅ Set' : '❌ Missing'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

if (!process.env.DATABASE_URL) {
  console.error('\n❌ Missing DATABASE_URL environment variable!');
  console.log('Please set DATABASE_URL in .env.local');
  console.log('Example: DATABASE_URL=postgresql://user:password@localhost:5432/valifi_db');
  process.exit(1);
}

// Initialize PostgreSQL client
console.log('\n2. Initializing PostgreSQL client...');
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 5,
});

// Test connection
console.log('\n3. Testing connection...');
try {
  const client = await pool.connect();
  const result = await client.query('SELECT version()');
  console.log('   ✅ Connection successful!');
  console.log(`   PostgreSQL version: ${result.rows[0].version}`);
  client.release();
} catch (error) {
  console.error('   ❌ Connection failed:', error.message);
  process.exit(1);
}

// Check if UUID extension is available
console.log('\n4. Checking UUID extension:');
try {
  const result = await pool.query(`
    SELECT extname 
    FROM pg_extension 
    WHERE extname = 'uuid-ossp'
  `);
  
  if (result.rows.length === 0) {
    console.log('   ⚠️  UUID extension not installed. Installing...');
    try {
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('   ✅ UUID extension installed');
    } catch (err) {
      console.log('   ❌ Could not install UUID extension (may require superuser privileges)');
      console.log('   Run as superuser: CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    }
  } else {
    console.log('   ✅ UUID extension is available');
  }
} catch (error) {
  console.error('   ❌ Error checking UUID extension:', error.message);
}

// Check if tables exist
console.log('\n5. Checking database tables:');
try {
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  
  if (tables.rows.length === 0) {
    console.log('   ⚠️  No tables found.');
    console.log('   Run migration script to create tables:');
    console.log('   psql -d your_database -f migrations/001_postgresql_migration.sql');
    
    // Check if migration file exists
    const migrationPath = path.join(process.cwd(), 'migrations', '001_postgresql_migration.sql');
    if (fs.existsSync(migrationPath)) {
      console.log('\n   Would you like to run the migration now? (requires psql)');
      console.log('   Command: psql ' + process.env.DATABASE_URL + ' -f ' + migrationPath);
    }
  } else {
    console.log('   Tables found:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Check for required tables
    const requiredTables = ['users', 'sessions', 'portfolios', 'assets', 'transactions'];
    const existingTables = tables.rows.map(r => r.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.log('\n   ⚠️  Missing required tables:', missingTables.join(', '));
    } else {
      console.log('\n   ✅ All required tables exist');
    }
  }
} catch (error) {
  console.error('   ❌ Error checking tables:', error.message);
}

// Count users (if table exists)
console.log('\n6. Checking user count:');
try {
  const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
  console.log(`   Total users: ${userCount.rows[0].count}`);
} catch (error) {
  if (error.message.includes('does not exist')) {
    console.log('   ⚠️  Users table does not exist yet');
  } else {
    console.error('   ❌ Error counting users:', error.message);
  }
}

// Test UUID generation
console.log('\n7. Testing UUID generation:');
try {
  const result = await pool.query('SELECT gen_random_uuid() as uuid');
  console.log(`   ✅ UUID generated: ${result.rows[0].uuid}`);
} catch (error) {
  console.error('   ❌ UUID generation failed:', error.message);
}

// Close pool
await pool.end();

console.log('\n✅ All tests completed!');
console.log('\n📝 Next steps:');
console.log('1. If tables are missing, run the migration:');
console.log('   psql -d your_database -f migrations/001_postgresql_migration.sql');
console.log('2. Update .env.local:');
console.log('   USE_POSTGRES=true');
console.log('3. Update your API files to use db-adapter.ts');
console.log('4. Run: npm install pg @types/pg');
console.log('5. Test the application: npm run dev');

process.exit(0);
