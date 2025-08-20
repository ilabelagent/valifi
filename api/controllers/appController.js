
import { db } from '../lib/db.js';
import {
    spectrumPlans,
    stakableCrypto,
    stakableStocks,
    reitProperties,
    investableNFTs
} from '../data/investmentOptions.js';

// Helper to ensure all numeric types from DB are JS Numbers
const processAsset = (asset) => {
    if (!asset) return null;
    const details = typeof asset.details === 'string' ? JSON.parse(asset.details || '{}') : (asset.details || {});
    return {
        ...asset,
        balance: Number(asset.balance || 0),
        valueUSD: Number(asset.valueUSD || 0),
        change24h: Number(asset.change24h || 0),
        allocation: Number(asset.allocation || 0),
        initialInvestment: Number(asset.initialInvestment || 0),
        totalEarnings: Number(asset.totalEarnings || 0),
        details,
        Icon: `${asset.ticker}Icon` // Map ticker to Icon component name on frontend
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

export async function getAppData(req, res) {
  try {
    const userId = req.user.id;

    // Fetch all user-specific data concurrently
    const [
        userResult,
        settingsResult,
        sessionsResult,
        assetsResult,
        transactionsResult,
        notificationsResult,
        newsResult,
        cardResult,
        bankAccountsResult,
        loansResult,
        p2pOffersResult,
        p2pOrdersResult,
        paymentMethodsResult,
        referralResult
    ] = await Promise.all([
        db.execute({ sql: `SELECT id, fullName, username, email, profilePhotoUrl, kycStatus, kycRejectionReason FROM users WHERE id = ?`, args: [userId] }),
        db.execute({ sql: 'SELECT * FROM user_settings WHERE userId = ?', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM active_sessions WHERE userId = ? ORDER BY lastActive DESC', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM assets WHERE userId = ? ORDER BY valueUSD DESC', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC LIMIT 50', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM notifications WHERE userId = ? ORDER BY timestamp DESC LIMIT 20', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM news_items ORDER BY timestamp DESC LIMIT 5' }),
        db.execute({ sql: 'SELECT * FROM valifi_cards WHERE userId = ?', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM bank_accounts WHERE userId = ?', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM loan_applications WHERE userId = ?', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM p2p_offers WHERE isActive = TRUE AND userId != ?', args: [userId] }),
        db.execute({ sql: 'SELECT * FROM p2p_orders WHERE buyerId = ? OR sellerId = ?', args: [userId, userId] }),
        db.execute({ sql: 'SELECT * FROM p2p_payment_methods WHERE userId = ?', args: [userId] }),
        Promise.resolve({ tree: null, activities: [] }) // Mocked referral data
    ]);
    
    // Process User and Settings
    const profile = userResult.rows[0];
    if (!profile) {
        return res.status(404).json({ success: false, message: 'User profile data not found.' });
    }

    const dbSettings = settingsResult.rows[0];
    let settings;

    // This robust check prevents a crash if a user exists but their settings row does not.
    if (dbSettings) {
        settings = {
            twoFactorAuth: { 
                enabled: Boolean(dbSettings.twoFactorEnabled), 
                method: dbSettings.twoFactorMethod || 'none' 
            },
            loginAlerts: Boolean(dbSettings.loginAlerts),
            preferences: JSON.parse(dbSettings.preferences || '{}'),
            privacy: JSON.parse(dbSettings.privacy || '{}'),
            vaultRecovery: JSON.parse(dbSettings.vaultRecovery || '{}'),
        };
    } else {
        // Provide a safe, default settings object to prevent errors and ensure UI consistency.
        console.warn(`No settings found for user ${userId}. Providing default settings.`);
        settings = {
            twoFactorAuth: { enabled: false, method: 'none' },
            loginAlerts: true,
            preferences: { currency: 'USD', language: 'en', theme: 'dark', balancePrivacy: false },
            privacy: {},
            vaultRecovery: {},
        };
    }

    // Process Portfolio
    const assets = assetsResult.rows.map(processAsset);
    const totalValueUSD = assets.reduce((sum, a) => sum + a.valueUSD, 0);
    const change24hValue = assets.reduce((sum, a) => sum + (a.valueUSD * (a.change24h / 100)), 0);
    const change24hPercent = totalValueUSD > 0 ? (change24hValue / (totalValueUSD - change24hValue)) * 100 : 0;
    assets.forEach(asset => {
        asset.allocation = totalValueUSD > 0 ? (asset.valueUSD / totalValueUSD) * 100 : 0;
    });
    const portfolio = {
        totalValueUSD, change24hValue, change24hPercent, assets,
        transactions: transactionsResult.rows.map(tx => ({ ...tx, amountUSD: Number(tx.amountUSD || 0) })),
    };
    
    // Process derived data
    const userActivity = portfolio.transactions.slice(0, 20).map(tx => ({
        id: `act-${tx.id}`, action: tx.type, description: tx.description,
        timestamp: tx.date, icon: transactionTypeToIconString(tx.type),
    }));

    // Process other features' data
    const cardDetails = cardResult.rows.length > 0 ? cardResult.rows[0] : { status: 'Not Applied' };
    const linkedBankAccounts = bankAccountsResult.rows.map(acc => ({ ...acc, details: JSON.parse(acc.details || '{}') }));

    const responsePayload = {
        profile,
        settings,
        sessions: sessionsResult.rows,
        portfolio,
        notifications: notificationsResult.rows,
        userActivity,
        newsItems: newsResult.rows,
        cardDetails,
        linkedBankAccounts,
        loanApplications: loansResult.rows,
        p2pOffers: p2pOffersResult.rows,
        p2pOrders: p2pOrdersResult.rows,
        userPaymentMethods: paymentMethodsResult.rows,
        referralSummary: referralResult,
        // Investment Catalogs
        reitProperties,
        stakableStocks,
        investableNFTs,
        spectrumPlans,
        stakableCrypto,
    };
    
    return res.status(200).json({ success: true, data: responsePayload });

  } catch (err) {
    console.error('Error fetching application data:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve application data.' });
  }
}
