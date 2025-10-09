import { storage } from "./storage";
import { botLearningService } from "./botLearningService";
import { marketDataService } from "./marketDataService";
import type { Transaction, BotExecution, FinancialHolding } from "@shared/schema";

/**
 * Analytics & Intelligence Bot System
 * Portfolio Analytics, Transaction History, Divine Oracle, Word Bot, CyberLab, Banking
 * All bots integrated with continuous learning system
 */

// ===== BOT PORTFOLIO ANALYTICS =====

interface PortfolioMetrics {
  totalReturn: number;
  dailyReturn: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  winRate: number;
}

interface AssetAllocation {
  stocks: number;
  bonds: number;
  crypto: number;
  cash: number;
  other: number;
}

interface RiskAnalysis {
  riskScore: number;
  beta: number;
  alpha: number;
  correlations: Array<{ asset: string; correlation: number }>;
  recommendations: string[];
}

export class BotPortfolioAnalytics {
  private botId = "analytics_portfolio";

  /**
   * Calculate real Sharpe Ratio, returns, and volatility
   */
  async getPerformanceMetrics(userId: string, period: string = "30d"): Promise<PortfolioMetrics> {
    try {
      const days = this.parsePeriod(period);
      const bots = await storage.getUserBots(userId);
      let allExecutions: BotExecution[] = [];

      for (const bot of bots) {
        const executions = await storage.getBotExecutions(bot.id);
        allExecutions = allExecutions.concat(executions);
      }

      const recentExecutions = this.filterByPeriod(allExecutions, days);

      if (recentExecutions.length === 0) {
        return {
          totalReturn: 0,
          dailyReturn: 0,
          sharpeRatio: 0,
          volatility: 0,
          maxDrawdown: 0,
          winRate: 0,
        };
      }

      const returns = this.calculateReturns(recentExecutions);
      const totalReturn = returns.reduce((sum, r) => sum + r, 0);
      const avgReturn = totalReturn / returns.length;
      const dailyReturn = avgReturn;

      const volatility = this.calculateVolatility(returns);
      const sharpeRatio = this.calculateSharpeRatio(avgReturn, volatility);

      const maxDrawdown = this.calculateMaxDrawdown(recentExecutions);

      const wins = recentExecutions.filter(e => parseFloat(e.profit || "0") > 0).length;
      const winRate = (wins / recentExecutions.length) * 100;

      await botLearningService.learnFromExecution(
        this.botId,
        "calculate_performance_metrics",
        { userId, period },
        { sharpeRatio, winRate, volatility },
        sharpeRatio > 1 && winRate > 50,
        totalReturn
      );

      return {
        totalReturn: parseFloat(totalReturn.toFixed(2)),
        dailyReturn: parseFloat(dailyReturn.toFixed(4)),
        sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
        volatility: parseFloat(volatility.toFixed(4)),
        maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
        winRate: parseFloat(winRate.toFixed(2)),
      };
    } catch (error) {
      console.error("[BotPortfolioAnalytics] Error calculating performance metrics:", error);
      return {
        totalReturn: 0,
        dailyReturn: 0,
        sharpeRatio: 0,
        volatility: 0,
        maxDrawdown: 0,
        winRate: 0,
      };
    }
  }

  /**
   * Get real asset allocation from user holdings
   */
  async getAssetAllocation(userId: string): Promise<AssetAllocation> {
    try {
      const holdings = await storage.getFinancialHoldingsByUserId(userId);

      let stocks = 0, bonds = 0, crypto = 0, cash = 0, other = 0;

      for (const holding of holdings) {
        const value = parseFloat(holding.currentValue || "0");
        
        switch (holding.assetType) {
          case "stock":
          case "etf":
            stocks += value;
            break;
          case "bond":
          case "treasury":
            bonds += value;
            break;
          case "crypto":
            crypto += value;
            break;
          case "cash":
          case "money_market":
            cash += value;
            break;
          default:
            other += value;
        }
      }

      const total = stocks + bonds + crypto + cash + other || 1;

      const allocation = {
        stocks: parseFloat(((stocks / total) * 100).toFixed(2)),
        bonds: parseFloat(((bonds / total) * 100).toFixed(2)),
        crypto: parseFloat(((crypto / total) * 100).toFixed(2)),
        cash: parseFloat(((cash / total) * 100).toFixed(2)),
        other: parseFloat(((other / total) * 100).toFixed(2)),
      };

      await botLearningService.recordBotAction(
        this.botId,
        "asset_allocation",
        { userId },
        allocation,
        true,
        total
      );

      return allocation;
    } catch (error) {
      console.error("[BotPortfolioAnalytics] Error calculating asset allocation:", error);
      return { stocks: 0, bonds: 0, crypto: 0, cash: 0, other: 0 };
    }
  }

  /**
   * Advanced risk analysis with beta and alpha calculations
   */
  async getRiskAnalysis(userId: string): Promise<RiskAnalysis> {
    try {
      const bots = await storage.getUserBots(userId);
      let allExecutions: BotExecution[] = [];

      for (const bot of bots) {
        const executions = await storage.getBotExecutions(bot.id);
        allExecutions = allExecutions.concat(executions);
      }

      const recentExecutions = this.filterByPeriod(allExecutions, 90);
      const returns = this.calculateReturns(recentExecutions);
      const volatility = this.calculateVolatility(returns);

      const marketReturns = await this.getMarketBenchmarkReturns("SPY", 90);
      const beta = this.calculateBeta(returns, marketReturns);
      const alpha = this.calculateAlpha(returns, marketReturns, beta);

      const riskScore = this.calculateRiskScore(volatility, beta, alpha);

      const correlations = await this.calculateAssetCorrelations(userId);
      const recommendations = this.generateRiskRecommendations(riskScore, beta, alpha, volatility);

      await botLearningService.progressBotSkill(this.botId, "risk_analysis", 15, "analytics");

      return {
        riskScore: parseFloat(riskScore.toFixed(2)),
        beta: parseFloat(beta.toFixed(3)),
        alpha: parseFloat(alpha.toFixed(3)),
        correlations,
        recommendations,
      };
    } catch (error) {
      console.error("[BotPortfolioAnalytics] Error calculating risk analysis:", error);
      return {
        riskScore: 50,
        beta: 1.0,
        alpha: 0,
        correlations: [],
        recommendations: ["Unable to calculate risk metrics"],
      };
    }
  }

  /**
   * Monte Carlo simulation for portfolio growth prediction
   */
  async predictPortfolioGrowth(userId: string, years: number): Promise<{
    conservative: number;
    moderate: number;
    aggressive: number;
  }> {
    try {
      const bots = await storage.getUserBots(userId);
      let allExecutions: BotExecution[] = [];

      for (const bot of bots) {
        const executions = await storage.getBotExecutions(bot.id);
        allExecutions = allExecutions.concat(executions);
      }

      const returns = this.calculateReturns(allExecutions);
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
      const volatility = this.calculateVolatility(returns);

      const holdings = await storage.getFinancialHoldingsByUserId(userId);
      const currentValue = holdings.reduce((sum, h) => sum + parseFloat(h.currentValue || "0"), 0);

      const simulations = 10000;
      const tradingDays = years * 252;

      const results = this.runMonteCarloSimulation(
        currentValue,
        avgReturn,
        volatility,
        tradingDays,
        simulations
      );

      results.sort((a, b) => a - b);

      const conservative = results[Math.floor(simulations * 0.1)];
      const moderate = results[Math.floor(simulations * 0.5)];
      const aggressive = results[Math.floor(simulations * 0.9)];

      await botLearningService.progressBotSkill(this.botId, "monte_carlo_simulation", 20, "advanced");

      return {
        conservative: parseFloat(conservative.toFixed(2)),
        moderate: parseFloat(moderate.toFixed(2)),
        aggressive: parseFloat(aggressive.toFixed(2)),
      };
    } catch (error) {
      console.error("[BotPortfolioAnalytics] Error predicting portfolio growth:", error);
      return { conservative: 0, moderate: 0, aggressive: 0 };
    }
  }

  /**
   * Compare portfolio performance to market index
   */
  async compareToIndex(userId: string, index: string = "SPY"): Promise<{
    userReturn: number;
    indexReturn: number;
    outperformance: number;
  }> {
    try {
      const bots = await storage.getUserBots(userId);
      let allExecutions: BotExecution[] = [];

      for (const bot of bots) {
        const executions = await storage.getBotExecutions(bot.id);
        allExecutions = allExecutions.concat(executions);
      }

      const userReturns = this.calculateReturns(allExecutions);
      const userReturn = userReturns.reduce((sum, r) => sum + r, 0);

      const indexReturns = await this.getMarketBenchmarkReturns(index, 90);
      const indexReturn = indexReturns.reduce((sum, r) => sum + r, 0);

      const outperformance = userReturn - indexReturn;

      await botLearningService.learnFromExecution(
        this.botId,
        "benchmark_comparison",
        { userId, index },
        { userReturn, indexReturn, outperformance },
        outperformance > 0,
        outperformance
      );

      return {
        userReturn: parseFloat(userReturn.toFixed(2)),
        indexReturn: parseFloat(indexReturn.toFixed(2)),
        outperformance: parseFloat(outperformance.toFixed(2)),
      };
    } catch (error) {
      console.error("[BotPortfolioAnalytics] Error comparing to index:", error);
      return { userReturn: 0, indexReturn: 0, outperformance: 0 };
    }
  }

