import { describe, expect, test, beforeAll } from 'bun:test';
import app from '../src/index';

describe('Valifi Fintech Platform Tests', () => {
  let authToken: string;
  let userId: string;
  let accountId: string;
  let orderId: string;

  describe('System Health', () => {
    test('GET / should return platform info', async () => {
      const response = await app.handle(new Request('http://localhost/'));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.name).toBe('Valifi Fintech Platform');
      expect(data.version).toBe('5.0.0');
    });

    test('GET /health should return 200', async () => {
      const response = await app.handle(new Request('http://localhost/health'));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('OK');
    });
  });

  describe('Authentication Flow', () => {
    test('POST /auth/signup should create user', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'trader@valifi.com',
            password: 'SecurePass123!',
            name: 'Test Trader',
          }),
        })
      );

      const data = await response.json();
      if (response.status === 409) {
        // User already exists, try login instead
        const loginResponse = await app.handle(
          new Request('http://localhost/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'trader@valifi.com',
              password: 'SecurePass123!',
            }),
          })
        );
        const loginData = await loginResponse.json();
        expect(loginData.success).toBe(true);
        authToken = loginData.data.token;
        userId = loginData.data.user.id;
      } else {
        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        authToken = data.data.token;
        userId = data.data.user.id;
      }
    });

    test('GET /auth/me should return current user', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.user.email).toBe('trader@valifi.com');
    });
  });

  describe('Financial Operations', () => {
    test('POST /api/v1/finance/accounts should create account', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/finance/accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            type: 'checking',
            currency: 'USD',
            initialBalance: 10000,
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.type).toBe('checking');
      expect(data.data.balance).toBe(10000);
      accountId = data.data.id;
    });

    test('GET /api/v1/finance/accounts should list accounts', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/finance/accounts', {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    test('POST /api/v1/finance/transactions should create transaction', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/finance/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            fromAccount: accountId,
            amount: 500,
            type: 'deposit',
            description: 'Test deposit',
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.transaction.amount).toBe(500);
      expect(data.data.newBalance).toBe(10500);
    });

    test('GET /api/v1/finance/balance should return balance', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/finance/balance', {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.total).toBe(10500);
    });
  });

  describe('Trading Operations', () => {
    test('GET /api/v1/trading/stocks should return market data', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/trading/stocks')
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    test('GET /api/v1/trading/stocks/AAPL should return stock details', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/trading/stocks/AAPL')
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.symbol).toBe('AAPL');
      expect(data.data.name).toBe('Apple Inc.');
    });

    test('POST /api/v1/trading/orders should place order', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/trading/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            symbol: 'AAPL',
            quantity: 10,
            type: 'buy',
            orderType: 'market',
          }),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.symbol).toBe('AAPL');
      expect(data.data.quantity).toBe(10);
      expect(data.data.status).toBe('filled');
      orderId = data.data.id;
    });

    test('GET /api/v1/trading/portfolio should return portfolio', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/trading/portfolio', {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.holdings.length).toBeGreaterThan(0);
      expect(data.data.summary.positionCount).toBe(1);
    });

    test('POST /api/v1/trading/watchlist/MSFT should add to watchlist', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/trading/watchlist/MSFT', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('MSFT added to watchlist');
    });

    test('GET /api/v1/trading/watchlist should return watchlist', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/trading/watchlist', {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});