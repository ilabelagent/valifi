import Alpaca from "@alpacahq/alpaca-trade-api";
import { storage } from "./storage";
import { encryptionService } from "./encryptionService";
import { botLearningService } from "./botLearningService";
import type {
  BrokerAccount,
  InsertBrokerAccount,
  InsertBrokerOrder,
  InsertBrokerPosition,
  BrokerOrder,
  BrokerPosition,
} from "@shared/schema";

/**
 * Broker Integration Service
 * Integrates trading bots with real broker APIs (Alpaca, Interactive Brokers, etc.)
 * Supports paper trading and live trading with full order execution and portfolio tracking
 */

interface AlpacaCredentials {
  keyId: string;
  secretKey: string;
  paper: boolean;
}

interface OrderRequest {
  symbol: string;
  qty: number;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop" | "stop_limit" | "trailing_stop";
  time_in_force?: "day" | "gtc" | "ioc" | "fok";
  limit_price?: number;
  stop_price?: number;
  trail_price?: number;
  trail_percent?: number;
}

interface MarketDataSnapshot {
  symbol: string;
  latestTrade: {
    price: number;
    size: number;
    timestamp: string;
  };
  latestQuote: {
    bidPrice: number;
    askPrice: number;
    bidSize: number;
    askSize: number;
    timestamp: string;
  };
  previousClose: number;
  volume: number;
}

export class BrokerIntegrationService {
  private alpacaClients: Map<string, Alpaca> = new Map();

  /**
   * Connect broker account with encrypted credentials
   */
  async connectBroker(
    userId: string,
    provider: "alpaca" | "interactive_brokers" | "td_ameritrade" | "binance" | "bybit",
    apiKey: string,
    apiSecret: string,
    accountType: "paper" | "live" = "paper"
  ): Promise<BrokerAccount> {
    try {
      // Encrypt credentials with user-specific encryption
      const apiKeyEncrypted = encryptionService.encrypt(apiKey, userId);
      const apiSecretEncrypted = encryptionService.encrypt(apiSecret, userId);

      // Validate credentials by attempting connection
      if (provider === "alpaca") {
        const alpaca = new Alpaca({
          keyId: apiKey,
          secretKey: apiSecret,
          paper: accountType === "paper",
        });

        // Test connection and get account info
        const accountInfo = await alpaca.getAccount();

        // Create broker account record
        const brokerAccount: InsertBrokerAccount = {
          userId,
          provider,
          accountType,
          apiKeyEncrypted,
          apiSecretEncrypted,
          accountId: accountInfo.id,
          status: "active",
          buyingPower: accountInfo.buying_power,
          cashBalance: accountInfo.cash,
          portfolioValue: accountInfo.portfolio_value,
          lastSyncAt: new Date(),
          metadata: {
            accountNumber: accountInfo.account_number,
            status: accountInfo.status,
            currency: accountInfo.currency,
            createdAt: accountInfo.created_at,
          },
        };

        const createdAccount = await storage.createBrokerAccount(brokerAccount);

        // Cache Alpaca client for reuse
        this.alpacaClients.set(createdAccount.id, alpaca);

        console.log(
          `[BrokerIntegration] Connected ${provider} ${accountType} account for user ${userId}`
        );

        return createdAccount;
      }

      throw new Error(`Provider ${provider} not yet supported`);
    } catch (error: any) {
      console.error(`[BrokerIntegration] Failed to connect broker:`, error);
      throw new Error(`Failed to connect broker: ${error.message}`);
    }
  }

  /**
   * Get or create Alpaca client for broker account
   */
  private async getAlpacaClient(brokerAccountId: string): Promise<Alpaca> {
    // Check cache first
    if (this.alpacaClients.has(brokerAccountId)) {
      return this.alpacaClients.get(brokerAccountId)!;
    }

    // Load from storage and decrypt credentials
    const account = await storage.getBrokerAccount(brokerAccountId);
    if (!account) {
      throw new Error("Broker account not found");
    }

    if (account.provider !== "alpaca") {
      throw new Error(`Provider ${account.provider} not yet supported`);
    }

    // Decrypt credentials
    const apiKey = encryptionService.decrypt(account.apiKeyEncrypted, account.userId);
    const apiSecret = encryptionService.decrypt(account.apiSecretEncrypted, account.userId);

    // Create and cache client
    const alpaca = new Alpaca({
      keyId: apiKey,
      secretKey: apiSecret,
      paper: account.accountType === "paper",
    });

    this.alpacaClients.set(brokerAccountId, alpaca);
    return alpaca;
  }

