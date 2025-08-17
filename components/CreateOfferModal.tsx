import React, { useState, useMemo, useEffect } from 'react';
import type { Asset, PaymentMethod, TradableAsset } from '../types';
import { CloseIcon, SparklesIcon, AlertTriangleIcon } from './icons';
import MiniRoiChart from './MiniRoiChart';

interface CreateOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    assets: Asset[];
    tradableAssets: TradableAsset[];
    paymentMethods: PaymentMethod[];
    fiatCurrencies: string[];
}

const InputField: React.FC<{ label: string, children: React.ReactNode, balance?: string }> = ({ label, children, balance }) => (
    <div>
        <div className="flex justify-between items-baseline">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
            {balance && <span className="text-xs text-slate-400">{balance}</span>}
        </div>
        {children}
    </div>
);

const PriceTrendChart: React.FC<{ marketPrice: number }> = ({ marketPrice }) => {
    const chartData = useMemo(() => {
        const data = [];
        let price = marketPrice * (1 + (Math.random() - 0.5) * 0.1); // Start with some deviation
        for (let i = 0; i < 30; i++) {
            data.push({ day: i, value: price });
            const change = (Math.random() - 0.49) * (marketPrice * 0.01);
            price += change;
        }
        // Ensure the end is close to the actual market price
        data[29].value = marketPrice;
        return data;
    }, [marketPrice]);

    return <div className="h-20"><MiniRoiChart data={chartData} /></div>;
};

