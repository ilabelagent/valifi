// Quick script to check if sessions table exists
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

const client = neon(process.env.DATABASE_URL);
const db = drizzle(client);

try {
  // Check if sessions table exists
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'sessions'
    );
  `);

  console.log("Sessions table exists:", result.rows[0].exists);

  // If exists, check structure
  if (result.rows[0].exists) {
    const structure = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'sessions';
    `);
    console.log("Sessions table structure:", structure.rows);

    // Check session count
    const count = await db.execute(sql`SELECT COUNT(*) FROM sessions;`);
    console.log("Session count:", count.rows[0].count);
  } else {
    console.log("❌ Sessions table does NOT exist - this is the problem!");
    console.log("Run: npm run db:push to create it");
  }
} catch (error) {
  console.error("Error checking sessions table:", error);
}

process.exit(0);
