import React, { useState, useEffect, useMemo } from 'react';
import { BtcIcon, EthIcon, SolanaIcon, CardanoIcon, StakingIcon, PolkadotIcon, AvalancheIcon, UsdtIcon, CloseIcon, CheckCircleIcon, ClockIcon, ArrowUpRightIcon, RefreshIcon, ChevronDownIcon } from './icons';
import type { StakableAsset, Asset, InvestmentStatus } from '../types';
import { useCurrency } from './CurrencyContext';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

export const mockStakableAssets: Omit<StakableAsset, 'stakedAmountUSD' | 'totalStakedInPoolUSD'>[] = [
    { id: 'eth', name: 'Ethereum', ticker: 'ETH', Icon: EthIcon, apr: 4.5, minDuration: 30, maxDuration: 365, payoutCycle: 'Monthly', minAmount: 20000, maxAmount: 1000000, adminWalletAddress: '0xAdminEthStakingWallet123456789' },
    { id: 'sol', name: 'Solana', ticker: 'SOL', Icon: SolanaIcon, apr: 7.2, minDuration: 14, maxDuration: 180, payoutCycle: 'Bi-weekly', minAmount: 20000, maxAmount: 1000000, adminWalletAddress: 'So1AdminSo1StakingWa11etSo1111111' },
    { id: 'dot', name: 'Polkadot', ticker: 'DOT', Icon: PolkadotIcon, apr: 14.8, minDuration: 15, maxDuration: 90, payoutCycle: 'Weekly', minAmount: 20000, maxAmount: 1000000, adminWalletAddress: '1AdminDotStakingWa11et111111111111' },
    { id: 'avax', name: 'Avalanche', ticker: 'AVAX', Icon: AvalancheIcon, apr: 9.1, minDuration: 30, maxDuration: 180, payoutCycle: 'Monthly', minAmount: 20000, maxAmount: 1000000, adminWalletAddress: '0xAdminAvaxStakingWalletABCDEF123' },
    { id: 'ada', name: 'Cardano', ticker: 'ADA', Icon: CardanoIcon, apr: 3.8, minDuration: 60, maxDuration: 365, payoutCycle: 'Monthly', minAmount: 20000, maxAmount: 1000000, adminWalletAddress: 'addr1AdminAdaStakingWalletAddress' },
    { id: 'btc', name: 'Bitcoin', ticker: 'BTC', Icon: BtcIcon, apr: 5.2, minDuration: 45, maxDuration: 180, payoutCycle: 'Monthly', minAmount: 20000, maxAmount: 1000000, adminWalletAddress: 'bc1qAdminBtcStakingWalletAddress' },
    { id: 'usdt', name: 'USDT', ticker: 'USDT', Icon: UsdtIcon, apr: 6.9, minDuration: 7, maxDuration: 60, payoutCycle: 'Weekly', minAmount: 20000, maxAmount: 1000000, adminWalletAddress: '0xAdminUsdtStakingWalletAddress' },
];

// MODALS
interface StakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: Omit<StakableAsset, 'stakedAmountUSD' | 'totalStakedInPoolUSD'>;
    cashBalance: number;
    onStake: (plan: StakableAsset, amount: number, duration: number, payoutDestination: 'wallet' | 'balance') => void;
    prefillData?: { amount: number; duration: number; payoutDestination: 'wallet' | 'balance' };
}

