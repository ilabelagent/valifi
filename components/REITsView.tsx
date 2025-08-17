import React, { useState, useMemo } from 'react';
import type { REITProperty, Asset } from '../types';
import { AssetType } from '../types';
import { useCurrency } from './CurrencyContext';
import { SearchIcon, ChevronDownIcon, HomeIcon, LocationIcon } from './icons';
import REITInvestmentModal from './REITInvestmentModal';
import REITManageModal from './REITManageModal';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

const PropertyCard: React.FC<{ property: REITProperty; onInvest: () => void; onManage: () => void; hasInvested: boolean }> = ({ property, onInvest, onManage, hasInvested }) => {
    const { formatCurrency } = useCurrency();
    const sharesRemaining = property.totalShares - property.sharesSold;
    const progress = (property.sharesSold / property.totalShares) * 100;

    return (
        <Card className="flex flex-col overflow-hidden group transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
            <div className="aspect-video w-full overflow-hidden relative">
                <img src={property.imageUrl} alt={property.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full text-white ${property.status === 'Open for Shares' ? 'bg-success/80' : 'bg-muted/80'}`}>
                    {property.status}
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-lg text-foreground truncate">{property.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <LocationIcon className="w-4 h-4 flex-shrink-0" />
                    {property.address}
                </p>
                
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly ROI</span>
                        <span className="font-semibold text-success">{property.monthlyROI.toFixed(2)}%</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Investment Range</span>
                        <span className="font-semibold text-foreground">{formatCurrency(property.investmentRange.min)} - {formatCurrency(property.investmentRange.max)}</span>
                    </div>
                </div>
                
                <div className="mt-4 flex-grow">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Shares Remaining</span>
                        <span>{Math.round(sharesRemaining)} / {property.totalShares}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button 
                        onClick={onInvest}
                        disabled={property.status === 'Fully Funded'}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed">
                        Invest Now
                    </button>
                    {hasInvested && (
                         <button onClick={onManage} className="w-full bg-secondary hover:bg-accent text-secondary-foreground font-semibold py-2 px-4 rounded-lg transition-colors">
                            Manage
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};


interface REITsViewProps {
    reitProperties: REITProperty[];
    userAssets: Asset[];
    cashBalance: number;
    onInvest: (property: REITProperty, amount: number) => void;
}

const REITsView: React.FC<REITsViewProps> = ({ reitProperties, userAssets, cashBalance, onInvest }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('roi');
    const [selectedProperty, setSelectedProperty] = useState<REITProperty | null>(null);
    const [manageAsset, setManageAsset] = useState<Asset | null>(null);

    const userReitInvestments = useMemo(() => userAssets.filter(a => a.type === AssetType.REIT), [userAssets]);

    const filteredAndSorted = useMemo(() => {
        return reitProperties
            .filter(p => {
                const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.address.toLowerCase().includes(searchTerm.toLowerCase());
                const statusMatch = statusFilter === 'All' || p.status === statusFilter;
                return searchMatch && statusMatch;
            })
            .sort((a, b) => {
                switch(sortBy) {
                    case 'roi': return b.monthlyROI - a.monthlyROI;
                    case 'availability': return (b.totalShares - b.sharesSold) - (a.totalShares - a.sharesSold);
                    case 'name': return a.name.localeCompare(b.name);
                    default: return 0;
                }
            });
    }, [reitProperties, searchTerm, statusFilter, sortBy]);

    const selectClass = "w-full bg-secondary border border-border rounded-lg py-2 pl-4 pr-8 text-foreground focus:outline-none focus:ring-1 focus:ring-ring appearance-none";

    const handleManageClick = (propertyId: string) => {
        const assetToManage = userReitInvestments.find(a => a.reitDetails?.propertyId === propertyId);
        if (assetToManage) {
            setManageAsset(assetToManage);
        }
    };
    
    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="relative md:col-span-2">
                    <label className="text-xs text-muted-foreground block mb-1">Search Property</label>
                    <SearchIcon className="absolute left-3 top-9 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Name or Location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${selectClass} pl-10`}
                    />
                </div>
                <div>
                    <label className="text-xs text-muted-foreground block mb-1">Status</label>
                    <div className="relative">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClass}>
                            <option value="All">All Statuses</option>
                            <option value="Open for Shares">Open for Shares</option>
                            <option value="Fully Funded">Fully Funded</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
                 <div>
                    <label className="text-xs text-muted-foreground block mb-1">Sort By</label>
                    <div className="relative">
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectClass}>
                           <option value="roi">Highest ROI</option>
                           <option value="availability">Most Available</option>
                           <option value="name">Alphabetical</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {filteredAndSorted.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSorted.map(prop => {
                        const hasInvested = userReitInvestments.some(a => a.reitDetails?.propertyId === prop.id);
                        return (
                             <PropertyCard 
                                key={prop.id} 
                                property={prop} 
                                onInvest={() => setSelectedProperty(prop)}
                                onManage={() => handleManageClick(prop.id)}
                                hasInvested={hasInvested}
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-16">
                    <HomeIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold text-foreground mt-4">No Properties Found</h3>
                    <p className="text-muted-foreground mt-1">Try adjusting your filters or search term.</p>
                </div>
            )}
            
            {selectedProperty && (
                <REITInvestmentModal
                    isOpen={!!selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    property={selectedProperty}
                    cashBalance={cashBalance}
                    onConfirm={(amount) => {
                        onInvest(selectedProperty, amount);
                        setSelectedProperty(null);
                    }}
                />
            )}

            {manageAsset && (
                <REITManageModal
                    isOpen={!!manageAsset}
                    onClose={() => setManageAsset(null)}
                    asset={manageAsset}
                    property={reitProperties.find(p => p.id === manageAsset.reitDetails?.propertyId)!}
                />
            )}
        </div>
    );
};

export default REITsView;