import crypto from 'crypto';
import { db } from '../lib/db.js';
import { stakableStocks, mockReitProperties, investableNFTs } from '../data.js';

// Helper to process asset data from DB
const processAsset = (asset) => {
    if (!asset) return null;
    return {
        ...asset,
        balance: Number(asset.balance || 0),
        valueUSD: Number(asset.valueUSD || 0),
        initialInvestment: Number(asset.initialInvestment || 0),
        totalEarnings: Number(asset.totalEarnings || 0),
        details: typeof asset.details === 'string' ? JSON.parse(asset.details || '{}') : asset.details,
    };
};

export async function transferMaturity(req, res) {
  const { id } = req.params;
  const user = req.user;
  
  try {
    await db.execute('BEGIN');
    const assetResult = await db.execute({ sql: 'SELECT * FROM assets WHERE id = ? AND userId = ?', args: [id, user.id] });
    if (assetResult.rows.length === 0) {
        await db.execute('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Investment not found.' });
    }
    const asset = processAsset(assetResult.rows[0]);
    if (asset.status !== 'Matured') {
        await db.execute('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Asset has not matured.' });
    }

    await db.execute({
        sql: `UPDATE assets SET balance = balance + ?, valueUSD = valueUSD + ? WHERE userId = ? AND type = 'Cash'`,
        args: [asset.valueUSD, asset.valueUSD, user.id]
    });

    await db.execute({ sql: `UPDATE assets SET status = 'Withdrawn', balance = 0, valueUSD = 0 WHERE id = ?`, args: [id] });

    await db.execute('COMMIT');
    return res.status(200).json({ success: true, message: 'Maturity transferred successfully.' });
  } catch(err) {
      try { await db.execute('ROLLBACK'); } catch(e) { console.error('Failed to rollback transaction:', e); }
      console.error('Error transferring maturity:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

// --- Read-only endpoints for fetching investment options ---
export function getStakableStocks(req, res) {
    res.status(200).json({ success: true, data: { stakableStocks } });
}
export function getReitProperties(req, res) {
    res.status(200).json({ success: true, data: { reitProperties: mockReitProperties } });
}
export function getInvestableNfts(req, res) {
    res.status(200).json({ success: true, data: { investableNFTs } });
}

// --- Placeholder functions for other investment types ---
export async function investSpectrumPlan(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function stakeCrypto(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function stakeStock(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function investReit(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function investNftFractional(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function swapAssets(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
