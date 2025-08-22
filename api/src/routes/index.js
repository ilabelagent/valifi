
import { Router } from 'express';
import { protect, requireKyc } from '../middleware/auth.js';

// --- Import All Controllers ---
import { loginWithRateLimit, register, forgotPassword, socialLogin } from '../controllers/authController.js';
import { getDashboardData } from '../controllers/dashboardController.js';
import { getUserProfile, updateUserSettings } from '../controllers/userController.js';
import { 
    swapAssets, transferMaturity, investSpectrumPlan, stakeCrypto, stakeStock, investReit, 
    investNftFractional, getStakableStocks, getReitProperties, getInvestableNfts, 
    getSpectrumPlans, getStakableCrypto, searchInvestments 
} from '../controllers/investmentController.js';
import { internalTransfer, requestDeposit, requestWithdrawal } from '../controllers/fundsController.js';
import { sendFromWallet, createWallet, importWallet } from '../controllers/walletController.js';
import { getCardDetails, applyForCard, freezeCard } from '../controllers/cardsController.js';
import { getBankAccounts, linkBankAccount, deleteBankAccount } from '../controllers/bankingController.js';
import { getLoans, applyForLoan, repayLoan } from '../controllers/loansController.js';
import { submitKyc } from '../controllers/kycController.js';
import { markAsRead, dismissNotification, markAllRead, clearAllRead } from '../controllers/notificationsController.js';
import { 
    getOffers, getMyOrders, createOrder, updateOrderStatus, postChatMessage, 
    getPaymentMethods, addPaymentMethod, deletePaymentMethod, createOffer
} from '../controllers/p2pController.js';
import { callCoPilot, callTaxAdvisor } from '../controllers/aiController.js';
import { getReferralSummary } from '../controllers/referralsController.js';
import { getAppData } from '../controllers/appController.js';
import { checkDbConnection } from '../controllers/healthController.js';

const router = Router();

// --- Define All API Routes ---

// Health
router.get('/health/db', checkDbConnection);

// App Data
router.get('/app-data', protect, getAppData);

// Dashboard
router.get('/dashboard', protect, getDashboardData);

// Auth
router.post('/auth/login', loginWithRateLimit);
router.post('/auth/register', register);
router.post('/auth/social-login', socialLogin);
router.post('/auth/forgot-password', forgotPassword);

// Users, KYC, and Notifications
router.get('/users/me', protect, getUserProfile);
router.put('/users/me/settings', protect, updateUserSettings);
router.post('/kyc/submit', protect, submitKyc);
router.post('/notifications/:id/read', protect, markAsRead);
router.delete('/notifications/:id', protect, dismissNotification);
router.post('/notifications/read-all', protect, markAllRead);
router.post('/notifications/clear-all', protect, clearAllRead);

// Investments and Referrals
router.get('/investments/stakable-stocks', protect, getStakableStocks);
router.get('/investments/reit-properties', protect, getReitProperties);
router.get('/investments/investable-nfts', protect, getInvestableNfts);
router.get('/investments/spectrum-plans', protect, getSpectrumPlans);
router.get('/investments/stakable-crypto', protect, getStakableCrypto);
router.post('/investments/swap', protect, swapAssets);
router.post('/investments/search', protect, searchInvestments);
router.post('/investments/:id/transfer-maturity', protect, transferMaturity);
router.post('/investments/spectrum-plan', protect, investSpectrumPlan);
router.post('/investments/stake-crypto', protect, stakeCrypto);
router.post('/investments/stake-stock', protect, stakeStock);
router.post('/investments/reit', protect, investReit);
router.post('/investments/nft-fractional', protect, investNftFractional);
router.get('/referrals/summary', protect, getReferralSummary);

// Funds
router.post('/funds/internal-transfer', protect, internalTransfer);
router.post('/funds/deposit-intent', protect, requestDeposit);
router.post('/funds/withdraw-request', protect, requireKyc, requestWithdrawal);


// Wallet
router.post('/wallet/send', protect, sendFromWallet);
router.post('/wallet/create', protect, createWallet);
router.post('/wallet/import', protect, importWallet);

// Cards
router.get('/cards/details', protect, getCardDetails);
router.post('/cards/apply', protect, requireKyc, applyForCard);
router.post('/cards/freeze', protect, freezeCard);

// Banking
router.get('/banking/accounts', protect, getBankAccounts);
router.post('/banking/accounts', protect, linkBankAccount);
router.delete('/banking/accounts/:id', protect, deleteBankAccount);

// Loans
router.get('/loans', protect, getLoans);
router.post('/loans/apply', protect, requireKyc, applyForLoan);
router.post('/loans/:id/repay', protect, repayLoan);

// P2P
router.get('/p2p/offers', protect, getOffers);
router.post('/p2p/offers', protect, requireKyc, createOffer);
router.get('/p2p/my-orders', protect, getMyOrders);
router.post('/p2p/orders', protect, requireKyc, createOrder);
router.put('/p2p/orders/:id/status', protect, updateOrderStatus);
router.post('/p2p/orders/:id/chat', protect, postChatMessage);
router.get('/p2p/payment-methods', protect, getPaymentMethods);
router.post('/p2p/payment-methods', protect, addPaymentMethod);
router.delete('/p2p/payment-methods/:id', protect, deletePaymentMethod);

// AI
router.post('/ai/copilot', protect, callCoPilot);
router.post('/ai/tax-advisor', protect, callTaxAdvisor);


export default router;
