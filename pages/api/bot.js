const KingdomCore = require('../../lib/core/KingdomCore');
const BankingBot = require('../../bots/banking-bot/BankingBot');
const CoinMixerBot = require('../../bots/coin-mixer-bot/CoinMixerBot');
const MetalsBot = require('../../bots/metals-bot/MetalsBot');
const MailBot = require('../../bots/mail-bot/MailBot');
const TranslationBot = require('../../bots/translation-bot/TranslationBot');
const PortfolioBot = require('../../bots/portfolio-bot/PortfolioBot');
const OnboardingBot = require('../../bots/onboarding-bot/OnboardingBot');
const TradingBot = require('../../bots/trading-bot/TradingBot');
const WalletBot = require('../../bots/wallet-bot/WalletBot');
const StocksBot = require('../../bots/stocks-bot/StocksBot');
const Retirement401kBot = require('../../bots/401k-bot/Retirement401kBot');
const IRABot = require('../../bots/ira-bot/IRABot');
const PensionBot = require('../../bots/pension-bot/PensionBot');
const MutualFundsBot = require('../../bots/mutualfunds-bot/MutualFundsBot');
const BondsBot = require('../../bots/bonds-bot/BondsBot');
const OptionsBot = require('../../bots/options-bot/OptionsBot');
const ForexBot = require('../../bots/forex-bot/ForexBot');
const CommoditiesBot = require('../../bots/commodities-bot/CommoditiesBot');
const ReitBot = require('../../bots/reit-bot/ReitBot');
const MultiChainBot = require('../../bots/multichain-bot/MultiChainBot');
const DeFiBot = require('../../bots/defi-bot/DeFiBot');
const NFTBot = require('../../bots/nft-bot/NFTBot');
const BridgeBot = require('../../bots/bridge-bot/BridgeBot');
const AMMBot = require('../../bots/amm-bot/AMMBot');
const LendingBot = require('../../bots/lending-bot/LendingBot');
const CryptoDerivativesBot = require('../../bots/crypto-derivatives-bot/CryptoDerivativesBot');
const HDWalletBot = require('../../bots/hd-wallet-bot/HDWalletBot');
const MultiSigBot = require('../../bots/multisig-bot/MultiSigBot');
const HardwareWalletBot = require('../../bots/hardware-wallet-bot/HardwareWalletBot');
const Web3Bot = require('../../bots/web3-bot/Web3Bot');
const SeedManagementBot = require('../../bots/seed-management-bot/SeedManagementBot');
const AddressBookBot = require('../../bots/address-book-bot/AddressBookBot');
const TransactionHistoryBot = require('../../bots/transaction-history-bot/TransactionHistoryBot');
const PortfolioAnalyticsBot = require('../../bots/portfolio-analytics-bot/PortfolioAnalyticsBot');
const GasOptimizerBot = require('../../bots/gas-optimizer-bot/GasOptimizerBot');

// Additional new bots
const PrivacyBot = require('../../bots/privacy-bot/PrivacyBot');
const ComplianceBot = require('../../bots/compliance-bot/ComplianceBot');
const EducationBot = require('../../bots/education-bot/EducationBot');

// New modules for communications, advanced trading, liquidity, mining, collectibles and advanced services
const CommunicationBot = require('../../bots/communication-bot/CommunicationBot');
const AdvancedTradingBot = require('../../bots/advanced-trading-bot/AdvancedTradingBot');
const LiquidityBot = require('../../bots/liquidity-bot/LiquidityBot');
const MiningBot = require('../../bots/mining-bot/MiningBot');
const CollectiblesBot = require('../../bots/collectibles-bot/CollectiblesBot');
const AdvancedServicesBot = require('../../bots/advanced-services-bot/AdvancedServicesBot');

