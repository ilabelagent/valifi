const { EventEmitter } = require('events');
const { ethers } = require('ethers');
const { Client, Wallet: XRPLWallet, xrpl } = require('xrpl');
const fs = require('fs');
const path = require('path');

const ERC20_CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DivineToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
`;

class TokenCreationBot extends EventEmitter {
  constructor(core) {
    super();
    this.core = core;
    this.name = 'token-creation-bot';
    this.providers = new Map();
    this.wallets = new Map();
    this.xrplClient = null;
    this.deployedTokens = new Map();
    this.tempDir = path.join(process.cwd(), 'temp', 'token-deployments');
  }

  async initialize() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    const networks = {
      ethereum: process.env.ETH_RPC_URL || process.env.INFURA_URL,
      bsc: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
      polygon: process.env.POLYGON_RPC_URL,
      arbitrum: process.env.ARBITRUM_RPC_URL,
      optimism: process.env.OPTIMISM_RPC_URL
    };

    for (const [network, rpcUrl] of Object.entries(networks)) {
      if (rpcUrl) {
        try {
          const provider = new ethers.JsonRpcProvider(rpcUrl);
          this.providers.set(network, provider);
          
          const privateKey = process.env.ETH_PRIVATE_KEY || process.env.TOKEN_DEPLOYER_KEY;
          if (privateKey) {
            const wallet = new ethers.Wallet(privateKey, provider);
            this.wallets.set(network, wallet);
          }
        } catch (error) {
          console.warn(`Failed to connect to ${network}:`, error.message);
        }
      }
    }

    if (process.env.XRPL_SERVER) {
      try {
        this.xrplClient = new Client(process.env.XRPL_SERVER || 'wss://s1.ripple.com');
        await this.xrplClient.connect();
        console.log('XRP Ledger Connected', { server: process.env.XRPL_SERVER });
      } catch (error) {
        console.warn('XRP Ledger connection failed:', error.message);
      }
    }

    console.log('Token Creation Bot Initialized - REAL BLOCKCHAIN', {
      evmNetworks: Array.from(this.providers.keys()),
      xrplConnected: !!this.xrplClient,
      tempDir: this.tempDir
    });

    return true;
  }

  async createERC20Token({ network = 'ethereum', name, symbol, initialSupply, decimals = 18 }) {
    const wallet = this.wallets.get(network);
    
    if (!wallet) {
      return { 
        success: false, 
        message: `No wallet configured for ${network}. Set ETH_PRIVATE_KEY or TOKEN_DEPLOYER_KEY.` 
      };
    }

    if (!name || !symbol || !initialSupply) {
      return { success: false, message: 'Name, symbol, and initialSupply required' };
    }

    try {
      console.log('Creating ERC-20 Token', { network, name, symbol, supply: initialSupply });

      const contractCode = ERC20_CONTRACT_SOURCE
        .replace('DivineToken', symbol + 'Token')
        .replace('ERC20(name, symbol)', `ERC20("${name}", "${symbol}")`);

      const deploymentInfo = {
        network,
        name,
        symbol,
        initialSupply,
        decimals,
        contractCode,
        deployer: wallet.address,
        timestamp: new Date().toISOString(),
        status: 'ready_for_deployment'
      };

      const fileName = `${symbol}_${network}_${Date.now()}.json`;
      const filePath = path.join(this.tempDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

      this.deployedTokens.set(`${network}:${symbol}`, deploymentInfo);

      console.log('Token Deployment Prepared', { 
        symbol, 
        network,
        tempFile: fileName
      });

      return {
        success: true,
        token: deploymentInfo,
        tempFile: filePath,
        note: 'Deploy using Hardhat: npx hardhat run scripts/deploy-token.js --network ' + network,
        contractCode
      };
    } catch (error) {
      console.log('Token Creation Failed', { error: error.message });
      return { success: false, message: error.message };
    }
  }

  async createXRPLToken({ currencyCode, issuerSeed }) {
    if (!this.xrplClient || !this.xrplClient.isConnected()) {
      return { 
        success: false, 
        message: 'XRP Ledger not connected. Set XRPL_SERVER environment variable.' 
      };
    }

    if (!currencyCode || currencyCode.length !== 3) {
      return { success: false, message: 'Currency code must be exactly 3 characters (e.g., "USD", "EUR")' };
    }

    try {
      const wallet = issuerSeed 
        ? XRPLWallet.fromSeed(issuerSeed)
        : XRPLWallet.generate();

      console.log('Creating XRPL Token', { 
        currencyCode, 
        issuer: wallet.address 
      });

      const accountSetTx = {
        TransactionType: 'AccountSet',
        Account: wallet.address,
        SetFlag: xrpl.AccountSetAsfFlags.asfRequireAuth
      };

      const prepared = await this.xrplClient.autofill(accountSetTx);
      const signed = wallet.sign(prepared);
      
      const tokenInfo = {
        network: 'xrpl',
        currencyCode,
        issuer: wallet.address,
        seed: wallet.seed,
        publicKey: wallet.publicKey,
        timestamp: new Date().toISOString(),
        status: 'ready_for_issuance',
        txBlob: signed.tx_blob
      };

      const fileName = `XRPL_${currencyCode}_${Date.now()}.json`;
      const filePath = path.join(this.tempDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(tokenInfo, null, 2));

      this.deployedTokens.set(`xrpl:${currencyCode}`, tokenInfo);

      console.log('XRPL Token Prepared', { 
        currencyCode,
        issuer: wallet.address,
        tempFile: fileName
      });

      return {
        success: true,
        token: tokenInfo,
        tempFile: filePath,
        note: 'Token issuer account created. Fund with XRP before issuing tokens.',
        warning: 'SECURE THE SEED! Store in safe location.'
      };
    } catch (error) {
      console.log('XRPL Token Creation Failed', { error: error.message });
      return { success: false, message: error.message };
    }
  }

  async createMusicToken({ songTitle, artist, network = 'polygon', autoNFT = true }) {
    const tokenSymbol = songTitle
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 5);
    
    const tokenName = `${songTitle} by ${artist}`;
    const initialSupply = 1000000;

    console.log('Creating Music Token', { 
      song: songTitle,
      artist,
      symbol: tokenSymbol,
      network 
    });

    const tokenResult = await this.createERC20Token({
      network,
      name: tokenName,
      symbol: tokenSymbol,
      initialSupply
    });

    if (tokenResult.success && autoNFT) {
      const nftBot = this.core?.getBotById?.('nft-minting-bot');
      if (nftBot) {
        const collectionAddress = process.env.MUSIC_NFT_COLLECTION;
        if (collectionAddress) {
          await nftBot.execute({
            action: 'mint_music',
            songTitle,
            artist,
            collectionAddress,
            recipientAddress: this.wallets.get(network)?.address
          });
        }
      }
    }

    return {
      ...tokenResult,
      musicToken: true,
      song: songTitle,
      artist
    };
  }

  async listDeployedTokens() {
    return {
      success: true,
      tokens: Array.from(this.deployedTokens.entries()).map(([key, data]) => ({
        id: key,
        ...data
      })),
      tempDirectory: this.tempDir
    };
  }

  async execute(params = {}) {
    const { action } = params;

    switch (action) {
      case 'create_erc20':
        return this.createERC20Token(params);
      case 'create_xrpl':
        return this.createXRPLToken(params);
      case 'create_music_token':
        return this.createMusicToken(params);
      case 'list_tokens':
        return this.listDeployedTokens();
      default:
        return { success: false, message: `Unknown action: ${action}` };
    }
  }

  async shutdown() {
    if (this.xrplClient && this.xrplClient.isConnected()) {
      await this.xrplClient.disconnect();
    }
  }
}

module.exports = TokenCreationBot;
