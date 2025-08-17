import React from 'react';
import type { Asset, REITProperty } from '../types';
import { CloseIcon, RefreshIcon, ArrowUpRightIcon } from './icons';
import { useCurrency } from './CurrencyContext';

interface REITManageModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: Asset;
    property: REITProperty;
}

const REITManageModal: React.FC<REITManageModalProps> = ({ isOpen, onClose, asset, property }) => {
    const { formatCurrency } = useCurrency();
    const { reitDetails } = asset;

    if (!isOpen || !reitDetails) return null;

    const totalInvested = asset.initialInvestment || 0;
    const currentTotalValue = asset.valueUSD;
    const totalReturn = currentTotalValue - totalInvested;

    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-popover border border-border rounded-2xl w-full max-w-2xl text-popover-foreground" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold">Manage: {property.name}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-popover-foreground p-2 rounded-full hover:bg-accent"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-secondary p-4 rounded-lg border border-border space-y-3">
                             <h3 className="font-semibold text-primary">Investment Summary</h3>
                             <div className="text-sm space-y-2">
                                <div className="flex justify-between"><span className="text-muted-foreground">Total Invested:</span> <span className="font-semibold text-foreground blur-balance">{formatCurrency(totalInvested)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Current Value:</span> <span className="font-semibold text-foreground blur-balance">{formatCurrency(currentTotalValue)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Total Return:</span> <span className={`font-semibold blur-balance ${totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>{totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Monthly Dividend (Est.):</span> <span className="font-semibold text-foreground blur-balance">{formatCurrency(currentTotalValue * (property.monthlyROI / 100))}</span></div>
                             </div>
                        </div>
                         <div className="bg-secondary rounded-lg overflow-hidden border border-border">
                             <img src={property.imageUrl} alt={property.name} className="w-full h-32 object-cover" />
                             <div className="p-4">
                                 <p className="font-semibold text-foreground">{property.name}</p>
                                 <p className="text-sm text-muted-foreground">{property.address}</p>
                             </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="font-semibold text-primary">Investment History</h3>
                        <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-secondary sticky top-0">
                                    <tr className="border-b border-border">
                                        <th className="p-2 font-medium text-muted-foreground">Date</th>
                                        <th className="p-2 font-medium text-muted-foreground">Action</th>
                                        <th className="p-2 font-medium text-muted-foreground text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {asset.logs && asset.logs.filter(l => l.action === 'Buy' || l.action === 'Dividend Payout').map(log => (
                                        <tr key={log.id}>
                                            <td className="p-2 text-muted-foreground">{new Date(log.date).toLocaleDateString()}</td>
                                            <td className="p-2">{log.action}</td>
                                            <td className={`p-2 font-mono text-right ${log.action === 'Dividend Payout' ? 'text-success' : 'text-foreground'}`}>{formatCurrency(log.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 pt-4 border-t border-border">
                        <button disabled className="w-full flex items-center justify-center gap-2 bg-secondary text-muted-foreground font-semibold py-2.5 px-4 rounded-lg cursor-not-allowed">
                            <RefreshIcon className="w-4 h-4" /> Reinvest Dividends
                        </button>
                         <button disabled className="w-full flex items-center justify-center gap-2 bg-secondary text-muted-foreground font-semibold py-2.5 px-4 rounded-lg cursor-not-allowed">
                            <ArrowUpRightIcon className="w-4 h-4" /> Withdraw Dividends
                        </button>
                    </div>
                     <p className="text-xs text-center text-muted-foreground">Dividend management features are coming soon.</p>
                </div>
            </div>
        </div>
    );
};

export default REITManageModal;