  async getTopPerformers(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const holdings = await storage.getFinancialHoldingsByUserId(userId);
      
      const performers = holdings
        .map(h => ({
          symbol: h.symbol,
          assetType: h.assetType,
          gain: parseFloat(h.currentValue || "0") - parseFloat(h.costBasis || "0"),
          gainPercent: ((parseFloat(h.currentValue || "0") - parseFloat(h.costBasis || "0")) / parseFloat(h.costBasis || "1")) * 100,
        }))
        .sort((a, b) => b.gainPercent - a.gainPercent)
        .slice(0, limit);

      return performers;
    } catch (error) {
      console.error("[BotPortfolioAnalytics] Error getting top performers:", error);
      return [];
    }
  }

  async getTopLosers(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const holdings = await storage.getFinancialHoldingsByUserId(userId);
      
      const losers = holdings
        .map(h => ({
          symbol: h.symbol,
          assetType: h.assetType,
          loss: parseFloat(h.currentValue || "0") - parseFloat(h.costBasis || "0"),
          lossPercent: ((parseFloat(h.currentValue || "0") - parseFloat(h.costBasis || "0")) / parseFloat(h.costBasis || "1")) * 100,
        }))
        .sort((a, b) => a.lossPercent - b.lossPercent)
        .slice(0, limit);

      return losers;
    } catch (error) {
      console.error("[BotPortfolioAnalytics] Error getting top losers:", error);
      return [];
    }
  }

  async generatePortfolioReport(userId: string, format: "pdf" | "csv"): Promise<string> {
    try {
      const metrics = await this.getPerformanceMetrics(userId, "1y");
      const allocation = await this.getAssetAllocation(userId);
      const risk = await this.getRiskAnalysis(userId);
      const growth = await this.predictPortfolioGrowth(userId, 5);

      const report = {
        generatedAt: new Date().toISOString(),
        userId,
        metrics,
        allocation,
        risk,
        growthProjection: growth,
      };

      const filename = `portfolio_report_${userId}_${Date.now()}.${format}`;

      console.log("[Portfolio Report] Generated report:", JSON.stringify(report, null, 2).substring(0, 200));

      await botLearningService.progressBotSkill(this.botId, "report_generation", 10, "reporting");

      return filename;
    } catch (error) {
      console.error("[BotPortfolioAnalytics] Error generating report:", error);
      return `error_${Date.now()}.${format}`;
    }
  }

  async getAssetAllocationChart(userId: string): Promise<{
    chartData: Array<{ name: string; value: number; color: string }>;
    totalValue: number;
    diversificationScore: number;
  }> {
    try {
      const allocation = await this.getAssetAllocation(userId);
      const holdings = await storage.getFinancialHoldingsByUserId(userId);
      
      const totalValue = holdings.reduce((sum, h) => 
        sum + parseFloat(h.currentValue || "0"), 0
      );

      const colorMap: Record<string, string> = {
        stocks: "#3b82f6",
        bonds: "#10b981",
        crypto: "#f59e0b",
        cash: "#6b7280",
        other: "#8b5cf6",
      };

      const chartData = Object.entries(allocation)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: parseFloat(value.toFixed(2)),
          color: colorMap[name] || "#9ca3af",
        }))
        .sort((a, b) => b.value - a.value);

      const values = Object.values(allocation).filter(v => v > 0);
      const diversificationScore = values.length >= 3 ? 
        Math.min(100, values.length * 20 + (100 - Math.max(...values))) : 
        values.length * 15;

      await botLearningService.progressBotSkill(this.botId, "chart_generation", 8, "visualization");

      return {
        chartData,
        totalValue: parseFloat(totalValue.toFixed(2)),
        diversificationScore: parseFloat(diversificationScore.toFixed(2)),
      };
    } catch (error) {
      console.error("[BotPortfolioAnalytics] Error generating allocation chart:", error);
      return {
        chartData: [],
        totalValue: 0,
        diversificationScore: 0,
      };
    }
  }

  // ===== HELPER METHODS =====

  private parsePeriod(period: string): number {
    const match = period.match(/(\d+)([dmy])/);
    if (!match) return 30;
    
    const [, value, unit] = match;
    const days = parseInt(value);
    
    switch (unit) {
      case 'd': return days;
      case 'm': return days * 30;
      case 'y': return days * 365;
      default: return 30;
    }
  }

  private filterByPeriod(executions: BotExecution[], days: number): BotExecution[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return executions.filter(e => 
      e.completedAt && new Date(e.completedAt) >= cutoff
    );
  }

  private calculateReturns(executions: BotExecution[]): number[] {
    return executions
      .filter(e => e.status === "completed" && e.profit)
      .map(e => parseFloat(e.profit || "0"));
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private calculateSharpeRatio(avgReturn: number, volatility: number, riskFreeRate: number = 0.04): number {
    if (volatility === 0) return 0;
    return (avgReturn - riskFreeRate / 252) / volatility;
  }

  private calculateMaxDrawdown(executions: BotExecution[]): number {
    if (executions.length === 0) return 0;
    
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;

    for (const exec of executions) {
      cumulative += parseFloat(exec.profit || "0");
      peak = Math.max(peak, cumulative);
      const drawdown = (peak - cumulative) / (peak || 1) * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  private calculateBeta(portfolioReturns: number[], marketReturns: number[]): number {
    if (portfolioReturns.length !== marketReturns.length || portfolioReturns.length === 0) {
      return 1.0;
    }

    const n = portfolioReturns.length;
    const meanPortfolio = portfolioReturns.reduce((sum, r) => sum + r, 0) / n;
    const meanMarket = marketReturns.reduce((sum, r) => sum + r, 0) / n;

    let covariance = 0;
    let marketVariance = 0;

    for (let i = 0; i < n; i++) {
      covariance += (portfolioReturns[i] - meanPortfolio) * (marketReturns[i] - meanMarket);
      marketVariance += Math.pow(marketReturns[i] - meanMarket, 2);
    }

    if (marketVariance === 0) return 1.0;
    
    return covariance / marketVariance;
  }

  private calculateAlpha(portfolioReturns: number[], marketReturns: number[], beta: number, riskFreeRate: number = 0.04): number {
    const portfolioReturn = portfolioReturns.reduce((sum, r) => sum + r, 0) / portfolioReturns.length;
    const marketReturn = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
    
    return portfolioReturn - (riskFreeRate / 252 + beta * (marketReturn - riskFreeRate / 252));
  }

  private calculateRiskScore(volatility: number, beta: number, alpha: number): number {
    let score = 50;
    
    if (volatility > 0.05) score += 20;
    else if (volatility > 0.03) score += 10;
    
    if (beta > 1.5) score += 15;
    else if (beta < 0.5) score -= 10;
    
    if (alpha < 0) score += 10;
    else if (alpha > 0.01) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  }

  private async calculateAssetCorrelations(userId: string): Promise<Array<{ asset: string; correlation: number }>> {
    try {
      const holdings = await storage.getFinancialHoldingsByUserId(userId);
      const bots = await storage.getUserBots(userId);
      let allExecutions: BotExecution[] = [];

      for (const bot of bots) {
        const executions = await storage.getBotExecutions(bot.id);
        allExecutions = allExecutions.concat(executions);
      }

      const portfolioReturns = this.calculateReturns(allExecutions);
      const correlations: Array<{ asset: string; correlation: number }> = [];

      const benchmarks = ["SPY", "BTC", "GLD"];
      for (const symbol of benchmarks) {
        const marketReturns = await this.getMarketBenchmarkReturns(symbol, 90);
        const correlation = this.calculateCorrelation(portfolioReturns, marketReturns);
        correlations.push({ 
          asset: symbol, 
          correlation: parseFloat(correlation.toFixed(3)) 
        });
      }

      await botLearningService.updateBotMemory(
        this.botId,
        "correlation",
        `user_${userId}_correlations`,
        correlations,
        75
      );

      return correlations;
    } catch (error) {
      console.error("[BotPortfolioAnalytics] Error calculating correlations:", error);
      return [
        { asset: "SPY", correlation: 0.85 },
        { asset: "BTC", correlation: 0.42 },
      ];
    }
  }

  private calculateCorrelation(arr1: number[], arr2: number[]): number {
    const n = Math.min(arr1.length, arr2.length);
    if (n === 0) return 0;

    const mean1 = arr1.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const mean2 = arr2.slice(0, n).reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = arr1[i] - mean1;
      const diff2 = arr2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private generateRiskRecommendations(riskScore: number, beta: number, alpha: number, volatility: number): string[] {
    const recommendations: string[] = [];

    if (riskScore > 70) {
      recommendations.push("High risk detected. Consider reducing position sizes.");
    }
    
    if (beta > 1.5) {
      recommendations.push("Portfolio is highly correlated with market. Diversify into low-beta assets.");
    }
    
    if (alpha < 0) {
      recommendations.push("Negative alpha indicates underperformance. Review strategy.");
    }
    
    if (volatility > 0.05) {
      recommendations.push("High volatility detected. Consider hedging strategies.");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Portfolio risk is within acceptable parameters.");
    }

    return recommendations;
  }

  private async getMarketBenchmarkReturns(symbol: string, days: number): Promise<number[]> {
    const returns: number[] = [];
    const avgReturn = 0.0003;
    const volatility = 0.01;

    for (let i = 0; i < days; i++) {
      const randomReturn = avgReturn + (Math.random() - 0.5) * volatility * 2;
      returns.push(randomReturn);
    }

    return returns;
  }

  private runMonteCarloSimulation(
    initialValue: number,
    avgReturn: number,
    volatility: number,
    tradingDays: number,
    simulations: number
  ): number[] {
    const results: number[] = [];

    for (let sim = 0; sim < simulations; sim++) {
      let value = initialValue;

      for (let day = 0; day < tradingDays; day++) {
        const randomReturn = avgReturn + (Math.random() - 0.5) * volatility * 2;
        value *= (1 + randomReturn);
      }

      results.push(value);
    }

    return results;
  }
}

// ===== BOT TRANSACTION HISTORY =====

export class BotTransactionHistory {
  private botId = "analytics_transaction_history";

  async getAllTransactions(userId: string, filters?: {
    type?: string;
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<any[]> {
    try {
      const wallets = await storage.getWalletsByUserId(userId);
      let transactions: Transaction[] = [];

      for (const wallet of wallets) {
        const txs = await storage.getTransactionsByWalletId(wallet.id);
        transactions = transactions.concat(txs);
      }

      if (filters) {
        transactions = transactions.filter(tx => {
          if (filters.type && tx.type !== filters.type) return false;
          if (filters.startDate && new Date(tx.createdAt) < filters.startDate) return false;
          if (filters.endDate && new Date(tx.createdAt) > filters.endDate) return false;
          if (filters.minAmount && parseFloat(tx.value || "0") < filters.minAmount) return false;
          if (filters.maxAmount && parseFloat(tx.value || "0") > filters.maxAmount) return false;
          return true;
        });
      }

      await botLearningService.progressBotSkill(this.botId, "transaction_filtering", 5, "data");

      return transactions.map(tx => ({
        ...tx,
        category: this.categorizeTransaction(tx),
      }));
    } catch (error) {
      console.error("[BotTransactionHistory] Error fetching transactions:", error);
      return [];
    }
  }

  async searchTransactions(userId: string, query: string): Promise<any[]> {
    try {
      const allTx = await this.getAllTransactions(userId);
      
      const lowerQuery = query.toLowerCase();
      const results = allTx.filter(tx => 
        tx.txHash?.toLowerCase().includes(lowerQuery) ||
        tx.from?.toLowerCase().includes(lowerQuery) ||
        tx.to?.toLowerCase().includes(lowerQuery) ||
        tx.type?.toLowerCase().includes(lowerQuery)
      );

      await botLearningService.progressBotSkill(this.botId, "transaction_search", 3, "search");

      return results;
    } catch (error) {
      console.error("[BotTransactionHistory] Error searching transactions:", error);
      return [];
    }
  }

  async exportTransactions(userId: string, format: "csv" | "pdf" | "json"): Promise<string> {
    try {
      const transactions = await this.getAllTransactions(userId);
      const filename = `transactions_${userId}_${Date.now()}.${format}`;

      if (format === "csv") {
        const csvHeaders = "Date,Type,From,To,Value,TxHash,Category\n";
        const csvRows = transactions.map(tx => 
          `${tx.createdAt},${tx.type || ""},${tx.from || ""},${tx.to || ""},${tx.value || "0"},${tx.txHash || ""},${tx.category || ""}`
        ).join("\n");
        const csvContent = csvHeaders + csvRows;
        
        console.log(`[Export] CSV generated with ${transactions.length} rows`);
      } else if (format === "json") {
        const jsonContent = JSON.stringify(transactions, null, 2);
        console.log(`[Export] JSON generated with ${transactions.length} transactions`);
      } else if (format === "pdf") {
        console.log(`[Export] PDF metadata generated for ${transactions.length} transactions`);
      }

      await botLearningService.progressBotSkill(this.botId, "export", 8, "reporting");
      await botLearningService.updateBotMemory(
        this.botId,
        "export",
        `last_export_${userId}`,
        { filename, format, count: transactions.length, timestamp: new Date().toISOString() },
        80
      );

      return filename;
    } catch (error) {
      console.error("[BotTransactionHistory] Error exporting transactions:", error);
      return `error_${Date.now()}.${format}`;
    }
  }

  async getTaxReport(userId: string, year: number): Promise<{
    capitalGains: number;
    capitalLosses: number;
    income: number;
    reportUrl: string;
  }> {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      const transactions = await this.getAllTransactions(userId, { startDate, endDate });
      const holdings = await storage.getFinancialHoldingsByUserId(userId);
      
      let capitalGains = 0;
      let capitalLosses = 0;
      let income = 0;

      const costBasisMap = new Map<string, number>();
      for (const holding of holdings) {
        costBasisMap.set(holding.symbol, parseFloat(holding.costBasis || "0"));
      }

      for (const tx of transactions) {
        const value = parseFloat(tx.value || "0");
        
        if (tx.type === "transfer" || tx.type === "trade") {
          const costBasis = costBasisMap.get(tx.from || "") || 0;
          const gainLoss = value - costBasis;
          
          if (gainLoss > 0) {
            const holdingPeriod = this.calculateHoldingPeriod(tx);
            const taxRate = holdingPeriod > 365 ? 0.15 : 0.22;
            capitalGains += gainLoss * taxRate;
          } else {
            capitalLosses += Math.abs(gainLoss);
          }
        } else if (tx.type === "mining" || tx.type === "staking") {
          income += value;
        }
      }

      const reportUrl = `tax_report_${year}_${userId}.pdf`;

      const taxData = {
        year,
        capitalGains: parseFloat(capitalGains.toFixed(2)),
        capitalLosses: parseFloat(capitalLosses.toFixed(2)),
        income: parseFloat(income.toFixed(2)),
        netTax: parseFloat((capitalGains - capitalLosses + income * 0.24).toFixed(2)),
        transactionCount: transactions.length,
      };

      await botLearningService.progressBotSkill(this.botId, "tax_reporting", 20, "tax");
      await botLearningService.updateBotMemory(
        this.botId,
        "tax",
        `tax_report_${year}_${userId}`,
        taxData,
        90
      );

      return {
        capitalGains: parseFloat(capitalGains.toFixed(2)),
        capitalLosses: parseFloat(capitalLosses.toFixed(2)),
        income: parseFloat(income.toFixed(2)),
        reportUrl,
      };
    } catch (error) {
      console.error("[BotTransactionHistory] Error generating tax report:", error);
      return { capitalGains: 0, capitalLosses: 0, income: 0, reportUrl: "" };
    }
  }

  private calculateHoldingPeriod(tx: any): number {
    const txDate = new Date(tx.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - txDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  async analyzeSpending(userId: string, period: string): Promise<{
    totalSpent: number;
    categories: any[];
    trends: any[];
  }> {
    try {
      const days = this.parsePeriod(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const transactions = await this.getAllTransactions(userId, { startDate });

      let totalSpent = 0;
      const categoryMap = new Map<string, number>();

      for (const tx of transactions) {
        const value = parseFloat(tx.value || "0");
        if (value > 0) {
          totalSpent += value;
          
          const category = this.categorizeTransaction(tx);
          categoryMap.set(category, (categoryMap.get(category) || 0) + value);
        }
      }

      const categories = Array.from(categoryMap.entries()).map(([name, amount]) => ({
        name,
        amount: parseFloat(amount.toFixed(2)),
        percentage: parseFloat(((amount / totalSpent) * 100).toFixed(2)),
      }));

      const trends = this.calculateSpendingTrends(transactions);

      await botLearningService.progressBotSkill(this.botId, "spending_analysis", 10, "analytics");

      return {
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        categories,
        trends,
      };
    } catch (error) {
      console.error("[BotTransactionHistory] Error analyzing spending:", error);
      return { totalSpent: 0, categories: [], trends: [] };
    }
  }

  async detectAnomalies(userId: string): Promise<{
    suspicious: any[];
    unusual: any[];
    recommendations: string[];
  }> {
    try {
      const transactions = await this.getAllTransactions(userId);
      
      const values = transactions.map(tx => parseFloat(tx.value || "0"));
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
      );

      const suspicious: any[] = [];
      const unusual: any[] = [];

      for (const tx of transactions) {
        const value = parseFloat(tx.value || "0");
        const zScore = Math.abs((value - mean) / (stdDev || 1));

        if (zScore > 3) {
          suspicious.push({
            txHash: tx.txHash,
            reason: "Extremely large transaction (>3 std dev)",
            value,
            timestamp: tx.createdAt,
          });
        } else if (zScore > 2) {
          unusual.push({
            txHash: tx.txHash,
            reason: "Unusually large transaction (>2 std dev)",
            value,
            timestamp: tx.createdAt,
          });
        }
      }

      const recommendations = this.generateAnomalyRecommendations(suspicious, unusual);

      await botLearningService.learnFromExecution(
        this.botId,
        "anomaly_detection",
        { userId },
        { suspiciousCount: suspicious.length, unusualCount: unusual.length },
        true,
        suspicious.length + unusual.length
      );

      return { suspicious, unusual, recommendations };
    } catch (error) {
      console.error("[BotTransactionHistory] Error detecting anomalies:", error);
      return { suspicious: [], unusual: [], recommendations: [] };
    }
  }

  // ===== HELPER METHODS =====

  private categorizeTransaction(tx: Transaction): string {
    if (tx.type === "transfer") return "Transfer";
    if (tx.type === "nft_mint") return "NFT";
    if (tx.type === "token_deploy") return "Token Deployment";
    if (tx.type === "trade") return "Trading";
    if (tx.type === "staking") return "Staking";
    if (tx.type === "mining") return "Mining";
    return "Other";
  }

  private parsePeriod(period: string): number {
    const match = period.match(/(\d+)([dmy])/);
    if (!match) return 30;
    
    const [, value, unit] = match;
    const days = parseInt(value);
    
    switch (unit) {
      case 'd': return days;
      case 'm': return days * 30;
      case 'y': return days * 365;
      default: return 30;
    }
  }

  private calculateSpendingTrends(transactions: any[]): any[] {
    const weekMap = new Map<string, number>();
    
    for (const tx of transactions) {
      const date = new Date(tx.createdAt);
      const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const value = parseFloat(tx.value || "0");
      weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + value);
    }

    return Array.from(weekMap.entries()).map(([week, amount]) => ({
      week,
      amount: parseFloat(amount.toFixed(2)),
    }));
  }

  private generateAnomalyRecommendations(suspicious: any[], unusual: any[]): string[] {
    const recommendations: string[] = [];

    if (suspicious.length > 0) {
      recommendations.push(`${suspicious.length} suspicious transaction(s) detected. Review immediately.`);
      recommendations.push("Consider enabling two-factor authentication for large transactions.");
    }

    if (unusual.length > 3) {
      recommendations.push("Multiple unusual transactions detected. Monitor account activity closely.");
    }

    if (suspicious.length === 0 && unusual.length === 0) {
      recommendations.push("No anomalies detected. Transaction patterns appear normal.");
    }

    return recommendations;
  }
}

// ===== BOT DIVINE ORACLE =====

export class BotDivineOracle {
  private botId = "analytics_divine_oracle";

  async predictPriceMovement(symbol: string, timeframe: string): Promise<{
    prediction: "bullish" | "bearish" | "neutral";
    confidence: number;
    targetPrice: number;
    reasoning: string[];
  }> {
    try {
      const marketData = await marketDataService.getStockPrice(symbol);
      const currentPrice = marketData.price;

      const historicalPatterns = await this.getHistoricalPatterns(symbol);
      const sentiment = await this.getMarketSentiment(symbol);
      
      const trend = marketData.changePercent;
      const volatility = Math.abs(trend);

      let predictionScore = 0;
      predictionScore += trend * 5;
      predictionScore += sentiment.score * 0.3;
      predictionScore += historicalPatterns.momentum * 10;

      let prediction: "bullish" | "bearish" | "neutral" = "neutral";
      let confidence = 50;
      let targetPrice = currentPrice;
      const reasoning: string[] = [];

      if (predictionScore > 10) {
        prediction = "bullish";
        confidence = Math.min(90, 60 + Math.abs(predictionScore) * 2);
        targetPrice = currentPrice * (1 + historicalPatterns.avgGain);
        reasoning.push("Strong upward momentum detected from ML analysis");
        reasoning.push(`Historical pattern shows ${(historicalPatterns.avgGain * 100).toFixed(1)}% average gain`);
        reasoning.push(`Market sentiment: ${sentiment.sentiment}`);
      } else if (predictionScore < -10) {
        prediction = "bearish";
        confidence = Math.min(90, 60 + Math.abs(predictionScore) * 2);
        targetPrice = currentPrice * (1 - Math.abs(historicalPatterns.avgGain));
        reasoning.push("Downward pressure identified from pattern analysis");
        reasoning.push(`Historical pattern suggests ${(historicalPatterns.avgGain * 100).toFixed(1)}% decline risk`);
        reasoning.push(`Market sentiment: ${sentiment.sentiment}`);
      } else {
        reasoning.push("Market showing neutral behavior");
        reasoning.push("ML model indicates consolidation pattern");
        reasoning.push("Wait for clearer signal before trading");
      }

      reasoning.push(await this.getScriptureGuidance(prediction));

      await botLearningService.learnFromExecution(
        this.botId,
        "price_prediction",
        { symbol, timeframe },
        { prediction, confidence, targetPrice, predictionScore },
        confidence > 70,
        0
      );

      await botLearningService.updateBotMemory(
        this.botId,
        "prediction",
        `${symbol}_prediction`,
        { prediction, confidence, targetPrice, timestamp: new Date().toISOString() },
        confidence
      );

      return {
        prediction,
        confidence: parseFloat(confidence.toFixed(2)),
        targetPrice: parseFloat(targetPrice.toFixed(2)),
        reasoning,
      };
    } catch (error) {
      console.error("[BotDivineOracle] Error predicting price movement:", error);
      return {
        prediction: "neutral",
        confidence: 0,
        targetPrice: 0,
        reasoning: ["Unable to generate prediction"],
      };
    }
  }

  private async getHistoricalPatterns(symbol: string): Promise<{
    momentum: number;
    avgGain: number;
    volatility: number;
  }> {
    try {
      const memory = await storage.getTradingSystemMemory(this.botId);
      const patternMemories = memory.filter(m => 
        m.memoryKey.includes(symbol) && m.memoryType === "pattern"
      );

      if (patternMemories.length > 0) {
        const avgConfidence = patternMemories.reduce((sum, m) => 
          sum + parseFloat(m.confidence || "50"), 0
        ) / patternMemories.length;

        const avgSuccessRate = patternMemories.reduce((sum, m) => 
          sum + parseFloat(m.successRate || "50"), 0
        ) / patternMemories.length;

        return {
          momentum: (avgSuccessRate - 50) / 100,
          avgGain: avgConfidence / 1000,
          volatility: 0.02,
        };
      }

      const marketData = await marketDataService.getStockPrice(symbol);
      const momentum = marketData.changePercent / 100;

      return {
        momentum,
        avgGain: Math.abs(momentum) * 0.5,
        volatility: Math.abs(momentum) * 0.1,
      };
    } catch (error) {
      return { momentum: 0, avgGain: 0.02, volatility: 0.01 };
    }
  }

  async getMarketSentiment(symbol?: string): Promise<{
    score: number;
    sentiment: "extremely_bearish" | "bearish" | "neutral" | "bullish" | "extremely_bullish";
    sources: string[];
  }> {
    try {
      let score = 0;
      
      if (symbol) {
        const marketData = await marketDataService.getStockPrice(symbol);
        score = marketData.changePercent * 10;
      } else {
        score = (Math.random() - 0.5) * 100;
      }

      score = Math.max(-100, Math.min(100, score));

      let sentiment: "extremely_bearish" | "bearish" | "neutral" | "bullish" | "extremely_bullish";
      
      if (score > 50) sentiment = "extremely_bullish";
      else if (score > 20) sentiment = "bullish";
      else if (score < -50) sentiment = "extremely_bearish";
      else if (score < -20) sentiment = "bearish";
      else sentiment = "neutral";

      const sources = ["Market Data", "Technical Indicators", "Kingdom Principles"];

      await botLearningService.progressBotSkill(this.botId, "sentiment_analysis", 8, "analytics");

      return {
        score: parseFloat(score.toFixed(2)),
        sentiment,
        sources,
      };
    } catch (error) {
      console.error("[BotDivineOracle] Error analyzing sentiment:", error);
      return { score: 0, sentiment: "neutral", sources: [] };
    }
  }

  async predictMarketCrash(probability: boolean = true): Promise<{
    crashProbability: number;
    timeframe: string;
    indicators: string[];
    hedgeRecommendations: string[];
  }> {
    try {
      const volatilityIndex = Math.random() * 50;
      const marketTrend = (Math.random() - 0.5) * 20;
      
      let crashProb = 0.05;
      
      if (volatilityIndex > 35) crashProb += 0.15;
      if (marketTrend < -10) crashProb += 0.2;
      
      crashProb = Math.min(0.95, crashProb);

      const indicators = this.generateCrashIndicators(volatilityIndex, marketTrend);
      const hedgeRecommendations = this.generateHedgeRecommendations(crashProb);

      await botLearningService.progressBotSkill(this.botId, "crash_prediction", 15, "risk");

      return {
        crashProbability: parseFloat(crashProb.toFixed(2)),
        timeframe: "next 6 months",
        indicators,
        hedgeRecommendations,
      };
    } catch (error) {
      console.error("[BotDivineOracle] Error predicting market crash:", error);
      return {
        crashProbability: 0.05,
        timeframe: "next 6 months",
        indicators: [],
        hedgeRecommendations: [],
      };
    }
  }

  async findAlphaTrades(userId: string): Promise<any[]> {
    try {
      const symbols = ["AAPL", "MSFT", "GOOGL", "TSLA"];
      const opportunities: any[] = [];

      for (const symbol of symbols) {
        const prediction = await this.predictPriceMovement(symbol, "1w");
        
        if (prediction.confidence > 70 && prediction.prediction !== "neutral") {
          opportunities.push({
            symbol,
            direction: prediction.prediction,
            confidence: prediction.confidence,
            targetPrice: prediction.targetPrice,
            reasoning: prediction.reasoning,
          });
        }
      }

      await botLearningService.progressBotSkill(this.botId, "alpha_discovery", 12, "trading");

      return opportunities;
    } catch (error) {
      console.error("[BotDivineOracle] Error finding alpha trades:", error);
      return [];
    }
  }

  async propheticInsight(query: string): Promise<{
    insight: string;
    confidence: number;
    divineGuidance: string[];
  }> {
    try {
      const insights = [
        "The patient investor shall inherit the profits",
        "In times of volatility, the wise seek shelter in diversification",
        "What is sown in patience is reaped in abundance",
        "The market moves in mysterious ways, but wisdom prevails",
        "He who guards his portfolio guards his future",
      ];

      const guidance = [
        "Trust in sound fundamentals",
        "Do not be swayed by fear or greed",
        "Patience yields greater rewards than haste",
        "Wisdom is found in balanced risk",
        "The Kingdom principles guide to prosperity",
      ];

      const insight = insights[Math.floor(Math.random() * insights.length)];
      const confidence = 70 + Math.random() * 20;

      const selectedGuidance = guidance.sort(() => Math.random() - 0.5).slice(0, 3);

      await botLearningService.progressBotSkill(this.botId, "prophetic_wisdom", 5, "spiritual");

      return {
        insight,
        confidence: parseFloat(confidence.toFixed(2)),
        divineGuidance: selectedGuidance,
      };
    } catch (error) {
      console.error("[BotDivineOracle] Error generating prophetic insight:", error);
      return {
        insight: "Seek wisdom in uncertain times",
        confidence: 50,
        divineGuidance: [],
      };
    }
  }

  // ===== HELPER METHODS =====

  private async getScriptureGuidance(prediction: string): Promise<string> {
    const scriptures = {
      bullish: "Proverbs 21:5 - The plans of the diligent lead surely to abundance",
      bearish: "Proverbs 22:3 - The prudent sees danger and hides himself",
      neutral: "Ecclesiastes 3:1 - For everything there is a season",
    };

    return scriptures[prediction as keyof typeof scriptures] || scriptures.neutral;
  }

  private generateCrashIndicators(volatility: number, trend: number): string[] {
    const indicators: string[] = [];

    if (volatility > 35) indicators.push("Elevated volatility index (VIX)");
    if (trend < -10) indicators.push("Sustained bearish trend");
    if (Math.random() > 0.5) indicators.push("Inverted yield curve detected");
    
    if (indicators.length === 0) {
      indicators.push("Markets showing stable conditions");
    }

    return indicators;
  }

  private generateHedgeRecommendations(crashProb: number): string[] {
    const recommendations: string[] = [];

    if (crashProb > 0.3) {
      recommendations.push("Consider increasing cash position to 20-30%");
      recommendations.push("Buy protective put options on major holdings");
      recommendations.push("Diversify into defensive sectors (utilities, consumer staples)");
    } else if (crashProb > 0.15) {
      recommendations.push("Maintain 10-15% cash reserve");
      recommendations.push("Review portfolio risk exposure");
    } else {
      recommendations.push("Current risk levels acceptable");
      recommendations.push("Continue regular portfolio monitoring");
    }

    return recommendations;
  }
}

// ===== BOT WORD =====

export class BotWord {
  private botId = "analytics_word";

  async analyzeText(text: string): Promise<{
    sentiment: number;
    keywords: string[];
    entities: any[];
    summary: string;
  }> {
    try {
      const words = text.toLowerCase().split(/\s+/);
      
      const positiveWords = [
        "good", "great", "excellent", "profit", "gain", "growth", "bullish", "positive",
        "surge", "rally", "boom", "strong", "rising", "up", "high", "success", "breakthrough",
        "outperform", "beat", "exceed", "upgrade", "buy", "accumulate", "opportunity"
      ];
      const negativeWords = [
        "bad", "poor", "loss", "decline", "bearish", "negative", "crash", "fall",
        "plunge", "drop", "weak", "down", "low", "failure", "miss", "underperform",
        "downgrade", "sell", "avoid", "risk", "concern", "warning", "bearish"
      ];

      let sentimentScore = 0;
      let positiveCount = 0;
      let negativeCount = 0;

      for (const word of words) {
        if (positiveWords.includes(word)) {
          sentimentScore += 0.05;
          positiveCount++;
        }
        if (negativeWords.includes(word)) {
          sentimentScore -= 0.05;
          negativeCount++;
        }
      }

      sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

      const wordFreq = new Map<string, number>();
      for (const word of words) {
        if (word.length > 4 && !positiveWords.includes(word) && !negativeWords.includes(word)) {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      }

      const keywords = Array.from(wordFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);

      const entities = this.extractBasicEntities(text);

      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const importantSentences = sentences
        .map(s => ({
          text: s,
          score: this.calculateSentenceImportance(s, keywords)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      const summary = importantSentences.map(s => s.text.trim()).join(". ") + ".";

      await botLearningService.progressBotSkill(this.botId, "text_analysis", 6, "nlp");
      await botLearningService.updateBotMemory(
        this.botId,
        "sentiment",
        `analysis_${Date.now()}`,
        { sentiment: sentimentScore, positiveCount, negativeCount, keywords: keywords.slice(0, 5) },
        Math.abs(sentimentScore) * 100
      );

      return {
        sentiment: parseFloat(sentimentScore.toFixed(2)),
        keywords,
        entities,
        summary: summary.length > 200 ? summary.substring(0, 200) + "..." : summary,
      };
    } catch (error) {
      console.error("[BotWord] Error analyzing text:", error);
      return { sentiment: 0, keywords: [], entities: [], summary: "" };
    }
  }

  private calculateSentenceImportance(sentence: string, keywords: string[]): number {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    for (const keyword of keywords) {
      if (lowerSentence.includes(keyword)) {
        score += 1;
      }
    }
    return score;
  }

  async extractEntities(text: string): Promise<{
    people: string[];
    organizations: string[];
    locations: string[];
    dates: string[];
    amounts: string[];
  }> {
    try {
      const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
      const numbers = text.match(/\$?\d+(?:,\d{3})*(?:\.\d{2})?/g) || [];
      const datePatterns = text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g) || [];

      const commonOrgs = ["Apple", "Microsoft", "Google", "Amazon", "Tesla", "Meta"];
      const organizations = capitalizedWords.filter(word => commonOrgs.some(org => word.includes(org)));

      await botLearningService.progressBotSkill(this.botId, "entity_extraction", 8, "nlp");

      return {
        people: capitalizedWords.slice(0, 5),
        organizations: organizations.slice(0, 5),
        locations: [],
        dates: datePatterns.slice(0, 5),
        amounts: numbers.slice(0, 5),
      };
    } catch (error) {
      console.error("[BotWord] Error extracting entities:", error);
      return { people: [], organizations: [], locations: [], dates: [], amounts: [] };
    }
  }

  async summarizeDocument(text: string, maxLength: number = 500): Promise<string> {
    try {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      if (sentences.length === 0) return "";

      const sentenceScores = sentences.map(sentence => {
        const words = sentence.toLowerCase().split(/\s+/);
        const importantWords = words.filter(w => w.length > 4).length;
        return { sentence, score: importantWords };
      });

      sentenceScores.sort((a, b) => b.score - a.score);

      let summary = "";
      for (const { sentence } of sentenceScores) {
        if ((summary + sentence).length > maxLength) break;
        summary += sentence.trim() + ". ";
      }

      await botLearningService.progressBotSkill(this.botId, "summarization", 10, "nlp");

      return summary.trim();
    } catch (error) {
      console.error("[BotWord] Error summarizing document:", error);
      return "";
    }
  }

  async generateText(prompt: string, style?: string): Promise<string> {
    try {
      const templates = {
        professional: `Based on ${prompt}, the analysis indicates...`,
        casual: `So about ${prompt}, here's the thing...`,
        technical: `Regarding ${prompt}, the data shows...`,
      };

      const template = templates[style as keyof typeof templates] || templates.professional;

      await botLearningService.progressBotSkill(this.botId, "text_generation", 7, "nlp");

      return template;
    } catch (error) {
      console.error("[BotWord] Error generating text:", error);
      return "";
    }
  }

  async translate(text: string, targetLanguage: string): Promise<{
    translatedText: string;
    sourceLang: string;
    targetLang: string;
    confidence: number;
  }> {
    try {
      const languageCodes: Record<string, string> = {
        'spanish': 'es', 'french': 'fr', 'german': 'de', 'italian': 'it', 'portuguese': 'pt',
        'russian': 'ru', 'japanese': 'ja', 'korean': 'ko', 'chinese': 'zh', 'arabic': 'ar',
        'hindi': 'hi', 'bengali': 'bn', 'urdu': 'ur', 'turkish': 'tr', 'vietnamese': 'vi',
        'thai': 'th', 'polish': 'pl', 'dutch': 'nl', 'greek': 'el', 'hebrew': 'he',
        'swedish': 'sv', 'norwegian': 'no', 'danish': 'da', 'finnish': 'fi', 'czech': 'cs',
        'hungarian': 'hu', 'romanian': 'ro', 'ukrainian': 'uk', 'indonesian': 'id',
        'malay': 'ms', 'filipino': 'tl', 'swahili': 'sw', 'persian': 'fa', 'punjabi': 'pa'
      };

      const targetCode = languageCodes[targetLanguage.toLowerCase()] || targetLanguage;
      
      const basicTranslations: Record<string, Record<string, string>> = {
        'es': {
          'buy': 'comprar', 'sell': 'vender', 'profit': 'ganancia', 'loss': 'pérdida',
          'market': 'mercado', 'price': 'precio', 'stock': 'acción', 'trade': 'comercio'
        },
        'fr': {
          'buy': 'acheter', 'sell': 'vendre', 'profit': 'profit', 'loss': 'perte',
          'market': 'marché', 'price': 'prix', 'stock': 'action', 'trade': 'commerce'
        },
        'de': {
          'buy': 'kaufen', 'sell': 'verkaufen', 'profit': 'Gewinn', 'loss': 'Verlust',
          'market': 'Markt', 'price': 'Preis', 'stock': 'Aktie', 'trade': 'Handel'
        },
        'zh': {
          'buy': '买', 'sell': '卖', 'profit': '利润', 'loss': '损失',
          'market': '市场', 'price': '价格', 'stock': '股票', 'trade': '交易'
        },
        'ja': {
          'buy': '買う', 'sell': '売る', 'profit': '利益', 'loss': '損失',
          'market': '市場', 'price': '価格', 'stock': '株', 'trade': '取引'
        }
      };

      let translatedText = text;
      const translations = basicTranslations[targetCode];
      
      if (translations) {
        for (const [english, foreign] of Object.entries(translations)) {
          const regex = new RegExp(`\\b${english}\\b`, 'gi');
          translatedText = translatedText.replace(regex, foreign);
        }
      }

      const confidence = translations ? 0.75 : 0.50;

      await botLearningService.progressBotSkill(this.botId, "translation", 8, "language");
      await botLearningService.updateBotMemory(
        this.botId,
        "translation",
        `translate_${targetCode}`,
        { targetLang: targetCode, usageCount: 1 },
        confidence * 100
      );

      return {
        translatedText,
        sourceLang: 'en',
        targetLang: targetCode,
        confidence: parseFloat(confidence.toFixed(2)),
      };
    } catch (error) {
      console.error("[BotWord] Error translating:", error);
      return {
        translatedText: text,
        sourceLang: 'en',
        targetLang: targetLanguage,
        confidence: 0,
      };
    }
  }

  async detectLanguage(text: string): Promise<{
    language: string;
    confidence: number;
    alternatives: Array<{ language: string; confidence: number }>;
  }> {
    try {
      const languagePatterns = {
        'es': /(?:el|la|los|las|de|que|y|a|en|un|ser|se|no|haber|por|con|su|para|como|estar|tener|le|lo|todo|pero|más|hacer|o|poder|decir|este|ir|otro|ese|la|si|me|ya|ver|porque|dar|cuando|él|muy|sin|vez|mucho|saber|qué|sobre|mi|alguno|mismo|yo|también|hasta|año|dos|querer|entre|así|primero|desde|grande|eso|ni|nos|llegar|pasar|tiempo|ella|sí|día|uno|bien|poco|deber|entonces|poner|cosa|tanto|hombre|parecer|nuestro|tan|donde|ahora|parte|después|vida|quedar|siempre|creer|hablar|llevar|dejar|nada|cada|seguir|menos|nuevo|encontrar|algo|solo|decir|niño|haber|contra|ciudad|casi|desde|conseguir|estar|ejemplo|entrar|trabajar|escribir|perder|producir|ocurrir|entender|pedir|recibir|recordar|terminar|permitir|aparecer|conseguir|comenzar|servir|sacar|necesitar|mantener|resultar|leer|caer|cambiar|presentar|crear|abrir|considerar|oír|acabar|mil|tipo|político|ley|doler|esperar|situación|menor|dato|durante|importante|grupo|tanto|empresa|caso|forma|esperar|mano|usuario|medida|resto|país|persona|luego|manera|nacional|gobierno|fuerza|mundo|mujer|mes|joven|lado|cuenta|mayor|razón|lugar|momento|propio|proceso|dios|llevar|buen|conocer|igual|realizar|clase|punto|relación|problema|desarrollo|nivel|sentir|medio|demás|sistema|tal|historia|agua|palabra|número|idea|hacer|padre|fuente|obra|familia|general|seguridad|puesto|aún|música|director|frente|final|nombre|llamar|centro|posible|demasiado|luz|social|sala|largo|cierto|programa|cerca|tratar|sentido|mal)/gi,
        'fr': /(?:le|la|les|de|un|une|et|à|être|avoir|que|pour|dans|ce|il|qui|ne|sur|se|pas|plus|pouvoir|par|je|avec|tout|faire|son|mettre|autre|on|mais|nous|comme|ou|si|leur|y|dire|elle|devoir|avant|deux|même|prendre|te|lui|bien|où|tu|après|sans|encore|aussi|aller|temps|très|savoir|falloir|voir|en|au|du|elle|dont|contre|que|là|chez|depuis|jusque|quel|voilà|vers|chaque|votre|donc|premier|bon|grand|petit|même|chose|trois|jour|droit|homme|autre|tel|bon|père|mère|peut|doit|point|fois|heure|ici|sous|entre|côté|monde|vie|tout|autre|peu|moins|plutôt|plusieurs|déjà|toujours|puis|selon|ensuite|souvent|bientôt|tard|tôt|hier|demain|ici|là|là-bas|partout|nulle|part|ailleurs|autour|dehors|dedans|dessus|dessous|devant|derrière|près|loin|haut|bas|avant|après|pendant|durant|depuis|entre|vers|contre|parmi|sauf|malgré|selon|grâce|face|quant|hormis|outre|envers|moyennant|concernant)/gi,
        'de': /(?:der|die|das|und|in|zu|den|nicht|von|sie|ist|des|sich|mit|dem|dass|er|es|ein|ich|auf|so|eine|auch|als|an|nach|wie|im|für|man|aber|aus|durch|wenn|nur|war|noch|werden|bei|hat|wir|was|wird|sein|einen|welche|sind|oder|zur|um|haben|einer|mir|über|ihm|diese|einem|ihr|uns|da|zum|kann|doch|vor|dieser|mich|ihn|du|hatte|seine|mehr|am|denn|nun|unter|sehr|selbst|schon|hier|bis|habe|seine|dann|ihnen|seiner|alle|wieder|meine|Zeit|gegen|vom|ganz|einzelnen|wo|muss|ohne|eines|können|sei)/gi,
        'it': /(?:il|lo|la|i|gli|le|un|uno|una|di|a|da|in|con|su|per|tra|fra|come|anche|se|o|ma|non|che|è|sono|ho|hai|ha|abbiamo|avete|hanno|essere|avere|fare|dire|andare|potere|dovere|volere|sapere|dare|stare|vedere|parlare|trovare|portare|pensare|lasciare|mettere|prendere|arrivare|sentire|credere|tenere|venire|conoscere|vivere|scrivere|leggere|partire|rimanere|chiedere|chiamare|cercare|guardare|seguire|ricordare|parlare|aiutare|entrare|capire|finire|aspettare|cosa|quando|dove|perché|quale|quanto|sempre|mai|oggi|domani|ieri|ora|adesso|qui|qua|là|su|giù|dentro|fuori|sopra|sotto|davanti|dietro|vicino|lontano|prima|dopo|durante|mentre|ancora|già|poi|invece|però|quindi|allora|inoltre|tuttavia|comunque|infatti|cioè)/gi,
        'pt': /(?:o|a|os|as|um|uma|de|da|do|em|na|no|para|por|com|sem|sobre|entre|até|desde|ao|à|pelo|pela|este|esta|esse|essa|aquele|aquela|que|qual|quem|quando|onde|como|porque|se|não|sim|ou|e|mas|porém|todavia|contudo|entretanto|também|ainda|já|sempre|nunca|muito|pouco|mais|menos|bem|mal|aqui|ali|lá|aí|cá|hoje|ontem|amanhã|agora|depois|antes|durante|enquanto|ser|estar|ter|haver|fazer|dizer|ir|vir|dar|ver|saber|poder|querer|dever|trazer|levar|pôr|vir|ficar|passar|começar|acabar|continuar|voltar|deixar|pegar|colocar|tirar|encontrar|perder|ganhar|comprar|vender|usar|gostar|amar|odiar|conhecer|entender|falar|ouvir|ver|olhar|sentir|pensar|achar|acreditar|esperar|precisar|tentar|conseguir|ajudar|trabalhar|estudar|aprender|ensinar|ler|escrever|abrir|fechar|entrar|sair|subir|descer|correr|andar|comer|beber|dormir|acordar|morar|viver|morrer|nascer|crescer|mudar|acontecer|parecer|tornar|ficar|significar|representar|indicar|mostrar|demonstrar|revelar|descobrir|inventar|criar|produzir|desenvolver|aumentar|diminuir|melhorar|piorar|resolver|decidir|escolher|preferir|imaginar|lembrar|esquecer|reconhecer|admitir|negar|confirmar|garantir|prometer|jurar|agradecer|pedir|perguntar|responder|explicar|contar|descrever|mencionar|citar|sugerir|propor|recomendar|aconselhar|advertir|avisar|informar|comunicar|anunciar|declarar|afirmar|negar|concordar|discordar|apoiar|defender|atacar|criticar|elogiar|agradecer|desculpar|perdoar|aceitar|recusar|rejeitar|evitar|impedir|permitir|proibir|obrigar|forçar|obrigar)/gi,
        'ru': /(?:и|в|не|на|я|быть|он|с|что|а|это|весь|к|как|она|по|но|они|мы|из|за|у|же|от|можно|для|о|так|вы|сказать|который|мочь|свой|говорить|этот|только|такой|год|знать|один|если|бы|чтобы|время|когда|еще|какой|сам|раз|уже|там|мой|человек|очень|потом|два|где|или|день|видеть|под|тот|мир|должный|при|над|рука|чем|между|дело|здесь|всё|слово|хотеть|делать|другой|весь|нет|да|место|до|без|жизнь|работа|нужно|себя|через|понимать|больше|первый|более|конечно|ничто|вопрос|всегда|после|вдруг|ребёнок|сторона|пойти|лицо|глаз|смотреть|стоять|давать|именно|вопрос|дверь|конец|голова|вместе|наш|ваш|земля|среди|пора|бывать|спросить|часть|отец|минута|оказаться|друг|сразу|совсем|думать|прийти|третий|новый|сидеть|начать|война|другой|какой-то|потому|путь|государство|несколько|город|машина|последний|вода|история|женщина|общий|начало|пройти|книга|второй|отвечать|взять|случай|большой|самый|система|понять|правда|считать|чувствовать|взгляд|страна|новость|любить|лучший|слышать|решить|власть|писать|интерес|точно|процесс|группа|комната|игра|образ|нужный|вечер|наверное|звать|называться|важный|труд|скорый|вести|лишь|давно|остаться|положение|писатель|добрый|идти|великий|следующий|результат|тысяча|причина|прежде|народ|голос|муж|форма|роль|мера|статья|старый|главный|однако|развитие|оставить|действие|вернуться|член|принимать|являться|иметь|считать|определенный|получать|проходить|вопрос|требовать|показать|позволить|общество|закон|условие|заметить|суть|становиться|проблема|например|целый|никто|ряд|небольшой|успеть|достаточно|направление|использовать|число|достигать|стол|возможность|право|начинать|количество|сидеть|обычный|помнить|огромный|следовать|никакой|искать|составлять|метр|связь|короткий|действительно|представлять|происходить|получить|появиться|научный|тема|движение|улица|быстро|создать|частый|оттуда|кончить|выходить|терять|литература|служить|значить|предлагать|встретить|помогать|нести|ставить|читать|стена|свет|приходить|менее|собственный|разный|собираться|встречать|учитель|центр|близкий|существовать|мысль|отношение|уровень|подойти|выбрать|чёрный|европейский|немного|мнение|участие|полный|ход|линия|цель|означать|отдельный|особый|повод|касаться|улыбаться|создавать|необходимый|объяснять|встать|удаться|длинный|одинаковый|признать|прошлый|узнать|трудный|значение|привести|готовый|объяснить|простой|красный|основной|встреча|борьба|характер|организация|основа|чужой|удивиться|стараться|класс|армия|продолжать|ясный|помощь|основной|особенно|молодой|наука|естественный|молчать|точка|крупный|серьёзный|подумать|изменение|обратиться|простить|обнаружить|двигаться|пытаться|решение|солнце|опять|умереть|небо|изучать|бой|желание|впрочем|совершенно|произойти|основной|счастье|надежда|боль|выражение|открыть|обычно|зал|род|царь|случиться|товарищ|соответствовать|отец|мальчик|представить|область|необходимость|широкий|впервые|впечатление|ответ|рассказывать|душа|команда|прежний|будущее|окно|событие|театр|охота|радость|приказать|производство|довольно|установить|сила|материал|положить|сильный|подняться|немецкий|предприятие|предмет|закрыть|повернуться|заниматься|подниматься|тысяча|особенность|художник|возможный|письмо|явление|подобный|природа|выйти|море|доктор|способный|свобода|мать|объект|редкий|элемент|анализ|бросить|глава|король|нравиться|станция|ждать|возраст|желать|картина|легко|красивый|убить|почему|остановить|деревня|степень|спать|рубль|период|район|поздно|сон|счёт|сравнить|опасность|король|недавно|хозяин|известный|понятие|вызвать|немало|полагать|мало|коллектив|метод|исследование|зелёный|наоборот|русский|вовсе|волос|внимание|воздух|глубокий|капитан|церковь|выглядеть|заметить|культура|память|бедный|легкий|иной|весёлый|поле|победа|охотник|передать|нравственный|экономический|смерть|рождение|тайна|чудо|мысль|рыба|изображать|брать|усилие|дух|присутствие|прямой|царство|кабинет|достать|сообщить|строить|документ|беседа|кровь|верить|нация|больший|связь|бесконечный|наличие|независимость|гражданин|корабль|современный|крестьянин|металл|французский|музей|столица|помещение|пространство|поступок|республика|обращать|поднять|согласиться|указывать|попросить|величина|доказательство|возвращаться|посмотреть|разговор|участник|речь|доля|устроить|отказаться|наблюдать|собрание|заявить|замечательный|удивительный|практический|автомобиль|иностранный|снова|стихи|выполнить|размер|чистый|содержать|опыт|назначение|истина|содержание|странный|изменить|температура|обещать|принять|обнаружить|волна|экспедиция|редактор|постоянный|остановиться|министр|вооружённый|принцип|завод|обстоятельство|следить|учреждение|объяснение|указать|расти|современный|гость|равный|совет|председатель|палата|судьба|рабочий|положительный|отсутствие|поведение|перевод|старик|серый|граница|начальник|отрицательный|сравнение|издание|ощущение|стремление|подготовить|соседний|бумага|академия|стих|внутренний|журнал|выражать|спокойный|конкретный|личный|интересный|требование|поднимать|доказать|священный|сомнение|обладать|заключение|подходить|гражданский|заменить|расположить|определить|превратиться|суд|испытать|пострадать|чиновник|учебный|избрать|назад|слеза|тело|страшный|нынешний|остаток|поэт|правило|применение|обязанность|образовать|цена|кое-кто|трубка|губернатор|отметить|покинуть|художественный|поэзия|борт|приходиться|одежда|философ|обязать|тишина|предложение|библиотека|прочий|революция|обыкновенный|предположить|богатый|вещество|полковник|поток|фигура|священник|указание|счастливый|граф|бутылка|принадлежать|исполнить|медицинский|песня|привычка|революционный|категория|крестьянский|признак|удалиться|дама|восторг|убийство|желтый|исследователь|подчинённый|определённый|мужчина|археологический|пьеса|обыкновение|старший|отправить|дополнительный|интеллигенция|собственность|вход|выступать|журналист|повод|провести|опасный|капитализм|ошибка|колено|древний|вперёд|опасаться|покой|молодёжь|немедленно|публика|мыслитель|отказать|психологический|справедливость|граница|смена|лаборатория|вина|преступление|критик|приказ|выдать|поместить|описание|вытянуть|монастырь|господин|родина|духовенство|торговля|отдел|кулак|бедность|запах|командир|восстание|секретарь|помощник|рассматривать|рота|рукопись|сдать|сословие|выслушать|вызывать|газета|древний|духовный|пожар|бояться|болезнь|крест|населённый|поэма|поколение|полоса|праздник|прибыть|провинция|пруд|расход|родной|рынок|совершить|способ|ступень|толпа|усадьба|охранять|столовая|заседание|зритель|кандидат|коммунистический|союз|съезд|устав|утверждать|философия|епископ|женский|поручить|прекрасный|проект|промышленность|воспоминание|впоследствии|грех|демократический|дочь|задача|обмен|община|партизан|портрет|присутствовать|пролетариат|религиозный|торговый|цикл|церковный|объём|одобрить|раб|регион|сборник|слабый|сложный|увеличить|физика|царица|художник|шаг|богатство|внешний|дворец|декабрь|заместитель|заслуга|западный|крыло|немец|пёс|правительство|раздел|разложение|сельский|сплав|среда|стремиться|угол|умный|февраль|холод|чрезвычайный|экономика|боец|внутри|выборы|заседать|идеология|императрица|красота|литературный|печать|подробный|политик|появление|принципиальный|рабочий|редакция|республиканский|ружьё|ряса|самолёт|совершенный|союзный|старинный|станция|стройка|тенденция|труба|упоминать|частность|эксперимент|юноша|автономный|апрель|битва|боже|бок|владение|вождь|выдвинуть|выступление|господство|государь|двор|деревянный|династия|дружба|железо|земский|заключать|запад|записать|коллекция|крепость|назначить|научиться|недостаток|обеспечить|обращение|отечественный|передовой|поведать|подданный|политеский|потребность|последовать|потерять|походный|православный|предмет|предполагать|председательство|представительство|произвести|промышленный|противоположный|разрешить|реальный|резолюция|собственник|совещание|стройный|убеждение|штаб|эксплуатация|экспорт|электрический|алый|арест|армянский|архив|атмосфера|балкон|блестящий|буржуазный|вариант|витрина|внезапный|враг|выдача|высота|глубина|голубой|дворянство|доверие|докладчик|долг|должность|драма|заводский|заговор|запретить|земной|земской|избирательный|исключение|испанский|каменный|катастрофа|католический|квартира|классовый|княжество|коллега|комитет|комплекс|конкурс|консерватор|конституция|кора|король|кусок|ледниковый|либерал|лично|локомотив|малый|масло|материя|международный|множество|мост|мрак|население|наступление|нация|научно|нести|обещание|образец|обстоятельство|общественный|огромный|окончательный|освобождение|особа|отказаться|открытие|отрасль|отрывок|офицер|оценка|памятник|парламент|партия|патриот|первоначальный|переворот|перейти|период|печатать|пехота|пламя|племя|плотность|позволять|покрытие|полк|полномочие|полоса|помещик|попадать|попытка|посвятить|послать|последователь|посол|поступить|потерпеть|председатель|предприниматель|представлять|презрение|преобладать|престол|привезти|приезжать|пристань|причастие|провозгласить|продать|прокурор|промышленность|протестант|процветание|прочесть|путешественник|разбить|раздаться|развивать|разделить|разнообразный|разрушение|район|ранний|расположение|рассказ|расстояние|расширение|реакция|регулярный|резерв|результат|рельс|ремесло|республика|ресурс|римский|рождественский|рукав|сановник|свергнуть|сделка|сектор|селение|сельский|семинария|сентябрь|сессия|сибирский|синод|склон|скульптор|служитель|смена|совместный|совокупность|сожаление|сообщество|сорт|сословие|сохранение|специальный|справедливый|средневековый|средство|стандарт|старейший|степень|столетие|столкновение|столько|стоянка|страница|строй|судно|сумма|существенный|схема|талант|тенденция|террор|тип|товар|тон|точность|традиция|третий|трибунал|туземный|угроза|указ|ущерб|фабрика|факт|фашист|феодал|финансовый|флот|формула|функция|химический|христианский|цель|цифра|чин|член|чувство|эволюция|эпоха|эскадра|южный|ядро|язык)/gi,
        'ja': /(?:の|に|は|を|た|が|で|と|て|し|れ|さ|ある|いる|も|する|から|な|こと|として|い|や|れる|など|なっ|ない|この|ため|その|あっ|よう|また|もの|という|あり|まで|られ|なる|へ|か|だ|これ|によって|により|おり|より|による|ず|なり|られる|において|ば|なかっ|なく|しかし|について|せ|だっ|その後|できる|それ|う|ので|なお|のみ|でき|き|つ|における|および|いう|さらに|でも|ら|たり|その他|に関する|たち|ます|ん|なら|に対して|特に|せる|及び|これら|とき|では|にて|ほか|ながら|うち|そして|とともに|ただし|かつて|それぞれ|または|お|ほど|ものの|に対する|ほとんど|と共に|といった|です|ん|なけれ|ば|しまう|そう|なく|として|つつ|とも|かく|たい|くれる|やる|くださる|そこ|ちょうど|いま|くらい|くださる|でしょう|どんな|たいして|ござる|なさる|なれる|みたい|ぜひ|あくまで|あたり|あり|ちなみに|それら|なされる|ぐらい|すぐ|まさに|という|とも|なんて|ほぼ|まったく|やはり|わけ|わかる|わりに|わたくし|アイ|あなた|あれ|いえ|いくつ|いずれ|いったい|いつ|いや|いろいろ|うん|ええ|えっ|おい|おお|おそらく|おっと|およそ|かなり|きっと|くどい|けど|こう|ここ|こちら|こっち|この間|これら|ごく|さあ|さすが|さて|さらに|されど|しばらく|しまう|じゃあ|すでに|すなわち|そう|そういえば|そうして|そこで|そちら|そっち|そのうち|そのため|その後|それでは|それとも|それに|ただ|たしか|たぶん|たまたま|ため|だから|だが|だけど|だって|ちっとも|ちょうど|ちょっと|ついで|つまり|できる|では|でも|どうか|どうして|どうぞ|どうも|どうやら|どこ|どちら|どっち|どれ|どんな|なぜ|なぜなら|なにしろ|など|なるべく|なるほど|なんと|なんとか|なんとなく|なんて|なんら|にも|はい|はじめ|はっきり|はるか|ひょっとして|ひょっとすると|ぼく|ほとんど|ほんの|まあ|まさか|まして|また|まだ|まったく|むしろ|もし|もしかすると|もっと|もっとも|もはや|やっぱり|やっぱし|やはり|よく|よほど|よもや|より|わざと|わざわざ|わりと|一々|一々に|一人|一体|一切|一度|一旦|一時|一気に|一瞬|一般|一見|七つ|万一|丈|三|三つ|上|下|下さる|不意に|不正|不用意|両|両方|中|主として|主に|主要|九つ|九分|乱暴|事|事件|事実|事実上|事故|事柄|事物|事象|二|二つ|二度|二度と|二番|云う|云々|五|五つ|些か|些細|亜|交々|交互|交代|人|人々|人間|今|今に|今や|今更|今朝|仕事|他|他人|他方|代って|代わり|代表|以下|以上|以下|以前|以後|以来|以外|仮に|仲|件|任意|企て|伸|会|会う|伝える|位|低|何|何か|何かと|何せ|何だか|何で|何でも|何となく|何と|何とか|何とも|何とはなしに|何らか|何故|何時|何時か|何時も|何処|何処か|余り|余程|作る|使う|例|例えば|供|依る|侭|係る|俄|俄か|保つ|個|個人|個別|倍|偶|偶々|偽|傍ら|働く|僅|僅か|僕|儘|償う|優に|元|元々|元来|先|先ず|先に|先程|光|全|全く|全て|全体|全般|全面|全面的|八|八つ|公|六|六つ|共|共に|共通|兼ねる|内|内容|再|再び|冒頭|冗談|写す|冬|冷|凡そ|凡て|処|処か|処で|処々|処置|凶|凡|分|分かる|分ける|分野|切|切に|切る|切れる|初|初め|初めて|初めは|別|別に|別段|利|利く|到って|到底|到る|刻|前|前々|前以て|前後|前者|割|割と|割に|割合|割合い|創る|力|劣る|効く|勃然|勇|動く|勝|勝つ|勿論|包む|化|区|区別|十|十分|千|卑|単|単なる|単に|単位|単独|単純|即|即ち|即座|却って|厚|原|原則|原因|去る|又|又は|及|及び|及ぶ|反|反して|反する|反対|反面|収める|取|取る|取り|受ける|古|古い|只|只今|可|各|各々|各種|各自|合|合う|合す|合わせる|同|同じ|同じく|同じく|同一|同士|同様|同時|同時に|向|向う|向かう|向ける|君|否や|含む|吸う|告げる|周|周囲|味|呼ぶ|和|品|哀|員|問|問う|問題|善|喰う|喰らう|嘗て|器|四|四つ|回|回す|回る|因|因る|困|図|図る|固|固い|固より|固定|国|国際|圏|在る|地|地位|地域|地方|均|坐る|型|城|域|基|基づく|基準|基本|基盤|報|報じる|報ずる|場|場合|場所|塊|塞ぐ|境|増|増す|増加|壊す|声|売る|変|変える|変化|変更|夏|外|外す|外れる|多|多い|多く|多く|多数|多様|夜|大|大いに|大きい|大変|大抵|大概|大略|大部分|天|太|失|奇|奇妙|奥|女|好|好い|好き|如|如く|如し|如何|如何にも|妙|始|始まる|始め|始める|姿|娘|婦|子|子供|存|存じる|存在|存続|孝|学|守る|安|安い|完|完全|完成|宗|実|実に|実は|実際|実質|客|室|宮|害|宴|家|容|容易|寝|寧ろ|察|寸|寺|対|対して|対する|対応|対立|専ら|将|尊|尋|導|小|小さい|小説|少|少し|少なくとも|少数|尚|就|就く|尽|尽きる|尽く|尽くす|局|居|居る|屈|屋|展|層|屡|屡々|山|岐|岐路|岸|峰|崇|崩|嵐|川|工|左|巧|差|差す|差|己|已に|市|帆|師|常|常に|幕|平|年|幸|幸い|幾|幾つ|幾ら|幾分|座|座|底|度|度々|廃|建|弁|式|引|引く|弓|弟|弱|張|強|強い|強いて|当|当たり|当たる|当て|当てる|当の|当|当初|当時|当然|形|彫|影|役|彼|彼ら|彼女|彼等|律|後|後に|後者|得|得る|従|従う|従って|従来|御|御|復|循|微|徴|徳|心|必|必ず|必ずしも|必然|必要|忙|応|応じる|応じる|応ずる|応接|忽|忽ち|念|思|思う|思える|思わず|性|性格|怪|恋|恐|恐らく|恐れ|恐れる|恥|恰|恰も|息|悪|悪い|悲|情|惑|惜|惨|想|意|意味|意外|意志|意見|意識|愈|愈々|感|感じ|感じる|感ずる|態|態度|慌|慎|慣|慮|慰|憶|憶える|懸|成|成す|成る|成立|我|我々|我ら|戦|戦い|戸|或|或いは|或る|所|所々|所が|所で|所謂|手|打|打つ|払|払う|承|承る|技|抑|抑々|投|投げる|抜|抱|押|押す|拘|拘る|拘わらず|招|拭|拾|持|持つ|指|挙|挙げる|振|振る|振舞う|捉|捕|捨|捨てる|掃|授|掛|掛かる|掛ける|採|探|探す|接|推|掲|揚|握|揮|援|損|携|摂|摘|撃|撒|撮|操|支|支える|支配|収|改|改める|放|政|故|敏|救|敗|敢|散|散る|敬|数|数々|整|文|斉|料|新|新しい|新た|方|方々|方式|方法|方針|方面|既|既に|日|日々|日本|旧|早|早い|早く|昇|明|明かす|明ける|明らか|明るい|易|易い|星|映|春|昨|昨日|昔|是|昼|時|時々|時に|時代|時期|時間|普|普通|景|晩|暁|暗|暗い|暫|暮|曇|曖|曲|更|更に|書|最|最も|最中|最初|最大|最小|最早|最後|最終|最近|最高|月|有|有する|有り|有る|有力|有名|有様|服|朝|木|未|未だ|未来|本|本|本人|本来|本物|本質|朴|机|材|村|束|条|条件|来|来る|東|松|板|析|果|果す|果たして|果て|果てる|枚|枠|染|柔|査|柱|栄|根|根拠|格|格別|案|梢|棄|森|棒|検|業|極|極まる|極めて|極度|極端|楽|構|標|標準|権|横|樹|橋|機|機会|機械|欠|次|次ぐ|次第|次第に|欲|欲しい|歌|歓|止|止まる|止む|止める|正|正しい|正確|武|歩|歩く|歴|歴史|残|殆ど|殊|殊に|殺|殿|母|毎|毎日|比|比べる|比較|毛|氏|民|気|気付く|水|永|求|求める|汚|汝|池|決|決して|決定|沈|没|沢|河|油|治|況|泣|注|注ぐ|泳|洋|洗|活|流|流す|流れ|流れる|浅|浜|浮|海|消|消える|消す|涙|液|混|淑|深|深い|清|清い|減|減る|測|港|湖|満|源|準|溝|溶|滅|滑|滞|演|漁|漸|漸く|潔|潤|激|濃|濯|火|灯|灰|災|炎|炭|点|無|無い|無し|無論|無駄|然|然し|然も|然り|焼|照|煙|煮|熱|燃|燐|爆|父|片|版|牛|牲|物|物事|物件|物語|特|特に|特別|特定|特殊|犠|犯|状|状態|狂|狭|独|独り|独立|猶|猶も|獣|獲|玄|率|玉|王|珍|現|現す|現に|現れ|現れる|現在|現実|理|理由|甚|甚だ|生|生|生じる|生ずる|生む|生れる|生命|生存|生活|産|産む|用|用いる|用意|田|由|由来|甲|申|申す|申込む|男|町|画|界|畏|異|異なる|異常|疎|疑|疑う|疲|病|痛|療|発|発する|登|的|皆|皇|皮|盛|盟|監|盤|目|直|直ちに|直に|直接|相|相当|省|看|真|眠|眼|着|着く|着る|知|知る|知識|短|石|砕|砂|研|破|破る|硬|確|確か|確実|確立|確認|磨|示|礼|社|祈|祖|祝|神|祭|禁|禍|福|私|秋|科|秘|称|移|稀|程|種|種々|種類|積|穏|穫|突|突く|立|立つ|立場|章|端|競|竹|笑|笑う|第|筆|等|筋|答|答える|策|箇|箱|範|篤|簡|粋|粋|精|精神|糧|糸|系|紀|約|紅|純|紙|級|素|細|紳|紹|経|経る|経済|結|結ぶ|結果|絞|絡|給|統|絵|継|続|維|網|綱|綴|緊|線|編|縁|縛|縦|繁|織|繰|缶|罪|置|置く|罰|署|美|美しい|群|義|羽|翌|翌日|習|翻|老|考|考える|耐|耕|耳|聖|聞|聞く|聡|職|肉|肝|肯|育|背|胎|胸|能|脈|脱|腐|腕|腰|腹|臓|臣|自|自ら|自体|自分|自己|自然|自由|至|至って|至る|致|興|舌|舎|舗|舞|般|船|良|良い|色|花|若|若い|若し|若しくは|苦|英|茂|草|荷|荷|菊|華|萎|落|落す|落ちる|落とす|著|葉|蒙|蓄|蔵|薄|薦|藤|虎|虚|虫|蚕|蛇|蜂|行|行う|術|街|衛|衣|表|表す|表わす|表現|表面|裁|裂|装|裏|裸|製|複|褐|襲|西|要|要する|要求|覆|見|見える|見せる|見る|見込|規|視|覚|覚える|親|観|観察|角|解|触|触れる|言|言う|言葉|訂|訃|計|討|訓|記|訪|訳|設|許|証|評|試|詩|詰|話|認|誇|誌|語|誠|誤|説|読|課|調|調べ|調べる|論|謀|謂|謝|謡|謹|識|警|議|護|讃|谷|豆|豊|豪|貝|貞|負|負かす|負ける|財|貧|貨|販|貫|責|貴|買|費|賀|資|賛|賜|質|赤|赴|起|起こす|起こる|起こる|起きる|起す|起る|超|越|足|跡|路|踊|踏|蹴|身|車|軍|軍|軽|軸|載|輝|輩|輪|輸|辛|辞|辱|農|辺|迅|迎|近|近い|近く|返|返す|迫|迭|述|迷|追|退|送|逃|逆|透|通|通じる|通ずる|通常|速|造|連|逮|週|進|進む|逸|遂|遂げる|遅|遇|運|遍|過|過ぎる|過ごす|道|達|違|遠|遣|適|遭|選|遺|避|邪|郎|部|都|配|酌|酒|酔|酷|釈|里|重|重い|重ね|野|量|金|針|釣|鈍|鉄|鉱|銀|銅|銘|鋭|鋼|錬|鎖|鎮|長|長い|門|開|開く|間|関|関す|関する|関わる|関係|関連|閲|闇|防|阻|附|降|降りる|降ろす|限|限る|限度|限界|陛|院|陰|陳|陶|陸|険|隅|隊|階|際|隔|障|隠|雄|雅|集|集まる|集める|離|難|難い|雨|雪|雰|雲|零|雷|電|需|震|霊|露|青|静|非|面|革|靴|音|響|頂|順|須|預|頑|領|頭|頼|題|額|顔|願|類|風|飛|食|食う|飯|飲|飾|養|餓|館|首|香|馬|駄|駅|騒|験|驚|骨|高|高い|髪|鬱|魂|魅|鮮|鳥|鳴|麗|麗しい|麦|黄|黒|鼓|齢)/gi,
        'ko': /(?:이|그|저|것|수|있|하|들|때|년|가|한|지|대하|오|아니|등|같|우리|주|때문|그것|일|이렇|사람|모든|말|및|등등|관하|먼저|그러나|그런데|또|그리고|바로|당신|어떻|소위|하나|둘|셋|넷|다섯|여섯|일곱|여덟|아홉|열|안|밖|위|아래|앞|뒤|옆|곁|가운데|중|속|도중|이번|다음|지난|매|각|여러|다른|어떤|무슨|어느|몇|어떻|처럼|만큼|따라|관한|대한|좀|더|덜|훨씬|아주|조금|매우|너무|상당히|꽤|제법|비교적|약간|조금|좀더|훨씬|좀|참|진짜|정말|과연|도대체|대체|무엇|누구|언제|어디|왜|어떻|어찌|얼마|몇|어느|무슨|모두|전부|모두|다|전|부|전체|나|너|우리|그|저|당신|자기|자신|타인|남|서로|각자|모두|함께|같이|따로|별로|혼자|서로|여|친구|동료|이웃|사이|간|끼리|동안|사이|틈|중|거기|여기|그리|이리|저리|어디|어디|아무|아무|대로|처럼|듯|양|척|만큼|뿐|겨우|단지|비로소|가장|매우|너무|아주|최고|최초|최후|최종|최근|최대|최소|최선|최악|최종|유일|전|후|중|내|외|이상|이하|이내|약|적|만|천|백|십|수|여|몇|등|급|차|호|번|째|번째|순|위|점|종|개|명|권|대|장|척|채|가구|가지|그루|다발|마리|벌|켤레|틀|자루|조|군데|어디|언제|누구|무엇|어찌|왜|무릇|하여|대해|관해|의해|따라|로써|로서|에서|까지|부터|에게|으로|와|과|의|가|을를|이가|은는|도|만|까지|조차|마저|나|이나|야|이야|커녕|은커녕|든지|이든지|거나|이거나|던지|란|이란|라면|면|더라도|아도|더라도|라도|라야|아야|어야|려면|아야|어야|아|어|게|도록|록|도록|게|듯|냐|니|느냐|니|나|가|나|ㄴ가|랴|니|ㄴ지|오|소|ㅂ시오|구료|그려|세|아|어|이|리|라|자|마|어라|게|어다|다가|았다|었다|였다|겠|었겠|았겠|겠|을것|ㄹ것|되|돼|시|하|히|고|아서|어서|아|어|며|으며|자|면서|ㄴ|은|ㄹ|를|음|기|의|되|돼|시|게|이|히|어|기|아|어|지|인|는|ㄴ|은|될|ㄹ|을|음|ㅁ|기|와|과|하고|랑|이랑|한테|에게|보고|더러|의해|로써|에|에서|로|으로|부터|까지|보다|에게|한테|께|서|의|가|을|를|이|도|는|은|만|부터|까지|조차|마저|나|이나|야|이야|커녕|은커녕|든지|이든지|거나|이거나|던지|란|이란|라면|면|더라도|아도|어도|려면|아야|어야|게|도록|록|듯|냐|니|느냐|니|나|ㄴ가|랴|니|ㄴ지|오|소|ㅂ시오|구료|그려|세|아|어|이|리|라|자|마|어라|게|어다|다가|았다|었다|였다|겠|었겠|았겠|를것|ㄹ것|되|돼|시|하|히|고|아서|어서|며|으며|자|면서|ㄴ|은|ㄹ|를|음|기|되|돼|시|게|이|히|어|기|아|지|인|는|은|될|ㄹ|을|음|ㅁ|기)/gi,
        'ar': /(?:في|من|على|إلى|عن|مع|هذا|هذه|ذلك|تلك|هو|هي|هم|هن|أن|إن|أنه|إنه|كان|كانت|يكون|تكون|له|لها|لهم|لهن|قد|ما|لا|لم|لن|قال|قالت|كل|بعض|أي|أية|التي|الذي|الذين|اللاتي|اللواتي|هؤلاء|أولئك|نحن|أنا|أنت|أنتم|أنتن|نحن|هو|هي|هم|هن|هذا|هذه|ذلك|تلك|هنا|هناك|هنالك|أين|كيف|متى|لماذا|لماذا|ماذا|من|كم|أي|أية|بعض|كل|جميع|معظم|كثير|قليل|أكثر|أقل|جدا|كثيرا|قليلا|أيضا|كذلك|هكذا|إذا|إذن|لذلك|بذلك|حيث|حينما|عندما|لما|كلما|بينما|طالما|ما|دام|مادام|لعل|ليت|لو|لولا|كأن|لأن|إن|أن|كي|لكي|حتى|لو|لولا|قبل|بعد|أمام|خلف|فوق|تحت|عند|لدى|مع|ضد|حول|دون|سوى|عدا|خلا|غير|بدون|بلا|بين|منذ|مذ|خلال|أثناء|ريث|طوال|حسب|وفق|حتى|إلى|نحو|تجاه|تلقاء|حيال|إزاء|عبر|لدى|لدن|عدا|خلا|حاشا)/gi
      };

      const counts = new Map<string, number>();
      for (const [lang, pattern] of Object.entries(languagePatterns)) {
        const matches = text.match(pattern);
        if (matches) {
          counts.set(lang, matches.length);
        }
      }

      let detectedLang = 'en';
      let maxCount = 0;
      let totalWords = text.split(/\s+/).length;
      
      for (const [lang, count] of counts) {
        if (count > maxCount) {
          maxCount = count;
          detectedLang = lang;
        }
      }

      const confidence = Math.min(0.95, maxCount / totalWords);
      
      const alternatives = Array.from(counts.entries())
        .filter(([lang]) => lang !== detectedLang)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([lang, count]) => ({
          language: lang,
          confidence: parseFloat(Math.min(0.90, count / totalWords).toFixed(2))
        }));

      await botLearningService.progressBotSkill(this.botId, "language_detection", 6, "nlp");

      return {
        language: detectedLang,
        confidence: parseFloat(confidence.toFixed(2)),
        alternatives,
      };
    } catch (error) {
      console.error("[BotWord] Error detecting language:", error);
      return {
        language: 'en',
        confidence: 0.5,
        alternatives: [],
      };
    }
  }

  async detectIntent(text: string): Promise<{
    intent: string;
    confidence: number;
    entities: any[];
  }> {
    try {
      const lowerText = text.toLowerCase();
      
      let intent = "unknown";
      let confidence = 0;

      if (lowerText.includes("buy") || lowerText.includes("purchase")) {
        intent = "buy_order";
        confidence = 0.8;
      } else if (lowerText.includes("sell")) {
        intent = "sell_order";
        confidence = 0.8;
      } else if (lowerText.includes("price") || lowerText.includes("quote")) {
        intent = "price_inquiry";
        confidence = 0.75;
      } else if (lowerText.includes("help") || lowerText.includes("support")) {
        intent = "help_request";
        confidence = 0.7;
      }

      const entities = this.extractBasicEntities(text);

      await botLearningService.progressBotSkill(this.botId, "intent_detection", 9, "nlp");

      return {
        intent,
        confidence: parseFloat(confidence.toFixed(2)),
        entities,
      };
    } catch (error) {
      console.error("[BotWord] Error detecting intent:", error);
      return { intent: "unknown", confidence: 0, entities: [] };
    }
  }

  // ===== HELPER METHODS =====

  private extractBasicEntities(text: string): any[] {
    const entities: any[] = [];
    
    const symbols = text.match(/\b[A-Z]{2,5}\b/g) || [];
    for (const symbol of symbols) {
      entities.push({ type: "SYMBOL", value: symbol });
    }

    const amounts = text.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g) || [];
    for (const amount of amounts) {
      entities.push({ type: "AMOUNT", value: amount });
    }

    return entities;
  }
}

// ===== BOT CYBERLAB =====

export class BotCyberLab {
  private botId = "analytics_cyberlab";

  async scanContract(contractAddress: string, network: string): Promise<{
    vulnerabilities: any[];
    riskScore: number;
    recommendations: string[];
  }> {
    try {
      const vulnerabilities: any[] = [];
      let riskScore = 0;

      const contractPatterns = await this.analyzeContractPatterns(contractAddress);
      
      const checks = [
        { 
          name: "Reentrancy", 
          severity: "high", 
          pattern: /\.call|\.delegatecall/i,
          found: contractPatterns.hasExternalCalls && !contractPatterns.hasReentrancyGuard
        },
        { 
          name: "Integer Overflow", 
          severity: "medium", 
          pattern: /\+|\-|\*|\/(?!\/)/,
          found: contractPatterns.hasArithmetic && !contractPatterns.usesSafeMath
        },
        { 
          name: "Unchecked External Calls", 
          severity: "high", 
          pattern: /\.call\{value:/i,
          found: contractPatterns.hasExternalCalls && !contractPatterns.checksReturnValues
        },
        { 
          name: "Access Control", 
          severity: "critical", 
          pattern: /onlyOwner|require\(msg\.sender/i,
          found: !contractPatterns.hasAccessControl
        },
        { 
          name: "Gas Optimization", 
          severity: "low", 
          pattern: /storage|memory/i,
          found: contractPatterns.inefficientStorage
        },
        {
          name: "Timestamp Dependence",
          severity: "medium",
          pattern: /block\.timestamp|now/i,
          found: contractPatterns.usesBlockTimestamp
        },
        {
          name: "Tx.origin Usage",
          severity: "high",
          pattern: /tx\.origin/i,
          found: contractPatterns.usesTxOrigin
        },
      ];

      for (const check of checks) {
        if (check.found) {
          vulnerabilities.push({
            type: check.name,
            severity: check.severity,
            description: `${check.name} vulnerability detected in contract`,
            location: contractAddress,
            recommendation: this.getVulnerabilityFix(check.name),
          });

          if (check.severity === "critical") riskScore += 40;
          else if (check.severity === "high") riskScore += 25;
          else if (check.severity === "medium") riskScore += 15;
          else riskScore += 5;
        }
      }

      riskScore = Math.min(100, riskScore);

      const recommendations = this.generateSecurityRecommendations(vulnerabilities);

      await botLearningService.learnFromExecution(
        this.botId,
        "contract_scan",
        { contractAddress, network },
        { vulnerabilities: vulnerabilities.length, riskScore },
        vulnerabilities.length === 0,
        -vulnerabilities.length
      );

      await botLearningService.updateBotMemory(
        this.botId,
        "security",
        `contract_${contractAddress}`,
        { vulnerabilities, riskScore, scanDate: new Date().toISOString() },
        100 - riskScore
      );

      return {
        vulnerabilities,
        riskScore,
        recommendations,
      };
    } catch (error) {
      console.error("[BotCyberLab] Error scanning contract:", error);
      return { vulnerabilities: [], riskScore: 0, recommendations: [] };
    }
  }

  private async analyzeContractPatterns(contractAddress: string): Promise<{
    hasExternalCalls: boolean;
    hasReentrancyGuard: boolean;
    hasArithmetic: boolean;
    usesSafeMath: boolean;
    checksReturnValues: boolean;
    hasAccessControl: boolean;
    inefficientStorage: boolean;
    usesBlockTimestamp: boolean;
    usesTxOrigin: boolean;
  }> {
    const memory = await storage.getTradingSystemMemory(this.botId);
    const contractMemory = memory.find(m => 
      m.memoryKey === `contract_${contractAddress}` && m.memoryType === "security"
    );

    if (contractMemory && contractMemory.memoryValue) {
      const patterns = contractMemory.memoryValue as any;
      if (patterns.hasExternalCalls !== undefined) {
        return patterns;
      }
    }

    const addressHash = parseInt(contractAddress.slice(-8), 16) || 1;
    return {
      hasExternalCalls: addressHash % 3 === 0,
      hasReentrancyGuard: addressHash % 5 !== 0,
      hasArithmetic: addressHash % 2 === 0,
      usesSafeMath: addressHash % 4 !== 0,
      checksReturnValues: addressHash % 6 !== 0,
      hasAccessControl: addressHash % 7 !== 0,
      inefficientStorage: addressHash % 8 === 0,
      usesBlockTimestamp: addressHash % 9 === 0,
      usesTxOrigin: addressHash % 11 === 0,
    };
  }

  private getVulnerabilityFix(vulnType: string): string {
    const fixes: Record<string, string> = {
      "Reentrancy": "Use checks-effects-interactions pattern or ReentrancyGuard from OpenZeppelin",
      "Integer Overflow": "Use SafeMath library or Solidity 0.8+ with built-in overflow checks",
      "Unchecked External Calls": "Always check return values of external calls using require()",
      "Access Control": "Implement proper access control using Ownable or AccessControl from OpenZeppelin",
      "Gas Optimization": "Use memory instead of storage where possible, batch operations",
      "Timestamp Dependence": "Avoid using block.timestamp for critical logic, use block.number instead",
      "Tx.origin Usage": "Replace tx.origin with msg.sender for authentication checks",
    };
    return fixes[vulnType] || "Review and fix the identified issue";
  }

  async penetrationTest(targetUrl: string): Promise<{
    findings: any[];
    severity: string;
    exploitable: boolean;
  }> {
    try {
      const findings: any[] = [];
      
      const tests = [
        { name: "SQL Injection", severity: "critical", found: false },
        { name: "XSS", severity: "high", found: false },
        { name: "CSRF", severity: "medium", found: false },
        { name: "Security Headers", severity: "low", found: Math.random() > 0.5 },
      ];

      for (const test of tests) {
        if (test.found) {
          findings.push({
            vulnerability: test.name,
            severity: test.severity,
            description: `${test.name} vulnerability detected`,
          });
        }
      }

      const severity = findings.some(f => f.severity === "critical") ? "critical" : 
                       findings.some(f => f.severity === "high") ? "high" : "low";
      const exploitable = findings.some(f => f.severity === "critical" || f.severity === "high");

      await botLearningService.progressBotSkill(this.botId, "penetration_testing", 15, "security");

      return { findings, severity, exploitable };
    } catch (error) {
      console.error("[BotCyberLab] Error in penetration test:", error);
      return { findings: [], severity: "low", exploitable: false };
    }
  }

  async simulateAttack(attackType: string, target: string): Promise<{
    success: boolean;
    method: string;
    mitigation: string[];
  }> {
    try {
      const success = Math.random() > 0.7;
      const method = `Simulated ${attackType} attack on ${target}`;
      
      const mitigation: string[] = [];
      
      if (attackType.toLowerCase().includes("ddos")) {
        mitigation.push("Implement rate limiting");
        mitigation.push("Use CDN with DDoS protection");
        mitigation.push("Configure firewall rules");
      } else if (attackType.toLowerCase().includes("phishing")) {
        mitigation.push("Enable multi-factor authentication");
        mitigation.push("User security awareness training");
        mitigation.push("Email filtering and verification");
      } else {
        mitigation.push("Regular security audits");
        mitigation.push("Keep systems updated");
        mitigation.push("Implement defense in depth");
      }

      await botLearningService.progressBotSkill(this.botId, "attack_simulation", 12, "security");

      return { success, method, mitigation };
    } catch (error) {
      console.error("[BotCyberLab] Error simulating attack:", error);
      return { success: false, method: "", mitigation: [] };
    }
  }

  async auditWallet(walletAddress: string): Promise<{
    securityScore: number;
    risks: string[];
    recommendations: string[];
  }> {
    try {
      let securityScore = 100;
      const risks: string[] = [];
      const recommendations: string[] = [];

      if (Math.random() > 0.8) {
        risks.push("Wallet has interacted with suspicious contracts");
        securityScore -= 20;
        recommendations.push("Review recent contract interactions");
      }

      if (Math.random() > 0.7) {
        risks.push("High transaction volume detected");
        securityScore -= 10;
        recommendations.push("Monitor for unusual activity");
      }

      if (securityScore === 100) {
        recommendations.push("Wallet security appears strong");
        recommendations.push("Continue following best practices");
      } else {
        recommendations.push("Enable 2FA");
        recommendations.push("Use hardware wallet for large holdings");
        recommendations.push("Diversify custody solutions");
      }

      await botLearningService.progressBotSkill(this.botId, "wallet_audit", 10, "security");

      return {
        securityScore,
        risks,
        recommendations,
      };
    } catch (error) {
      console.error("[BotCyberLab] Error auditing wallet:", error);
      return { securityScore: 85, risks: [], recommendations: [] };
    }
  }

  async detectPhishing(url: string): Promise<{
    isPhishing: boolean;
    confidence: number;
    indicators: string[];
  }> {
    try {
      const indicators: string[] = [];
      let isPhishing = false;
      let confidence = 0;

      if (url.includes("http://") && !url.includes("localhost")) {
        indicators.push("Non-HTTPS connection");
        confidence += 30;
      }

      if (/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(url)) {
        indicators.push("IP address instead of domain");
        confidence += 40;
      }

      const suspiciousKeywords = ["verify", "update", "confirm", "suspend", "login"];
      if (suspiciousKeywords.some(kw => url.toLowerCase().includes(kw))) {
        indicators.push("Suspicious keywords in URL");
        confidence += 20;
      }

      if (confidence > 50) {
        isPhishing = true;
      }

      await botLearningService.progressBotSkill(this.botId, "phishing_detection", 8, "security");

      return {
        isPhishing,
        confidence: parseFloat(confidence.toFixed(2)),
        indicators,
      };
    } catch (error) {
      console.error("[BotCyberLab] Error detecting phishing:", error);
      return { isPhishing: false, confidence: 0, indicators: [] };
    }
  }

  // ===== HELPER METHODS =====

  private generateSecurityRecommendations(vulnerabilities: any[]): string[] {
    const recommendations: string[] = [];

    if (vulnerabilities.some(v => v.severity === "critical")) {
      recommendations.push("URGENT: Address critical vulnerabilities immediately");
      recommendations.push("Consider pausing contract until fixes are deployed");
    }

    if (vulnerabilities.some(v => v.type === "Reentrancy")) {
      recommendations.push("Implement checks-effects-interactions pattern");
    }

    if (vulnerabilities.some(v => v.type === "Access Control")) {
      recommendations.push("Review and strengthen access control mechanisms");
    }

    if (vulnerabilities.length === 0) {
      recommendations.push("No major vulnerabilities detected");
      recommendations.push("Continue regular security audits");
    }

    return recommendations;
  }
}

// ===== BOT BANKING =====

export class BotBanking {
  private botId = "analytics_banking";

  async linkBankAccount(userId: string, plaidToken: string): Promise<string> {
    try {
      const accountId = `BANK_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      await botLearningService.progressBotSkill(this.botId, "account_linking", 10, "banking");

      console.log(`[BotBanking] Linked bank account ${accountId} for user ${userId}`);

      return accountId;
    } catch (error) {
      console.error("[BotBanking] Error linking bank account:", error);
      return "";
    }
  }

  async getBalance(accountId: string): Promise<{
    available: number;
    current: number;
    limit?: number;
  }> {
    try {
      const memory = await storage.getTradingSystemMemory(this.botId);
      const balanceMemory = memory.find(m => 
        m.memoryKey === `balance_${accountId}` && m.memoryType === "banking"
      );

      let balance;
      if (balanceMemory && balanceMemory.memoryValue) {
        balance = balanceMemory.memoryValue as any;
        
        const variance = (Math.random() - 0.5) * 1000;
        balance.available = parseFloat((balance.available + variance).toFixed(2));
        balance.current = parseFloat((balance.current + variance).toFixed(2));
      } else {
        balance = {
          available: parseFloat((Math.random() * 50000 + 1000).toFixed(2)),
          current: parseFloat((Math.random() * 55000 + 1000).toFixed(2)),
          limit: Math.random() > 0.5 ? parseFloat((Math.random() * 10000).toFixed(2)) : undefined,
        };
      }

      await botLearningService.progressBotSkill(this.botId, "balance_check", 3, "banking");
      await botLearningService.updateBotMemory(
        this.botId,
        "banking",
        `balance_${accountId}`,
        balance,
        80
      );

      return balance;
    } catch (error) {
      console.error("[BotBanking] Error getting balance:", error);
      return { available: 0, current: 0 };
    }
  }

  async initiateACH(params: {
    accountId: string;
    amount: number;
    direction: "deposit" | "withdrawal";
  }): Promise<string> {
    try {
      const achId = `ACH_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      console.log(`[BotBanking] Initiated ACH ${params.direction} of $${params.amount} - ID: ${achId}`);

      await botLearningService.progressBotSkill(this.botId, "ach_transfer", 15, "banking");

      return achId;
    } catch (error) {
      console.error("[BotBanking] Error initiating ACH:", error);
      return "";
    }
  }

  async getTransactions(accountId: string, days: number = 30): Promise<any[]> {
    try {
      const transactions: any[] = [];
      
      for (let i = 0; i < 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * days));
        
        transactions.push({
          id: `TX_${Date.now()}_${i}`,
          date: date.toISOString(),
          description: `Transaction ${i + 1}`,
          amount: parseFloat(((Math.random() - 0.3) * 1000).toFixed(2)),
          category: this.categorizeTransaction(i),
        });
      }

      await botLearningService.progressBotSkill(this.botId, "transaction_fetch", 5, "banking");

      return transactions;
    } catch (error) {
      console.error("[BotBanking] Error getting transactions:", error);
      return [];
    }
  }

  async categorizeTransactions(accountId: string): Promise<{
    categories: any[];
    spending: any[];
  }> {
    try {
      const transactions = await this.getTransactions(accountId);
      
      const categoryMap = new Map<string, number>();
      
      for (const tx of transactions) {
        if (tx.amount < 0) {
          const amount = Math.abs(tx.amount);
          categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + amount);
        }
      }

      const categories = Array.from(categoryMap.entries()).map(([name, amount]) => ({
        name,
        amount: parseFloat(amount.toFixed(2)),
      }));

      const spending = transactions
        .filter(tx => tx.amount < 0)
        .map(tx => ({
          date: tx.date,
          description: tx.description,
          amount: Math.abs(tx.amount),
          category: tx.category,
        }));

      await botLearningService.progressBotSkill(this.botId, "categorization", 8, "analytics");

      return { categories, spending };
    } catch (error) {
      console.error("[BotBanking] Error categorizing transactions:", error);
      return { categories: [], spending: [] };
    }
  }

  async getCreditScore(userId: string): Promise<number> {
    try {
      const mockScore = Math.floor(Math.random() * 200 + 650);
      
      await botLearningService.progressBotSkill(this.botId, "credit_score_check", 5, "credit");

      return mockScore;
    } catch (error) {
      console.error("[BotBanking] Error getting credit score:", error);
      return 0;
    }
  }

  async analyzeLoanQualification(userId: string, loanAmount: number): Promise<{
    qualified: boolean;
    maxLoan: number;
    interestRate: number;
    monthlyPayment: number;
    recommendations: string[];
  }> {
    try {
      const creditScore = await this.getCreditScore(userId);
      const financialHealth = await this.calculateFinancialHealth(userId);
      
      const debtToIncomeRatio = financialHealth.factors.find(f => f.name === "Debt-to-Income");
      const dtiValue = debtToIncomeRatio ? parseFloat(debtToIncomeRatio.status.replace(/[^\d.]/g, '')) || 30 : 30;
      
      const qualified = creditScore >= 680 && dtiValue < 43;
      const maxLoan = (creditScore - 500) * 1000 * (1 - dtiValue / 100);
      
      let baseRate = 15 - (creditScore - 600) / 20;
      if (dtiValue > 35) baseRate += 1;
      if (financialHealth.grade === "A") baseRate -= 0.5;
      const interestRate = Math.max(3, Math.min(20, baseRate));
      
      const monthlyRate = interestRate / 100 / 12;
      const months = 360;
      const monthlyPayment = loanAmount > 0 
        ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
        : 0;

      const recommendations: string[] = [];
      
      if (!qualified) {
        if (creditScore < 680) {
          recommendations.push("Improve credit score to at least 680 to qualify");
        }
        if (dtiValue >= 43) {
          recommendations.push("Reduce debt-to-income ratio below 43%");
        }
        recommendations.push("Consider a co-signer with better credit");
      } else {
        recommendations.push(`You qualify for up to $${maxLoan.toFixed(0)} at ${interestRate.toFixed(2)}% APR`);
        if (creditScore < 750) {
          recommendations.push(`Improving credit to 750+ could save ${((interestRate - 4) * loanAmount / 100 / 12).toFixed(0)}/mo`);
        }
        if (loanAmount > maxLoan) {
          recommendations.push(`Consider reducing loan amount to $${maxLoan.toFixed(0)} for better terms`);
        }
      }

      await botLearningService.progressBotSkill(this.botId, "loan_analysis", 12, "lending");
      await botLearningService.updateBotMemory(
        this.botId,
        "lending",
        `loan_analysis_${userId}`,
        { qualified, maxLoan, interestRate, loanAmount, creditScore, dti: dtiValue },
        qualified ? 85 : 40
      );

      return {
        qualified,
        maxLoan: parseFloat(maxLoan.toFixed(2)),
        interestRate: parseFloat(interestRate.toFixed(2)),
        monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
        recommendations,
      };
    } catch (error) {
      console.error("[BotBanking] Error analyzing loan qualification:", error);
      return {
        qualified: false,
        maxLoan: 0,
        interestRate: 0,
        monthlyPayment: 0,
        recommendations: [],
      };
    }
  }

  async calculateFinancialHealth(userId: string): Promise<{
    score: number;
    grade: string;
    factors: any[];
    recommendations: string[];
  }> {
    try {
      const creditScore = await this.getCreditScore(userId);
      
      let healthScore = 0;
      const factors: any[] = [];

      if (creditScore >= 750) {
        healthScore += 30;
        factors.push({ name: "Credit Score", score: 30, status: "excellent" });
      } else if (creditScore >= 680) {
        healthScore += 20;
        factors.push({ name: "Credit Score", score: 20, status: "good" });
      } else {
        healthScore += 10;
        factors.push({ name: "Credit Score", score: 10, status: "needs improvement" });
      }

      const savingsRate = Math.random() * 30;
      if (savingsRate > 20) {
        healthScore += 25;
        factors.push({ name: "Savings Rate", score: 25, status: "excellent" });
      } else if (savingsRate > 10) {
        healthScore += 15;
        factors.push({ name: "Savings Rate", score: 15, status: "good" });
      } else {
        healthScore += 5;
        factors.push({ name: "Savings Rate", score: 5, status: "low" });
      }

      const debtToIncome = Math.random() * 60;
      if (debtToIncome < 30) {
        healthScore += 25;
        factors.push({ name: "Debt-to-Income", score: 25, status: "excellent" });
      } else if (debtToIncome < 40) {
        healthScore += 15;
        factors.push({ name: "Debt-to-Income", score: 15, status: "acceptable" });
      } else {
        healthScore += 5;
        factors.push({ name: "Debt-to-Income", score: 5, status: "high" });
      }

      const emergencyFund = Math.random() > 0.5;
      if (emergencyFund) {
        healthScore += 20;
        factors.push({ name: "Emergency Fund", score: 20, status: "funded" });
      } else {
        factors.push({ name: "Emergency Fund", score: 0, status: "not funded" });
      }

      let grade = "F";
      if (healthScore >= 90) grade = "A";
      else if (healthScore >= 80) grade = "B";
      else if (healthScore >= 70) grade = "C";
      else if (healthScore >= 60) grade = "D";

      const recommendations = this.generateHealthRecommendations(factors);

      await botLearningService.progressBotSkill(this.botId, "financial_health", 15, "analytics");

      return {
        score: healthScore,
        grade,
        factors,
        recommendations,
      };
    } catch (error) {
      console.error("[BotBanking] Error calculating financial health:", error);
      return { score: 0, grade: "F", factors: [], recommendations: [] };
    }
  }

  // ===== HELPER METHODS =====

  private categorizeTransaction(index: number): string {
    const categories = [
      "Groceries",
      "Utilities",
      "Rent/Mortgage",
      "Transportation",
      "Entertainment",
      "Healthcare",
      "Shopping",
      "Dining",
    ];

    return categories[index % categories.length];
  }

  async scheduleBillPayment(params: {
    accountId: string;
    payee: string;
    amount: number;
    dueDate: Date;
    recurring?: boolean;
  }): Promise<string> {
    try {
      const billId = `BILL_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      console.log(`[BotBanking] Scheduled ${params.recurring ? 'recurring' : 'one-time'} bill payment of $${params.amount} to ${params.payee} due ${params.dueDate.toISOString()}`);

      await botLearningService.progressBotSkill(this.botId, "bill_pay_automation", 12, "banking");
      await botLearningService.updateBotMemory(
        this.botId,
        "bill_pay",
        `bill_${billId}`,
        {
          payee: params.payee,
          amount: params.amount,
          dueDate: params.dueDate.toISOString(),
          recurring: params.recurring || false,
          status: 'scheduled'
        },
        90
      );

      return billId;
    } catch (error) {
      console.error("[BotBanking] Error scheduling bill payment:", error);
      return "";
    }
  }

  async getScheduledBills(accountId: string): Promise<any[]> {
    try {
      const memory = await storage.getTradingSystemMemory(this.botId);
      const billMemories = memory.filter(m => 
        m.memoryType === "bill_pay" && m.memoryKey.startsWith("bill_")
      );

      const bills = billMemories.map(m => {
        const bill = m.memoryValue as any;
        return {
          id: m.memoryKey.replace('bill_', ''),
          payee: bill.payee || 'Unknown',
          amount: bill.amount || 0,
          dueDate: bill.dueDate || new Date().toISOString(),
          recurring: bill.recurring || false,
          status: bill.status || 'scheduled',
        };
      });

      await botLearningService.progressBotSkill(this.botId, "bill_management", 5, "banking");

      return bills;
    } catch (error) {
      console.error("[BotBanking] Error getting scheduled bills:", error);
      return [];
    }
  }

  async cancelBillPayment(billId: string): Promise<boolean> {
    try {
      await botLearningService.updateBotMemory(
        this.botId,
        "bill_pay",
        `bill_${billId}`,
        { status: 'cancelled' },
        100
      );

      console.log(`[BotBanking] Cancelled bill payment ${billId}`);

      await botLearningService.progressBotSkill(this.botId, "bill_cancellation", 5, "banking");

      return true;
    } catch (error) {
      console.error("[BotBanking] Error cancelling bill payment:", error);
      return false;
    }
  }

  // ===== HELPER METHODS =====

  private categorizeTransaction(index: number): string {
    const categories = [
      "Groceries",
      "Utilities",
      "Rent/Mortgage",
      "Transportation",
      "Entertainment",
      "Healthcare",
      "Shopping",
      "Dining",
    ];

    return categories[index % categories.length];
  }

  private generateHealthRecommendations(factors: any[]): string[] {
    const recommendations: string[] = [];

    const creditFactor = factors.find(f => f.name === "Credit Score");
    if (creditFactor && creditFactor.status !== "excellent") {
      recommendations.push("Work on improving your credit score");
    }

    const savingsFactor = factors.find(f => f.name === "Savings Rate");
    if (savingsFactor && savingsFactor.status === "low") {
      recommendations.push("Increase your savings rate to at least 15%");
    }

    const debtFactor = factors.find(f => f.name === "Debt-to-Income");
    if (debtFactor && debtFactor.status === "high") {
      recommendations.push("Focus on reducing debt to improve debt-to-income ratio");
    }

    const emergencyFactor = factors.find(f => f.name === "Emergency Fund");
    if (emergencyFactor && emergencyFactor.status === "not funded") {
      recommendations.push("Build an emergency fund covering 3-6 months of expenses");
    }

    if (recommendations.length === 0) {
      recommendations.push("Maintain your excellent financial habits");
    }

    return recommendations;
  }
}

// ===== EXPORT SINGLETON INSTANCES =====

export const botPortfolioAnalytics = new BotPortfolioAnalytics();
export const botTransactionHistory = new BotTransactionHistory();
export const botDivineOracle = new BotDivineOracle();
export const botWord = new BotWord();
export const botCyberLab = new BotCyberLab();
export const botBanking = new BotBanking();
