import React, { useState, useEffect } from 'react';
import { useCurrency } from './CurrencyContext';
import type { InvestableNFT } from '../types';
import { CloseIcon } from './icons';

const NFTInvestModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    nft: InvestableNFT;
    cashBalance: number;
    onConfirm: (nft: InvestableNFT, amount: number, paymentMethod: 'funds' | 'btc') => void;
}> = ({ isOpen, onClose, nft, cashBalance, onConfirm }) => {
    const [paymentMethod, setPaymentMethod] = useState<'funds' | 'btc'>('funds');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const { formatCurrency } = useCurrency();

    const sharePrice = nft.floorPrice / nft.totalShares;
    const sharesToBuy = parseFloat(amount) / sharePrice;
    const numAmount = parseFloat(amount);
    const estimatedAnnualReturn = isNaN(numAmount) ? 0 : numAmount * (nft.apyAnnual / 100);

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setError('');
        }
    }, [isOpen]);

    useEffect(() => {
        setError('');
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return;
        if (numAmount < 100) setError('Minimum investment is $100.');
        if (paymentMethod === 'funds' && numAmount > cashBalance) setError('Amount exceeds available funds.');
    }, [amount, cashBalance, paymentMethod]);

    const handleSubmit = () => {
        if (error || !amount) return;
        onConfirm(nft, parseFloat(amount), paymentMethod);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-card-foreground">Invest in {nft.title}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex bg-secondary p-1 rounded-lg"><button onClick={() => setPaymentMethod('funds')} className={`flex-1 p-2 rounded text-sm font-semibold ${paymentMethod === 'funds' ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground'}`}>From Available Funds</button><button onClick={() => setPaymentMethod('btc')} className={`flex-1 p-2 rounded text-sm font-semibold ${paymentMethod === 'btc' ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground'}`}>Via Bitcoin Deposit</button></div>
                    {paymentMethod === 'funds' ? (
                        <>
                            <label className="text-sm text-muted-foreground">Amount to Invest (USD)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 500" className="w-full bg-input p-2 rounded-lg mt-1" />
                            <p className="text-xs text-muted-foreground">Available: {formatCurrency(cashBalance)}</p>
                        </>
                    ) : (
                        <div className="text-center">
                            <p className="text-sm text-card-foreground">Send BTC to the address below for your investment.</p>
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${nft.adminBtcAddress}`} alt="BTC Deposit" className="mx-auto my-2 bg-white p-1 rounded"/>
                            <p className="font-mono text-xs bg-background p-2 rounded">{nft.adminBtcAddress}</p>
                            <label className="text-sm text-muted-foreground mt-2 block">Amount to Invest (USD)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 500" className="w-full bg-input p-2 rounded-lg mt-1" />
                        </div>
                    )}
                    {error && <p className="text-destructive text-sm text-center">{error}</p>}
                    <div className="p-2 bg-secondary rounded-lg text-sm flex justify-between"><span className="text-muted-foreground">Shares to receive:</span> <span className="font-bold text-foreground">{sharesToBuy > 0 ? sharesToBuy.toFixed(4) : '0.00'}</span></div>
                    <div className="p-2 bg-secondary rounded-lg text-sm flex justify-between">
                        <span className="text-muted-foreground">Est. Annual Return (ROI):</span> 
                        <span className="font-bold text-emerald-400">{formatCurrency(estimatedAnnualReturn)} ({nft.apyAnnual}%)</span>
                    </div>
                    <button onClick={handleSubmit} disabled={!!error || !amount} className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-bold py-3 rounded-lg">Confirm Investment</button>
                </div>
            </div>
        </div>
    );
};

export default NFTInvestModal;
