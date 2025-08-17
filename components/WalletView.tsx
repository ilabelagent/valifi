import React, { useMemo, useState, useEffect } from 'react';
import type { Portfolio, HybridWalletAsset, Transaction } from '../types';
import { KeyIcon, CopyIcon, BtcIcon, EthIcon, SolanaIcon, BnbIcon, UsdtIcon, MaticIcon, ReceiveIcon, ArrowUpRightIcon, CloseIcon, AlertTriangleIcon, CheckCircleIcon, ArrowLeftIcon, PieChartIcon, DownloadIcon, ClockIcon, UsdIcon, WalletConnectIcon, SwapIcon } from './icons';
import { CRYPTO_CONFIG } from './crypto.config';
import { useCurrency } from './CurrencyContext';


const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

// MOCK DATA AND CONFIGURATION
const MOCK_SECRET_PHRASE = "orbit mimic solar custom stable track vendor coral crazy vessel eternal kiwi";

const HYBRID_WALLET_CONFIG = {
    'self-custody': {
        BTC: { name: 'Bitcoin', Icon: BtcIcon, networks: ['Bitcoin', 'Lightning'], getNetworkAddress: (net: string) => net === 'Bitcoin' ? 'bc1qgr9nps2zcrq2a4z0kplv42etk63q8q8jfgqh5p' : 'lnbc1psj...' },
        ETH: { name: 'Ethereum', Icon: EthIcon, networks: ['ERC-20', 'Arbitrum'], getNetworkAddress: (net: string) => net === 'ERC-20' ? '0x3A2b3a7bC2A45a8F8A7be34f2105154568840c88' : '0x4D2a...' },
        BNB: { name: 'BNB', Icon: BnbIcon, networks: ['BEP-20'], getNetworkAddress: () => '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' },
        SOL: { name: 'Solana', Icon: SolanaIcon, networks: ['Solana'], getNetworkAddress: () => 'So11111111111111111111111111111111111111112' },
        MATIC: { name: 'Polygon', Icon: MaticIcon, networks: ['Polygon'], getNetworkAddress: () => '0x7D1AfA7B718fb893dB30A3aBc0CFC608AaCfeBB0' },
    },
    'custodial': {
        USDT: { name: 'Tether', Icon: UsdtIcon, networks: ['ERC-20', 'Polygon'], getNetworkAddress: (net: string) => net === 'ERC-20' ? '0xdAC17F958D2ee523a2206206994597C13D831ec7' : '0x0c662c7585a5895782136e4f5b7deA69165d75A1' },
    }
};

type WalletStatus = 'loading' | 'none' | 'generated' | 'backed_up';

const shuffleArray = <T,>(array: T[]): T[] => {
    return array.map(value => ({ value, sort: Math.random() }))
               .sort((a, b) => a.sort - b.sort)
               .map(({ value }) => value);
};

// --- SUB-COMPONENTS ---

const TotalBalancePanel: React.FC<{ balance: number }> = ({ balance }) => {
    const { formatCurrency } = useCurrency();
    return (
    <Card className="p-6 h-full">
        <div className="flex justify-between items-center h-full">
            <div>
                <p className="text-sm text-muted-foreground">Total Wallet Balance</p>
                <p className="text-4xl font-bold text-foreground tracking-tighter mt-1"><span className="blur-balance">{formatCurrency(balance)}</span></p>
            </div>
            <button className="p-3 rounded-full bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="View Chart (Coming Soon)">
                <PieChartIcon className="w-6 h-6"/>
            </button>
        </div>
    </Card>
)};

