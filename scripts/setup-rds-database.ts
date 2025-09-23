/**
 * AWS RDS PostgreSQL Database Setup Script
 * Sets up the Valifi production database on AWS RDS
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const config = {
  host: process.env.DB_HOST || 'valifi-production-db.c8y4mxfhjklm.us-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'valifi_production',
  user: process.env.DB_USER || 'valifi_admin',
  password: process.env.DB_PASSWORD || '',
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
};

async function setupDatabase() {
  console.log('🚀 Starting AWS RDS PostgreSQL Database Setup...\n');

  // Check if password is provided
  if (!config.password) {
    console.error('❌ Error: DB_PASSWORD environment variable is required');
    console.error('Set your RDS password: export DB_PASSWORD="your_rds_password"');
    process.exit(1);
  }

  const pool = new Pool(config);

  try {
    // Test connection
    console.log('🔗 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log(`   Time: ${result.rows[0].current_time}`);
    console.log(`   Version: ${result.rows[0].pg_version.split(' ')[0]}\n`);
    client.release();

    // Check if database exists and has tables
    console.log('🔍 Checking existing database structure...');
    const existingTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (existingTables.rows.length > 0) {
      console.log('📋 Existing tables found:');
      existingTables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      console.log('\n❓ Database already has tables. Do you want to recreate them?');
      console.log('   This will DROP all existing data!');
      console.log('   To proceed, run: npm run db:migrate\n');
      return;
    }

    // Run production schema migration
    console.log('📊 Running production schema migration...');
    const schemaPath = path.join(process.cwd(), 'migrations', '001-production-schema.sql');

    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found: ${schemaPath}`);
      process.exit(1);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✅ Production schema created successfully!\n');

    // Run fintech schema migration
    console.log('🏦 Running fintech schema migration...');
    const fintechPath = path.join(process.cwd(), 'migrations', '002-fintech-schema.sql');

    if (fs.existsSync(fintechPath)) {
      const fintechSql = fs.readFileSync(fintechPath, 'utf8');
      await pool.query(fintechSql);
      console.log('✅ Fintech schema created successfully!\n');
    } else {
      console.log('⚠️  Fintech schema file not found, skipping...\n');
    }

    // Verify tables were created
    console.log('🔍 Verifying database setup...');
    const tables = await pool.query(`
      SELECT table_name,
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📋 Database tables created:');
    tables.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name} (${row.column_count} columns)`);
    });

    // Test data insertion
    console.log('\n🧪 Testing data insertion...');
    const testUser = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, email_verified, account_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, created_at
    `, [
      'test@valifi.com',
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5CiJ6YGYmXNI6',
      'Test',
      'User',
      true,
      'active'
    ]);

    console.log(`✅ Test user created: ${testUser.rows[0].email} (ID: ${testUser.rows[0].id})`);

    // Clean up test data
    await pool.query('DELETE FROM users WHERE email = $1', ['test@valifi.com']);
    console.log('🧹 Test data cleaned up\n');

    console.log('🎉 AWS RDS PostgreSQL Database Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update your .env.production.rds file with the correct DB_PASSWORD');
    console.log('2. Deploy to AWS App Runner with the updated environment variables');
    console.log('3. Test the application with the new database connection\n');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Connection refused. Check:');
      console.error('   - RDS instance is running');
      console.error('   - Security group allows connections from your IP');
      console.error('   - VPC and subnet configuration');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Check:');
      console.error('   - DB_PASSWORD is correct');
      console.error('   - DB_USER has proper permissions');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Check:');
      console.error('   - DB_NAME is correct');
      console.error('   - Database was created during RDS setup');
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Environment check
if (process.argv.includes('--help')) {
  console.log(`
AWS RDS PostgreSQL Database Setup Script

Usage:
  bun run scripts/setup-rds-database.ts
  npm run scripts/setup-rds-database.ts

Environment Variables:
  DB_HOST     - RDS endpoint (default: valifi-production-db.c8y4mxfhjklm.us-east-1.rds.amazonaws.com)
  DB_PORT     - Database port (default: 5432)
  DB_NAME     - Database name (default: valifi_production)
  DB_USER     - Database user (default: valifi_admin)
  DB_PASSWORD - Database password (REQUIRED)

Example:
  export DB_PASSWORD="your_rds_password"
  bun run scripts/setup-rds-database.ts
`);
  process.exit(0);
}

// Run the setup
setupDatabase().catch(console.error);