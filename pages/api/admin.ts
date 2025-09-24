import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

/**
 * VALIFI ADMIN API - Complete Administration System
 * Provides full control over the fintech platform
 */

// Admin authentication middleware
const requireAdmin = async (req: NextApiRequest) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No authorization token');
  
  // Verify admin status
  const userId = await verifyJWT(token);
  const user = await db.query('SELECT isAdmin FROM users WHERE id = ?', [userId]);
  
  if (!user || !user.isAdmin) {
    throw new Error('Admin access required');
  }
  
  return userId;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify admin access
    const adminId = await requireAdmin(req);
    
    const { action } = req.query;
    
    switch (action) {
      case 'dashboard':
        return handleDashboard(req, res);
      
      case 'users':
        return handleUsers(req, res);
      
      case 'kyc':
        return handleKYC(req, res);
      
      case 'p2p':
        return handleP2P(req, res);
      
      case 'loans':
        return handleLoans(req, res);
      
      case 'trading':
        return handleTrading(req, res);
      
      case 'monitoring':
        return handleMonitoring(req, res);
      
      case 'settings':
        return handleSettings(req, res);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(403).json({ error: error.message });
  }
}

// DASHBOARD METRICS
async function handleDashboard(req: NextApiRequest, res: NextApiResponse) {
  const metrics = {
    overview: {
      totalUsers: await db.query('SELECT COUNT(*) as count FROM users'),
      activeUsers: await db.query(
        'SELECT COUNT(DISTINCT userId) as count FROM active_sessions WHERE lastActive > DATE_SUB(NOW(), INTERVAL 24 HOUR)'
      ),
      totalVolume: await db.query(
        'SELECT SUM(amountUSD) as volume FROM transactions WHERE date > DATE_SUB(NOW(), INTERVAL 24 HOUR)'
      ),
      totalAssets: await db.query('SELECT SUM(valueUSD) as total FROM assets')
    },
    
    kyc: {
      pending: await db.query('SELECT COUNT(*) FROM users WHERE kycStatus = "Pending"'),
      approved: await db.query('SELECT COUNT(*) FROM users WHERE kycStatus = "Approved"'),
      rejected: await db.query('SELECT COUNT(*) FROM users WHERE kycStatus = "Rejected"')
    },
    
    p2p: {
      activeOffers: await db.query('SELECT COUNT(*) FROM p2p_offers WHERE isActive = 1'),
      pendingOrders: await db.query('SELECT COUNT(*) FROM p2p_orders WHERE status IN ("Pending Payment", "Payment Sent")'),
      disputes: await db.query('SELECT COUNT(*) FROM p2p_disputes WHERE status = "Open"'),
      volume24h: await db.query(
        'SELECT SUM(fiatAmount) as volume FROM p2p_orders WHERE createdAt > DATE_SUB(NOW(), INTERVAL 24 HOUR)'
      )
    },
    
    loans: {
      pending: await db.query('SELECT COUNT(*) FROM loan_applications WHERE status = "Pending"'),
      active: await db.query('SELECT COUNT(*) FROM loan_applications WHERE status = "Active"'),
      totalValue: await db.query('SELECT SUM(amount) as total FROM loan_applications WHERE status = "Active"'),
      defaultRate: await calculateDefaultRate()
    },
    
    trading: {
      activeBots: await db.query('SELECT COUNT(*) FROM trading_bots WHERE status = "ACTIVE"'),
      totalTrades: await db.query('SELECT COUNT(*) FROM transactions WHERE type = "Trade"'),
      profitability: await calculateBotProfitability()
    },
    
    staking: {
      totalStaked: await db.query('SELECT SUM(valueUSD) as total FROM assets WHERE type IN ("Staking", "Stock Stake")'),
      rewardsDistributed: await db.query(
        'SELECT SUM(amountUSD) as total FROM transactions WHERE type = "ROI Payout" AND date > DATE_SUB(NOW(), INTERVAL 24 HOUR)'
      ),
      averageAPY: await calculateAverageAPY()
    },
    
    revenue: {
      tradingFees: await db.query(
        'SELECT SUM(fee) as total FROM transactions WHERE date > DATE_SUB(NOW(), INTERVAL 30 DAY)'
      ),
      p2pFees: await db.query(
        'SELECT SUM(fiatAmount * 0.01) as total FROM p2p_orders WHERE status = "Completed"'
      ),
      loanInterest: await db.query(
        'SELECT SUM(amount * interestRate / 100) as total FROM loan_applications WHERE status = "Active"'
      )
    }
  };
  
  return res.status(200).json(metrics);
}

