

import { createClient } from '@libsql/client';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spectrumPlans, stakableCrypto, stakableStocks, reitProperties, investableNFTs } from '../data/investmentOptions.js';

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
    syncUrl: process.env.TURSO_DATABASE_URL,
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
                console.log('Database schema initialized successfully.');

                // --- SEED INVESTMENT CATALOGS ---
                console.log('Seeding investment catalogs...');

                // Spectrum Plans
                for (const plan of spectrumPlans) {
                    await tx.execute({
                        sql: 'INSERT INTO spectrum_plans (id, name, investmentRange, dailyReturns, capitalReturn, returnType, totalPeriods, cancellation, totalRevenue, note, colorClass, borderColor, buttonColor, shadowColor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        args: [plan.id, plan.name, plan.investmentRange, plan.dailyReturns, plan.capitalReturn, plan.returnType, plan.totalPeriods, plan.cancellation, plan.totalRevenue, plan.note, plan.colorClass, plan.borderColor, plan.buttonColor, plan.shadowColor]
                    });
                }
                console.log(`  - Seeded ${spectrumPlans.length} Spectrum Plans.`);
                
                // Stakable Crypto
                for (const crypto of stakableCrypto) {
                    await tx.execute({
                        sql: 'INSERT INTO stakable_crypto (id, name, ticker, Icon, apr, minDuration, maxDuration, payoutCycle, minAmount, maxAmount, adminWalletAddress) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        args: [crypto.id, crypto.name, crypto.ticker, crypto.Icon, crypto.apr, crypto.minDuration, crypto.maxDuration, crypto.payoutCycle, crypto.minAmount, crypto.maxAmount, crypto.adminWalletAddress]
                    });
                }
                console.log(`  - Seeded ${stakableCrypto.length} stakable crypto assets.`);

                // Stakable Stocks & Searchable Investments
                for (const stock of stakableStocks) {
                     await tx.execute({
                        sql: 'INSERT INTO stakable_stocks (id, ticker, name, Icon, sector, price, change24h, poolSize, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        args: [stock.id, stock.ticker, stock.name, stock.Icon, stock.sector, stock.price, stock.change24h, stock.poolSize, stock.status]
                    });
                    
                    const embeddingString = `[${stock.embedding.join(',')}]`;
                    await tx.execute({
                        sql: `INSERT INTO searchable_investments (id, ticker, name, description, type, embedding) VALUES (?, ?, ?, ?, 'Stock', vector32(?)) ON CONFLICT(ticker) DO NOTHING`,
                        args: [`search-${stock.id}`, stock.ticker, stock.name, stock.description, embeddingString]
                    });
                }
                console.log(`  - Seeded ${stakableStocks.length} stakable stocks.`);
                
                // REIT Properties
                for (const prop of reitProperties) {
                    await tx.execute({
                        sql: 'INSERT INTO reit_properties (id, name, address, imageUrl, description, investmentRange, monthlyROI, totalShares, sharesSold, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        args: [prop.id, prop.name, prop.address, prop.imageUrl, prop.description, JSON.stringify(prop.investmentRange), prop.monthlyROI, prop.totalShares, prop.sharesSold, prop.status]
                    });
                }
                console.log(`  - Seeded ${reitProperties.length} REIT properties.`);

                // Investable NFTs
                for (const nft of investableNFTs) {
                     await tx.execute({
                        sql: 'INSERT INTO investable_nfts (id, title, collection, imageUrl, floorPrice, totalShares, sharesAvailable, investors, apyAnnual, apyMonthly, adminBtcAddress) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        args: [nft.id, nft.title, nft.collection, nft.imageUrl, nft.floorPrice, nft.totalShares, nft.sharesAvailable, nft.investors, nft.apyAnnual, nft.apyMonthly, nft.adminBtcAddress]
                    });
                }
                console.log(`  - Seeded ${investableNFTs.length} investable NFTs.`);

                // --- END SEEDING ---
                
                await tx.commit();
                console.log('Database seeded successfully.');

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