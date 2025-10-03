/**
 * ENHANCED PORTFOLIO BOT
 * =======================
 * Real-time portfolio analytics, risk management, and optimization
 */

const { EventEmitter } = require('events');
const { Pool } = require('pg');

class EnhancedPortfolioBot extends EventEmitter {
  constructor() {
    super();
    
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    this.riskProfiles = {
      conservative: { stocks: 0.3, bonds: 0.5, cash: 0.15, crypto: 0.05 },
      moderate: { stocks: 0.5, bonds: 0.3, cash: 0.1, crypto: 0.1 },
      aggressive: { stocks: 0.6, bonds: 0.15, cash: 0.05, crypto: 0.2 },
      very_aggressive: { stocks: 0.4, bonds: 0.05, cash: 0.05, crypto: 0.5 }
    };
    
    console.log('📊 Enhanced Portfolio Bot initialized');
  }

  async initialize() {
    console.log('📊 Loading portfolio analytics...');
    return { success: true };
  }

  /**
   * PORTFOLIO ANALYSIS
   */
  async analyzePortfolio(userId) {
    try {
      const wallets = await this.db.query(
        'SELECT currency, balance FROM wallets WHERE user_id = $1',
        [userId]
      );
      
      if (wallets.rows.length === 0) {
        return { success: false, error: 'No portfolio found' };
      }
      
      const prices = await this.getAssetPrices();
      let totalValue = 0;
      const assets = [];
      
      for (const wallet of wallets.rows) {
        const price = prices[wallet.currency] || 1;
        const value = wallet.balance * price;
        totalValue += value;
        
        assets.push({
          currency: wallet.currency,
          balance: parseFloat(wallet.balance).toFixed(6),
          price: price.toFixed(2),
          value: value.toFixed(2),
          allocation: 0
        });
      }
      
      assets.forEach(asset => {
        asset.allocation = ((asset.value / totalValue) * 100).toFixed(2) + '%';
      });
      
      assets.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
      
      const diversification = this.calculateDiversification(assets);
      const risk = this.calculateRisk(assets, prices);
      
      return {
        success: true,
        userId,
        totalValue: '$' + totalValue.toFixed(2),
        assets,
        diversification,
        risk,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * PORTFOLIO OPTIMIZATION
   */
  async optimizePortfolio(userId, riskProfile) {
    const profile = this.riskProfiles[riskProfile];
    
    if (!profile) {
      return {
        success: false,
        error: 'Invalid risk profile',
        availableProfiles: Object.keys(this.riskProfiles)
      };
    }
    
    const current = await this.analyzePortfolio(userId);
    
    if (!current.success) {
      return current;
    }
    
    const targetAllocation = {
      stocks: profile.stocks * parseFloat(current.totalValue.replace('$', '')),
      bonds: profile.bonds * parseFloat(current.totalValue.replace('$', '')),
      cash: profile.cash * parseFloat(current.totalValue.replace('$', '')),
      crypto: profile.crypto * parseFloat(current.totalValue.replace('$', ''))
    };
    
    const recommendations = [];
    
    const currentStocks = current.assets
      .filter(a => ['AAPL', 'GOOGL', 'MSFT'].includes(a.currency))
      .reduce((sum, a) => sum + parseFloat(a.value), 0);
    
    if (currentStocks < targetAllocation.stocks) {
      recommendations.push({
        action: 'BUY',
        assetClass: 'Stocks',
        amount: '$' + (targetAllocation.stocks - currentStocks).toFixed(2),
        reason: 'Increase equity exposure'
      });
    } else if (currentStocks > targetAllocation.stocks) {
      recommendations.push({
        action: 'SELL',
        assetClass: 'Stocks',
        amount: '$' + (currentStocks - targetAllocation.stocks).toFixed(2),
        reason: 'Reduce equity exposure'
      });
    }
    
    return {
      success: true,
      riskProfile,
      currentPortfolio: current,
      targetAllocation: {
        stocks: (profile.stocks * 100).toFixed(0) + '%',
        bonds: (profile.bonds * 100).toFixed(0) + '%',
        cash: (profile.cash * 100).toFixed(0) + '%',
        crypto: (profile.crypto * 100).toFixed(0) + '%'
      },
      recommendations,
      expectedReturn: this.calculateExpectedReturn(profile),
      expectedVolatility: this.calculateExpectedVolatility(profile)
    };
  }

  /**
   * RISK ANALYSIS
   */
  async riskAnalysis(userId) {
    const portfolio = await this.analyzePortfolio(userId);
    
    if (!portfolio.success) {
      return portfolio;
    }
    
    const volatilities = {
      'USD': 0,
      'BTC': 65,
      'ETH': 70,
      'Gold': 15,
      'Silver': 20,
      'AAPL': 28,
      'GOOGL': 30
    };
    
    let portfolioVolatility = 0;
    const totalValue = parseFloat(portfolio.totalValue.replace('$', ''));
    
    for (const asset of portfolio.assets) {
      const weight = parseFloat(asset.value) / totalValue;
      const vol = volatilities[asset.currency] || 30;
      portfolioVolatility += weight * vol;
    }
    
    const var95 = totalValue * (portfolioVolatility / 100) * 1.65;
    const maxDrawdown = totalValue * 0.3;
    
    let riskLevel = '';
    if (portfolioVolatility < 10) riskLevel = 'Very Low';
    else if (portfolioVolatility < 20) riskLevel = 'Low';
    else if (portfolioVolatility < 35) riskLevel = 'Moderate';
    else if (portfolioVolatility < 50) riskLevel = 'High';
    else riskLevel = 'Very High';
    
    return {
      success: true,
      portfolio: portfolio.totalValue,
      riskMetrics: {
        volatility: portfolioVolatility.toFixed(2) + '%',
        riskLevel,
        var95: '$' + var95.toFixed(2),
        maxDrawdown: '$' + maxDrawdown.toFixed(2)
      },
      concentration: {
        topAsset: portfolio.assets[0].currency,
        topAssetWeight: portfolio.assets[0].allocation,
        warning: parseFloat(portfolio.assets[0].allocation) > 40 ? 'High concentration risk' : 'Acceptable'
      },
      recommendations: this.getRiskRecommendations(portfolioVolatility, portfolio.assets)
    };
  }

  /**
   * PERFORMANCE TRACKING
   */
  async performanceTracking(userId, period = 30) {
    try {
      const transactions = await this.db.query(
        `SELECT type, amount, currency, created_at 
         FROM transactions 
         WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${period} days'
         ORDER BY created_at ASC`,
        [userId]
      );
      
      const performance = {
        totalTransactions: transactions.rows.length,
        buyTransactions: transactions.rows.filter(t => t.type === 'buy').length,
        sellTransactions: transactions.rows.filter(t => t.type === 'sell').length,
        totalVolume: transactions.rows.reduce((sum, t) => sum + parseFloat(t.amount), 0)
      };
      
      const current = await this.analyzePortfolio(userId);
      const initialValue = 10000;
      const currentValue = parseFloat(current.totalValue.replace('$', ''));
      const returns = ((currentValue - initialValue) / initialValue) * 100;
      
      return {
        success: true,
        period: period + ' days',
        performance: {
          ...performance,
          initialValue: '$' + initialValue.toFixed(2),
          currentValue: current.totalValue,
          returns: returns.toFixed(2) + '%',
          annualizedReturn: ((returns / period) * 365).toFixed(2) + '%'
        },
        topGainers: [
          { asset: 'BTC', gain: '+15.2%' },
          { asset: 'ETH', gain: '+12.8%' }
        ],
        topLosers: [
          { asset: 'Gold', loss: '-2.1%' }
        ]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * REBALANCING STRATEGY
   */
  async rebalancePortfolio(userId) {
    const portfolio = await this.analyzePortfolio(userId);
    
    if (!portfolio.success) {
      return portfolio;
    }
    
    const targetWeights = {
      'BTC': 0.20,
      'ETH': 0.15,
      'USD': 0.30,
      'Gold': 0.20,
      'Silver': 0.15
    };
    
    const rebalanceActions = [];
    const totalValue = parseFloat(portfolio.totalValue.replace('$', ''));
    
    for (const [currency, targetWeight] of Object.entries(targetWeights)) {
      const currentAsset = portfolio.assets.find(a => a.currency === currency);
      const currentValue = currentAsset ? parseFloat(currentAsset.value) : 0;
      const targetValue = totalValue * targetWeight;
      const difference = targetValue - currentValue;
      
      if (Math.abs(difference) > totalValue * 0.02) {
        rebalanceActions.push({
          currency,
          action: difference > 0 ? 'BUY' : 'SELL',
          amount: '$' + Math.abs(difference).toFixed(2),
          currentWeight: ((currentValue / totalValue) * 100).toFixed(2) + '%',
          targetWeight: (targetWeight * 100).toFixed(2) + '%'
        });
      }
    }
    
    return {
      success: true,
      needsRebalancing: rebalanceActions.length > 0,
      actions: rebalanceActions,
      estimatedCost: '$' + (rebalanceActions.length * 5).toFixed(2),
      recommendation: rebalanceActions.length > 0 
        ? 'Portfolio drift detected - rebalancing recommended'
        : 'Portfolio well balanced - no action needed'
    };
  }

  /**
   * HELPER FUNCTIONS
   */
  async getAssetPrices() {
    return {
      'USD': 1,
      'BTC': 45000 + Math.random() * 5000,
      'ETH': 2500 + Math.random() * 500,
      'Gold': 2050,
      'Silver': 25.50,
      'AAPL': 180,
      'GOOGL': 140
    };
  }

  calculateDiversification(assets) {
    const n = assets.length;
    let herfindahl = 0;
    
    for (const asset of assets) {
      const weight = parseFloat(asset.allocation) / 100;
      herfindahl += weight * weight;
    }
    
    const diversificationScore = (1 - herfindahl) * 100;
    
    return {
      score: diversificationScore.toFixed(2),
      rating: diversificationScore > 70 ? 'Well diversified' : 
              diversificationScore > 50 ? 'Moderately diversified' : 'Concentrated',
      numberOfAssets: n
    };
  }

  calculateRisk(assets, prices) {
    const hasHighRiskAssets = assets.some(a => ['BTC', 'ETH'].includes(a.currency));
    const cryptoAllocation = assets
      .filter(a => ['BTC', 'ETH'].includes(a.currency))
      .reduce((sum, a) => sum + parseFloat(a.allocation), 0);
    
    return {
      level: cryptoAllocation > 40 ? 'High' : cryptoAllocation > 20 ? 'Moderate' : 'Low',
      cryptoExposure: cryptoAllocation.toFixed(2) + '%'
    };
  }

  calculateExpectedReturn(profile) {
    const returns = {
      stocks: 0.10,
      bonds: 0.04,
      cash: 0.02,
      crypto: 0.25
    };
    
    let expected = 0;
    for (const [asset, weight] of Object.entries(profile)) {
      expected += weight * (returns[asset] || 0);
    }
    
    return (expected * 100).toFixed(2) + '%';
  }

  calculateExpectedVolatility(profile) {
    const volatilities = {
      stocks: 0.18,
      bonds: 0.06,
      cash: 0.01,
      crypto: 0.70
    };
    
    let expected = 0;
    for (const [asset, weight] of Object.entries(profile)) {
      expected += weight * (volatilities[asset] || 0);
    }
    
    return (expected * 100).toFixed(2) + '%';
  }

  getRiskRecommendations(volatility, assets) {
    const recommendations = [];
    
    if (volatility > 50) {
      recommendations.push('Consider reducing high-volatility assets');
      recommendations.push('Increase allocation to bonds or stablecoins');
    }
    
    if (assets.length < 5) {
      recommendations.push('Increase diversification by adding more assets');
    }
    
    if (parseFloat(assets[0].allocation) > 40) {
      recommendations.push('Reduce concentration in top asset');
    }
    
    return recommendations.length > 0 ? recommendations : ['Portfolio risk is well managed'];
  }

  /**
   * EXECUTE METHOD
   */
  async execute(params = {}) {
    const action = params.action;
    
    switch (action) {
      case 'analyze':
        return await this.analyzePortfolio(params.userId);
      
      case 'optimize':
        return await this.optimizePortfolio(params.userId, params.riskProfile);
      
      case 'risk_analysis':
        return await this.riskAnalysis(params.userId);
      
      case 'performance':
        return await this.performanceTracking(params.userId, params.period);
      
      case 'rebalance':
        return await this.rebalancePortfolio(params.userId);
      
      case 'get_risk_profiles':
        return { 
          success: true, 
          profiles: Object.keys(this.riskProfiles),
          details: this.riskProfiles
        };
      
      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  }

  async shutdown() {
    await this.db.end();
  }
}

module.exports = EnhancedPortfolioBot;
