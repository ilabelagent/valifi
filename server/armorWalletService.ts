import type { ArmorWallet } from "@shared/schema";
import { storage } from "./storage";
import { encryptionService } from "./encryptionService";

/**
 * Armor Wallet Integration Service
 * AI-powered Web3 wallet with MPC-TEE security
 * Based on Armor MCP SDK: github.com/armorwallet/armor-crypto-mcp
 */

export interface ArmorWalletConfig {
  walletType: "standard" | "trading";
  chains: string[]; // e.g., ["solana", "ethereum", "base", "polygon"]
  dailyLimit?: number;
  requiresTwoFa?: boolean;
}

export interface ArmorTradeRequest {
  action: "swap" | "transfer" | "dca" | "limit_order";
  fromToken: string;
  toToken?: string;
  amount: number;
  chain: string;
  recipient?: string;
  conditions?: {
    targetPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    intervalHours?: number; // For DCA
  };
}

export interface ArmorTradeResult {
  txHash: string;
  status: "pending" | "success" | "failed";
  amountIn: number;
  amountOut?: number;
  fees: number;
  timestamp: Date;
}

class ArmorWalletService {
  private apiKey: string | null = null;
  private baseUrl = "https://api.armorwallet.ai"; // Placeholder - use actual API URL

  constructor() {
    this.apiKey = process.env.ARMOR_API_KEY || null;
  }

  /**
   * Initialize Armor API (requires Codex NFT staking)
   * User must stake Codex NFT at codex.armorwallet.ai
   */
  async initializeApi(userId: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error(
        "Armor API key not configured. Please stake your Codex NFT at codex.armorwallet.ai and retrieve API key via @ArmorWalletBot on Telegram"
      );
    }

