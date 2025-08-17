import React, { useState, useEffect, useMemo } from 'react';
import type { StakableStock } from '../types';
import { CloseIcon } from './icons';
import { useCurrency } from './CurrencyContext';

interface StockStakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    stock: StakableStock;
    cashBalance: number;
    onConfirm: (stock: StakableStock, amount: number) => void;
}

const getRoiForAmount = (amount: number): number => {
    if (amount >= 50 && amount <= 999) return 7.5;
    if (amount >= 1000 && amount <= 9999) return 10;
    if (amount >= 10000 && amount <= 49999) return 12.5;
    if (amount >= 50000 && amount <= 499999) return 16.2;
    if (amount >= 500000 && amount <= 5000000) return 21.8;
    return 0;
};

const StockStakeModal: React.FC<StockStakeModalProps> = ({ isOpen, onClose, stock, cashBalance, onConfirm }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { formatCurrency } = useCurrency();

    const min = 50;
    const max = 5000000;

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setError('');
            setIsProcessing(false);
        }
    }, [isOpen]);

    useEffect(() => {
        setError('');
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || amount === '') return;
        
        if (numericAmount > cashBalance) {
            setError('Amount exceeds your available portfolio balance.');
        } else if (numericAmount < min) {
            setError(`Minimum stake is ${formatCurrency(min)}.`);
        } else if (numericAmount > max) {
            setError(`Maximum stake is ${formatCurrency(max)}.`);
        }
    }, [amount, cashBalance, min, max, formatCurrency]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (error || !amount) return;

        setIsProcessing(true);
        const numericAmount = parseFloat(amount);
        
        setTimeout(() => {
            onConfirm(stock, numericAmount);
            setIsProcessing(false);
        }, 1500);
    };

    if (!isOpen) return null;

    const monthlyROI = getRoiForAmount(parseFloat(amount));
    const monthlyReturn = (parseFloat(amount) || 0) * (monthlyROI / 100);
    const isButtonDisabled = isProcessing || !!error || !amount || parseFloat(amount) <= 0;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-popover border border-border rounded-2xl w-full max-w-lg text-popover-foreground" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold">Stake {stock.name}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-popover-foreground p-2 rounded-full hover:bg-accent"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                     <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg border border-border">
                        <stock.logo className="w-16 h-16 rounded-full"/>
                        <div>
                            <p className="font-semibold text-foreground text-lg">{stock.name} ({stock.ticker})</p>
                            <p className="text-sm text-muted-foreground">Current Price: {formatCurrency(stock.price)}</p>
                        </div>
                    </div>
                     <div>
                        <div className="flex justify-between items-baseline">
                            <label htmlFor="stake-amount" className="block text-sm font-medium text-muted-foreground mb-1.5">Stake Amount</label>
                            <span className="text-xs text-muted-foreground">Available Balance: <span className="blur-balance">{formatCurrency(cashBalance)}</span></span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-2xl">$</span>
                            <input
                                id="stake-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-input border border-border rounded-lg py-4 px-10 text-foreground text-3xl font-light focus:outline-none focus:ring-2 focus:ring-ring"
                                step="0.01" min={min} max={max} required autoFocus
                            />
                        </div>
                    </div>
                    <div className="bg-secondary p-4 rounded-lg border border-border space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Monthly ROI Bracket:</span>
                            <span className="font-semibold text-lg text-primary">{monthlyROI.toFixed(1)}%</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Est. Monthly Return:</span>
                            <span className="font-semibold text-lg text-success blur-balance">{formatCurrency(monthlyReturn)}</span>
                        </div>
                    </div>

                    {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}
                    
                    <button type="submit" disabled={isButtonDisabled} className="w-full font-bold py-3 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:shadow-none">
                        {isProcessing ? 'Processing...' : 'Stake & Start Earning'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StockStakeModal;