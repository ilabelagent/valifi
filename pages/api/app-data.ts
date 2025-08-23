import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { createClient } from '@libsql/client';

const JWT_SECRET = process.env.JWT_SECRET || 'valifi-secret-key-change-in-production';

// Initialize Turso client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || ''
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
    const userResult = await db.execute({
      sql: 'SELECT id, email, name, is_verified, is_active, role FROM users WHERE id = ?',
      args: [decoded.userId]
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get user's portfolio
    const portfolioResult = await db.execute({
      sql: 'SELECT * FROM portfolios WHERE user_id = ?',
      args: [decoded.userId]
    });

    const portfolio = portfolioResult.rows[0] || {
      total_value_usd: 0,
      cash_balance: 0
    };

    // Get user's assets
    const assetsResult = await db.execute({
      sql: 'SELECT * FROM assets WHERE portfolio_id = ?',
      args: [portfolio?.id || '']
    });

    // Get user's transactions
    const transactionsResult = await db.execute({
      sql: 'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      args: [decoded.userId]
    });

    // Build app data response with REAL user data
    const appData = {
      profile: {
        id: user.id,
        fullName: user.name,
        username: user.email?.split('@')[0] || 'user',
        email: user.email,
        profilePhotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name as string)}&background=4F46E5&color=fff`,
        kycStatus: 'Not Started' as const,
        isVerified: Boolean(user.is_verified),
        isActive: Boolean(user.is_active),
        role: user.role
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
        totalValue: Number(portfolio?.total_value_usd) || 0,
        totalProfit: 0,
        dailyChange: 0,
        weeklyChange: 0,
        change24hValue: 0,
        change24hPercent: 0,
        cashBalance: Number(portfolio?.cash_balance) || 0,
        assets: assetsResult.rows.map((asset: any) => ({
          id: asset.id,
          type: asset.type,
          ticker: asset.ticker,
          name: asset.name,
          balance: Number(asset.quantity) || 0,
          valueUSD: Number(asset.value_usd) || 0,
          change24h: Number(asset.change_24h) || 0,
          allocation: 0,
          Icon: 'GenericIcon'
        })),
        transactions: transactionsResult.rows.map((tx: any) => ({
          id: tx.id,
          date: tx.created_at,
          description: tx.description || 'Transaction',
          amountUSD: Number(tx.amount_usd) || 0,
          status: tx.status || 'Completed',
          type: tx.type || 'Trade'
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