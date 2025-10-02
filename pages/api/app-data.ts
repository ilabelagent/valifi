import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const JWT_SECRET = process.env.JWT_SECRET || 'valifi-secret-key-change-in-production';

// Initialize PostgreSQL connection
const dbUrl = process.env.DATABASE_URL || 'postgresql://valifip:Valifi2025SecurePass@localhost:5432/valifi_production';
const isLocalDb = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Verify JWT token
function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Check for auth token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Verify token
  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  try {
    // Get user data from database
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, email_verified, account_status FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user's wallets (our equivalent of portfolio)
    const walletsResult = await pool.query(
      'SELECT * FROM wallets WHERE user_id = $1',
      [decoded.userId]
    );

    // Calculate total portfolio value from wallets
    const totalValue = walletsResult.rows.reduce((sum, wallet) =>
      sum + parseFloat(wallet.balance || '0'), 0
    );

    // Get user's transactions
    const transactionsResult = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [decoded.userId]
    );

    // Build app data response with REAL user data
    const fullName = `${user.first_name} ${user.last_name}`.trim();
    const appData = {
      profile: {
        id: user.id,
        fullName: fullName,
        username: user.email?.split('@')[0] || 'user',
        email: user.email,
        profilePhotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4F46E5&color=fff`,
        kycStatus: 'Not Started' as const,
        isVerified: Boolean(user.email_verified),
        isActive: user.account_status === 'active',
        role: 'user'
      },
      settings: {
        twoFactorAuth: { enabled: false, method: 'none' as const },
        loginAlerts: true,
        autoLogout: '1h' as const,
        preferences: {
          currency: 'USD',
          language: 'en' as const,
          dateFormat: 'MM/DD/YYYY' as const,
          timezone: 'UTC',
          balancePrivacy: false,
          sidebarCollapsed: false,
          openNavGroups: ['overview', 'trading', 'money', 'growth', 'compliance']
        },
        privacy: {
          emailMarketing: false,
          platformMessages: true,
          contactAccess: false
        },
        vaultRecovery: {
          email: '',
          phone: '',
          pin: ''
        }
      },
      sessions: [],
      portfolio: {
        totalValue: totalValue,
        totalProfit: 0,
        dailyChange: 0,
        weeklyChange: 0,
        change24hValue: 0,
        change24hPercent: 0,
        cashBalance: walletsResult.rows.find(w => w.currency === 'USD')?.balance || 0,
        assets: walletsResult.rows.map((wallet: any) => ({
          id: wallet.id,
          type: 'CASH',
          ticker: wallet.currency,
          name: wallet.currency,
          balance: parseFloat(wallet.balance || '0'),
          valueUSD: parseFloat(wallet.balance || '0'),
          change24h: 0,
          allocation: totalValue > 0 ? (parseFloat(wallet.balance || '0') / totalValue) * 100 : 0,
          Icon: wallet.currency === 'USD' ? 'UsdIcon' : 'GenericIcon'
        })),
        transactions: transactionsResult.rows.map((tx: any) => ({
          id: tx.id,
          date: tx.created_at,
          description: tx.description || 'Transaction',
          amountUSD: parseFloat(tx.amount || '0'),
          status: tx.status || 'completed',
          type: tx.transaction_type || 'transfer'
        })),
        tradeAssets: []
      },
      notifications: [],
      userActivity: [],
      newsItems: [],
      cardDetails: {
        status: 'Not Applied' as const,
        type: 'Virtual' as const,
        currency: 'USD' as const,
        theme: 'Obsidian' as const,
        isFrozen: false
      },
      linkedBankAccounts: [],
      loanApplications: [],
      p2pOffers: [],
      p2pOrders: [],
      userPaymentMethods: [],
      // Empty investment options - no demo data
      reitProperties: [],
      stakableStocks: [],
      investableNFTs: [],
      spectrumPlans: [],
      stakableCrypto: [],
      userStakedStocks: [],
      referralSummary: {
        tree: null,
        activities: []
      }
    };

    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    res.status(200).json({ success: true, data: appData });

  } catch (error) {
    console.error('Error fetching app data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch application data' 
    });
  }
}