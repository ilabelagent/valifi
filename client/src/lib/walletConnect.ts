import EthereumProvider from "@walletconnect/ethereum-provider";
import { BrowserProvider, JsonRpcSigner } from "ethers";

interface WalletConnectConfig {
  projectId: string;
  chains: number[];
  showQrModal: boolean;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

interface ConnectedWallet {
  address: string;
  chainId: number;
  network: string;
  walletType: string;
  provider: any;
  signer?: JsonRpcSigner;
}

interface SessionData {
  topic: string;
  pairingTopic?: string;
  relay: {
    protocol: string;
  };
  expiry: number;
  acknowledged: boolean;
  controller: string;
  namespaces: any;
  requiredNamespaces: any;
  optionalNamespaces?: any;
  sessionProperties?: any;
  peer: {
    publicKey: string;
    metadata: {
      name: string;
      description: string;
      url: string;
      icons: string[];
    };
  };
}

class WalletConnectService {
  private provider: any = null;
  private ethersProvider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private connectedWallet: ConnectedWallet | null = null;

  private readonly projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "e542ff314e26ff34de2d4fba98db70bb";
  
  private readonly chains = [
    1,     // Ethereum Mainnet
    137,   // Polygon
    56,    // BSC
    42161, // Arbitrum
    10,    // Optimism
  ];

  private readonly metadata = {
    name: "Valifi Kingdom Platform",
    description: "Advanced DeFi & Trading Platform",
    url: typeof window !== "undefined" ? window.location.origin : "https://valifi.com",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  };

  async initializeProvider(): Promise<void> {
    if (this.provider) return;

    try {
      this.provider = await EthereumProvider.init({
        projectId: this.projectId,
        chains: [1], // Main chain (Ethereum)
        optionalChains: this.chains, // All supported chains
        showQrModal: true,
        metadata: this.metadata,
        methods: [
          "eth_sendTransaction",
          "eth_signTransaction",
          "eth_sign",
          "personal_sign",
          "eth_signTypedData",
        ],
        events: ["chainChanged", "accountsChanged"],
        rpcMap: {
          1: "https://eth.llamarpc.com",
          137: "https://polygon.llamarpc.com",
          56: "https://binance.llamarpc.com",
          42161: "https://arbitrum.llamarpc.com",
          10: "https://optimism.llamarpc.com",
        },
      });

      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize WalletConnect provider:", error);
      throw new Error("Failed to initialize WalletConnect");
    }
  }

  private setupEventListeners(): void {
    if (!this.provider) return;

    this.provider.on("display_uri", (uri: string) => {
      console.log("WalletConnect URI:", uri);
    });

    this.provider.on("connect", (session: SessionData) => {
      console.log("WalletConnect connected:", session);
    });

    this.provider.on("disconnect", () => {
      console.log("WalletConnect disconnected");
      this.handleDisconnect();
    });

    this.provider.on("accountsChanged", (accounts: string[]) => {
      console.log("Accounts changed:", accounts);
      if (accounts.length === 0) {
        this.handleDisconnect();
      } else if (this.connectedWallet && accounts[0] !== this.connectedWallet.address) {
        this.updateAccount(accounts[0]);
      }
    });

    this.provider.on("chainChanged", (chainId: number) => {
      console.log("Chain changed:", chainId);
      if (this.connectedWallet) {
        this.updateChain(chainId);
      }
    });
  }

  async connect(): Promise<ConnectedWallet> {
    try {
      await this.initializeProvider();

      const accounts = await this.provider.enable();
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from WalletConnect");
      }

      const chainId = this.provider.chainId;
      
      this.ethersProvider = new BrowserProvider(this.provider);
      this.signer = await this.ethersProvider.getSigner();

      const networkMap: Record<number, string> = {
        1: "ethereum",
        137: "polygon",
        56: "bsc",
        42161: "arbitrum",
        10: "optimism",
      };

      const walletType = this.getWalletType();

      this.connectedWallet = {
        address: accounts[0],
        chainId,
        network: networkMap[chainId] || "ethereum",
        walletType,
        provider: this.provider,
        signer: this.signer,
      };

      return this.connectedWallet;
    } catch (error: any) {
      console.error("WalletConnect connection error:", error);
      throw new Error(error.message || "Failed to connect wallet");
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.provider) {
        await this.provider.disconnect();
      }
      this.handleDisconnect();
    } catch (error) {
      console.error("Disconnect error:", error);
      throw error;
    }
  }

  private handleDisconnect(): void {
    this.provider = null;
    this.ethersProvider = null;
    this.signer = null;
    this.connectedWallet = null;
  }

  private updateAccount(newAddress: string): void {
    if (this.connectedWallet) {
      this.connectedWallet.address = newAddress;
    }
  }

  private updateChain(newChainId: number): void {
    if (this.connectedWallet) {
      this.connectedWallet.chainId = newChainId;
      const networkMap: Record<number, string> = {
        1: "ethereum",
        137: "polygon",
        56: "bsc",
        42161: "arbitrum",
        10: "optimism",
      };
      this.connectedWallet.network = networkMap[newChainId] || "ethereum";
    }
  }

  getConnectedWallet(): ConnectedWallet | null {
    return this.connectedWallet;
  }

  getSession(): SessionData | null {
    if (!this.provider || !this.provider.session) {
      return null;
    }
    return this.provider.session as SessionData;
  }

  async sendTransaction(to: string, value: string): Promise<string> {
    if (!this.signer || !this.connectedWallet) {
      throw new Error("Wallet not connected");
    }

    try {
      const tx = await this.signer.sendTransaction({
        to,
        value,
      });

      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      console.error("Transaction error:", error);
      throw new Error(error.message || "Transaction failed");
    }
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.ethersProvider) {
      throw new Error("Provider not initialized");
    }

    const addr = address || this.connectedWallet?.address;
    if (!addr) {
      throw new Error("No address provided");
    }

    try {
      const balance = await this.ethersProvider.getBalance(addr);
      return balance.toString();
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error("Signer not available");
    }

    try {
      const signature = await this.signer.signMessage(message);
      return signature;
    } catch (error: any) {
      console.error("Sign message error:", error);
      throw new Error(error.message || "Failed to sign message");
    }
  }

  private getWalletType(): string {
    if (!this.provider) return "unknown";

    const session = this.provider.session;
    if (!session?.peer?.metadata?.name) {
      return "walletconnect";
    }

    const walletName = session.peer.metadata.name.toLowerCase();
    
    if (walletName.includes("metamask")) return "metamask";
    if (walletName.includes("trust")) return "trust";
    if (walletName.includes("rainbow")) return "rainbow";
    if (walletName.includes("coinbase")) return "coinbase";
    
    return "walletconnect";
  }

  isConnected(): boolean {
    return this.connectedWallet !== null && this.provider?.connected === true;
  }

  async switchChain(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    try {
      await this.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error("Chain not added to wallet");
      }
      throw error;
    }
  }
}

export const walletConnectService = new WalletConnectService();
export type { ConnectedWallet, SessionData };
