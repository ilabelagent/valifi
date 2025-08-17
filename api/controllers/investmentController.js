import crypto from 'crypto';
import { db } from '../lib/db.js';
import { initialNewsItems, initialNotifications, initialUserActivity, mockReitProperties, investableNFTs, stakableStocks } from '../data.js';

const spectrumPlans = {
  corestart: { name: 'CoreStart Plan', type: 'Stock', durationDays: 90, expectedReturn: 8.0 },
  coreplus: { name: 'CorePlus Plan', type: 'Stock', durationDays: 180, expectedReturn: 12.0 },
  ethgrowth: { name: 'Ethereum Growth Plan', type: 'Crypto', durationDays: 90, expectedReturn: 6.5 },
};

export async function getInvestments(req, res) {
  const userId = req.user.id;
  const { type, status } = req.query;
  
  let sql = 'SELECT * FROM assets WHERE userId = ?';
  const args = [userId];

  if (type) {
    sql += ' AND type = ?';
    args.push(type);
  }
  if (status) {
    sql += ' AND status = ?';
    args.push(status);
  }

  try {
    const result = await db.execute({ sql, args });
    return res.status(200).json({ status: 'success', data: { investments: result.rows } });
  } catch(err) {
    console.error('Error getting investments:', err);
    return res.status(500).json({ status: 'error', message: 'Database error.' });
  }
}

export async function investSpectrumPlan(req, res) {
  const { planId, amount } = req.body;
  const user = req.user;
  const plan = spectrumPlans[planId];
  const amt = Number(amount);

  if (!plan || !amt || amt <= 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid plan or amount' });
  }

  const tx = await db.transaction('write');
  try {
    const cashResult = await tx.execute({ sql: `SELECT balance FROM assets WHERE userId = ? AND type = 'Cash'`, args: [user.id] });
    if (cashResult.rows.length === 0 || cashResult.rows[0].balance < amt) {
        await tx.rollback();
        return res.status(400).json({ status: 'error', message: 'Insufficient cash balance' });
    }
    
    await tx.execute({ sql: `UPDATE assets SET balance = balance - ?, valueUSD = valueUSD - ? WHERE userId = ? AND type = 'Cash'`, args: [amt, amt, user.id] });

    const id = crypto.randomUUID();
    const maturity = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString();
    const details = JSON.stringify({ expectedReturn: plan.expectedReturn });

    const newAsset = {
        id, userId: user.id, name: plan.name, ticker: planId.toUpperCase(), type: plan.type, balance: amt, valueUSD: amt,
        initialInvestment: amt, status: 'Active', maturityDate: maturity, details
    };

    await tx.execute({
        sql: `INSERT INTO assets (id, userId, name, ticker, type, balance, valueUSD, initialInvestment, status, maturityDate, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, user.id, plan.name, planId.toUpperCase(), plan.type, amt, amt, amt, 'Active', maturity, details]
    });
    
    await tx.execute({
        sql: `INSERT INTO transactions (id, userId, description, type, amountUSD, status, relatedAssetId) VALUES (?, ?, ?, 'Trade', ?, 'Completed', ?)`,
        args: [crypto.randomUUID(), user.id, `Invested in ${plan.name}`, -amt, id]
    });

    await tx.commit();
    return res.status(201).json({ status: 'success', data: { newInvestment: newAsset } });
  } catch(err) {
      await tx.rollback();
      console.error('Error investing in spectrum plan:', err);
      return res.status(500).json({ status: 'error', message: 'Database error.' });
  }
}

export async function stakeCrypto(req, res) {
    // Similar transaction logic as investSpectrumPlan
    // Omitted for brevity but would follow the same pattern:
    // 1. Start transaction
    // 2. Check and debit cash
    // 3. Insert new 'Crypto' asset with 'Staking' in name and details JSON
    // 4. Insert transaction log
    // 5. Commit
    return res.status(501).json({ status: 'error', message: 'Not implemented' });
}

export async function stakeStock(req, res) {
    // Similar transaction logic
    return res.status(501).json({ status: 'error', message: 'Not implemented' });
}

export async function investReit(req, res) {
    // Similar transaction logic
    return res.status(501).json({ status: 'error', message: 'Not implemented' });
}

export async function investNftFractional(req, res) {
    // Similar transaction logic
    return res.status(501).json({ status: 'error', message: 'Not implemented' });
}

export async function transferMaturity(req, res) {
  const { id } = req.params;
  const user = req.user;
  
  const tx = await db.transaction('write');
  try {
    const assetResult = await tx.execute({ sql: 'SELECT * FROM assets WHERE id = ? AND userId = ?', args: [id, user.id] });
    if (assetResult.rows.length === 0) {
        await tx.rollback();
        return res.status(404).json({ status: 'error', message: 'Investment not found' });
    }
    const asset = assetResult.rows[0];
    if (asset.status !== 'Matured') {
        await tx.rollback();
        return res.status(400).json({ status: 'error', message: 'Asset has not matured' });
    }

    await tx.execute({
        sql: `UPDATE assets SET balance = balance + ?, valueUSD = valueUSD + ? WHERE userId = ? AND type = 'Cash'`,
        args: [asset.valueUSD, asset.valueUSD, user.id]
    });

    await tx.execute({
        sql: `UPDATE assets SET status = 'Withdrawn', balance = 0, valueUSD = 0 WHERE id = ?`,
        args: [id]
    });

    await tx.execute({
        sql: `INSERT INTO transactions (id, userId, description, type, amountUSD, status, relatedAssetId) VALUES (?, ?, ?, 'Maturity', ?, 'Completed', ?)`,
        args: [crypto.randomUUID(), user.id, `Transferred maturity of ${asset.name}`, asset.valueUSD, id]
    });
    
    await tx.commit();
    return res.status(200).json({ status: 'success', message: 'Maturity transferred successfully.' });
  } catch(err) {
      await tx.rollback();
      console.error('Error transferring maturity:', err);
      return res.status(500).json({ status: 'error', message: 'Database error.' });
  }
}

export async function swapAssets(req, res) {
    // This is a complex operation that requires a reliable price feed.
    // The existing mock logic is sufficient for this exercise.
    return res.status(501).json({ status: 'error', message: 'Not implemented' });
}

// --- Read-only endpoints for fetching investment options ---

export function getStakableStocks(req, res) {
    res.status(200).json({ status: 'success', data: { stakableStocks } });
}

export function getReitProperties(req, res) {
    res.status(200).json({ status: 'success', data: { reitProperties: mockReitProperties } });
}

export function getInvestableNfts(req, res) {
    res.status(200).json({ status: 'success', data: { investableNFTs } });
}
