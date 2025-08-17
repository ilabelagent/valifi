import React from 'react';
import type { Asset } from '../types';
import { CloseIcon, RefreshIcon, ArrowUpRightIcon, LockIcon } from './icons';
import { useCurrency } from './CurrencyContext';
import { timeAgo } from './utils';

interface ManageStockStakeModalProps {
    isOpen: boolean;
    onClose: () => void;
    stakedAsset: Asset;
}

const ManageStockStakeModal: React.FC<ManageStockStakeModalProps> = ({ isOpen, onClose, stakedAsset }) => {
    const { formatCurrency } = useCurrency();
    const { stockStakeDetails, initialInvestment, valueUSD, totalEarnings } = stakedAsset;
    
    if (!isOpen || !stockStakeDetails) return null;

    const stakedDate = new Date(stockStakeDetails.stakedOn);
    const canCancel = new Date().getTime() - stakedDate.getTime() > 7 * 24 * 60 * 60 * 1000;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-popover border border-border rounded-2xl w-full max-w-lg text-popover-foreground" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold">Manage {stakedAsset.name}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-popover-foreground p-2 rounded-full hover:bg-accent"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="bg-secondary p-4 rounded-lg border border-border space-y-3">
                        <h3 className="font-semibold text-primary">Stake Overview</h3>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between"><span className="text-muted-foreground">Amount Staked:</span> <span className="font-semibold text-foreground blur-balance">{formatCurrency(initialInvestment || 0)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Current Value:</span> <span className="font-semibold text-foreground blur-balance">{formatCurrency(valueUSD)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">ROI Bracket:</span> <span className="font-semibold text-foreground">{stockStakeDetails.monthlyROI}% / month</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Total Returns So Far:</span> <span className="font-semibold text-success blur-balance">{formatCurrency(totalEarnings || 0)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Next Payout Date:</span> <span className="font-semibold text-foreground">{new Date(stockStakeDetails.nextPayoutDate).toLocaleDateString()}</span></div>
                             <div className="flex justify-between"><span className="text-muted-foreground">Stake Duration:</span> <span className="font-semibold text-foreground">{timeAgo(stockStakeDetails.stakedOn)}</span></div>
                        </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-border">
                         <h3 className="font-semibold text-primary">Actions</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button disabled className="flex items-center justify-center gap-2 bg-secondary text-muted-foreground font-semibold py-2.5 px-4 rounded-lg cursor-not-allowed">
                                <ArrowUpRightIcon className="w-4 h-4" /> Withdraw Profit
                            </button>
                             <button disabled className="flex items-center justify-center gap-2 bg-secondary text-muted-foreground font-semibold py-2.5 px-4 rounded-lg cursor-not-allowed">
                                <RefreshIcon className="w-4 h-4" /> Stake More
                            </button>
                         </div>
                         <button 
                            disabled={!canCancel} 
                            className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive font-semibold py-2.5 px-4 rounded-lg hover:bg-destructive/20 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                         >
                            <LockIcon className="w-4 h-4" /> Cancel Stake
                        </button>
                        {!canCancel && <p className="text-xs text-center text-muted-foreground">Stake can be cancelled after 7 days.</p>}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ManageStockStakeModal;