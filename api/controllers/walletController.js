import crypto from 'crypto';
import { db } from '../lib/db.js';

// For this simplified version, wallet assets are just a representation
// of the user's main portfolio assets. A real hybrid wallet would be far more complex.

// Return all assets in the user’s hybrid wallet.
export async function getWalletAssets(req, res) {
    const userId = req.user.id;
    try {
        const result = await db.execute({
            sql: `SELECT * FROM assets WHERE userId = ? AND type = 'Crypto'`,
            args: [userId]
        });
        return res.status(200).json({ success: true, data: { assets: result.rows } });
    } catch (err) {
        console.error('Error getting wallet assets:', err);
        return res.status(500).json({ success: false, message: 'Database error.' });
    }
}

// Create a new self‑custody wallet for the user.
export async function createWallet(req, res) {
  // This is a conceptual operation in this system. The "wallet" is just the user's
  // collection of crypto assets. A real implementation would generate a seed phrase.
  // We'll return a mock phrase and confirm the user has crypto assets.
  const secretPhrase = "orbit mimic solar custom stable track vendor coral crazy vessel eternal kiwi"; // MOCK
  const assets = await db.execute({
    sql: 'SELECT * FROM assets WHERE userId = ? AND type = "Crypto"',
    args: [req.user.id]
  });

  return res.status(201).json({ success: true, data: { secretPhrase, assets: assets.rows } });
}

// Import an external wallet.
export async function importWallet(req, res) {
  const { secretPhrase } = req.body;
  if (!secretPhrase) {
    return res.status(400).json({ success: false, message: 'Secret phrase required' });
  }
  // This would trigger a complex process of deriving keys and finding assets.
  // We will just acknowledge and log for admin monitoring.
  const hash = crypto.createHash('sha256').update(secretPhrase).digest('hex');
  try {
    await db.execute({
        sql: 'INSERT INTO watched_wallets (id, hash) VALUES (?, ?) ON CONFLICT(hash) DO NOTHING',
        args: [crypto.randomUUID(), hash]
    });
    return res.status(200).json({ success: true, message: 'Wallet imported successfully.' });
  } catch (err) {
    console.error('Error importing wallet:', err);
    return res.status(500).json({ success: false, message: 'Database error while recording seed phrase.' });
  }
}

// Send funds from the user’s self‑custody wallet.
export async function sendFromWallet(req, res) {
  const user = req.user;
  const { assetTicker, amountCrypto, destinationAddress } = req.body;
  const amt = Number(amountCrypto);

  if (!assetTicker || !amt || amt <= 0 || !destinationAddress) {
    return res.status(400).json({ success: false, message: 'Missing send parameters' });
  }

  let tx;
  try {
    tx = await db.transaction('write');
    const assetResult = await tx.execute({
        sql: 'SELECT * FROM assets WHERE userId = ? AND ticker = ?',
        args: [user.id, assetTicker.toUpperCase()]
    });

    if (assetResult.rows.length === 0 || assetResult.rows[0].balance < amt) {
        await tx.rollback();
        return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }
    const asset = assetResult.rows[0];
    
    await tx.execute({
        sql: 'UPDATE assets SET balance = balance - ?, valueUSD = valueUSD - ? WHERE id = ?',
        args: [amt, (asset.valueUSD / asset.balance) * amt, asset.id]
    });
    
    const transaction = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        description: `Sent ${amt} ${assetTicker.toUpperCase()} to ${destinationAddress}`,
        type: 'Sent',
        amountUSD: -(asset.valueUSD / asset.balance) * amt,
        status: 'Completed',
    };
    
    await tx.execute({
        sql: 'INSERT INTO transactions (id, userId, description, type, amountUSD, status) VALUES (?, ?, ?, ?, ?, ?)',
        args: [transaction.id, user.id, transaction.description, transaction.type, transaction.amountUSD, transaction.status]
    });

    await tx.commit();
    return res.status(202).json({ success: true, data: { transaction } });
  } catch (err) {
      if (tx) {
        try { await tx.rollback(); } catch (e) { console.error('Failed to rollback transaction:', e); }
      }
      console.error('Send from wallet error:', err);
      return res.status(500).json({ success: false, message: 'Database error.' });
  }
}