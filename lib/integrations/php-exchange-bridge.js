/**
 * PHP EXCHANGE API BRIDGE
 * ========================
 * Integrates PHP-based metals exchange, staking, and wallet systems
 * with the Kingdom Standard Orchestrator
 */

const axios = require('axios');
const { Pool } = require('pg');

class PhpExchangeBridge {
  constructor() {
    this.phpBaseUrl = process.env.PHP_EXCHANGE_URL || 'http://localhost:8080';
    this.isAvailable = false;
    
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    console.log('🔗 PHP Exchange Bridge initialized');
  }

  async initialize() {
    try {
      const response = await axios.get(`${this.phpBaseUrl}/health.php`, { timeout: 2000 });
      this.isAvailable = true;
      console.log('✅ PHP Exchange connected');
      return { success: true };
    } catch (error) {
      console.log('⚠️ PHP Exchange not available - using database fallback');
      this.isAvailable = false;
      return { success: false, usingFallback: true };
    }
  }

  /**
   * METALS EXCHANGE OPERATIONS
   */
  async getMetalsPrices() {
    if (this.isAvailable) {
      try {
        const response = await axios.get(`${this.phpBaseUrl}/api/metals/prices`);
        return { success: true, data: response.data };
      } catch (error) {
        return this.getMetalsPricesFromDb();
      }
    }
    return this.getMetalsPricesFromDb();
  }

