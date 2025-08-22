

import { createClient } from '@libsql/client';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { stakableStocks } from '../data/investmentOptions.js';

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
        // A simple check to see if the main users table exists.
        await db.execute("SELECT id FROM users LIMIT 1");
    } catch (e) {
        // If it throws "no such table", we assume the DB is empty and initialize it.
        if (e.message.includes('no such table')) {
            console.log('No schema found. Initializing database...');
            let tx;
            try {
                // Read the entire schema file
                const schemaPath = path.join(__dirname, 'schema.sql');
                const schema = await fs.readFile(schemaPath, 'utf-8');
                
                // Split into individual statements (handles comments and semicolons)
                const statements = schema.split(';').filter(s => s.trim().length > 0 && !s.trim().startsWith('--'));
                
                // Execute all statements within a single transaction
                tx = await db.transaction('write');
                for (const statement of statements) {
                    await tx.execute(statement);
                }

                console.log('Populating searchable_investments table...');
                for (const stock of stakableStocks) {
                    const embeddingString = `[${stock.embedding.join(',')}]`;
                    await tx.execute({
                        sql: `INSERT INTO searchable_investments (id, ticker, name, description, type, embedding) VALUES (?, ?, ?, ?, 'Stock', vector32(?)) ON CONFLICT(ticker) DO NOTHING`,
                        args: [`search-${stock.id}`, stock.ticker, stock.name, stock.description, embeddingString]
                    });
                }
                console.log('Populated searchable_investments table.');
                
                await tx.commit();
                console.log('Database schema initialized successfully.');

            } catch (initErr) {
                console.error('Failed to initialize database schema:', initErr);
                if (tx) {
                  try { await tx.rollback(); } catch (rollbackErr) { console.error('Failed to rollback schema initialization:', rollbackErr); }
                }
                throw initErr; // Re-throw to prevent server from starting with a bad DB state
            }
        } else {
             // If the error is something other than "no such table", re-throw it.
             throw e;
        }
    }
};