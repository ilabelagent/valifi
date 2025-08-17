import React, { useMemo, useState, useEffect } from 'react';
import type { Asset, InvestmentLog } from '../types';
import { CloseIcon, ClockIcon, CheckCircleIcon, RefreshIcon, ArrowUpRightIcon } from './icons';
import MiniRoiChart from './MiniRoiChart';
import { useCurrency } from './CurrencyContext';
import { AssetType } from '../types';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

const Stat: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = ''}) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-xl font-semibold text-foreground mt-1 ${className}`}><span className="blur-balance">{value}</span></p>
    </div>
);

interface InvestmentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: Asset | null;
    onReinvest: (assetId: string) => void;
    onTransfer: (assetId: string) => void;
}

// Chart data generation function
const generateChartData = (asset: Asset) => {
    const data: { day: number; value: number }[] = [];
    const days = 30;
    const startValue = asset.initialInvestment || asset.valueUSD * 0.8; // Fallback for no initial investment
    const endValue = asset.valueUSD;

    const valueRange = endValue - startValue;

    for (let i = 0; i <= days; i++) {
        // Create a general trend line
        const trendValue = startValue + (valueRange / days) * i;
        // Add some random noise for volatility. Make it smaller if value is small
        const noiseFactor = Math.max(0.01, valueRange) * 0.2; // 20% of total change as max noise
        const noise = (Math.random() - 0.5) * noiseFactor;
        
        // Ensure the last point is exactly the current value
        const finalValue = i === days ? endValue : Math.max(0, trendValue + noise);

        data.push({
            day: i,
            value: finalValue,
        });
    }
    return data;
};

const CountdownTimer: React.FC<{ expiryDate: string }> = ({ expiryDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiryDate) - +new Date();
        let timeLeft: { days?: number, hours?: number, minutes?: number, seconds?: number } = {};

        if (difference > 0) {
          timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          };
        }
        return timeLeft;
    };
    
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
        if (value === undefined) return null;
        return (
            <div key={interval} className="text-center">
                <span className="text-2xl font-bold font-mono text-primary">{String(value).padStart(2, '0')}</span>
                <span className="text-xs uppercase text-muted-foreground block">{interval}</span>
            </div>
        );
    });

    return timerComponents.some(c => c !== null) ? 
        <div className="flex justify-around gap-2 p-3 bg-secondary rounded-lg">{timerComponents}</div> : 
        <div className="text-center text-success font-semibold p-3 bg-secondary rounded-lg">Plan Matured</div>;
};


const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({ isOpen, onClose, asset, onReinvest, onTransfer }) => {
    const { formatCurrency } = useCurrency();
    
    const chartData = useMemo(() => {
        if (!asset) return [];
        return generateChartData(asset);
    }, [asset]);

    if (!isOpen || !asset) return null;

    const netROI = asset.initialInvestment && asset.initialInvestment > 0 
        ? ((asset.totalEarnings || 0) / asset.initialInvestment) * 100 
        : 0;

    const isSpectrumPlan = asset.type !== AssetType.CASH &&
                           asset.type !== AssetType.NFT &&
                           asset.type !== AssetType.REIT &&
                           !asset.name.toLowerCase().includes('staking') &&
                           !asset.stockStakeDetails &&
                           !!asset.maturityDate;

    const getActionLabel = (action: InvestmentLog['action']) => {
        if (action === 'Reward') return 'Profit Payout (ROI)';
        return action;
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade"
            onClick={onClose}
        >
            <div 
                className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-3xl transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <asset.Icon className="w-10 h-10"/>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">{asset.name}</h2>
                            <p className="text-muted-foreground">{asset.ticker}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-accent"><CloseIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                    <Card className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 bg-card/50">
                        <Stat label="Current Value" value={formatCurrency(asset.valueUSD)} />
                        <Stat label="Total Invested" value={formatCurrency(asset.initialInvestment || 0)} />
                        <Stat label="Total Earnings" value={formatCurrency(asset.totalEarnings || 0)} className="text-emerald-400" />
                        <Stat label="Net ROI" value={`${netROI.toFixed(2)}%`} className={netROI >= 0 ? 'text-emerald-400' : 'text-red-400'} />
                    </Card>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <Card className="p-6 space-y-4 bg-card/50">
                            <h3 className="font-semibold text-lg text-foreground">Details</h3>
                             <div className="text-sm space-y-2">
                                 <div className="flex justify-between"><span className="text-muted-foreground">Status:</span> <span className={`font-semibold ${asset.status === 'Matured' ? 'text-success' : 'text-primary'}`}>{asset.status}</span></div>
                                 <div className="flex justify-between"><span className="text-muted-foreground">Maturity Date:</span> <span className="font-mono text-foreground">{asset.maturityDate ? new Date(asset.maturityDate).toLocaleDateString() : 'N/A'}</span></div>
                                 <div className="flex justify-between"><span className="text-muted-foreground">Expected APY:</span> <span className="font-mono text-foreground">{asset.expectedReturn?.toFixed(1) || 'N/A'}%</span></div>
                             </div>
                             {isSpectrumPlan && asset.maturityDate && asset.status === 'Active' && (
                                <div className="pt-4 mt-4 border-t border-border">
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Time Until Maturity</h4>
                                    <CountdownTimer expiryDate={asset.maturityDate} />
                                </div>
                            )}
                              <div className="flex gap-2 pt-4 border-t border-border">
                                <button
                                    onClick={() => onReinvest(asset.id)}
                                    disabled={asset.status !== 'Active' || !asset.totalEarnings || asset.totalEarnings <= 0}
                                    className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-primary/20 text-foreground font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed">
                                    <RefreshIcon className="w-4 h-4" /> Reinvest
                                </button>
                                <button
                                    onClick={() => onTransfer(asset.id)}
                                    disabled={asset.status !== 'Matured'}
                                    className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-success/20 text-foreground font-semibold py-2 px-4 rounded-lg transition-colors text-sm disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed">
                                    <ArrowUpRightIcon className="w-4 h-4"/> Transfer
                                </button>
                            </div>
                        </Card>
                        <Card className="p-4 flex flex-col justify-between bg-card/50">
                             <h4 className="text-sm font-semibold text-foreground px-2">30-Day Performance</h4>
                             <MiniRoiChart data={chartData} className="h-28" />
                        </Card>
                    </div>

                    <Card className="bg-card/50">
                        <h3 className="font-semibold text-lg text-foreground p-6 border-b border-border">Investment Log Center</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-secondary/50">
                                    <tr>
                                        {['Date', 'Action', 'Amount', 'Status', 'Reference ID'].map(h => 
                                            <th key={h} className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {asset.logs && asset.logs.length > 0 ? asset.logs.map(log => (
                                        <tr key={log.id}>
                                            <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{new Date(log.date).toLocaleString()}</td>
                                            <td className="p-4 text-sm"><span className="font-semibold text-foreground">{getActionLabel(log.action)}</span></td>
                                            <td className={`p-4 text-sm font-mono ${log.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                <span className="blur-balance">{log.amount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(log.amount))}</span>
                                            </td>
                                            <td className="p-4 text-sm">
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${log.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-amber-400'}`}>
                                                    {log.status === 'Completed' ? <CheckCircleIcon className="w-3 h-3"/> : <ClockIcon className="w-3 h-3"/>}
                                                    {log.status}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-mono text-muted-foreground">{log.referenceId}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="text-center p-8 text-muted-foreground">No logs available for this investment.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InvestmentDetailModal;