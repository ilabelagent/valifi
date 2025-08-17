import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout';
import DepositModal from './components/DepositModal';
import WithdrawModal from './components/WithdrawModal';
import InvestmentDetailModal from './components/InvestmentDetailModal';
import type { ViewType, Portfolio, Asset, KYCStatus, CardDetails, CardApplicationData, P2POffer, P2POrder, UserSettings, Language, Notification, UserActivity, NewsItem, PaymentMethod, UserP2PProfile, REITProperty, StakableAsset, InvestableNFT, StakableStock, BankAccount, LoanApplication, InvestmentPlan, ReferralNode, ReferralActivity } from './types';
import { AssetType } from './types';
import { 
    BtcIcon, EthIcon, UsdIcon, AppleIcon, SolanaIcon, CardanoIcon, PolkadotIcon, ChainlinkIcon, AvalancheIcon, NvidiaIcon, GoogleIcon, AmazonIcon, TeslaIcon, 
    DownloadIcon, ArrowUpRightIcon, SwapIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon, LoanIcon, InvestmentsIcon, UserCheckIcon, NewspaperIcon, 
    CardIcon, RefreshIcon, ArrowDownIcon, NftIcon, HomeIcon, BnbIcon, MaticIcon, UsdtIcon, MicrosoftIcon, MetaIcon, AmdIcon, JpmorganIcon, VisaIcon, 
    NetflixIcon, XomIcon, JnjIcon, PgIcon, UnhIcon, HdIcon, MaIcon, BacIcon, CostIcon, CvxIcon, LlyIcon, AvgoIcon, PepIcon, KoIcon, WmtIcon, CrmIcon, DisIcon, BaIcon,
    ShieldCheckIcon
} from './components/icons';
import { CurrencyProvider } from './components/CurrencyContext';
import LandingPage from './components/LandingPage';
import * as apiService from './services/api';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load view components for code-splitting
const DetailViewModal = React.lazy(() => import('./components/DetailViewModal'));
const InvestmentsView = React.lazy(() => import('./components/InvestmentsView'));
const ReferralsView = React.lazy(() => import('./components/ReferralsView'));
const PrivacyView = React.lazy(() => import('./components/PrivacyView'));
const ExchangeView = React.lazy(() => import('./components/ExchangeView'));
const P2PExchangeView = React.lazy(() => import('./components/P2PExchangeView'));
const WalletView = React.lazy(() => import('./components/WalletView'));
const TaxView = React.lazy(() => import('./components/TaxView'));
const KYCView = React.lazy(() => import('./components/KYCView'));
const InternalTransfer = React.lazy(() => import('./components/InternalTransfer'));
const CardsView = React.lazy(() => import('./components/CardsView'));
const BankingView = React.lazy(() => import('./components/BankingView'));
const LoansView = React.lazy(() => import('./components/LoansView'));
const SettingsView = React.lazy(() => import('./components/SettingsView'));
const NFTView = React.lazy(() => import('./components/NFTView'));
const APIGuideView = React.lazy(() => import('./components/APIGuideView'));


const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    BtcIcon, EthIcon, UsdIcon, AppleIcon, SolanaIcon, CardanoIcon, PolkadotIcon, ChainlinkIcon, AvalancheIcon, NvidiaIcon, GoogleIcon, AmazonIcon, TeslaIcon, DownloadIcon, ArrowUpRightIcon, SwapIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon, LoanIcon, InvestmentsIcon, UserCheckIcon, NewspaperIcon, CardIcon, RefreshIcon, ArrowDownIcon, NftIcon, HomeIcon, BnbIcon, MaticIcon, UsdtIcon,
    MicrosoftIcon, MetaIcon, AmdIcon, JpmorganIcon, VisaIcon, NetflixIcon, XomIcon, JnjIcon, PgIcon, UnhIcon, HdIcon, MaIcon, BacIcon, CostIcon, CvxIcon, LlyIcon, AvgoIcon, PepIcon, KoIcon, WmtIcon, CrmIcon, DisIcon, BaIcon,
    ShieldCheckIcon
};

const processAssets = (assets: any[]): Asset[] => {
    return assets.map(asset => ({
        ...asset,
        Icon: iconMap[asset.Icon as string] || UsdIcon
    }));
};

const processUserActivity = (activity: any[]): UserActivity[] => {
    return activity.map(item => ({
        ...item,
        icon: iconMap[item.icon as string] || ClockIcon
    }));
};

const processUserP2PProfile = (profile: any): UserP2PProfile => ({
    ...profile,
    badges: profile.badges?.map((badge: any) => ({
        ...badge,
        Icon: iconMap[badge.Icon as string] || ShieldCheckIcon
    })) || []
});

