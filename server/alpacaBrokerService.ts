import Alpaca from '@alpacahq/alpaca-trade-api';

/**
 * Alpaca Broker Service - Real Paper Trading Integration
 * Enables live market execution with paper trading for testing strategies
 */

interface AlpacaConfig {
  keyId: string;
  secretKey: string;
  paper: boolean;
  baseUrl?: string;
}

interface OrderParams {
  symbol: string;
  qty?: number;
  notional?: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  timeInForce: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limitPrice?: number;
  stopPrice?: number;
  trailPrice?: number;
  trailPercent?: number;
  extendedHours?: boolean;
  clientOrderId?: string;
}

interface AccountInfo {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  cash: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  last_maintenance_margin: string;
  sma: string;
  daytrade_count: number;
}

interface Position {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  avg_entry_price: string;
  qty: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

interface Order {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  filled_at: string | null;
  expired_at: string | null;
  canceled_at: string | null;
  failed_at: string | null;
  replaced_at: string | null;
  replaced_by: string | null;
  replaces: string | null;
  asset_id: string;
  symbol: string;
  asset_class: string;
  notional: string | null;
  qty: string;
  filled_qty: string;
  filled_avg_price: string | null;
  order_class: string;
  order_type: string;
  type: string;
  side: string;
  time_in_force: string;
  limit_price: string | null;
  stop_price: string | null;
  status: string;
  extended_hours: boolean;
  legs: any | null;
  trail_percent: string | null;
  trail_price: string | null;
  hwm: string | null;
}

interface Bar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  n?: number;
  vw?: number;
}

class AlpacaBrokerService {
  private alpaca: Alpaca | null = null;
  private config: AlpacaConfig | null = null;
  private dataStream: any = null;
  private streamCallbacks: Map<string, (data: any) => void> = new Map();

