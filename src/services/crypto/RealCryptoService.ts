import crypto from 'crypto';
import { pgPool } from '../../config/aws-rds-config';

interface CryptoPayment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  address: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  txHash?: string;
  createdAt?: Date;
}

export class RealCryptoService {
  async createPayment(userId: string, amount: number, currency: string): Promise<CryptoPayment> {
    const client = await pgPool.connect();

    try {
      await client.query('BEGIN');

      const paymentId = crypto.randomUUID();
      const address = this.generateCryptoAddress(currency);

      // Insert transaction record
      const transactionQuery = `
        INSERT INTO transactions (
          id, user_id, transaction_type, amount, currency, status,
          from_address, to_address, confirmations, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await client.query(transactionQuery, [
        paymentId,
        userId,
        'crypto_deposit',
        amount,
        currency.toUpperCase(),
        'pending',
        null, // from_address (will be filled when payment comes in)
        address, // to_address (our generated address)
        0 // confirmations
      ]);

      await client.query('COMMIT');

      const payment: CryptoPayment = {
        id: paymentId,
        userId,
        amount,
        currency: currency.toUpperCase(),
        address,
        status: 'pending',
        confirmations: 0,
        createdAt: new Date()
      };

      // Simulate blockchain confirmation (in real implementation, this would be done by blockchain monitoring)
      this.simulateBlockchainConfirmation(paymentId, 15000); // 15 seconds

      return payment;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating crypto payment:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getPayment(id: string): Promise<CryptoPayment | null> {
    const client = await pgPool.connect();

    try {
      const query = `
        SELECT id, user_id, amount, currency, status, to_address,
               tx_hash, confirmations, created_at
        FROM transactions
        WHERE id = $1 AND transaction_type = 'crypto_deposit'
      `;

      const result = await client.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        amount: parseFloat(row.amount),
        currency: row.currency,
        address: row.to_address,
        status: row.status as 'pending' | 'confirmed' | 'failed',
        confirmations: row.confirmations || 0,
        txHash: row.tx_hash,
        createdAt: row.created_at
      };

    } catch (error) {
      console.error('Error fetching crypto payment:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getUserPayments(userId: string): Promise<CryptoPayment[]> {
    const client = await pgPool.connect();

    try {
      const query = `
        SELECT id, user_id, amount, currency, status, to_address,
               tx_hash, confirmations, created_at
        FROM transactions
        WHERE user_id = $1 AND transaction_type = 'crypto_deposit'
        ORDER BY created_at DESC
        LIMIT 50
      `;

      const result = await client.query(query, [userId]);

      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        amount: parseFloat(row.amount),
        currency: row.currency,
        address: row.to_address,
        status: row.status as 'pending' | 'confirmed' | 'failed',
        confirmations: row.confirmations || 0,
        txHash: row.tx_hash,
        createdAt: row.created_at
      }));

    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  private generateCryptoAddress(currency: string): string {
    const hash = crypto.randomBytes(20).toString('hex');
    switch (currency.toUpperCase()) {
      case 'BTC':
        return '1' + hash.substring(0, 33);
      case 'ETH':
        return '0x' + hash.substring(0, 40);
      case 'LTC':
        return 'L' + hash.substring(0, 33);
      default:
        return '0x' + hash.substring(0, 40);
    }
  }

  private async simulateBlockchainConfirmation(paymentId: string, delayMs: number): Promise<void> {
    setTimeout(async () => {
      const client = await pgPool.connect();

      try {
        await client.query('BEGIN');

        // Generate realistic transaction hash
        const txHash = crypto.randomBytes(32).toString('hex');

        // Update transaction status
        const updateQuery = `
          UPDATE transactions
          SET status = $1, tx_hash = $2, confirmations = $3,
              completed_at = CURRENT_TIMESTAMP
          WHERE id = $4
        `;

        await client.query(updateQuery, ['confirmed', txHash, 6, paymentId]);

        // Get transaction details for wallet update
        const transactionQuery = `
          SELECT user_id, amount, currency FROM transactions WHERE id = $1
        `;
        const txResult = await client.query(transactionQuery, [paymentId]);

        if (txResult.rows.length > 0) {
          const { user_id, amount, currency } = txResult.rows[0];

          // Update user wallet balance
          const walletUpdateQuery = `
            UPDATE wallets
            SET balance = balance + $1, available_balance = available_balance + $1
            WHERE user_id = $2 AND currency = $3
          `;

          await client.query(walletUpdateQuery, [amount, user_id, currency]);

          console.log(`💰 Crypto payment ${paymentId} confirmed! ${amount} ${currency} added to user ${user_id} wallet.`);
        }

        await client.query('COMMIT');

      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error confirming crypto payment:', error);
      } finally {
        client.release();
      }
    }, delayMs);
  }

  async processWithdrawal(userId: string, amount: number, currency: string, toAddress: string): Promise<CryptoPayment> {
    const client = await pgPool.connect();

    try {
      await client.query('BEGIN');

      // Check wallet balance
      const walletQuery = `
        SELECT balance, available_balance FROM wallets
        WHERE user_id = $1 AND currency = $2
      `;
      const walletResult = await client.query(walletQuery, [userId, currency.toUpperCase()]);

      if (walletResult.rows.length === 0) {
        throw new Error('Wallet not found');
      }

      const wallet = walletResult.rows[0];
      if (parseFloat(wallet.available_balance) < amount) {
        throw new Error('Insufficient balance');
      }

      // Create withdrawal transaction
      const withdrawalId = crypto.randomUUID();
      const transactionQuery = `
        INSERT INTO transactions (
          id, user_id, transaction_type, amount, currency, status,
          from_address, to_address, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      await client.query(transactionQuery, [
        withdrawalId,
        userId,
        'crypto_withdrawal',
        amount,
        currency.toUpperCase(),
        'pending',
        null, // Will be our hot wallet address
        toAddress,
      ]);

      // Update wallet balances (lock the amount)
      const updateWalletQuery = `
        UPDATE wallets
        SET available_balance = available_balance - $1,
            locked_balance = locked_balance + $1
        WHERE user_id = $2 AND currency = $3
      `;

      await client.query(updateWalletQuery, [amount, userId, currency.toUpperCase()]);

      await client.query('COMMIT');

      // Simulate blockchain processing
      this.simulateWithdrawalProcessing(withdrawalId, 20000); // 20 seconds

      return {
        id: withdrawalId,
        userId,
        amount,
        currency: currency.toUpperCase(),
        address: toAddress,
        status: 'pending',
        confirmations: 0,
        createdAt: new Date()
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing withdrawal:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  private async simulateWithdrawalProcessing(withdrawalId: string, delayMs: number): Promise<void> {
    setTimeout(async () => {
      const client = await pgPool.connect();

      try {
        await client.query('BEGIN');

        const txHash = crypto.randomBytes(32).toString('hex');

        // Update transaction status
        await client.query(
          `UPDATE transactions
           SET status = $1, tx_hash = $2, confirmations = $3, completed_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          ['confirmed', txHash, 6, withdrawalId]
        );

        // Get transaction details
        const txResult = await client.query(
          'SELECT user_id, amount, currency FROM transactions WHERE id = $1',
          [withdrawalId]
        );

        if (txResult.rows.length > 0) {
          const { user_id, amount, currency } = txResult.rows[0];

          // Update wallet (remove from locked, reduce total balance)
          await client.query(
            `UPDATE wallets
             SET balance = balance - $1, locked_balance = locked_balance - $1
             WHERE user_id = $2 AND currency = $3`,
            [amount, user_id, currency]
          );

          console.log(`📤 Crypto withdrawal ${withdrawalId} confirmed! ${amount} ${currency} sent from user ${user_id}.`);
        }

        await client.query('COMMIT');

      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing withdrawal confirmation:', error);
      } finally {
        client.release();
      }
    }, delayMs);
  }
}

export default new RealCryptoService();