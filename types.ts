export enum AssetType {
  CRYPTO = 'Crypto',
  STOCK = 'Stock',
  CASH = 'Cash',
  NFT = 'NFT',
  REIT = 'REIT',
}

export type InvestmentStatus = 'Active' | 'Pending' | 'Matured' | 'Withdrawable' | 'Pending Withdrawal' | 'Withdrawn';

export interface InvestmentLog {
  id: string;
  date: string;
  action: 'Buy' | 'Reward' | 'Compound' | 'Withdrawal' | 'Maturity Transfer' | 'Stake Withdrawal Request' | 'Dividend Payout' | 'Sell';
  amount: number; // in USD
  status: 'Completed' | 'Pending';
  referenceId: string;
}

export interface REITProperty {
    id: string;
    name: string;
    address: string;
    imageUrl: string;
    description: string;
    investmentRange: { min: number; max: number };
    monthlyROI: number;
    totalShares: number;
    sharesSold: number;
    status: 'Open for Shares' | 'Fully Funded';
}

export interface StockStakeDetails {
  stakedOn: string;
  monthlyROI: number; // percentage
  nextPayoutDate: string;
}

export interface InvestableNFT {
  id: string;
  title: string;
  collection: string;
  imageUrl: string;
  floorPrice: number;
  totalShares: number; // Total shares for the whole NFT, e.g., if floor is $1M and shares are 10k, each share is $100
  sharesAvailable: number;
  investors: number;
  apyAnnual: number;
  apyMonthly: number;
  adminBtcAddress: string;
}

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  type: AssetType;
  balance: number;
  balanceInEscrow?: number;
  valueUSD: number;
  change24h: number; // percentage change
  allocation: number; // percentage of portfolio
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  maturityDate?: string;
  status?: InvestmentStatus;
  expectedReturn?: number;
  initialInvestment?: number;
  totalEarnings?: number;
  logs?: InvestmentLog[];
  apr?: number;
  payoutDestination?: 'wallet' | 'balance';
  // NFT-specific properties
  collection?: string;
  imageUrl?: string;
  floorPrice?: number; // Floor price of the *entire* NFT
  lastSalePrice?: number;
  rarityRank?: number;
  // NEW Fractional NFT Investment properties
  isFractional?: boolean;
  investableNFTId?: string; // Links to the main InvestableNFT entry
  sharesOwned?: number;
  stakedShares?: number;
  stakeMaturityDate?: string;
  stakeAPY?: number;
  unclaimedRewards?: number;
  // REIT-specific properties
  reitDetails?: {
    propertyId: string;
    sharesOwned: number; // Represents the USD value invested
    monthlyDividend: number;
    lastDividendPayout: string;
  };
  // Stock Staking specific properties
  stockStakeDetails?: StockStakeDetails;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amountUSD: number;
  status: 'Completed' | 'Pending' | 'Failed';
  type: 'Deposit' | 'Withdrawal' | 'Trade' | 'Interest' | 'Sent' | 'Received' | 'Reinvestment' | 'ROI Payout' | 'Maturity' | 'P2P' | 'Loan Repayment';
  txHash?: string;
}

export interface TradeAsset {
    ticker: string;
    name: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    balance: number;
    valueUSD: number;
}


export interface Portfolio {
    totalValueUSD: number;
    change24hValue: number;
    change24hPercent: number;
    assets: Asset[];
    transactions: Transaction[];
    tradeAssets: TradeAsset[];
}

export type ViewType = 'dashboard' | 'investments' | 'wallet' | 'banking' | 'privacy' | 'tax' | 'referrals' | 'exchange' | 'p2p' | 'kyc' | 'internal-transfer' | 'cards' | 'loans' | 'settings' | 'nft' | 'api_guide';

export type AssetCategory = 'All' | AssetType.STOCK | AssetType.CRYPTO | 'REITs' | 'Other' | AssetType.NFT;


export interface NavItem {
    id: ViewType;
    label: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    badge?: number;
    status?: 'good' | 'warning' | 'danger';
}

export interface ReferralNode {
  id: string;
  name: string;
  avatarUrl: string;
  level: number;
  children: ReferralNode[];
}

export interface ReferralActivity {
  id:string;
  date: string;
  description: string;
  earningsUSD: number;
}

export type MixStatus = 'Awaiting Deposit' | 'Confirming' | 'Mixing' | 'Completed' | 'Failed';

