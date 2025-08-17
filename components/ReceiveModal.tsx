import React, { useState } from 'react';
import type { HybridWalletAsset } from '../types';
import { CloseIcon, CopyIcon, AlertTriangleIcon } from './icons';

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

export default ReceiveModal;
