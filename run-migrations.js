const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ No DATABASE_URL found in environment');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Connecting to database...');
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to database');

    // Run production schema first
    console.log('🔄 Running production schema migration...');
    const productionSchema = fs.readFileSync(path.join(__dirname, 'migrations', '001-production-schema.sql'), 'utf8');

    const statements = productionSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await pool.query(statement + ';');
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`⚠️  Skipping (already exists): ${statement.substring(0, 50)}...`);
        } else {
          console.error(`❌ Error: ${err.message}`);
        }
      }
    }

    // Run fintech schema
    console.log('🔄 Running fintech schema migration...');
    const fintechSchema = fs.readFileSync(path.join(__dirname, 'migrations', '002-fintech-schema.sql'), 'utf8');

    const fintechStatements = fintechSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of fintechStatements) {
      try {
        await pool.query(statement + ';');
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`⚠️  Skipping (already exists): ${statement.substring(0, 50)}...`);
        } else {
          console.error(`❌ Error: ${err.message}`);
        }
      }
    }

    console.log('✅ Migrations completed successfully!');

    // Show table count
    const tableCount = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `);

    console.log(`📊 Total tables: ${tableCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🎉 Migration complete!');
  }
}

runMigrations();