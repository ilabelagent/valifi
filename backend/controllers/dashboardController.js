import { db } from '../lib/db.js';

// Controller for dashboard‑related operations.  The dashboard aggregates
// portfolio metrics, notifications, recent activity and news into a single
// response for the frontend.

const transactionTypeToIconString = (type) => {
    switch (type) {
        case 'Deposit': return 'DownloadIcon';
        case 'Withdrawal': return 'ArrowUpRightIcon';
        case 'Trade': return 'SwapIcon';
        case 'ROI Payout': return 'ArrowDownIcon';
        case 'Maturity': return 'CheckCircleIcon';
        case 'P2P': return 'RefreshIcon';
        case 'Sent': return 'ArrowUpRightIcon';
        case 'Received': return 'DownloadIcon';
        case 'Loan Repayment': return 'UsdIcon';
        default: return 'ClockIcon';
    }
};

export async function getDashboardData(req, res) {
  try {
    const userId = req.user.id;

    // Fetch all data in parallel
    const [assetsResult, transactionsResult, notificationsResult, newsResult] = await Promise.all([
        db.execute({ sql: 'SELECT * FROM assets WHERE userId = ? ORDER BY valueUSD DESC', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC LIMIT 20', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC LIMIT 10', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM news_items ORDER BY timestamp DESC LIMIT 5' })
    ]);
    
    const assets = assetsResult.rows.map(asset => {
        // Parse details if it exists and is a string
        const details = typeof asset.details === 'string' ? JSON.parse(asset.details) : asset.details;
        return {
            ...asset,
            details: details,
            // The frontend expects an 'Icon' property which is a component name as a string.
            // We can derive this from the ticker for simplicity.
            Icon: `${asset.ticker}Icon`
        };
    });
    
    // Calculate portfolio totals from fetched assets
    const totalValueUSD = assets.reduce((sum, a) => sum + (a.valueUSD || 0), 0);
    // Note: 24h change is a complex calculation requiring historical data.
    // For this implementation, we will use mock or zero values.
    const change24hValue = assets.reduce((sum, a) => sum + (a.valueUSD * ((a.change24h || 0) / 100)), 0);
    const change24hPercent = totalValueUSD === 0 ? 0 : (change24hValue / (totalValueUSD - change24hValue)) * 100;

    assets.forEach(asset => {
        asset.allocation = totalValueUSD > 0 ? (asset.valueUSD / totalValueUSD) * 100 : 0;
    });

    const portfolio = {
        totalValueUSD: Number(totalValueUSD.toFixed(2)),
        change24hValue: Number(change24hValue.toFixed(2)),
        change24hPercent: Number(change24hPercent.toFixed(2)),
        assets,
        transactions: transactionsResult.rows,
    };
    
    const userActivity = transactionsResult.rows.map(tx => ({
        id: `act-${tx.id}`,
        action: tx.type,
        description: tx.description,
        timestamp: tx.date,
        icon: transactionTypeToIconString(tx.type),
    }));

    const dashboardData = {
      portfolio,
      notifications: notificationsResult.rows,
      userActivity,
      newsItems: newsResult.rows,
    };
    
    return res.status(200).json({ status: 'success', data: dashboardData });
  } catch (err) {
    console.error('Error fetching dashboard data', err);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve dashboard data.' });
  }
}