  /**
   * Get account information
   */
  async getAccountInfo(brokerAccountId: string): Promise<any> {
    try {
      const alpaca = await this.getAlpacaClient(brokerAccountId);
      const account = await alpaca.getAccount();

      // Update cached account data
      await storage.updateBrokerAccount(brokerAccountId, {
        buyingPower: account.buying_power,
        cashBalance: account.cash,
        portfolioValue: account.portfolio_value,
        lastSyncAt: new Date(),
      });

      return {
        id: account.id,
        accountNumber: account.account_number,
        status: account.status,
        currency: account.currency,
        buyingPower: account.buying_power,
        cash: account.cash,
        portfolioValue: account.portfolio_value,
        equity: account.equity,
        lastEquity: account.last_equity,
        daytradeCount: account.daytrade_count,
        patternDayTrader: account.pattern_day_trader,
        tradingBlocked: account.trading_blocked,
        transfersBlocked: account.transfers_blocked,
        accountBlocked: account.account_blocked,
        createdAt: account.created_at,
        tradeSuspendedByUser: account.trade_suspended_by_user,
        multiplier: account.multiplier,
        shortingEnabled: account.shorting_enabled,
        longMarketValue: account.long_market_value,
        shortMarketValue: account.short_market_value,
        initialMargin: account.initial_margin,
        maintenanceMargin: account.maintenance_margin,
      };
    } catch (error: any) {
      console.error(`[BrokerIntegration] Failed to get account info:`, error);
      throw new Error(`Failed to get account info: ${error.message}`);
    }
  }

