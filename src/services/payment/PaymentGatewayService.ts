import Stripe from 'stripe';
import axios from 'axios';
import crypto from 'crypto';
import { pgPool } from '../../config/aws-rds-config';

interface PaymentGatewayConfig {
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  plaid: {
    clientId: string;
    secret: string;
    env: string;
  };
  coinbase: {
    apiKey: string;
    apiSecret: string;
    passphrase: string;
    sandboxMode: boolean;
  };
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'crypto_wallet';
  provider: string;
  details: any;
}

interface PaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  success: boolean;
  paymentId: string;
  status: string;
  amount: number;
  currency: string;
  fees?: number;
  gatewayResponse?: any;
  error?: string;
}

export class PaymentGatewayService {
  private config: PaymentGatewayConfig;
  private stripe: Stripe;

  constructor() {
    this.config = {
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
      },
      plaid: {
        clientId: process.env.PLAID_CLIENT_ID || '',
        secret: process.env.PLAID_SECRET || '',
        env: process.env.PLAID_ENV || 'sandbox'
      },
      coinbase: {
        apiKey: process.env.COINBASE_API_KEY || '',
        apiSecret: process.env.COINBASE_API_SECRET || '',
        passphrase: process.env.COINBASE_PASSPHRASE || '',
        sandboxMode: process.env.COINBASE_SANDBOX === 'true'
      }
    };

