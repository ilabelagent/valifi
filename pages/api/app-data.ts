import type { NextApiRequest, NextApiResponse } from 'next';

// Mock investment data
const mockInvestmentData = {
  stakableStocks: [
    { ticker: "AAPL", name: "Apple Inc.", price: 178.50, apr: 8.5, minStake: 100, Icon: "AppleIcon" },
    { ticker: "GOOGL", name: "Alphabet Inc.", price: 139.25, apr: 7.8, minStake: 100, Icon: "GoogleIcon" },
    { ticker: "MSFT", name: "Microsoft Corp.", price: 378.85, apr: 8.2, minStake: 100, Icon: "MicrosoftIcon" },
    { ticker: "NVDA", name: "NVIDIA Corp.", price: 495.50, apr: 9.5, minStake: 100, Icon: "NvidiaIcon" },
    { ticker: "TSLA", name: "Tesla Inc.", price: 253.75, apr: 10.2, minStake: 100, Icon: "TeslaIcon" },
    { ticker: "AMZN", name: "Amazon.com Inc.", price: 145.50, apr: 7.5, minStake: 100, Icon: "AmazonIcon" }
  ],
  stakableCrypto: [
    { id: "btc", ticker: "BTC", name: "Bitcoin", apr: 5.5, Icon: "BtcIcon" },
    { id: "eth", ticker: "ETH", name: "Ethereum", apr: 6.8, Icon: "EthIcon" },
    { id: "sol", ticker: "SOL", name: "Solana", apr: 8.2, Icon: "SolanaIcon" },
    { id: "ada", ticker: "ADA", name: "Cardano", apr: 7.5, Icon: "CardanoIcon" },
    { id: "dot", ticker: "DOT", name: "Polkadot", apr: 9.0, Icon: "PolkadotIcon" }
  ],
  reitProperties: [
    {
      id: "reit-1",
      name: "Manhattan Commercial Tower",
      location: "New York, NY",
      type: "Commercial",
      price: 250,
      yield: 7.5,
      occupied: 95,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
    },
    {
      id: "reit-2",
      name: "Silicon Valley Tech Park",
      location: "San Jose, CA",
      type: "Office",
      price: 500,
      yield: 6.8,
      occupied: 98,
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
    }
  ],
  investableNFTs: [
    {
      id: "nft-1",
      name: "Bored Ape #3749",
      collection: "BAYC",
      fractionPrice: 100,
      totalValue: 250000,
      image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800",
      stakingApr: 12.5
    },
    {
      id: "nft-2",
      name: "CryptoPunk #2140",
      collection: "CryptoPunks",
      fractionPrice: 150,
      totalValue: 350000,
      image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800",
      stakingApr: 15.0
    }
  ],
  spectrumPlans: [
    {
      id: "starter",
      name: "Starter",
      investmentRange: "$100 - $999",
      dailyReturns: "0.5%",
      capitalReturn: "After 200 days",
      totalPeriods: "200 days",
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
      totalPeriods: "150 days",
      colorClass: "bg-gradient-to-r from-purple-500 to-purple-600",
      borderColor: "border-purple-500",
      buttonColor: "bg-purple-500 hover:bg-purple-600",
      shadowColor: "shadow-purple-500/20"
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

  // Check for auth token (simplified)
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Return mock app data
  const appData = {
    profile: {
      id: 'demo_user',
      fullName: 'Demo User',
      username: 'demouser',
      email: 'demo@valifi.net',
      profilePhotoUrl: 'https://i.pravatar.cc/150?u=demo',
      kycStatus: 'Not Started'
    },
    settings: {
      twoFactorAuth: { enabled: false, method: 'none' },
      loginAlerts: true,
      autoLogout: '1h',
      preferences: {
        currency: 'USD',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
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
      assets: [
        {
          id: 'cash-1',
          type: 'Cash',
          ticker: 'USD',
          name: 'US Dollar',
          balance: 10000,
          value: 10000,
          change24h: 0,
          changePercent24h: 0,
          Icon: 'UsdIcon'
        }
      ],
      transactions: []
    },
    notifications: [],
    userActivity: [],
    newsItems: [
      {
        id: '1',
        title: 'Welcome to Valifi',
        summary: 'Start your investment journey today',
        url: '#',
        source: 'Valifi',
        publishedAt: new Date().toISOString(),
        sentiment: 'positive'
      }
    ],
    cardDetails: {
      status: 'Not Applied',
      type: 'Virtual',
      currency: 'USD',
      theme: 'Obsidian',
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
    referralSummary: {
      tree: null,
      activities: []
    }
  };

  res.status(200).json({ success: true, data: appData });
}