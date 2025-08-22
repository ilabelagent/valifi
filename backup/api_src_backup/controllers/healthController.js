
import { db } from '../lib/db.js';

export async function checkDbConnection(req, res) {
  try {
    // Perform a simple, low-cost query to verify connection and that the DB is responsive.
    await db.execute('SELECT 1');
    return res.status(200).json({ success: true, status: 'ok', message: 'Database connection successful.' });
  } catch (err) {
    console.error('Database health check failed:', err);
    // 503 Service Unavailable is the appropriate status code for a downstream service being down.
    return res.status(503).json({ 
        success: false, 
        status: 'error', 
        message: 'Database connection failed.' 
    });
  }
}
