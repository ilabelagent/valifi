import React, { useState, useEffect, useMemo } from 'react';
import type { InvestmentPlan } from '../types';
import { CloseIcon } from './icons';
import { useCurrency } from './CurrencyContext';

interface InvestModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: InvestmentPlan;
    onInvest: (plan: InvestmentPlan, amount: number) => void;
    cashBalance: number;
}

const InvestModal: React.FC<InvestModalProps> = ({ isOpen, onClose, plan, onInvest, cashBalance }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { formatCurrency } = useCurrency();

    const { min, max } = useMemo(() => {
        const parts = plan.investmentRange.replace(/[\$,\s]/g, '').split('–');
        return { min: parseFloat(parts[0]), max: parseFloat(parts[1]) || Infinity };
    }, [plan.investmentRange]);

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
            setError('Amount exceeds your available cash balance.');
        } else if (numericAmount < min) {
            setError(`Minimum investment for this plan is $${min.toLocaleString()}.`);
        } else if (numericAmount > max) {
            setError(`Maximum investment for this plan is $${max.toLocaleString()}.`);
        }

    }, [amount, cashBalance, min, max]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (error || !amount) return;

        setIsProcessing(true);
        const numericAmount = parseFloat(amount);

        // Simulate network delay
        setTimeout(() => {
            onInvest(plan, numericAmount);
            setIsProcessing(false);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    const dailyReturnPercent = parseFloat(plan.dailyReturns) / 100;
    const projectedDailyReturn = (parseFloat(amount) || 0) * dailyReturnPercent;
    const isButtonDisabled = isProcessing || !!error || !amount || parseFloat(amount) <= 0;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg m-4 text-card-foreground transform transition-all" onClick={e => e.stopPropagation()}>
                <div className={`flex justify-between items-center p-6 border-b-2 ${plan.borderColor} ${plan.colorClass}`}>
                    <h2 className="text-2xl font-bold">Invest in {plan.name}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-white/10"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <div className="flex justify-between items-baseline">
                             <label htmlFor="invest-amount" className="block text-sm font-medium text-muted-foreground mb-1.5">Investment Amount (USD)</label>
                             <span className="text-xs text-muted-foreground">Available: <span className="blur-balance">{formatCurrency(cashBalance)}</span></span>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-2xl">$</span>
                            <input
                                id="invest-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-input border border-border rounded-lg py-4 px-10 text-foreground placeholder:text-muted-foreground text-3xl font-light focus:outline-none focus:ring-2 focus:ring-ring"
                                step="0.01" min="0" required autoFocus
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Plan Range: ${min.toLocaleString()} – ${max.toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="bg-secondary p-4 rounded-lg space-y-2 border border-border">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Daily Return Rate:</span>
                            <span className="font-semibold text-foreground">{plan.dailyReturns}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Projected Daily Earnings:</span>
                            <span className={`font-semibold ${projectedDailyReturn > 0 ? 'text-emerald-400' : 'text-foreground'}`}>
                                <span className="blur-balance">{formatCurrency(projectedDailyReturn)}</span>
                            </span>
                        </div>
                    </div>

                    {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}

                    <button type="submit" disabled={isButtonDisabled} className={`w-full flex items-center justify-center font-bold py-3 px-4 rounded-lg transition-colors text-lg text-white shadow-lg disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:shadow-none ${plan.buttonColor} ${plan.shadowColor}`}>
                        {isProcessing ? 'Processing...' : `Confirm Investment`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InvestModal;