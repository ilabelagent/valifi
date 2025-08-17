
/*
 * This module defines static seed data used to populate the in-browser DB.
 */
import type { UserSettings, Asset, Transaction, P2POrder, P2POffer, PaymentMethod, StakableStock, REITProperty, InvestableNFT, UserP2PProfile } from '../types';
import { AssetType } from '../types';

// --- USER & PORTFOLIO DATA ---

const initialAssetsData: Asset[] = [
    { id: '1', name: 'Bitcoin', ticker: 'BTC', type: AssetType.CRYPTO, balance: 1.25, valueUSD: 85234.5, change24h: 2.5, status: 'Active', maturityDate: '2025-03-01T00:00:00Z', initialInvestment: 75000, totalEarnings: 10234.5, Icon: 'BtcIcon' as any, logs: [], allocation: 0 },
    { id: '4', name: 'Cash', ticker: 'USD', type: AssetType.CASH, balance: 10406.38, valueUSD: 10406.38, change24h: 0, Icon: 'UsdIcon' as any, logs: [], allocation: 0 },
    { id: '2', name: 'Ethereum Staking', ticker: 'ETH', type: AssetType.CRYPTO, balance: 10.8, valueUSD: 41040.0, change24h: 1.2, status: 'Active', maturityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), initialInvestment: 38000, totalEarnings: 3040.0, Icon: 'EthIcon' as any, apr: 4.5, payoutDestination: 'balance', logs: [], allocation: 0 },
    { id: '3', name: 'Apple Inc. Stake', ticker: 'AAPL', type: AssetType.STOCK, balance: 50, valueUSD: 12050.0, change24h: -0.5, status: 'Active', initialInvestment: 10000, totalEarnings: 2050.0, Icon: 'AppleIcon' as any, stockStakeDetails: { stakedOn: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(), monthlyROI: 12.5, nextPayoutDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(), }, logs: [], allocation: 0 },
];

const initialTransactions: Transaction[] = [
    { id: 't1', date: '2024-07-29T10:30:00Z', description: 'Bought BTC', type: 'Trade', amountUSD: -5000, status: 'Completed', txHash: '0xabc...def' },
    { id: 't2', date: '2024-07-29T09:00:00Z', description: 'ETH Staking Rewards', type: 'ROI Payout', amountUSD: 55.78, status: 'Completed' },
    { id: 't3', date: '2024-07-28T15:45:00Z', description: 'Bank Deposit', type: 'Deposit', amountUSD: 10000, status: 'Completed' },
];

export const seedData = {
    users: [
      {
        id: 'user-1',
        fullName: 'Akudina Code',
        username: 'akudinacode',
        email: 'akudinacode@gmail.com',
        password: 'akudinacode@gmail.com',
        kycStatus: 'Approved',
        settings: {
          twoFactorAuth: { enabled: false, method: 'none' },
          loginAlerts: true,
          autoLogout: '1h',
          preferences: { currency: 'USD', language: 'en', dateFormat: 'MM/DD/YYYY', timezone: 'UTC', theme: 'dark', balancePrivacy: false },
          privacy: { emailMarketing: false, platformMessages: false, contactAccess: false },
          vaultRecovery: { email: '', phone: '', pin: '' }
        },
        profile: {
            id: 'user-1',
            fullName: 'Akudina Code',
            username: 'akudinacode',
            profilePhotoUrl: 'https://i.pravatar.cc/40?u=akudinacode'
        },
        portfolio: {
            assets: initialAssetsData,
            transactions: initialTransactions,
        },
      },
    ],
};


// --- PLATFORM-WIDE MOCK DATA ---
export const initialNewsItems = [
  { id: 'news1', title: 'New Card Tier Now Live', content: 'Introducing the Obsidian Black card with enhanced rewards and cashback offers. Apply now in the Cards section.', timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), },
  { id: 'news2', title: 'Market Update: BTC Surges', content: 'Bitcoin has reached a new 30-day high. Our AI predicts continued volatility. Trade with caution.', timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), },
];

export const p2pTraderBadges: any[] = [
    { id: 'badge1', label: 'Valued Pro Trader', Icon: 'UserCheckIcon', color: 'text-primary' },
    { id: 'badge2', label: 'High Volume', Icon: 'TrendingUpIcon', color: 'text-emerald-400' },
    { id: 'badge3', label: 'Trusted by Community', Icon: 'ShieldCheckIcon', color: 'text-amber-400' },
];