export interface MixTransaction {
  id: string;
  date: string;
  asset: {
    ticker: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    network: string;
  };
  amount: number;
  status: MixStatus;
  privacyLevel: number; // 0-100
  complianceMode: boolean;
  depositAddress: string;
  destinationAddress: string;
  confirmations: number;
  requiredConfirmations: number;
  zkProofHash?: string;
}


export interface PaymentMethod {
  id: string;
  methodType: string; // e.g., 'Bank Transfer (ACH)', 'Mobile Money (M-Pesa)', 'Wise'
  nickname: string;
  country: string; // ISO 3166-1 alpha-2 code, e.g., 'US'
  details: Record<string, string | undefined>;
}
export interface TraderBadge {
    id: string;
    label: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    color: string;
}

export interface UserP2PProfile {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number; // out of 5
  totalTrades: number;
  completionRate: number; // percentage
  isVerified: boolean;
  countryCode: string;
  joinDate: string;
  language: string;
  trustScore: number; // 0-100
  badges?: TraderBadge[];
}

export interface TradableAsset {
  ticker: string;
  name: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface P2POffer {
  id: string;
  type: 'BUY' | 'SELL';
  user: UserP2PProfile;
  asset: TradableAsset;
  fiatCurrency: string;
  price: number;
  availableAmount: number;
  minOrder: number;
  maxOrder: number;
  paymentMethods: PaymentMethod[];
  paymentTimeLimitMinutes: number;
  terms?: string;
  availability?: string;
  feeRate?: number;
}

export type P2POrderStatus = 'Pending Payment' | 'Payment Sent' | 'Escrow Released' | 'Completed' | 'Cancelled' | 'Disputed' | 'Under Review' | 'Auto-Cancelled';
export type DisputeStatus = 'Open' | 'Under Review' | 'Resolved';

export interface P2PChatMessage {
    id: string;
    orderId: string;
    authorId: string;
    authorName: string;
    text: string;
    timestamp: string;
    imageUrl?: string;
    isTyping?: boolean;
}

export interface Dispute {
    id: string;
    orderId: string;
    raisedBy: 'buyer' | 'seller';
    reason: string;
    status: DisputeStatus;
    resolution?: string;
    createdAt: string;
    logs: { timestamp: string; message: string }[];
}

export type P2PReview = {
    rating: number; // 1-5
    comment: string;
    fromUserId: string;
    timestamp: string;
}

export interface P2POrder {
    id: string;
    offer: P2POffer;
    buyer: UserP2PProfile;
    seller: UserP2PProfile;
    status: P2POrderStatus;
    createdAt: string;
    expiresAt: string;
    paymentSentAt?: string;
    completedAt?: string;
    fiatAmount: number;
    cryptoAmount: number;
    chatHistory: P2PChatMessage[];
    dispute?: Dispute;
    paymentMethod: PaymentMethod;
    review?: P2PReview;
}

export interface P2PContact {
    userId: string;
    name: string;
    avatarUrl: string;
    isTrusted: boolean;
}

export interface P2PBlacklistEntry {
    userId: string;
    name: string;
    reason: string;
}

export interface ManagedWallet {
  id: string;
  name:string;
  address: string;
  totalValueUSD: number;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface StakableAsset {
  id: string;
  name: string;
  ticker: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  apr: number;
  stakedAmountUSD: number;
  totalStakedInPoolUSD: number;
  minDuration: number;
  maxDuration: number;
  payoutCycle: string;
  minAmount: number;
  maxAmount: number;
  adminWalletAddress: string;
}

export interface StakableStock {
    id: string;
    ticker: string;
    name: string;
    logo: React.FC<React.SVGProps<SVGSVGElement>>;
    sector: 'Technology' | 'Consumer Discretionary' | 'Financials' | 'Energy' | 'Healthcare' | 'Communication Services' | 'Industrials';
    price: number;
    change24h: number;
    poolSize: number; // 0-100 for popularity/allocation bar
    status: 'Available' | 'Fully Staked';
}

export interface InvestmentPlan {
  id: string;
  name: string;
  investmentRange: string;
  dailyReturns: string;
  capitalReturn: string;
  returnType: string;
  totalPeriods: string;
  cancellation: string;
  totalRevenue: string;
  note: string;
  colorClass: string;
  borderColor: string;
  buttonColor: string;
  shadowColor: string;
}

export type MessageAuthor = 'user' | 'ai' | 'other_user';

export interface ChatMessage {
    id: string;
    author: MessageAuthor;
    authorName: string;
    avatarUrl?: string;
    Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    text: string;
    timestamp: string;
    status?: 'Pending';
}

export interface TaxDocument {
  id: string;
  year: number;
  name: string;
  description: string;
}

export type KYCStatus = 'Not Started' | 'Pending' | 'Approved' | 'Rejected' | 'Resubmit Required';

// Types for Valifi Cards feature
export type CardStatus = 'Not Applied' | 'Pending Approval' | 'Approved';
export type CardType = 'Virtual' | 'Physical';
export type CardCurrency = 'USD' | 'GBP' | 'EUR';
export type CardTheme = 'Obsidian' | 'Holographic' | 'Minimal White';

export interface CardDetails {
    status: CardStatus;
    type: CardType;
    currency: CardCurrency;
    theme: CardTheme;
    number?: string;
    expiry?: string;
    cvv?: string;
    isFrozen: boolean;
}

export interface CardApplicationData {
    type: CardType;
    currency: CardCurrency;
    theme: CardTheme;
    address?: string;
}

export interface Country {
  name: string;
  code: string;
  currency?: {
    code: string;
    name: string;
    symbol: string;
  };
}

// Types for Banking feature
export type BankAccountStatus = 'Pending' | 'Verified' | 'Rejected';

export interface BankAccount {
  id: string;
  countryCode: string;
  nickname: string;
  details: Record<string, string>;
  status: BankAccountStatus;
  rejectionReason?: string;
  accountDisplay: string;
}

// Types for Hybrid Wallet
export interface HybridWalletAsset {
  ticker: string;
  name: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  address: string;
  balance: number;
  valueUSD: number;
  type: 'self-custody' | 'custodial';
  networks: string[];
  getNetworkAddress: (network: string) => string;
}

// Types for Loan feature
export type LoanStatus = 'Pending' | 'Approved' | 'Rejected' | 'Repaid' | 'Defaulted' | 'Active' | 'Late';

export interface LoanApplication {
  id: string;
  date: string; // Submission date
  amount: number;
  term: number; // in days
  interestRate: number; // flat percentage
  collateralAssetId: string;
  reason?: string;
  status: LoanStatus;
  rejectionReason?: string;
  // Fields for new tabs
  startDate?: string;
  dueDate?: string;
  repaymentProgress?: number; // 0-100
  finalAmountRepaid?: number;
  interestPaid?: number;
  dateClosed?: string;
}

// Types for Notifications
export type NotificationType = 'investment' | 'loan' | 'kyc' | 'system' | 'admin' | 'security' | 'p2p';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link?: ViewType;
  linkContext?: { orderId: string };
}

export interface UserActivity {
  id: string;
  action: Transaction['type'];
  description: string;
  timestamp: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  link?: string;
  linkText?: string;
}

// Types for Settings
export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  profilePhotoUrl: string;
  kycStatus?: KYCStatus;
  kycRejectionReason?: string;
}

