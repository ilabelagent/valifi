import { createClient } from '@libsql/client';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
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
        const hashedPassword = await bcrypt.hash('password', 10);
        await tx.execute({
            sql: `INSERT INTO users (id, fullName, username, email, passwordHash, kycStatus, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [userId, 'Test User', 'testuser', testUserEmail, hashedPassword, 'Approved', true]
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

const seedExtraUsers = async () => {
    const tx = await db.transaction('write');
    try {
        const usersToSeed = [
            {
                id: 'user-admin-seeded',
                fullName: 'Platform Admin',
                username: 'platformadmin',
                email: 'admin@valifi.com',
                password: 'password_admin',
                isAdmin: true,
            },
            {
                id: 'user-starter-seeded',
                fullName: 'Starter User',
                username: 'starteruser',
                email: 'user@valifi.com',
                password: 'password_user',
                isAdmin: false,
            }
        ];

        for (const user of usersToSeed) {
            const userCheck = await tx.execute({
                sql: 'SELECT id FROM users WHERE email = ?',
                args: [user.email],
            });

            if (userCheck.rows.length > 0) {
                console.log(`User ${user.email} already exists.`);
                continue;
            }

            console.log(`Seeding user: ${user.email}`);

            const now = new Date().toISOString();
            const hashedPassword = await bcrypt.hash(user.password, 10);
            
            await tx.execute({
                sql: `INSERT INTO users (id, fullName, username, email, passwordHash, kycStatus, isAdmin, profilePhotoUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [user.id, user.fullName, user.username, user.email, hashedPassword, 'Not Started', user.isAdmin, `https://i.pravatar.cc/40?u=${user.username}`, now, now]
            });

            const settingsId = crypto.randomUUID();
            const defaultPreferences = { currency: 'USD', language: 'en', theme: 'dark', balancePrivacy: false };
            const defaultPrivacy = { emailMarketing: false, platformMessages: true, contactAccess: false };
            const defaultVaultRecovery = { email: '', phone: '', pin: '' };
            
            await tx.execute({
                sql: 'INSERT INTO user_settings (id, userId, twoFactorEnabled, twoFactorMethod, loginAlerts, preferences, privacy, vaultRecovery) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                args: [settingsId, user.id, false, 'none', false, JSON.stringify(defaultPreferences), JSON.stringify(defaultPrivacy), JSON.stringify(defaultVaultRecovery)]
            });

            const assetId = crypto.randomUUID();
            await tx.execute({
                sql: `INSERT INTO assets (id, userId, name, ticker, type, balance, valueUSD, initialInvestment, totalEarnings, status, details, balanceInEscrow, change24h, allocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [assetId, user.id, 'Cash', 'USD', 'Cash', 0, 0, 0, 0, 'Active', '{}', 0, 0, 0]
            });
        }

        await tx.commit();
        console.log("Extra users seeded successfully.");

    } catch (err) {
        console.error("Error seeding extra users:", err);
        await tx.rollback();
    }
};


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
                await seedExtraUsers();

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