const CreateOfferModal: React.FC<CreateOfferModalProps> = ({ isOpen, onClose, assets, tradableAssets, paymentMethods, fiatCurrencies }) => {
    const [offerType, setOfferType] = useState<'BUY' | 'SELL'>('BUY');
    const [assetTicker, setAssetTicker] = useState('BTC');
    const [fiatCurrency, setFiatCurrency] = useState('USD');
    const [priceType, setPriceType] = useState<'FIXED' | 'FLOATING'>('FIXED');
    const [price, setPrice] = useState('');
    const [floatingMargin, setFloatingMargin] = useState('0');
    const [priceWarning, setPriceWarning] = useState('');
    
    const inputClass = "w-full bg-slate-700/80 border border-slate-600 rounded-lg py-2.5 px-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500";
    
    const marketPrice = useMemo(() => {
        const asset = assets.find(a => a.ticker === assetTicker);
        if (!asset || asset.balance === 0) {
            const prices: Record<string, number> = { BTC: 68000, ETH: 3800, USDT: 1, BNB: 600, SOL: 165, ADA: 0.45, MATIC: 0.7 };
            return prices[assetTicker] || 0;
        }
        return asset.valueUSD / asset.balance;
    }, [assetTicker, assets]);
    
    const userAssetBalance = useMemo(() => {
        return assets.find(a => a.ticker === assetTicker)?.balance || 0;
    }, [assetTicker, assets]);


    useEffect(() => {
        if (priceType !== 'FIXED' || !price) {
            setPriceWarning('');
            return;
        }
        const numericPrice = parseFloat(price);
        const deviation = (numericPrice - marketPrice) / marketPrice;

        if (deviation > 0.10) {
            setPriceWarning(`This price is ${(deviation * 100).toFixed(0)}% above the current market price.`);
        } else if (deviation < -0.10) {
            setPriceWarning(`This price is ${(-deviation * 100).toFixed(0)}% below the current market price.`);
        } else {
            setPriceWarning('');
        }
    }, [price, marketPrice, priceType]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-300/10 rounded-2xl shadow-2xl w-full max-w-2xl m-4 text-white transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-300/10">
                    <h2 className="text-2xl font-bold">Create P2P Offer</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/80"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <form className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="p-4 bg-slate-900/50 rounded-lg space-y-4">
                        <h3 className="font-semibold text-lg text-sky-400">1. Set Offer Type & Price</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="I want to">
                                <div className="flex rounded-md bg-slate-700 p-1">
                                    <button type="button" onClick={() => setOfferType('BUY')} className={`flex-1 p-2 text-sm font-bold rounded ${offerType === 'BUY' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-300 hover:bg-slate-600'}`}>BUY</button>
                                    <button type="button" onClick={() => setOfferType('SELL')} className={`flex-1 p-2 text-sm font-bold rounded ${offerType === 'SELL' ? 'bg-red-600 text-white shadow-md shadow-red-500/20' : 'text-slate-300 hover:bg-slate-600'}`}>SELL</button>
                                </div>
                            </InputField>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Asset">
                                <select value={assetTicker} onChange={e => setAssetTicker(e.target.value)} className={inputClass}>
                                    {tradableAssets.map(a => <option key={a.ticker} value={a.ticker}>{a.name}</option>)}
                                </select>
                            </InputField>
                            <InputField label="With Fiat">
                                <select value={fiatCurrency} onChange={e => setFiatCurrency(e.target.value)} className={inputClass}>
                                    {fiatCurrencies.map(currency => <option key={currency} value={currency}>{currency}</option>)}
                                </select>
                            </InputField>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Price Type">
                                 <select value={priceType} onChange={e => setPriceType(e.target.value as any)} className={inputClass}>
                                    <option value="FIXED">Fixed</option><option value="FLOATING">Floating</option>
                                </select>
                            </InputField>
                             <InputField label={priceType === 'FIXED' ? `Your Price (${fiatCurrency})` : `Floating Margin (%)`}>
                               {priceType === 'FIXED' ? (
                                     <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder={`e.g., ${marketPrice.toFixed(2)}`} className={inputClass}/>
                               ) : (
                                    <input type="number" value={floatingMargin} onChange={e => setFloatingMargin(e.target.value)} placeholder="e.g., 1.5 for 1.5% above market" className={inputClass}/>
                               )}
                            </InputField>
                        </div>
                        <p className="text-xs text-slate-500 text-center">Current Market Price: ~${marketPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                         {priceType === 'FIXED' && <PriceTrendChart marketPrice={marketPrice} />}
                         {priceWarning && (
                            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-900/30 p-3 rounded-md border border-amber-500/30">
                                <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold">AI Price Warning:</span> {priceWarning} Are you sure?
                                </div>
                            </div>
                         )}
                    </div>

                    <div className="p-4 bg-slate-900/50 rounded-lg space-y-4">
                        <h3 className="font-semibold text-lg text-sky-400">2. Set Trade Amount & Limits</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="Total Amount" balance={`Balance: ${userAssetBalance.toFixed(4)} ${assetTicker}`}>
                                <input type="number" placeholder="0.00" className={inputClass}/>
                            </InputField>
                             <InputField label={`Min Limit (${fiatCurrency})`}>
                                <input type="number" placeholder="e.g., 500" className={inputClass}/>
                            </InputField>
                             <InputField label={`Max Limit (${fiatCurrency})`}>
                                <input type="number" placeholder="e.g., 25000" className={inputClass}/>
                            </InputField>
                        </div>
                        <p className="text-xs text-slate-400">Estimated Fee: 0.1% (Maker)</p>
                    </div>
                    
                    <div className="p-4 bg-slate-900/50 rounded-lg space-y-4">
                        <h3 className="font-semibold text-lg text-sky-400">3. Set Payment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <InputField label="Payment Method(s)">
                                <div className="max-h-32 overflow-y-auto space-y-2 p-2 bg-slate-700 rounded-lg border border-slate-600">
                                    {paymentMethods.map(pm => (
                                        <label key={pm.id} className="flex items-center gap-2 p-2 bg-slate-800/70 rounded-md cursor-pointer hover:bg-slate-900/50">
                                            <input type="checkbox" className="w-4 h-4 text-sky-600 bg-slate-900 border-slate-600 rounded focus:ring-sky-500" />
                                            <span>{pm.nickname} ({pm.methodType})</span>
                                        </label>
                                    ))}
                                </div>
                           </InputField>
                           <InputField label="Payment Time Limit">
                                <select className={inputClass}>
                                    <option value="15">15 Minutes</option>
                                    <option value="30">30 Minutes</option>
                                    <option value="45">45 Minutes</option>
                                    <option value="60">1 Hour</option>
                                </select>
                            </InputField>
                        </div>
                         <InputField label="Terms (Optional)">
                            <textarea rows={3} placeholder="Add any additional terms for the trade..." className={inputClass}/>
                        </InputField>
                         <InputField label="Availability (Optional)">
                            <input type="text" placeholder="e.g., Mon-Fri, 9AM - 10PM (Your Timezone)" className={inputClass}/>
                        </InputField>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-300/10">
                        <button type="button" onClick={onClose} className="bg-slate-600/80 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg shadow-md shadow-sky-500/20">Post Offer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOfferModal;
