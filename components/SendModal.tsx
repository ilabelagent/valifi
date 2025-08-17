import React, { useState, useMemo, useEffect } from 'react';
import { useCurrency } from './CurrencyContext';
import type { HybridWalletAsset } from '../types';
import { CloseIcon, AlertTriangleIcon, ArrowLeftIcon } from './icons';
import { CRYPTO_CONFIG } from './crypto.config';

const SendModal: React.FC<{ asset: HybridWalletAsset, onSend: (assetTicker: string, amountCrypto: number, amountUSD: number, txHash: string) => void, onClose: () => void }> = ({ asset, onSend, onClose }) => {
    const [step, setStep] = useState(1); // 1: Form, 2: Review
    const [network, setNetwork] = useState(asset.networks[0]);
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const { formatCurrency } = useCurrency();

    const numericAmount = parseFloat(amount);
    const assetValueUSD = isNaN(numericAmount) ? 0 : numericAmount * (asset.valueUSD / (asset.balance || 1));

    const currentNetworkConfig = useMemo(() => {
      const coin = asset.ticker as keyof typeof CRYPTO_CONFIG;
      if (CRYPTO_CONFIG[coin]) {
        return CRYPTO_CONFIG[coin].networks[network];
      }
      return null;
    }, [asset.ticker, network]);
    
    const gasFee = useMemo(() => (Math.random() * 5 + 2), [network]); // Mock gas fee in USD

    const validateAddress = (addr: string) => {
        if (!currentNetworkConfig) return true; // No validation if config is missing
        if (!currentNetworkConfig.validationRegex.test(addr)) {
            setError(`Invalid ${network} address format.`);
            return false;
        }
        setError('');
        return true;
    };
    
    useEffect(() => {
        if (address) validateAddress(address);
    }, [network, address, currentNetworkConfig]);


    const handleNextStep = () => {
        setError('');
        if (!validateAddress(address)) return;
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (numericAmount > asset.balance) {
            setError('Amount exceeds available balance.');
            return;
        }
        setStep(2);
    };

    const handleConfirmSend = () => {
        const txHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
        onSend(asset.ticker, numericAmount, assetValueUSD, txHash);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center p-6 border-b border-border">
                    {step === 2 && (
                        <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground mr-4">
                            <ArrowLeftIcon className="w-6 h-6"/>
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-card-foreground">{step === 1 ? `Send ${asset.name}` : 'Review Transaction'}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-auto"><CloseIcon className="w-6 h-6"/></button>
                </div>

                {step === 1 ? (
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Recipient Address</label>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} onBlur={e => validateAddress(e.target.value)} placeholder={`Enter ${asset.ticker} address`} className="w-full bg-input p-3 rounded-lg text-foreground font-mono text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Network</label>
                            <select value={network} onChange={e => setNetwork(e.target.value)} className="w-full bg-input p-3 rounded-lg text-foreground">
                                {asset.networks.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Amount</label>
                            <div className="relative">
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-input p-3 rounded-lg text-foreground" />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <span className="text-muted-foreground">{asset.ticker}</span>
                                    <button onClick={() => setAmount(asset.balance.toString())} className="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded">MAX</button>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Available: {asset.balance.toFixed(6)} {asset.ticker} ({formatCurrency(asset.valueUSD)})</p>
                        </div>
                         {error && <p className="text-destructive text-sm text-center">{error}</p>}
                        <button onClick={handleNextStep} disabled={!!error || !amount || !address} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg disabled:bg-muted disabled:text-muted-foreground">Next</button>
                    </div>
                ) : (
                    <div className="p-6 space-y-4">
                        <div className="bg-secondary p-4 rounded-lg space-y-3">
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sending:</span><span className="font-bold text-foreground">{numericAmount.toFixed(6)} {asset.ticker}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Value (USD):</span><span className="font-bold text-foreground">{formatCurrency(assetValueUSD)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">To Address:</span><span className="font-mono text-xs text-foreground truncate max-w-[180px]">{address}</span></div>
                             <div className="flex justify-between text-sm"><span className="text-muted-foreground">Network:</span><span className="font-bold text-foreground">{network}</span></div>
                        </div>
                         <div className="bg-secondary p-4 rounded-lg space-y-3">
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Est. Network Fee:</span><span className="font-bold text-foreground">{formatCurrency(gasFee)}</span></div>
                            <div className="flex justify-between text-lg"><span className="text-muted-foreground">Total:</span><span className="font-bold text-primary">{formatCurrency(assetValueUSD + gasFee)}</span></div>
                        </div>
                         <div className="text-xs p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex gap-2">
                             <AlertTriangleIcon className="w-8 h-4 flex-shrink-0" />
                            Transactions are irreversible. Please ensure all details are correct before confirming.
                         </div>
                        <button onClick={handleConfirmSend} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-lg">Confirm & Send</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SendModal;
