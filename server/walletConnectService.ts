/**
 * WalletConnect Service for Valifi Kingdom
 * 
 * This service enables users to connect external Web3 wallets (MetaMask, Trust Wallet, Rainbow, Coinbase Wallet, etc.)
 * to the platform for seamless transaction signing and blockchain interactions.
 * 
 * Supported Wallets:
 * - MetaMask
 * - Trust Wallet
 * - Rainbow Wallet
 * - Coinbase Wallet
 * - Ledger (via MetaMask or other bridges)
 * - Any EIP-1193 compatible wallet
 * 
 * Implementation Notes:
 * - Uses browser's window.ethereum (injected by wallets)
 * - Supports network switching
 * - Session persistence via localStorage
 * - Multi-account support
 */

import { ethers } from "ethers";
import { NETWORKS, type NetworkConfig } from "./web3Service";

export interface WalletSession {
  id: string;
  walletAddress: string;
  walletType: string;
  chainId: number;
  network: string;
  isActive: boolean;
}

export class WalletConnectService {
  /**
   * Check if a Web3 wallet is available in the browser
   */
  static isWalletAvailable(): boolean {
    return typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";
  }

  /**
   * Detect which wallet is installed
   */
  static detectWallet(): string {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      return "none";
    }

    const ethereum = (window as any).ethereum;
    
    if (ethereum.isMetaMask) return "metamask";
    if (ethereum.isTrust) return "trust";
    if (ethereum.isRainbow) return "rainbow";
    if (ethereum.isCoinbaseWallet) return "coinbase";
    if (ethereum.isLedger) return "ledger";
    
    return "unknown";
  }

  /**
   * Request wallet connection
   * Returns connected accounts
   */
  static async connect(): Promise<string[]> {
    if (!this.isWalletAvailable()) {
      throw new Error("No Web3 wallet detected. Please install MetaMask or another Web3 wallet.");
    }

    const ethereum = (window as any).ethereum;
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    
    return accounts;
  }

  /**
   * Get current chain ID
   */
  static async getChainId(): Promise<number> {
    if (!this.isWalletAvailable()) {
      throw new Error("No Web3 wallet detected");
    }

    const ethereum = (window as any).ethereum;
    const chainId = await ethereum.request({ method: "eth_chainId" });
    
    return parseInt(chainId, 16);
  }

  /**
   * Switch network
   */
  static async switchNetwork(network: string): Promise<void> {
    if (!this.isWalletAvailable()) {
      throw new Error("No Web3 wallet detected");
    }

    const config = NETWORKS[network];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const ethereum = (window as any).ethereum;
    
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${config.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to the wallet
      if (switchError.code === 4902) {
        await this.addNetwork(config);
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Add network to wallet
   */
  static async addNetwork(config: NetworkConfig): Promise<void> {
    if (!this.isWalletAvailable()) {
      throw new Error("No Web3 wallet detected");
    }

    const ethereum = (window as any).ethereum;
    
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${config.chainId.toString(16)}`,
          chainName: config.name,
          nativeCurrency: {
            name: config.symbol,
            symbol: config.symbol,
            decimals: 18,
          },
          rpcUrls: [config.rpcUrl],
          blockExplorerUrls: [config.explorer],
        },
      ],
    });
  }

  /**
   * Sign a transaction using connected wallet
   */
  static async signTransaction(tx: any): Promise<string> {
    if (!this.isWalletAvailable()) {
      throw new Error("No Web3 wallet detected");
    }

    const ethereum = (window as any).ethereum;
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    
    const txResponse = await signer.sendTransaction(tx);
    return txResponse.hash;
  }

  /**
   * Sign a message
   */
  static async signMessage(message: string, address: string): Promise<string> {
    if (!this.isWalletAvailable()) {
      throw new Error("No Web3 wallet detected");
    }

    const ethereum = (window as any).ethereum;
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [message, address],
    });
    
    return signature;
  }

  /**
   * Get balance of connected account
   */
  static async getBalance(address: string): Promise<string> {
    if (!this.isWalletAvailable()) {
      throw new Error("No Web3 wallet detected");
    }

    const ethereum = (window as any).ethereum;
    const provider = new ethers.BrowserProvider(ethereum);
    
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Listen for account changes
   */
  static onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (!this.isWalletAvailable()) return;

    const ethereum = (window as any).ethereum;
    ethereum.on("accountsChanged", callback);
  }

  /**
   * Listen for chain changes
   */
  static onChainChanged(callback: (chainId: string) => void): void {
    if (!this.isWalletAvailable()) return;

    const ethereum = (window as any).ethereum;
    ethereum.on("chainChanged", callback);
  }

  /**
   * Disconnect wallet
   */
  static async disconnect(): Promise<void> {
    // Note: Most wallets don't support programmatic disconnect
    // Users need to disconnect from the wallet extension
    // We can only clear our local session data
    if (typeof window !== "undefined") {
      localStorage.removeItem("walletconnect_session");
      localStorage.removeItem("wallet_address");
      localStorage.removeItem("wallet_type");
    }
  }

  /**
   * Server-side method: Create a new WalletConnect session
   */
  static async createSession(
    userId: string, 
    walletAddress: string, 
    chainId: number,
    walletType: string = "unknown"
  ): Promise<WalletSession> {
    const networkMap: Record<number, string> = {
      1: "ethereum",
      137: "polygon",
      56: "bsc",
      42161: "arbitrum",
      10: "optimism"
    };

    const network = networkMap[chainId] || "ethereum";
    
    return {
      id: `wc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      walletAddress,
      walletType,
      chainId,
      network,
      isActive: true
    };
  }

  /**
   * Server-side method: Get session details
   */
  static async getSession(sessionId: string): Promise<WalletSession | null> {
    // In a real implementation, this would query the database
    // For now, we'll use localStorage on client side
    if (typeof window !== "undefined") {
      const sessionData = localStorage.getItem(`wallet_session_${sessionId}`);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
    }
    return null;
  }

  /**
   * Server-side method: Disconnect a WalletConnect session
   */
  static async disconnectSession(sessionId: string): Promise<boolean> {
    // Clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem(`wallet_session_${sessionId}`);
      localStorage.removeItem("walletconnect_session");
      localStorage.removeItem("wallet_address");
      localStorage.removeItem("wallet_type");
    }
    return true;
  }

  /**
   * Get network name from chain ID
   */
  static getNetworkFromChainId(chainId: number): string {
    const networkMap: Record<number, string> = {
      1: "ethereum",
      137: "polygon",
      56: "bsc",
      42161: "arbitrum",
      10: "optimism"
    };
    return networkMap[chainId] || "ethereum";
  }
}

export const walletConnectService = WalletConnectService;
