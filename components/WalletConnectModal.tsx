import React from 'react';
import { CloseIcon, MetamaskIcon, CoinbaseWalletIcon, TrustWalletIcon, WalletConnectIcon } from './icons';

interface WalletConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenQR: () => void;
    onOpenSeedImport: (source: 'Trust Wallet' | 'Coinbase') => void;
}

const WalletOption: React.FC<{ Icon: React.FC<any>, name: string, onClick?: () => void }> = ({ Icon, name, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-800/50 hover:bg-slate-700/80 rounded-xl transition-colors w-full aspect-square border border-slate-700 hover:border-sky-500/50 group">
        <Icon className="w-16 h-16 group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-white">{name}</span>
    </button>
);

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose, onOpenQR, onOpenSeedImport }) => {
    if (!isOpen) return null;

    const handleWalletSelect = (walletName: 'MetaMask' | 'WalletConnect' | 'Trust Wallet' | 'Coinbase') => {
        onClose(); // Close this modal first
        if (walletName === 'MetaMask') {
            alert("Please use the MetaMask browser extension to connect.");
        } else if (walletName === 'WalletConnect') {
            onOpenQR();
        } else if (walletName === 'Trust Wallet' || walletName === 'Coinbase') {
            onOpenSeedImport(walletName);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-connect-title"
        >
            <div 
                className="bg-slate-900/70 backdrop-blur-xl border border-slate-300/10 rounded-2xl shadow-2xl w-full max-w-lg m-4 text-white p-6 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 id="wallet-connect-title" className="text-2xl font-bold">Connect a wallet</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/80" aria-label="Close">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <WalletOption Icon={MetamaskIcon} name="MetaMask" onClick={() => handleWalletSelect('MetaMask')} />
                    <WalletOption Icon={CoinbaseWalletIcon} name="Coinbase" onClick={() => handleWalletSelect('Coinbase')} />
                    <WalletOption Icon={TrustWalletIcon} name="Trust Wallet" onClick={() => handleWalletSelect('Trust Wallet')} />
                    <WalletOption Icon={WalletConnectIcon} name="WalletConnect" onClick={() => handleWalletSelect('WalletConnect')} />
                </div>

                <p className="text-xs text-slate-500 mt-6 text-center">
                    By connecting a wallet, you agree to Valifi's Terms of Service and consent to its Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default WalletConnectModal;