
// api/migrations/002_repair_data.js
import { createClient } from '@libsql/client';
import 'dotenv/config';
import crypto from 'crypto';

/*
 * ==========================================================================================
 * ONE-TIME DATA REPAIR SCRIPT
 * ==========================================================================================
 * This script performs two essential data migration tasks:
 * 1. Backfills the `email_normalized` column for all existing users by lowercasing their email.
 * 2. Finds any users who are missing a corresponding row in `user_settings` and creates one
 *    for them with default values.
 *
 * HOW TO RUN:
 * 1. Ensure your .env file in the `api/` directory is correctly configured with your
 *    TURSO_DATABASE_URL and TURSO_AUTH_TOKEN for the database you want to repair.
 * 2. From your terminal, navigate to the `api/` directory.
 * 3. Run the script using Node: `node migrations/002_repair_data.js`
 * 4. The script will output its progress and a summary of actions taken.
 * ==========================================================================================
 */

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function repairData() {
    console.log('Starting data repair process...');

    let tx;
    try {
        tx = await db.transaction('write');
        console.log('Transaction started.');

        // --- Task 1: Backfill email_normalized ---
        console.log('Fetching users with missing email_normalized...');
        const usersToNormalize = await tx.execute({
            sql: "SELECT id, email FROM users WHERE email_normalized IS NULL OR email_normalized = ''",
            args: []
        });

        if (usersToNormalize.rows.length > 0) {
            console.log(`Found ${usersToNormalize.rows.length} users to update with normalized emails.`);
            for (const user of usersToNormalize.rows) {
                const normalizedEmail = user.email.trim().toLowerCase();
                await tx.execute({
                    sql: 'UPDATE users SET email_normalized = ? WHERE id = ?',
                    args: [normalizedEmail, user.id]
                });
                console.log(`  - Normalized email for user ${user.id}`);
            }
        } else {
            console.log('All users already have normalized emails. No updates needed.');
        }


        // --- Task 2: Create missing user_settings ---
        console.log('Checking for users missing settings...');
        const usersMissingSettings = await tx.execute({
            sql: `
                SELECT u.id FROM users u
                LEFT JOIN user_settings us ON u.id = us.user_id
                WHERE us.user_id IS NULL
            `,
            args: []
        });

        if (usersMissingSettings.rows.length > 0) {
            console.log(`Found ${usersMissingSettings.rows.length} users missing settings. Creating default settings...`);
            for (const user of usersMissingSettings.rows) {
                await tx.execute({
                    sql: 'INSERT INTO user_settings (id, user_id) VALUES (?, ?)',
                    args: [crypto.randomUUID(), user.id]
                });
                console.log(`  - Created settings for user ${user.id}`);
            }
        } else {
            console.log('All users have corresponding settings. No new settings needed.');
        }

        await tx.commit();
        console.log('Transaction committed successfully.');
        console.log('---');
        console.log('Data repair process finished.');
        console.log('Summary:');
        console.log(`  - Normalized emails for ${usersToNormalize.rows.length} users.`);
        console.log(`  - Created settings for ${usersMissingSettings.rows.length} users.`);
        console.log('---');

    } catch (error) {
        console.error('An error occurred during the repair process:', error);
        if (tx) {
            try {
                await tx.rollback();
                console.error('Transaction has been rolled back.');
            } catch (rollbackError) {
                console.error('Failed to rollback transaction:', rollbackError);
            }
        }
    }
}

repairData().catch(e => console.error('Script execution failed:', e));
