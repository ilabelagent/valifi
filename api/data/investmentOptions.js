// This file contains mock data for investment options, simulating what would be in dedicated database tables.

export const spectrumPlans = [
    {
        id: 'corestart',
        name: 'CoreStart Plan',
        investmentRange: '$500 – $4,999',
        dailyReturns: '2.5%',
        capitalReturn: 'After 10 days',
        returnType: 'Daily',
        totalPeriods: '10 Days',
        cancellation: 'Not Available',
        totalRevenue: '125%',
        note: 'Ideal for beginners.',
        colorClass: 'bg-gradient-to-br from-emerald-700 to-green-800',
        borderColor: 'border-emerald-500',
        buttonColor: 'bg-emerald-700 hover:bg-emerald-800',
        shadowColor: 'shadow-emerald-500/30'
    },
    {
        id: 'alphaplus',
        name: 'AlphaPlus Plan',
        investmentRange: '$5,000 – $49,999',
        dailyReturns: '3.0%',
        capitalReturn: 'After 20 days',
        returnType: 'Daily',
        totalPeriods: '20 Days',
        cancellation: 'After 10 days',
        totalRevenue: '160%',
        note: 'Balanced growth and returns.',
        colorClass: 'bg-gradient-to-br from-sky-800 to-blue-900',
        borderColor: 'border-sky-600',
        buttonColor: 'bg-sky-800 hover:bg-sky-900',
        shadowColor: 'shadow-sky-500/30'
    },
    {
        id: 'poweredge',
        name: 'PowerEdge Plan',
        investmentRange: '$50,000 – $499,999',
        dailyReturns: '3.5%',
        capitalReturn: 'After 30 days',
        returnType: 'Daily',
        totalPeriods: '30 Days',
        cancellation: 'After 15 days',
        totalRevenue: '205%',
        note: 'For serious investors.',
        colorClass: 'bg-gradient-to-br from-amber-800 to-orange-900',
        borderColor: 'border-amber-600',
        buttonColor: 'bg-amber-800 hover:bg-amber-900',
        shadowColor: 'shadow-amber-500/30'
    },
    {
        id: 'quantum',
        name: 'Quantum Leap Plan',
        investmentRange: '$500,000+',
        dailyReturns: '4.5%',
        capitalReturn: 'After 45 days',
        returnType: 'Daily',
        totalPeriods: '45 Days',
        cancellation: 'After 22 days',
        totalRevenue: '302.5%',
        note: 'Maximum yield for top-tier investors.',
        colorClass: 'bg-gradient-to-br from-purple-800 to-indigo-900',
        borderColor: 'border-purple-600',
        buttonColor: 'bg-purple-800 hover:bg-purple-900',
        shadowColor: 'shadow-purple-500/30'
    }
];

export const stakableCrypto = [
  { id: 'btc-stake', name: 'Bitcoin Staking', ticker: 'BTC', Icon: 'BtcIcon', apr: 4.5, minDuration: 30, maxDuration: 365, payoutCycle: 'Monthly', minAmount: 100, maxAmount: 100000, adminWalletAddress: 'bc1q...' },
  { id: 'eth-stake', name: 'Ethereum Staking', ticker: 'ETH', Icon: 'EthIcon', apr: 5.2, minDuration: 30, maxDuration: 365, payoutCycle: 'Monthly', minAmount: 100, maxAmount: 100000, adminWalletAddress: '0x...' },
  { id: 'sol-stake', name: 'Solana Staking', ticker: 'SOL', Icon: 'SolanaIcon', apr: 7.1, minDuration: 14, maxDuration: 365, payoutCycle: 'Weekly', minAmount: 50, maxAmount: 50000, adminWalletAddress: 'So11...' },
  { id: 'ada-stake', name: 'Cardano Staking', ticker: 'ADA', Icon: 'CardanoIcon', apr: 3.5, minDuration: 14, maxDuration: 365, payoutCycle: 'Weekly', minAmount: 50, maxAmount: 50000, adminWalletAddress: 'addr1...' },
];

export const stakableStocks = [
  { id: 'aapl-stake', ticker: 'AAPL', name: 'Apple Inc.', Icon: 'AppleIcon', sector: 'Technology', price: 195.89, change24h: 1.2, poolSize: 95, status: 'Available' },
  { id: 'tsla-stake', ticker: 'TSLA', name: 'Tesla, Inc.', Icon: 'TeslaIcon', sector: 'Consumer Discretionary', price: 250.50, change24h: -2.5, poolSize: 92, status: 'Available' },
  { id: 'nvda-stake', ticker: 'NVDA', name: 'NVIDIA Corporation', Icon: 'NvidiaIcon', sector: 'Technology', price: 450.10, change24h: 3.1, poolSize: 88, status: 'Available' },
  { id: 'amzn-stake', ticker: 'AMZN', name: 'Amazon.com, Inc.', Icon: 'AmazonIcon', sector: 'Consumer Discretionary', price: 135.20, change24h: 0.8, poolSize: 85, status: 'Available' },
  { id: 'googl-stake', ticker: 'GOOGL', name: 'Alphabet Inc.', Icon: 'GoogleIcon', sector: 'Communication Services', price: 130.45, change24h: -0.5, poolSize: 80, status: 'Fully Staked' },
];

export const reitProperties = [
    { id: 'reit-1', name: 'Downtown Plaza', address: 'New York, NY', imageUrl: 'https://images.unsplash.com/photo-1596711923483-68c7453303d8?q=80&w=2874&auto=format&fit=crop', description: '...', investmentRange: { min: 500, max: 50000 }, monthlyROI: 1.2, totalShares: 10000, sharesSold: 7500, status: 'Open for Shares' },
    { id: 'reit-2', name: 'Ocean View Condos', address: 'Miami, FL', imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2940&auto=format&fit=crop', description: '...', investmentRange: { min: 1000, max: 100000 }, monthlyROI: 1.5, totalShares: 20000, sharesSold: 20000, status: 'Fully Funded' },
];

export const investableNFTs = [
    { id: 'inft-1', title: 'CryptoPunk #7804', collection: 'CryptoPunks', imageUrl: 'https://i.seadn.io/gae/48oVuWq32t4s_J2T1iH42T_Kj_Ch2j0Bvj2sI4a0YSHj7C021Y-oO5h4Didsa_p0Q2Yn1_V20Y8m3b22k0s8U_n4DN4?auto=format&w=1000', floorPrice: 16400000, totalShares: 10000, sharesAvailable: 2500, investors: 120, apyAnnual: 25.5, apyMonthly: 2.1, adminBtcAddress: 'bc1q...' },
    { id: 'inft-2', title: 'Bored Ape #8817', collection: 'Bored Ape Yacht Club', imageUrl: 'https://i.seadn.io/gae/gHpHc4S3fRZm9D8b212f45w2VfM-f1Jy0Hq3qXeB5a_a5uIR2pCNOv5iYEr2_gI-42ob4e4pE3352932N-29_Zg1?auto=format&w=1000', floorPrice: 5200000, totalShares: 5000, sharesAvailable: 100, investors: 45, apyAnnual: 18.2, apyMonthly: 1.5, adminBtcAddress: 'bc1q...' },
];