    // Encrypt API key for user
    const encryptedApiKey = encryptionService.encrypt(this.apiKey, userId);
    return encryptedApiKey;
  }

  /**
   * Create Armor Wallet (standard or trading)
   */
  async createWallet(
    userId: string,
    config: ArmorWalletConfig
  ): Promise<ArmorWallet> {
    if (!this.apiKey) {
      throw new Error("Armor API key required");
    }

    // Call Armor API to create wallet
    const response = await fetch(`${this.baseUrl}/v1/wallets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Armor-Api-Key": this.apiKey,
      },
      body: JSON.stringify({
        type: config.walletType,
        chains: config.chains,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Armor wallet creation failed: ${await response.text()}`);
    }

    const data = await response.json();

    // Store wallet in database
    const wallet = await storage.createArmorWallet({
      userId,
      walletType: config.walletType,
      address: data.address,
      chains: config.chains,
      dailyLimit: config.dailyLimit?.toString(),
      requiresTwoFa: config.requiresTwoFa || false,
      armorApiKey: encryptionService.encrypt(this.apiKey, userId),
      metadata: {
        armorWalletId: data.wallet_id,
        createdVia: "mcp-integration",
      },
    });

    return wallet;
  }

  /**
   * Execute AI-powered trade using natural language
   */
  async executeTrade(
    walletId: string,
    request: ArmorTradeRequest
  ): Promise<ArmorTradeResult> {
    const wallet = await storage.getArmorWallet(walletId);
    if (!wallet) {
      throw new Error("Armor wallet not found");
    }

    // Decrypt API key
    const apiKey = encryptionService.decrypt(
      wallet.armorApiKey || "",
      wallet.userId
    );

    // Check daily limit
    if (wallet.dailyLimit && request.amount > parseFloat(wallet.dailyLimit)) {
      throw new Error(
        `Trade amount ${request.amount} exceeds daily limit ${wallet.dailyLimit}`
      );
    }

    // Execute trade via Armor API
    const response = await fetch(`${this.baseUrl}/v1/trades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Armor-Api-Key": apiKey,
      },
      body: JSON.stringify({
        wallet_id: (wallet.metadata as any)?.armorWalletId,
        action: request.action,
        from_token: request.fromToken,
        to_token: request.toToken,
        amount: request.amount,
        chain: request.chain,
        recipient: request.recipient,
        conditions: request.conditions,
        simulate_first: true, // Always simulate before execution
      }),
    });

    if (!response.ok) {
      throw new Error(`Armor trade failed: ${await response.text()}`);
    }

    const data = await response.json();

    return {
      txHash: data.tx_hash,
      status: data.status,
      amountIn: data.amount_in,
      amountOut: data.amount_out,
      fees: data.fees,
      timestamp: new Date(data.timestamp),
    };
  }

  /**
   * Execute DCA (Dollar-Cost Averaging) strategy
   */
  async setupDCA(
    walletId: string,
    token: string,
    amountPerInterval: number,
    intervalHours: number,
    chain: string = "ethereum"
  ): Promise<void> {
    await this.executeTrade(walletId, {
      action: "dca",
      fromToken: "USDT",
      toToken: token,
      amount: amountPerInterval,
      chain,
      conditions: { intervalHours },
    });
  }

  /**
   * Set up limit order with stop-loss/take-profit
   */
  async setupLimitOrder(
    walletId: string,
    token: string,
    amount: number,
    targetPrice: number,
    stopLoss?: number,
    takeProfit?: number,
    chain: string = "ethereum"
  ): Promise<void> {
    await this.executeTrade(walletId, {
      action: "limit_order",
      fromToken: "USDT",
      toToken: token,
      amount,
      chain,
      conditions: {
        targetPrice,
        stopLoss,
        takeProfit,
      },
    });
  }

  /**
   * Get wallet portfolio across all chains
   */
  async getPortfolio(walletId: string): Promise<any> {
    const wallet = await storage.getArmorWallet(walletId);
    if (!wallet) {
      throw new Error("Armor wallet not found");
    }

    const apiKey = encryptionService.decrypt(
      wallet.armorApiKey || "",
      wallet.userId
    );

    const response = await fetch(
      `${this.baseUrl}/v1/wallets/${(wallet.metadata as any)?.armorWalletId}/portfolio`,
      {
        headers: {
          "X-Armor-Api-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio: ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Execute swap with AI optimization
   * Armor automatically finds best route across DEXs
   */
  async swap(
    walletId: string,
    fromToken: string,
    toToken: string,
    amount: number,
    chain: string = "ethereum"
  ): Promise<ArmorTradeResult> {
    return this.executeTrade(walletId, {
      action: "swap",
      fromToken,
      toToken,
      amount,
      chain,
    });
  }

  /**
   * Natural language trading (Armor's killer feature)
   * Example: "Buy $100 of ETH when it drops below $3000"
   */
  async naturalLanguageTrade(
    walletId: string,
    command: string,
    chain: string = "ethereum"
  ): Promise<ArmorTradeResult> {
    const wallet = await storage.getArmorWallet(walletId);
    if (!wallet) {
      throw new Error("Armor wallet not found");
    }

    const apiKey = encryptionService.decrypt(
      wallet.armorApiKey || "",
      wallet.userId
    );

    // Armor AI parses natural language and executes
    const response = await fetch(`${this.baseUrl}/v1/ai/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Armor-Api-Key": apiKey,
      },
      body: JSON.stringify({
        wallet_id: (wallet.metadata as any)?.armorWalletId,
        command,
        chain,
        simulate_first: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI trade failed: ${await response.text()}`);
    }

    const data = await response.json();

    return {
      txHash: data.tx_hash,
      status: data.status,
      amountIn: data.amount_in,
      amountOut: data.amount_out,
      fees: data.fees,
      timestamp: new Date(data.timestamp),
    };
  }

  /**
   * Enable 2FA for trading wallet (high-value transactions)
   */
  async enable2FA(walletId: string): Promise<void> {
    await storage.updateArmorWallet(walletId, {
      requiresTwoFa: true,
    });
  }

  /**
   * Set daily trading limit
   */
  async setDailyLimit(walletId: string, limit: number): Promise<void> {
    await storage.updateArmorWallet(walletId, {
      dailyLimit: limit.toString(),
    });
  }
}

export const armorWalletService = new ArmorWalletService();
