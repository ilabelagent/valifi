import crypto from 'crypto';
import { pgPool } from '../../config/aws-rds-config';

interface WalletConfig {
  apiUrl: string;
  apiKey: string;
  apiSecret: string;
  encryptionKey: string;
}

interface WalletBalance {
  currency: string;
  balance: number;
  available: number;
  locked: number;
}

interface TransactionRequest {
  from: string;
  to: string;
  amount: number;
  currency: string;
  memo?: string;
}

export class ArmorWalletService {
  private config: WalletConfig;
  private cipher: crypto.Cipher;
  private decipher: crypto.Decipher;

  constructor() {
    this.config = {
      apiUrl: process.env.ARMOR_WALLET_API_URL || 'https://api.armorwallet.com/v1',
      apiKey: process.env.ARMOR_WALLET_API_KEY || '',
      apiSecret: process.env.ARMOR_WALLET_API_SECRET || '',
      encryptionKey: process.env.ARMOR_WALLET_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
    };
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.config.encryptionKey, 'hex'),
      iv
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.config.encryptionKey, 'hex'),
      iv
    );
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async createWallet(userId: string, walletType: 'crypto' | 'fiat', currency: string): Promise<any> {
    try {
      // Generate wallet keys
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });

      // Generate wallet address
      const walletAddress = this.generateWalletAddress(publicKey, currency);
      const armorWalletId = crypto.randomUUID();

      // Encrypt private key
      const encryptedPrivateKey = this.encrypt(privateKey);

      // Store wallet in database
      const query = `
        INSERT INTO wallets (
          user_id, wallet_type, currency, armor_wallet_id,
          armor_wallet_address, private_key_encrypted, public_key
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await pgPool.query(query, [
        userId,
        walletType,
        currency,
        armorWalletId,
        walletAddress,
        encryptedPrivateKey,
        publicKey
      ]);

      return {
        success: true,
        wallet: {
          id: result.rows[0].id,
          address: walletAddress,
          currency: currency,
          type: walletType
        }
      };
    } catch (error) {
      console.error('Error creating ArmorWallet:', error);
      throw error;
    }
  }

  private generateWalletAddress(publicKey: string, currency: string): string {
    const hash = crypto.createHash('sha256').update(publicKey + currency).digest('hex');
    const prefix = currency === 'BTC' ? '1' : currency === 'ETH' ? '0x' : 'W';
    return prefix + hash.substring(0, 33);
  }

  async getBalance(walletId: string): Promise<WalletBalance> {
    try {
      const query = 'SELECT * FROM wallets WHERE id = $1';
      const result = await pgPool.query(query, [walletId]);

      if (result.rows.length === 0) {
        throw new Error('Wallet not found');
      }

      const wallet = result.rows[0];

      return {
        currency: wallet.currency,
        balance: parseFloat(wallet.balance),
        available: parseFloat(wallet.available_balance),
        locked: parseFloat(wallet.locked_balance)
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async sendTransaction(transaction: TransactionRequest): Promise<any> {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');

      // Get sender wallet
      const senderQuery = 'SELECT * FROM wallets WHERE armor_wallet_address = $1 FOR UPDATE';
      const senderResult = await client.query(senderQuery, [transaction.from]);

      if (senderResult.rows.length === 0) {
        throw new Error('Sender wallet not found');
      }

      const senderWallet = senderResult.rows[0];

      // Check balance
      if (parseFloat(senderWallet.available_balance) < transaction.amount) {
        throw new Error('Insufficient balance');
      }

      // Update sender balance
      const updateSenderQuery = `
        UPDATE wallets
        SET available_balance = available_balance - $1,
            balance = balance - $1
        WHERE id = $2
      `;
      await client.query(updateSenderQuery, [transaction.amount, senderWallet.id]);

      // Update receiver balance (if internal)
      const receiverQuery = 'SELECT * FROM wallets WHERE armor_wallet_address = $1';
      const receiverResult = await client.query(receiverQuery, [transaction.to]);

      if (receiverResult.rows.length > 0) {
        const updateReceiverQuery = `
          UPDATE wallets
          SET available_balance = available_balance + $1,
              balance = balance + $1
          WHERE id = $2
        `;
        await client.query(updateReceiverQuery, [transaction.amount, receiverResult.rows[0].id]);
      }

      // Create transaction record
      const txHash = crypto.createHash('sha256')
        .update(JSON.stringify(transaction) + Date.now())
        .digest('hex');

      const txQuery = `
        INSERT INTO transactions (
          user_id, wallet_id, transaction_type, amount, currency,
          from_address, to_address, tx_hash, status, memo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const txResult = await client.query(txQuery, [
        senderWallet.user_id,
        senderWallet.id,
        'send',
        transaction.amount,
        transaction.currency,
        transaction.from,
        transaction.to,
        txHash,
        'completed',
        transaction.memo
      ]);

      await client.query('COMMIT');

      return {
        success: true,
        transaction: {
          id: txResult.rows[0].id,
          txHash: txHash,
          amount: transaction.amount,
          currency: transaction.currency,
          status: 'completed'
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async importWallet(userId: string, privateKey: string, walletType: 'crypto', currency: string): Promise<any> {
    try {
      // Derive public key from private key
      const keyPair = crypto.createPrivateKey({
        key: privateKey,
        format: 'pem'
      });

      const publicKey = crypto.createPublicKey(keyPair).export({
        type: 'spki',
        format: 'pem'
      }).toString();

      // Generate wallet address
      const walletAddress = this.generateWalletAddress(publicKey, currency);
      const armorWalletId = crypto.randomUUID();

      // Encrypt private key
      const encryptedPrivateKey = this.encrypt(privateKey);

      // Store wallet
      const query = `
        INSERT INTO wallets (
          user_id, wallet_type, currency, armor_wallet_id,
          armor_wallet_address, private_key_encrypted, public_key
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await pgPool.query(query, [
        userId,
        walletType,
        currency,
        armorWalletId,
        walletAddress,
        encryptedPrivateKey,
        publicKey
      ]);

      return {
        success: true,
        wallet: {
          id: result.rows[0].id,
          address: walletAddress,
          currency: currency
        }
      };
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    }
  }

  async getTransactionHistory(walletId: string, limit: number = 50): Promise<any[]> {
    try {
      const query = `
        SELECT * FROM transactions
        WHERE wallet_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;

      const result = await pgPool.query(query, [walletId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }
}

export default new ArmorWalletService();