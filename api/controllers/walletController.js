import crypto from 'crypto';
import { db } from '../lib/db.js';

export async function sendFromWallet(req, res) {
  const user = req.user;
  const { assetTicker, amountCrypto, destinationAddress } = req.body;
  const amt = Number(amountCrypto);

  if (!assetTicker || !amt || amt <= 0 || !destinationAddress) {
    return res.status(400).json({ success: false, message: 'Missing or invalid send parameters' });
  }

  try {
    await db.execute('BEGIN');
    const assetResult = await db.execute({
        sql: 'SELECT * FROM assets WHERE userId = ? AND ticker = ?',
        args: [user.id, assetTicker.toUpperCase()]
    });

    if (assetResult.rows.length === 0 || Number(assetResult.rows[0].balance) < amt) {
        await db.execute('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }
    const asset = assetResult.rows[0];
    const valueOfSend = (Number(asset.valueUSD) / Number(asset.balance)) * amt;
    
    await db.execute({
        sql: 'UPDATE assets SET balance = balance - ?, valueUSD = valueUSD - ? WHERE id = ?',
        args: [amt, valueOfSend, asset.id]
    });
    
    const transaction = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        description: `Sent ${amt} ${assetTicker.toUpperCase()}`,
        type: 'Sent',
        amountUSD: -valueOfSend,
        status: 'Completed',
    };
    
    await db.execute({
        sql: 'INSERT INTO transactions (id, userId, description, type, amountUSD, status) VALUES (?, ?, ?, ?, ?, ?)',
        args: [transaction.id, user.id, transaction.description, transaction.type, transaction.amountUSD, transaction.status]
    });

    await db.execute('COMMIT');
    return res.status(202).json({ success: true, data: { transaction } });
  } catch (err) {
      try { await db.execute('ROLLBACK'); } catch(e) { console.error('Failed to rollback transaction:', e); }
      console.error('Send from wallet error:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}
