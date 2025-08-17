import { createClient } from '@libsql/client';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { initialPortfolio, initialNotifications, initialNewsItems } from '../data.js';

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


const seedTestUser = async () => {
    const tx = await db.transaction('write');
    try {
        const testUserEmail = 'test@example.com';
        const userCheck = await tx.execute({
            sql: 'SELECT id FROM users WHERE email = ?',
            args: [testUserEmail],
        });

        if (userCheck.rows.length > 0) {
            console.log('Test user already exists.');
            await tx.commit();
            return;
        }

        console.log('Seeding test user...');
        
        // 1. Create User and Settings
        const userId = 'user-1'; // Use a deterministic ID for the test user
        await tx.execute({
            sql: `INSERT INTO users (id, fullName, username, email, passwordHash, kycStatus, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [userId, 'Test User', 'testuser', testUserEmail, 'password', 'Approved', TRUE]
        });
        await tx.execute({
            sql: `INSERT INTO user_settings (id, userId, preferences, privacy, vaultRecovery) VALUES (?, ?, ?, ?, ?)`,
            args: [crypto.randomUUID(), userId, JSON.stringify({ currency: 'USD', language: 'en', theme: 'dark' }), '{}', '{}']
        });

        // 2. Seed Assets from initialPortfolio
        for (const asset of initialPortfolio.assets) {
            const details = asset.stockStakeDetails ? JSON.stringify(asset.stockStakeDetails) : JSON.stringify(asset.reitDetails || {});
            await tx.execute({
                sql: `INSERT INTO assets (id, userId, name, ticker, type, balance, valueUSD, initialInvestment, totalEarnings, status, maturityDate, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [asset.id, userId, asset.name, asset.ticker, asset.type, asset.balance, asset.valueUSD, asset.initialInvestment, asset.totalEarnings, asset.status, asset.maturityDate, details]
            });
        }
        
        // 3. Seed Transactions
        for (const transaction of initialPortfolio.transactions) {
             await tx.execute({
                sql: `INSERT INTO transactions (id, userId, date, description, amountUSD, status, type, txHash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [transaction.id, userId, transaction.date, transaction.description, transaction.amountUSD, transaction.status, transaction.type, transaction.txHash]
            });
        }
        
        // 4. Seed Notifications
        for (const notification of initialNotifications) {
             await tx.execute({
                sql: `INSERT INTO notifications (id, userId, type, title, description, timestamp, isRead, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [notification.id, userId, notification.type, notification.title, notification.description, notification.timestamp, notification.isRead, notification.link]
            });
        }
        
        // 5. Seed Global News Items (idempotent)
        for (const news of initialNewsItems) {
            await tx.execute({
                sql: `INSERT INTO news_items (id, title, content, timestamp) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`,
                args: [news.id, news.title, news.content, news.timestamp]
            });
        }

        await tx.commit();
        console.log("Test user seeded successfully.");

    } catch (err) {
        console.error("Error seeding test user:", err);
        await tx.rollback();
        throw err;
    }
}


// A function to initialize the database schema from an SQL file
export const initializeSchema = async () => {
    try {
        // Check if the main users table exists.
        await db.execute("SELECT id FROM users LIMIT 1");
        console.log("Database schema already initialized.");
    } catch (e) {
        if (e.message.includes('no such table')) {
            console.log("Initializing database schema...");
            try {
                const schemaPath = path.join(__dirname, 'schema.sql');
                const schema = await fs.readFile(schemaPath, 'utf-8');
                
                await db.batch(schema.split(';').filter(s => s.trim()));
                
                console.log("Schema initialized successfully.");
                
                // Seed the database with the test user after schema creation
                await seedTestUser();

            } catch (initErr) {
                console.error("Error during schema initialization:", initErr);
                throw initErr;
            }
        } else {
             console.error("Error checking database schema:", e);
             throw e;
        }
    }
};
