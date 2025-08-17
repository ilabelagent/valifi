import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Asset } from '../types';
import { AssetType } from '../types';
import { SwapIcon, ArrowDownIcon, ChevronDownIcon } from './icons';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

interface AssetInputProps {
    label: string;
    assets: Asset[];
    selectedAsset: Asset | undefined;
    onSelectAsset: (asset: Asset) => void;
    amount: string;
    onAmountChange: (amount: string) => void;
    isReadOnly?: boolean;
}

const AssetInput: React.FC<AssetInputProps> = ({ label, assets, selectedAsset, onSelectAsset, amount, onAmountChange, isReadOnly = false }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="bg-secondary p-4 rounded-xl border border-border">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">{label}</span>
                {selectedAsset && !isReadOnly && (
                    <button type="button" onClick={() => onAmountChange(selectedAsset.balance.toString())} className="text-sm text-primary hover:text-primary/80 transition-colors">
                        Balance: {selectedAsset.balance.toFixed(4)}
                    </button>
                )}
            </div>
            <div className="flex items-center gap-4">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    readOnly={isReadOnly}
                    placeholder="0.0"
                    className="w-full text-4xl font-light bg-transparent text-foreground focus:outline-none"
                    aria-label={`${label} amount`}
                />
                <div className="relative" ref={dropdownRef}>
                     <button type="button" onClick={() => setDropdownOpen(prev => !prev)} className="flex items-center gap-2 bg-background hover:bg-accent p-2 rounded-lg font-semibold transition-colors border border-border">
                        {selectedAsset && <selectedAsset.Icon className="w-7 h-7" />}
                        <span className="text-lg text-foreground">{selectedAsset?.ticker}</span>
                        <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
                     </button>
                     {isDropdownOpen && (
                         <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg p-1 z-10">
                             {assets.map(asset => (
                                 <a href="#" key={asset.ticker} onClick={(e) => { e.preventDefault(); onSelectAsset(asset); setDropdownOpen(false); }} className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10 w-full text-left">
                                     <asset.Icon className="w-6 h-6" />
                                     <span className="font-semibold text-popover-foreground">{asset.ticker}</span>
                                 </a>
                             ))}
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
}

interface ExchangeViewProps {
    assets: Asset[];
    onSwap: (fromTicker: string, toTicker: string, amount: number) => void;
    defaultFromAssetTicker?: string;
    setExchangeDefaultAssetTicker: (ticker: string | undefined) => void;
}

const ExchangeView: React.FC<ExchangeViewProps> = ({ assets, onSwap, defaultFromAssetTicker, setExchangeDefaultAssetTicker }) => {
    const tradeableAssets = useMemo(() => assets.filter(a => a.type === AssetType.CRYPTO || a.type === AssetType.CASH), [assets]);
    const fromAssets = useMemo(() => tradeableAssets.filter(a => a.balance > 0), [tradeableAssets]);

    const [fromAsset, setFromAsset] = useState<Asset | undefined>(fromAssets.find(a => a.ticker === 'BTC') || fromAssets[0]);
    const [toAsset, setToAsset] = useState<Asset | undefined>(tradeableAssets.find(a => a.ticker === 'ETH'));
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [isSwapping, setIsSwapping] = useState(false);
    
    const toAssets = useMemo(() => tradeableAssets.filter(a => a.ticker !== fromAsset?.ticker), [tradeableAssets, fromAsset]);

    const exchangeRate = useMemo(() => {
        if (!fromAsset || !toAsset) return 0;
        const fromPrice = fromAsset.balance > 0 ? fromAsset.valueUSD / fromAsset.balance : 0;
        const toPrice = toAsset.balance > 0 ? toAsset.valueUSD / toAsset.balance : (assets.find(a => a.ticker === toAsset.ticker)?.valueUSD ?? 1);
        if (fromPrice === 0 || toPrice === 0) return 0;
        return fromPrice / toPrice;
    }, [fromAsset, toAsset, assets]);
    
    useEffect(() => {
        if (defaultFromAssetTicker && setExchangeDefaultAssetTicker) {
            const newFromAsset = fromAssets.find(a => a.ticker === defaultFromAssetTicker);
            if (newFromAsset) {
                setFromAsset(newFromAsset);
            }
            setExchangeDefaultAssetTicker(undefined);
        }
    }, [defaultFromAssetTicker, setExchangeDefaultAssetTicker, fromAssets]);

    useEffect(() => {
        if (fromAmount && exchangeRate > 0) {
            const fee = 0.001; // 0.1% simulated fee
            const calculatedToAmount = parseFloat(fromAmount) * exchangeRate * (1 - fee);
            setToAmount(calculatedToAmount.toFixed(6));
        } else {
            setToAmount('');
        }
    }, [fromAmount, exchangeRate]);
    
    useEffect(() => {
        if (fromAsset?.ticker === toAsset?.ticker) {
            setToAsset(toAssets[0]);
        }
    }, [fromAsset, toAsset, toAssets]);

    const handleSwapAssets = () => {
        if (!fromAsset || !toAsset) return;
        setIsSwapping(true);
        const tempFromAsset = fromAsset;
        setFromAsset(toAsset);
        setToAsset(tempFromAsset);
        const tempFromAmount = fromAmount;
        setFromAmount(toAmount);
        setToAmount(tempFromAmount);
        setTimeout(() => setIsSwapping(false), 300);
    };

    const handleExecuteSwap = () => {
        if(fromAsset && toAsset && fromAmount) {
            const amount = parseFloat(fromAmount);
            if(amount > 0 && fromAsset.balance >= amount) {
                onSwap(fromAsset.ticker, toAsset.ticker, amount);
                setFromAmount('');
            } else {
                alert("Invalid amount or insufficient balance.");
            }
        }
    }

    if (!fromAsset || !toAsset) {
        return (
            <div className="p-4 lg:p-8 flex justify-center items-center h-full view-container">
                <p>You have no tradeable assets with a balance.</p>
            </div>
        )
    }

    return (
        <div className="p-4 lg:p-8 flex justify-center items-center h-full view-container">
            <div className="w-full max-w-md space-y-4">
                 <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">Instant Swap</h1>
                    <p className="text-muted-foreground mt-2">The easiest way to trade crypto and fiat.</p>
                </div>
                <Card className="p-4 sm:p-6">
                    <div className="space-y-2 relative">
                        <AssetInput 
                            label="From"
                            assets={fromAssets}
                            selectedAsset={fromAsset}
                            onSelectAsset={setFromAsset}
                            amount={fromAmount}
                            onAmountChange={setFromAmount}
                        />
                        
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <button onClick={handleSwapAssets} className="p-2.5 bg-accent rounded-full border-4 border-card hover:bg-primary/20 transition-all group focus:outline-none focus:ring-2 focus:ring-ring">
                                <ArrowDownIcon className={`w-6 h-6 text-primary transition-transform duration-300 ${isSwapping ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                        
                         <AssetInput 
                            label="To"
                            assets={toAssets}
                            selectedAsset={toAsset}
                            onSelectAsset={setToAsset}
                            amount={toAmount}
                            onAmountChange={() => {}} // isReadOnly
                            isReadOnly={true}
                        />
                    </div>
                    
                    {exchangeRate > 0 && fromAsset && toAsset && (
                        <div className="text-center text-muted-foreground mt-4">
                            <p>1 {fromAsset.ticker} ≈ {exchangeRate.toFixed(5)} {toAsset.ticker}</p>
                            <p className="text-xs">Fee: ~0.1%</p>
                        </div>
                    )}

                    <div className="mt-6">
                        <button 
                            onClick={handleExecuteSwap} 
                            disabled={!fromAmount || parseFloat(fromAmount) <= 0 || parseFloat(fromAmount) > (fromAsset?.balance || 0)}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-6 rounded-lg transition-colors text-lg shadow-sm disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                        >
                            <SwapIcon className="w-6 h-6" />
                            <span>Swap</span>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ExchangeView;