export type TwoFactorAuthMethod = 'none' | 'email' | 'sms' | 'authenticator';

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export type AutoLogoutTime = '30m' | '1h' | '4h' | 'never';

export type Language = 'en' | 'es' | 'ar' | 'he' | 'fr' | 'de' | 'it' | 'ru' | 'hi' | 'zh-CN' | 'zh-TW' | 'pt' | 'tr' | 'sw' | 'ja' | 'ko' | 'nl';

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY';

export interface UserSettings {
  profile: UserProfile;
  settings: {
      twoFactorAuth: {
        enabled: boolean;
        method: TwoFactorAuthMethod;
        secret?: string;
      };
      loginAlerts: boolean;
      autoLogout: AutoLogoutTime;
      preferences: {
        currency: string;
        language: Language;
        dateFormat: DateFormat;
        timezone: string;
        balancePrivacy: boolean;
        sidebarCollapsed?: boolean;
        openNavGroups?: string[];
      };
      privacy: {
        emailMarketing: boolean;
        platformMessages: boolean;
        contactAccess: boolean;
      };
      vaultRecovery: {
        email: string;
        phone: string;
        pin: string;
      };
  },
  sessions?: ActiveSession[];
}


// Types for Co-Pilot
export interface CoPilotSuggestion {
  text: string;
  action: () => void;
}

export interface CoPilotMessage {
  id: string;
  author: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: CoPilotSuggestion[];
  isLoading?: boolean;
}