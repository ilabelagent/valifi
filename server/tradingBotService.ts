import type { TradingBot, BotExecution, InsertBotExecution } from "@shared/schema";
import { storage } from "./storage";

/**
 * Active Trading Bot Service
 * Implements: Grid Trading, DCA, Arbitrage, Scalping, Market Making, MEV
 * Based on Kingdom Standard Amster Bot specifications
 */

export interface BotStrategy {
  name: string;
  execute(bot: TradingBot, marketData: MarketData): Promise<ExecutionResult>;
  validateConfig(config: any): boolean;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  bidPrice: number;
  askPrice: number;
  orderbook?: {
    bids: [number, number][];
    asks: [number, number][];
  };
  indicators?: {
    ema_fast?: number;
    ema_slow?: number;
    rsi?: number;
    vwap?: number;
  };
}

export interface ExecutionResult {
  action: "buy" | "sell" | "hold";
  amount: number;
  price: number;
  reason: string;
  metadata?: any;
}

/**
 * Grid Trading Strategy
 * Places buy/sell orders at intervals around current price
 */
class GridTradingStrategy implements BotStrategy {
  name = "grid";

  validateConfig(config: any): boolean {
    return (
      config.gridLevels &&
      config.priceRange &&
      config.orderSize &&
      config.gridSpacing
    );
  }

  async execute(bot: TradingBot, marketData: MarketData): Promise<ExecutionResult> {
    const config = bot.config as any;
    const { gridSpacing, orderSize, priceRange } = config;
    const currentPrice = marketData.price;

    // Use static grid anchors (set on bot creation, stored in config)
    // If not set, initialize them now and persist to storage
    let shouldPersistConfig = false;
    
    if (!config.gridAnchorPrice) {
      config.gridAnchorPrice = currentPrice;
      config.gridLowerBound = currentPrice * (1 - priceRange / 100);
      config.gridUpperBound = currentPrice * (1 + priceRange / 100);
      shouldPersistConfig = true;
    }

    const { gridAnchorPrice, gridLowerBound, gridUpperBound } = config;
    const lastTriggeredLevel = config.lastTriggeredGridLevel || null;
    
    // Check if price hit a NEW grid level (different from last triggered)
    const gridLevelHit = this.checkGridLevel(currentPrice, gridSpacing, gridLowerBound);

    if (gridLevelHit !== null && gridLevelHit !== lastTriggeredLevel) {
      // Determine action based on price relative to anchor
      // Buy below anchor, sell above anchor
      const action = currentPrice < gridAnchorPrice ? "buy" : "sell";
      
      // Update last triggered level to prevent re-firing and persist
      config.lastTriggeredGridLevel = gridLevelHit;
      shouldPersistConfig = true;
      
      // Persist config changes to storage so they survive bot reload
      if (shouldPersistConfig) {
        await storage.updateBot(bot.id, { config });
      }
      
      return {
        action,
        amount: orderSize,
        price: currentPrice,
        reason: `Grid level ${gridLevelHit} hit at ${currentPrice.toFixed(2)}, executing ${action}`,
        metadata: { 
          gridLevel: gridLevelHit, 
          range: priceRange,
          spacing: gridSpacing,
          anchorPrice: gridAnchorPrice,
          lowerBound: gridLowerBound,
          upperBound: gridUpperBound,
          lastTriggeredLevel,
        },
      };
    }

    // Persist initial config if needed
    if (shouldPersistConfig) {
      await storage.updateBot(bot.id, { config });
    }

    return {
      action: "hold",
      amount: 0,
      price: currentPrice,
      reason: gridLevelHit === lastTriggeredLevel 
        ? `Grid level ${gridLevelHit} already triggered` 
        : "No grid level triggered",
    };
  }

  /**
   * Check if price is at a grid boundary (within tolerance)
   * Returns grid level number if at boundary, null otherwise
   */
  private checkGridLevel(price: number, spacing: number, lowerBound: number): number | null {
    const priceFromLower = price - lowerBound;
    const remainder = priceFromLower % spacing;
    const tolerance = spacing * 0.01; // 1% tolerance to account for price fluctuations
    
    // Check if price is close to a grid level
    if (remainder < tolerance || remainder > spacing - tolerance) {
      const gridLevel = Math.round(priceFromLower / spacing);
      return gridLevel;
    }
    
    return null;
  }
}

