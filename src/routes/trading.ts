import { Elysia, t } from 'elysia';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { AuthService } from '../services/auth.service';

// Trading schemas
const stockOrderSchema = z.object({
  symbol: z.string().min(1).max(10),
  quantity: z.number().positive().int(),
  type: z.enum(['buy', 'sell']),
  orderType: z.enum(['market', 'limit', 'stop', 'stop-limit']),
  price: z.number().positive().optional(),
  stopPrice: z.number().positive().optional(),
});

const portfolioSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['conservative', 'moderate', 'aggressive', 'custom']),
});

// Mock market data (in production, connect to real market data API)
const marketData = new Map([
  ['AAPL', { symbol: 'AAPL', name: 'Apple Inc.', price: 195.89, change: 2.45, changePercent: 1.27 }],
  ['GOOGL', { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 151.22, change: -0.83, changePercent: -0.55 }],
  ['MSFT', { symbol: 'MSFT', name: 'Microsoft Corp.', price: 428.71, change: 5.21, changePercent: 1.23 }],
  ['AMZN', { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 183.66, change: 3.12, changePercent: 1.73 }],
  ['TSLA', { symbol: 'TSLA', name: 'Tesla Inc.', price: 251.44, change: -4.56, changePercent: -1.78 }],
]);

// In-memory stores
const portfolios = new Map();
const holdings = new Map();
const orders = new Map();
const watchlists = new Map();

