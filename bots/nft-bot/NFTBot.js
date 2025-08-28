const KingdomBot = require('../../lib/core/KingdomBot');

/**
 * NFTBot scaffolds non‑fungible token operations such as minting,
 * buying, selling and listing collections.  Future implementations
 * will integrate with NFT standards and marketplaces.
 */
const { readData, writeData } = require('../../lib/storage');

/**
 * NFTBot manages a simple NFT marketplace.  Users can mint new
 * tokens, list them for sale, purchase existing tokens, and view
 * their collections.  All NFTs are stored with a unique id,
 * name, owner and price.  Ownership and for-sale status are
 * persisted to disk.
 */
class NFTBot extends KingdomBot {
  async initialize() {
    this.logDivineAction('NFT Bot Initialized');
    return true;
  }

  _getData() {
    const data = readData('data/nfts.json');
    if (!data.nfts) data.nfts = [];
    return data;
  }
  _saveData(data) {
    writeData('data/nfts.json', data);
  }

  /**
   * Mint a new NFT.  Assigns ownership to the creating user and
   * lists the token for sale at the specified price.
   */
  mintNft({ userId = 'default', name, price }) {
    const pr = Number(price);
    if (!name || !pr || pr <= 0) {
      return { success: false, message: 'Missing or invalid name/price' };
    }
    const data = this._getData();
    const id = `nft_${Date.now()}`;
    const nft = {
      id,
      name,
      ownerId: userId,
      price: pr,
      forSale: true,
    };
    data.nfts.push(nft);
    this._saveData(data);
    this.logDivineAction('NFT Minted', { userId, id, name, price: pr });
    return { success: true, nft };
  }

  /**
   * Purchase an NFT that is listed for sale.  Transfers ownership
   * to the buyer and marks the token as no longer for sale.
   */
  buyNft({ userId = 'default', nftId }) {
    if (!nftId) return { success: false, message: 'Missing nftId' };
    const data = this._getData();
    const nft = data.nfts.find((n) => n.id === nftId);
    if (!nft) return { success: false, message: 'NFT not found' };
    if (!nft.forSale) return { success: false, message: 'NFT not for sale' };
    if (nft.ownerId === userId) return { success: false, message: 'Cannot buy your own NFT' };
    nft.ownerId = userId;
    nft.forSale = false;
    this._saveData(data);
    this.logDivineAction('NFT Purchased', { userId, nftId });
    return { success: true, nft };
  }

  /**
   * List an NFT for sale or update its price.  The caller must be
   * the owner of the NFT.
   */
  sellNft({ userId = 'default', nftId, price }) {
    const pr = Number(price);
    if (!nftId || !pr || pr <= 0) return { success: false, message: 'Missing or invalid nftId/price' };
    const data = this._getData();
    const nft = data.nfts.find((n) => n.id === nftId);
    if (!nft) return { success: false, message: 'NFT not found' };
    if (nft.ownerId !== userId) return { success: false, message: 'Not the owner of this NFT' };
    nft.price = pr;
    nft.forSale = true;
    this._saveData(data);
    this.logDivineAction('NFT Listed', { userId, nftId, price: pr });
    return { success: true, nft };
  }

  /**
   * Return all NFTs owned by a user.
   */
  getCollection({ userId = 'default' }) {
    const data = this._getData();
    const collection = data.nfts.filter((n) => n.ownerId === userId);
    return { success: true, nfts: collection };
  }

  async execute(params = {}) {
    const { action } = params;
    switch (action) {
      case 'mint_nft':
        return this.mintNft(params);
      case 'buy_nft':
        return this.buyNft(params);
      case 'sell_nft':
        return this.sellNft(params);
      case 'get_collection':
        return this.getCollection(params);
      default:
        return { success: false, message: `Unknown action for NFTBot: ${action}` };
    }
  }
}

module.exports = NFTBot;