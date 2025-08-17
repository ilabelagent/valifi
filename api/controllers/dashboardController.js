import { db } from '../lib/db.js';

// Helper to ensure all numeric types from DB are JS Numbers
const processAsset = (asset) => {
    if (!asset) return null;
    const details = typeof asset.details === 'string' ? JSON.parse(asset.details || '{}') : asset.details;
    return {
        ...asset,
        balance: Number(asset.balance || 0),
        valueUSD: Number(asset.valueUSD || 0),
        change24h: Number(asset.change24h || 0),
        allocation: Number(asset.allocation || 0),
        initialInvestment: Number(asset.initialInvestment || 0),
        totalEarnings: Number(asset.totalEarnings || 0),
        details,
        Icon: `${asset.ticker}Icon`
    };
};

const transactionTypeToIconString = (type) => {
    const map = {
        'Deposit': 'DownloadIcon', 'Withdrawal': 'ArrowUpRightIcon', 'Trade': 'SwapIcon',
        'ROI Payout': 'ArrowDownIcon', 'Maturity': 'CheckCircleIcon', 'P2P': 'RefreshIcon',
        'Sent': 'ArrowUpRightIcon', 'Received': 'DownloadIcon', 'Loan Repayment': 'UsdIcon'
    };
    return map[type] || 'ClockIcon';
};

export async function getDashboardData(req, res) {
  try {
    const userId = req.user.id;

    const [assetsResult, transactionsResult, notificationsResult, newsResult] = await Promise.all([
        db.execute({ sql: 'SELECT * FROM assets WHERE userId = ? ORDER BY valueUSD DESC', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC LIMIT 20', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC LIMIT 10', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM news_items ORDER BY timestamp DESC LIMIT 5' })
    ]);
    
    const assets = assetsResult.rows.map(processAsset);
    
    const totalValueUSD = assets.reduce((sum, a) => sum + a.valueUSD, 0);
    const change24hValue = assets.reduce((sum, a) => sum + (a.valueUSD * (a.change24h / 100)), 0);
    const change24hPercent = totalValueUSD > 0 ? (change24hValue / (totalValueUSD - change24hValue)) * 100 : 0;

    assets.forEach(asset => {
        asset.allocation = totalValueUSD > 0 ? (asset.valueUSD / totalValueUSD) * 100 : 0;
    });

    const portfolio = {
        totalValueUSD,
        change24hValue,
        change24hPercent,
        assets,
        transactions: transactionsResult.rows.map(tx => ({ ...tx, amountUSD: Number(tx.amountUSD || 0) })),
    };
    
    const userActivity = portfolio.transactions.map(tx => ({
        id: `act-${tx.id}`, action: tx.type, description: tx.description,
        timestamp: tx.date, icon: transactionTypeToIconString(tx.type),
    }));

    return res.status(200).json({ 
        success: true, 
        data: { portfolio, notifications: notificationsResult.rows, userActivity, newsItems: newsResult.rows }
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard data.' });
  }
}
