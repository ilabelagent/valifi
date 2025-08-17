import React, { useState, useMemo } from 'react';
import type { Asset, StakableStock } from '../types';
import { useCurrency } from './CurrencyContext';
import { SearchIcon, ChevronDownIcon, FilterIcon, TrendingUpIcon } from './icons';
import StockStakeModal from './StockStakeModal';
import ManageStockStakeModal from './ManageStockStakeModal';

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
        {children}
    </div>
);

const StockCard: React.FC<{ stock: StakableStock; onStake: () => void; onManage: () => void; userStake: Asset | undefined }> = ({ stock, onStake, onManage, userStake }) => {
    const { formatCurrency } = useCurrency();
    const isStaked = !!userStake;

    return (
        <Card className="flex flex-col overflow-hidden group transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <stock.logo className="w-10 h-10 rounded-full" />
                        <div>
                            <h3 className="font-bold text-foreground truncate">{stock.name}</h3>
                            <p className="text-sm text-muted-foreground">{stock.ticker}</p>
                        </div>
                    </div>
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stock.status === 'Available' ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground'}`}>
                        {stock.status}
                    </span>
                </div>
                <div className="flex justify-between items-baseline mt-4">
                    <p className="text-2xl font-semibold text-foreground">{formatCurrency(stock.price)}</p>
                    <p className={`font-semibold ${stock.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>{stock.change24h.toFixed(2)}%</p>
                </div>
                 <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Pool Size</span>
                        <span>{stock.poolSize}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${stock.poolSize}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="p-4 mt-auto border-t border-border">
                <button 
                    onClick={isStaked ? onManage : onStake}
                    disabled={!isStaked && stock.status === 'Fully Staked'}
                    className={`w-full font-bold py-2 px-4 rounded-lg transition-colors text-white ${isStaked ? 'bg-primary hover:bg-primary/90' : 'bg-primary hover:bg-primary/90'} disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed`}
                >
                    {isStaked ? 'Manage Stake' : 'Stake Now'}
                </button>
            </div>
        </Card>
    );
};

const LeaderboardItem: React.FC<{ stock: StakableStock, rank: number }> = ({ stock, rank }) => (
    <li className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
        <div className="flex items-center gap-3">
            <span className="font-mono text-muted-foreground text-sm w-5">{rank}.</span>
            <stock.logo className="w-8 h-8 rounded-full" />
            <div>
                <p className="font-semibold text-foreground text-sm">{stock.ticker}</p>
                <p className="text-xs text-muted-foreground">{stock.sector}</p>
            </div>
        </div>
        <div className="text-right">
             <p className={`font-semibold text-sm ${stock.change24h >= 0 ? 'text-success' : 'text-destructive'}`}>{stock.change24h.toFixed(2)}%</p>
             <p className="text-xs text-muted-foreground">Pool: {stock.poolSize}%</p>
        </div>
    </li>
);

interface StockStakingViewProps {
    stakableStocks: StakableStock[];
    userStakedStocks: Asset[];
    cashBalance: number;
    onStake: (stock: StakableStock, amount: number) => void;
    onManage: (asset: Asset) => void;
}

const StockStakingView: React.FC<StockStakingViewProps> = ({ stakableStocks, userStakedStocks, cashBalance, onStake }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sectorFilter, setSectorFilter] = useState('All');
    const [sortBy, setSortBy] = useState('poolSize');
    const [stakeModalStock, setStakeModalStock] = useState<StakableStock | null>(null);
    const [manageModalAsset, setManageModalAsset] = useState<Asset | null>(null);
    
    const sectors = useMemo(() => ['All', ...Array.from(new Set(stakableStocks.map(s => s.sector)))], [stakableStocks]);
    
    const filteredAndSortedStocks = useMemo(() => {
        return stakableStocks
            .filter(s => 
                (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.ticker.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (sectorFilter === 'All' || s.sector === sectorFilter)
            )
            .sort((a, b) => {
                switch (sortBy) {
                    case 'name': return a.name.localeCompare(b.name);
                    case 'price': return b.price - a.price;
                    case 'change24h': return b.change24h - a.change24h;
                    default: return b.poolSize - a.poolSize; // poolSize is default
                }
            });
    }, [stakableStocks, searchTerm, sectorFilter, sortBy]);

    const leaderboardStocks = useMemo(() => [...stakableStocks].sort((a,b) => b.poolSize - a.poolSize).slice(0, 10), [stakableStocks]);
    
    const selectClass = "w-full bg-secondary border border-border rounded-lg py-2 pl-4 pr-8 text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none";

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <Card>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input type="text" placeholder="Search stocks..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-input border border-border rounded-lg py-2 pl-10 pr-4 text-foreground"/>
                            </div>
                             <div className="relative">
                                <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)} className={`${selectClass} pl-10`}>
                                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                             </div>
                             <div className="relative">
                                <TrendingUpIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={`${selectClass} pl-10`}>
                                    <option value="poolSize">Sort by Popularity</option>
                                    <option value="name">Sort by Name</option>
                                    <option value="price">Sort by Price</option>
                                    <option value="change24h">Sort by 24h Change</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 max-h-[1000px] overflow-y-auto">
                            {filteredAndSortedStocks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredAndSortedStocks.map(stock => {
                                        const userStake = userStakedStocks.find(s => s.ticker === stock.ticker);
                                        return (
                                            <StockCard 
                                                key={stock.id}
                                                stock={stock}
                                                userStake={userStake}
                                                onStake={() => setStakeModalStock(stock)}
                                                onManage={() => setManageModalAsset(userStake!)}
                                            />
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground">
                                    <p>No stocks match your criteria.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                     <Card>
                        <div className="p-4 border-b border-border">
                            <h3 className="font-semibold text-foreground text-center">🏆 Staking Leaderboard</h3>
                        </div>
                        <ul className="p-2 space-y-1">
                            {leaderboardStocks.map((stock, idx) => <LeaderboardItem key={stock.id} stock={stock} rank={idx+1}/>)}
                        </ul>
                     </Card>
                </div>
            </div>

            {stakeModalStock && (
                <StockStakeModal 
                    isOpen={!!stakeModalStock}
                    onClose={() => setStakeModalStock(null)}
                    stock={stakeModalStock}
                    cashBalance={cashBalance}
                    onConfirm={(stock, amount) => {
                        onStake(stock, amount);
                        setStakeModalStock(null);
                    }}
                />
            )}
             {manageModalAsset && (
                <ManageStockStakeModal 
                    isOpen={!!manageModalAsset}
                    onClose={() => setManageModalAsset(null)}
                    stakedAsset={manageModalAsset}
                />
            )}
        </div>
    );
};

export default StockStakingView;