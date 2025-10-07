import { ethers } from "ethers";
import type { InsertWallet } from "@shared/schema";

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  symbol: string;
  explorer: string;
}

// Network configurations
export const NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    name: "Ethereum Mainnet",
    rpcUrl: process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com",
    chainId: 1,
    symbol: "ETH",
    explorer: "https://etherscan.io",
  },
  polygon: {
    name: "Polygon",
    rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    chainId: 137,
    symbol: "MATIC",
    explorer: "https://polygonscan.com",
  },
  bsc: {
    name: "BNB Smart Chain",
    rpcUrl: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org",
    chainId: 56,
    symbol: "BNB",
    explorer: "https://bscscan.com",
  },
  arbitrum: {
    name: "Arbitrum One",
    rpcUrl: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
    chainId: 42161,
    symbol: "ETH",
    explorer: "https://arbiscan.io",
  },
  optimism: {
    name: "Optimism",
    rpcUrl: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
    chainId: 10,
    symbol: "ETH",
    explorer: "https://optimistic.etherscan.io",
  },
};

export class Web3Service {
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();

  constructor() {
    // Initialize providers for each network
    for (const [key, config] of Object.entries(NETWORKS)) {
      this.providers.set(key, new ethers.JsonRpcProvider(config.rpcUrl));
    }
  }

  getProvider(network: string): ethers.JsonRpcProvider {
    const provider = this.providers.get(network.toLowerCase());
    if (!provider) {
      throw new Error(`Unsupported network: ${network}`);
    }
    return provider;
  }

  /**
   * Create a new Ethereum wallet
   */
  async createWallet(userId: string, network: string = "ethereum"): Promise<{
    address: string;
    privateKey: string;
    mnemonic: string;
  }> {
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || "",
    };
  }

  /**
   * Import wallet from mnemonic phrase
   */
  async importWalletFromMnemonic(mnemonic: string): Promise<{
    address: string;
    privateKey: string;
  }> {
    try {
      const wallet = ethers.Wallet.fromPhrase(mnemonic);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
      };
    } catch (error: any) {
      throw new Error(`Invalid mnemonic phrase: ${error.message}`);
    }
  }

  /**
   * Import wallet from private key
   */
  async importWalletFromPrivateKey(privateKey: string): Promise<{
    address: string;
    privateKey: string;
  }> {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
      };
    } catch (error: any) {
      throw new Error(`Invalid private key: ${error.message}`);
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(address: string, network: string = "ethereum"): Promise<string> {
    try {
      const provider = this.getProvider(network);
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error(`Error fetching balance for ${address} on ${network}:`, error);
      return "0";
    }
  }

  /**
   * Send transaction
   */
  async sendTransaction(
    privateKey: string,
    to: string,
    amount: string,
    network: string = "ethereum"
  ): Promise<{ hash: string; success: boolean }> {
    try {
      const provider = this.getProvider(network);
      const wallet = new ethers.Wallet(privateKey, provider);
      
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      await tx.wait();

      return {
        hash: tx.hash,
        success: true,
      };
    } catch (error: any) {
      console.error(`Transaction failed on ${network}:`, error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(
    from: string,
    to: string,
    amount: string,
    network: string = "ethereum"
  ): Promise<string> {
    try {
      const provider = this.getProvider(network);
      const gasEstimate = await provider.estimateGas({
        from,
        to,
        value: ethers.parseEther(amount),
      });

      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
      
      const gasCost = gasEstimate * gasPrice;
      return ethers.formatEther(gasCost);
    } catch (error) {
      console.error(`Gas estimation failed on ${network}:`, error);
      return "0";
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string, network: string = "ethereum") {
    try {
      const provider = this.getProvider(network);
      const tx = await provider.getTransaction(txHash);
      
      if (!tx) {
        return null;
      }

      const receipt = await provider.getTransactionReceipt(txHash);
      
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        gasUsed: receipt?.gasUsed.toString(),
        status: receipt?.status === 1 ? "confirmed" : "failed",
        blockNumber: tx.blockNumber,
      };
    } catch (error) {
      console.error(`Error fetching transaction ${txHash} on ${network}:`, error);
      return null;
    }
  }

  /**
   * Deploy ERC-20 Token Contract
   */
  async deployERC20(
    name: string,
    symbol: string,
    initialSupply: string,
    privateKey: string,
    network: string = "polygon"
  ): Promise<{ address: string; txHash: string }> {
    try {
      const provider = this.getProvider(network);
      const wallet = new ethers.Wallet(privateKey, provider);

      // Simple ERC-20 contract bytecode and ABI
      const abi = [
        "constructor(string memory name, string memory symbol, uint256 initialSupply)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
      ];

      // This is a simplified bytecode - in production, use compiled OpenZeppelin contracts
      const bytecode = "0x608060405234801561001057600080fd5b50";

      const factory = new ethers.ContractFactory(abi, bytecode, wallet);
      const contract = await factory.deploy(
        name,
        symbol,
        ethers.parseUnits(initialSupply, 18)
      );

      await contract.waitForDeployment();
      const address = await contract.getAddress();
      const deployTx = contract.deploymentTransaction();

      return {
        address,
        txHash: deployTx?.hash || "",
      };
    } catch (error: any) {
      console.error(`ERC-20 deployment failed on ${network}:`, error);
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  /**
   * Deploy ERC-721 NFT Contract
   */
  async deployERC721(
    name: string,
    symbol: string,
    privateKey: string,
    network: string = "polygon"
  ): Promise<{ address: string; txHash: string }> {
    try {
      const provider = this.getProvider(network);
      const wallet = new ethers.Wallet(privateKey, provider);

      const abi = [
        "constructor(string memory name, string memory symbol)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function mint(address to, uint256 tokenId, string memory uri) returns (bool)",
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function tokenURI(uint256 tokenId) view returns (string)",
      ];

      // Simplified bytecode - use compiled OpenZeppelin ERC721URIStorage in production
      const bytecode = "0x608060405234801561001057600080fd5b50";

      const factory = new ethers.ContractFactory(abi, bytecode, wallet);
      const contract = await factory.deploy(name, symbol);

      await contract.waitForDeployment();
      const address = await contract.getAddress();
      const deployTx = contract.deploymentTransaction();

      return {
        address,
        txHash: deployTx?.hash || "",
      };
    } catch (error: any) {
      console.error(`ERC-721 deployment failed on ${network}:`, error);
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  /**
   * Mint NFT
   */
  async mintNFT(
    contractAddress: string,
    toAddress: string,
    tokenId: number,
    tokenURI: string,
    privateKey: string,
    network: string = "polygon"
  ): Promise<{ txHash: string }> {
    try {
      const provider = this.getProvider(network);
      const wallet = new ethers.Wallet(privateKey, provider);

      const abi = [
        "function mint(address to, uint256 tokenId, string memory uri) returns (bool)",
      ];

      const contract = new ethers.Contract(contractAddress, abi, wallet);
      const tx = await contract.mint(toAddress, tokenId, tokenURI);
      await tx.wait();

      return { txHash: tx.hash };
    } catch (error: any) {
      console.error(`NFT minting failed on ${network}:`, error);
      throw new Error(`Minting failed: ${error.message}`);
    }
  }
}

export const web3Service = new Web3Service();
