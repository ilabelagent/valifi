



import React, { useState, useMemo } from 'react';
import { ArrowUpDownIcon, SearchIcon, TrendingUpIcon, InvestmentsIcon, UsdIcon } from './icons';
import type { Asset, InvestmentPlan, StakableAsset, REITProperty, StakableStock } from '../types';
import { AssetType } from '../types';
import StakingView from './StakingView';
import SpectrumPlansView from './SpectrumPlansView';
import ActionsDropdown from './ActionsDropdown';
import REITsView from './REITsView';
import { useCurrency } from './CurrencyContext';
import StockStakingView from './StockStakingView';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-slate-900/50 backdrop-blur-lg border border-slate-300/10 rounded-2xl shadow-2xl shadow-black/20 ${className}`}>
      {children}
    </div>
);

// NftCard Component (copied from NFTView.tsx for use here)
const NftCard: React.FC<{ nft: Asset }> = ({ nft }) => {
    const { formatCurrency } = useCurrency();
    return (
        <Card className="overflow-hidden group transition-all duration-300 hover:border-sky-500/50 hover:-translate-y-1">
            <div className="aspect-square w-full overflow-hidden">
                <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="p-4">
                <p className="text-xs text-slate-400">{nft.collection}</p>
                <h3 className="font-bold text-white truncate">{nft.name}</h3>
                <div className="flex justify-between items-center mt-3">
                    <div>
                        <p className="text-xs text-slate-500">Floor Price</p>
                        <p className="font-semibold text-sky-400"><span className="blur-balance">{formatCurrency(nft.floorPrice || 0)}</span></p>
                    </div>
                     <a href="#" onClick={e => e.preventDefault()} className="text-xs font-semibold bg-slate-700/80 hover:bg-sky-600 text-white py-1.5 px-3 rounded-full transition-colors">
                        View
                    </a>
                </div>
            </div>
        </Card>
    );
};


const assetCategories = [
  { label: 'All', key: 'all' },
  { label: 'Crypto Staking', key: 'staking' },
  { label: 'Stock Staking', key: 'stock' },
  { label: 'NFT', key: 'nft' },
  { label: 'REITs', key: 'reits' },
  { label: 'Spectrum Equity Plans', key: 'spectrum' },
];

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            isActive 
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20' 
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
        }`}
    >
        {label}
    </button>
);

const StatCard: React.FC<{ title: string; value: string; Icon: React.FC<any>; colorClass: string }> = ({ title, value, Icon, colorClass }) => (
    <Card className="p-5 flex items-start gap-4">
        <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700">
            <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white tracking-tight"><span className="blur-balance">{value}</span></p>
        </div>
    </Card>
);

const InvestmentSummary: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    const { formatCurrency } = useCurrency();

    const summary = useMemo(() => {
        const investmentAssets = assets.filter(a => a.type !== AssetType.CASH);
        const totalInvested = investmentAssets.reduce((sum, a) => sum + (a.initialInvestment || 0), 0);
        const totalEarnings = investmentAssets.reduce((sum, a) => sum + (a.totalEarnings || 0), 0);
        const netROI = totalInvested > 0 ? (totalEarnings / totalInvested) * 100 : 0;
        return { totalInvested, totalEarnings, netROI };
    }, [assets]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="Total Invested" 
                value={formatCurrency(summary.totalInvested)}
                Icon={InvestmentsIcon}
                colorClass="text-sky-400"
            />
            <StatCard 
                title="Total Earned" 
                value={formatCurrency(summary.totalEarnings)}
                Icon={UsdIcon}
                colorClass="text-emerald-400"
            />
            <StatCard 
                title="Net ROI" 
                value={`${summary.netROI.toFixed(2)}%`}
                Icon={TrendingUpIcon}
                colorClass="text-amber-400"
            />
        </div>
    );
};

type SortKey = 'name' | 'type' | 'balance' | 'valueUSD' | 'change24h' | 'allocation';

interface InvestmentsViewProps {
    assets: Asset[];
    onTradeClick: (ticker: string) => void;
    onInvest: (plan: InvestmentPlan, amount: number) => void;
    cashBalance: number;
    onViewInvestment: (asset: Asset) => void;
    onReinvest: (assetId: string) => void;
    onTransferToMain: (assetId: string) => void;
    onStake: (plan: StakableAsset, amount: number, duration: number, payoutDestination: 'wallet' | 'balance') => void;
    onRequestStakeWithdrawal: (assetId: string) => void;
    onReStake: (oldAsset: Asset, newAmount: number, newDuration: number, newDestination: 'wallet' | 'balance') => void;
    reitProperties: REITProperty[];
    onReitInvest: (property: REITProperty, amount: number) => void;
    stakableStocks: StakableStock[];
    onStockStake: (stock: StakableStock, amount: number) => void;
}

