const { Pool } = require('pg');

async function testNeonConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL successfully!');
ECHO is off.
    const result = await client.query('SELECT NOW()');
    console.log('🕒 Current time from database:', result.rows[0].now);
ECHO is off.
    client.release();
    await pool.end();
ECHO is off.
    return true;
  } catch (error) {
    console.error('❌ Neon connection failed:', error.message);
    return false;
  }
}

if (require.main === module) {
  require('dotenv').config();
  testNeonConnection();
}

module.exports = testNeonConnection;
