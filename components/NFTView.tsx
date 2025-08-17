import React, { useState, useMemo } from 'react';
import type { Asset } from '../types';
import { NftIcon, SearchIcon, ChevronDownIcon } from './icons';
import { useCurrency } from './CurrencyContext';

// Reusable Card Component
const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-slate-900/50 backdrop-blur-lg border border-slate-300/10 rounded-2xl shadow-2xl shadow-black/20 ${className}`}>
      {children}
    </div>
);

// NFT Card Component
const NftCard: React.FC<{ nft: Asset, onManage: (asset: Asset) => void }> = ({ nft, onManage }) => {
    const { formatCurrency } = useCurrency();

    const isStaked = !!nft.stakedShares && nft.stakedShares > 0;
    
    return (
        <Card className="overflow-hidden group transition-all duration-300 hover:border-sky-500/50 hover:-translate-y-1 flex flex-col">
            <div className="aspect-square w-full overflow-hidden relative">
                <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                {isStaked && <div className="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full text-white bg-indigo-600/80">Staked</div>}
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <p className="text-xs text-slate-400">{nft.collection}</p>
                <h3 className="font-bold text-white truncate">{nft.name}</h3>
                
                {nft.isFractional ? (
                    <div className="flex-grow mt-3 space-y-2">
                         <div>
                            <p className="text-xs text-slate-500">My Share Value</p>
                            <p className="font-semibold text-sky-400"><span className="blur-balance">{formatCurrency(nft.valueUSD)}</span></p>
                        </div>
                         <div>
                            <p className="text-xs text-slate-500">Shares Owned</p>
                            <p className="font-semibold text-white">{nft.sharesOwned?.toFixed(2)}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-grow mt-3">
                        <p className="text-xs text-slate-500">Floor Price</p>
                        <p className="font-semibold text-sky-400"><span className="blur-balance">{formatCurrency(nft.floorPrice || 0)}</span></p>
                    </div>
                )}
                
                 <div className="mt-4">
                    <button onClick={() => onManage(nft)} className="w-full text-sm font-semibold bg-slate-700/80 hover:bg-sky-600 text-white py-2 px-3 rounded-full transition-colors">
                        Manage
                    </button>
                 </div>
            </div>
        </Card>
    );
};


// Main View Component
interface NFTViewProps {
    nfts: Asset[];
    onManageClick: (asset: Asset) => void;
}

const NFTView: React.FC<NFTViewProps> = ({ nfts, onManageClick }) => {
    const { formatCurrency } = useCurrency();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'valueUSD' | 'floorPrice' | 'name'>('valueUSD');

    const summary = useMemo(() => {
        const totalValue = nfts.reduce((sum, nft) => sum + nft.valueUSD, 0);
        const collections = new Set(nfts.map(nft => nft.collection));
        return {
            totalValue,
            collectionCount: collections.size,
            totalNFTs: nfts.length,
        };
    }, [nfts]);

    const filteredAndSortedNfts = useMemo(() => {
        return nfts
            .filter(nft => 
                nft.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (nft.collection || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (sortBy === 'name') {
                    return a.name.localeCompare(b.name);
                }
                const aVal = sortBy === 'floorPrice' ? (a.isFractional ? a.floorPrice : a.valueUSD) : a.valueUSD;
                const bVal = sortBy === 'floorPrice' ? (b.isFractional ? b.floorPrice : b.valueUSD) : b.valueUSD;
                return (bVal || 0) - (aVal || 0);
            });
    }, [nfts, searchTerm, sortBy]);
    

    return (
        <div className="p-6 lg:p-8 space-y-8 view-container">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-sky-500/10 p-3 rounded-full border border-sky-500/20">
                        <NftIcon className="w-8 h-8 text-sky-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">NFT Gallery</h1>
                        <p className="text-slate-400 mt-1">Explore and manage your digital collectibles.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card className="p-6">
                    <p className="text-sm text-slate-400">Total NFT Value</p>
                    <p className="text-3xl font-bold text-white mt-1 tracking-tight"><span className="blur-balance">{formatCurrency(summary.totalValue)}</span></p>
                </Card>
                 <Card className="p-6">
                    <p className="text-sm text-slate-400">Collections</p>
                    <p className="text-3xl font-bold text-white mt-1 tracking-tight">{summary.collectionCount}</p>
                </Card>
                 <Card className="p-6">
                    <p className="text-sm text-slate-400">Total Items</p>
                    <p className="text-3xl font-bold text-white mt-1 tracking-tight">{summary.totalNFTs}</p>
                </Card>
            </div>

            <Card>
                <div className="p-4 border-b border-slate-300/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative">
                         <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name or collection..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-800/60 border border-slate-700 rounded-lg py-2 pl-10 pr-4 w-64 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/80 transition-all"
                        />
                    </div>
                     <div className="relative">
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as any)}
                            className="bg-slate-800/60 border border-slate-700 rounded-lg py-2 pl-4 pr-8 text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500/80 appearance-none"
                        >
                            <option value="valueUSD">Sort by My Value</option>
                            <option value="floorPrice">Sort by Floor Price</option>
                            <option value="name">Sort by Name</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                </div>
                <div className="p-6">
                    {filteredAndSortedNfts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                           {filteredAndSortedNfts.map(nft => <NftCard key={nft.id} nft={nft} onManage={onManageClick} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <NftIcon className="w-12 h-12 mx-auto text-slate-600" />
                            <h3 className="text-lg font-semibold text-white mt-4">No NFTs Found</h3>
                            <p className="text-slate-400 mt-1">Your NFT collection is empty, or no items match your search.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default NFTView;