const processP2POffers = (offers: any[]): P2POffer[] => {
    return offers.map(offer => ({
        ...offer,
        user: processUserP2PProfile(offer.user),
        asset: {
            ...offer.asset,
            Icon: iconMap[offer.asset.Icon as string] || UsdIcon
        }
    }));
};

const processP2POrders = (orders: any[]): P2POrder[] => {
    return orders.map(order => ({
        ...order,
        offer: {
            ...order.offer,
            user: processUserP2PProfile(order.offer.user),
            asset: {
                ...order.offer.asset,
                Icon: iconMap[order.offer.asset.Icon as string] || UsdIcon
            }
        },
        buyer: processUserP2PProfile(order.buyer),
        seller: processUserP2PProfile(order.seller)
    }));
};

const processStakableStocks = (stocks: any[]): StakableStock[] => {
    return stocks.map(stock => ({
        ...stock,
        logo: iconMap[stock.Icon as string] || UsdIcon
    }));
};

const processStakableAssets = (assets: any[]): StakableAsset[] => {
    return assets.map(asset => ({
        ...asset,
        Icon: iconMap[asset.Icon as string] || UsdIcon
    }));
};

const AppContent: React.FC = () => {
    const { i18n } = useTranslation();
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
    const [currentView, _setCurrentView] = useState<ViewType>('dashboard');
    const [isDepositModalOpen, setDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [isInvestmentDetailModalOpen, setInvestmentDetailModalOpen] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState<Asset | null>(null);
    
    // Production Data States
    const [cardDetails, setCardDetails] = useState<CardDetails>({ status: 'Not Applied', type: 'Virtual', currency: 'USD', theme: 'Obsidian', isFrozen: false });
    const [linkedBankAccounts, setLinkedBankAccounts] = useState<BankAccount[]>([]);
    const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
    const [p2pOffers, setP2POffers] = useState<P2POffer[]>([]);
    const [p2pOrders, setP2POrders] = useState<P2POrder[]>([]);
    const [userPaymentMethods, setUserPaymentMethods] = useState<PaymentMethod[]>([]);
    const [reitProperties, setReitProperties] = useState<REITProperty[]>([]);
    const [investableNFTs, setInvestableNFTs] = useState<InvestableNFT[]>([]);
    const [stakableStocks, setStakableStocks] = useState<StakableStock[]>([]);
    const [stakableCrypto, setStakableCrypto] = useState<StakableAsset[]>([]);
    const [spectrumPlans, setSpectrumPlans] = useState<InvestmentPlan[]>([]);
    const [referralSummary, setReferralSummary] = useState<{ tree: ReferralNode | null; activities: ReferralActivity[] }>({ tree: null, activities: [] });

    const [isLiveUpdating, setIsLiveUpdating] = useState(true);
    const [isWalletConnectOpen, setIsWalletConnectOpen] = useState(false);
    const [isWalletConnectQRModalOpen, setWalletConnectQRModalOpen] = useState(false);
    const [isImportSeedPhraseModalOpen, setImportSeedPhraseModalOpen] = useState(false);
    const [importSource, setImportSource] = useState('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [exchangeDefaultAssetTicker, setExchangeDefaultAssetTicker] = useState<string | undefined>(undefined);

    const setCurrentView = (view: ViewType) => { window.scrollTo(0, 0); _setCurrentView(view); };
    
    const loadAppData = useCallback(async (token: string) => {
        setIsLoading(true);
        try {
            const userData = await apiService.getUserProfile(token);
            if (!userData) throw new Error("No user data found");
            const { profile, settings, portfolio: p, notifications: n, userActivity: ua, newsItems: ni, sessions } = userData;
            
            setUser({ ...profile, token });
            setUserSettings({ profile, settings, sessions: sessions || [] });
            setPortfolio({ ...p, assets: processAssets(p.assets) });
            setNotifications(n);
            setUserActivity(processUserActivity(ua));
            setNewsItems(ni);

            const [
                cards, banks, loans, offers, orders, payments, 
                reits, stocks, nfts, plans, crypto, referrals
            ] = await Promise.all([
                apiService.getCardDetails(), apiService.getBankAccounts(), apiService.getLoans(),
                apiService.getP2POffers(), apiService.getMyP2POrders(), apiService.getPaymentMethods(),
                apiService.getReitProperties(), apiService.getStakableStocks(), apiService.getInvestableNfts(),
                apiService.getSpectrumPlans(), apiService.getStakableCrypto(), apiService.getReferralSummary()
            ]);
            setCardDetails(cards);
            setLinkedBankAccounts(banks);
            setLoanApplications(loans);
            setP2POffers(processP2POffers(offers.offers));
            setP2POrders(processP2POrders(orders.orders));
            setUserPaymentMethods(payments.paymentMethods);
            setReitProperties(reits.reitProperties);
            setStakableStocks(processStakableStocks(stocks.stakableStocks));
            setInvestableNFTs(nfts.investableNFTs);
            setSpectrumPlans(plans.plans);
            setStakableCrypto(processStakableAssets(crypto.assets));
            setReferralSummary(referrals);

        } catch (error) {
            console.error("Failed to load user data:", error);
            localStorage.removeItem('valifi_token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('valifi_token');
        if (token) {
            loadAppData(token);
        } else {
            setIsLoading(false);
        }
    }, [loadAppData]);

    const handleLogin = async (email: string, password: string) => {
        const result = await apiService.login(email, password);
        if (result.success && result.user) {
            localStorage.setItem('valifi_token', result.user.token);
            await loadAppData(result.user.token);
            return { success: true };
        }
        return { success: false, message: result.message };
    };

    const handleSignUp = async (fullName: string, username: string, email: string, password: string) => {
        const result = await apiService.register(fullName, username, email, password);
        if (result.success && result.user) {
            localStorage.setItem('valifi_token', result.user.token);
            await loadAppData(result.user.token);
            return { success: true };
        }
        return { success: false, message: result.message };
    }

    const onTransferToMain = useCallback(async (assetId: string) => {
        console.log(`Transferring ${assetId} to main...`);
        // await apiService.transferToMain(assetId);
        if (user?.token) loadAppData(user.token);
    }, [loadAppData, user?.token]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        setNotifications(prev => [{...notification, id: `notif-${Date.now()}`, timestamp: new Date().toISOString(), isRead: false}, ...prev]);
    }, []);

    const onInitiateTrade = useCallback(async (offerId: string, amount: number, paymentMethodId: string): Promise<P2POrder> => {
        const order = await apiService.onInitiateTrade(offerId, amount, paymentMethodId);
        setP2POrders(prev => [order, ...prev]);
        return order;
    }, []);
    
    // ... other handlers would go here ...
    const handlers = {
        onTransferToMain,
        onDepositClick: () => setDepositModalOpen(true),
        onWithdrawClick: () => setWithdrawModalOpen(true),
        onViewInvestment: (asset: Asset) => { setSelectedInvestment(asset); setInvestmentDetailModalOpen(true); },
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen bg-background"><LoadingSpinner /></div>;
    }

    if (!user || !userSettings || !portfolio) {
        return <LandingPage onLogin={handleLogin} onSignUp={handleSignUp} userSettings={userSettings!} setUserSettings={setUserSettings!} />;
    }

    const renderView = () => {
        const commonProps = { portfolio, setCurrentView, ...handlers };
        const cashBalance = portfolio.assets.find(a => a.type === AssetType.CASH)?.balance || 0;
        switch (currentView) {
            case 'dashboard': return <DetailViewModal {...commonProps} />;
            case 'investments': return <InvestmentsView assets={portfolio.assets} onTradeClick={(ticker) => { setExchangeDefaultAssetTicker(ticker); setCurrentView('exchange'); }} onInvest={()=>{}} cashBalance={cashBalance} onViewInvestment={handlers.onViewInvestment} onReinvest={()=>{}} onTransferToMain={onTransferToMain} onStake={()=>{}} onRequestStakeWithdrawal={()=>{}} onReStake={()=>{}} reitProperties={reitProperties} onReitInvest={()=>{}} stakableStocks={stakableStocks} onStockStake={()=>{}} investableNFTs={investableNFTs} onNFTInvest={()=>{}} onNFTStake={()=>{}} onNFTSell={()=>{}} onNFTClaim={()=>{}} initialTab={"all"} spectrumPlans={spectrumPlans} stakableCrypto={stakableCrypto} />;
            case 'referrals': return <ReferralsView summary={referralSummary} />;
            case 'privacy': return <PrivacyView />;
            case 'exchange': return <ExchangeView assets={portfolio!.assets} onSwap={() => {}} defaultFromAssetTicker={exchangeDefaultAssetTicker} setExchangeDefaultAssetTicker={setExchangeDefaultAssetTicker} />;
            case 'p2p': return <P2PExchangeView kycStatus={userSettings.profile.kycStatus!} setCurrentView={setCurrentView} assets={portfolio!.assets} currentUser={user} offers={p2pOffers} orders={p2pOrders} userPaymentMethods={userPaymentMethods} setUserPaymentMethods={setUserPaymentMethods} onInitiateTrade={onInitiateTrade} onUpdateOrder={(order) => setP2POrders(prev => prev.map(o => o.id === order.id ? order : o))} addNotification={addNotification} />;
            case 'wallet': return <WalletView portfolio={portfolio!} onConnectWallet={() => setIsWalletConnectOpen(true)} onWalletSend={()=>{}} />;
            case 'tax': return <TaxView transactions={portfolio.transactions} api={apiService.callTaxAdvisor} />;
            case 'kyc': return <KYCView status={userSettings.profile.kycStatus!} setStatus={(s) => setUserSettings(u => ({...u!, profile: {...u!.profile, kycStatus: s}}))} reason={userSettings.profile.kycRejectionReason || ''} setReason={(r) => setUserSettings(u => ({...u!, profile: {...u!.profile, kycRejectionReason: r}}))} />;
            case 'internal-transfer': return <InternalTransfer portfolio={portfolio} onInternalTransfer={()=>{}} />;
            case 'cards': return <CardsView cardDetails={cardDetails} onApply={(data) => apiService.applyForCard(data).then(res => setCardDetails(res.cardDetails))} setCardDetails={setCardDetails} />;
            case 'banking': return <BankingView linkedAccounts={linkedBankAccounts} onLinkAccount={(data) => apiService.linkBankAccount(data).then(acc => setLinkedBankAccounts(p => [...p, acc]))} setLinkedBankAccounts={setLinkedBankAccounts} />;
            case 'loans': return <LoansView portfolio={portfolio} kycStatus={userSettings.profile.kycStatus!} loanApplications={loanApplications} onApplyForLoan={(data) => apiService.applyForLoan(data).then(app => setLoanApplications(p => [...p, app]))} onLoanRepayment={()=>{}} />;
            case 'settings': return <SettingsView settings={userSettings} setSettings={setUserSettings} />;
            case 'nft': return <NFTView nfts={portfolio.assets.filter(a => a.type === AssetType.NFT)} onManageClick={handlers.onViewInvestment} />;
            case 'api_guide': return <APIGuideView />;
            default: return <div>View not found</div>;
        }
    };
    
    return (
        <Layout
            portfolio={portfolio}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onTransferToMain={onTransferToMain}
            isLiveUpdating={isLiveUpdating}
            setIsLiveUpdating={setIsLiveUpdating}
            isWalletConnectOpen={isWalletConnectOpen}
            setIsWalletConnectOpen={setIsWalletConnectOpen}
            isWalletConnectQRModalOpen={isWalletConnectQRModalOpen}
            setWalletConnectQRModalOpen={setWalletConnectQRModalOpen}
            isImportSeedPhraseModalOpen={isImportSeedPhraseModalOpen}
            setImportSeedPhraseModalOpen={setImportSeedPhraseModalOpen}
            importSource={importSource}
            setImportSource={setImportSource}
            notifications={notifications}
            userActivity={userActivity}
            newsItems={newsItems}
            isNotificationsOpen={isNotificationsOpen}
            setNotificationsOpen={setNotificationsOpen}
            onMarkAsRead={(id) => setNotifications(n => n.map(notif => notif.id === id ? {...notif, isRead: true} : notif))}
            onDismiss={(id) => setNotifications(n => n.filter(notif => notif.id !== id))}
            onMarkAllRead={() => setNotifications(n => n.map(notif => ({...notif, isRead: true})))}
            onClearAll={() => setNotifications(n => n.filter(notif => !notif.isRead))}
            userSettings={userSettings}
            setUserSettings={setUserSettings}
            onDepositClick={handlers.onDepositClick}
            onWithdrawClick={handlers.onWithdrawClick}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            stakableStocks={stakableStocks}
            reitProperties={reitProperties}
            investableNFTs={investableNFTs}
        >
            {renderView()}

            <DepositModal isOpen={isDepositModalOpen} onClose={() => setDepositModalOpen(false)} onDeposit={()=>{}} linkedBankAccounts={linkedBankAccounts} setCurrentView={setCurrentView} />
            <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} onWithdraw={()=>{}} kycStatus={userSettings.profile.kycStatus!} balance={portfolio.assets.find(a=>a.type===AssetType.CASH)?.balance || 0} setCurrentView={setCurrentView} linkedBankAccounts={linkedBankAccounts}/>
            <InvestmentDetailModal isOpen={isInvestmentDetailModalOpen} onClose={() => setInvestmentDetailModalOpen(false)} asset={selectedInvestment} onReinvest={()=>{}} onTransfer={onTransferToMain} />
        </Layout>
    );
}

const App: React.FC = () => {
    const savedSettings = JSON.parse(localStorage.getItem('valifi_user_settings') || '{}');
    const initialCurrency = savedSettings?.settings?.preferences?.currency || 'USD';
    
    return (
        <CurrencyProvider savedCurrency={initialCurrency}>
            <AppContent />
        </CurrencyProvider>
    );
};

export default App;