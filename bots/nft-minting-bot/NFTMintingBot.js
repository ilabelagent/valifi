const KingdomBot = require('../base/KingdomBot');
const { ethers } = require('ethers');

const ERC721_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function mint(address to, uint256 tokenId, string uri) returns (uint256)",
  "function safeMint(address to, string uri) returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)"
];

const ERC721_BYTECODE = "0x608060405234801561001057600080fd5b50610a31806100206000396000f3fe";

class NFTMintingBot extends KingdomBot {
  constructor(core) {
    super(core, 'nft-minting-bot', 'NFT Minting & Management', '🎨');
    this.provider = null;
    this.wallet = null;
    this.nftCollections = new Map();
  }

  async initialize() {
    const rpcUrl = process.env.ETH_RPC_URL || process.env.POLYGON_RPC_URL || process.env.INFURA_URL;
    const privateKey = process.env.ETH_PRIVATE_KEY || process.env.NFT_MINTER_KEY;

    if (rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      if (privateKey) {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.logDivineAction('NFT Minting Bot Initialized', { 
          minter: this.wallet.address,
          network: rpcUrl.includes('polygon') ? 'Polygon' : 'Ethereum'
        });
      }
    }

    return true;
  }

  async deployNFTCollection({ name, symbol, baseURI }) {
    if (!this.wallet) {
      return { 
        success: false, 
        message: 'No wallet configured. Set ETH_PRIVATE_KEY or NFT_MINTER_KEY.' 
      };
    }

    try {
      const contractCode = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.20;
        import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
        import "@openzeppelin/contracts/access/Ownable.sol";
        
        contract ${name.replace(/\s/g, '')}NFT is ERC721URIStorage, Ownable {
          uint256 private _tokenIdCounter;
          
          constructor() ERC721("${name}", "${symbol}") Ownable(msg.sender) {}
          
          function safeMint(address to, string memory uri) public onlyOwner returns (uint256) {
            uint256 tokenId = _tokenIdCounter++;
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uri);
            return tokenId;
          }
        }
      `;

      this.logDivineAction('Deploying NFT Collection', { name, symbol });

      this.nftCollections.set(name, {
        name,
        symbol,
        baseURI,
        deployed: true,
        contractCode,
        minter: this.wallet.address,
        createdAt: new Date().toISOString()
      });

      return {
        success: true,
        message: `NFT Collection '${name}' ready for deployment`,
        name,
        symbol,
        contractCode,
        note: 'Deploy using Hardhat or Remix with the provided contract code'
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async mintNFT({ collectionAddress, recipientAddress, tokenURI, metadata }) {
    if (!this.wallet) {
      return { 
        success: false, 
        message: 'No wallet configured for minting.' 
      };
    }

    try {
      const nftContract = new ethers.Contract(collectionAddress, ERC721_ABI, this.wallet);

      this.logDivineAction('Minting NFT', { 
        collection: collectionAddress,
        recipient: recipientAddress,
        tokenURI 
      });

      const tx = await nftContract.safeMint(recipientAddress, tokenURI);
      const receipt = await tx.wait();

      const tokenId = receipt.logs[0]?.topics[3] ? 
        parseInt(receipt.logs[0].topics[3], 16) : 'unknown';

      this.logDivineAction('NFT Minted Successfully', { 
        tokenId,
        txHash: tx.hash,
        recipient: recipientAddress 
      });

      return {
        success: true,
        tokenId,
        txHash: tx.hash,
        recipient: recipientAddress,
        tokenURI,
        metadata,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      this.logDivineAction('NFT Minting Failed', { error: error.message });
      return { success: false, message: error.message };
    }
  }

  async mintMusicNFT({ songTitle, artist, albumArt, audioURL, recipientAddress, collectionAddress }) {
    const metadata = {
      name: songTitle,
      description: `Music NFT by ${artist}`,
      image: albumArt,
      animation_url: audioURL,
      attributes: [
        { trait_type: 'Artist', value: artist },
        { trait_type: 'Type', value: 'Music' },
        { trait_type: 'Release Date', value: new Date().toISOString() }
      ]
    };

    const ipfsHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
    const tokenURI = `ipfs://${ipfsHash}`;

    this.logDivineAction('Preparing Music NFT Mint', { 
      song: songTitle, 
      artist, 
      metadata 
    });

    return this.mintNFT({
      collectionAddress,
      recipientAddress,
      tokenURI,
      metadata
    });
  }

  async getNFTDetails({ collectionAddress, tokenId }) {
    if (!this.provider) {
      return { success: false, message: 'No provider configured' };
    }

    try {
      const nftContract = new ethers.Contract(collectionAddress, ERC721_ABI, this.provider);
      
      const [owner, tokenURI] = await Promise.all([
        nftContract.ownerOf(tokenId),
        nftContract.tokenURI(tokenId)
      ]);

      return {
        success: true,
        tokenId,
        owner,
        tokenURI,
        collection: collectionAddress
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async execute(params = {}) {
    const { action } = params;

    switch (action) {
      case 'deploy_collection':
        return this.deployNFTCollection(params);
      case 'mint':
        return this.mintNFT(params);
      case 'mint_music':
        return this.mintMusicNFT(params);
      case 'get_nft':
        return this.getNFTDetails(params);
      case 'list_collections':
        return {
          success: true,
          collections: Array.from(this.nftCollections.entries()).map(([name, data]) => ({
            name,
            ...data
          }))
        };
      default:
        return { success: false, message: `Unknown action: ${action}` };
    }
  }
}

module.exports = NFTMintingBot;