// New modules for platform, enterprise, innovative and admin control
const PlatformBot = require('../../bots/platform-bot/PlatformBot');
const EnterpriseBot = require('../../bots/enterprise-bot/EnterpriseBot');
const InnovativeBot = require('../../bots/innovative-bot/InnovativeBot');
const AdminControlBot = require('../../bots/admin-control-bot/AdminControlBot');

// Map bot identifiers to classes.  Additional bots should be added here.
// Simple in-memory rate limiting.  Tracks number of requests per IP per minute.
const RATE_LIMIT = 100; // maximum requests per IP per minute
const rateCounters = {};

const BOT_REGISTRY = {
  banking: BankingBot,
  coin_mixer: CoinMixerBot,
  metals: MetalsBot,
  mail: MailBot,
  translation: TranslationBot,
  portfolio: PortfolioBot,
  onboarding: OnboardingBot,
  trading: TradingBot,
  wallet: WalletBot,
  stocks: StocksBot,
  '401k': Retirement401kBot,
  ira: IRABot,
  pension: PensionBot,
  mutualfunds: MutualFundsBot,
  bonds: BondsBot,
  options: OptionsBot,
  forex: ForexBot,
  commodities: CommoditiesBot,
  reit: ReitBot,
  multichain: MultiChainBot,
  defi: DeFiBot,
  nft: NFTBot,
  bridge: BridgeBot,
  amm: AMMBot,
  lending: LendingBot,
  crypto_derivatives: CryptoDerivativesBot,
  hd_wallet: HDWalletBot,
  multisig: MultiSigBot,
  hardware_wallet: HardwareWalletBot,
  web3: Web3Bot,
  seed_management: SeedManagementBot,
  address_book: AddressBookBot,
  transaction_history: TransactionHistoryBot,
  portfolio_analytics: PortfolioAnalyticsBot,
  gas_optimizer: GasOptimizerBot,
  // New feature bots
  communication: CommunicationBot,
  advanced_trading: AdvancedTradingBot,
  liquidity: LiquidityBot,
  mining: MiningBot,
  collectibles: CollectiblesBot,
  advanced_services: AdvancedServicesBot,
  // Platform and enterprise features
  platform: PlatformBot,
  enterprise: EnterpriseBot,
  innovative: InnovativeBot,
  admin_control: AdminControlBot,
  // Privacy and compliance
  privacy: PrivacyBot,
  compliance: ComplianceBot,
  education: EducationBot,
  // Additional bots such as trading, crypto, investment etc. can be added here.
};

/**
 * Very basic rate limiting middleware.  Rejects requests if they exceed
 * RATE_LIMIT per 60 seconds per IP.  In production use a more robust
 * solution like Redis or a dedicated rate limiter.
 */
function checkRateLimit(req, res) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const now = Date.now();
  const entry = rateCounters[ip] || { count: 0, ts: now };
  // Reset count every minute
  if (now - entry.ts > 60 * 1000) {
    entry.count = 0;
    entry.ts = now;
  }
  entry.count += 1;
  rateCounters[ip] = entry;
  if (entry.count > RATE_LIMIT) {
    res.status(429).json({ success: false, message: 'Too many requests. Please slow down.' });
    return false;
  }
  return true;
}

module.exports = async function handler(req, res) {
  // Rate limiting
  if (!checkRateLimit(req, res)) {
    return;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }
  const { bot, action, ...params } = req.body || {};
  if (!bot || !action) {
    res.status(400).json({ success: false, message: 'Missing bot or action.' });
    return;
  }
  const BotClass = BOT_REGISTRY[bot];
  if (!BotClass) {
    res.status(400).json({ success: false, message: `Unknown bot: ${bot}` });
    return;
  }
  // Create core and bot instance; for demonstration each request gets a fresh instance
  const core = new KingdomCore();
  const botInstance = new BotClass(core);
  await botInstance.initialize();
  await botInstance.integrateWithKingdom();
  try {
    const result = await botInstance.execute({ action, ...params });
    res.status(200).json(result);
  } catch (err) {
    console.error('Bot execution error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};