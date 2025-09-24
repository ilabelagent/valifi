import { Elysia, t } from 'elysia';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { AuthService } from '../services/auth.service';

// Financial schemas
const accountSchema = z.object({
  type: z.enum(['checking', 'savings', 'investment']),
  currency: z.string().default('USD'),
  initialBalance: z.number().min(0).optional(),
});

const transactionSchema = z.object({
  fromAccount: z.string().uuid(),
  toAccount: z.string().uuid().optional(),
  amount: z.number().positive(),
  type: z.enum(['deposit', 'withdrawal', 'transfer', 'payment']),
  description: z.string().optional(),
  category: z.string().optional(),
});

const investmentSchema = z.object({
  symbol: z.string().min(1).max(10),
  quantity: z.number().positive(),
  type: z.enum(['buy', 'sell']),
  price: z.number().positive().optional(),
  orderType: z.enum(['market', 'limit', 'stop']),
});

// In-memory stores (replace with database in production)
const accounts = new Map();
const transactions = new Map();
const portfolios = new Map();
const orders = new Map();

export const financeRouter = new Elysia({ prefix: '/api/v1/finance' })
  // Accounts
  .get(
    '/accounts',
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

      const userAccounts = Array.from(accounts.values()).filter(
        (acc: any) => acc.userId === user.id
      );

      return {
        success: true,
        data: userAccounts,
      };
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Get user accounts',
        description: 'Get all financial accounts for the authenticated user',
        tags: ['Finance'],
      },
    }
  )
  .post(
    '/accounts',
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

      const validated = accountSchema.parse(body);
      const accountId = crypto.randomUUID();
      const account = {
        id: accountId,
        userId: user.id,
        ...validated,
        balance: validated.initialBalance || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      accounts.set(accountId, account);
      logger.info(`Account created for user ${user.email}: ${accountId}`);

      return {
        success: true,
        data: account,
      };
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      body: t.Object({
        type: t.Union([t.Literal('checking'), t.Literal('savings'), t.Literal('investment')]),
        currency: t.Optional(t.String()),
        initialBalance: t.Optional(t.Number()),
      }),
      detail: {
        summary: 'Create account',
        description: 'Create a new financial account',
        tags: ['Finance'],
      },
    }
  )
  // Transactions
  .post(
    '/transactions',
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

      const validated = transactionSchema.parse(body);
      const fromAccount = accounts.get(validated.fromAccount);
      
      if (!fromAccount || fromAccount.userId !== user.id) {
        set.status = 403;
        return { success: false, error: 'Invalid account' };
      }

      if (validated.type === 'withdrawal' || validated.type === 'transfer') {
        if (fromAccount.balance < validated.amount) {
          set.status = 400;
          return { success: false, error: 'Insufficient funds' };
        }
      }

      const transactionId = crypto.randomUUID();
      const transaction = {
        id: transactionId,
        userId: user.id,
        ...validated,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };

      // Update balances
      if (validated.type === 'deposit') {
        fromAccount.balance += validated.amount;
      } else if (validated.type === 'withdrawal') {
        fromAccount.balance -= validated.amount;
      } else if (validated.type === 'transfer' && validated.toAccount) {
        const toAccount = accounts.get(validated.toAccount);
        if (toAccount && toAccount.userId === user.id) {
          fromAccount.balance -= validated.amount;
          toAccount.balance += validated.amount;
          accounts.set(validated.toAccount, toAccount);
        }
      }

      accounts.set(validated.fromAccount, fromAccount);
      transactions.set(transactionId, transaction);

      logger.info(`Transaction ${transactionId} created for user ${user.email}`);

      return {
        success: true,
        data: {
          transaction,
          newBalance: fromAccount.balance,
        },
      };
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      body: t.Object({
        fromAccount: t.String(),
        toAccount: t.Optional(t.String()),
        amount: t.Number(),
        type: t.Union([
          t.Literal('deposit'),
          t.Literal('withdrawal'),
          t.Literal('transfer'),
          t.Literal('payment'),
        ]),
        description: t.Optional(t.String()),
        category: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Create transaction',
        description: 'Create a new financial transaction',
        tags: ['Finance'],
      },
    }
  )
  .get(
    '/transactions',
    async ({ headers, set, query }) => {
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

      const userTransactions = Array.from(transactions.values())
        .filter((tx: any) => tx.userId === user.id)
        .sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

      return {
        success: true,
        data: userTransactions,
        total: userTransactions.length,
      };
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Get transactions',
        description: 'Get all transactions for the authenticated user',
        tags: ['Finance'],
      },
    }
  )
  // Balance
  .get(
    '/balance',
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

      const userAccounts = Array.from(accounts.values()).filter(
        (acc: any) => acc.userId === user.id
      );

      const totalBalance = userAccounts.reduce(
        (sum: number, acc: any) => sum + acc.balance,
        0
      );

      const balanceByType = userAccounts.reduce((acc: any, account: any) => {
        if (!acc[account.type]) acc[account.type] = 0;
        acc[account.type] += account.balance;
        return acc;
      }, {});

      return {
        success: true,
        data: {
          total: totalBalance,
          byType: balanceByType,
          accounts: userAccounts.map((acc: any) => ({
            id: acc.id,
            type: acc.type,
            balance: acc.balance,
            currency: acc.currency,
          })),
        },
      };
    },
    {
      headers: t.Object({
        authorization: t.Optional(t.String()),
      }),
      detail: {
        summary: 'Get balance',
        description: 'Get total balance across all accounts',
        tags: ['Finance'],
      },
    }
  );