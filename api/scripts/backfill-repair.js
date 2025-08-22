
import { client } from '../lib/db.js';

async function main() {
  console.log('Backfill started…');

  // Normalize emails
  const users = await client.execute(`SELECT id, email, email_normalized FROM users`);
  for (const row of users.rows) {
    const want = row.email.toLowerCase();
    if (row.email_normalized !== want) {
      await client.execute({
        sql: `UPDATE users SET email_normalized = ? WHERE id = ?`,
        args: [want, row.id],
      });
      console.log('Fixed email_normalized for', row.id);
    }
  }

  // Ensure settings exist
  const missing = await client.execute(`
    SELECT u.id AS user_id
    FROM users u
    LEFT JOIN user_settings s ON s.user_id = u.id
    WHERE s.user_id IS NULL
  `);
  for (const row of missing.rows) {
    await client.execute({
      sql: `INSERT INTO user_settings (user_id, preferred_currency, language, theme)
            VALUES (?, 'USD', 'en', 'system')`,
      args: [row.user_id],
    });
    console.log('Created default settings for', row.user_id);
  }

  // Detect duplicates by normalized email (mark older as merged)
  const dups = await client.execute(`
    SELECT email_normalized, COUNT(*) AS c FROM users
    GROUP BY email_normalized HAVING c > 1
  `);
  for (const d of dups.rows) {
    const set = await client.execute({
      sql: `SELECT id, created_at FROM users WHERE email_normalized = ? ORDER BY created_at DESC`,
      args: [d.email_normalized],
    });
    const keep = set.rows.shift(); // newest
    for (const loser of set.rows) {
      await client.execute({
        sql: `UPDATE users SET status = 'merged_duplicate' WHERE id = ?`,
        args: [loser.id],
      });
      console.log(`Marked duplicate ${loser.id} (keep ${keep.id})`);
    }
  }

  console.log('Backfill done.');
}

main().catch(e => { console.error(e); process.exit(1); });