// USER MANAGEMENT
async function handleUsers(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      // Get all users with filters
      const { status, kyc, search, limit = 50, offset = 0 } = req.query;
      
      let query = 'SELECT * FROM users WHERE 1=1';
      const params = [];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      if (kyc) {
        query += ' AND kycStatus = ?';
        params.push(kyc);
      }
      
      if (search) {
        query += ' AND (email LIKE ? OR username LIKE ? OR fullName LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      
      query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const users = await db.query(query, params);
      
      // Add portfolio values
      for (const user of users) {
        user.portfolioValue = await db.query(
          'SELECT SUM(valueUSD) as total FROM assets WHERE userId = ?',
          [user.id]
        );
      }
      
      return res.status(200).json(users);
    
    case 'PUT':
      // Update user
      const { userId, updates } = req.body;
      
      const allowedFields = ['kycStatus', 'isAdmin', 'status', 'limits'];
      const updateFields = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.values(updates);
      values.push(userId);
      
      await db.query(
        `UPDATE users SET ${updateFields} WHERE id = ?`,
        values
      );
      
      return res.status(200).json({ success: true });
    
    case 'DELETE':
      // Suspend/ban user
      const { userId: targetId, action } = req.body;
      
      if (action === 'suspend') {
        await db.query(
          'UPDATE users SET status = "Suspended", suspendedAt = NOW() WHERE id = ?',
          [targetId]
        );
      } else if (action === 'ban') {
        await db.query(
          'UPDATE users SET status = "Banned", bannedAt = NOW() WHERE id = ?',
          [targetId]
        );
      }
      
      // Freeze all assets
      await db.query(
        'UPDATE assets SET status = "Frozen" WHERE userId = ?',
        [targetId]
      );
      
      return res.status(200).json({ success: true });
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// KYC MANAGEMENT
async function handleKYC(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      // Get pending KYC applications
      const applications = await db.query(
        `SELECT u.*, k.documents, k.submittedAt 
         FROM users u 
         JOIN kyc_applications k ON u.id = k.userId 
         WHERE u.kycStatus = "Pending" 
         ORDER BY k.submittedAt ASC`
      );
      
      return res.status(200).json(applications);
    
    case 'PUT':
      // Approve/reject KYC
      const { userId, status, reason } = req.body;
      
      if (status === 'Approved') {
        await db.query(
          'UPDATE users SET kycStatus = "Approved", kycApprovedAt = NOW() WHERE id = ?',
          [userId]
        );
        
        // Unlock features
        await unlockUserFeatures(userId);
        
        // Send approval notification
        await sendNotification(userId, {
          type: 'KYC_APPROVED',
          title: 'KYC Approved',
          description: 'Your identity verification has been approved. All features are now unlocked.'
        });
        
      } else if (status === 'Rejected') {
        await db.query(
          'UPDATE users SET kycStatus = "Rejected", kycRejectionReason = ? WHERE id = ?',
          [reason, userId]
        );
        
        // Send rejection notification
        await sendNotification(userId, {
          type: 'KYC_REJECTED',
          title: 'KYC Rejected',
          description: `Your identity verification was rejected. Reason: ${reason}`
        });
      }
      
      return res.status(200).json({ success: true });
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// P2P MANAGEMENT
async function handleP2P(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      // Get disputes and problematic orders
      const disputes = await db.query(
        `SELECT d.*, o.*, 
         b.username as buyerName, s.username as sellerName 
         FROM p2p_disputes d 
         JOIN p2p_orders o ON d.orderId = o.id 
         JOIN users b ON o.buyerId = b.id 
         JOIN users s ON o.sellerId = s.id 
         WHERE d.status = "Open" 
         ORDER BY d.createdAt ASC`
      );
      
      const expiredOrders = await db.query(
        `SELECT o.*, b.username as buyerName, s.username as sellerName 
         FROM p2p_orders o 
         JOIN users b ON o.buyerId = b.id 
         JOIN users s ON o.sellerId = s.id 
         WHERE o.expiresAt < NOW() AND o.status = "Pending Payment"`
      );
      
      return res.status(200).json({ disputes, expiredOrders });
    
    case 'PUT':
      // Resolve dispute
      const { disputeId, resolution, winnerId } = req.body;
      
      const dispute = await db.query(
        'SELECT * FROM p2p_disputes WHERE id = ?',
        [disputeId]
      );
      
      const order = await db.query(
        'SELECT * FROM p2p_orders WHERE id = ?',
        [dispute.orderId]
      );
      
      await db.transaction(async (trx) => {
        // Update dispute
        await trx.query(
          'UPDATE p2p_disputes SET status = "Resolved", resolution = ?, resolvedAt = NOW() WHERE id = ?',
          [resolution, disputeId]
        );
        
        if (winnerId === order.buyerId) {
          // Release crypto to buyer
          await releaseEscrow(order.id, order.buyerId, trx);
          await trx.query(
            'UPDATE p2p_orders SET status = "Completed" WHERE id = ?',
            [order.id]
          );
        } else {
          // Return crypto to seller
          await returnEscrow(order.id, order.sellerId, trx);
          await trx.query(
            'UPDATE p2p_orders SET status = "Cancelled" WHERE id = ?',
            [order.id]
          );
        }
      });
      
      return res.status(200).json({ success: true });
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// LOAN MANAGEMENT
async function handleLoans(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      // Get loan applications
      const loans = await db.query(
        `SELECT l.*, u.username, u.email, 
         a.ticker as collateralAsset, a.valueUSD as collateralValue 
         FROM loan_applications l 
         JOIN users u ON l.userId = u.id 
         LEFT JOIN assets a ON l.collateralAssetId = a.id 
         WHERE l.status IN ("Pending", "Under Review") 
         ORDER BY l.createdAt ASC`
      );
      
      // Add risk scores
      for (const loan of loans) {
        loan.riskScore = await calculateLoanRisk(loan);
        loan.recommendedRate = determineInterestRate(loan.riskScore);
      }
      
      return res.status(200).json(loans);
    
    case 'PUT':
      // Approve/reject loan
      const { loanId, status, interestRate, terms } = req.body;
      
      const loan = await db.query(
        'SELECT * FROM loan_applications WHERE id = ?',
        [loanId]
      );
      
      if (status === 'Approved') {
        await db.transaction(async (trx) => {
          // Update loan status
          await trx.query(
            'UPDATE loan_applications SET status = "Active", interestRate = ?, terms = ?, approvedAt = NOW() WHERE id = ?',
            [interestRate, JSON.stringify(terms), loanId]
          );
          
          // Disburse funds to user's cash balance
          await trx.query(
            'UPDATE assets SET balance = balance + ? WHERE userId = ? AND type = "Cash"',
            [loan.amount, loan.userId]
          );
          
          // Lock collateral
          await trx.query(
            'UPDATE assets SET status = "Collateralized" WHERE id = ?',
            [loan.collateralAssetId]
          );
          
          // Create transaction
          await trx.query(
            'INSERT INTO transactions (userId, description, amountUSD, type, status) VALUES (?, ?, ?, ?, ?)',
            [loan.userId, 'Loan disbursement', loan.amount, 'Deposit', 'Completed']
          );
        });
        
      } else {
        await db.query(
          'UPDATE loan_applications SET status = "Rejected", rejectionReason = ? WHERE id = ?',
          [terms.reason, loanId]
        );
      }
      
      return res.status(200).json({ success: true });
    
    case 'POST':
      // Process loan repayment
      const { loanId: repayLoanId, amount: repayAmount } = req.body;
      
      await processLoanRepayment(repayLoanId, repayAmount);
      
      return res.status(200).json({ success: true });
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// TRADING BOT MANAGEMENT
async function handleTrading(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      // Get all trading bots with performance
      const bots = await db.query(
        `SELECT b.*, u.username, 
         COUNT(t.id) as totalTrades,
         SUM(CASE WHEN t.profit > 0 THEN 1 ELSE 0 END) as profitableTrades,
         SUM(t.profit) as totalProfit,
         AVG(t.profit) as avgProfit 
         FROM trading_bots b 
         JOIN users u ON b.userId = u.id 
         LEFT JOIN bot_trades t ON b.id = t.botId 
         GROUP BY b.id 
         ORDER BY totalProfit DESC`
      );
      
      return res.status(200).json(bots);
    
    case 'PUT':
      // Enable/disable bot
      const { botId, action } = req.body;
      
      if (action === 'stop') {
        await db.query(
          'UPDATE trading_bots SET status = "STOPPED" WHERE id = ?',
          [botId]
        );
      } else if (action === 'start') {
        await db.query(
          'UPDATE trading_bots SET status = "ACTIVE" WHERE id = ?',
          [botId]
        );
      }
      
      return res.status(200).json({ success: true });
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// SYSTEM MONITORING
async function handleMonitoring(req: NextApiRequest, res: NextApiResponse) {
  const monitoring = {
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    },
    
    database: {
      connections: await db.query('SELECT COUNT(*) FROM pg_stat_activity'),
      size: await db.query('SELECT pg_database_size(current_database())'),
      slowQueries: await db.query(
        'SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10'
      )
    },
    
    errors: await db.query(
      'SELECT * FROM error_logs WHERE timestamp > DATE_SUB(NOW(), INTERVAL 24 HOUR) ORDER BY timestamp DESC LIMIT 100'
    ),
    
    performance: {
      avgResponseTime: await calculateAvgResponseTime(),
      requestsPerMinute: await getRequestRate(),
      errorRate: await getErrorRate()
    }
  };
  
  return res.status(200).json(monitoring);
}

// PLATFORM SETTINGS
async function handleSettings(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      // Get all platform settings
      const settings = await db.query('SELECT * FROM platform_settings');
      return res.status(200).json(settings);
    
    case 'PUT':
      // Update settings
      const { key, value } = req.body;
      
      await db.query(
        'INSERT INTO platform_settings (key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
        [key, JSON.stringify(value), JSON.stringify(value)]
      );
      
      // Apply settings immediately
      await applyPlatformSettings(key, value);
      
      return res.status(200).json({ success: true });
    
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Helper functions
async function calculateDefaultRate() {
  const result = await db.query(
    'SELECT (COUNT(CASE WHEN status = "Defaulted" THEN 1 END) * 100.0 / COUNT(*)) as rate FROM loan_applications'
  );
  return result[0].rate;
}

async function calculateBotProfitability() {
  const result = await db.query(
    'SELECT AVG(profit) as avgProfit FROM bot_trades WHERE timestamp > DATE_SUB(NOW(), INTERVAL 30 DAY)'
  );
  return result[0].avgProfit;
}

async function calculateAverageAPY() {
  const result = await db.query(
    'SELECT AVG(JSON_EXTRACT(details, "$.apy")) as avgAPY FROM assets WHERE type = "Staking"'
  );
  return result[0].avgAPY;
}

async function calculateLoanRisk(loan: any) {
  // Complex risk calculation based on multiple factors
  const userHistory = await db.query(
    'SELECT COUNT(*) as count, AVG(CASE WHEN status = "Repaid" THEN 1 ELSE 0 END) as repaymentRate FROM loan_applications WHERE userId = ?',
    [loan.userId]
  );
  
  const portfolioValue = await db.query(
    'SELECT SUM(valueUSD) as total FROM assets WHERE userId = ?',
    [loan.userId]
  );
  
  let riskScore = 50; // Base score
  
  // Adjust based on history
  if (userHistory.count > 0) {
    riskScore += userHistory.repaymentRate * 30;
  }
  
  // Adjust based on loan-to-value ratio
  const ltv = loan.amount / portfolioValue.total;
  if (ltv < 0.3) riskScore += 20;
  else if (ltv < 0.5) riskScore += 10;
  else riskScore -= 10;
  
  // Adjust based on collateral quality
  if (loan.collateralAsset === 'BTC' || loan.collateralAsset === 'ETH') {
    riskScore += 10;
  }
  
  return Math.min(100, Math.max(0, riskScore));
}

function determineInterestRate(riskScore: number) {
  // Lower risk = lower interest rate
  if (riskScore > 80) return 5.5;
  if (riskScore > 60) return 7.5;
  if (riskScore > 40) return 10.0;
  return 15.0;
}