/**
 * DCA (Dollar-Cost Averaging) Strategy
 * Accumulates positions at regular intervals
 */
class DCAStrategy implements BotStrategy {
  name = "dca";

  validateConfig(config: any): boolean {
    return config.buyAmount && config.intervalHours;
  }

  async execute(bot: TradingBot, marketData: MarketData): Promise<ExecutionResult> {
    const config = bot.config as any;
    const { buyAmount, intervalHours } = config;

    // Check if interval has passed since last execution
    const lastExecution = bot.lastExecutionAt?.getTime() || 0;
    const intervalMs = intervalHours * 60 * 60 * 1000;
    const timeSinceLastExecution = Date.now() - lastExecution;

    if (timeSinceLastExecution >= intervalMs) {
      return {
        action: "buy",
        amount: buyAmount,
        price: marketData.price,
        reason: `DCA interval reached (${intervalHours}h), buying ${buyAmount}`,
        metadata: { interval: intervalHours, timeSinceLastExecution },
      };
    }

    return {
      action: "hold",
      amount: 0,
      price: marketData.price,
      reason: `Waiting for DCA interval (${Math.floor((intervalMs - timeSinceLastExecution) / 60000)}min remaining)`,
    };
  }
}

/**
 * Scalping Strategy  
 * Fast in/out trades based on EMA crossover and RSI
 */
class ScalpingStrategy implements BotStrategy {
  name = "scalping";

  validateConfig(config: any): boolean {
    return (
      config.orderSize &&
      config.stopLossPct &&
      config.takeProfitPct &&
      config.maxSlippage
    );
  }

  async execute(bot: TradingBot, marketData: MarketData): Promise<ExecutionResult> {
    const config = bot.config as any;
    const { orderSize, stopLossPct, takeProfitPct } = config;
    const { ema_fast = 0, ema_slow = 0, rsi = 50 } = marketData.indicators || {};

    // EMA crossover + RSI momentum
    if (ema_fast > ema_slow && rsi < 70) {
      return {
        action: "buy",
        amount: orderSize,
        price: marketData.price,
        reason: `Scalp entry: EMA fast (${ema_fast.toFixed(2)}) > slow (${ema_slow.toFixed(2)}), RSI: ${rsi}`,
        metadata: {
          stopLoss: marketData.price * (1 - stopLossPct / 100),
          takeProfit: marketData.price * (1 + takeProfitPct / 100),
          indicators: { ema_fast, ema_slow, rsi },
        },
      };
    }

    if (ema_fast < ema_slow && rsi > 30) {
      return {
        action: "sell",
        amount: orderSize,
        price: marketData.price,
        reason: `Scalp exit: EMA fast (${ema_fast.toFixed(2)}) < slow (${ema_slow.toFixed(2)}), RSI: ${rsi}`,
        metadata: { indicators: { ema_fast, ema_slow, rsi } },
      };
    }

    return {
      action: "hold",
      amount: 0,
      price: marketData.price,
      reason: "No scalp signal",
      metadata: { indicators: { ema_fast, ema_slow, rsi } },
    };
  }
}

/**
 * Arbitrage Strategy
 * Finds price differences across exchanges
 */
class ArbitrageStrategy implements BotStrategy {
  name = "arbitrage";

  validateConfig(config: any): boolean {
    return config.minSpreadPct && config.exchanges && config.tradingPair;
  }

