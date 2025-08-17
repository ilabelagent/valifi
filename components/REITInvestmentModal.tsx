import React, { useState, useEffect } from 'react';
import type { REITProperty } from '../types';
import { CloseIcon } from './icons';
import { useCurrency } from './CurrencyContext';

interface REITInvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: REITProperty;
    cashBalance: number;
    onConfirm: (amount: number) => void;
}

const REITInvestmentModal: React.FC<REITInvestmentModalProps> = ({ isOpen, onClose, property, cashBalance, onConfirm }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { formatCurrency } = useCurrency();

    const { min, max } = property.investmentRange;

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
            setError(`Minimum investment is ${formatCurrency(min)}.`);
        } else if (numericAmount > max) {
            setError(`Maximum investment is ${formatCurrency(max)}.`);
        }
    }, [amount, cashBalance, min, max, formatCurrency]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (error || !amount) return;

        setIsProcessing(true);
        const numericAmount = parseFloat(amount);

        // Simulate network delay
        setTimeout(() => {
            onConfirm(numericAmount);
            setIsProcessing(false);
        }, 1500);
    };

    if (!isOpen) return null;

    const monthlyReturn = (parseFloat(amount) || 0) * (property.monthlyROI / 100);
    const isButtonDisabled = isProcessing || !!error || !amount || parseFloat(amount) <= 0;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-popover border border-border rounded-2xl w-full max-w-lg text-popover-foreground" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold">Invest in {property.name}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-popover-foreground p-2 rounded-full hover:bg-accent"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg border border-border">
                        <img src={property.imageUrl} alt={property.name} className="w-24 h-16 object-cover rounded-md"/>
                        <div>
                            <p className="font-semibold text-foreground">{property.name}</p>
                            <p className="text-sm text-muted-foreground">{property.address}</p>
                            <p className="text-sm text-success font-semibold">{property.monthlyROI.toFixed(2)}% Monthly ROI</p>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-baseline">
                            <label htmlFor="invest-amount" className="block text-sm font-medium text-muted-foreground mb-1.5">Investment Amount</label>
                            <span className="text-xs text-muted-foreground">Available Balance: <span className="blur-balance">{formatCurrency(cashBalance)}</span></span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-2xl">$</span>
                            <input
                                id="invest-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-input border border-border rounded-lg py-4 px-10 text-foreground text-3xl font-light focus:outline-none focus:ring-2 focus:ring-ring"
                                step="0.01" min={min} max={max} required autoFocus
                            />
                        </div>
                    </div>
                    <div className="bg-secondary p-4 rounded-lg border border-border flex justify-between items-center">
                        <span className="text-muted-foreground">Est. Monthly Return:</span>
                        <span className="font-semibold text-lg text-success blur-balance">{formatCurrency(monthlyReturn)}</span>
                    </div>

                    {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}
                    
                    <button type="submit" disabled={isButtonDisabled} className="w-full font-bold py-3 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:shadow-none">
                        {isProcessing ? 'Processing...' : 'Buy Shares'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default REITInvestmentModal;