export const p2pUsers: { [key: string]: any } = {
    'p2p1': { id: 'p2p1', name: 'CryptoKing', avatarUrl: 'https://i.pravatar.cc/40?u=p2p1', rating: 4.9, totalTrades: 1254, completionRate: 99.8, isVerified: true, countryCode: 'US', joinDate: '2022-01-15T00:00:00Z', language: 'English', trustScore: 98, badges: [p2pTraderBadges[0], p2pTraderBadges[2]] },
    'p2p2': { id: 'p2p2', name: 'NaijaTrader', avatarUrl: 'https://i.pravatar.cc/40?u=p2p2', rating: 4.8, totalTrades: 890, completionRate: 97.5, isVerified: true, countryCode: 'NG', joinDate: '2022-05-20T00:00:00Z', language: 'English', trustScore: 92, badges: [p2pTraderBadges[1]] },
};

export const p2pTradableAssets: { [key: string]: any } = { 'BTC': { ticker: 'BTC', name: 'Bitcoin', Icon: 'BtcIcon' }, 'ETH': { ticker: 'ETH', name: 'Ethereum', Icon: 'EthIcon' }, 'USDT': { ticker: 'USDT', name: 'Tether', Icon: 'UsdtIcon' }, };

export const p2pPaymentMethods: { [key: string]: PaymentMethod } = {
    ach: { id: 'pm1', methodType: 'Bank Transfer (ACH)', nickname: 'My US Bank', country: 'US', details: { accountHolderName: 'CryptoKing', accountNumber: '...1234', routingNumber: '...0025' } },
    ng_bank: { id: 'pm3', methodType: 'Bank Transfer', nickname: 'GTBank', country: 'NG', details: { accountNumber: '...5678', bankName: 'GTBank' } },
};
export const p2pUserPaymentMethods: PaymentMethod[] = [p2pPaymentMethods.ach];

export const p2pOffers: any[] = [
    { id: 'offer1', type: 'SELL' as const, user: p2pUsers.p2p1, asset: p2pTradableAssets.BTC, fiatCurrency: 'USD', price: 68500.50, availableAmount: 0.5, minOrder: 500, maxOrder: 10000, paymentMethods: [p2pPaymentMethods.ach], paymentTimeLimitMinutes: 15, terms: 'Experienced traders only.' },
    { id: 'offer2', type: 'SELL' as const, user: p2pUsers.p2p2, asset: p2pTradableAssets.USDT, fiatCurrency: 'NGN', price: 1485.20, availableAmount: 2000, minOrder: 100000, maxOrder: 1000000, paymentMethods: [p2pPaymentMethods.ng_bank], paymentTimeLimitMinutes: 30 },
];

export const p2pOrders: any[] = [
    { id: 'ord1', offer: p2pOffers[0], buyer: seedData.users[0].profile, seller: p2pUsers.p2p1, status: 'Payment Sent' as const, createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), paymentSentAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), fiatAmount: 1000, cryptoAmount: 1000 / p2pOffers[0].price, chatHistory: [], paymentMethod: p2pPaymentMethods.ach },
];

export const stakableStocks: StakableStock[] = [
    { id: 'stk-aapl', ticker: 'AAPL', name: 'Apple Inc.', logo: 'AppleIcon' as any, sector: 'Technology', price: 214.29, change24h: 1.25, poolSize: 95, status: 'Available' },
    { id: 'stk-nvda', ticker: 'NVDA', name: 'NVIDIA Corp.', logo: 'NvidiaIcon' as any, sector: 'Technology', price: 120.98, change24h: 3.12, poolSize: 98, status: 'Available' },
];

function getRandomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export const mockReitProperties: REITProperty[] = ["Palm Grove Heights", "Azure Bay Residences"].map((name, index) => {
    const totalShares = getRandomInt(100, 500); const sharesSold = getRandomInt(0, totalShares);
    return { id: `reit-${index + 1}`, name: name, address: `Miami, FL, USA`, imageUrl: `https://picsum.photos/seed/reit${index + 1}/600/400`, description: `A premier property.`, investmentRange: { min: 2000, max: 250000 }, monthlyROI: 1.5, totalShares: totalShares, sharesSold: sharesSold, status: sharesSold >= totalShares ? 'Fully Funded' : 'Open for Shares' };
});

export const investableNFTs: InvestableNFT[] = ["CryptoPunk #3100", "Bored Ape #8817"].map((title, index) => {
    const floorPrice = getRandomInt(50000, 1500000); const totalShares = Math.floor(floorPrice / 100);
    return { id: `inft-${index + 1}`, title: title, collection: "Top Collections", imageUrl: `https://picsum.photos/seed/inft${index + 1}/400`, floorPrice: floorPrice, totalShares: totalShares, sharesAvailable: 100, investors: 50, apyAnnual: 15.5, apyMonthly: 1.3, adminBtcAddress: `bc1qfakeaddress${index}` };
});