  async execute(bot: TradingBot, marketData: MarketData): Promise<ExecutionResult> {
    const config = bot.config as any;
    const { minSpreadPct } = config;

    // Simulate multi-exchange price fetch (in production, fetch real prices)
    const exchange1Price = marketData.bidPrice;
    const exchange2Price = marketData.askPrice;
    const spread = ((exchange2Price - exchange1Price) / exchange1Price) * 100;

    if (spread > minSpreadPct) {
      // Buy on cheaper exchange, sell on expensive one
      return {
        action: "buy",
        amount: config.orderSize || 0.001,
        price: exchange1Price,
        reason: `Arbitrage opportunity: ${spread.toFixed(2)}% spread detected`,
        metadata: {
          buyExchange: "exchange1",
          sellExchange: "exchange2",
          buyPrice: exchange1Price,
          sellPrice: exchange2Price,
          spread,
        },
      };
    }

    return {
      action: "hold",
      amount: 0,
      price: marketData.price,
      reason: `Spread ${spread.toFixed(2)}% below threshold ${minSpreadPct}%`,
    };
  }
}

/**
 * Market Making Strategy
 * Provides liquidity by placing simultaneous buy/sell orders
 */
class MarketMakingStrategy implements BotStrategy {
  name = "market_making";

  validateConfig(config: any): boolean {
    return config.spreadPct && config.orderSize && config.layers;
  }

  async execute(bot: TradingBot, marketData: MarketData): Promise<ExecutionResult> {
    const config = bot.config as any;
    const { spreadPct, orderSize, layers = 3 } = config;

    const bidPrice = marketData.price * (1 - spreadPct / 200); // Half spread below
    const askPrice = marketData.price * (1 + spreadPct / 200); // Half spread above

    // Place layered orders
    return {
      action: "buy", // Simplified - in production place both buy and sell
      amount: orderSize,
      price: bidPrice,
      reason: `Market making: placing ${layers} layers with ${spreadPct}% spread`,
      metadata: {
        bidPrice,
        askPrice,
        midPrice: marketData.price,
        layers,
        spread: spreadPct,
      },
    };
  }
}

/**
 * MEV Strategy
 * Monitors mempool for MEV opportunities (frontrun, sandwich, arbitrage)
 */
class MEVStrategy implements BotStrategy {
  name = "mev";

  validateConfig(config: any): boolean {
    return config.minProfitUSD && config.network && config.protectionEnabled;
  }

  async execute(bot: TradingBot, marketData: MarketData): Promise<ExecutionResult> {
    const config = bot.config as any;
    const { minProfitUSD, protectionEnabled } = config;

    // Simulate mempool analysis (in production, use actual mempool feed)
    const pendingTxValue = Math.random() * 10000; // Simulated large tx
    const potentialProfit = pendingTxValue * 0.001; // 0.1% MEV opportunity

    if (potentialProfit > minProfitUSD && !protectionEnabled) {
      console.warn("⚠️ MEV opportunity detected but execution blocked - ethics check required");
      
      return {
        action: "hold",
        amount: 0,
        price: marketData.price,
        reason: "MEV opportunity blocked - requires Kingdom ethics approval",
        metadata: {
          potentialProfit,
          pendingTxValue,
          blocked: true,
          ethicsCheckRequired: true,
        },
      };
    }

    return {
      action: "hold",
      amount: 0,
      price: marketData.price,
      reason: "No profitable MEV opportunity",
      metadata: { protectionEnabled },
    };
  }
}

/**
 * Momentum AI Strategy
 * Uses AI/ML signals (RSI, MACD, Bollinger Bands, Moving Averages) to detect momentum
 * Powered by pattern recognition and volume analysis
 */
class MomentumAIStrategy implements BotStrategy {
  name = "momentum_ai";

  validateConfig(config: any): boolean {
    return config.rsiPeriod && config.momentumThreshold && config.aiModel;
  }

