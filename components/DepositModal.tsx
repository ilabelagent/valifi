import React, { useState, useEffect } from 'react';
import { CloseIcon, BankIcon, CopyIcon, ChevronDownIcon, DashboardIcon as QrCodeIcon } from './icons';
import { CRYPTO_CONFIG } from './crypto.config';
import type { BankAccount, ViewType } from '../types';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeposit: (amount: number, details: { type: 'fiat' | 'crypto'; coinTicker?: string; coinAmount?: number }) => void;
    linkedBankAccounts: BankAccount[];
    setCurrentView: (view: ViewType) => void;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${isActive ? 'text-sky-400 border-sky-400' : 'text-slate-400 border-transparent hover:text-white'}`}
    >
        {label}
    </button>
);

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onDeposit, linkedBankAccounts, setCurrentView }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [paymentType, setPaymentType] = useState<'fiat' | 'crypto'>('fiat');
    const [selectedCoin, setSelectedCoin] = useState('BTC');
    const [selectedNetwork, setSelectedNetwork] = useState(Object.keys(CRYPTO_CONFIG.BTC.networks)[0]);
    const [copied, setCopied] = useState(false);

    const currentCoinConfig = CRYPTO_CONFIG[selectedCoin];
    const depositAddress = currentCoinConfig.networks[selectedNetwork]?.address;
    const hasVerifiedBankAccount = linkedBankAccounts.some(acc => acc.status === 'Verified');
    const depositReference = `VLF-${Date.now().toString().slice(-6)}`;

    useEffect(() => {
        if (isOpen) {
            // Reset state on open
            setAmount('');
            setError('');
            setIsProcessing(false);
            setPaymentType('fiat');
        }
    }, [isOpen]);

    useEffect(() => {
        // Reset network when coin changes
        setSelectedNetwork(Object.keys(currentCoinConfig.networks)[0]);
        setAmount('');
        setError('');
    }, [selectedCoin, currentCoinConfig]);

    const handleCopy = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const numericAmount = parseFloat(amount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }

        setIsProcessing(true);
        
        let details: { type: 'fiat' | 'crypto'; coinTicker?: string; coinAmount?: number };
        let usdAmount: number;

        if (paymentType === 'fiat') {
            details = { type: 'fiat' };
            usdAmount = numericAmount;
        } else {
            details = { type: 'crypto', coinTicker: selectedCoin, coinAmount: numericAmount };
            usdAmount = numericAmount * currentCoinConfig.priceUSD;
        }

        // Simulate network delay
        setTimeout(() => {
            onDeposit(usdAmount, details);
            setAmount('');
            setIsProcessing(false);
            onClose();
        }, 1500);
    };
    
    if (!isOpen) return null;

    const renderFiatContent = () => {
        if (!hasVerifiedBankAccount) {
            return (
                <div className="text-center p-6 space-y-4">
                     <BankIcon className="w-12 h-12 text-sky-500 mx-auto" />
                     <h3 className="font-semibold text-lg text-white">Bank Account Required</h3>
                     <p className="text-sm text-slate-400">Please link and verify a bank account before you can make a fiat deposit.</p>
                     <button
                        type="button"
                        onClick={() => {
                            onClose();
                            setCurrentView('banking');
                        }}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                     >
                        Go to Banking
                     </button>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div>
                    <label htmlFor="deposit-amount-fiat" className="block text-sm font-medium text-slate-300 mb-1.5">Amount (USD)</label>
                    <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                            id="deposit-amount-fiat" type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                            placeholder="1,000.00"
                            className="w-full bg-slate-700/80 border border-slate-600 rounded-lg py-3 px-8 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            step="0.01" min="0" required
                        />
                    </div>
                </div>
                 <div className="bg-slate-900/50 p-4 rounded-lg space-y-3 border border-slate-700 text-sm">
                    <p className="font-semibold text-sky-300">Deposit Instructions</p>
                    <p className="text-slate-300">Transfer funds from your linked bank account to the details below. Your deposit will be credited once received.</p>
                    <div className="flex justify-between items-center bg-slate-800 p-2 rounded-md">
                        <span className="text-slate-400">Beneficiary:</span>
                        <span className="font-mono text-white">Valifi Inc.</span>
                    </div>
                     <div className="flex justify-between items-center bg-slate-800 p-2 rounded-md">
                        <span className="text-slate-400">Bank:</span>
                        <span className="font-mono text-white">Global Prime Bank</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800 p-2 rounded-md">
                        <span className="text-slate-400">Reference:</span>
                        <div className="flex items-center gap-2">
                             <span className="font-mono text-white">{depositReference}</span>
                             <button type="button" onClick={() => handleCopy(depositReference)} title="Copy Reference">
                                 <CopyIcon className="w-4 h-4 text-slate-400 hover:text-white"/>
                             </button>
                        </div>
                    </div>
                 </div>
            </div>
        );
    }


    const renderCryptoContent = () => (
        <>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="deposit-coin" className="block text-sm font-medium text-slate-300 mb-1.5">Coin</label>
                    <select id="deposit-coin" value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)} className="w-full bg-slate-700/80 border border-slate-600 rounded-lg py-3 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                        {Object.keys(CRYPTO_CONFIG).map(key => <option key={key} value={key}>{key}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="deposit-network" className="block text-sm font-medium text-slate-300 mb-1.5">Network</label>
                    <select id="deposit-network" value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)} className="w-full bg-slate-700/80 border border-slate-600 rounded-lg py-3 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500">
                        {Object.keys(currentCoinConfig.networks).map(net => <option key={net} value={net}>{net}</option>)}
                    </select>
                </div>
            </div>
            <div className="text-center bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-sm font-semibold text-sky-300 mb-2">Scan or copy address to deposit {selectedCoin}</p>
                 <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${depositAddress}&bgcolor=0f172a&color=e2e8f0&qzone=1`}
                    alt={`${selectedCoin} deposit QR code`}
                    className="mx-auto rounded-lg border-4 border-slate-700"
                />
                 <div className="mt-3 flex items-center justify-between gap-2 bg-slate-800/70 p-2 rounded-lg">
                    <p className="font-mono text-xs text-slate-300 break-all">{depositAddress}</p>
                     <button type="button" onClick={() => handleCopy(depositAddress!)} className="flex-shrink-0 flex items-center gap-1.5 bg-slate-700 hover:bg-sky-600 text-white font-semibold py-1.5 px-2.5 rounded-md transition-colors text-xs">
                        <CopyIcon className="w-3.5 h-3.5" />
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                 </div>
            </div>
             <div>
                <label htmlFor="deposit-amount-crypto" className="block text-sm font-medium text-slate-300 mb-1.5">Amount ({selectedCoin})</label>
                <input
                    id="deposit-amount-crypto"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-700/80 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    step="any" min="0" required
                />
            </div>
             <div className="text-xs p-3 rounded-lg bg-amber-900/50 text-amber-300 border border-amber-800/50">
                <span className="font-bold">Important:</span> Only send {selectedCoin} via the {selectedNetwork} network. Using a different network may result in permanent loss of funds.
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-300/10 rounded-2xl shadow-2xl w-full max-w-md m-4 text-white transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-300/10">
                    <h2 className="text-2xl font-bold">Deposit to Main Balance</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/80"><CloseIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="flex">
                    <TabButton label="Bank Deposit" isActive={paymentType === 'fiat'} onClick={() => { setPaymentType('fiat'); setAmount(''); setError(''); }}/>
                    <TabButton label="Crypto Deposit" isActive={paymentType === 'crypto'} onClick={() => { setPaymentType('crypto'); setAmount(''); setError(''); }}/>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {paymentType === 'fiat' ? renderFiatContent() : renderCryptoContent()}
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    <button type="submit" disabled={isProcessing || (paymentType === 'fiat' && !hasVerifiedBankAccount)} className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-sky-500/20 disabled:bg-slate-700 disabled:cursor-not-allowed">
                        {isProcessing ? 'Processing...' : (paymentType === 'fiat' ? 'Acknowledge Deposit' : 'Confirm Deposit')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DepositModal;