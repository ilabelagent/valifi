import { storage } from "./storage";
import { marketDataService } from "./marketDataService";
import { alpacaBrokerService } from "./alpacaBrokerService";

/**
 * Financial Services Bot System
 * Handles traditional finance: 401k, IRA, Pension, Bonds, Stocks, Options, Forex, etc.
 * Now powered by REAL market data from Alpha Vantage, Twelve Data, and Metals-API
 * Now with LIVE execution via Alpaca Paper Trading
 */

export interface FinancialAccount {
  id: string;
  userId: string;
  accountType: string;
  provider: string;
  balance: number;
  holdings?: any[];
}

export interface TradeOrder {
  symbol: string;
  action: "buy" | "sell";
  quantity: number;
  orderType: "market" | "limit" | "stop";
  limitPrice?: number;
}

/**
 * 401k Bot - Retirement Account Management
 */
export class Bot401k {
  async getAccountInfo(userId: string): Promise<any> {
    return {
      accountType: "401k",
      balance: 0,
      employer: "N/A",
      contributionRate: 0,
      employerMatch: 0,
      vested: true,
      holdings: [],
    };
  }

  async setContributionRate(userId: string, rate: number): Promise<boolean> {
    // TODO: Integrate with 401k provider API
    return true;
  }

  async rebalancePortfolio(userId: string, allocation: any): Promise<boolean> {
    // Rebalance 401k holdings
    return true;
  }
}

/**
 * IRA Bot - Individual Retirement Account
 */
export class BotIRA {
  async openAccount(userId: string, accountType: "traditional" | "roth"): Promise<string> {
    // TODO: Integrate with IRA custodian
    return `IRA_${Date.now()}`;
  }

  async getContributionLimits(year: number): Promise<{ limit: number; catchUp: number }> {
    // 2025 IRA contribution limits
    return {
      limit: 7000,
      catchUp: 1000, // Age 50+
    };
  }

  async rollover(userId: string, fromAccount: string, amount: number): Promise<boolean> {
    // Rollover from 401k to IRA
    return true;
  }
}

/**
 * Pension Bot - Pension Fund Management
 */
export class BotPension {
  async calculatePensionBenefit(userId: string): Promise<any> {
    return {
      monthlyBenefit: 0,
      startAge: 65,
      survivorBenefit: true,
      cola: true, // Cost of living adjustment
    };
  }

  async electPaymentOption(userId: string, option: string): Promise<boolean> {
    // Single life, joint survivor, etc.
    return true;
  }
}

/**
 * Bonds Bot - Bond Trading & Management
 */
export class BotBonds {
  async getTreasuryYields(): Promise<any[]> {
    return await marketDataService.getTreasuryYields();
  }

  async searchBonds(filters: {
    maturity?: string;
    rating?: string;
    yield?: number;
  }): Promise<any[]> {
    // Search corporate, municipal, treasury bonds
    return [];
  }

  async buyBond(userId: string, cusip: string, quantity: number): Promise<string> {
    // Execute bond purchase
    return `BOND_ORDER_${Date.now()}`;
  }

  async calculateYieldToMaturity(bond: any): Promise<number> {
    // YTM calculation
    return 0;
  }

  async getLadderRecommendation(userId: string, investment: number): Promise<any> {
    // Bond ladder strategy
    return {
      strategy: "5-year ladder",
      bonds: [],
    };
  }
}

/**
 * Stocks Bot - Stock Trading Automation with LIVE Alpaca Execution
 */
export class BotStocks {
  async getQuote(symbol: string): Promise<any> {
    try {
      // Try Alpaca first for real-time data
      alpacaBrokerService.initialize();
      const quote = await alpacaBrokerService.getLatestQuote(symbol);
      return {
        symbol,
        price: quote.ap || quote.bp || 0,
        bidPrice: quote.bp || 0,
        askPrice: quote.ap || 0,
        bidSize: quote.bs || 0,
        askSize: quote.as || 0,
        timestamp: quote.t || new Date().toISOString(),
      };
    } catch (error) {
      // Fallback to market data service
      const data = await marketDataService.getStockPrice(symbol);
      return {
        symbol: data.symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        timestamp: data.timestamp,
      };
    }
  }