  async execute(bot: TradingBot, marketData: MarketData): Promise<ExecutionResult> {
    const config = bot.config as any;
    const { rsiPeriod = 14, momentumThreshold = 60, aiModel = "lstm", stopLoss = 2 } = config;

    // Calculate technical indicators (simplified - in production use TA-Lib or similar)
    const rsi = this.calculateRSI(marketData.price, rsiPeriod);
    const macd = this.calculateMACD(marketData.price);
    const volumeScore = this.analyzeVolume(marketData.volume);
    
    // AI momentum score (0-100)
    const momentumScore = this.calculateMomentumScore(rsi, macd, volumeScore, marketData);

    // Strong bullish momentum
    if (momentumScore >= momentumThreshold) {
      const entryPrice = marketData.price;
      const amount = parseFloat(bot.investmentAmount) * 0.8; // 80% position
      
      return {
        action: "buy",
        amount,
        price: entryPrice,
        reason: `AI detected strong bullish momentum (score: ${momentumScore.toFixed(1)})`,
        metadata: {
          rsi,
          macd: macd.value,
          volumeScore,
          momentumScore,
          aiModel,
          stopLossPrice: entryPrice * (1 - stopLoss / 100),
          targetPrice: entryPrice * (1 + stopLoss * 2 / 100), // 2:1 risk/reward
        },
      };
    }

    // Strong bearish momentum
    if (momentumScore <= (100 - momentumThreshold)) {
      return {
        action: "sell",
        amount: parseFloat(bot.investmentAmount) * 0.5,
        price: marketData.price,
        reason: `AI detected strong bearish momentum (score: ${momentumScore.toFixed(1)})`,
        metadata: {
          rsi,
          macd: macd.value,
          volumeScore,
          momentumScore,
          signal: "bearish",
        },
      };
    }

    return {
      action: "hold",
      amount: 0,
      price: marketData.price,
      reason: `Momentum neutral (score: ${momentumScore.toFixed(1)})`,
      metadata: { momentumScore, rsi, macd: macd.value },
    };
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  private calculateRSI(price: number, period: number = 14): number {
    // Simplified RSI calculation (production: use historical data)
    const randomChange = (Math.random() - 0.5) * 20;
    const baseRSI = 50 + randomChange;
    return Math.max(0, Math.min(100, baseRSI));
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  private calculateMACD(price: number): { value: number; signal: string } {
    // Simplified MACD (production: use historical EMA calculations)
    const macdValue = (Math.random() - 0.5) * price * 0.01;
    const signal = macdValue > 0 ? "bullish" : "bearish";
    return { value: macdValue, signal };
  }

  /**
   * Analyze volume patterns
   */
  private analyzeVolume(volume: number): number {
    // Volume score 0-100 (higher = stronger conviction)
    const avgVolume = volume * (0.8 + Math.random() * 0.4);
    return Math.min(100, (volume / avgVolume) * 50);
  }

  /**
   * AI-powered momentum score calculation
   */
  private calculateMomentumScore(
    rsi: number,
    macd: { value: number; signal: string },
    volumeScore: number,
    marketData: MarketData
  ): number {
    // Weighted composite score
    const rsiWeight = 0.35;
    const macdWeight = 0.35;
    const volumeWeight = 0.3;

    const rsiComponent = rsi;
    const macdComponent = macd.signal === "bullish" ? 60 + Math.abs(macd.value) * 10 : 40 - Math.abs(macd.value) * 10;
    const volumeComponent = volumeScore;

    const compositeScore = 
      (rsiComponent * rsiWeight) + 
      (macdComponent * macdWeight) + 
      (volumeComponent * volumeWeight);

    return Math.max(0, Math.min(100, compositeScore));
  }
}

/**
 * Main Trading Bot Service
 */
class TradingBotService {
  private strategies: Map<string, BotStrategy>;

  constructor() {
    this.strategies = new Map([
      ["grid", new GridTradingStrategy()],
      ["dca", new DCAStrategy()],
      ["scalping", new ScalpingStrategy()],
      ["arbitrage", new ArbitrageStrategy()],
      ["market_making", new MarketMakingStrategy()],
      ["momentum_ai", new MomentumAIStrategy()],
      ["mev", new MEVStrategy()],
    ]);
  }

  /**
   * Execute a trading bot
   */
  async executeBot(bot: TradingBot, marketData: MarketData): Promise<BotExecution> {
    if (!bot.isActive) {
      throw new Error("Bot is not active");
    }

    const strategy = this.strategies.get(bot.strategy);
    if (!strategy) {
      throw new Error(`Strategy ${bot.strategy} not found`);
    }

    // Validate strategy config
    if (!strategy.validateConfig(bot.config)) {
      throw new Error(`Invalid config for strategy ${bot.strategy}`);
    }

    // Execute strategy
    const result = await strategy.execute(bot, marketData);

    // Calculate profit/loss (simplified)
    const profit = result.action === "sell" 
      ? (result.price - (marketData.bidPrice || result.price)) * result.amount
      : 0;

    // Create execution record
    const execution: InsertBotExecution = {
      botId: bot.id,
      strategy: bot.strategy,
      status: result.action === "hold" ? "cancelled" : "pending",
      entryPrice: result.action === "buy" ? result.price.toString() : null,
      exitPrice: result.action === "sell" ? result.price.toString() : null,
      amount: result.amount.toString(),
      profit: profit.toString(),
      fees: "0",
      slippage: "0",
      reason: result.reason,
      metadata: result.metadata,
    };

    const createdExecution = await storage.createBotExecution(execution);

    // Update bot stats
    if (result.action !== "hold") {
      await this.updateBotStats(bot, createdExecution);
    }

    return createdExecution;
  }

  /**
   * Update bot statistics
   */
  private async updateBotStats(bot: TradingBot, execution: BotExecution): Promise<void> {
    const profit = parseFloat(execution.profit || "0");
    const isWin = profit > 0;

    const totalTrades = (bot.totalTrades || 0) + 1;
    const currentProfit = parseFloat(bot.totalProfit || "0");
    const currentLoss = parseFloat(bot.totalLoss || "0");
    const currentWinRate = parseFloat(bot.winRate || "0");

    const updates = {
      totalTrades,
      totalProfit: (currentProfit + (isWin ? profit : 0)).toString(),
      totalLoss: (currentLoss + (!isWin && profit < 0 ? Math.abs(profit) : 0)).toString(),
      winRate: ((totalTrades > 1 ? ((isWin ? 1 : 0) + currentWinRate * (totalTrades - 1)) / totalTrades : (isWin ? 100 : 0))).toFixed(2),
      lastExecutionAt: new Date(),
    };

    await storage.updateBot(bot.id, updates);
  }

  /**
   * Fetch market data from exchange (simplified - integrate with real exchange APIs)
   */
  async getMarketData(exchange: string, tradingPair: string): Promise<MarketData> {
    // In production, integrate with exchange APIs (Binance, Bybit, etc.)
    // This is a simplified simulation
    const basePrice = 50000 + Math.random() * 1000; // Simulated BTC price
    
    return {
      symbol: tradingPair,
      price: basePrice,
      volume: 1000000,
      bidPrice: basePrice * 0.999,
      askPrice: basePrice * 1.001,
      orderbook: {
        bids: [[basePrice * 0.999, 1.5], [basePrice * 0.998, 2.0]],
        asks: [[basePrice * 1.001, 1.5], [basePrice * 1.002, 2.0]],
      },
      indicators: {
        ema_fast: basePrice * 1.001,
        ema_slow: basePrice * 0.999,
        rsi: 45 + Math.random() * 10,
        vwap: basePrice,
      },
    };
  }

  /**
   * Run bot execution loop (called by scheduler)
   */
  async runBotLoop(botId: string): Promise<void> {
    const bot = await storage.getBot(botId);
    if (!bot || !bot.isActive) return;

    try {
      const marketData = await this.getMarketData(bot.exchange, bot.tradingPair);
      await this.executeBot(bot, marketData);
    } catch (error) {
      console.error(`Bot ${botId} execution failed:`, error);
      // Log error but don't stop bot
    }
  }

  /**
   * Start all active bots
   */
  async startAllActiveBots(userId: string): Promise<void> {
    const bots = await storage.getUserBots(userId);
    const activeBots = bots.filter(bot => bot.isActive);

    for (const bot of activeBots) {
      // In production, use a proper scheduler (node-cron, bull queue, etc.)
      setInterval(() => this.runBotLoop(bot.id), 60000); // Run every minute
    }
  }
}

export const tradingBotService = new TradingBotService();
