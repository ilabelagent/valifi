import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { MixTransaction, MixStatus } from '../types';
import { MIXABLE_ASSETS, generateDepositAddress } from './privacy.config';
import { ShuffleIcon, ChevronDownIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon, DownloadIcon, CopyIcon, InfoIcon, SparklesIcon } from './icons';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

const analyzeDestinationAddress = (address: string) => {
    if (!address) return { level: 'neutral', message: 'Enter a destination address.' };
    if (address.length < 26) return { level: 'warning', message: 'Address seems too short. Please double-check.' };
    if (/^(bc1|1|3|0x|T|So|addr)/.test(address) === false) return { level: 'warning', message: 'Unrecognized address format.'};
    if (address === '0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF') return { level: 'danger', message: 'This is a known burn address. Funds will be lost.' };
    if (address.toLowerCase().includes('binance') || address.toLowerCase().includes('coinbase') || address.toLowerCase().includes('kraken')) return { level: 'warning', message: 'Sending to a centralized exchange may reduce privacy.' };
    return { level: 'safe', message: 'Address health check passed.' };
};

const handleDownloadProof = (mix: MixTransaction) => {
    const proofContent = JSON.stringify({
        transactionId: mix.id,
        asset: mix.asset.ticker,
        network: mix.asset.network,
        amount: mix.amount,
        destination: mix.destinationAddress,
        completedAt: new Date().toISOString(),
        zkProofHash: mix.zkProofHash,
        complianceEnabled: mix.complianceMode,
    }, null, 2);

    const blob = new Blob([proofContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `valifi_zk_proof_${mix.id.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const PrivacyView: React.FC = () => {
    const [selectedAsset, setSelectedAsset] = useState('BTC');
    const [selectedNetwork, setSelectedNetwork] = useState('Bitcoin');
    const [destinationAddress, setDestinationAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [privacyLevel, setPrivacyLevel] = useState(50);
    const [complianceMode, setComplianceMode] = useState(false);
    const [mixHistory, setMixHistory] = useState<MixTransaction[]>([]);
    const [activeMixId, setActiveMixId] = useState<string | null>(null);

    const assetConfig = MIXABLE_ASSETS[selectedAsset];
    const activeMix = useMemo(() => mixHistory.find(m => m.id === activeMixId), [mixHistory, activeMixId]);
    const addressAnalysis = useMemo(() => analyzeDestinationAddress(destinationAddress), [destinationAddress]);

    useEffect(() => {
        const networks = Object.keys(assetConfig.networks);
        setSelectedNetwork(networks[0]);
    }, [selectedAsset, assetConfig]);
    
    const updateMix = useCallback((id: string, updates: Partial<MixTransaction>) => {
        setMixHistory(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    }, []);

    useEffect(() => {
        if (!activeMix) return;
        
        let timer: number | undefined;

        const simulationStep = () => {
            switch (activeMix.status) {
                case 'Awaiting Deposit':
                    timer = window.setTimeout(() => updateMix(activeMix.id, { status: 'Confirming' }), 12000);
                    break;
                case 'Confirming':
                    if (activeMix.confirmations >= activeMix.requiredConfirmations) {
                        timer = window.setTimeout(() => updateMix(activeMix.id, { status: 'Mixing' }), 1000);
                    } else {
                        timer = window.setInterval(() => {
                            setMixHistory(prev => prev.map(m => 
                                m.id === activeMix.id && m.status === 'Confirming' 
                                ? { ...m, confirmations: m.confirmations + 1 }
                                : m
                            ));
                        }, 4000);
                    }
                    break;
                case 'Mixing':
                    const mixDuration = 8000 + (activeMix.privacyLevel * 250);
                    timer = window.setTimeout(() => {
                        updateMix(activeMix.id, { 
                            status: 'Completed', 
                            zkProofHash: `zk_proof_${crypto.randomUUID()}`
                        });
                        setTimeout(() => setActiveMixId(null), 5000);
                    }, mixDuration);
                    break;
                default:
                    break;
            }
        };

        simulationStep();

        return () => {
            clearTimeout(timer);
            clearInterval(timer);
        };
    }, [activeMix, updateMix]);
    
    const handleGenerateDepositAddress = () => {
        const numericAmount = parseFloat(amount);
        if(isNaN(numericAmount) || numericAmount <= 0) return;
        if(addressAnalysis.level === 'danger') return;

        const networkConfig = assetConfig.networks[selectedNetwork];
        const newMix: MixTransaction = {
            id: `mix_${Date.now()}`,
            date: new Date().toISOString(),
            asset: { ticker: selectedAsset, Icon: assetConfig.Icon, network: selectedNetwork },
            amount: numericAmount,
            status: 'Awaiting Deposit',
            privacyLevel,
            complianceMode,
            depositAddress: generateDepositAddress(networkConfig.addressPrefix),
            destinationAddress,
            confirmations: 0,
            requiredConfirmations: networkConfig.requiredConfirmations,
        };

        setMixHistory(prev => [newMix, ...prev]);
        setActiveMixId(newMix.id);
    };

    const renderAnonymityDescription = () => {
        if (privacyLevel <= 25) return "Basic routing, minimal delay. Suitable for low-risk transfers.";
        if (privacyLevel <= 50) return "Standard multi-path routing with moderate delays.";
        if (privacyLevel <= 75) return "Advanced AI-driven routing across multiple pools with significant randomized delays.";
        return "Maximum security protocol. Utilizes multi-layer obfuscation, extended time-locks, and Tor network integration simulation.";
    };

    const inputClass = "w-full bg-input border border-border rounded-lg py-3 px-4 text-foreground appearance-none";
    const selectClass = `${inputClass} bg-no-repeat bg-right_1rem_center [background-size:1.5em_1.5em]`;
    const rangeClass = "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer";

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 view-container">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">zk-SNARK Privacy Hub</h1>
                <p className="text-muted-foreground mt-2 max-w-3xl">A next-generation tumbler using zero-knowledge proofs to break the on-chain link between sender and receiver.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3">
                    {activeMix ? (
                        <Card className="p-6 space-y-4">
                             <h2 className="text-xl font-semibold text-foreground">Mixing in Progress</h2>
                             <div className="bg-secondary p-4 rounded-lg border border-border space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount:</span> <span className="font-bold text-foreground">{activeMix.amount} {activeMix.asset.ticker}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status:</span> <span className={`font-bold ${activeMix.status === 'Completed' ? 'text-emerald-400' : 'text-primary'}`}>{activeMix.status}</span></div>
                             </div>
                             
                             <div className="text-center space-y-3 pt-4">
                                <h3 className="text-muted-foreground">Please send exactly <span className="font-bold text-primary">{activeMix.amount} {activeMix.asset.ticker}</span> to the address below:</h3>
                                <div className="bg-white p-2 rounded-lg inline-block"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${activeMix.depositAddress}&bgcolor=ffffff&color=0f172a&qzone=1`} alt="Deposit QR"/></div>
                                <div className="flex items-center gap-2 bg-secondary p-2 rounded-lg">
                                    <p className="font-mono text-xs text-muted-foreground break-all">{activeMix.depositAddress}</p>
                                    <button onClick={() => navigator.clipboard.writeText(activeMix.depositAddress)} className="text-muted-foreground hover:text-foreground"><CopyIcon className="w-4 h-4"/></button>
                                </div>
                             </div>

                             <div className="pt-4 space-y-3">
                                <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                                     <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500" style={{width: `${(activeMix.confirmations / activeMix.requiredConfirmations) * 100}%`}}></div>
                                </div>
                                <p className="text-sm text-center text-muted-foreground">
                                    {activeMix.status === 'Awaiting Deposit' && `Waiting for deposit...`}
                                    {activeMix.status === 'Confirming' && `Confirming on blockchain... (${activeMix.confirmations}/${activeMix.requiredConfirmations})`}
                                    {activeMix.status === 'Mixing' && `Mixing funds through zk-SNARK protocol...`}
                                    {activeMix.status === 'Completed' && `Mix complete! Funds sent to destination.`}
                                </p>
                             </div>
                        </Card>
                    ) : (
                        <Card className="p-6 space-y-6">
                            <h2 className="text-xl font-semibold text-foreground">Create a New Mix</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative"><select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)} className={selectClass}><option value="" disabled>Select Asset</option>{Object.keys(MIXABLE_ASSETS).map(key => <option key={key} value={key}>{key}</option>)}</select><ChevronDownIcon className="w-5 h-5 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" /></div>
                                <div className="relative"><select value={selectedNetwork} onChange={e => setSelectedNetwork(e.target.value)} className={selectClass}><option value="" disabled>Select Network</option>{Object.keys(assetConfig.networks).map(net => <option key={net} value={net}>{net}</option>)}</select><ChevronDownIcon className="w-5 h-5 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" /></div>
                            </div>
                            <div>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount to mix" className={inputClass}/>
                            </div>
                             <div>
                                <input type="text" value={destinationAddress} onChange={e => setDestinationAddress(e.target.value)} placeholder="New, unlinked destination address" className={inputClass}/>
                                <div className={`flex items-center gap-2 text-xs mt-2 p-2 rounded-md ${addressAnalysis.level === 'safe' ? 'bg-success/10 text-success' : addressAnalysis.level === 'warning' ? 'bg-amber-500/10 text-amber-400' : addressAnalysis.level === 'danger' ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground'}`}>
                                    {addressAnalysis.level === 'safe' && <CheckCircleIcon className="w-4 h-4"/>}
                                    {addressAnalysis.level === 'warning' && <AlertTriangleIcon className="w-4 h-4"/>}
                                    {addressAnalysis.level === 'danger' && <AlertTriangleIcon className="w-4 h-4"/>}
                                    {addressAnalysis.level === 'neutral' && <InfoIcon className="w-4 h-4"/>}
                                    <span>{addressAnalysis.message}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center"><label className="font-medium text-muted-foreground">Anonymity Level</label><span className="text-lg font-bold text-primary">{privacyLevel}</span></div>
                                <input type="range" min="1" max="100" value={privacyLevel} onChange={e => setPrivacyLevel(parseInt(e.target.value))} className={rangeClass}/>
                                <p className="text-xs text-muted-foreground text-center">{renderAnonymityDescription()}</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <label className="flex items-center cursor-pointer"><input type="checkbox" checked={complianceMode} onChange={e => setComplianceMode(e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-input rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div><span className="ml-3 text-sm font-medium text-foreground">Compliance Mode</span></label>
                                <button onClick={handleGenerateDepositAddress} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg transition-colors shadow-sm"><ShuffleIcon className="w-5 h-5" /><span>Generate Deposit Address</span></button>
                            </div>
                        </Card>
                    )}
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="text-lg font-semibold text-foreground p-6 border-b border-border flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-primary"/> Mixing History</h3>
                        <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
                            {mixHistory.length > 0 ? mixHistory.map(tx => (
                                <li key={tx.id} className="p-4 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <tx.asset.Icon className="w-8 h-8"/>
                                            <div>
                                                <p className="font-semibold text-foreground">{tx.amount} {tx.asset.ticker}</p>
                                                <p className="text-xs text-muted-foreground">{tx.asset.network}</p>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            tx.status === 'Completed' ? 'bg-success/10 text-success' :
                                            tx.status === 'Failed' ? 'bg-destructive/10 text-destructive' :
                                            'bg-primary/10 text-primary'
                                        }`}>{tx.status}</div>
                                    </div>
                                     {tx.status === 'Completed' && (
                                         <button onClick={() => handleDownloadProof(tx)} className="w-full text-center text-xs font-semibold text-primary hover:text-primary/80 bg-secondary hover:bg-accent py-1.5 rounded-md flex items-center justify-center gap-2">
                                             <DownloadIcon className="w-3.5 h-3.5"/> Download ZK Proof
                                         </button>
                                     )}
                                </li>
                            )) : <p className="text-center text-muted-foreground p-8">Your mixing history will appear here.</p>}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PrivacyView;