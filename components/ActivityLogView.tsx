import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Asset, Transaction } from '../types';
import { DownloadIcon, ArrowUpRightIcon, SwapIcon, UsdIcon, CheckCircleIcon, ClockIcon, FilterIcon } from './icons';
import { useCurrency } from './CurrencyContext';

interface UnifiedLog {
    id: string;
    date: string;
    assetName: string;
    assetIcon: React.FC<any>;
    action: string;
    amountUSD: number;
    status: string;
    referenceId: string;
}

const ActivityLogView: React.FC<{ assets: Asset[], transactions: Transaction[] }> = ({ assets, transactions }) => {
    const { t } = useTranslation('common');
    const { formatCurrency } = useCurrency();
    
    const unifiedLogs = useMemo(() => {
        const assetLogs: UnifiedLog[] = [];
        assets.forEach(asset => {
            if(asset.logs) {
                asset.logs.forEach(log => {
                    assetLogs.push({
                        id: log.id,
                        date: log.date,
                        assetName: asset.name,
                        assetIcon: asset.Icon,
                        action: log.action,
                        amountUSD: ['Buy', 'Withdrawal', 'Stake Withdrawal Request', 'Sell'].includes(log.action) ? -log.amount : log.amount,
                        status: log.status,
                        referenceId: log.referenceId,
                    });
                });
            }
        });

        const transactionLogs: UnifiedLog[] = transactions
            .map(tx => {
                const assetInvolved = assets.find(a => tx.description.includes(a.ticker) || tx.description.includes(a.name));
                return {
                    id: tx.id,
                    date: tx.date,
                    assetName: assetInvolved?.name || tx.description,
                    assetIcon: assetInvolved?.Icon || UsdIcon,
                    action: tx.type,
                    amountUSD: tx.amountUSD,
                    status: tx.status,
                    referenceId: tx.txHash || tx.id.slice(0, 12),
                };
        });
        
        return [...assetLogs, ...transactionLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [assets, transactions]);

    const [filteredLogs, setFilteredLogs] = useState<UnifiedLog[]>(unifiedLogs);
    const [actionFilter, setActionFilter] = useState('All');
    
    const allActions = useMemo(() => ['All', ...Array.from(new Set(unifiedLogs.map(log => log.action)))], [unifiedLogs]);

    useEffect(() => {
        if (actionFilter === 'All') {
            setFilteredLogs(unifiedLogs);
        } else {
            setFilteredLogs(unifiedLogs.filter(log => log.action === actionFilter));
        }
    }, [actionFilter, unifiedLogs]);

    const getActionIcon = (action: string) => {
        switch(action) {
            case 'Buy':
            case 'Deposit':
            case 'Received':
                return <DownloadIcon className="w-5 h-5 text-emerald-400" />;
            case 'Sell':
            case 'Withdrawal':
            case 'Sent':
                return <ArrowUpRightIcon className="w-5 h-5 text-red-400" />;
            case 'Trade':
            case 'Compound':
            case 'Reinvestment':
            case 'P2P':
                return <SwapIcon className="w-5 h-5 text-primary" />;
            case 'Reward':
            case 'ROI Payout':
            case 'Dividend Payout':
            case 'Interest':
                return <UsdIcon className="w-5 h-5 text-green-400" />;
            case 'Maturity':
            case 'Maturity Transfer':
                return <CheckCircleIcon className="w-5 h-5 text-indigo-400" />;
            default:
                return <ClockIcon className="w-5 h-5 text-muted-foreground" />;
        }
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-end">
                <div className="relative">
                     <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="bg-secondary border border-border rounded-lg py-2 pl-9 pr-4 text-sm text-foreground">
                        {allActions.map(action => <option key={action} value={action}>{action}</option>)}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('date')}</th>
                            <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('description')}</th>
                            <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('actions')}</th>
                            <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">{t('amount')}</th>
                            <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                         {filteredLogs.length > 0 ? filteredLogs.map(log => (
                            <tr key={log.id} className="hover:bg-accent">
                                <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{new Date(log.date).toLocaleString()}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <log.assetIcon className="w-8 h-8"/>
                                        <span className="font-semibold text-foreground">{log.assetName}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        {getActionIcon(log.action)}
                                        <span className="font-medium text-card-foreground">{log.action}</span>
                                    </div>
                                </td>
                                <td className={`p-4 font-mono text-right ${log.amountUSD >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    <span className="blur-balance">{log.amountUSD >= 0 ? '+' : ''}{formatCurrency(Math.abs(log.amountUSD))}</span>
                                </td>
                                <td className="p-4 text-center">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${log.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-amber-400/10 text-amber-400'}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center p-16 text-muted-foreground">No logs found for this filter.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ActivityLogView;