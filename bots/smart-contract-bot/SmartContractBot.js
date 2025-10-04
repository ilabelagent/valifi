const { EventEmitter } = require('events');
const { ethers } = require('ethers');

class SmartContractBot extends EventEmitter {
  constructor(core) {
    super();
    this.core = core;
    this.name = 'smart-contract-bot';
    this.provider = null;
    this.wallet = null;
    this.deployedContracts = new Map();
  }

  async initialize() {
    const rpcUrl = process.env.ETH_RPC_URL || process.env.INFURA_URL || process.env.ALCHEMY_URL;
    const privateKey = process.env.ETH_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;

    if (rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      if (privateKey) {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        console.log('Smart Contract Bot Initialized', { 
          address: this.wallet.address,
          network: rpcUrl 
        });
      } else {
        console.log('Smart Contract Bot - Read-Only Mode (No private key)');
      }
    } else {
      console.log('Smart Contract Bot - Offline Mode (No RPC URL)');
    }

    return true;
  }

  async deployContract({ contractName, abi, bytecode, constructorArgs = [] }) {
    if (!this.wallet) {
      return { 
        success: false, 
        message: 'No wallet configured. Set ETH_PRIVATE_KEY environment variable.' 
      };
    }

    try {
      const factory = new ethers.ContractFactory(abi, bytecode, this.wallet);
      
      console.log('Deploying Contract', { contractName, args: constructorArgs });
      
      const contract = await factory.deploy(...constructorArgs);
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      
      this.deployedContracts.set(contractName, {
        address,
        abi,
        deployedAt: new Date().toISOString(),
        deployer: this.wallet.address
      });

      console.log('Contract Deployed', { 
        contractName, 
        address,
        txHash: contract.deploymentTransaction()?.hash 
      });

      return {
        success: true,
        contractName,
        address,
        txHash: contract.deploymentTransaction()?.hash,
        deployer: this.wallet.address
      };
    } catch (error) {
      console.log('Contract Deployment Failed', { contractName, error: error.message });
      return { success: false, message: error.message };
    }
  }

  async executeContract({ contractAddress, abi, method, params = [], value = '0' }) {
    if (!this.wallet) {
      return { 
        success: false, 
        message: 'No wallet configured. Set ETH_PRIVATE_KEY environment variable.' 
      };
    }

    try {
      const contract = new ethers.Contract(contractAddress, abi, this.wallet);
      
      const tx = await contract[method](...params, {
        value: ethers.parseEther(value)
      });
      
      console.log('Executing Contract Method', { 
        contract: contractAddress, 
        method, 
        params,
        txHash: tx.hash 
      });

      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      console.log('Contract Execution Failed', { error: error.message });
      return { success: false, message: error.message };
    }
  }

  async readContract({ contractAddress, abi, method, params = [] }) {
    if (!this.provider) {
      return { 
        success: false, 
        message: 'No provider configured. Set ETH_RPC_URL environment variable.' 
      };
    }

    try {
      const contract = new ethers.Contract(contractAddress, abi, this.provider);
      const result = await contract[method](...params);

      return {
        success: true,
        result: result.toString(),
        method,
        contract: contractAddress
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getGasPrice() {
    if (!this.provider) {
      return { success: false, message: 'No provider configured' };
    }

    try {
      const feeData = await this.provider.getFeeData();
      
      return {
        success: true,
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
      case 'deploy':
        return this.deployContract(params);
      case 'execute':
        return this.executeContract(params);
      case 'read':
        return this.readContract(params);
      case 'gas_price':
        return this.getGasPrice();
      case 'list_contracts':
        return {
          success: true,
          contracts: Array.from(this.deployedContracts.entries()).map(([name, data]) => ({
            name,
            ...data
          }))
        };
      default:
        return { success: false, message: `Unknown action: ${action}` };
    }
  }
}

module.exports = SmartContractBot;
