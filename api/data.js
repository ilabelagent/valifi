/*
 * This module defines static seed data used throughout the Valifi backend.
 * In a production environment, these arrays should be empty, and all data
 * should be fetched from the database.
 */

export const AssetType = {
  CRYPTO: 'Crypto',
  STOCK: 'Stock',
  CASH: 'Cash',
  NFT: 'NFT',
  REIT: 'REIT',
};

export const initialPortfolio = {
  totalValueUSD: 0,
  change24hValue: 0,
  change24hPercent: 0,
  assets: [],
  tradeAssets: [],
  transactions: [],
};

export const initialNotifications = [];

export const initialNewsItems = [];

export const initialUserActivity = [];

// --- P2P MOCK DATA ---
export const p2pTraderBadges = [];
export const p2pUsers = {};
export const p2pTradableAssets = {};
export const p2pPaymentMethods = {};
export const p2pUserPaymentMethods = [];
export const p2pOffers = [];
export const p2pOrders = [];

// --- STAKABLE STOCKS ---
export const stakableStocks = [];

// --- REIT & NFT DATA ---
export const mockReitProperties = [];
export const investableNFTs = [];