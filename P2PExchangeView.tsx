import React, { useState, useMemo } from 'react';
import type { P2POffer, KYCStatus, ViewType, PaymentMethod, Asset, UserP2PProfile, P2POrder, TradableAsset, Notification, P2PReview } from '../types';
import { UserCheckIcon, LockIcon, PlusCircleIcon, RefreshIcon, FilterIcon, UsersIcon, ShieldCheckIcon } from './icons';
import { countries } from './countries';
import CreateOfferModal from './CreateOfferModal';
import ManagePaymentMethodsModal from './ManagePaymentMethodsModal';
import OrderDetailsModal from './OrderDetailsModal';
import MyP2POrdersView from './MyP2POrdersView';
import DisputeModal from './DisputeModal';
import TradeConfirmationModal from './TradeConfirmationModal';
import P2PProfileModal from './P2PProfileModal';
import ReviewModal from './ReviewModal';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void;}> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-6 py-3 text-md font-semibold rounded-t-lg transition-colors border-b-2 ${ isActive ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border' }`}>
        {label}
    </button>
);

const OfferRow: React.FC<{ offer: P2POffer; onTrade: (offer: P2POffer) => void; onViewProfile: (profile: UserP2PProfile) => void; }> = ({ offer, onTrade, onViewProfile }) => {
    return (
        <tr className="hover:bg-accent transition-colors group">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <img src={offer.user.avatarUrl} alt={offer.user.name} className="w-10 h-10 rounded-full cursor-pointer" onClick={() => onViewProfile(offer.user)} />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-foreground cursor-pointer hover:text-primary" onClick={() => onViewProfile(offer.user)}>{offer.user.name}</p>
                            {offer.user.isVerified && <UserCheckIcon className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{offer.user.totalTrades} trades | {offer.user.completionRate}% completion</p>
                        <div className="flex items-center gap-1 mt-1">
                            {offer.user.badges?.map(badge => (
                                <div key={badge.id} className="relative group/tooltip">
                                     <ShieldCheckIcon className={`w-3.5 h-3.5 ${badge.color}`} />
                                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-popover text-popover-foreground text-xs text-center rounded-lg p-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg border border-border z-10">
                                        {badge.label}
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </td>
            <td className="p-4">
                <p className="font-semibold text-foreground text-lg">{offer.price.toLocaleString(undefined, { style: 'currency', currency: offer.fiatCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </td>
            <td className="p-4">
                <p className="font-mono text-muted-foreground">Available: {offer.availableAmount.toFixed(4)} {offer.asset.ticker}</p>
                <p className="text-xs text-muted-foreground">
                    Limit: {offer.minOrder.toLocaleString()} - {offer.maxOrder.toLocaleString()} {offer.fiatCurrency}
                </p>
            </td>
            <td className="p-4">
                <div className="flex flex-wrap gap-1.5 max-w-xs">
                    {offer.paymentMethods.map(pm => (
                        <span key={pm.id} className="text-xs bg-secondary px-2 py-1 rounded">{pm.methodType}</span>
                    ))}
                </div>
            </td>
            <td className="p-4 text-right">
                <button 
                    onClick={() => onTrade(offer)}
                    className={`font-bold py-2 px-6 rounded-lg transition-colors text-white text-sm shadow-sm ${
                        offer.type === 'SELL' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'
                    }`}
                >
                    {offer.type === 'SELL' ? 'Buy' : 'Sell'} {offer.asset.ticker}
                </button>
            </td>
        </tr>
    );
};


interface P2PExchangeViewProps {
    kycStatus: KYCStatus;
    setCurrentView: (view: ViewType) => void;
    assets: Asset[];
    currentUser: UserP2PProfile;
    offers: P2POffer[];
    orders: P2POrder[];
    userPaymentMethods: PaymentMethod[];
    setUserPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
    onInitiateTrade: (offerId: string, amount: number, paymentMethodId: string) => Promise<P2POrder>;
    onUpdateOrder: (order: P2POrder) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
}

const P2PExchangeView: React.FC<P2PExchangeViewProps> = ({ kycStatus, setCurrentView, assets, currentUser, offers, orders, userPaymentMethods, setUserPaymentMethods, onInitiateTrade, onUpdateOrder, addNotification }) => {
    const [activeMainTab, setActiveMainTab] = useState<'marketplace' | 'my-orders' | 'disputes' | 'tools'>('marketplace');
    const [activeMarketTab, setActiveMarketTab] = useState<'buy' | 'sell'>('buy');
    const [isCreateOfferOpen, setCreateOfferOpen] = useState(false);
    const [isManagePaymentsOpen, setManagePaymentsOpen] = useState(false);
    const [isKycModalOpen, setKycModalOpen] = useState(false);
    const [activeOrder, setActiveOrder] = useState<P2POrder | null>(null);
    const [disputeOrder, setDisputeOrder] = useState<P2POrder | null>(null);
    const [tradeToConfirm, setTradeToConfirm] = useState<P2POffer | null>(null);
    const [profileToView, setProfileToView] = useState<UserP2PProfile | null>(null);
    const [orderToReview, setOrderToReview] = useState<P2POrder | null>(null);

    const [tradableAssets, setTradableAssets] = useState<TradableAsset[]>([]); // This would be fetched

    const selectClass = "w-full bg-secondary border border-border rounded-lg py-2.5 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

    // Filter State
    const [fiatCurrency, setFiatCurrency] = useState('All');
    const [paymentMethod, setPaymentMethod] = useState('All');
    const [country, setCountry] = useState('All');

    const availableFiatCurrencies = useMemo(() => ['All', ...Array.from(new Set(offers.map(o => o.fiatCurrency)))], [offers]);
    const availablePaymentMethods = useMemo(() => ['All', ...Array.from(new Set(offers.flatMap(o => o.paymentMethods.map(pm => pm.methodType))))], [offers]);

    const filteredOffers = useMemo(() => {
        const typeToShow = activeMarketTab === 'buy' ? 'SELL' : 'BUY';
        return offers
            .filter(o => o.type === typeToShow)
            .filter(o => fiatCurrency === 'All' || o.fiatCurrency === fiatCurrency)
            .filter(o => paymentMethod === 'All' || o.paymentMethods.some(pm => pm.methodType === paymentMethod))
            .filter(o => country === 'All' || o.user.countryCode === country);
    }, [activeMarketTab, fiatCurrency, paymentMethod, country, offers]);
    
    const handleResetFilters = () => {
        setFiatCurrency('All');
        setPaymentMethod('All');
        setCountry('All');
    };
    
    const handleInitiateTradeClick = (offer: P2POffer) => {
        if (kycStatus !== 'Approved') {
            setKycModalOpen(true);
            return;
        }
        setTradeToConfirm(offer);
    };

    const handleConfirmTrade = async (amount: number, paymentMethod: PaymentMethod) => {
        const offer = tradeToConfirm;
        if (!offer) return;
        
        try {
            const newOrder = await onInitiateTrade(offer.id, amount, paymentMethod.id);
            setTradeToConfirm(null);
            setActiveOrder(newOrder); // Open the details modal for the new order
            addNotification({
                type: 'p2p',
                title: 'P2P Trade Started',
                description: `Your trade for ${newOrder.cryptoAmount.toFixed(4)} ${newOrder.offer.asset.ticker} has begun.`
            });
        } catch(e) {
            console.error(e);
            addNotification({
                type: 'system',
                title: 'P2P Trade Failed',
                description: `Could not initiate the trade. Please try again.`
            });
        }
    };
    
    const handleReviewSubmit = (review: Pick<P2PReview, 'rating' | 'comment'>) => {
        if(!orderToReview) return;
        const finalReview: P2PReview = { 
            ...review,
            fromUserId: currentUser.id, 
            timestamp: new Date().toISOString()
        };
        const updatedOrder: P2POrder = {...orderToReview, review: finalReview};
        onUpdateOrder(updatedOrder);
        setOrderToReview(null);
    };

    const handleSubmitDispute = (reason: string) => {
        if (!disputeOrder) return;
        const updatedOrder: P2POrder = {
            ...disputeOrder,
            status: 'Under Review',
            dispute: {
                id: `dispute_${disputeOrder.id}`,
                orderId: disputeOrder.id,
                raisedBy: disputeOrder.buyer.id === currentUser.id ? 'buyer' : 'seller',
                reason: reason,
                status: 'Open',
                createdAt: new Date().toISOString(),
                logs: [{ timestamp: new Date().toISOString(), message: `Dispute opened by ${currentUser.name}.` }]
            }
        };
        onUpdateOrder(updatedOrder);
        setDisputeOrder(null);
        addNotification({
            type: 'p2p',
            title: 'Dispute Raised',
            description: `A dispute has been opened for order ${disputeOrder.id.slice(-6)}. An admin will review it shortly.`
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 view-container">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">P2P Smart Trading Engine</h1>
                    <p className="text-muted-foreground mt-1">Directly trade crypto with other users, on your terms.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setActiveMainTab('tools')} className="text-sm text-muted-foreground hover:text-foreground font-semibold py-2 px-4 rounded-lg hover:bg-accent flex items-center gap-2"><UsersIcon className="w-4 h-4"/> Tools</button>
                    <button onClick={() => setCreateOfferOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors text-sm shadow-sm">
                        <PlusCircleIcon className="w-5 h-5" />
                        <span>Create Offer</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between border-b border-border">
                <div className="flex">
                    <TabButton label="Marketplace" isActive={activeMainTab === 'marketplace'} onClick={() => setActiveMainTab('marketplace')} />
                    <TabButton label="My Orders" isActive={activeMainTab === 'my-orders'} onClick={() => setActiveMainTab('my-orders')} />
                    <TabButton label="Disputes" isActive={activeMainTab === 'disputes'} onClick={() => setActiveMainTab('disputes')} />
                    <TabButton label="Trader Tools" isActive={activeMainTab === 'tools'} onClick={() => setActiveMainTab('tools')} />
                </div>
            </div>

            {activeMainTab === 'marketplace' && (
                <>
                <Card className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">Fiat</label>
                            <select value={fiatCurrency} onChange={e => setFiatCurrency(e.target.value)} className={selectClass}>
                               {availableFiatCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="text-xs text-muted-foreground block mb-1">Payment Method</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={selectClass}>
                               {availablePaymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="text-xs text-muted-foreground block mb-1">Country</label>
                            <select value={country} onChange={e => setCountry(e.target.value)} className={selectClass}>
                               <option value="All">All Countries</option>
                               {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                            </select>
                        </div>
                        <button onClick={handleResetFilters} className="flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-foreground font-semibold py-2.5 px-4 rounded-lg transition-colors w-full">
                            <RefreshIcon className="w-4 h-4" />
                            <span>Reset</span>
                        </button>
                    </div>
                </Card>

                <Card className="overflow-hidden">
                    <div className="border-b border-border px-4">
                        <TabButton label="I want to BUY" isActive={activeMarketTab === 'buy'} onClick={() => setActiveMarketTab('buy')} />
                        <TabButton label="I want to SELL" isActive={activeMarketTab === 'sell'} onClick={() => setActiveMarketTab('sell')} />
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Advertiser</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price per Coin</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available & Limits</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</th>
                                    <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y divide-border">
                                {filteredOffers.map(offer => (
                                    <OfferRow key={offer.id} offer={offer} onTrade={handleInitiateTradeClick} onViewProfile={setProfileToView}/>
                                ))}
                            </tbody>
                        </table>
                         {filteredOffers.length === 0 && (
                            <div className="text-center py-16">
                                <FilterIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
                                <p className="text-muted-foreground mt-4">No offers match your current filters.</p>
                                <p className="text-sm text-muted-foreground/80">Try adjusting your search criteria.</p>
                            </div>
                        )}
                    </div>
                </Card>
                </>
            )}
            
             {activeMainTab === 'my-orders' && (
                <MyP2POrdersView
                    orders={orders}
                    currentUser={currentUser}
                    onViewOrder={setActiveOrder}
                    onDisputeOrder={setDisputeOrder}
                />
            )}

            {activeMainTab === 'disputes' && (
                 <MyP2POrdersView
                    orders={orders.filter(o => o.status === 'Disputed' || o.status === 'Under Review')}
                    currentUser={currentUser}
                    onViewOrder={setActiveOrder}
                    onDisputeOrder={setDisputeOrder}
                />
            )}
            
            {activeMainTab === 'tools' && (
                <Card className="p-6">
                    <h2 className="text-xl font-bold">Trader Tools</h2>
                    <p className="text-muted-foreground">Manage your P2P settings.</p>
                    <button onClick={() => setManagePaymentsOpen(true)} className="mt-4 bg-secondary p-4 rounded-lg w-full text-left font-semibold">Manage Payment Methods</button>
                </Card>
            )}

            <CreateOfferModal 
                isOpen={isCreateOfferOpen} 
                onClose={() => setCreateOfferOpen(false)} 
                assets={assets} 
                tradableAssets={tradableAssets}
                paymentMethods={userPaymentMethods} 
                fiatCurrencies={availableFiatCurrencies.filter(c => c !== 'All')}
            />
            <ManagePaymentMethodsModal
                isOpen={isManagePaymentsOpen}
                onClose={() => setManagePaymentsOpen(false)}
                paymentMethods={userPaymentMethods}
                setPaymentMethods={setUserPaymentMethods}
            />
             {activeOrder && (
                <OrderDetailsModal
                    isOpen={!!activeOrder}
                    onClose={() => setActiveOrder(null)}
                    order={activeOrder}
                    currentUser={currentUser}
                    onUpdateOrder={onUpdateOrder}
                    addNotification={addNotification}
                    onDispute={setDisputeOrder}
                />
            )}
            {disputeOrder && (
                <DisputeModal
                    isOpen={!!disputeOrder}
                    onClose={() => setDisputeOrder(null)}
                    order={disputeOrder}
                    onSubmitDispute={handleSubmitDispute}
                />
            )}
            {tradeToConfirm && (
                <TradeConfirmationModal
                    isOpen={!!tradeToConfirm}
                    onClose={() => setTradeToConfirm(null)}
                    offer={tradeToConfirm}
                    userBalance={assets.find((a) => a.ticker === tradeToConfirm.asset.ticker)?.balance || 0}
                    userPaymentMethods={userPaymentMethods}
                    onConfirmTrade={handleConfirmTrade}
                />
            )}
            {profileToView && (
                <P2PProfileModal
                    isOpen={!!profileToView}
                    onClose={() => setProfileToView(null)}
                    profile={profileToView}
                />
            )}
             {orderToReview && (
                <ReviewModal
                    isOpen={!!orderToReview}
                    onClose={() => setOrderToReview(null)}
                    onSubmit={handleReviewSubmit}
                />
            )}
            {isKycModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 motion-safe:animate-slide-in-fade" onClick={() => setKycModalOpen(false)}>
                    <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 text-card-foreground p-8 text-center" onClick={e => e.stopPropagation()}>
                        <LockIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-foreground">Verification Required</h2>
                        <p className="mt-2 text-muted-foreground">To ensure the security of our community, you must complete KYC verification before placing an order in the P2P marketplace.</p>
                        <button onClick={() => { setKycModalOpen(false); setCurrentView('kyc'); }} className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm">Start KYC Verification</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default P2PExchangeView;