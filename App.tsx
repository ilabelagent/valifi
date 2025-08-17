import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout';
import DetailViewModal from './components/DetailViewModal';
import InvestmentsView from './components/InvestmentsView';
import ReferralsView from './components/ReferralsView';
import PrivacyView from './components/PrivacyView';
import ExchangeView from './components/ExchangeView';
import P2PExchangeView from './components/P2PExchangeView';
import WalletView from './components/WalletView';
import TaxView from './components/TaxView';
import KYCView from './components/KYCView';
import InternalTransfer from './components/InternalTransfer';
import CardsView from './components/CardsView';
import BankingView from './components/BankingView';
import LoansView from './components/LoansView';
import SettingsView from './components/SettingsView';
import NFTView from './components/NFTView';
import APIGuideView from './components/APIGuideView';
import DepositModal from './components/DepositModal';
import WithdrawModal from './components/WithdrawModal';
import InvestmentDetailModal from './components/InvestmentDetailModal';
import type { ViewType, Portfolio, Asset, KYCStatus, CardDetails, CardApplicationData, P2POffer, P2POrder, UserSettings, Language, Notification, UserActivity, NewsItem, PaymentMethod, UserP2PProfile, REITProperty, StakableAsset, InvestableNFT, StakableStock, BankAccount, LoanApplication } from './types';
import { AssetType } from './types';
import { 
    BtcIcon, EthIcon, UsdIcon, AppleIcon, SolanaIcon, CardanoIcon, PolkadotIcon, ChainlinkIcon, AvalancheIcon, NvidiaIcon, GoogleIcon, AmazonIcon, TeslaIcon, 
    DownloadIcon, ArrowUpRightIcon, SwapIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon, LoanIcon, InvestmentsIcon, UserCheckIcon, NewspaperIcon, 
    CardIcon, RefreshIcon, ArrowDownIcon, NftIcon, HomeIcon, BnbIcon, MaticIcon, UsdtIcon, MicrosoftIcon, MetaIcon, AmdIcon, JpmorganIcon, VisaIcon, 
    NetflixIcon, XomIcon, JnjIcon, PgIcon, UnhIcon, HdIcon, MaIcon, BacIcon, CostIcon, CvxIcon, LlyIcon, AvgoIcon, PepIcon, KoIcon, WmtIcon, CrmIcon, DisIcon, BaIcon,
    ShieldCheckIcon
} from './components/icons';
import { CurrencyProvider, useCurrency } from './components/CurrencyContext';
import LandingPage from './components/LandingPage';
import * as apiService from './services/api';
import { languageList } from './i18n';

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
        seller: processUserP2PProfile(order.seller),
    }));
};


const defaultUserSettings: UserSettings = {
    profile: {
        id: 'guest-user',
        fullName: 'Guest',
        username: 'guest',
        profilePhotoUrl: 'https://i.pravatar.cc/40?u=guest',
    },
    settings: {
        twoFactorAuth: {
            enabled: false,
            method: 'none'
        },
        loginAlerts: false,
        autoLogout: '1h',
        preferences: {
            currency: 'USD',
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
            timezone: 'UTC',
            balancePrivacy: false,
        },
        privacy: {
            emailMarketing: false,
            platformMessages: false,
            contactAccess: false,
        },
        vaultRecovery: {
            email: '',
            phone: '',
            pin: '',
        }
    },
    sessions: []
};