  async getMetalsPricesFromDb() {
    try {
      const result = await this.db.query(`
        SELECT 
          'Gold' as metal, 2050.00 as price, 1.2 as change_percent, 'USD' as currency
        UNION ALL
        SELECT 'Silver', 25.50, -0.5, 'USD'
        UNION ALL
        SELECT 'Platinum', 980.00, 0.8, 'USD'
        UNION ALL
        SELECT 'Palladium', 1450.00, -1.2, 'USD'
      `);
      
      return {
        success: true,
        data: result.rows,
        source: 'database'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async buyMetal(userId, metal, amount, price) {
    const totalCost = amount * price;
    
    try {
      await this.db.query('BEGIN');
      
      const walletResult = await this.db.query(
        `SELECT balance FROM wallets WHERE user_id = $1 AND currency = 'USD'`,
        [userId]
      );
      
      if (walletResult.rows.length === 0 || walletResult.rows[0].balance < totalCost) {
        await this.db.query('ROLLBACK');
        return { success: false, error: 'Insufficient funds' };
      }
      
      await this.db.query(
        `UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND currency = 'USD'`,
        [totalCost, userId]
      );
      
      await this.db.query(
        `INSERT INTO wallets (user_id, currency, balance) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, currency) 
         DO UPDATE SET balance = wallets.balance + $3`,
        [userId, metal, amount]
      );
      
      await this.db.query(
        `INSERT INTO transactions (user_id, type, amount, currency, status, description)
         VALUES ($1, 'buy', $2, $3, 'completed', $4)`,
        [userId, amount, metal, `Bought ${amount} oz of ${metal}`]
      );
      
      await this.db.query('COMMIT');
      
      return {
        success: true,
        transaction: {
          metal,
          amount,
          price,
          totalCost,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      await this.db.query('ROLLBACK');
      return { success: false, error: error.message };
    }
  }

  async sellMetal(userId, metal, amount, price) {
    const totalValue = amount * price;
    
    try {
      await this.db.query('BEGIN');
      
      const metalWalletResult = await this.db.query(
        `SELECT balance FROM wallets WHERE user_id = $1 AND currency = $2`,
        [userId, metal]
      );
      
      if (metalWalletResult.rows.length === 0 || metalWalletResult.rows[0].balance < amount) {
        await this.db.query('ROLLBACK');
        return { success: false, error: 'Insufficient metal balance' };
      }
      
      await this.db.query(
        `UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND currency = $3`,
        [amount, userId, metal]
      );
      
      await this.db.query(
        `UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = 'USD'`,
        [totalValue, userId]
      );
      
      await this.db.query(
        `INSERT INTO transactions (user_id, type, amount, currency, status, description)
         VALUES ($1, 'sell', $2, $3, 'completed', $4)`,
        [userId, amount, metal, `Sold ${amount} oz of ${metal}`]
      );
      
      await this.db.query('COMMIT');
      
      return {
        success: true,
        transaction: {
          metal,
          amount,
          price,
          totalValue,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      await this.db.query('ROLLBACK');
      return { success: false, error: error.message };
    }
  }

  /**
   * STAKING OPERATIONS
   */
  async getStakingPlans() {
    return {
      success: true,
      plans: [
        {
          id: 1,
          name: 'Flexible Staking',
          currency: 'ETH',
          apy: 4.5,
          minAmount: 0.1,
          lockPeriod: 0,
          description: 'Earn rewards with no lock-up period'
        },
        {
          id: 2,
          name: '30-Day Locked',
          currency: 'ETH',
          apy: 6.0,
          minAmount: 0.5,
          lockPeriod: 30,
          description: 'Higher rewards with 30-day commitment'
        },
        {
          id: 3,
          name: '90-Day Locked',
          currency: 'ETH',
          apy: 8.5,
          minAmount: 1.0,
          lockPeriod: 90,
          description: 'Maximum rewards with 90-day commitment'
        },
        {
          id: 4,
          name: 'BTC Staking',
          currency: 'BTC',
          apy: 5.0,
          minAmount: 0.01,
          lockPeriod: 60,
          description: 'Earn passive income on Bitcoin holdings'
        }
      ]
    };
  }

  async stakeAsset(userId, planId, amount) {
    try {
      const plansResult = await this.getStakingPlans();
      const plan = plansResult.plans.find(p => p.id === planId);
      
      if (!plan) {
        return { success: false, error: 'Invalid staking plan' };
      }
      
      if (amount < plan.minAmount) {
        return { success: false, error: `Minimum stake amount is ${plan.minAmount} ${plan.currency}` };
      }
      
      await this.db.query('BEGIN');
      
      const walletResult = await this.db.query(
        `SELECT balance FROM wallets WHERE user_id = $1 AND currency = $2`,
        [userId, plan.currency]
      );
      
      if (walletResult.rows.length === 0 || walletResult.rows[0].balance < amount) {
        await this.db.query('ROLLBACK');
        return { success: false, error: 'Insufficient balance' };
      }
      
      await this.db.query(
        `UPDATE wallets SET balance = balance - $1 WHERE user_id = $2 AND currency = $3`,
        [amount, userId, plan.currency]
      );
      
      const unlockDate = new Date();
      unlockDate.setDate(unlockDate.getDate() + plan.lockPeriod);
      
      const stakingResult = await this.db.query(
        `INSERT INTO staking_positions (user_id, plan_id, currency, amount, apy, lock_period, unlock_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
         RETURNING id`,
        [userId, planId, plan.currency, amount, plan.apy, plan.lockPeriod, unlockDate]
      );
      
      await this.db.query(
        `INSERT INTO transactions (user_id, type, amount, currency, status, description)
         VALUES ($1, 'stake', $2, $3, 'completed', $4)`,
        [userId, amount, plan.currency, `Staked ${amount} ${plan.currency} - ${plan.name}`]
      );
      
      await this.db.query('COMMIT');
      
      return {
        success: true,
        staking: {
          id: stakingResult.rows[0].id,
          plan: plan.name,
          amount,
          currency: plan.currency,
          apy: plan.apy,
          unlockDate: unlockDate.toISOString(),
          estimatedRewards: (amount * plan.apy / 100) * (plan.lockPeriod / 365)
        }
      };
    } catch (error) {
      await this.db.query('ROLLBACK');
      return { success: false, error: error.message };
    }
  }

  async getStakingPositions(userId) {
    try {
      const result = await this.db.query(
        `SELECT id, plan_id, currency, amount, apy, lock_period, unlock_date, status, created_at
         FROM staking_positions 
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );
      
      return {
        success: true,
        positions: result.rows
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async unstakeAsset(userId, stakingId) {
    try {
      await this.db.query('BEGIN');
      
      const stakingResult = await this.db.query(
        `SELECT * FROM staking_positions WHERE id = $1 AND user_id = $2 AND status = 'active'`,
        [stakingId, userId]
      );
      
      if (stakingResult.rows.length === 0) {
        await this.db.query('ROLLBACK');
        return { success: false, error: 'Staking position not found' };
      }
      
      const position = stakingResult.rows[0];
      const now = new Date();
      const unlockDate = new Date(position.unlock_date);
      
      if (now < unlockDate) {
        await this.db.query('ROLLBACK');
        return { 
          success: false, 
          error: 'Staking period not yet complete',
          unlockDate: unlockDate.toISOString()
        };
      }
      
      const daysStaked = (now - new Date(position.created_at)) / (1000 * 60 * 60 * 24);
      const rewards = (position.amount * position.apy / 100) * (daysStaked / 365);
      const totalAmount = position.amount + rewards;
      
      await this.db.query(
        `UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND currency = $3`,
        [totalAmount, userId, position.currency]
      );
      
      await this.db.query(
        `UPDATE staking_positions SET status = 'completed', completed_at = NOW() WHERE id = $1`,
        [stakingId]
      );
      
      await this.db.query(
        `INSERT INTO transactions (user_id, type, amount, currency, status, description)
         VALUES ($1, 'unstake', $2, $3, 'completed', $4)`,
        [userId, totalAmount, position.currency, `Unstaked ${position.amount} ${position.currency} + ${rewards.toFixed(6)} rewards`]
      );
      
      await this.db.query('COMMIT');
      
      return {
        success: true,
        unstaking: {
          originalAmount: position.amount,
          rewards: rewards.toFixed(6),
          totalAmount: totalAmount.toFixed(6),
          currency: position.currency,
          daysStaked: Math.floor(daysStaked)
        }
      };
    } catch (error) {
      await this.db.query('ROLLBACK');
      return { success: false, error: error.message };
    }
  }

  /**
   * WALLET OPERATIONS (PHP system compatibility)
   */
  async getPhpWallets(userId) {
    try {
      const result = await this.db.query(
        `SELECT id, currency, balance, created_at FROM wallets WHERE user_id = $1`,
        [userId]
      );
      
      return {
        success: true,
        wallets: result.rows
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async shutdown() {
    await this.db.end();
    console.log('🛑 PHP Exchange Bridge shutdown');
  }
}

module.exports = PhpExchangeBridge;