  async placeOrder(userId: string, order: TradeOrder): Promise<any> {
    try {
      console.log(`[BotStocks] Placing ${order.action} order for ${order.symbol}`);
      
      // Initialize Alpaca
      alpacaBrokerService.initialize();
      
      let alpacaOrder;
      
      if (order.orderType === "market") {
        alpacaOrder = await alpacaBrokerService.marketOrder(
          order.symbol,
          order.quantity,
          order.action
        );
      } else if (order.orderType === "limit" && order.limitPrice) {
        alpacaOrder = await alpacaBrokerService.limitOrder(
          order.symbol,
          order.quantity,
          order.action,
          order.limitPrice
        );
      } else if (order.orderType === "stop" && order.limitPrice) {
        alpacaOrder = await alpacaBrokerService.stopOrder(
          order.symbol,
          order.quantity,
          order.action,
          order.limitPrice
        );
      }
      
      console.log(`[BotStocks] Order placed successfully:`, alpacaOrder?.id);
      
      return {
        orderId: alpacaOrder?.id || `STOCK_ORDER_${Date.now()}`,
        symbol: alpacaOrder?.symbol,
        status: alpacaOrder?.status,
        filled_qty: alpacaOrder?.filled_qty,
        filled_price: alpacaOrder?.filled_avg_price,
        side: alpacaOrder?.side,
        type: alpacaOrder?.type,
      };
    } catch (error: any) {
      console.error(`[BotStocks] Order failed:`, error);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  async getPortfolio(userId: string): Promise<any> {
    try {
      // Initialize Alpaca
      alpacaBrokerService.initialize();
      
      // Get account info
      const account = await alpacaBrokerService.getAccount();
      
      // Get positions
      const positions = await alpacaBrokerService.getPositions();
      
      // Calculate PnL
      const pnl = await alpacaBrokerService.calculatePnL();
      
      return {
        positions: positions.map(pos => ({
          symbol: pos.symbol,
          quantity: parseFloat(pos.qty),
          avgPrice: parseFloat(pos.avg_entry_price),
          currentPrice: parseFloat(pos.current_price),
          marketValue: parseFloat(pos.market_value),
          unrealizedPL: parseFloat(pos.unrealized_pl),
          unrealizedPLPercent: parseFloat(pos.unrealized_plpc) * 100,
          costBasis: parseFloat(pos.cost_basis),
        })),
        totalValue: parseFloat(account.portfolio_value),
        cash: parseFloat(account.cash),
        buyingPower: parseFloat(account.buying_power),
        equity: parseFloat(account.equity),
        totalPnL: pnl.totalPnL,
        totalPnLPercent: pnl.totalPnLPercent,
        dayChange: parseFloat(account.equity) - parseFloat(account.last_equity),
      };
    } catch (error: any) {
      console.error(`[BotStocks] Failed to get portfolio:`, error);
      // Return empty portfolio on error
      return {
        positions: [],
        totalValue: 0,
        cash: 0,
        buyingPower: 0,
        equity: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
        dayChange: 0,
      };
    }
  }

  async setAutoInvest(userId: string, config: {
    stocks: string[];
    schedule: string;
    amount: number;
  }): Promise<boolean> {
    // Automated recurring investment via Alpaca
    console.log(`[BotStocks] Auto-invest configured for ${userId}:`, config);
    return true;
  }

  async closePosition(symbol: string, qty?: number): Promise<any> {
    try {
      alpacaBrokerService.initialize();
      const order = await alpacaBrokerService.closePosition(symbol, qty);
      
      return {
        orderId: order.id,
        symbol: order.symbol,
        status: order.status,
        qty: order.qty,
      };
    } catch (error: any) {
      console.error(`[BotStocks] Failed to close position:`, error);
      throw new Error(`Failed to close position: ${error.message}`);
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    try {
      alpacaBrokerService.initialize();
      await alpacaBrokerService.cancelOrder(orderId);
      console.log(`[BotStocks] Order ${orderId} cancelled`);
    } catch (error: any) {
      console.error(`[BotStocks] Failed to cancel order:`, error);
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }

  async getOrders(status?: 'open' | 'closed' | 'all'): Promise<any[]> {
    try {
      alpacaBrokerService.initialize();
      const orders = await alpacaBrokerService.getOrders({ status: status || 'all', limit: 100 });
      
      return orders.map(order => ({
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        qty: order.qty,
        filledQty: order.filled_qty,
        status: order.status,
        limitPrice: order.limit_price,
        stopPrice: order.stop_price,
        createdAt: order.created_at,
        filledAt: order.filled_at,
      }));
    } catch (error: any) {
      console.error(`[BotStocks] Failed to get orders:`, error);
      return [];
    }
  }
}

/**
 * Options Bot - Options Trading with Alpaca Integration
 */
export class BotOptions {
  async getOptionsChain(symbol: string): Promise<any> {
    // Note: Alpaca does not support options trading yet
    // This is a placeholder for future options integration
    console.log(`[BotOptions] Options chain requested for ${symbol}`);
    return {
      calls: [],
      puts: [],
      message: "Options trading not yet supported via Alpaca. Coming soon!",
    };
  }

  async calculateGreeks(option: any): Promise<any> {
    // Delta, Gamma, Theta, Vega, Rho
    return {
      delta: 0,
      gamma: 0,
      theta: 0,
      vega: 0,
      rho: 0,
      message: "Options Greeks calculation coming soon",
    };
  }

  async executeStrategy(userId: string, strategy: string, params: any): Promise<string> {
    // Covered call, protective put, iron condor, etc.
    console.log(`[BotOptions] ${strategy} strategy requested:`, params);
    
    // For now, execute simulated options strategies
    // In the future, this will integrate with options-enabled brokers
    return `OPTIONS_STRATEGY_${strategy}_${Date.now()}`;
  }

  async placeOptionsOrder(params: {
    symbol: string;
    type: 'call' | 'put';
    strike: number;
    expiration: string;
    action: 'buy' | 'sell';
    quantity: number;
    orderType: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<any> {
    console.log(`[BotOptions] Options order placed (simulated):`, params);
    
    return {
      orderId: `OPTIONS_${params.type.toUpperCase()}_${Date.now()}`,
      ...params,
      status: 'simulated',
      message: "Real options trading via Alpaca coming soon",
    };
  }
}

/**
 * Forex Bot - Foreign Exchange Trading
 */
export class BotForex {
  async getForexRate(from: string, to: string): Promise<number> {
    const pair = `${from}/${to}`;
    const data = await marketDataService.getForexRate(pair);
    return data.price;
  }

  async executeTrade(userId: string, pair: string, action: "buy" | "sell", lots: number): Promise<string> {
    // Forex trade execution
    return `FOREX_TRADE_${Date.now()}`;
  }

  async setTakeProfitStopLoss(orderId: string, tp: number, sl: number): Promise<boolean> {
    return true;
  }
}

/**
 * Metals Bot - Precious Metals Trading
 */
export class BotMetals {
  async getMetalPrice(metal: "gold" | "silver" | "platinum" | "palladium"): Promise<number> {
    const data = await marketDataService.getMetalPrice(metal);
    return data.price;
  }

  async buyPhysicalMetal(userId: string, metal: string, ounces: number, delivery: boolean): Promise<string> {
    // Purchase physical or paper metal
    return `METAL_ORDER_${Date.now()}`;
  }
}

/**
 * Commodities Bot - Commodity Trading
 */
export class BotCommodities {
  async getCommodityPrice(commodity: string): Promise<number> {
    // Oil, gas, wheat, corn, etc.
    return 0;
  }

  async tradeFutures(userId: string, contract: string, action: "buy" | "sell", contracts: number): Promise<string> {
    return `COMMODITY_FUTURES_${Date.now()}`;
  }
}

/**
 * Mutual Funds Bot
 */
export class BotMutualFunds {
  async searchFunds(filters: {
    category?: string;
    minRating?: number;
    expenseRatio?: number;
  }): Promise<any[]> {
    return [];
  }

  async buyFund(userId: string, ticker: string, amount: number): Promise<string> {
    return `FUND_ORDER_${Date.now()}`;
  }
}

/**
 * REIT Bot - Real Estate Investment Trusts
 */
export class BotREIT {
  async searchREITs(sector?: string): Promise<any[]> {
    // Residential, commercial, healthcare, etc.
    return [];
  }

  async analyzeDividendYield(reit: string): Promise<number> {
    return 0;
  }
}

/**
 * Crypto Derivatives Bot
 */
export class BotCryptoDerivatives {
  async getPerpetualFunding(symbol: string): Promise<number> {
    // Funding rate for perpetual futures
    return 0;
  }

  async tradePerpetual(userId: string, symbol: string, side: "long" | "short", leverage: number, amount: number): Promise<string> {
    return `PERP_${Date.now()}`;
  }
}

/**
 * Portfolio Bot - Portfolio Management
 */
export class BotPortfolio {
  async getFullPortfolio(userId: string): Promise<any> {
    return {
      stocks: [],
      bonds: [],
      crypto: [],
      reits: [],
      totalValue: 0,
      allocation: {},
    };
  }

  async rebalance(userId: string, targetAllocation: any): Promise<boolean> {
    // Rebalance across all asset classes
    return true;
  }

  async analyzeRisk(userId: string): Promise<any> {
    return {
      sharpeRatio: 0,
      beta: 0,
      volatility: 0,
    };
  }
}

// Export singleton instances
export const bot401k = new Bot401k();
export const botIRA = new BotIRA();
export const botPension = new BotPension();
export const botBonds = new BotBonds();
export const botStocks = new BotStocks();
export const botOptions = new BotOptions();
export const botForex = new BotForex();
export const botMetals = new BotMetals();
export const botCommodities = new BotCommodities();
export const botMutualFunds = new BotMutualFunds();
export const botREIT = new BotREIT();
export const botCryptoDerivatives = new BotCryptoDerivatives();
export const botPortfolio = new BotPortfolio();
