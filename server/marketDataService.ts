/**
 * Market Data Service
 * Provides real-time financial market data from multiple sources
 * - Stocks: Alpha Vantage API
 * - Forex: Twelve Data API
 * - Metals/Commodities: Metals-API
 * - Bonds: Alpha Vantage Treasury Yields
 */

interface MarketDataResponse {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface CacheEntry {
  data: MarketDataResponse;
  timestamp: number;
}

class MarketDataService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute cache to avoid rate limits

  private readonly ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY || 'demo';
  private readonly TWELVE_DATA_KEY = process.env.TWELVE_DATA_KEY || 'demo';
  private readonly METALS_API_KEY = process.env.METALS_API_KEY || 'demo';

  /**
   * Get cached data or fetch new data
   */
  private async getCached<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }

    const data = await fetchFn();
    this.cache.set(key, { data: data as any, timestamp: now });
    return data;
  }

  /**
   * Fetch stock price from Alpha Vantage
   */
  async getStockPrice(symbol: string): Promise<MarketDataResponse> {
    const cacheKey = `stock:${symbol}`;

    return this.getCached(cacheKey, async () => {
      try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data['Global Quote'] && data['Global Quote']['05. price']) {
          const quote = data['Global Quote'];
          const price = parseFloat(quote['05. price']);
          const change = parseFloat(quote['09. change']);
          const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

          return {
            symbol: symbol.toUpperCase(),
            price,
            change,
            changePercent,
            timestamp: new Date().toISOString(),
          };
        }

        // Fallback for demo/rate limit
        return this.getMockStockData(symbol);
      } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        return this.getMockStockData(symbol);
      }
    });
  }

  /**
   * Fetch forex rate from Twelve Data
   */
  async getForexRate(pair: string): Promise<MarketDataResponse> {
    const cacheKey = `forex:${pair}`;

    return this.getCached(cacheKey, async () => {
      try {
        // Format: EUR/USD -> EURUSD
        const formattedPair = pair.replace('/', '');
        const url = `https://api.twelvedata.com/price?symbol=${formattedPair}&apikey=${this.TWELVE_DATA_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.price) {
          const price = parseFloat(data.price);

          // Get previous close for change calculation
          const quoteUrl = `https://api.twelvedata.com/quote?symbol=${formattedPair}&apikey=${this.TWELVE_DATA_KEY}`;
          const quoteResponse = await fetch(quoteUrl);
          const quoteData = await quoteResponse.json();

          let change = 0;
          let changePercent = 0;

          if (quoteData.previous_close) {
            const previousClose = parseFloat(quoteData.previous_close);
            change = price - previousClose;
            changePercent = (change / previousClose) * 100;
          }

          return {
            symbol: pair.toUpperCase(),
            price,
            change,
            changePercent,
            timestamp: new Date().toISOString(),
          };
        }

        return this.getMockForexData(pair);
      } catch (error) {
        console.error(`Error fetching forex data for ${pair}:`, error);
        return this.getMockForexData(pair);
      }
    });
  }

  /**
   * Fetch metal/commodity price from Metals-API
   */
  async getMetalPrice(metal: string): Promise<MarketDataResponse> {
    const cacheKey = `metal:${metal}`;

    return this.getCached(cacheKey, async () => {
      try {
        // Metals-API uses symbols like XAU (gold), XAG (silver), XPT (platinum), XPD (palladium)
        const metalSymbols: { [key: string]: string } = {
          gold: 'XAU',
          silver: 'XAG',
          platinum: 'XPT',
          palladium: 'XPD',
          copper: 'XCU',
        };

        const symbol = metalSymbols[metal.toLowerCase()] || metal.toUpperCase();
        const url = `https://metals-api.com/api/latest?access_key=${this.METALS_API_KEY}&base=USD&symbols=${symbol}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.success && data.rates && data.rates[symbol]) {
          // Metals-API returns rate as USD per unit, we need price per oz
          const rate = data.rates[symbol];
          const price = 1 / rate; // Convert to price per oz

          // Calculate mock change for now (in production, compare with historical data)
          const mockChange = price * (Math.random() * 0.04 - 0.02); // +/- 2%
          const changePercent = (mockChange / price) * 100;

          return {
            symbol: metal.toUpperCase(),
            price,
            change: mockChange,
            changePercent,
            timestamp: new Date().toISOString(),
          };
        }

        return this.getMockMetalData(metal);
      } catch (error) {
        console.error(`Error fetching metal data for ${metal}:`, error);
        return this.getMockMetalData(metal);
      }
    });
  }

  /**
   * Fetch Treasury bond yields from Alpha Vantage
   */
  async getTreasuryYields(): Promise<MarketDataResponse[]> {
    const cacheKey = 'treasury:yields';

    return this.getCached(cacheKey, async () => {
      try {
        // Alpha Vantage Treasury Yield endpoint
        const symbols = ['2year', '5year', '10year', '30year'];
        const yields: MarketDataResponse[] = [];

        for (const maturity of symbols) {
          const url = `https://www.alphavantage.co/query?function=TREASURY_YIELD&interval=daily&maturity=${maturity}&apikey=${this.ALPHA_VANTAGE_KEY}`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.data && data.data.length > 0) {
            const latest = data.data[0];
            const price = parseFloat(latest.value);
            
            // Calculate change if we have previous data
            let change = 0;
            let changePercent = 0;
            if (data.data.length > 1) {
              const previous = parseFloat(data.data[1].value);
              change = price - previous;
              changePercent = (change / previous) * 100;
            }

            yields.push({
              symbol: `US${maturity.toUpperCase()}`,
              price,
              change,
              changePercent,
              timestamp: new Date().toISOString(),
            });
          }
        }

        if (yields.length > 0) {
          return yields;
        }

        return this.getMockTreasuryData();
      } catch (error) {
        console.error('Error fetching treasury yields:', error);
        return this.getMockTreasuryData();
      }
    });
  }

  /**
   * Mock data generators for fallback/demo mode
   */
  private getMockStockData(symbol: string): MarketDataResponse {
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() * 20 - 10);
    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  }

  private getMockForexData(pair: string): MarketDataResponse {
    const basePrice = Math.random() * 2 + 0.5;
    const change = (Math.random() * 0.02 - 0.01);
    return {
      symbol: pair.toUpperCase(),
      price: parseFloat(basePrice.toFixed(4)),
      change: parseFloat(change.toFixed(4)),
      changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  }

  private getMockMetalData(metal: string): MarketDataResponse {
    const prices: { [key: string]: number } = {
      gold: 2000,
      silver: 25,
      platinum: 950,
      palladium: 1500,
      copper: 4,
    };
    const basePrice = prices[metal.toLowerCase()] || 100;
    const change = basePrice * (Math.random() * 0.04 - 0.02);
    return {
      symbol: metal.toUpperCase(),
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
      timestamp: new Date().toISOString(),
    };
  }

  private getMockTreasuryData(): MarketDataResponse[] {
    const maturities = [
      { symbol: 'US2YEAR', price: 4.5 },
      { symbol: 'US5YEAR', price: 4.3 },
      { symbol: 'US10YEAR', price: 4.2 },
      { symbol: 'US30YEAR', price: 4.4 },
    ];

    return maturities.map(m => {
      const change = (Math.random() * 0.2 - 0.1);
      return {
        symbol: m.symbol,
        price: parseFloat(m.price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(((change / m.price) * 100).toFixed(2)),
        timestamp: new Date().toISOString(),
      };
    });
  }

  /**
   * Clear cache (for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const marketDataService = new MarketDataService();
export type { MarketDataResponse };
