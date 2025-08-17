/*
 * This module defines static seed data used throughout the Valifi backend.  It
 * contains a small portfolio, notification list and news items that mirror
 * the example data exposed by the React frontend.  The values are
 * deterministic: no random values are generated at runtime.  Dates are
 * computed relative to the current time so that the information remains
 * realistic when the server is started on different days.
 */

export const AssetType = {
  CRYPTO: 'Crypto',
  STOCK: 'Stock',
  CASH: 'Cash',
  NFT: 'NFT',
  REIT: 'REIT',
};

// Utility for generating deterministic investment logs.  Reference IDs are
// derived from the asset name and a numeric suffix rather than random
// characters.  Log entries are sorted with the most recent first.
function generateLogs(asset) {
  const logs = [];
  const now = Date.now();
  // Record the initial purchase exactly thirty days ago
  logs.push({
    id: `log-${asset.name}-1`,
    date: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
    action: 'Buy',
    amount: asset.initialInvestment,
    status: 'Completed',
    referenceId: `TX-BUY-${asset.name.replace(/\s+/g, '').toUpperCase()}-1`,
  });
  const earnings = asset.valueUSD - asset.initialInvestment;
  if (earnings > 0) {
    const firstPayout = earnings * 0.4;
    const secondPayout = earnings * 0.6;
    // Dividend payout fifteen days ago
    logs.push({
      id: `log-${asset.name}-2`,
      date: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Dividend Payout',
      amount: firstPayout,
      status: 'Completed',
      referenceId: `TX-REWARD-${asset.name.replace(/\s+/g, '').toUpperCase()}-2`,
    });
    // Reward payout two days ago
    logs.push({
      id: `log-${asset.name}-3`,
      date: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'Reward',
      amount: secondPayout,
      status: 'Completed',
      referenceId: `TX-REWARD-${asset.name.replace(/\s+/g, '').toUpperCase()}-3`,
    });
  }
  return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Sample asset list.  These assets are used to prepopulate the sample user
// portfolio.  Each asset includes a computed logs array if it represents an
// investment (rather than pure cash).
const initialAssetsData = [
  {
    id: '1',
    name: 'Bitcoin',
    ticker: 'BTC',
    type: AssetType.CRYPTO,
    balance: 1.25,
    valueUSD: 85234.5,
    change24h: 2.5,
    allocation: 0,
    status: 'Active',
    maturityDate: '2025-03-01T00:00:00Z',
    expectedReturn: 8.5,
    initialInvestment: 75000,
    totalEarnings: 10234.5,
    Icon: 'BtcIcon',
  },
  {
    id: '2',
    name: 'Ethereum Staking',
    ticker: 'ETH',
    type: AssetType.CRYPTO,
    balance: 10.8,
    valueUSD: 41040.0,
    change24h: 1.2,
    allocation: 0,
    status: 'Active',
    maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    expectedReturn: 4.5,
    initialInvestment: 38000,
    totalEarnings: 3040.0,
    apr: 4.5,
    payoutDestination: 'balance',
    Icon: 'EthIcon',
  },
  {
    id: '7',
    name: 'NVIDIA Corp Stake',
    ticker: 'NVDA',
    type: AssetType.STOCK,
    balance: 125,
    valueUSD: 18000.0,
    change24h: 3.1,
    allocation: 0,
    status: 'Active',
    initialInvestment: 15000,
    totalEarnings: 3000.0,
    stockStakeDetails: {
      stakedOn: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
      monthlyROI: 12.5,
      nextPayoutDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    },
    Icon: 'NvidiaIcon',
  },
  {
    id: '3',
    name: 'Apple Inc. Stake',
    ticker: 'AAPL',
    type: AssetType.STOCK,
    balance: 50,
    valueUSD: 12050.0,
    change24h: -0.5,
    allocation: 0,
    status: 'Active',
    initialInvestment: 10000,
    totalEarnings: 2050.0,
    stockStakeDetails: {
      stakedOn: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
      monthlyROI: 12.5,
      nextPayoutDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    },
    Icon: 'AppleIcon',
  },
  {
    id: '4',
    name: 'Cash',
    ticker: 'USD',
    type: AssetType.CASH,
    balance: 10406.38,
    valueUSD: 10406.38,
    change24h: 0,
    allocation: 0,
    Icon: 'UsdIcon',
  },
  {
    id: '8',
    name: 'Google LLC Plan',
    ticker: 'GOOGL',
    type: AssetType.STOCK,
    balance: 50,
    valueUSD: 9000.0,
    change24h: 0.8,
    allocation: 0,
    status: 'Active',
    maturityDate: '2024-10-01T00:00:00Z',
    expectedReturn: 10.5,
    initialInvestment: 8000,
    totalEarnings: 1000.0,
    Icon: 'GoogleIcon',
  },
  {
    id: '10',
    name: 'Chainlink',
    ticker: 'LINK',
    type: AssetType.CRYPTO,
    balance: 500,
    valueUSD: 9000.0,
    change24h: 5.2,
    allocation: 0,
    status: 'Active',
    maturityDate: '2025-02-01T00:00:00Z',
    expectedReturn: 18.2,
    initialInvestment: 7500,
    totalEarnings: 1500.0,
    Icon: 'ChainlinkIcon',
  },
  {
    id: '9',
    name: 'Amazon.com Plan',
    ticker: 'AMZN',
    type: AssetType.STOCK,
    balance: 40,
    valueUSD: 7500.0,
    change24h: 1.1,
    allocation: 0,
    status: 'Matured',
    maturityDate: '2024-07-15T00:00:00Z',
    expectedReturn: 18.0,
    initialInvestment: 6000,
    totalEarnings: 1500.0,
    Icon: 'AmazonIcon',
  },
  {
    id: '11',
    name: 'Avalanche',
    ticker: 'AVAX',
    type: AssetType.CRYPTO,
    balance: 200,
    valueUSD: 7500.0,
    change24h: -2.5,
    allocation: 0,
    status: 'Active',
    maturityDate: '2024-12-01T00:00:00Z',
    expectedReturn: 9.1,
    initialInvestment: 6500,
    totalEarnings: 1000.0,
    Icon: 'AvalancheIcon',
  },
  {
    id: '12',
    name: 'Polkadot',
    ticker: 'DOT',
    type: AssetType.CRYPTO,
    balance: 1000,
    valueUSD: 7000.0,
    change24h: 1.8,
    allocation: 0,
    status: 'Active',
    maturityDate: '2024-09-10T00:00:00Z',
    expectedReturn: 14.8,
    initialInvestment: 6000,
    totalEarnings: 1000.0,
    Icon: 'PolkadotIcon',
  },
  {
    id: '13',
    name: 'Tesla, Inc. Stake',
    ticker: 'TSLA',
    type: AssetType.STOCK,
    balance: 30,
    valueUSD: 7200.0,
    change24h: -1.2,
    allocation: 0,
    status: 'Active',
    initialInvestment: 6000.0,
    totalEarnings: 1200.0,
    stockStakeDetails: {
      stakedOn: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
      monthlyROI: 10,
      nextPayoutDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    },
    Icon: 'TeslaIcon',
  },
  {
    id: '5',
    name: 'Solana',
    ticker: 'SOL',
    type: AssetType.CRYPTO,
    balance: 25,
    valueUSD: 4125.0,
    change24h: 4.1,
    allocation: 0,
    status: 'Active',
    maturityDate: '2024-12-01T00:00:00Z',
    expectedReturn: 7.2,
    initialInvestment: 3000,
    totalEarnings: 1125.0,
    Icon: 'SolanaIcon',
  },
  {
    id: '6',
    name: 'Cardano',
    ticker: 'ADA',
    type: AssetType.CRYPTO,
    balance: 5000,
    valueUSD: 2350.0,
    change24h: -1.8,
    allocation: 0,
    status: 'Active',
    maturityDate: '2025-04-01T00:00:00Z',
    expectedReturn: 3.8,
    initialInvestment: 2000,
    totalEarnings: 350.0,
    Icon: 'CardanoIcon',
  },
  {
    id: 'nft-1',
    name: 'Valifi Voyager #123',
    ticker: 'VLFV',
    type: AssetType.NFT,
    balance: 1,
    valueUSD: 14500,
    change24h: 12.5,
    allocation: 0,
    collection: 'Valifi Voyagers',
    imageUrl: 'https://picsum.photos/seed/vv123/400',
    floorPrice: 14500,
    lastSalePrice: 12000,
    rarityRank: 512,
    isFractional: false,
    Icon: 'NftIcon',
  },
  {
    id: 'nft-2',
    name: 'CryptoPunk #7804',
    ticker: 'PUNK',
    type: AssetType.NFT,
    balance: 1,
    valueUSD: 11800000,
    change24h: 5.2,
    allocation: 0,
    collection: 'CryptoPunks',
    imageUrl: 'https://picsum.photos/seed/punk7804/400',
    floorPrice: 11500000,
    rarityRank: 8,
    isFractional: false,
    Icon: 'NftIcon',
  },
  {
    id: 'nft-3',
    name: 'Bored Ape #8817',
    ticker: 'BAYC',
    type: AssetType.NFT,
    balance: 1,
    valueUSD: 95000,
    change24h: -2.1,
    allocation: 0,
    collection: 'Bored Ape Yacht Club',
    imageUrl: 'https://picsum.photos/seed/bayc8817/400',
    floorPrice: 93000,
    lastSalePrice: 98000,
    rarityRank: 1024,
    isFractional: false,
    Icon: 'NftIcon',
  },
  {
    id: 'nft-inv-1',
    name: 'Bored Ape #8817 Shares',
    ticker: 'BAYC-S',
    type: AssetType.NFT,
    isFractional: true,
    investableNFTId: 'nft-3',
    sharesOwned: 50,
    valueUSD: 5000,
    initialInvestment: 4500,
    totalEarnings: 500,
    unclaimedRewards: 50,
    balance: 50,
    change24h: -2.1,
    allocation: 0,
    collection: 'Bored Ape Yacht Club',
    imageUrl: 'https://picsum.photos/seed/bayc8817/400',
    floorPrice: 95000,
    Icon: 'NftIcon',
  },
];

// Augment each asset with its investment logs when appropriate.  Cash assets
// (which lack an initial investment) receive an empty logs array.  For
// fractional NFT investments we also attach logs based on their cost basis.
const initialAssets = initialAssetsData.map((asset) => {
  const shouldHaveLogs = asset.type !== AssetType.CASH && typeof asset.initialInvestment === 'number';
  return {
    ...asset,
    logs: shouldHaveLogs ? generateLogs(asset) : [],
  };
});

// The initial portfolio summarises the user’s holdings.  Totals are
// calculated explicitly from the asset list and do not rely on random
// computation.
const totalValueUSD = initialAssets.reduce((sum, a) => sum + (a.valueUSD || 0), 0);
// The 24h change is computed as a weighted sum of each asset's 24h change
// relative to its value.  This yields a realistic portfolio‑wide change.
const change24hValue = initialAssets.reduce((sum, a) => sum + (a.valueUSD * (a.change24h || 0) / 100), 0);
const change24hPercent = totalValueUSD === 0 ? 0 : (change24hValue / (totalValueUSD - change24hValue)) * 100;

export const initialPortfolio = {
  totalValueUSD: Number(totalValueUSD.toFixed(2)),
  change24hValue: Number(change24hValue.toFixed(2)),
  change24hPercent: Number(change24hPercent.toFixed(2)),
  assets: initialAssets,
  tradeAssets: [],
  transactions: [
    {
      id: 't-send-btc',
      date: '2024-07-30T11:00:00Z',
      description: 'Sent 0.05 BTC',
      type: 'Sent',
      amountUSD: -3450.0,
      status: 'Completed',
      txHash: '0xabc...def',
    },
    {
      id: 't-receive-eth',
      date: '2024-07-29T18:30:00Z',
      description: 'Received 2.5 ETH',
      type: 'Received',
      amountUSD: 9500.0,
      status: 'Completed',
      txHash: '0x123...456',
    },
    {
      id: 't-send-sol',
      date: '2024-07-27T09:15:00Z',
      description: 'Sent 10 SOL',
      type: 'Sent',
      amountUSD: -1650.0,
      status: 'Completed',
      txHash: '0x789...abc',
    },
    {
      id: 't-receive-usdt',
      date: '2024-07-26T20:00:00Z',
      description: 'Received 1000 USDT',
      type: 'Received',
      amountUSD: 1000.0,
      status: 'Completed',
      txHash: '0xdef...ghi',
    },
    {
      id: 't1',
      date: '2024-07-29T10:30:00Z',
      description: 'Bought BTC',
      type: 'Trade',
      amountUSD: -5000,
      status: 'Completed',
    },
    {
      id: 't2',
      date: '2024-07-29T09:00:00Z',
      description: 'ETH Staking Rewards',
      type: 'ROI Payout',
      amountUSD: 55.78,
      status: 'Completed',
    },
    {
      id: 't3',
      date: '2024-07-28T15:45:00Z',
      description: 'Bank Deposit',
      type: 'Deposit',
      amountUSD: 10000,
      status: 'Completed',
    },
    {
      id: 't4',
      date: '2024-07-27T11:00:00Z',
      description: 'Sold AAPL',
      type: 'Trade',
      amountUSD: 2500,
      status: 'Completed',
    },
    {
      id: 't5',
      date: '2024-07-26T18:00:00Z',
      description: 'NVDA Plan Matured',
      type: 'Maturity',
      amountUSD: 15000.0,
      status: 'Completed',
    },
  ],
};

export const initialNotifications = [
  {
    id: 'n1',
    type: 'investment',
    title: 'Plan Matured: NVIDIA Corp',
    description:
      'Your $12,000 investment has matured, yielding $3,000 in profit. The total amount is available for transfer.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    isRead: false,
    link: 'investments',
  },
  {
    id: 'n2',
    type: 'loan',
    title: 'Repayment Due Soon',
    description: 'Your loan repayment of $5,250 is due in 7 days.',
    timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    isRead: false,
    link: 'loans',
  },
  {
    id: 'n3',
    type: 'kyc',
    title: 'KYC Approved',
    description: 'Your identity has been successfully verified. All platform features are now unlocked.',
    timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'n4',
    type: 'system',
    title: 'New Login Alert',
    description:
      "A new login to your account was detected from Chrome on macOS. If this wasn't you, please secure your account.",
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    isRead: true,
  },
];

export const initialNewsItems = [
  {
    id: 'news1',
    title: 'New Card Tier Now Live',
    content:
      'Introducing the Obsidian Black card with enhanced rewards and cashback offers. Apply now in the Cards section.',
    timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'news2',
    title: 'Market Update: BTC Surges',
    content:
      'Bitcoin has reached a new 30-day high. Our AI predicts continued volatility. Trade with caution.',
    timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'news3',
    title: 'New REIT Property Available',
    content:
      'Invest in the new Azure Bay Residences, a high-yield property in Miami. See the Investments section for details.',
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
];

// Derive user activity from the transaction list.  Icons and labels are
// simplified here to reduce UI coupling.  In the frontend, these can map
// transaction types to icons via a configuration file.
function mapTransactionToActivity(tx) {
  const transactionTypeToIconString = (type) => {
    switch (type) {
        case 'Deposit': return 'DownloadIcon';
        case 'Withdrawal': return 'ArrowUpRightIcon';
        case 'Trade': return 'SwapIcon';
        case 'ROI Payout': return 'ArrowDownIcon';
        case 'Maturity': return 'CheckCircleIcon';
        case 'P2P': return 'RefreshIcon';
        case 'Sent': return 'ArrowUpRightIcon';
        case 'Loan Repayment': return 'UsdIcon';
        default: return 'ClockIcon';
    }
  };
  
  return {
    id: `act-${tx.id}`,
    action: tx.type,
    description: tx.description,
    timestamp: tx.date,
    icon: transactionTypeToIconString(tx.type),
  };
}

export const initialUserActivity = initialPortfolio.transactions.map(mapTransactionToActivity);

// --- P2P MOCK DATA ---
export const p2pTraderBadges = [
    { id: 'badge1', label: 'Valued Pro Trader', Icon: 'UserCheckIcon', color: 'text-primary' },
    { id: 'badge2', label: 'High Volume', Icon: 'TrendingUpIcon', color: 'text-emerald-400' },
    { id: 'badge3', label: 'Trusted by Community', Icon: 'ShieldCheckIcon', color: 'text-amber-400' },
];

export const p2pUsers = {
    'p2p1': { id: 'p2p1', name: 'CryptoKing', avatarUrl: 'https://i.pravatar.cc/40?u=p2p1', rating: 4.9, totalTrades: 1254, completionRate: 99.8, isVerified: true, countryCode: 'US', joinDate: '2022-01-15T00:00:00Z', language: 'English', trustScore: 98, badges: [p2pTraderBadges[0], p2pTraderBadges[2]] },
    'p2p2': { id: 'p2p2', name: 'NaijaTrader', avatarUrl: 'https://i.pravatar.cc/40?u=p2p2', rating: 4.8, totalTrades: 890, completionRate: 97.5, isVerified: true, countryCode: 'NG', joinDate: '2022-05-20T00:00:00Z', language: 'English', trustScore: 92, badges: [p2pTraderBadges[1]] },
    'p2p3': { id: 'p2p3', name: 'EuroHodler', avatarUrl: 'https://i.pravatar.cc/40?u=p2p3', rating: 5.0, totalTrades: 450, completionRate: 100, isVerified: true, countryCode: 'DE', joinDate: '2023-02-10T00:00:00Z', language: 'German', trustScore: 99 },
};

export const p2pTradableAssets = {
    'BTC': { ticker: 'BTC', name: 'Bitcoin', Icon: 'BtcIcon' },
    'ETH': { ticker: 'ETH', name: 'Ethereum', Icon: 'EthIcon' },
    'USDT': { ticker: 'USDT', name: 'Tether', Icon: 'UsdtIcon' },
};

export const p2pPaymentMethods = {
    ach: { id: 'pm1', methodType: 'Bank Transfer (ACH)', nickname: 'My US Bank', country: 'US', details: { accountHolderName: 'CryptoKing', accountNumber: '...1234', routingNumber: '...0025' } },
    cashapp: { id: 'pm2', methodType: 'Cash App', nickname: 'My Cash App', country: 'US', details: { cashtag: '$cryptoking' } },
    ng_bank: { id: 'pm3', methodType: 'Bank Transfer', nickname: 'GTBank', country: 'NG', details: { accountNumber: '...5678', bankName: 'GTBank' } },
    sepa: { id: 'pm4', methodType: 'Bank Transfer (SEPA)', nickname: 'SEPA Instant', country: 'DE', details: { accountHolderName: 'EuroHodler', iban: '...DE99' } },
};
export const p2pUserPaymentMethods = [p2pPaymentMethods.ach, p2pPaymentMethods.cashapp];


export const p2pOffers = [
    { id: 'offer1', type: 'SELL', user: p2pUsers.p2p1, asset: p2pTradableAssets.BTC, fiatCurrency: 'USD', price: 68500.50, availableAmount: 0.5, minOrder: 500, maxOrder: 10000, paymentMethods: [p2pPaymentMethods.ach, p2pPaymentMethods.cashapp], paymentTimeLimitMinutes: 15, terms: 'Experienced traders only. Please be ready to pay quickly.' },
    { id: 'offer2', type: 'SELL', user: p2pUsers.p2p2, asset: p2pTradableAssets.USDT, fiatCurrency: 'NGN', price: 1485.20, availableAmount: 2000, minOrder: 100000, maxOrder: 1000000, paymentMethods: [p2pPaymentMethods.ng_bank], paymentTimeLimitMinutes: 30 },
    { id: 'offer3', type: 'BUY', user: p2pUsers.p2p3, asset: p2pTradableAssets.ETH, fiatCurrency: 'EUR', price: 3450.00, availableAmount: 10, minOrder: 1000, maxOrder: 20000, paymentMethods: [p2pPaymentMethods.sepa], paymentTimeLimitMinutes: 15, terms: 'SEPA Instant transfers only for fast release.' },
];

export const p2pOrders = [
    {
        id: 'ord1', offer: p2pOffers[0], buyer: { id: 'user-1' }, seller: p2pUsers.p2p1, status: 'Payment Sent', createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), paymentSentAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), fiatAmount: 1000, cryptoAmount: 1000 / p2pOffers[0].price, chatHistory: [], paymentMethod: p2pPaymentMethods.ach
    },
    {
        id: 'ord2', offer: p2pOffers[1], buyer: p2pUsers.p2p2, seller: { id: 'user-1' }, status: 'Pending Payment', createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), expiresAt: new Date(Date.now() + 28 * 60 * 1000).toISOString(), fiatAmount: 148520, cryptoAmount: 100, chatHistory: [], paymentMethod: p2pPaymentMethods.ng_bank
    },
];

