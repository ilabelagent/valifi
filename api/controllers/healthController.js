import { client } from '../lib/db.js';

export const checkDbConnection = async (_req, res, next) => {
  try {
    // A simple, low-cost query to verify connection and that the DB is responsive.
    await client.execute('SELECT 1');
    res.status(200).json({ ok: true, status: 'ok', message: 'Database connection successful.' });
  } catch (err) {
    console.error('Database health check failed:', err);
    // Use a custom status and code for specific health check failures.
    res.status(503).json({ 
        ok: false, 
        code: 'DB_UNAVAILABLE', 
        message: 'Database connection failed.' 
    });
  }
};
