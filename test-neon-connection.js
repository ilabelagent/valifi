// Test Neon Database Connection
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

console.log('=====================================');
console.log('   NEON DATABASE CONNECTION TEST');
console.log('=====================================\n');

// Database configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5kwo8vhredaX@ep-proud-mountain-ady8h1sc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

async function testConnection() {
  const pool = new Pool(poolConfig);
  
  try {
    console.log('🔄 Connecting to Neon database...');
    console.log(`   Host: ${poolConfig.connectionString.split('@')[1].split('/')[0]}`);
    console.log(`   Database: neondb\n`);
    
    // Test basic connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('✅ Connection successful!\n');
    console.log(`   Time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL: ${result.rows[0].pg_version.split(',')[0]}\n`);
    
    // Check if tables exist
    console.log('📊 Checking tables...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tables = await client.query(tablesQuery);
    
    if (tables.rows.length > 0) {
      console.log(`   Found ${tables.rows.length} tables:\n`);
      
      const coreTable = ['users', 'sessions', 'portfolios', 'assets', 'transactions'];
      const botTables = ['bot_configurations', 'bot_logs', 'ai_interactions'];
      const tradingTables = ['p2p_offers', 'defi_pools', 'trading_bots', 'wallets'];
      
      console.log('   Core Tables:');
      coreTable.forEach(table => {
        const exists = tables.rows.some(t => t.table_name === table);
        console.log(`     ${exists ? '✅' : '❌'} ${table}`);
      });
      
      console.log('\n   Bot Tables:');
      botTables.forEach(table => {
        const exists = tables.rows.some(t => t.table_name === table);
        console.log(`     ${exists ? '✅' : '❌'} ${table}`);
      });
      
      console.log('\n   Trading Tables:');
      tradingTables.forEach(table => {
        const exists = tables.rows.some(t => t.table_name === table);
        console.log(`     ${exists ? '✅' : '❌'} ${table}`);
      });
      
      // Count total rows
      if (tables.rows.some(t => t.table_name === 'users')) {
        const userCount = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`\n   Total users: ${userCount.rows[0].count}`);
      }
      
    } else {
      console.log('   ⚠️  No tables found. Run migrations first:');
      console.log('   run-neon-migrations.bat\n');
    }
    
    client.release();
    
    console.log('\n=====================================');
    console.log('   CONNECTION TEST COMPLETE');
    console.log('=====================================\n');
    
    console.log('📝 Next Steps:');
    console.log('1. Run migrations if tables are missing:');
    console.log('   run-neon-migrations.bat\n');
    console.log('2. Set environment variables in Vercel:');
    console.log('   setup-vercel-env.bat\n');
    console.log('3. Deploy to production:');
    console.log('   vercel --prod\n');
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if Neon database is active');
    console.error('2. Verify connection string in .env.local');
    console.error('3. Ensure SSL is enabled (sslmode=require)');
    console.error('4. Check Neon console: https://console.neon.tech\n');
    
    await pool.end();
    process.exit(1);
  }
}

// Run the test
testConnection();