// --- STAKABLE STOCKS --- (from data/stakable-stocks.ts)
export const stakableStocks = [
    { id: 'stk-aapl', ticker: 'AAPL', name: 'Apple Inc.', Icon: 'AppleIcon', sector: 'Technology', price: 214.29, change24h: 1.25, poolSize: 95, status: 'Available' },
    { id: 'stk-msft', ticker: 'MSFT', name: 'Microsoft Corp.', Icon: 'MicrosoftIcon', sector: 'Technology', price: 442.57, change24h: -0.65, poolSize: 92, status: 'Available' },
    { id: 'stk-googl', ticker: 'GOOGL', name: 'Alphabet Inc.', Icon: 'GoogleIcon', sector: 'Communication Services', price: 180.79, change24h: 0.81, poolSize: 88, status: 'Available' },
    { id: 'stk-amzn', ticker: 'AMZN', name: 'Amazon.com, Inc.', Icon: 'AmazonIcon', sector: 'Consumer Discretionary', price: 189.08, change24h: 1.5, poolSize: 90, status: 'Available' },
    { id: 'stk-nvda', ticker: 'NVDA', name: 'NVIDIA Corp.', Icon: 'NvidiaIcon', sector: 'Technology', price: 120.98, change24h: 3.12, poolSize: 98, status: 'Available' },
    { id: 'stk-tsla', ticker: 'TSLA', name: 'Tesla, Inc.', Icon: 'TeslaIcon', sector: 'Consumer Discretionary', price: 230.15, change24h: -2.2, poolSize: 85, status: 'Available' },
    { id: 'stk-meta', ticker: 'META', name: 'Meta Platforms', Icon: 'MetaIcon', sector: 'Communication Services', price: 505.42, change24h: 2.1, poolSize: 82, status: 'Available' },
    { id: 'stk-jpm', ticker: 'JPM', name: 'JPMorgan Chase', Icon: 'JpmorganIcon', sector: 'Financials', price: 198.55, change24h: 0.4, poolSize: 70, status: 'Available' },
    { id: 'stk-v', ticker: 'V', name: 'Visa Inc.', Icon: 'VisaIcon', sector: 'Financials', price: 275.30, change24h: -0.1, poolSize: 75, status: 'Fully Staked' },
    { id: 'stk-amd', ticker: 'AMD', name: 'Advanced Micro', Icon: 'AmdIcon', sector: 'Technology', price: 160.25, change24h: 4.5, poolSize: 68, status: 'Available' },
    { id: 'stk-nflx', ticker: 'NFLX', name: 'Netflix, Inc.', Icon: 'NetflixIcon', sector: 'Communication Services', price: 686.12, change24h: 1.8, poolSize: 65, status: 'Available' },
    { id: 'stk-xom', ticker: 'XOM', name: 'Exxon Mobil', Icon: 'XomIcon', sector: 'Energy', price: 114.15, change24h: 0.9, poolSize: 50, status: 'Available' },
    { id: 'stk-jnj', ticker: 'JNJ', name: 'Johnson & Johnson', Icon: 'JnjIcon', sector: 'Healthcare', price: 148.88, change24h: -0.3, poolSize: 60, status: 'Available' },
    { id: 'stk-pg', ticker: 'PG', name: 'Procter & Gamble', Icon: 'PgIcon', sector: 'Consumer Discretionary', price: 168.25, change24h: 0.15, poolSize: 55, status: 'Available' },
    { id: 'stk-unh', ticker: 'UNH', name: 'UnitedHealth Group', Icon: 'UnhIcon', sector: 'Healthcare', price: 490.50, change24h: -1.1, poolSize: 62, status: 'Available' },
    { id: 'stk-hd', ticker: 'HD', name: 'Home Depot', Icon: 'HdIcon', sector: 'Consumer Discretionary', price: 352.80, change24h: 0.7, poolSize: 48, status: 'Available' },
    { id: 'stk-ma', ticker: 'MA', name: 'Mastercard Inc.', Icon: 'MaIcon', sector: 'Financials', price: 457.01, change24h: 0.2, poolSize: 73, status: 'Available' },
    { id: 'stk-bac', ticker: 'BAC', name: 'Bank of America', Icon: 'BacIcon', sector: 'Financials', price: 39.55, change24h: -0.8, poolSize: 45, status: 'Available' },
    { id: 'stk-cost', ticker: 'COST', name: 'Costco Wholesale', Icon: 'CostIcon', sector: 'Consumer Discretionary', price: 848.31, change24h: 1.9, poolSize: 66, status: 'Available' },
    { id: 'stk-cvx', ticker: 'CVX', name: 'Chevron Corp.', Icon: 'CvxIcon', sector: 'Energy', price: 158.75, change24h: 1.3, poolSize: 49, status: 'Available' },
    { id: 'stk-lly', ticker: 'LLY', name: 'Eli Lilly & Co.', Icon: 'LlyIcon', sector: 'Healthcare', price: 890.11, change24h: 2.5, poolSize: 78, status: 'Available' },
    { id: 'stk-avgo', ticker: 'AVGO', name: 'Broadcom Inc.', Icon: 'AvgoIcon', sector: 'Technology', price: 1592.21, change24h: 5.1, poolSize: 84, status: 'Fully Staked' },
    { id: 'stk-pep', ticker: 'PEP', name: 'PepsiCo, Inc.', Icon: 'PepIcon', sector: 'Consumer Discretionary', price: 168.00, change24h: -0.2, poolSize: 40, status: 'Available' },
    { id: 'stk-ko', ticker: 'KO', name: 'Coca-Cola Co.', Icon: 'KoIcon', sector: 'Consumer Discretionary', price: 62.77, change24h: 0.5, poolSize: 42, status: 'Available' },
    { id: 'stk-wmt', ticker: 'WMT', name: 'Walmart Inc.', Icon: 'WmtIcon', sector: 'Consumer Discretionary', price: 68.90, change24h: 0.3, poolSize: 38, status: 'Available' },
    { id: 'stk-crm', ticker: 'CRM', name: 'Salesforce, Inc.', Icon: 'CrmIcon', sector: 'Technology', price: 245.00, change24h: -1.5, poolSize: 58, status: 'Available' },
    { id: 'stk-dis', ticker: 'DIS', name: 'Walt Disney Co.', Icon: 'DisIcon', sector: 'Communication Services', price: 102.50, change24h: 1.1, poolSize: 53, status: 'Available' },
    { id: 'stk-ba', ticker: 'BA', name: 'Boeing Co.', Icon: 'BaIcon', sector: 'Industrials', price: 179.10, change24h: 2.2, poolSize: 35, status: 'Available' },
];