const AppContent: React.FC<{
    currentUser: any;
    onLogout: () => void;
}> = ({ currentUser, onLogout }) => {
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
    
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [isLiveUpdating, setIsLiveUpdating] = useState(true);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const [isDepositModalOpen, setDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [isWalletConnectOpen, setIsWalletConnectOpen] = useState(false);
    const [isWalletConnectQRModalOpen, setWalletConnectQRModalOpen] = useState(false);
    const [isImportSeedPhraseModalOpen, setImportSeedPhraseModalOpen] = useState(false);
    const [importSource, setImportSource] = useState('');
    const [selectedInvestment, setSelectedInvestment] = useState<Asset | null>(null);

    // Feature-specific states
    const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
    const [linkedBankAccounts, setLinkedBankAccounts] = useState<BankAccount[]>([]);
    const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
    const [p2pOffers, setP2pOffers] = useState<P2POffer[]>([]);
    const [p2pOrders, setP2pOrders] = useState<P2POrder[]>([]);
    const [p2pPaymentMethods, setP2pPaymentMethods] = useState<PaymentMethod[]>([]);
    const [reitProperties, setReitProperties] = useState<REITProperty[]>([]);
    const [availableStakableStocks, setAvailableStakableStocks] = useState<StakableStock[]>([]);
    const [availableInvestableNFTs, setAvailableInvestableNFTs] = useState<InvestableNFT[]>([]);
    
    const [exchangeDefaultAssetTicker, setExchangeDefaultAssetTicker] = useState<string | undefined>();
    const [investmentsInitialTab, setInvestmentsInitialTab] = useState('overview');
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const { formatCurrency } = useCurrency();

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
      const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}`,
          timestamp: new Date().toISOString(),
          isRead: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const fetchAllData = useCallback(async () => {
        try {
            setIsLoading(true);
            if (currentUser && currentUser.portfolio) {
                setPortfolio({ ...currentUser.portfolio, assets: processAssets(currentUser.portfolio.assets) });
                setNotifications(currentUser.notifications || []);
                setUserActivity(processUserActivity(currentUser.userActivity || []));
                setNewsItems(currentUser.newsItems || []);
                setUserSettings(currentUser.settings);
            }

            const [
                cardsRes, banksRes, loansRes, p2pOffersRes, 
                p2pOrdersRes, p2pMethodsRes, reitRes, stocksRes, nftsRes
            ] = await Promise.all([
                apiService.getCardDetails(),
                apiService.getBankAccounts(),
                apiService.getLoans(),
                apiService.getP2POffers(),
                apiService.getMyP2POrders(),
                apiService.getPaymentMethods(),
                apiService.getReitProperties(),
                apiService.getStakableStocks(),
                apiService.getInvestableNfts()
            ]);
            
            if (cardsRes) setCardDetails(cardsRes);
            if (banksRes) setLinkedBankAccounts(banksRes);
            if (loansRes) setLoanApplications(loansRes);
            if (p2pOffersRes) setP2pOffers(processP2POffers(p2pOffersRes.offers));
            if (p2pOrdersRes) setP2pOrders(processP2POrders(p2pOrdersRes.orders));
            if (p2pMethodsRes) setP2pPaymentMethods(p2pMethodsRes.paymentMethods);
            
            if (reitRes) {
                const processedReits = reitRes.reitProperties.map((p: any) => ({ ...p, status: p.status as 'Open for Shares' | 'Fully Funded' }));
                setReitProperties(processedReits);
            }
            if (stocksRes) {
                const processedStocks = stocksRes.stakableStocks.map((stock: any) => ({ ...stock, logo: iconMap[stock.Icon] || UsdIcon }));
                setAvailableStakableStocks(processedStocks);
            }
            if (nftsRes) setAvailableInvestableNFTs(nftsRes.investableNFTs);
            
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);


    useEffect(() => {
        if (currentUser) {
            fetchAllData();
        }
    }, [currentUser, fetchAllData]);
    
    const handleUpdateSettings = useCallback(async (updater: React.SetStateAction<UserSettings>) => {
        const currentState = userSettings;
        const newSettings = typeof updater === 'function' ? (updater as (prevState: UserSettings) => UserSettings)(currentState!) : updater;
        if (!newSettings) return;
        
        setUserSettings(newSettings);
        try {
            const result = await apiService.updateUserSettings(currentUser.id, newSettings);
            setUserSettings(result.settings);
        } catch (err) {
            console.error('Error updating settings:', err);
            setUserSettings(currentState);
        }
    }, [currentUser.id, userSettings]);

    const handleInternalTransfer = useCallback(async (recipient: string, amount: number, note: string) => {
        try {
            const { updatedPortfolio } = await apiService.internalTransfer(recipient, amount, note);
            setPortfolio(p => ({ ...p!, ...updatedPortfolio, assets: processAssets(updatedPortfolio.assets) }));
            addNotification({ type: 'system', title: 'Transfer Successful', description: `You sent ${formatCurrency(amount)} to ${recipient}.` });
        } catch (err: any) {
            addNotification({ type: 'system', title: 'Transfer Failed', description: err.message });
        }
    }, [addNotification, formatCurrency]);

    const handleApplyForCard = useCallback(async (data: CardApplicationData) => {
        try {
            const { cardDetails: newCardDetails } = await apiService.applyForCard(data);
            setCardDetails(newCardDetails);
            addNotification({ type: 'system', title: 'Card Application Submitted', description: 'Your card application is now under review.' });
        } catch (err: any) {
             addNotification({ type: 'system', title: 'Application Failed', description: err.message });
        }
    }, [addNotification]);

    const handleLinkBankAccount = useCallback(async (accountData: Omit<BankAccount, 'id'|'status'>) => {
        try {
            const newAccount = await apiService.linkBankAccount(accountData);
            setLinkedBankAccounts(prev => [...prev, newAccount]);
            addNotification({ type: 'system', title: 'Bank Account Linked', description: `Your account ${newAccount.nickname} is pending verification.` });
        } catch(err: any) {
            addNotification({ type: 'system', title: 'Linking Failed', description: err.message });
        }
    }, [addNotification]);

    const handleApplyForLoan = useCallback(async (application: Omit<LoanApplication, 'id'|'date'|'status'>) => {
        try {
            const newApplication = await apiService.applyForLoan(application);
            setLoanApplications(prev => [...prev, newApplication]);
            addNotification({ type: 'loan', title: 'Loan Application Submitted', description: 'Your application is under review.' });
        } catch(err: any) {
             addNotification({ type: 'loan', title: 'Application Failed', description: err.message });
        }
    }, [addNotification]);

    const p2pProfile: UserP2PProfile = useMemo(() => ({
        id: userSettings?.profile.id || '',
        name: userSettings?.profile.fullName || '',
        avatarUrl: userSettings?.profile.profilePhotoUrl || '',
        rating: 4.9,
        totalTrades: 123,
        completionRate: 99.8,
        isVerified: userSettings?.profile.kycStatus === 'Approved',
        countryCode: 'US',
        joinDate: '2023-01-01T00:00:00Z',
        language: userSettings?.settings.preferences.language || 'en',
        trustScore: 98,
    }), [userSettings]);

    if (isLoading || !portfolio || !userSettings || !cardDetails) {
        return <div className="w-full h-screen flex justify-center items-center bg-background"><div className="text-foreground">Loading Platform...</div></div>;
    }
    
    if (error) {
         return <div className="w-full h-screen flex justify-center items-center bg-background"><div className="text-destructive text-center p-4">Error: {error}<br/>Please refresh the page.</div></div>;
    }
    
    const kycStatus = userSettings.profile?.kycStatus as KYCStatus || 'Not Started';

    return (
        <>
            <Layout
                portfolio={portfolio}
                currentView={currentView} setCurrentView={setCurrentView}
                onTransferToMain={() => {}}
                isLiveUpdating={isLiveUpdating} setIsLiveUpdating={setIsLiveUpdating}
                isWalletConnectOpen={isWalletConnectOpen} setIsWalletConnectOpen={setIsWalletConnectOpen}
                isWalletConnectQRModalOpen={isWalletConnectQRModalOpen} setWalletConnectQRModalOpen={setWalletConnectQRModalOpen}
                isImportSeedPhraseModalOpen={isImportSeedPhraseModalOpen} setImportSeedPhraseModalOpen={setImportSeedPhraseModalOpen}
                importSource={importSource} setImportSource={setImportSource}
                notifications={notifications} userActivity={userActivity} newsItems={newsItems}
                isNotificationsOpen={isNotificationsOpen} setNotificationsOpen={setNotificationsOpen}
                onMarkAsRead={() => {}}
                onDismiss={() => {}}
                onMarkAllRead={() => {}}
                onClearAll={() => {}}
                userSettings={userSettings}
                setUserSettings={handleUpdateSettings}
                onDepositClick={() => setDepositModalOpen(true)}
                onWithdrawClick={() => setWithdrawModalOpen(true)}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            >
                {
                    {
                        'dashboard': <DetailViewModal portfolio={portfolio} setCurrentView={setCurrentView} onTransferToMain={() => {}} onDepositClick={() => setDepositModalOpen(true)} onWithdrawClick={() => setWithdrawModalOpen(true)} />,
                        'investments': <InvestmentsView 
                            assets={portfolio.assets}
                            onInvest={() => {}}
                            cashBalance={portfolio.assets.find(a=>a.type===AssetType.CASH)?.balance || 0} 
                            onViewInvestment={setSelectedInvestment}
                            onTransferToMain={() => {}}
                            onStake={() => {}}
                            onStockStake={() => {}}
                            onReitInvest={() => {}}
                            onReinvest={()=>{}} onRequestStakeWithdrawal={()=>{}} onReStake={()=>{}}
                            reitProperties={reitProperties} stakableStocks={availableStakableStocks} investableNFTs={availableInvestableNFTs}
                            onTradeClick={(ticker) => { setExchangeDefaultAssetTicker(ticker); setCurrentView('exchange'); }}
                            onNFTInvest={() => {}} onNFTStake={() => {}} onNFTSell={() => {}} onNFTClaim={() => {}} initialTab={investmentsInitialTab}
                        />,
                        'wallet': <WalletView portfolio={portfolio} onConnectWallet={() => setIsWalletConnectOpen(true)} onWalletSend={() => {}} />,
                        'referrals': <ReferralsView />,
                        'privacy': <PrivacyView />,
                        'exchange': <ExchangeView assets={portfolio.assets} onSwap={() => {}} defaultFromAssetTicker={exchangeDefaultAssetTicker} setExchangeDefaultAssetTicker={setExchangeDefaultAssetTicker} />,
                        'p2p': <P2PExchangeView
                            kycStatus={kycStatus}
                            setCurrentView={setCurrentView}
                            assets={portfolio.assets}
                            currentUser={p2pProfile}
                            offers={p2pOffers}
                            orders={p2pOrders}
                            userPaymentMethods={p2pPaymentMethods}
                            setUserPaymentMethods={setP2pPaymentMethods}
                            onInitiateTrade={apiService.onInitiateTrade}
                            onUpdateOrder={() => {}}
                            addNotification={addNotification}
                        />,
                        'tax': <TaxView transactions={portfolio.transactions} api={apiService.callTaxAdvisor} />,
                        'kyc': <KYCView status={kycStatus} setStatus={() => {}} reason={userSettings.profile.kycRejectionReason || ''} setReason={() => {}} />,
                        'internal-transfer': <InternalTransfer portfolio={portfolio} onInternalTransfer={handleInternalTransfer} />,
                        'cards': <CardsView cardDetails={cardDetails} onApply={handleApplyForCard} setCardDetails={setCardDetails} />,
                        'banking': <BankingView linkedAccounts={linkedBankAccounts} onLinkAccount={handleLinkBankAccount} setLinkedBankAccounts={setLinkedBankAccounts} />,
                        'loans': <LoansView portfolio={portfolio} kycStatus={kycStatus} loanApplications={loanApplications} onApplyForLoan={handleApplyForLoan} onLoanRepayment={async () => {}} />,
                        'settings': <SettingsView settings={userSettings} setSettings={handleUpdateSettings} />,
                        'nft': <NFTView nfts={portfolio.assets.filter(a => a.type === AssetType.NFT)} onManageClick={(asset) => { setInvestmentsInitialTab('holdings'); setCurrentView('investments'); }} />,
                        'api_guide': <APIGuideView />,
                    }[currentView] || <div className="p-8 text-center text-muted-foreground">View not found</div>
                }
            </Layout>
            <DepositModal isOpen={isDepositModalOpen} onClose={() => setDepositModalOpen(false)} onDeposit={()=>{}} linkedBankAccounts={linkedBankAccounts} setCurrentView={setCurrentView} />
            <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} onWithdraw={()=>{}} kycStatus={kycStatus} balance={portfolio.assets.find(a => a.type === AssetType.CASH)?.balance || 0} setCurrentView={setCurrentView} linkedBankAccounts={linkedBankAccounts} />
            <InvestmentDetailModal isOpen={!!selectedInvestment} onClose={() => setSelectedInvestment(null)} asset={selectedInvestment} onReinvest={()=>{}} onTransfer={() => {}} />
        </>
    );
};

const App: React.FC = () => {
    const { i18n } = useTranslation();
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [guestSettings, setGuestSettings] = useState<UserSettings>(defaultUserSettings);
    const [isLoading, setIsLoading] = useState(true);

    const handleLoginSuccess = useCallback((user: any) => {
        localStorage.setItem('valifi_token', user.token);
        setCurrentUser(user);
        setIsAuthenticated(true);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('valifi_token');
        setCurrentUser(null);
        setIsAuthenticated(false);
    }, []);
    
     useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('valifi_token');
            if (token) {
                 try {
                    const user = await apiService.getUserProfile(token);
                    if (user) {
                        setCurrentUser({ ...user, token });
                        setIsAuthenticated(true);
                    } else {
                       handleLogout();
                    }
                } catch (e) {
                   handleLogout();
                }
            }
            setIsLoading(false);
        };
        checkLoggedIn();
    }, [handleLogout]);
    
    const activeSettingsPreferences = useMemo(() => {
        const userPrefs = currentUser?.settings?.preferences;
        if (userPrefs) {
            return userPrefs;
        }
        return guestSettings.settings.preferences;
    }, [currentUser, guestSettings]);
    
    useEffect(() => {
        // Set the theme on the document element
        document.documentElement.setAttribute('data-theme', 'dark'); // Force dark theme
        
        // Handle balance privacy class on body
        const body = document.body;
        if (activeSettingsPreferences.balancePrivacy) {
            body.classList.add('balance-privacy');
        } else {
            body.classList.remove('balance-privacy');
        }

        // Handle language direction
        const currentLang = languageList.find(lang => lang.code === i18n.language);
        document.documentElement.dir = currentLang?.dir || 'ltr';

    }, [activeSettingsPreferences.balancePrivacy, i18n.language]);

    const handleLogin = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string; }> => {
        try {
            const result = await apiService.login(email, password);
            if (result.success && result.user) {
                handleLoginSuccess(result.user);
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (e: any) {
            return { success: false, message: e.message || 'Could not connect to the server.' };
        }
    }, [handleLoginSuccess]);
    
    const handleSignUp = useCallback(async (fullName: string, username: string, email: string, password: string): Promise<{ success: boolean; message?: string; }> => {
        try {
            const result = await apiService.register(fullName, username, email, password);
            if (result.success && result.user) {
                handleLoginSuccess(result.user);
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (e: any) {
            return { success: false, message: e.message || 'Could not connect to the server.' };
        }
    }, [handleLoginSuccess]);
    
    if (isLoading) {
        return <div className="w-full h-screen flex justify-center items-center bg-background"><div className="text-foreground">Authenticating...</div></div>;
    }

    return (
        <CurrencyProvider savedCurrency={activeSettingsPreferences.currency}>
            {isAuthenticated && currentUser ? (
                <AppContent currentUser={currentUser} onLogout={handleLogout} />
            ) : (
                <LandingPage 
                    onLogin={handleLogin}
                    onSignUp={handleSignUp}
                    userSettings={guestSettings}
                    setUserSettings={setGuestSettings}
                />
            )}
        </CurrencyProvider>
    );
};

export default App;