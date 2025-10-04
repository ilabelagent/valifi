const KingdomBot = require('../../lib/core/KingdomBot');
const { ethers } = require('ethers');

class Web3Bot extends KingdomBot {
  constructor(core) {
    super(core);
    this.providers = new Map();
    this.wallets = new Map();
    this.transactions = [];
  }

  async initialize() {
    const networks = {
      ethereum: process.env.ETH_RPC_URL || process.env.INFURA_URL,
      polygon: process.env.POLYGON_RPC_URL,
      bsc: process.env.BSC_RPC_URL,
      arbitrum: process.env.ARBITRUM_RPC_URL,
      optimism: process.env.OPTIMISM_RPC_URL
    };

    for (const [network, rpcUrl] of Object.entries(networks)) {
      if (rpcUrl) {
        try {
          const provider = new ethers.JsonRpcProvider(rpcUrl);
          this.providers.set(network, provider);
          
          const privateKey = process.env.ETH_PRIVATE_KEY || process.env.WEB3_PRIVATE_KEY;
          if (privateKey) {
            const wallet = new ethers.Wallet(privateKey, provider);
            this.wallets.set(network, wallet);
          }
          
          this.logDivineAction('Web3 Provider Connected', { network, rpcUrl });
        } catch (error) {
          this.logDivineAction('Web3 Provider Failed', { network, error: error.message });
        }
      }
    }

    this.logDivineAction('Web3 Bot Initialized - REAL BLOCKCHAIN', { 
      networks: Array.from(this.providers.keys()),
      walletsConfigured: this.wallets.size > 0
    });

    return true;
  }

  async sendTransaction({ network = 'ethereum', to, value, data = '0x' }) {
    const wallet = this.wallets.get(network);
    
    if (!wallet) {
      return { 
        success: false, 
        message: `No wallet configured for ${network}. Set ETH_PRIVATE_KEY or WEB3_PRIVATE_KEY.` 
      };
    }

    if (!to || !value) {
      return { success: false, message: 'to and value are required' };
    }

    try {
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(value.toString()),
        data
      });

      this.logDivineAction('REAL Transaction Sent', { 
        network,
        txHash: tx.hash,
        to,
        value,
        from: wallet.address
      });

      const receipt = await tx.wait();

      this.transactions.push({
        txHash: tx.hash,
        network,
        from: wallet.address,
        to,
        value,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: wallet.address,
        to,
        value
      };
    } catch (error) {
      this.logDivineAction('Transaction Failed', { error: error.message });
      return { success: false, message: error.message };
    }
  }

  async callContract({ network = 'ethereum', contractAddress, abi, method, params = [], value = '0' }) {
    const wallet = this.wallets.get(network) || this.providers.get(network);
    
    if (!wallet) {
      return { 
        success: false, 
        message: `No provider configured for ${network}` 
      };
    }

    if (!contractAddress || !method || !abi) {
      return { success: false, message: 'contractAddress, abi, and method are required' };
    }

    try {
      const contract = new ethers.Contract(contractAddress, abi, wallet);
      
      const isWriteOperation = this.wallets.has(network);
      
      if (isWriteOperation && parseFloat(value) > 0) {
        const tx = await contract[method](...params, {
          value: ethers.parseEther(value.toString())
        });
        
        const receipt = await tx.wait();
        
        this.logDivineAction('REAL Contract Write Operation', { 
          network,
          contract: contractAddress,
          method,
          txHash: tx.hash
        });

        return {
          success: true,
          txHash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        };
      } else {
        const result = await contract[method](...params);
        
        this.logDivineAction('REAL Contract Read Operation', { 
          network,
          contract: contractAddress,
          method
        });

        return {
          success: true,
          result: result.toString(),
          method,
          contract: contractAddress
        };
      }
    } catch (error) {
      this.logDivineAction('Contract Call Failed', { error: error.message });
      return { success: false, message: error.message };
    }
  }

  async getBalance({ network = 'ethereum', address }) {
    const provider = this.providers.get(network);
    
    if (!provider) {
      return { success: false, message: `No provider for ${network}` };
    }

    if (!address) {
      const wallet = this.wallets.get(network);
      address = wallet?.address;
    }

    if (!address) {
      return { success: false, message: 'No address provided and no wallet configured' };
    }

    try {
      const balance = await provider.getBalance(address);
      
      return {
        success: true,
        address,
        network,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString()
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getGasPrice({ network = 'ethereum' }) {
    const provider = this.providers.get(network);
    
    if (!provider) {
      return { success: false, message: `No provider for ${network}` };
    }

    try {
      const feeData = await provider.getFeeData();
      
      return {
        success: true,
        network,
        gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
        maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async execute(params = {}) {
    const { action } = params;
    
    switch (action) {
      case 'send_transaction':
        return this.sendTransaction(params);
      case 'call_contract':
        return this.callContract(params);
      case 'get_balance':
        return this.getBalance(params);
      case 'gas_price':
        return this.getGasPrice(params);
      case 'list_networks':
        return {
          success: true,
          networks: Array.from(this.providers.keys()),
          walletsConfigured: Array.from(this.wallets.keys())
        };
      case 'transactions':
        return {
          success: true,
          transactions: this.transactions
        };
      default:
        return { success: false, message: `Unknown action for Web3Bot: ${action}` };
    }
  }
}

module.exports = Web3Bot;