// --- REIT & NFT DATA --- (from components/reit-data.ts)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const propertyNames = ["Palm Grove Heights", "Azure Bay Residences", "Starlight Towers", "Willow Creek Estates", "Sapphire Skyscraper", "Golden Gate Lofts", "Emerald Valley Plaza", "Crimson Court", "Quantum Quarters", "Celestial Condos", "Vertex Villas", "Pioneer Place", "Summit House", "Liberty Lofts", "Heritage Homes", "Oasis Apartments", "Phoenix Plaza", "Meridian Mansions", "Titanium Terrace", "Silverstone Suites", "Evergreen Apartments", "Coral Point Commercial", "Solstice Square", "Dynasty Dwellings"];
const locations = [{ city: "Miami", state: "FL", country: "USA" }, { city: "Los Angeles", state: "CA", country: "USA" }, { city: "New York", state: "NY", country: "USA" }, { city: "London", state: "", country: "UK" }, { city: "Tokyo", state: "", country: "Japan" }, { city: "Dubai", state: "", country: "UAE" }, { city: "Austin", state: "TX", country: "USA" }, { city: "Paris", state: "", country: "France" }, { city: "Sydney", state: "", country: "Australia" }, { city: "Singapore", state: "", country: "Singapore" }, { city: "Toronto", state: "ON", country: "Canada" }, { city: "Berlin", state: "", country: "Germany" }, { city: "Chicago", state: "IL", country: "USA" }, { city: "San Francisco", state: "CA", country: "USA" }, { city: "Hong Kong", state: "", country: "China" }];
export const mockReitProperties = propertyNames.map((name, index) => {
    const totalShares = getRandomInt(100, 500);
    const sharesSold = getRandomInt(0, totalShares);
    const location = locations[index % locations.length];
    return { id: `reit-${index + 1}`, name: name, address: `${location.city}, ${location.state ? location.state + ', ' : ''}${location.country}`, imageUrl: `https://picsum.photos/seed/reit${index + 1}/600/400`, description: `A premier property in ${location.city}.`, investmentRange: { min: 2000, max: 250000 }, monthlyROI: parseFloat((Math.random() * (2.5 - 0.8) + 0.8).toFixed(2)), totalShares: totalShares, sharesSold: sharesSold, status: sharesSold >= totalShares ? 'Fully Funded' : 'Open for Shares' };
});
const nftTitles = ["CryptoPunk #3100", "Bored Ape #8817", "Azuki #9605", "Meebit #17522", "CloneX #4594", "Moonbird #2642", "Doodle #6914", "Cool Cat #3330", "World of Women #5672", "Pudgy Penguin #6873", "Art Blocks: Fidenza #724", "Mutant Ape #1029", "VeeFriend #GratefulGoat", "Deadfellaz #1046", "CyberKongz #201", "Gutter Cat #2821", "Toadz #6146", "Nouns #87", "Chromie Squiggle #7583", "Autoglyph #484"];
const collections = ["CryptoPunks", "Bored Ape Yacht Club", "Azuki", "Meebits", "CloneX", "Moonbirds", "Doodles", "Cool Cats", "World of Women", "Pudgy Penguins", "Art Blocks", "Mutant Ape Yacht Club", "VeeFriends", "Deadfellaz", "CyberKongz", "Gutter Cat Gang", "CrypToadz", "Nouns", "Art Blocks", "Art Blocks"];
export const investableNFTs = nftTitles.map((title, index) => {
    const floorPrice = getRandomInt(50000, 1500000);
    const totalShares = Math.floor(floorPrice / 100);
    const sharesAvailable = getRandomInt(Math.floor(totalShares * 0.1), Math.floor(totalShares * 0.8));
    const apyAnnual = parseFloat((Math.random() * (35 - 10) + 10).toFixed(2));
    return { id: `inft-${index + 1}`, title: title, collection: collections[index % collections.length], imageUrl: `https://picsum.photos/seed/inft${index + 1}/400`, floorPrice: floorPrice, totalShares: totalShares, sharesAvailable: sharesAvailable, investors: getRandomInt(10, 500), apyAnnual: apyAnnual, apyMonthly: parseFloat((apyAnnual / 12).toFixed(2)), adminBtcAddress: `bc1q${(Math.random() + 1).toString(36).substring(2)}inft${index + 1}valifi` };
});