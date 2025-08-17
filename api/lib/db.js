import { createClient } from '@libsql/client';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('TURSO_DATABASE_URL is not defined in .env');
}
if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_AUTH_TOKEN is not defined in .env');
}

export const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});


// A function to initialize the database schema from an SQL file
export const initializeSchema = async () => {
    try {
        // Check if the main users table exists.
        await db.execute("SELECT id FROM users LIMIT 1");
    } catch (e) {
        if (e.message.includes('no such table')) {
            try {
                const schemaPath = path.join(__dirname, 'schema.sql');
                const schema = await fs.readFile(schemaPath, 'utf-8');
                
                const statements = schema.split(';').filter(s => s.trim());
                
                await db.execute('BEGIN');
                for (const statement of statements) {
                    await db.execute(statement);
                }
                await db.execute('COMMIT');

            } catch (initErr) {
                try {
                  await db.execute('ROLLBACK');
                } catch (rollbackErr) {
                  // silent
                }
                throw initErr;
            }
        } else {
             throw e;
        }
    }
};