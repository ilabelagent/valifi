import React, { useState, useEffect } from 'react';
import type { P2POffer, PaymentMethod } from '../types';
import { useCurrency } from './CurrencyContext';
import { CloseIcon, AlertTriangleIcon } from './icons';
import { mockFxRates } from './fxService';

interface TradeConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    offer: P2POffer;
    userBalance: number;
    userPaymentMethods: PaymentMethod[];
    onConfirmTrade: (amount: number, paymentMethod: PaymentMethod) => void;
}

const TradeConfirmationModal: React.FC<TradeConfirmationModalProps> = ({
    isOpen,
    onClose,
    offer,
    userBalance,
    userPaymentMethods,
    onConfirmTrade,
}) => {
    const [amount, setAmount] = useState('');
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
    const [error, setError] = useState('');
    const { formatCurrency } = useCurrency();

    const isBuyOffer = offer.type === 'SELL'; // User is buying crypto from someone selling

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setError('');
            // Pre-select the first compatible payment method if available
            const compatibleMethods = userPaymentMethods.filter(userPM => 
                offer.paymentMethods.some(offerPM => offerPM.methodType === userPM.methodType)
            );
            if (compatibleMethods.length > 0) {
                setSelectedPaymentMethodId(compatibleMethods[0].id);
            } else {
                setSelectedPaymentMethodId('');
            }
        }
    }, [isOpen, offer, userPaymentMethods]);

    useEffect(() => {
        setError('');
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) return;

        if (numericAmount < offer.minOrder) setError(`Minimum trade amount is ${offer.minOrder.toLocaleString(undefined, {style: 'currency', currency: offer.fiatCurrency})}.`);
        if (numericAmount > offer.maxOrder) setError(`Maximum trade amount is ${offer.maxOrder.toLocaleString(undefined, {style: 'currency', currency: offer.fiatCurrency})}.`);
        
        const cryptoValue = numericAmount / offer.price;
        if (!isBuyOffer && cryptoValue > userBalance) {
            setError('Amount exceeds your available asset balance.');
        }

    }, [amount, offer, isBuyOffer, userBalance, formatCurrency]);

    const handleSubmit = () => {
        if (error || !amount) return;
        const selectedPaymentMethod = userPaymentMethods.find(pm => pm.id === selectedPaymentMethodId);
        if (!selectedPaymentMethod) {
            setError("Please select a valid payment method.");
            return;
        }
        onConfirmTrade(parseFloat(amount), selectedPaymentMethod);
    };

    if (!isOpen) return null;

    const cryptoAmount = (parseFloat(amount) || 0) / offer.price;

    const compatiblePaymentMethods = userPaymentMethods.filter(userPM =>
        offer.paymentMethods.some(offerPM => offerPM.methodType === userPM.methodType)
    );

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-card-foreground">Confirm Trade</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-secondary p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Trader:</span>
                            <span className="font-semibold text-foreground">{offer.user.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2">
                             <span className="text-muted-foreground">Price:</span>
                             <span className="font-semibold text-primary">{formatCurrency(offer.price * (1/ (mockFxRates[offer.fiatCurrency] || 1)))} / {offer.asset.ticker}</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Amount in {offer.fiatCurrency}</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder={`Min ${offer.minOrder}, Max ${offer.maxOrder}`}
                            className="w-full bg-input p-2 rounded-lg mt-1"
                        />
                         <p className="text-xs text-muted-foreground mt-1">
                            {isBuyOffer ? `You will receive ≈ ${cryptoAmount.toFixed(8)} ${offer.asset.ticker}` : `You will send ≈ ${cryptoAmount.toFixed(8)} ${offer.asset.ticker}`}
                        </p>
                    </div>
                     <div>
                        <label className="text-sm text-muted-foreground">Your Payment Method</label>
                        <select
                            value={selectedPaymentMethodId}
                            onChange={e => setSelectedPaymentMethodId(e.target.value)}
                            className="w-full bg-input p-2 rounded-lg mt-1"
                        >
                            <option value="" disabled>Select a method</option>
                            {compatiblePaymentMethods.map(pm => (
                                <option key={pm.id} value={pm.id}>{pm.nickname} ({pm.methodType})</option>
                            ))}
                        </select>
                         {compatiblePaymentMethods.length === 0 && <p className="text-xs text-amber-400 mt-1">You have no payment methods compatible with this offer.</p>}
                    </div>

                    {error && <p className="text-destructive text-sm text-center">{error}</p>}

                    <div className="text-xs p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex gap-2">
                        <AlertTriangleIcon className="w-6 h-4 flex-shrink-0" />
                        Once the trade is initiated, the crypto will be held in escrow. Do not release funds until you have confirmed payment.
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!!error || !amount || !selectedPaymentMethodId}
                        className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-bold py-3 rounded-lg"
                    >
                        {isBuyOffer ? 'Buy Now' : 'Sell Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TradeConfirmationModal;