const InvestmentsView: React.FC<InvestmentsViewProps> = (props) => {
    const { assets, onInvest, cashBalance, onViewInvestment, onReinvest, onTransferToMain, onStake, onRequestStakeWithdrawal, onReStake, reitProperties, onReitInvest, stakableStocks, onStockStake } = props;
    const [activeTab, setActiveTab] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: 'asc' | 'desc' } | null>({ key: 'valueUSD', order: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const { formatCurrency, currency } = useCurrency();
    
    const nftAssets = useMemo(() => assets.filter(a => a.type === AssetType.NFT), [assets]);

    const handleSort = (key: SortKey) => {
        let order: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.order === 'asc') {
            order = 'desc';
        }
        setSortConfig({ key, order });
    };

    const sortedAndFilteredAssets = useMemo(() => {
        let filteredAssets = assets.filter(a => a.type !== AssetType.CASH);

        if (activeTab === 'nft') {
            filteredAssets = filteredAssets.filter(asset => asset.type === AssetType.NFT);
        }

        if (searchTerm.trim() !== '') {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredAssets = filteredAssets.filter(asset =>
                asset.name.toLowerCase().includes(lowercasedFilter) ||
                asset.ticker.toLowerCase().includes(lowercasedFilter) ||
                asset.collection?.toLowerCase().includes(lowercasedFilter)
            );
        }

        if (sortConfig) {
            filteredAssets.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    if (aValue < bValue) return sortConfig.order === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.order === 'asc' ? 1 : -1;
                    return 0;
                }
                
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    if (sortConfig.order === 'asc') {
                        return aValue.localeCompare(bValue);
                    }
                    return bValue.localeCompare(aValue);
                }

                return 0;
            });
        }

        return filteredAssets;
    }, [assets, activeTab, sortConfig, searchTerm]);

    const headers: { label: string; key?: SortKey; align?: 'left' | 'right' }[] = [
        { label: 'Asset', key: 'name', align: 'left' },
        { label: `Value (${currency})`, key: 'valueUSD', align: 'right' },
        { label: '24h Change', key: 'change24h', align: 'right' },
        { label: 'Allocation', key: 'allocation', align: 'left' },
        { label: 'Actions', align: 'right'},
    ];

    const renderPortfolioTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-900/40">
                    <tr>
                        {headers.map(header => (
                            <th 
                                key={header.label} 
                                className={`p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider transition-colors ${header.align === 'right' ? 'text-right' : 'text-left'} ${sortConfig?.key === header.key ? 'bg-slate-800/50' : ''}`}
                                onClick={() => header.key && handleSort(header.key)}
                            >
                                <div className={`flex items-center gap-1.5 ${header.key ? 'cursor-pointer hover:text-white' : ''} ${header.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                                    {header.label}
                                    {header.key && (
                                        <ArrowUpDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${sortConfig?.key === header.key ? 'text-white opacity-100' : 'opacity-50'} ${sortConfig?.key === header.key && sortConfig.order === 'desc' ? 'rotate-180' : ''}`} />
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-300/10">
                    {sortedAndFilteredAssets.map(asset => (
                        <tr key={asset.id} onClick={() => onViewInvestment(asset)} className="hover:bg-slate-800/40 transition-colors group cursor-pointer">
                            <td className="p-4">
                                <div className="flex items-center gap-4">
                                    {asset.imageUrl ? (
                                        <img src={asset.imageUrl} alt={asset.name} className="w-10 h-10 rounded-md object-cover group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <asset.Icon className="w-10 h-10 group-hover:scale-110 transition-transform" />
                                    )}
                                    <div>
                                        <p className="font-semibold text-white">{asset.name}</p>
                                        <p className="text-sm text-slate-400">{asset.collection || asset.ticker}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 font-mono text-white font-semibold text-right"><span className="blur-balance">{formatCurrency(asset.valueUSD)}</span></td>
                            <td className={`p-4 font-semibold text-right ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                            </td>
                            <td className="p-4 min-w-[150px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-sky-600 to-cyan-400 h-2 rounded-full" style={{ width: `${asset.allocation}%` }}></div>
                                    </div>
                                    <span className="text-sm text-slate-300 w-12 text-right">{asset.allocation.toFixed(1)}%</span>
                                </div>
                            </td>
                            <td className="p-4 text-right">
                               <ActionsDropdown 
                                 asset={asset} 
                                 onViewHistory={() => onViewInvestment(asset)}
                                 onReinvest={() => onReinvest(asset.id)}
                                 onTransferToMain={() => onTransferToMain(asset.id)}
                               />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
             {sortedAndFilteredAssets.length === 0 && (
                <div className="text-center py-16">
                    <h3 className="text-lg font-semibold text-white">No Assets Found</h3>
                    <p className="text-slate-400 mt-1">Try adjusting your category or search term.</p>
                </div>
            )}
        </div>
    );
    
    const { title, description } = useMemo(() => {
        switch (activeTab) {
            case 'spectrum': return { title: 'Spectrum Equity Plans', description: 'Choose an investment plan that suits you.' };
            case 'staking': return { title: 'Crypto Staking', description: 'Earn passive income by securing networks.' };
            case 'stock': return { title: 'High-Yield Stock Staking', description: 'Stake in top global companies and earn monthly returns.' };
            case 'reits': return { title: 'Real Estate Investment Trusts', description: 'Invest in fractional ownership of high-yield properties.' };
            case 'all': return { title: 'All Investment Modules', description: 'An overview of your holdings and available investment opportunities.' };
            default: return { title: 'My Portfolio Holdings', description: 'Browse and manage your diverse assets.' };
        }
    }, [activeTab]);

    return (
        <div className="p-6 lg:p-8 space-y-8 view-container">
            <InvestmentSummary assets={assets} />
            <Card className="overflow-hidden">
                <div className="p-6 border-b border-slate-300/10">
                     <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                     <p className="text-slate-400 mt-1">{description}</p>
                </div>

                <div className="p-4 border-b border-slate-300/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                        {assetCategories.map(cat => (
                            <TabButton 
                                key={cat.key}
                                label={cat.label}
                                isActive={activeTab === cat.key}
                                onClick={() => setActiveTab(cat.key)}
                            />
                        ))}
                    </div>
                    {activeTab !== 'spectrum' && activeTab !== 'staking' && activeTab !== 'reits' && activeTab !== 'stock' && (
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Filter by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-800/60 border border-slate-700 rounded-lg py-2 pl-10 pr-4 w-64 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/80 transition-all"
                            />
                        </div>
                    )}
                </div>
                
                {activeTab === 'all' && (
                    <>
                        <div className="p-6 border-b border-slate-300/10">
                             <h3 className="text-xl font-bold text-white tracking-tight">My Portfolio Holdings</h3>
                        </div>
                        {renderPortfolioTable()}
                        <div className="p-6 border-t border-slate-300/10">
                            <h3 className="text-xl font-bold text-white tracking-tight">Spectrum Equity Plans</h3>
                            <p className="text-slate-400 mt-1">Choose an investment plan that suits you.</p>
                        </div>
                        <div className="p-6">
                            <SpectrumPlansView onInvest={onInvest} cashBalance={cashBalance} />
                        </div>
                        <div className="p-6 border-t border-slate-300/10">
                            <h3 className="text-xl font-bold text-white tracking-tight">Crypto Staking</h3>
                            <p className="text-slate-400 mt-1">Earn passive income by securing networks.</p>
                        </div>
                        <div className="p-6">
                            <StakingView
                                assets={assets}
                                cashBalance={cashBalance}
                                onStake={onStake}
                                onRequestWithdrawal={onRequestStakeWithdrawal}
                                onReStake={onReStake}
                            />
                        </div>
                        <div className="p-6 border-t border-slate-300/10">
                            <h3 className="text-xl font-bold text-white tracking-tight">Real Estate Investment Trusts (REITs)</h3>
                            <p className="text-slate-400 mt-1">Invest in fractional ownership of high-yield properties.</p>
                        </div>
                        <REITsView 
                            reitProperties={reitProperties}
                            userAssets={assets}
                            cashBalance={cashBalance}
                            onInvest={onReitInvest}
                        />
                        <div className="p-6 border-t border-slate-300/10">
                            <h3 className="text-xl font-bold text-white tracking-tight">My NFT Gallery</h3>
                            <p className="text-slate-400 mt-1">A preview of your digital collectibles.</p>
                        </div>
                        <div className="p-6">
                            {nftAssets.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                   {nftAssets.map(nft => <NftCard key={nft.id} nft={nft} />)}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    You don't own any NFTs yet.
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'nft' && renderPortfolioTable()}
                
                {activeTab === 'spectrum' && (
                    <div className="p-0">
                        <SpectrumPlansView onInvest={onInvest} cashBalance={cashBalance} />
                    </div>
                )}

                {activeTab === 'staking' && (
                    <div className="p-6">
                        <StakingView
                            assets={assets}
                            cashBalance={cashBalance}
                            onStake={onStake}
                            onRequestWithdrawal={onRequestStakeWithdrawal}
                            onReStake={onReStake}
                        />
                    </div>
                )}
                
                {activeTab === 'stock' && (
                    <StockStakingView
                        stakableStocks={stakableStocks}
                        userStakedStocks={assets.filter(a => a.stockStakeDetails)}
                        cashBalance={cashBalance}
                        onStake={onStockStake}
                        onManage={() => {}}
                    />
                )}

                {activeTab === 'reits' && (
                    <REITsView 
                        reitProperties={reitProperties}
                        userAssets={assets}
                        cashBalance={cashBalance}
                        onInvest={onReitInvest}
                    />
                )}
            </Card>
        </div>
    );
};

export default InvestmentsView;