import crypto from 'crypto';
import { db } from '../lib/db.js';

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

const processJsonField = (items, field) => {
    return items.map(item => ({
        ...item,
        [field]: JSON.parse(item[field] || '{}')
    }));
};

export async function transferMaturity(req, res) {
  const { id } = req.params;
  const user = req.user;
  
  let tx;
  try {
    tx = await db.transaction('write');
    const assetResult = await tx.execute({ sql: 'SELECT * FROM assets WHERE id = ? AND userId = ?', args: [id, user.id] });
    if (assetResult.rows.length === 0) {
        await tx.rollback();
        return res.status(404).json({ success: false, message: 'Investment not found.' });
    }
    const asset = processAsset(assetResult.rows[0]);
    if (asset.status !== 'Matured') {
        await tx.rollback();
        return res.status(400).json({ success: false, message: 'Asset has not matured.' });
    }

    await tx.execute({
        sql: `UPDATE assets SET balance = balance + ?, valueUSD = valueUSD + ? WHERE userId = ? AND type = 'Cash'`,
        args: [asset.valueUSD, asset.valueUSD, user.id]
    });

    await tx.execute({ sql: `UPDATE assets SET status = 'Withdrawn', balance = 0, valueUSD = 0 WHERE id = ?`, args: [id] });

    await tx.commit();
    return res.status(200).json({ success: true, message: 'Maturity transferred successfully.' });
  } catch(err) {
      if (tx) {
        try { await tx.rollback(); } catch(e) { console.error('Failed to rollback transaction:', e); }
      }
      console.error('Error transferring maturity:', err);
      return res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
}

// --- Read-only endpoints for fetching investment options ---
export async function getStakableStocks(req, res) {
    const result = await db.execute('SELECT * FROM stakable_stocks');
    res.status(200).json({ success: true, stakableStocks: result.rows });
}
export async function getReitProperties(req, res) {
    const result = await db.execute('SELECT * FROM reit_properties');
    const properties = processJsonField(result.rows, 'investmentRange');
    res.status(200).json({ success: true, reitProperties: properties });
}
export async function getInvestableNfts(req, res) {
    const result = await db.execute('SELECT * FROM investable_nfts');
    res.status(200).json({ success: true, investableNFTs: result.rows });
}
export async function getSpectrumPlans(req, res) {
    const result = await db.execute('SELECT * FROM spectrum_plans');
    res.status(200).json({ success: true, plans: result.rows });
}
export async function getStakableCrypto(req, res) {
    const result = await db.execute('SELECT * FROM stakable_crypto');
    res.status(200).json({ success: true, assets: result.rows });
}

export async function searchInvestments(req, res) {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ success: false, message: 'Search query is required.' });
    }
    
    // Mock embedding generation based on keywords. In a real app, this would call an embedding model API.
    const mockGenerateEmbedding = (q) => {
        const lowerQ = q.toLowerCase();
        if (lowerQ.includes('tech') || lowerQ.includes('ai') || lowerQ.includes('software')) return [0.1, 0.9, 0.7, 0.5]; // tech, innovative
        if (lowerQ.includes('stable') || lowerQ.includes('safe') || lowerQ.includes('blue chip')) return [0.9, 0.5, 0.2, 0.1]; // stable, not innovative
        if (lowerQ.includes('electric') || lowerQ.includes('car') || lowerQ.includes('innovative')) return [0.2, 0.8, 0.9, 0.9]; // innovative, tech, volatile
        if (lowerQ.includes('e-commerce') || lowerQ.includes('online')) return [0.7, 0.8, 0.6, 0.4]; // stable-ish, tech-ish
        return [0.5, 0.5, 0.5, 0.5]; // Generic query
    };

    const queryVector = mockGenerateEmbedding(query);
    // IMPORTANT: The vector function call is embedded in the SQL.
    // This is safe because `queryVector` is generated server-side and contains only numbers.
    // DO NOT construct SQL strings with direct user input.
    const queryVectorSql = `vector32('[${queryVector.join(',')}]')`;

    try {
        const sql = `
            SELECT si.ticker
            FROM vector_top_k('idx_investments_embedding', ${queryVectorSql}, 5) AS v
            JOIN searchable_investments AS si ON si.rowid = v.id;
        `;
        const result = await db.execute(sql);
        const tickers = result.rows.map(row => row.ticker);
        res.status(200).json({ success: true, data: { tickers } });
    } catch (err) {
        console.error('Vector search error:', err);
        res.status(500).json({ success: false, message: 'An internal error occurred during search.' });
    }
}


// --- Write endpoints for creating investments ---
export async function investSpectrumPlan(req, res) {
    const { planId, amount } = req.body;
    const userId = req.user.id;
    
    const plansResult = await db.execute({ sql: 'SELECT * FROM spectrum_plans WHERE id = ?', args: [planId]});
    if(plansResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Plan not found.' });
    }
    const plan = plansResult.rows[0];

    let tx;
    try {
        tx = await db.transaction('write');
        const cashResult = await tx.execute({ sql: 'SELECT balance FROM assets WHERE userId = ? AND type = "Cash"', args: [userId] });
        if (cashResult.rows.length === 0 || Number(cashResult.rows[0].balance) < amount) {
            await tx.rollback();
            return res.status(400).json({ success: false, message: 'Insufficient cash balance.' });
        }
        
        await tx.execute({ sql: 'UPDATE assets SET balance = balance - ?, valueUSD = valueUSD - ? WHERE userId = ? AND type = "Cash"', args: [amount, amount, userId] });

        const assetId = crypto.randomUUID();
        const maturityDate = new Date();
        maturityDate.setDate(maturityDate.getDate() + parseInt(plan.totalPeriods));

        await tx.execute({
            sql: `INSERT INTO assets (id, userId, name, ticker, type, balance, valueUSD, initialInvestment, status, maturityDate, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [assetId, userId, plan.name, plan.id.toUpperCase(), 'Stock', 0, amount, amount, 'Active', maturityDate.toISOString(), JSON.stringify(plan)]
        });
        
        await tx.commit();
        res.status(201).json({ success: true, message: 'Investment successful.' });

    } catch (err) {
        if (tx) { try { await tx.rollback(); } catch (e) {} }
        console.error('Error investing in Spectrum plan:', err);
        res.status(500).json({ success: false, message: 'An internal server error occurred.' });
    }
}

export async function stakeCrypto(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function stakeStock(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function investReit(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function investNftFractional(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }
export async function swapAssets(req, res) { res.status(501).json({ success: false, message: 'Not implemented' }); }