const ReceiveModal: React.FC<{ asset: HybridWalletAsset, onClose: () => void }> = ({ asset, onClose }) => {
    const [network, setNetwork] = useState(asset.networks[0]);
    const [copied, setCopied] = useState(false);
    const address = asset.getNetworkAddress(network);

    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-card-foreground">Receive {asset.name}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><CloseIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 space-y-4">
                    <select value={network} onChange={e => setNetwork(e.target.value)} className="w-full bg-input p-3 rounded-lg text-foreground">
                        {asset.networks.map(n => <option key={n} value={n}>{n} Network</option>)}
                    </select>
                     <div className="bg-background p-4 rounded-lg flex flex-col items-center gap-4">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}&bgcolor=0f172a&color=e2e8f0&qzone=1`} alt="QR Code" className="rounded-lg border-4 border-border"/>
                        <div className="flex items-center justify-between gap-2 bg-secondary p-2 rounded-lg w-full">
                            <p className="font-mono text-xs text-muted-foreground break-all">{address}</p>
                             <button onClick={handleCopy} className="flex-shrink-0 flex items-center gap-1.5 bg-accent hover:bg-primary/20 text-foreground font-semibold py-1 px-2 rounded-md text-xs">
                                <CopyIcon className="w-3 h-3" />
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                     </div>
                     <div className="text-xs p-3 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex gap-2">
                        <AlertTriangleIcon className="w-6 h-4 flex-shrink-0" />
                        Only send {asset.ticker} via the {network} network. Using a different network may result in permanent loss of funds.
                     </div>
                </div>
            </div>
        </div>
    );
};

const EnhancedSendModal: React.FC<{ asset: HybridWalletAsset, onSend: (assetTicker: string, amountCrypto: number, amountUSD: number, txHash: string) => void, onClose: () => void }> = ({ asset, onSend, onClose }) => {
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

const SecretPhraseModal: React.FC<{ status: WalletStatus, onConfirmBackup: () => void, onClose: () => void }> = ({ status, onConfirmBackup, onClose }) => {
    const [step, setStep] = useState(1); // 1: Show phrase, 2: Verify
    const [shuffledPhrase, setShuffledPhrase] = useState<string[]>([]);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [error, setError] = useState('');
    const originalWords = useMemo(() => MOCK_SECRET_PHRASE.split(' '), []);

    useEffect(() => {
        if (status === 'generated' && step === 1) {
            setShuffledPhrase(shuffleArray([...originalWords]));
        }
    }, [status, step, originalWords]);
    
    const handleWordSelect = (word: string) => {
        setSelectedWords(prev => [...prev, word]);
        setShuffledPhrase(prev => prev.filter(w => w !== word));
    };

    const handleWordDeselect = (word: string, index: number) => {
        setSelectedWords(prev => prev.filter((_, i) => i !== index));
        setShuffledPhrase(prev => [...prev, word].sort(() => Math.random() - 0.5)); // re-shuffle for UX
    };
    
    const handleVerify = () => {
        if (selectedWords.join(' ') === MOCK_SECRET_PHRASE) {
            onConfirmBackup();
        } else {
            setError('Incorrect order. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-card-foreground">{step === 1 ? 'Back Up Your Wallet' : 'Verify Your Phrase'}</h2>
                    {step === 1 && <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><CloseIcon className="w-6 h-6"/></button>}
                </div>
                 <div className="p-6 space-y-4">
                     <div className="text-xs p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex gap-2">
                        <AlertTriangleIcon className="w-10 h-4 flex-shrink-0" />
                        Never share your secret phrase with anyone. This phrase is the only way to recover your wallet. Store it in a secure, offline location.
                     </div>
                     {step === 1 ? (
                        <>
                             <div className="grid grid-cols-3 gap-2 bg-secondary p-4 rounded-lg font-mono">
                                {MOCK_SECRET_PHRASE.split(' ').map((word, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-muted-foreground text-sm">{index + 1}.</span>
                                        <span className="text-foreground">{word}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setStep(2)} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg">I've Backed It Up, Let's Verify</button>
                        </>
                     ) : (
                         <>
                             <div className="bg-secondary p-4 rounded-lg min-h-[8rem] border border-border flex flex-wrap gap-2">
                                {selectedWords.map((word, index) => (
                                     <button key={index} onClick={() => handleWordDeselect(word, index)} className="bg-primary/20 text-primary font-mono px-2 py-1 rounded-md">{word}</button>
                                ))}
                             </div>
                            <p className="text-sm text-center text-muted-foreground">Tap the words in the correct order.</p>
                             <div className="flex flex-wrap gap-2 justify-center">
                                {shuffledPhrase.map(word => (
                                     <button key={word} onClick={() => handleWordSelect(word)} className="bg-input text-foreground font-mono px-2 py-1 rounded-md">{word}</button>
                                ))}
                             </div>
                              {error && <p className="text-destructive text-sm text-center">{error}</p>}
                             <button onClick={handleVerify} disabled={selectedWords.length !== 12} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg disabled:bg-muted">Verify</button>
                         </>
                     )}
                 </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
interface WalletViewProps {
    portfolio: Portfolio;
    onConnectWallet: () => void;
    onWalletSend: (assetTicker: string, amountCrypto: number, amountUSD: number, txHash: string) => void;
}

const WalletView: React.FC<WalletViewProps> = ({ portfolio, onConnectWallet, onWalletSend }) => {
    const [walletStatus, setWalletStatus] = useState<WalletStatus>('none');
    const [activeTab, setActiveTab] = useState<'self-custody' | 'custodial'>('self-custody');
    const [receiveAsset, setReceiveAsset] = useState<HybridWalletAsset | null>(null);
    const [sendAsset, setSendAsset] = useState<HybridWalletAsset | null>(null);
    const { formatCurrency } = useCurrency();

    const hybridWalletAssets = useMemo((): HybridWalletAsset[] => {
        const assets: HybridWalletAsset[] = [];
        
        // Self-custody assets
        Object.entries(HYBRID_WALLET_CONFIG['self-custody']).forEach(([ticker, config]) => {
            const portfolioAsset = portfolio.assets.find(a => a.ticker === ticker);
            assets.push({
                ticker, type: 'self-custody', ...config,
                balance: portfolioAsset?.balance || 0,
                valueUSD: portfolioAsset?.valueUSD || 0,
                address: config.getNetworkAddress(config.networks[0])
            });
        });
        
        // Custodial assets - for now, just USD, maybe USDT later
        const cashAsset = portfolio.assets.find(a => a.type === 'Cash');
        if(cashAsset){
            assets.push({
                ticker: 'USD', name: 'Cash', Icon: UsdIcon, type: 'custodial',
                balance: cashAsset.balance, valueUSD: cashAsset.valueUSD, address: 'valifi-custodial',
                networks: ['Internal'], getNetworkAddress: () => 'valifi-custodial'
            });
        }
        
        return assets;
    }, [portfolio.assets]);
    
    const { selfCustodyAssets, custodialAssets, totalBalance } = useMemo(() => ({
        selfCustodyAssets: hybridWalletAssets.filter(a => a.type === 'self-custody'),
        custodialAssets: hybridWalletAssets.filter(a => a.type === 'custodial'),
        totalBalance: hybridWalletAssets.reduce((sum, a) => sum + a.valueUSD, 0)
    }), [hybridWalletAssets]);
    
    const assetsToShow = activeTab === 'self-custody' ? selfCustodyAssets : custodialAssets;

    const walletTransactions = useMemo((): Transaction[] => {
        const walletTickers = selfCustodyAssets.map(a => a.ticker);
        return portfolio.transactions.filter(tx => 
            ['Sent', 'Received'].includes(tx.type) || 
            (tx.type === 'Trade' && walletTickers.some(ticker => tx.description.includes(ticker)))
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [portfolio.transactions, selfCustodyAssets]);

    const getTransactionIcon = (type: Transaction['type']) => {
        const iconStyle = "w-5 h-5";
        switch (type) {
            case 'Received':
                return <DownloadIcon className={`${iconStyle} text-emerald-400`} />;
            case 'Sent':
                return <ArrowUpRightIcon className={`${iconStyle} text-red-400`} />;
            case 'Trade':
                return <SwapIcon className={`${iconStyle} text-primary`} />;
            default:
                return <ClockIcon className={`${iconStyle} text-muted-foreground`} />;
        }
    };


    const handleCreateWallet = () => {
        setWalletStatus('loading');
        setTimeout(() => setWalletStatus('generated'), 1500);
    };

    if (walletStatus !== 'backed_up') {
        return (
             <div className="p-6 lg:p-8 flex items-center justify-center h-full">
                <Card className="max-w-lg w-full text-center p-8">
                     <KeyIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                     <h2 className="text-2xl font-bold text-foreground">Activate Your Hybrid Wallet</h2>
                     <p className="mt-2 text-muted-foreground">Generate a secure, self-custodial wallet to manage your assets with full control. You will be given a 12-word secret phrase to back up your wallet.</p>
                     <button onClick={handleCreateWallet} disabled={walletStatus === 'loading'} className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-muted">
                        {walletStatus === 'loading' ? 'Generating...' : 'Create My Wallet'}
                     </button>
                </Card>
                 {walletStatus === 'generated' && <SecretPhraseModal status={walletStatus} onConfirmBackup={() => setWalletStatus('backed_up')} onClose={() => setWalletStatus('none')} />}
             </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 view-container">
            <div className="flex flex-wrap items-stretch justify-between gap-6">
                <div className="flex-grow">
                    <TotalBalancePanel balance={totalBalance} />
                </div>
                <button onClick={onConnectWallet} className="flex h-full items-center gap-3 bg-card hover:bg-accent border border-border text-foreground font-semibold py-4 px-6 rounded-xl transition-colors shadow-sm">
                    <WalletConnectIcon className="w-8 h-8 text-primary" />
                    <div>
                        <span className="text-lg">Connect Wallet</span>
                        <p className="text-xs text-muted-foreground text-left">MetaMask, Trust, etc.</p>
                    </div>
                </button>
            </div>
            
            <Card>
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setActiveTab('self-custody')} className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeTab === 'self-custody' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>Self-Custody</button>
                        <button onClick={() => setActiveTab('custodial')} className={`px-4 py-2 text-sm font-semibold rounded-lg ${activeTab === 'custodial' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>Custodial</button>
                    </div>
                </div>
                 <ul className="divide-y divide-border">
                    {assetsToShow.map(asset => (
                        <li key={asset.ticker} className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-accent">
                            <div className="flex items-center gap-4">
                                <asset.Icon className="w-10 h-10"/>
                                <div>
                                    <p className="font-semibold text-foreground">{asset.name}</p>
                                    <p className="text-sm text-muted-foreground">{asset.ticker}</p>
                                </div>
                            </div>
                             <div className="text-right">
                                <p className="font-semibold text-foreground font-mono"><span className="blur-balance">{asset.balance.toFixed(6)}</span></p>
                                <p className="text-sm text-muted-foreground"><span className="blur-balance">{formatCurrency(asset.valueUSD)}</span></p>
                            </div>
                             <div className="flex items-center gap-2">
                                {asset.type === 'self-custody' && (
                                    <>
                                        <button onClick={() => setReceiveAsset(asset)} className="flex items-center gap-1.5 bg-secondary text-foreground font-semibold py-2 px-4 rounded-lg text-sm hover:bg-primary/10 hover:text-primary"><ReceiveIcon className="w-4 h-4"/> Receive</button>
                                        <button onClick={() => setSendAsset(asset)} className="flex items-center gap-1.5 bg-secondary text-foreground font-semibold py-2 px-4 rounded-lg text-sm hover:bg-primary/10 hover:text-primary"><ArrowUpRightIcon className="w-4 h-4"/> Send</button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                 </ul>
            </Card>

            <Card>
                <h3 className="text-lg font-semibold text-foreground p-6 border-b border-border">Recent Wallet Activity</h3>
                <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                    {walletTransactions.length > 0 ? walletTransactions.map(tx => {
                        const icon = getTransactionIcon(tx.type);
                        const amountColor = (tx.type === 'Sent' || tx.amountUSD < 0) && tx.type !== 'Trade' ? 'text-red-400' : 'text-emerald-400';
                        const sign = (tx.type === 'Received' || (tx.type !== 'Sent' && tx.amountUSD > 0)) ? '+' : (tx.type === 'Sent' || tx.amountUSD < 0) ? '-' : '';

                        return (
                            <li key={tx.id} className="flex items-center justify-between p-4 hover:bg-accent transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-secondary rounded-full border border-border">
                                        {icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{tx.description}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
                                    </div>
                                </div>
                                {tx.type !== 'Trade' && (
                                    <p className={`font-semibold text-lg font-mono ${amountColor}`}>
                                        <span className="blur-balance">{sign}{formatCurrency(Math.abs(tx.amountUSD))}</span>
                                    </p>
                                )}
                            </li>
                        )
                    }) : <p className="text-center text-muted-foreground p-8">No wallet transactions yet.</p>}
                </ul>
            </Card>

            {receiveAsset && <ReceiveModal asset={receiveAsset} onClose={() => setReceiveAsset(null)} />}
            {sendAsset && <EnhancedSendModal asset={sendAsset} onSend={onWalletSend} onClose={() => setSendAsset(null)} />}
        </div>
    );
};

export default WalletView;