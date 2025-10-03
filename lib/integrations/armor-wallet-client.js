/**
 * ARMOR WALLET API CLIENT
 * Secure cryptocurrency wallet integration
 */

const axios = require('axios');

class ArmorWalletClient {
  constructor() {
    this.apiKey = process.env.ARMOR_WALLET_API_KEY;
    this.baseURL = 'https://api.armorwallet.com/v1'; // Update with actual endpoint
    
    if (!this.apiKey) {
      console.warn('⚠️ ARMOR_WALLET_API_KEY not set in environment');
    }
  }

  async request(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Armor Wallet API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Wallet Management
  async createWallet(userId, currency = 'BTC') {
    return this.request('POST', '/wallets', {
      user_id: userId,
      currency,
      armor_level: 'MAXIMUM'
    });
  }

  async getWallet(walletId) {
    return this.request('GET', `/wallets/${walletId}`);
  }

  async getBalance(walletId) {
    return this.request('GET', `/wallets/${walletId}/balance`);
  }

  // Transactions
  async sendTransaction(walletId, toAddress, amount, currency) {
    return this.request('POST', `/transactions/send`, {
      wallet_id: walletId,
      to_address: toAddress,
      amount,
      currency
    });
  }

  async getTransactionHistory(walletId, limit = 50) {
    return this.request('GET', `/wallets/${walletId}/transactions?limit=${limit}`);
  }

  // Multi-signature
  async createMultisigWallet(participants, requiredSignatures) {
    return this.request('POST', '/wallets/multisig', {
      participants,
      required_signatures: requiredSignatures
    });
  }

  // Security
  async enable2FA(walletId) {
    return this.request('POST', `/wallets/${walletId}/2fa/enable`);
  }

  async verifyTransaction(walletId, txId, code) {
    return this.request('POST', `/transactions/${txId}/verify`, {
      wallet_id: walletId,
      verification_code: code
    });
  }
}

module.exports = ArmorWalletClient;
