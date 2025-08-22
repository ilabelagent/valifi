
import { createClient } from '@libsql/client';

export const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Run a function inside a write transaction with commit/rollback
export async function withTx(fn) {
  const tx = await client.transaction('write');
  try {
    const result = await fn(tx);
    await tx.commit();
    return result;
  } catch (err) {
    try { await tx.rollback(); } catch {}
    throw err;
  }
}