export const tradingRouter = new Elysia({ prefix: '/api/v1/trading' })
  // Market Data
  .get(
    '/stocks',
    async ({ query }) => {
      const { search, symbols } = query;
      
      let stocks = Array.from(marketData.values());
      
      if (search) {
        stocks = stocks.filter(s => 
          s.symbol.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (symbols) {
        const symbolList = symbols.split(',').map(s => s.toUpperCase());
        stocks = stocks.filter(s => symbolList.includes(s.symbol));
      }

      return {
        success: true,
        data: stocks,
      };
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
        symbols: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Get stock quotes',
        description: 'Get real-time stock market data',
        tags: ['Trading'],
      },
    }
  )
  .get(
    '/stocks/:symbol',
    async ({ params: { symbol } }) => {
      const stock = marketData.get(symbol.toUpperCase());
      
      if (!stock) {
        return {
          success: false,
          error: 'Stock not found',
        };
      }

      // Add more detailed data
      const detailed = {
        ...stock,
        open: stock.price - Math.random() * 5,
        high: stock.price + Math.random() * 10,
        low: stock.price - Math.random() * 10,
        volume: Math.floor(Math.random() * 100000000),
        marketCap: Math.floor(stock.price * 1000000000 * Math.random() * 10),
        pe: (Math.random() * 30).toFixed(2),
        eps: (Math.random() * 10).toFixed(2),
        dividend: (Math.random() * 2).toFixed(2),
      };

      return {
        success: true,
        data: detailed,
      };
    },
    {
      params: t.Object({
        symbol: t.String(),
      }),
      detail: {
        summary: 'Get stock details',
        description: 'Get detailed information for a specific stock',
        tags: ['Trading'],
      },
    }
  )
  // Orders
  .post(
    '/orders',
    async ({ body, headers, set }) => {
      const token = headers.authorization?.replace('Bearer ', '');
      if (!token) {
        set.status = 401;
        return { success: false, error: 'Unauthorized' };
      }

      const user = await AuthService.getCurrentUser(token);
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Invalid token' };
      }

      const validated = stockOrderSchema.parse(body);
      const stock = marketData.get(validated.symbol.toUpperCase());
      
      if (!stock) {
        set.status = 400;
        return { success: false, error: 'Invalid stock symbol' };
      }

      const orderId = crypto.randomUUID();
      const order = {
        id: orderId,
        userId: user.id,
        ...validated,
        symbol: validated.symbol.toUpperCase(),
        status: validated.orderType === 'market' ? 'filled' : 'pending',
        filledPrice: validated.orderType === 'market' ? stock.price : null,
        filledAt: validated.orderType === 'market' ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      orders.set(orderId, order);
      
      // Update holdings if market order
      if (order.status === 'filled') {
        const userHoldings = holdings.get(user.id) || {};
        const currentHolding = userHoldings[validated.symbol] || { quantity: 0, avgPrice: 0 };
        
        if (validated.type === 'buy') {
          const newQuantity = currentHolding.quantity + validated.quantity;
          const newAvgPrice = (
            (currentHolding.avgPrice * currentHolding.quantity + 
             stock.price * validated.quantity) / newQuantity
          );
          userHoldings[validated.symbol] = {
            quantity: newQuantity,
            avgPrice: newAvgPrice,
          };
        } else if (validated.type === 'sell') {
          userHoldings[validated.symbol] = {
            quantity: Math.max(0, currentHolding.quantity - validated.quantity),
            avgPrice: currentHolding.avgPrice,
          };
        }
        
        holdings.set(user.id, userHoldings);
      }

      logger.info(`Order ${orderId} placed by user ${user.email}`);

      return {
        success: true,
        data: order,
      };
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      body: t.Object({
        symbol: t.String(),
        quantity: t.Number(),
        type: t.Union([t.Literal('buy'), t.Literal('sell')]),
        orderType: t.Union([
          t.Literal('market'),
          t.Literal('limit'),
          t.Literal('stop'),
          t.Literal('stop-limit'),
        ]),
        price: t.Optional(t.Number()),
        stopPrice: t.Optional(t.Number()),
      }),
      detail: {
        summary: 'Place order',
        description: 'Place a buy or sell order',
        tags: ['Trading'],
      },
    }
  )
  .get(
    '/orders',
    async ({ headers, set }) => {
      const token = headers.authorization?.replace('Bearer ', '');
      if (!token) {
        set.status = 401;
        return { success: false, error: 'Unauthorized' };
      }

      const user = await AuthService.getCurrentUser(token);
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Invalid token' };
      }

      const userOrders = Array.from(orders.values())
        .filter((order: any) => order.userId === user.id)
        .sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      return {
        success: true,
        data: userOrders,
      };
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Get orders',
        description: 'Get all orders for the authenticated user',
        tags: ['Trading'],
      },
    }
  )
  // Portfolio
  .get(
    '/portfolio',
    async ({ headers, set }) => {
      const token = headers.authorization?.replace('Bearer ', '');
      if (!token) {
        set.status = 401;
        return { success: false, error: 'Unauthorized' };
      }

      const user = await AuthService.getCurrentUser(token);
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Invalid token' };
      }

      const userHoldings = holdings.get(user.id) || {};
      const portfolioData = Object.entries(userHoldings).map(([symbol, holding]: any) => {
        const stock = marketData.get(symbol);
        const currentPrice = stock?.price || 0;
        const marketValue = currentPrice * holding.quantity;
        const costBasis = holding.avgPrice * holding.quantity;
        const gainLoss = marketValue - costBasis;
        const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

        return {
          symbol,
          name: stock?.name || symbol,
          quantity: holding.quantity,
          avgPrice: holding.avgPrice,
          currentPrice,
          marketValue,
          costBasis,
          gainLoss,
          gainLossPercent,
        };
      });

      const totalValue = portfolioData.reduce((sum, h) => sum + h.marketValue, 0);
      const totalCost = portfolioData.reduce((sum, h) => sum + h.costBasis, 0);
      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

      return {
        success: true,
        data: {
          holdings: portfolioData,
          summary: {
            totalValue,
            totalCost,
            totalGainLoss,
            totalGainLossPercent,
            positionCount: portfolioData.length,
          },
        },
      };
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Get portfolio',
        description: 'Get user investment portfolio',
        tags: ['Trading'],
      },
    }
  )
  // Watchlist
  .get(
    '/watchlist',
    async ({ headers, set }) => {
      const token = headers.authorization?.replace('Bearer ', '');
      if (!token) {
        set.status = 401;
        return { success: false, error: 'Unauthorized' };
      }

      const user = await AuthService.getCurrentUser(token);
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Invalid token' };
      }

      const userWatchlist = watchlists.get(user.id) || [];
      const watchlistData = userWatchlist.map((symbol: string) => marketData.get(symbol)).filter(Boolean);

      return {
        success: true,
        data: watchlistData,
      };
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Get watchlist',
        description: 'Get user stock watchlist',
        tags: ['Trading'],
      },
    }
  )
  .post(
    '/watchlist/:symbol',
    async ({ params: { symbol }, headers, set }) => {
      const token = headers.authorization?.replace('Bearer ', '');
      if (!token) {
        set.status = 401;
        return { success: false, error: 'Unauthorized' };
      }

      const user = await AuthService.getCurrentUser(token);
      if (!user) {
        set.status = 401;
        return { success: false, error: 'Invalid token' };
      }

      const upperSymbol = symbol.toUpperCase();
      if (!marketData.has(upperSymbol)) {
        set.status = 400;
        return { success: false, error: 'Invalid stock symbol' };
      }

      const userWatchlist = watchlists.get(user.id) || [];
      if (!userWatchlist.includes(upperSymbol)) {
        userWatchlist.push(upperSymbol);
        watchlists.set(user.id, userWatchlist);
      }

      return {
        success: true,
        message: `${upperSymbol} added to watchlist`,
      };
    },
    {
      params: t.Object({
        symbol: t.String(),
      }),
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Add to watchlist',
        description: 'Add stock to watchlist',
        tags: ['Trading'],
      },
    }
  );