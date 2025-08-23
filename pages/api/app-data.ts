import type { NextApiRequest, NextApiResponse } from 'next';

// Mock investment data with complete fields
const mockInvestmentData = {
  stakableStocks: [
    { 
      id: "stock-1",
      ticker: "AAPL", 
      name: "Apple Inc.", 
      price: 178.50, 
      change24h: 2.5,
      poolSize: 85,
      sector: "Technology" as const,
      status: "Available" as const,
      logo: "AppleIcon" 
    },
    { 
      id: "stock-2",
      ticker: "GOOGL", 
      name: "Alphabet Inc.", 
      price: 139.25, 
      change24h: -0.8,
      poolSize: 72,
      sector: "Technology" as const,
      status: "Available" as const,
      logo: "GoogleIcon" 
    },
    { 
      id: "stock-3",
      ticker: "MSFT", 
      name: "Microsoft Corp.", 
      price: 378.85, 
      change24h: 1.2,
      poolSize: 90,
      sector: "Technology" as const,
      status: "Available" as const,
      logo: "MicrosoftIcon" 
    },
    { 
      id: "stock-4",
      ticker: "NVDA", 
      name: "NVIDIA Corp.", 
      price: 495.50, 
      change24h: 3.8,
      poolSize: 95,
      sector: "Technology" as const,
      status: "Available" as const,
      logo: "NvidiaIcon" 
    },
    { 
      id: "stock-5",
      ticker: "TSLA", 
      name: "Tesla Inc.", 
      price: 253.75, 
      change24h: -1.5,
      poolSize: 78,
      sector: "Consumer Discretionary" as const,
      status: "Available" as const,
      logo: "TeslaIcon" 
    },
    { 
      id: "stock-6",
      ticker: "AMZN", 
      name: "Amazon.com Inc.", 
      price: 145.50, 
      change24h: 0.5,
      poolSize: 88,
      sector: "Consumer Discretionary" as const,
      status: "Available" as const,
      logo: "AmazonIcon" 
    },
    {
      id: "stock-7",
      ticker: "JPM",
      name: "JPMorgan Chase",
      price: 152.30,
      change24h: 0.8,
      poolSize: 65,
      sector: "Financials" as const,
      status: "Available" as const,
      logo: "JpmIcon"
    },
    {
      id: "stock-8",
      ticker: "V",
      name: "Visa Inc.",
      price: 245.60,
      change24h: 1.1,
      poolSize: 70,
      sector: "Financials" as const,
      status: "Available" as const,
      logo: "VisaIcon"
    }
  ],
  stakableCrypto: [
    { 
      id: "btc", 
      ticker: "BTC", 
      name: "Bitcoin", 
      apr: 5.5, 
      minDuration: 30,
      maxDuration: 365,
      payoutCycle: "Monthly",
      minAmount: 0.001,
      maxAmount: 100,
      adminWalletAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      Icon: "BtcIcon" 
    },
    { 
      id: "eth", 
      ticker: "ETH", 
      name: "Ethereum", 
      apr: 6.8, 
      minDuration: 30,
      maxDuration: 365,
      payoutCycle: "Monthly",
      minAmount: 0.01,
      maxAmount: 1000,
      adminWalletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
      Icon: "EthIcon" 
    },
    { 
      id: "sol", 
      ticker: "SOL", 
      name: "Solana", 
      apr: 8.2, 
      minDuration: 30,
      maxDuration: 365,
      payoutCycle: "Monthly",
      minAmount: 0.1,
      maxAmount: 10000,
      adminWalletAddress: "7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs",
      Icon: "SolanaIcon" 
    }
  ],
  reitProperties: [
    {
      id: "reit-1",
      name: "Manhattan Commercial Tower",
      address: "350 5th Avenue, New York, NY 10118",
      imageUrl: "/placeholder-property.svg",
      description: "Prime commercial real estate in the heart of Manhattan",
      investmentRange: { min: 250, max: 100000 },
      monthlyROI: 0.625,
      totalShares: 10000,
      sharesSold: 9500,
      status: "Open for Shares" as const
    },
    {
      id: "reit-2",
      name: "Silicon Valley Tech Park",
      address: "1 Infinite Loop, Cupertino, CA 95014",
      imageUrl: "/placeholder-property.svg",
      description: "Modern tech campus in the heart of Silicon Valley",
      investmentRange: { min: 500, max: 250000 },
      monthlyROI: 0.567,
      totalShares: 20000,
      sharesSold: 20000,
      status: "Fully Funded" as const
    }
  ],
  investableNFTs: [
    {
      id: "nft-1",
      title: "Bored Ape #3749",
      collection: "BAYC",
      imageUrl: "/placeholder-property.svg",
      floorPrice: 250000,
      totalShares: 1000,
      sharesAvailable: 250,
      investors: 750,
      apyAnnual: 12.5,
      apyMonthly: 1.04,
      adminBtcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    {
      id: "nft-2",
      title: "CryptoPunk #2140",
      collection: "CryptoPunks",
      imageUrl: "/placeholder-property.svg",
      floorPrice: 350000,
      totalShares: 1000,
      sharesAvailable: 100,
      investors: 900,
      apyAnnual: 15.0,
      apyMonthly: 1.25,
      adminBtcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    }
  ],
  spectrumPlans: [
    {
      id: "starter",
      name: "Starter",
      investmentRange: "$100 - $999",
      dailyReturns: "0.5%",
      capitalReturn: "After 200 days",
      returnType: "Daily",
      totalPeriods: "200 days",
      cancellation: "Not Available",
      totalRevenue: "100% + Capital",
      note: "Perfect for beginners",
      colorClass: "bg-gradient-to-r from-blue-500 to-blue-600",
      borderColor: "border-blue-500",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      shadowColor: "shadow-blue-500/20"
    },
    {
      id: "growth",
      name: "Growth",
      investmentRange: "$1,000 - $4,999",
      dailyReturns: "0.8%",
      capitalReturn: "After 150 days",
      returnType: "Daily",
      totalPeriods: "150 days",
      cancellation: "After 30 days",
      totalRevenue: "120% + Capital",
      note: "Accelerated returns",
      colorClass: "bg-gradient-to-r from-purple-500 to-purple-600",
      borderColor: "border-purple-500",
      buttonColor: "bg-purple-500 hover:bg-purple-600",
      shadowColor: "shadow-purple-500/20"
    },
    {
      id: "premium",
      name: "Premium",
      investmentRange: "$5,000 - $19,999",
      dailyReturns: "1.2%",
      capitalReturn: "After 100 days",
      returnType: "Daily",
      totalPeriods: "100 days",
      cancellation: "After 15 days",
      totalRevenue: "120% + Capital",
      note: "Maximum efficiency",
      colorClass: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      borderColor: "border-yellow-500",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
      shadowColor: "shadow-yellow-500/20"
    }
  ]
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Check for auth token (simplified - accepts any token for demo)
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Return mock app data with complete structure
  const appData = {
    profile: {
      id: 'demo_user',
      fullName: 'Demo User',
      username: 'demouser',
      email: 'demo@valifi.net',
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=demo',
      kycStatus: 'Not Started' as const
    },
    settings: {
      twoFactorAuth: { enabled: false, method: 'none' as const },
      loginAlerts: true,
      autoLogout: '1h' as const,
      preferences: {
        currency: 'USD',
        language: 'en' as const,
        dateFormat: 'MM/DD/YYYY' as const,
        timezone: 'UTC',
        balancePrivacy: false,
        sidebarCollapsed: false,
        openNavGroups: ['overview', 'trading', 'money', 'growth', 'compliance']
      },
      privacy: {
        emailMarketing: false,
        platformMessages: true,
        contactAccess: false
      },
      vaultRecovery: {
        email: '',
        phone: '',
        pin: ''
      }
    },
    sessions: [],
    portfolio: {
      totalValue: 10000,
      totalProfit: 0,
      dailyChange: 0,
      weeklyChange: 0,
      change24hValue: 0,
      change24hPercent: 0,
      assets: [
        {
          id: 'cash-1',
          type: 'Cash' as const,
          ticker: 'USD',
          name: 'US Dollar',
          balance: 10000,
          valueUSD: 10000,
          change24h: 0,
          allocation: 100,
          Icon: 'UsdIcon'
        }
      ],
      transactions: [],
      tradeAssets: []
    },
    notifications: [],
    userActivity: [],
    newsItems: [
      {
        id: '1',
        title: 'Welcome to Valifi',
        content: 'Start your investment journey today with our comprehensive platform',
        timestamp: new Date().toISOString(),
        link: '/dashboard',
        linkText: 'Get Started'
      }
    ],
    cardDetails: {
      status: 'Not Applied' as const,
      type: 'Virtual' as const,
      currency: 'USD' as const,
      theme: 'Obsidian' as const,
      isFrozen: false
    },
    linkedBankAccounts: [],
    loanApplications: [],
    p2pOffers: [],
    p2pOrders: [],
    userPaymentMethods: [],
    reitProperties: mockInvestmentData.reitProperties,
    stakableStocks: mockInvestmentData.stakableStocks,
    investableNFTs: mockInvestmentData.investableNFTs,
    spectrumPlans: mockInvestmentData.spectrumPlans,
    stakableCrypto: mockInvestmentData.stakableCrypto,
    userStakedStocks: [],
    cashBalance: 10000,
    referralSummary: {
      tree: null,
      activities: []
    }
  };

  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  res.status(200).json({ success: true, data: appData });
}