    this.stripe = new Stripe(this.config.stripe.secretKey, {
      apiVersion: '2024-11-20.acacia'
    });
  }

  // Stripe Integration
  async createStripePaymentMethod(userId: string, cardToken: string): Promise<PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: { token: cardToken }
      });

      await this.stripe.paymentMethods.attach(paymentMethod.id, {
        customer: await this.getOrCreateStripeCustomer(userId)
      });

      // Store payment method in database
      const query = `
        INSERT INTO payment_methods (
          user_id, type, provider, provider_payment_method_id,
          card_brand, card_last4, card_exp_month, card_exp_year
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await pgPool.query(query, [
        userId,
        'credit_card',
        'stripe',
        paymentMethod.id,
        paymentMethod.card?.brand,
        paymentMethod.card?.last4,
        paymentMethod.card?.exp_month,
        paymentMethod.card?.exp_year
      ]);

      return {
        id: result.rows[0].id,
        type: 'credit_card',
        provider: 'stripe',
        details: {
          brand: paymentMethod.card?.brand,
          last4: paymentMethod.card?.last4,
          expMonth: paymentMethod.card?.exp_month,
          expYear: paymentMethod.card?.exp_year
        }
      };
    } catch (error) {
      console.error('Error creating Stripe payment method:', error);
      throw error;
    }
  }

  private async getOrCreateStripeCustomer(userId: string): Promise<string> {
    // Check if customer exists in database
    const query = 'SELECT stripe_customer_id FROM users WHERE id = $1';
    const result = await pgPool.query(query, [userId]);

    if (result.rows[0]?.stripe_customer_id) {
      return result.rows[0].stripe_customer_id;
    }

    // Get user details
    const userQuery = 'SELECT email, first_name, last_name FROM users WHERE id = $1';
    const userResult = await pgPool.query(userQuery, [userId]);
    const user = userResult.rows[0];

    // Create Stripe customer
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      metadata: { userId }
    });

    // Update user with Stripe customer ID
    const updateQuery = 'UPDATE users SET stripe_customer_id = $1 WHERE id = $2';
    await pgPool.query(updateQuery, [customer.id, userId]);

    return customer.id;
  }

  async processStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const customerId = await this.getOrCreateStripeCustomer(request.userId);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        customer: customerId,
        payment_method: request.paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        description: request.description,
        metadata: request.metadata || {}
      });

      // Calculate fees (Stripe's standard rate: 2.9% + 30¢)
      const fees = Math.round(request.amount * 0.029) + 0.30;

      // Store transaction
      const txQuery = `
        INSERT INTO transactions (
          user_id, transaction_type, amount, currency, status,
          payment_gateway, gateway_transaction_id, gateway_response, fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const txResult = await pgPool.query(txQuery, [
        request.userId,
        'deposit',
        request.amount,
        request.currency,
        paymentIntent.status,
        'stripe',
        paymentIntent.id,
        JSON.stringify(paymentIntent),
        fees
      ]);

      return {
        success: paymentIntent.status === 'succeeded',
        paymentId: txResult.rows[0].id,
        status: paymentIntent.status,
        amount: request.amount,
        currency: request.currency,
        fees,
        gatewayResponse: paymentIntent
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Plaid Integration for Bank Accounts
  async createPlaidLinkToken(userId: string): Promise<string> {
    try {
      const response = await axios.post('https://production.plaid.com/link/token/create', {
        client_id: this.config.plaid.clientId,
        secret: this.config.plaid.secret,
        client_name: 'Valifi Fintech Platform',
        country_codes: ['US'],
        language: 'en',
        user: {
          client_user_id: userId
        },
        products: ['auth', 'transactions'],
        account_filters: {
          depository: {
            account_type: ['checking', 'savings']
          }
        }
      });

      return response.data.link_token;
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      throw error;
    }
  }

  async exchangePlaidPublicToken(userId: string, publicToken: string, accountId: string): Promise<PaymentMethod> {
    try {
      // Exchange public token for access token
      const exchangeResponse = await axios.post('https://production.plaid.com/link/token/exchange', {
        client_id: this.config.plaid.clientId,
        secret: this.config.plaid.secret,
        public_token: publicToken
      });

      const accessToken = exchangeResponse.data.access_token;

      // Get account details
      const accountsResponse = await axios.post('https://production.plaid.com/accounts/get', {
        client_id: this.config.plaid.clientId,
        secret: this.config.plaid.secret,
        access_token: accessToken
      });

      const account = accountsResponse.data.accounts.find((acc: any) => acc.account_id === accountId);

      // Store payment method
      const query = `
        INSERT INTO payment_methods (
          user_id, type, provider, provider_payment_method_id,
          bank_name, bank_account_last4, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await pgPool.query(query, [
        userId,
        'bank_account',
        'plaid',
        accountId,
        account.name,
        account.mask,
        'active'
      ]);

      return {
        id: result.rows[0].id,
        type: 'bank_account',
        provider: 'plaid',
        details: {
          bankName: account.name,
          accountType: account.subtype,
          last4: account.mask
        }
      };
    } catch (error) {
      console.error('Error exchanging Plaid token:', error);
      throw error;
    }
  }

  // Coinbase Integration for Crypto Payments
  async createCoinbasePayment(request: PaymentRequest & { cryptoCurrency: string }): Promise<PaymentResponse> {
    try {
      const timestamp = Date.now() / 1000;
      const method = 'POST';
      const requestPath = '/charges';

      const body = JSON.stringify({
        name: 'Valifi Deposit',
        description: request.description || 'Deposit to Valifi account',
        pricing_type: 'fixed_price',
        local_price: {
          amount: request.amount.toString(),
          currency: request.currency
        },
        metadata: {
          userId: request.userId,
          ...request.metadata
        }
      });

      const message = timestamp + method + requestPath + body;
      const signature = crypto
        .createHmac('sha256', this.config.coinbase.apiSecret)
        .update(message)
        .digest('hex');

      const baseUrl = this.config.coinbase.sandboxMode
        ? 'https://api.commerce.coinbase.com'
        : 'https://api.commerce.coinbase.com';

      const response = await axios.post(`${baseUrl}${requestPath}`, JSON.parse(body), {
        headers: {
          'CB-ACCESS-KEY': this.config.coinbase.apiKey,
          'CB-ACCESS-SIGN': signature,
          'CB-ACCESS-TIMESTAMP': timestamp.toString(),
          'CB-VERSION': '2018-03-22',
          'Content-Type': 'application/json'
        }
      });

      const charge = response.data.data;

      // Store transaction
      const txQuery = `
        INSERT INTO transactions (
          user_id, transaction_type, amount, currency, status,
          payment_gateway, gateway_transaction_id, gateway_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const txResult = await pgPool.query(txQuery, [
        request.userId,
        'crypto_deposit',
        request.amount,
        request.currency,
        'pending',
        'coinbase',
        charge.id,
        JSON.stringify(charge)
      ]);

      return {
        success: true,
        paymentId: txResult.rows[0].id,
        status: 'pending',
        amount: request.amount,
        currency: request.currency,
        gatewayResponse: charge
      };
    } catch (error) {
      console.error('Coinbase payment error:', error);
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        amount: request.amount,
        currency: request.currency,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Webhook handlers
  async handleStripeWebhook(signature: string, payload: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.stripe.webhookSecret
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;
        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw error;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const query = `
      UPDATE transactions
      SET status = 'completed', completed_at = CURRENT_TIMESTAMP
      WHERE gateway_transaction_id = $1
    `;

    await pgPool.query(query, [paymentIntent.id]);

    // Update user wallet balance
    const amount = paymentIntent.amount / 100; // Convert from cents
    const currency = paymentIntent.currency.toUpperCase();

    const walletQuery = `
      UPDATE wallets
      SET balance = balance + $1, available_balance = available_balance + $1
      WHERE user_id = (
        SELECT user_id FROM transactions WHERE gateway_transaction_id = $2
      ) AND currency = $3
    `;

    await pgPool.query(walletQuery, [amount, paymentIntent.id, currency]);
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const query = `
      UPDATE transactions
      SET status = 'failed', failed_at = CURRENT_TIMESTAMP,
          failure_reason = $1
      WHERE gateway_transaction_id = $2
    `;

    await pgPool.query(query, [
      paymentIntent.last_payment_error?.message || 'Payment failed',
      paymentIntent.id
    ]);
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const query = `
      SELECT * FROM payment_methods
      WHERE user_id = $1 AND status = 'active'
      ORDER BY created_at DESC
    `;

    const result = await pgPool.query(query, [userId]);

    return result.rows.map(row => ({
      id: row.id,
      type: row.type,
      provider: row.provider,
      details: {
        brand: row.card_brand,
        last4: row.card_last4 || row.bank_account_last4,
        bankName: row.bank_name
      }
    }));
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE payment_methods
        SET status = 'deleted'
        WHERE id = $1 AND user_id = $2
      `;

      const result = await pgPool.query(query, [paymentMethodId, userId]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return false;
    }
  }
}

export default new PaymentGatewayService();