const StakeModal: React.FC<StakeModalProps> = ({ isOpen, onClose, plan, cashBalance, onStake, prefillData }) => {
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('');
    const [payoutDestination, setPayoutDestination] = useState<'wallet' | 'balance'>('balance');
    const [error, setError] = useState('');
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        if (plan) {
            setDuration(prefillData?.duration.toString() || plan.minDuration.toString());
            setAmount(prefillData?.amount.toString() || '');
            setPayoutDestination(prefillData?.payoutDestination || 'balance');
            setError('');
        }
    }, [plan, isOpen, prefillData]);
    
    useEffect(() => {
        setError('');
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || amount === '') return;
        
        if (numAmount > cashBalance) setError('Amount exceeds your available cash balance.');
        else if (numAmount < plan.minAmount) setError(`Minimum investment is ${formatCurrency(plan.minAmount)}.`);
        else if (numAmount > plan.maxAmount) setError(`Maximum investment is ${formatCurrency(plan.maxAmount)}.`);
    }, [amount, cashBalance, plan, formatCurrency]);

    if (!isOpen || !plan) return null;

    const handleSubmit = () => {
        if (error) return;
        const numAmount = parseFloat(amount);
        const numDuration = parseInt(duration);
        
        onStake(plan as StakableAsset, numAmount, numDuration, payoutDestination);
        onClose();
    };
    
    const estimatedTotalReturn = (parseFloat(amount) || 0) * (plan.apr / 100) * (parseInt(duration) / 365);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-popover border border-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-popover-foreground">{prefillData ? 'Re-stake' : 'Stake'} {plan.name}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-popover-foreground"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div>
                        <label className="text-sm text-muted-foreground">Amount to Stake (USD)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min={plan.minAmount} max={plan.maxAmount} placeholder={`e.g., ${plan.minAmount}`} className="w-full bg-input p-2 rounded-lg text-foreground mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">Available: {formatCurrency(cashBalance)}</p>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Staking Duration (Days)</label>
                        <input type="range" min={plan.minDuration} max={plan.maxDuration} value={duration} onChange={e => setDuration(e.target.value)} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer mt-2 range-lg"/>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>{plan.minDuration} days</span><span>{duration} days</span><span>{plan.maxDuration} days</span></div>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Select Payout Destination</label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <button onClick={() => setPayoutDestination('balance')} className={`p-3 rounded-lg border text-sm ${payoutDestination === 'balance' ? 'bg-primary/20 border-primary' : 'bg-secondary border-border'}`}>Credit to Available Balance</button>
                            <button onClick={() => setPayoutDestination('wallet')} className={`p-3 rounded-lg border text-sm ${payoutDestination === 'wallet' ? 'bg-primary/20 border-primary' : 'bg-secondary border-border'}`}>Credit to Wallet System</button>
                        </div>
                    </div>
                    <div className="bg-secondary p-3 rounded-lg space-y-2 border border-border text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Est. Total Return:</span><span className="font-semibold text-success">{formatCurrency(estimatedTotalReturn)}</span></div>
                    </div>
                    {error && <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md">{error}</p>}
                    <button onClick={handleSubmit} disabled={!!error || !amount} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed">
                       {prefillData ? 'Confirm Re-stake' : 'Confirm Stake'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ManageStakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: Asset;
    onRequestWithdrawal: (assetId: string) => void;
    onReStake: (oldAsset: Asset, newAmount: number, newDuration: number, newDestination: 'wallet' | 'balance') => void;
}

const ManageStakeModal: React.FC<ManageStakeModalProps> = ({ isOpen, onClose, asset, onRequestWithdrawal, onReStake }) => {
    const { formatCurrency } = useCurrency();
    const planDetails = mockStakableAssets.find(p => p.ticker === asset.ticker);

    const handleReStakeClick = () => {
        onClose(); // Close this modal
        // This will be handled by parent opening the stake modal with prefill
        onReStake(asset, asset.valueUSD, planDetails?.minDuration || 30, asset.payoutDestination || 'balance');
    };
    
    const handleWithdrawClick = () => {
        onRequestWithdrawal(asset.id);
        alert("Withdrawal request submitted for admin approval.");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-popover border border-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-popover-foreground">Manage Stake: {asset.name}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-popover-foreground"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="bg-secondary p-4 rounded-lg border border-border space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Original Stake:</span> <span className="font-semibold text-foreground">{formatCurrency(asset.initialInvestment || 0)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Total Earnings:</span> <span className="font-semibold text-success">{formatCurrency(asset.totalEarnings || 0)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Matured Value:</span> <span className="font-bold text-lg text-foreground">{formatCurrency(asset.valueUSD)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Status:</span> <span className="font-semibold text-success">{asset.status}</span></div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleReStakeClick} className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-primary/20 text-foreground font-semibold py-3 px-4 rounded-lg"><RefreshIcon className="w-4 h-4" /> Re-stake</button>
                        <button onClick={handleWithdrawClick} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg"><ArrowUpRightIcon className="w-4 h-4" /> Withdraw</button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">Withdrawals are subject to manual review and approval by an admin.</p>
                </div>
            </div>
        </div>
    );
};

// HISTORY TABLE
const StakingHistoryTable: React.FC<{ stakedAssets: Asset[] }> = ({ stakedAssets }) => {
    const [statusFilter, setStatusFilter] = useState<InvestmentStatus | 'All'>('All');
    const { formatCurrency } = useCurrency();

    const filteredAssets = useMemo(() => {
        if (statusFilter === 'All') return stakedAssets;
        return stakedAssets.filter(a => a.status === statusFilter);
    }, [stakedAssets, statusFilter]);
    
    return (
        <Card>
            <div className="p-4 flex justify-between items-center border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">My Staking History</h3>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="bg-input border border-border rounded-lg p-2 text-sm">
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Matured">Matured</option>
                    <option value="Pending Withdrawal">Pending Withdrawal</option>
                    <option value="Withdrawn">Withdrawn</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border">
                            {['Asset', 'Amount', 'Start Date', 'End Date', 'Return Earned', 'Payout To', 'Status'].map(h => <th key={h} className="p-3 text-xs text-muted-foreground uppercase">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredAssets.map(asset => (
                            <tr key={asset.id} className="hover:bg-accent">
                                <td className="p-3"><div className="flex items-center gap-2"><asset.Icon className="w-6 h-6"/><span>{asset.name}</span></div></td>
                                <td className="p-3 font-mono">{formatCurrency(asset.initialInvestment || 0)}</td>
                                <td className="p-3 text-sm text-muted-foreground">{new Date(asset.logs?.find(l => l.action === 'Buy')?.date || Date.now()).toLocaleDateString()}</td>
                                <td className="p-3 text-sm text-muted-foreground">{asset.maturityDate ? new Date(asset.maturityDate).toLocaleDateString() : 'N/A'}</td>
                                <td className="p-3 font-mono text-success">{formatCurrency(asset.totalEarnings || 0)}</td>
                                <td className="p-3 text-sm capitalize">{asset.payoutDestination}</td>
                                <td className="p-3"><span className="text-xs px-2 py-1 bg-secondary rounded-full">{asset.status}</span></td>
                            </tr>
                        ))}
                         {filteredAssets.length === 0 && <tr><td colSpan={7} className="text-center p-8 text-muted-foreground">No staking history matches your filter.</td></tr>}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};


// MAIN COMPONENT
interface StakingViewProps {
    assets: Asset[];
    cashBalance: number;
    onStake: (plan: StakableAsset, amount: number, duration: number, payoutDestination: 'wallet' | 'balance') => void;
    onRequestWithdrawal: (assetId: string) => void;
    onReStake: (oldAsset: Asset, newAmount: number, newDuration: number, newDestination: 'wallet' | 'balance') => void;
}

const StakingView: React.FC<StakingViewProps> = ({ assets, cashBalance, onStake, onRequestWithdrawal, onReStake }) => {
    const [stakeModalOpen, setStakeModalOpen] = useState(false);
    const [manageModalOpen, setManageModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Omit<StakableAsset, 'stakedAmountUSD' | 'totalStakedInPoolUSD'> | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [prefillData, setPrefillData] = useState<any>(null);
    const { formatCurrency } = useCurrency();

    const userStakedAssets = useMemo(() => assets.filter(a => a.name.includes('Staking')), [assets]);

    const handleStakeClick = (plan: Omit<StakableAsset, 'stakedAmountUSD' | 'totalStakedInPoolUSD'>) => {
        setPrefillData(null);
        setSelectedPlan(plan);
        setStakeModalOpen(true);
    };

    const handleManageClick = (stakedAsset: Asset) => {
        setSelectedAsset(stakedAsset);
        setManageModalOpen(true);
    };

    const handleReStakeProxy = (oldAsset: Asset, newAmount: number, newDuration: number, newDestination: 'wallet' | 'balance') => {
        const plan = mockStakableAssets.find(p => p.ticker === oldAsset.ticker);
        if(plan){
            setPrefillData({ amount: oldAsset.valueUSD, duration: plan.minDuration, payoutDestination: oldAsset.payoutDestination });
            setSelectedPlan(plan);
            // This is a proxy to open the StakeModal with pre-filled data, the actual re-stake logic is in App.tsx
            // The onStake from the modal will need to be adapted or a new handler created.
            // For now, let's just open the modal with pre-filled values. The final re-stake action will be handled by the parent.
            setStakeModalOpen(true);
        }
    };
    
    const handleModalStake = (plan: StakableAsset, amount: number, duration: number, payoutDestination: 'wallet' | 'balance') => {
        if(prefillData && selectedAsset) {
            onReStake(selectedAsset, amount, duration, payoutDestination);
        } else {
            onStake(plan, amount, duration, payoutDestination);
        }
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground px-2">Staking Pools</h3>
                {mockStakableAssets.map(plan => {
                    const existingStake = userStakedAssets.find(a => a.ticker === plan.ticker && (a.status === 'Active' || a.status === 'Matured'));
                    return (
                        <Card key={plan.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <plan.Icon className="w-12 h-12" />
                                <div>
                                    <p className="font-bold text-foreground text-lg">{plan.name}</p>
                                    <p className="text-sm text-muted-foreground">APR: <span className="font-semibold text-success">{plan.apr.toFixed(2)}%</span></p>
                                </div>
                            </div>
                            {existingStake ? (
                                <div className="text-right">
                                     <p className="font-semibold text-foreground">{formatCurrency(existingStake.valueUSD)}</p>
                                     <p className={`text-xs ${existingStake.status === 'Matured' ? 'text-success' : 'text-primary'}`}>{existingStake.status}</p>
                                </div>
                            ) : <div/>}
                            {existingStake?.status === 'Matured' ? (
                                <button onClick={() => handleManageClick(existingStake)} className="font-semibold py-2 px-5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">Manage</button>
                            ) : existingStake?.status === 'Active' ? (
                                <button onClick={() => handleManageClick(existingStake)} className="font-semibold py-2 px-5 rounded-lg bg-secondary text-secondary-foreground">View Progress</button>
                            ) : (
                                <button onClick={() => handleStakeClick(plan)} className="font-semibold py-2 px-5 rounded-lg bg-secondary/80 hover:bg-secondary text-secondary-foreground">Stake</button>
                            )}
                        </Card>
                    );
                })}
            </div>

            <StakingHistoryTable stakedAssets={userStakedAssets} />

            {stakeModalOpen && selectedPlan && (
                <StakeModal 
                    isOpen={stakeModalOpen}
                    onClose={() => { setStakeModalOpen(false); setPrefillData(null); }}
                    plan={selectedPlan}
                    cashBalance={cashBalance}
                    onStake={handleModalStake}
                    prefillData={prefillData}
                />
            )}
            {manageModalOpen && selectedAsset && (
                <ManageStakeModal
                    isOpen={manageModalOpen}
                    onClose={() => setManageModalOpen(false)}
                    asset={selectedAsset}
                    onRequestWithdrawal={onRequestWithdrawal}
                    onReStake={handleReStakeProxy}
                />
            )}
        </div>
    );
};

export default StakingView;