  /**
   * Place order (market, limit, stop, etc.)
   */
  async placeOrder(
    brokerAccountId: string,
    orderRequest: OrderRequest,
    botId?: string,
    botExecutionId?: string
  ): Promise<BrokerOrder> {
    try {
      const alpaca = await this.getAlpacaClient(brokerAccountId);

      // Submit order to Alpaca
      const alpacaOrder = await alpaca.createOrder({
        symbol: orderRequest.symbol,
        qty: orderRequest.qty,
        side: orderRequest.side,
        type: orderRequest.type,
        time_in_force: orderRequest.time_in_force || "day",
        limit_price: orderRequest.limit_price,
        stop_price: orderRequest.stop_price,
        trail_price: orderRequest.trail_price,
        trail_percent: orderRequest.trail_percent,
      });

      // Create broker order record
      const brokerOrder: InsertBrokerOrder = {
        brokerAccountId,
        botId: botId || null,
        botExecutionId: botExecutionId || null,
        externalOrderId: alpacaOrder.id,
        symbol: alpacaOrder.symbol,
        orderType: orderRequest.type,
        orderSide: orderRequest.side,
        timeInForce: (orderRequest.time_in_force || "day") as any,
        quantity: alpacaOrder.qty.toString(),
        limitPrice: alpacaOrder.limit_price ? alpacaOrder.limit_price.toString() : null,
        stopPrice: alpacaOrder.stop_price ? alpacaOrder.stop_price.toString() : null,
        filledQuantity: alpacaOrder.filled_qty ? alpacaOrder.filled_qty.toString() : "0",
        filledAvgPrice: alpacaOrder.filled_avg_price
          ? alpacaOrder.filled_avg_price.toString()
          : null,
        status: this.mapAlpacaOrderStatus(alpacaOrder.status),
        fees: null,
        reason: orderRequest.type,
        metadata: {
          clientOrderId: alpacaOrder.client_order_id,
          assetClass: alpacaOrder.asset_class,
          createdAt: alpacaOrder.created_at,
          submittedAt: alpacaOrder.submitted_at,
        },
      };

      const createdOrder = await storage.createBrokerOrder(brokerOrder);

      console.log(
        `[BrokerIntegration] Placed ${orderRequest.side} order for ${orderRequest.qty} ${orderRequest.symbol} (ID: ${createdOrder.id})`
      );

      // Update bot execution with order ID if linked
      if (botExecutionId) {
        await storage.updateBotExecution(botExecutionId, {
          orderId: createdOrder.externalOrderId,
          status: "running",
        });
      }

      return createdOrder;
    } catch (error: any) {
      console.error(`[BrokerIntegration] Failed to place order:`, error);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  /**
   * Get all positions for account
   */
  async getPositions(brokerAccountId: string): Promise<BrokerPosition[]> {
    try {
      const alpaca = await this.getAlpacaClient(brokerAccountId);
      const alpacaPositions = await alpaca.getPositions();

      // Update positions in database
      const positions: BrokerPosition[] = [];

      for (const pos of alpacaPositions) {
        const position: InsertBrokerPosition = {
          brokerAccountId,
          symbol: pos.symbol,
          quantity: pos.qty,
          averageEntryPrice: pos.avg_entry_price,
          currentPrice: pos.current_price,
          marketValue: pos.market_value,
          unrealizedPL: pos.unrealized_pl,
          unrealizedPLPercent: pos.unrealized_plpc,
          costBasis: pos.cost_basis,
          side: pos.side,
          metadata: {
            assetClass: pos.asset_class,
            exchange: pos.exchange,
            assetId: pos.asset_id,
            changeToday: pos.change_today,
          },
        };

        const existingPosition = await storage.getBrokerPositionBySymbol(
          brokerAccountId,
          pos.symbol
        );

        if (existingPosition) {
          const updated = await storage.updateBrokerPosition(existingPosition.id, position);
          positions.push(updated!);
        } else {
          const created = await storage.createBrokerPosition(position);
          positions.push(created);
        }
      }

      console.log(`[BrokerIntegration] Synced ${positions.length} positions`);
      return positions;
    } catch (error: any) {
      console.error(`[BrokerIntegration] Failed to get positions:`, error);
      throw new Error(`Failed to get positions: ${error.message}`);
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(
    brokerAccountId: string,
    options?: {
      status?: "open" | "closed" | "all";
      limit?: number;
      after?: string;
      until?: string;
      direction?: "asc" | "desc";
    }
  ): Promise<BrokerOrder[]> {
    try {
      const alpaca = await this.getAlpacaClient(brokerAccountId);

      const alpacaOrders = await alpaca.getOrders({
        status: options?.status || "all",
        limit: options?.limit || 100,
        after: options?.after,
        until: options?.until,
        direction: options?.direction || "desc",
      });

      // Sync orders to database
      const orders: BrokerOrder[] = [];

      for (const order of alpacaOrders) {
        const existingOrder = await storage.getBrokerOrderByExternalId(order.id);

        const brokerOrder: InsertBrokerOrder = {
          brokerAccountId,
          botId: null,
          botExecutionId: null,
          externalOrderId: order.id,
          symbol: order.symbol,
          orderType: order.type as any,
          orderSide: order.side,
          timeInForce: order.time_in_force as any,
          quantity: order.qty.toString(),
          limitPrice: order.limit_price ? order.limit_price.toString() : null,
          stopPrice: order.stop_price ? order.stop_price.toString() : null,
          filledQuantity: order.filled_qty ? order.filled_qty.toString() : "0",
          filledAvgPrice: order.filled_avg_price ? order.filled_avg_price.toString() : null,
          status: this.mapAlpacaOrderStatus(order.status),
          fees: null,
          reason: null,
          metadata: {
            clientOrderId: order.client_order_id,
            assetClass: order.asset_class,
          },
          filledAt: order.filled_at ? new Date(order.filled_at) : null,
          cancelledAt: order.cancelled_at ? new Date(order.cancelled_at) : null,
        };

        if (existingOrder) {
          const updated = await storage.updateBrokerOrder(existingOrder.id, brokerOrder);
          orders.push(updated!);
        } else {
          const created = await storage.createBrokerOrder(brokerOrder);
          orders.push(created);
        }
      }

      return orders;
    } catch (error: any) {
      console.error(`[BrokerIntegration] Failed to get order history:`, error);
      throw new Error(`Failed to get order history: ${error.message}`);
    }
  }

  /**
   * Get market data for symbol
   */
  async getMarketData(brokerAccountId: string, symbol: string): Promise<MarketDataSnapshot> {
    try {
      const alpaca = await this.getAlpacaClient(brokerAccountId);

      // Get latest trade
      const latestTrade = await alpaca.getLatestTrade(symbol);

      // Get latest quote
      const latestQuote = await alpaca.getLatestQuote(symbol);

      // Get snapshot for additional data
      const snapshot = await alpaca.getSnapshot(symbol);

      return {
        symbol,
        latestTrade: {
          price: latestTrade.Price,
          size: latestTrade.Size,
          timestamp: latestTrade.Timestamp,
        },
        latestQuote: {
          bidPrice: latestQuote.BidPrice,
          askPrice: latestQuote.AskPrice,
          bidSize: latestQuote.BidSize,
          askSize: latestQuote.AskSize,
          timestamp: latestQuote.Timestamp,
        },
        previousClose: snapshot.prevDailyBar?.c || latestTrade.Price,
        volume: snapshot.dailyBar?.v || 0,
      };
    } catch (error: any) {
      console.error(`[BrokerIntegration] Failed to get market data:`, error);
      throw new Error(`Failed to get market data: ${error.message}`);
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(brokerAccountId: string, orderId: string): Promise<BrokerOrder> {
    try {
      const alpaca = await this.getAlpacaClient(brokerAccountId);

      const order = await storage.getBrokerOrder(orderId);
      if (!order || order.brokerAccountId !== brokerAccountId) {
        throw new Error("Order not found or access denied");
      }

      // Cancel order on Alpaca
      await alpaca.cancelOrder(order.externalOrderId!);

      // Update order status
      const updated = await storage.updateBrokerOrder(orderId, {
        status: "cancelled",
        cancelledAt: new Date(),
      });

      console.log(`[BrokerIntegration] Cancelled order ${orderId}`);
      return updated!;
    } catch (error: any) {
      console.error(`[BrokerIntegration] Failed to cancel order:`, error);
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }

  /**
   * Execute bot trade through broker
   */
  async executeBotTrade(
    botId: string,
    botExecutionId: string,
    action: "buy" | "sell",
    symbol: string,
    quantity: number,
    orderType: "market" | "limit" | "stop" = "market",
    limitPrice?: number,
    stopPrice?: number
  ): Promise<BrokerOrder> {
    try {
      // Get bot's associated broker account
      const bot = await storage.getBot(botId);
      if (!bot) {
        throw new Error("Bot not found");
      }

      // Find user's broker account (get first active Alpaca account)
      const brokerAccounts = await storage.getUserBrokerAccounts(bot.userId);
      const alpacaAccount = brokerAccounts.find(
        (acc) => acc.provider === "alpaca" && acc.status === "active"
      );

      if (!alpacaAccount) {
        throw new Error("No active Alpaca broker account found for user");
      }

      // Place order through broker
      const order = await this.placeOrder(
        alpacaAccount.id,
        {
          symbol,
          qty: quantity,
          side: action,
          type: orderType,
          time_in_force: "day",
          limit_price: limitPrice,
          stop_price: stopPrice,
        },
        botId,
        botExecutionId
      );

      // Record in learning system for bot improvement
      await botLearningService.recordBotAction(
        botId,
        `broker_trade_${action}`,
        {
          symbol,
          quantity,
          orderType,
          limitPrice,
          stopPrice,
        },
        {
          orderId: order.id,
          externalOrderId: order.externalOrderId,
          status: order.status,
        },
        order.status === "filled",
        parseFloat(order.filledAvgPrice || "0") * quantity
      );

      console.log(
        `[BrokerIntegration] Executed bot trade: ${action} ${quantity} ${symbol} for bot ${botId}`
      );

      return order;
    } catch (error: any) {
      console.error(`[BrokerIntegration] Failed to execute bot trade:`, error);
      throw new Error(`Failed to execute bot trade: ${error.message}`);
    }
  }

  /**
   * Map Alpaca order status to our schema
   */
  private mapAlpacaOrderStatus(
    alpacaStatus: string
  ):
    | "pending"
    | "submitted"
    | "filled"
    | "partially_filled"
    | "cancelled"
    | "rejected"
    | "expired" {
    const statusMap: Record<string, any> = {
      new: "pending",
      pending_new: "pending",
      accepted: "submitted",
      partial_fill: "partially_filled",
      filled: "filled",
      done_for_day: "filled",
      canceled: "cancelled",
      expired: "expired",
      replaced: "cancelled",
      pending_cancel: "cancelled",
      pending_replace: "cancelled",
      rejected: "rejected",
      suspended: "rejected",
      calculated: "pending",
    };

    return statusMap[alpacaStatus] || "pending";
  }

  /**
   * Setup WebSocket streaming for real-time market data
   */
  async setupMarketDataStream(
    brokerAccountId: string,
    symbols: string[],
    onTrade: (trade: any) => void,
    onQuote: (quote: any) => void
  ): Promise<void> {
    try {
      const alpaca = await this.getAlpacaClient(brokerAccountId);

      const dataStream = alpaca.data_ws;

      dataStream.onConnect(() => {
        console.log(`[BrokerIntegration] Market data stream connected`);
        dataStream.subscribeForTrades(symbols);
        dataStream.subscribeForQuotes(symbols);
      });

      dataStream.onStockTrade((trade: any) => {
        onTrade(trade);
      });

      dataStream.onStockQuote((quote: any) => {
        onQuote(quote);
      });

      dataStream.onDisconnect(() => {
        console.log(`[BrokerIntegration] Market data stream disconnected`);
      });

      dataStream.onError((error: any) => {
        console.error(`[BrokerIntegration] Market data stream error:`, error);
      });

      dataStream.connect();

      console.log(`[BrokerIntegration] Market data stream setup for ${symbols.join(", ")}`);
    } catch (error: any) {
      console.error(`[BrokerIntegration] Failed to setup market data stream:`, error);
      throw new Error(`Failed to setup market data stream: ${error.message}`);
    }
  }
}

export const brokerIntegrationService = new BrokerIntegrationService();
