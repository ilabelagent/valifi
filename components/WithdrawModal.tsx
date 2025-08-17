import React, { useState, useEffect } from 'react';
import type { KYCStatus, ViewType, BankAccount } from '../types';
import { CloseIcon, LockIcon, BankIcon, ChevronDownIcon } from './icons';
import { CRYPTO_CONFIG } from './crypto.config';
import { useCurrency } from './CurrencyContext';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    onWithdraw: (amount: number, details: { type: 'fiat' | 'crypto'; destination: string; coinTicker?: string; coinAmount?: number; }) => void;
    kycStatus: KYCStatus;
    balance: number;
    setCurrentView: (view: ViewType) => void;
    linkedBankAccounts: BankAccount[];
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

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onWithdraw, kycStatus, balance, setCurrentView, linkedBankAccounts }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [withdrawalType, setWithdrawalType] = useState<'fiat' | 'crypto'>('fiat');
    const { formatCurrency } = useCurrency();
    
    // Fiat state
    const verifiedBankAccounts = linkedBankAccounts.filter(acc => acc.status === 'Verified');
    const [fiatDestination, setFiatDestination] = useState(verifiedBankAccounts.length > 0 ? verifiedBankAccounts[0].id : '');

    // Crypto state
    const [selectedCoin, setSelectedCoin] = useState('BTC');
    const [selectedNetwork, setSelectedNetwork] = useState(Object.keys(CRYPTO_CONFIG.BTC.networks)[0]);
    const [cryptoDestination, setCryptoDestination] = useState('');

    const currentCoinConfig = CRYPTO_CONFIG[selectedCoin];
    const currentNetworkConfig = currentCoinConfig.networks[selectedNetwork];

    useEffect(() => {
        if (!isOpen) {
            // Reset state after the modal has been closed
            const timer = setTimeout(() => {
                setAmount('');
                setError('');
                setIsProcessing(false);
                setWithdrawalType('fiat');
                setCryptoDestination('');
            }, 300);
            return () => clearTimeout(timer);
        } else {
             // When modal opens, set default fiat destination if available
            setFiatDestination(verifiedBankAccounts.length > 0 ? verifiedBankAccounts[0].id : '');
        }
    }, [isOpen, linkedBankAccounts]);

     useEffect(() => {
        setSelectedNetwork(Object.keys(currentCoinConfig.networks)[0]);
        setAmount('');
        setError('');
        setCryptoDestination('');
    }, [selectedCoin, currentCoinConfig]);

    const handleAddressValidation = (address: string) => {
        if (!address || withdrawalType !== 'crypto') return;
        if (!currentNetworkConfig?.validationRegex.test(address)) {
            setError(`Invalid ${selectedCoin} address for ${selectedNetwork} network.`);
        } else {
            setError('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const numericAmount = parseFloat(amount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }
        if (numericAmount > balance) {
            setError('Withdrawal amount exceeds available balance.');
            return;
        }

        let details;
        if (withdrawalType === 'fiat') {
            if (!fiatDestination.trim()) {
                setError('Please select a verified bank account.');
                return;
            }
            const selectedAccount = verifiedBankAccounts.find(acc => acc.id === fiatDestination);
            details = { type: 'fiat' as const, destination: selectedAccount!.accountDisplay };
        } else {
            if (!cryptoDestination.trim()) {
                setError('Destination address is required.');
                return;
            }
            if (currentNetworkConfig && !currentNetworkConfig.validationRegex.test(cryptoDestination)) {
                 setError(`Invalid ${selectedCoin} address for ${selectedNetwork} network.`);
                 return;
            }
            const coinAmount = numericAmount / currentCoinConfig.priceUSD;
            details = { type: 'crypto' as const, destination: cryptoDestination, coinTicker: selectedCoin, coinAmount };
        }

        setIsProcessing(true);
        setTimeout(() => {
            onWithdraw(numericAmount, details);
            setIsProcessing(false);
            onClose();
        }, 1500);
    };
    
    if (!isOpen) return null;

    const renderVerifiedContent = () => {
        const numericAmount = parseFloat(amount);
        const cryptoAmount = withdrawalType === 'crypto' && numericAmount > 0 ? (numericAmount / currentCoinConfig.priceUSD).toFixed(6) : '0.00';
        
        const isInvalid = isNaN(numericAmount) || numericAmount <= 0;
        const exceedsBalance = !isInvalid && numericAmount > balance;
        
        const cryptoAddressIsInvalid = withdrawalType === 'crypto' && !!error.includes('Invalid');
        const fiatDestinationIsMissing = withdrawalType === 'fiat' && !fiatDestination;

        const isDisabled = isProcessing || isInvalid || exceedsBalance || cryptoAddressIsInvalid || fiatDestinationIsMissing;

        const getButtonText = () => {
            if (isProcessing) return 'Processing...';
            if (exceedsBalance) return 'Insufficient Balance';
            if (cryptoAddressIsInvalid) return 'Invalid Address';
             if (fiatDestinationIsMissing) return 'Select a Bank Account';
            if (isInvalid) {
                return amount ? 'Invalid Amount' : 'Enter Amount';
            }
            return `Withdraw ${formatCurrency(numericAmount)}`;
        };


        const renderFiatFields = () => {
            if (verifiedBankAccounts.length === 0) {
                return (
                    <div className="text-center p-2 space-y-3">
                         <BankIcon className="w-10 h-10 text-sky-500 mx-auto" />
                         <h3 className="font-semibold text-white">No Verified Bank Account</h3>
                         <p className="text-sm text-slate-400">Please link and verify a bank account to enable fiat withdrawals.</p>
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
                 <div>
                    <label htmlFor="withdraw-destination" className="block text-sm font-medium text-slate-300 mb-1.5">Withdraw To</label>
                     <div className="relative">
                        <select
                            id="withdraw-destination" value={fiatDestination}
                            onChange={(e) => setFiatDestination(e.target.value)}
                            className="w-full bg-slate-700/80 border border-slate-600 rounded-lg py-3 px-4 text-white appearance-none" required
                        >
                            {verifiedBankAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.accountDisplay}</option>
                            ))}
                        </select>
                         <ChevronDownIcon className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            )
        };

        const renderCryptoFields = () => (
             <>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="withdraw-coin" className="block text-sm font-medium text-slate-300 mb-1.5">Coin</label>
                        <select id="withdraw-coin" value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)} className="w-full bg-slate-700/80 border border-slate-600 rounded-lg py-3 px-3 text-white">
                            {Object.keys(CRYPTO_CONFIG).map(key => <option key={key} value={key}>{key}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="withdraw-network" className="block text-sm font-medium text-slate-300 mb-1.5">Network</label>
                        <select id="withdraw-network" value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)} className="w-full bg-slate-700/80 border border-slate-600 rounded-lg py-3 px-3 text-white">
                            {Object.keys(currentCoinConfig.networks).map(net => <option key={net} value={net}>{net}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="crypto-destination" className="block text-sm font-medium text-slate-300 mb-1.5">Destination Address</label>
                    <input
                        id="crypto-destination" type="text" value={cryptoDestination}
                        onChange={(e) => {
                            setCryptoDestination(e.target.value);
                            if (error) setError(''); // Clear error on type
                        }}
                        onBlur={(e) => handleAddressValidation(e.target.value)}
                        placeholder={`Enter ${selectedCoin} address`}
                        className="w-full bg-slate-700/80 border border-slate-600 rounded-lg py-3 px-4 text-white font-mono" required
                    />
                </div>
             </>
        );

        return (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="flex justify-between items-baseline">
                    <label htmlFor="withdraw-amount" className="block text-sm font-medium text-slate-300 mb-1.5">Amount to Withdraw (USD)</label>
                    <span className="text-sm text-slate-400">Available: <span className="blur-balance">{formatCurrency(balance)}</span></span>
                </div>
                <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                        id="withdraw-amount" type="number" value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-700/80 border border-slate-600 rounded-lg py-3 px-8 text-white"
                        step="0.01" min="0" required
                    />
                     {withdrawalType === 'crypto' && numericAmount > 0 &&
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">≈ {cryptoAmount} {selectedCoin}</span>
                    }
                </div>
                
                {withdrawalType === 'fiat' ? renderFiatFields() : renderCryptoFields()}
                
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                <button type="submit" disabled={isDisabled} className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-sky-500/20 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none">
                    {getButtonText()}
                </button>
            </form>
        );
    };
    
    const renderUnverifiedContent = () => (
        <div className="p-8 space-y-4 text-center">
            <LockIcon className="w-12 h-12 text-sky-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white">Withdrawals Locked</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Please complete KYC verification to enable withdrawals and ensure the security of your account.
            </p>
            <button 
                onClick={() => {
                    onClose();
                    setCurrentView('kyc');
                }}
                className="mt-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                Verify Identity
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-300/10 rounded-2xl shadow-2xl w-full max-w-md m-4 text-white transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-300/10">
                    <h2 className="text-2xl font-bold">Withdraw from Main Balance</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/80"><CloseIcon className="w-6 h-6" /></button>
                </div>
                {kycStatus === 'Approved' ? (
                     <>
                        <div className="flex">
                            <TabButton label="Bank" isActive={withdrawalType === 'fiat'} onClick={() => { setWithdrawalType('fiat'); setError(''); }}/>
                            <TabButton label="Crypto" isActive={withdrawalType === 'crypto'} onClick={() => { setWithdrawalType('crypto'); setError(''); }}/>
                        </div>
                        {renderVerifiedContent()}
                     </>
                ) : renderUnverifiedContent()}
            </div>
        </div>
    );
};

export default WithdrawModal;