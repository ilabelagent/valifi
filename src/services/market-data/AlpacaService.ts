import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';
import { pgPool } from '../../config/aws-rds-config';

interface AlpacaConfig {
  apiKey: string;
  apiSecret: string;
  paperTrading: boolean;
  baseUrl: string;
  dataUrl: string;
  wsUrl: string;
}

interface MarketQuote {
  symbol: string;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  timestamp: string;
}

interface MarketTrade {
  symbol: string;
  price: number;
  size: number;
  timestamp: string;
  conditions: string[];
}

interface MarketBar {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
  timeframe: string;
}

export class AlpacaService {
  private config: AlpacaConfig;
  private apiClient: AxiosInstance;
  private dataClient: AxiosInstance;
  private ws: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();

  constructor() {
    this.config = {
      apiKey: process.env.ALPACA_API_KEY || '',
      apiSecret: process.env.ALPACA_API_SECRET || '',
      paperTrading: process.env.ALPACA_PAPER_TRADING === 'true',
      baseUrl: process.env.ALPACA_PAPER_TRADING === 'true'
        ? 'https://paper-api.alpaca.markets/v2'
        : 'https://api.alpaca.markets/v2',
      dataUrl: 'https://data.alpaca.markets/v2',
      wsUrl: 'wss://stream.data.alpaca.markets/v2/iex'
    };

    this.apiClient = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'APCA-API-KEY-ID': this.config.apiKey,
        'APCA-API-SECRET-KEY': this.config.apiSecret
      }
    });

    this.dataClient = axios.create({
      baseURL: this.config.dataUrl,
      headers: {
        'APCA-API-KEY-ID': this.config.apiKey,
        'APCA-API-SECRET-KEY': this.config.apiSecret
      }
    });
  }

  async initializeWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.config.wsUrl);

      this.ws.on('open', () => {
        console.log('✅ Alpaca WebSocket connected');

        // Authenticate
        this.ws?.send(JSON.stringify({
          action: 'auth',
          key: this.config.apiKey,
          secret: this.config.apiSecret
        }));
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(message);

          if (message[0]?.T === 'success' && message[0]?.msg === 'authenticated') {
            resolve();
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      this.ws.on('error', (error) => {
        console.error('Alpaca WebSocket error:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('Alpaca WebSocket disconnected');
        // Reconnect after 5 seconds
        setTimeout(() => {
          this.initializeWebSocket();
        }, 5000);
      });
    });
  }

  private async handleWebSocketMessage(messages: any[]): Promise<void> {
    for (const message of messages) {
      try {
        switch (message.T) {
          case 'q': // Quote
            await this.handleQuote(message);
            break;
          case 't': // Trade
            await this.handleTrade(message);
            break;
          case 'b': // Bar
            await this.handleBar(message);
            break;
          default:
            // Handle other message types if needed
            break;
        }
      } catch (error) {
        console.error('Error handling market data:', error);
      }
    }
  }

  private async handleQuote(data: any): Promise<void> {
    const quote: MarketQuote = {
      symbol: data.S,
      bid: data.bp,
      ask: data.ap,
      bidSize: data.bs,
      askSize: data.as,
      timestamp: new Date(data.t).toISOString()
    };

    // Cache quote data
    await this.cacheMarketData(quote.symbol, 'quote', quote);
  }

  private async handleTrade(data: any): Promise<void> {
    const trade: MarketTrade = {
      symbol: data.S,
      price: data.p,
      size: data.s,
      timestamp: new Date(data.t).toISOString(),
      conditions: data.c || []
    };

    // Cache trade data
    await this.cacheMarketData(trade.symbol, 'trade', trade);
  }

  private async handleBar(data: any): Promise<void> {
    const bar: MarketBar = {
      symbol: data.S,
      open: data.o,
      high: data.h,
      low: data.l,
      close: data.c,
      volume: data.v,
      timestamp: new Date(data.t).toISOString(),
      timeframe: '1min'
    };

    // Cache bar data
    await this.cacheMarketData(bar.symbol, 'bar', bar);
  }

  private async cacheMarketData(symbol: string, dataType: string, data: any): Promise<void> {
    try {
      const query = `
        INSERT INTO market_data_cache (symbol, data_type, data, timestamp)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (symbol, data_type, timestamp)
        DO UPDATE SET data = EXCLUDED.data
      `;

      await pgPool.query(query, [
        symbol,
        dataType,
        JSON.stringify(data),
        data.timestamp
      ]);
    } catch (error) {
      console.error('Error caching market data:', error);
    }
  }

  async subscribeToSymbols(symbols: string[]): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const newSymbols = symbols.filter(symbol => !this.subscriptions.has(symbol));

    if (newSymbols.length > 0) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        quotes: newSymbols,
        trades: newSymbols,
        bars: newSymbols
      }));

      newSymbols.forEach(symbol => this.subscriptions.add(symbol));
    }
  }

  async unsubscribeFromSymbols(symbols: string[]): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const subscribedSymbols = symbols.filter(symbol => this.subscriptions.has(symbol));

    if (subscribedSymbols.length > 0) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        quotes: subscribedSymbols,
        trades: subscribedSymbols,
        bars: subscribedSymbols
      }));

      subscribedSymbols.forEach(symbol => this.subscriptions.delete(symbol));
    }
  }

  async getLatestQuote(symbol: string): Promise<MarketQuote | null> {
    try {
      const response = await this.dataClient.get(`/stocks/${symbol}/quotes/latest`);
      const quote = response.data.quote;

      return {
        symbol: symbol,
        bid: quote.bp,
        ask: quote.ap,
        bidSize: quote.bs,
        askSize: quote.as,
        timestamp: quote.t
      };
    } catch (error) {
      console.error('Error fetching latest quote:', error);
      return null;
    }
  }

  async getHistoricalBars(
    symbol: string,
    timeframe: string = '1Day',
    start: string,
    end: string,
    limit: number = 1000
  ): Promise<MarketBar[]> {
    try {
      const response = await this.dataClient.get(`/stocks/${symbol}/bars`, {
        params: {
          timeframe,
          start,
          end,
          limit,
          adjustment: 'raw',
          page_token: null
        }
      });

      return response.data.bars.map((bar: any) => ({
        symbol: symbol,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v,
        timestamp: bar.t,
        timeframe: timeframe
      }));
    } catch (error) {
      console.error('Error fetching historical bars:', error);
      return [];
    }
  }

  async createTradingAccount(userId: string): Promise<any> {
    try {
      // Get account info from Alpaca
      const accountResponse = await this.apiClient.get('/account');
      const account = accountResponse.data;

      // Store trading account
      const query = `
        INSERT INTO trading_accounts (
          user_id, broker, account_number, account_status,
          is_paper_trading, buying_power, portfolio_value, cash_balance
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await pgPool.query(query, [
        userId,
        'alpaca',
        account.account_number,
        account.status,
        this.config.paperTrading,
        parseFloat(account.buying_power),
        parseFloat(account.portfolio_value),
        parseFloat(account.cash)
      ]);

      return {
        success: true,
        account: result.rows[0]
      };
    } catch (error) {
      console.error('Error creating Alpaca trading account:', error);
      throw error;
    }
  }

  async placeOrder(orderData: {
    userId: string;
    symbol: string;
    qty: number;
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop' | 'stop_limit';
    timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
    limitPrice?: number;
    stopPrice?: number;
  }): Promise<any> {
    try {
      // Place order with Alpaca
      const orderRequest = {
        symbol: orderData.symbol,
        qty: orderData.qty,
        side: orderData.side,
        type: orderData.type,
        time_in_force: orderData.timeInForce,
        limit_price: orderData.limitPrice,
        stop_price: orderData.stopPrice
      };

      const response = await this.apiClient.post('/orders', orderRequest);
      const alpacaOrder = response.data;

      // Store order in database
      const query = `
        INSERT INTO orders (
          user_id, order_type, side, symbol, quantity, price, stop_price,
          time_in_force, status, broker_order_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const result = await pgPool.query(query, [
        orderData.userId,
        orderData.type,
        orderData.side,
        orderData.symbol,
        orderData.qty,
        orderData.limitPrice,
        orderData.stopPrice,
        orderData.timeInForce,
        alpacaOrder.status,
        alpacaOrder.id
      ]);

      return {
        success: true,
        order: result.rows[0],
        alpacaOrderId: alpacaOrder.id
      };
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  async getPositions(userId: string): Promise<any[]> {
    try {
      const response = await this.apiClient.get('/positions');
      const positions = response.data;

      // Update positions in database
      for (const position of positions) {
        const query = `
          INSERT INTO positions (
            user_id, symbol, quantity, avg_entry_price, current_price,
            market_value, unrealized_pnl, position_type
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (user_id, symbol)
          DO UPDATE SET
            quantity = EXCLUDED.quantity,
            current_price = EXCLUDED.current_price,
            market_value = EXCLUDED.market_value,
            unrealized_pnl = EXCLUDED.unrealized_pnl,
            updated_at = CURRENT_TIMESTAMP
        `;

        await pgPool.query(query, [
          userId,
          position.symbol,
          parseFloat(position.qty),
          parseFloat(position.avg_entry_price),
          parseFloat(position.current_price),
          parseFloat(position.market_value),
          parseFloat(position.unrealized_pl),
          parseFloat(position.qty) > 0 ? 'long' : 'short'
        ]);
      }

      return positions;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }
}

export default new AlpacaService();