  /**
   * Initialize Alpaca API with credentials
   */
  initialize(config?: AlpacaConfig): void {
    try {
      // Use provided config or environment variables
      const keyId = config?.keyId || process.env.ALPACA_API_KEY;
      const secretKey = config?.secretKey || process.env.ALPACA_SECRET_KEY;
      const paper = config?.paper !== undefined ? config.paper : true;

      if (!keyId || !secretKey) {
        throw new Error('Alpaca API credentials not provided. Set ALPACA_API_KEY and ALPACA_SECRET_KEY environment variables.');
      }

      this.config = {
        keyId,
        secretKey,
        paper,
        baseUrl: paper ? 'https://paper-api.alpaca.markets' : 'https://api.alpaca.markets',
      };

      this.alpaca = new Alpaca({
        keyId: this.config.keyId,
        secretKey: this.config.secretKey,
        paper: this.config.paper,
        usePolygon: false,
      });

      console.log(`[AlpacaBroker] Initialized in ${paper ? 'PAPER' : 'LIVE'} trading mode`);
    } catch (error: any) {
      console.error('[AlpacaBroker] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Ensure Alpaca is initialized
   */
  private ensureInitialized(): void {
    if (!this.alpaca) {
      this.initialize();
    }
  }

  /**
   * Get account information
   */
  async getAccount(): Promise<AccountInfo> {
    this.ensureInitialized();
    try {
      const account = await this.alpaca!.getAccount();
      console.log('[AlpacaBroker] Account info retrieved:', {
        buying_power: account.buying_power,
        portfolio_value: account.portfolio_value,
      });
      return account as AccountInfo;
    } catch (error: any) {
      console.error('[AlpacaBroker] Failed to get account:', error);
      throw new Error(`Failed to get account: ${error.message}`);
    }
  }

  /**
   * Get all positions
   */
  async getPositions(): Promise<Position[]> {
    this.ensureInitialized();
    try {
      const positions = await this.alpaca!.getPositions();
      console.log(`[AlpacaBroker] Retrieved ${positions.length} positions`);
      return positions as Position[];
    } catch (error: any) {
      console.error('[AlpacaBroker] Failed to get positions:', error);
      throw new Error(`Failed to get positions: ${error.message}`);
    }
  }

  /**
   * Get position for a specific symbol
   */
  async getPosition(symbol: string): Promise<Position | null> {
    this.ensureInitialized();
    try {
      const position = await this.alpaca!.getPosition(symbol);
      return position as Position;
    } catch (error: any) {
      if (error.message?.includes('position does not exist')) {
        return null;
      }
      console.error(`[AlpacaBroker] Failed to get position for ${symbol}:`, error);
      throw new Error(`Failed to get position: ${error.message}`);
    }
  }

  /**
   * Place an order
   */
  async placeOrder(params: OrderParams): Promise<Order> {
    this.ensureInitialized();
    try {
      console.log('[AlpacaBroker] Placing order:', params);

      const order = await this.alpaca!.createOrder({
        symbol: params.symbol,
        qty: params.qty,
        notional: params.notional,
        side: params.side,
        type: params.type,
        time_in_force: params.timeInForce,
        limit_price: params.limitPrice,
        stop_price: params.stopPrice,
        trail_price: params.trailPrice,
        trail_percent: params.trailPercent,
        extended_hours: params.extendedHours || false,
        client_order_id: params.clientOrderId,
      });

      console.log('[AlpacaBroker] Order placed successfully:', {
        id: order.id,
        symbol: order.symbol,
        side: order.side,
        qty: order.qty,
        status: order.status,
      });

      return order as Order;
    } catch (error: any) {
      console.error('[AlpacaBroker] Failed to place order:', error);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<void> {
    this.ensureInitialized();
    try {
      await this.alpaca!.cancelOrder(orderId);
      console.log(`[AlpacaBroker] Order ${orderId} cancelled`);
    } catch (error: any) {
      console.error(`[AlpacaBroker] Failed to cancel order ${orderId}:`, error);
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }

  /**
   * Get all orders
   */
  async getOrders(params?: {
    status?: 'open' | 'closed' | 'all';
    limit?: number;
    after?: string;
    until?: string;
    direction?: 'asc' | 'desc';
    nested?: boolean;
    symbols?: string;
  }): Promise<Order[]> {
    this.ensureInitialized();
    try {
      const orders = await this.alpaca!.getOrders(params);
      console.log(`[AlpacaBroker] Retrieved ${orders.length} orders`);
      return orders as Order[];
    } catch (error: any) {
      console.error('[AlpacaBroker] Failed to get orders:', error);
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }

  /**
   * Get a specific order
   */
  async getOrder(orderId: string): Promise<Order> {
    this.ensureInitialized();
    try {
      const order = await this.alpaca!.getOrder(orderId);
      return order as Order;
    } catch (error: any) {
      console.error(`[AlpacaBroker] Failed to get order ${orderId}:`, error);
      throw new Error(`Failed to get order: ${error.message}`);
    }
  }

  /**
   * Get historical bars for backtesting
   */
  async getHistoricalBars(params: {
    symbol: string;
    timeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day';
    start: string;
    end?: string;
    limit?: number;
  }): Promise<Bar[]> {
    this.ensureInitialized();
    try {
      const { symbol, timeframe, start, end, limit } = params;
      
      console.log(`[AlpacaBroker] Fetching historical bars for ${symbol} (${timeframe})`);
      
      const bars = await this.alpaca!.getBarsV2(symbol, {
        timeframe,
        start,
        end,
        limit: limit || 1000,
      });

      const barsArray: Bar[] = [];
      for await (const bar of bars) {
        barsArray.push(bar as Bar);
      }

      console.log(`[AlpacaBroker] Retrieved ${barsArray.length} bars for ${symbol}`);
      return barsArray;
    } catch (error: any) {
      console.error('[AlpacaBroker] Failed to get historical bars:', error);
      throw new Error(`Failed to get historical bars: ${error.message}`);
    }
  }

  /**
   * Get latest quote for a symbol
   */
  async getLatestQuote(symbol: string): Promise<any> {
    this.ensureInitialized();
    try {
      const quote = await this.alpaca!.getLatestQuote(symbol);
      return quote;
    } catch (error: any) {
      console.error(`[AlpacaBroker] Failed to get quote for ${symbol}:`, error);
      throw new Error(`Failed to get quote: ${error.message}`);
    }
  }

  /**
   * Get latest trade for a symbol
   */
  async getLatestTrade(symbol: string): Promise<any> {
    this.ensureInitialized();
    try {
      const trade = await this.alpaca!.getLatestTrade(symbol);
      return trade;
    } catch (error: any) {
      console.error(`[AlpacaBroker] Failed to get trade for ${symbol}:`, error);
      throw new Error(`Failed to get trade: ${error.message}`);
    }
  }

  /**
   * Stream real-time market data
   */
  async streamMarketData(symbols: string[], onData: (data: any) => void): Promise<void> {
    this.ensureInitialized();
    try {
      if (!this.dataStream) {
        this.dataStream = this.alpaca!.data_stream_v2;
      }

      // Subscribe to trades and quotes
      symbols.forEach(symbol => {
        this.streamCallbacks.set(symbol, onData);
        
        this.dataStream.onStockTrade((trade: any) => {
          if (trade.Symbol === symbol) {
            const callback = this.streamCallbacks.get(symbol);
            if (callback) {
              callback({
                type: 'trade',
                symbol: trade.Symbol,
                price: trade.Price,
                size: trade.Size,
                timestamp: trade.Timestamp,
              });
            }
          }
        });

        this.dataStream.onStockQuote((quote: any) => {
          if (quote.Symbol === symbol) {
            const callback = this.streamCallbacks.get(symbol);
            if (callback) {
              callback({
                type: 'quote',
                symbol: quote.Symbol,
                bidPrice: quote.BidPrice,
                bidSize: quote.BidSize,
                askPrice: quote.AskPrice,
                askSize: quote.AskSize,
                timestamp: quote.Timestamp,
              });
            }
          }
        });
      });

      // Subscribe to symbols
      this.dataStream.subscribeForTrades(symbols);
      this.dataStream.subscribeForQuotes(symbols);

      // Connect if not already connected
      if (!this.dataStream.conn || this.dataStream.conn.readyState !== 1) {
        await this.dataStream.connect();
        console.log(`[AlpacaBroker] Streaming market data for: ${symbols.join(', ')}`);
      }
    } catch (error: any) {
      console.error('[AlpacaBroker] Failed to stream market data:', error);
      throw new Error(`Failed to stream market data: ${error.message}`);
    }
  }

  /**
   * Stop streaming market data
   */
  async stopStreamMarketData(symbols?: string[]): Promise<void> {
    if (this.dataStream) {
      if (symbols) {
        this.dataStream.unsubscribeFromTrades(symbols);
        this.dataStream.unsubscribeFromQuotes(symbols);
        symbols.forEach(symbol => this.streamCallbacks.delete(symbol));
        console.log(`[AlpacaBroker] Stopped streaming for: ${symbols.join(', ')}`);
      } else {
        await this.dataStream.disconnect();
        this.streamCallbacks.clear();
        this.dataStream = null;
        console.log('[AlpacaBroker] Stopped all market data streaming');
      }
    }
  }

  /**
   * Calculate real-time PnL for positions
   */
  async calculatePnL(): Promise<{
    totalPnL: number;
    totalPnLPercent: number;
    positions: Array<{
      symbol: string;
      qty: number;
      avgEntryPrice: number;
      currentPrice: number;
      pnl: number;
      pnlPercent: number;
      marketValue: number;
    }>;
  }> {
    this.ensureInitialized();
    try {
      const positions = await this.getPositions();
      
      let totalPnL = 0;
      let totalCostBasis = 0;
      
      const positionsWithPnL = positions.map(pos => {
        const pnl = parseFloat(pos.unrealized_pl);
        const costBasis = parseFloat(pos.cost_basis);
        const marketValue = parseFloat(pos.market_value);
        const pnlPercent = (pnl / costBasis) * 100;
        
        totalPnL += pnl;
        totalCostBasis += costBasis;
        
        return {
          symbol: pos.symbol,
          qty: parseFloat(pos.qty),
          avgEntryPrice: parseFloat(pos.avg_entry_price),
          currentPrice: parseFloat(pos.current_price),
          pnl,
          pnlPercent,
          marketValue,
        };
      });

      const totalPnLPercent = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;

      return {
        totalPnL,
        totalPnLPercent,
        positions: positionsWithPnL,
      };
    } catch (error: any) {
      console.error('[AlpacaBroker] Failed to calculate PnL:', error);
      throw new Error(`Failed to calculate PnL: ${error.message}`);
    }
  }

  /**
   * Execute a market order (simplified)
   */
  async marketOrder(symbol: string, qty: number, side: 'buy' | 'sell'): Promise<Order> {
    return this.placeOrder({
      symbol,
      qty,
      side,
      type: 'market',
      timeInForce: 'day',
    });
  }

  /**
   * Execute a limit order
   */
  async limitOrder(symbol: string, qty: number, side: 'buy' | 'sell', limitPrice: number): Promise<Order> {
    return this.placeOrder({
      symbol,
      qty,
      side,
      type: 'limit',
      timeInForce: 'day',
      limitPrice,
    });
  }

  /**
   * Execute a stop order
   */
  async stopOrder(symbol: string, qty: number, side: 'buy' | 'sell', stopPrice: number): Promise<Order> {
    return this.placeOrder({
      symbol,
      qty,
      side,
      type: 'stop',
      timeInForce: 'day',
      stopPrice,
    });
  }

  /**
   * Close a position
   */
  async closePosition(symbol: string, qty?: number): Promise<Order> {
    this.ensureInitialized();
    try {
      const position = await this.getPosition(symbol);
      if (!position) {
        throw new Error(`No position found for ${symbol}`);
      }

      const qtyToClose = qty || Math.abs(parseFloat(position.qty));
      const side = parseFloat(position.qty) > 0 ? 'sell' : 'buy';

      return this.marketOrder(symbol, qtyToClose, side);
    } catch (error: any) {
      console.error(`[AlpacaBroker] Failed to close position for ${symbol}:`, error);
      throw new Error(`Failed to close position: ${error.message}`);
    }
  }

  /**
   * Close all positions
   */
  async closeAllPositions(): Promise<Order[]> {
    this.ensureInitialized();
    try {
      const positions = await this.getPositions();
      const orders: Order[] = [];

      for (const position of positions) {
        const order = await this.closePosition(position.symbol);
        orders.push(order);
      }

      console.log(`[AlpacaBroker] Closed ${orders.length} positions`);
      return orders;
    } catch (error: any) {
      console.error('[AlpacaBroker] Failed to close all positions:', error);
      throw new Error(`Failed to close all positions: ${error.message}`);
    }
  }

  /**
   * Check if market is open
   */
  async isMarketOpen(): Promise<boolean> {
    this.ensureInitialized();
    try {
      const clock = await this.alpaca!.getClock();
      return clock.is_open;
    } catch (error: any) {
      console.error('[AlpacaBroker] Failed to check market status:', error);
      throw new Error(`Failed to check market status: ${error.message}`);
    }
  }

  /**
   * Get market calendar
   */
  async getCalendar(start?: string, end?: string): Promise<any[]> {
    this.ensureInitialized();
    try {
      const calendar = await this.alpaca!.getCalendar({ start, end });
      return calendar;
    } catch (error: any) {
      console.error('[AlpacaBroker] Failed to get calendar:', error);
      throw new Error(`Failed to get calendar: ${error.message}`);
    }
  }
}

export const alpacaBrokerService = new AlpacaBrokerService();
