import React, { useState, useMemo } from 'react';
import type { Portfolio, Asset, Transaction, ViewType, InvestmentStatus, AssetType as AssetTypeEnum } from '../types';
import { AssetType } from '../types';
import { ArrowUpIcon, ArrowDownIcon, ClockIcon, ArrowUpRightIcon, DownloadIcon, CheckCircleIcon, XCircleIcon, LockIcon, RefreshIcon, InvestmentsIcon, SwapIcon, CardIcon, LoanIcon } from './icons';
import ForumChat from './ForumChat';
import MiniRoiChart from './MiniRoiChart';
import WorldClockFXTicker from './WorldClockFXTicker';
import { useCurrency } from './CurrencyContext';
import { useTranslation } from 'react-i18next';
import * as apiService from '../services/api';

// Reusable Card Component
const Card: React.FC<{children: React.ReactNode, className?: string, element?: 'div' | 'section'}> = ({ children, className = '', element = 'div' }) => {
  const Component = element;
  return (
    <Component className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </Component>
  );
};

// --- NEW DASHBOARD COMPONENTS ---

const PortfolioPerformanceChart: React.FC<{ portfolio: Portfolio }> = ({ portfolio }) => {
    const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'All'>('7D');
    const { t } = useTranslation('dashboard');

    const chartData = useMemo(() => {
        const data: { day: number; value: number }[] = [];
        const days = timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : 90;
        const endValue = portfolio.totalValueUSD;

        let currentValue = endValue * (1 - (Math.random() * 0.05 + 0.02) * (days/30));
        if (currentValue <= 0) currentValue = endValue * 0.8;

        for (let i = 0; i <= days; i++) {
            data.push({ day: i, value: currentValue });
            const dailyChange = (Math.random() - 0.48) * (endValue * 0.015);
            currentValue += dailyChange;
        }

        const lastDataValue = data[days]?.value;
        if (typeof lastDataValue === 'number') {
            const adjustment = endValue - lastDataValue;
            for (let i = 0; i <= days; i++) {
                data[i].value += adjustment * (i / days);
            }
        }
        
        return data;
    }, [portfolio.totalValueUSD, timeRange]);
    
    const TimeRangeButton: React.FC<{label: '7D' | '30D' | 'All'}> = ({label}) => (
        <button onClick={() => setTimeRange(label)} className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${timeRange === label ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
            {label}
        </button>
    );

    return (
        <Card>
            <div className="p-4 flex justify-between items-center border-b border-border">
                <h3 className="text-base font-semibold text-foreground">{t('performance')}</h3>
                <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg">
                    <TimeRangeButton label="7D" />
                    <TimeRangeButton label="30D" />
                    <TimeRangeButton label="All" />
                </div>
            </div>
            <div className="p-2">
                <MiniRoiChart data={chartData} className="h-32" />
            </div>
        </Card>
    );
};

const QuickActions: React.FC<{
    onDepositClick: () => void;
    onWithdrawClick: () => void;
    setCurrentView: (view: ViewType) => void;
}> = ({ onDepositClick, onWithdrawClick, setCurrentView }) => {
    const { t } = useTranslation('dashboard');
    const actions = [
        { label: t('quick_actions_add_funds'), Icon: DownloadIcon, onClick: onDepositClick },
        { label: t('quick_actions_invest_now'), Icon: InvestmentsIcon, onClick: () => setCurrentView('investments') },
        { label: t('quick_actions_swap'), Icon: SwapIcon, onClick: () => setCurrentView('exchange') },
        { label: t('quick_actions_withdraw'), Icon: ArrowUpRightIcon, onClick: onWithdrawClick },
        { label: t('quick_actions_get_card'), Icon: CardIcon, onClick: () => setCurrentView('cards') },
        { label: t('quick_actions_apply_loan'), Icon: LoanIcon, onClick: () => setCurrentView('loans') },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {actions.map(({ label, Icon, onClick }) => (
                <button key={label} onClick={onClick} className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border/80 transition-all duration-200 group transform hover:-translate-y-1">
                    <Icon className="w-7 h-7 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                </button>
            ))}
        </div>
    );
};

const TopMovers: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    const { t } = useTranslation('dashboard');
    const [filter, setFilter] = useState<'All' | 'Crypto' | 'Stock'>('All');

    const movers = useMemo(() => {
        const filtered = assets.filter(a => a.type !== AssetType.CASH && (filter === 'All' || a.type === filter));
        const sorted = [...filtered].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
        return sorted.slice(0, 5);
    }, [assets, filter]);

    const FilterButton: React.FC<{label: 'All' | 'Crypto' | 'Stock', translationKey: 'filter_all' | 'filter_crypto' | 'filter_stock'}> = ({label, translationKey}) => (
        <button onClick={() => setFilter(label)} className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${filter === label ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
            {t(translationKey)}
        </button>
    );
    
    const MoverItem: React.FC<{asset: Asset}> = ({ asset }) => (
        <li className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
            <div className="flex items-center gap-3">
                <asset.Icon className="w-8 h-8"/>
                <div>
                    <p className="font-semibold text-sm text-foreground">{asset.ticker}</p>
                    <p className="text-xs text-muted-foreground">{asset.type}</p>
                </div>
            </div>
            <p className={`font-semibold text-sm ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
            </p>
        </li>
    );

    return (
        <Card>
            <div className="p-4 flex justify-between items-center border-b border-border">
                <h3 className="text-base font-semibold text-foreground">{t('top_movers')}</h3>
                <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg">
                    <FilterButton label="All" translationKey="filter_all" />
                    <FilterButton label="Crypto" translationKey="filter_crypto" />
                    <FilterButton label="Stock" translationKey="filter_stock" />
                </div>
            </div>
            <div className="p-2">
                {movers.length > 0 ? (
                    <ul className="space-y-1">{movers.map(a => <MoverItem key={a.id} asset={a}/>)}</ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No assets match the filter.</p>
                )}
            </div>
        </Card>
    );
};

const DualBalanceSummary: React.FC<{ 
    mainBalance: number; 
    investmentBalance: number; 
    totalChangeValue: number; 
    totalChangePercent: number;
    onDepositClick: () => void;
    onWithdrawClick: () => void;
}> = ({ mainBalance, investmentBalance, totalChangeValue, totalChangePercent, onDepositClick, onWithdrawClick }) => {
    const { formatCurrency } = useCurrency();
    const { t } = useTranslation('dashboard');
    const isPositive = totalChangePercent >= 0;
    return (
        <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="pb-6 md:pb-0 md:pr-6">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">{t('main_balance')}</p>
                        <div className="flex items-center gap-2">
                            <button onClick={onDepositClick} title="Deposit" className="p-2 rounded-full bg-secondary hover:bg-primary/10 text-primary transition-colors"><DownloadIcon className="w-5 h-5"/></button>
                            <button onClick={onWithdrawClick} title="Withdraw" className="p-2 rounded-full bg-secondary hover:bg-destructive/10 text-destructive transition-colors"><ArrowUpRightIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <p className="text-5xl font-bold text-foreground tracking-tighter mt-2"><span className="blur-balance">{formatCurrency(mainBalance)}</span></p>
                    <p className="text-sm text-muted-foreground mt-1">{t('main_balance_desc')}</p>
                </div>
                <div className="pt-6 md:pt-0 md:pl-6">
                    <p className="text-sm text-muted-foreground">{t('investment_balance')}</p>
                    <div className="flex items-baseline gap-4 mt-2">
                        <p className="text-5xl font-bold text-foreground tracking-tighter"><span className="blur-balance">{formatCurrency(investmentBalance)}</span></p>
                        <div className={`flex items-center text-lg font-semibold px-2 py-0.5 rounded-md ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          {isPositive ? <ArrowUpIcon className="w-5 h-5"/> : <ArrowDownIcon className="w-5 h-5"/>}
                          <span className="ml-1">{totalChangePercent.toFixed(2)}%</span>
                        </div>
                    </div>
                     <p className={`text-sm font-medium ml-1 mt-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
                       <span className="blur-balance">{isPositive ? '+' : ''}{formatCurrency(totalChangeValue)}</span> (24h)
                     </p>
                </div>
            </div>
        </Card>
    );
};

const InvestmentList: React.FC<{ investments: Asset[]; onTransfer: (assetId: string) => void }> = ({ investments, onTransfer }) => {
    const { formatCurrency } = useCurrency();
    const { t } = useTranslation('dashboard');
    
    const getStatusChip = (status: InvestmentStatus) => {
        const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0';
        switch (status) {
            case 'Active': return `${baseClasses} bg-primary/10 text-primary`;
            case 'Matured': return `${baseClasses} bg-success/10 text-success`;
            default: return `${baseClasses} bg-secondary text-secondary-foreground`;
        }
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold text-foreground p-6 border-b border-border">{t('active_investments')}</h3>
            <div className="divide-y divide-border">
              {investments.map(inv => (
                <div key={inv.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-accent">
                  <div className="flex items-center gap-4 flex-grow min-w-[200px]">
                      <inv.Icon className="w-10 h-10 flex-shrink-0" />
                      <div>
                          <p className="font-semibold text-foreground">{inv.name}</p>
                          <p className="text-sm text-muted-foreground">{inv.ticker}</p>
                      </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-foreground font-mono"><span className="blur-balance">{formatCurrency(inv.valueUSD)}</span></p>
                      <p className="text-sm text-muted-foreground">{t('return')}: +{inv.totalEarnings ? formatCurrency(inv.totalEarnings) : 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {inv.status && <span className={getStatusChip(inv.status)}>{inv.status}</span>}
                     {inv.status === 'Matured' ? (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onTransfer(inv.id); }} 
                            className="bg-success hover:bg-success/90 text-success-foreground font-semibold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm"
                        >
                            {t('transfer')}
                        </button>
                    ) : (
                        <div className="relative group/tooltip inline-block">
                            <button disabled className="bg-secondary text-muted-foreground font-semibold py-2 px-4 rounded-lg text-sm cursor-not-allowed flex items-center gap-2"><LockIcon className="w-4 h-4"/> {t('locked')}</button>
                            <div className="absolute bottom-full mb-2 right-0 w-64 bg-popover text-popover-foreground text-xs text-left rounded-lg p-3 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg border border-border z-10">
                                {t('locked_tooltip', { date: inv.maturityDate ? new Date(inv.maturityDate).toLocaleDateString() : 'N/A' })}
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
        </Card>
    );
};

const TransactionHistory: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const { formatCurrency } = useCurrency();
    const { t } = useTranslation('dashboard');
    
    const getTransactionIcon = (tx: Transaction) => {
        const iconStyle = "w-5 h-5";
        switch (tx.type) {
            case 'Deposit': return <DownloadIcon className={`${iconStyle} text-emerald-400`} />;
            case 'Withdrawal': return <ArrowUpRightIcon className={`${iconStyle} text-red-400`} />;
            case 'Trade': return <SwapIcon className={`${iconStyle} text-primary`} />;
            case 'ROI Payout': return <ArrowDownIcon className={`${iconStyle} text-green-400`} />;
            case 'Maturity': return <CheckCircleIcon className={`${iconStyle} text-emerald-400`} />;
            default: return <ClockIcon className={`${iconStyle} text-muted-foreground`} />;
        }
    };
    
    const getAmountColor = (tx: Transaction) => {
        if (tx.amountUSD < 0) return 'text-red-400';
        return 'text-emerald-400';
    };

    return (
    <Card>
        <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">{t('recent_activity')}</h3>
        </div>
        <ul className="divide-y divide-border max-h-[26rem] overflow-y-auto">
            {transactions.slice(0, 15).map(tx => (
                <li key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-secondary rounded-full border border-border">
                            {getTransactionIcon(tx)}
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{tx.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground">{tx.status}</p>
                            </div>
                        </div>
                    </div>
                    <p className={`font-semibold text-lg font-mono ${getAmountColor(tx)}`}>
                        <span className="blur-balance">{tx.amountUSD > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amountUSD))}</span>
                    </p>
                </li>
            ))}
             {transactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
            )}
        </ul>
    </Card>
);
};

interface DashboardViewProps {
  portfolio: Portfolio;
  setCurrentView: (view: ViewType) => void;
  onTransferToMain: (assetId: string) => void;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ portfolio, setCurrentView, onTransferToMain, onDepositClick, onWithdrawClick }) => {
  const mainBalance = portfolio.assets.find(a => a.type === AssetType.CASH)?.valueUSD || 0;
  const investmentBalance = portfolio.totalValueUSD - mainBalance;
  const investmentAssets = portfolio.assets.filter(a => a.type !== AssetType.CASH);
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 view-container">
      <DualBalanceSummary
          mainBalance={mainBalance} 
          investmentBalance={investmentBalance}
          totalChangeValue={portfolio.change24hValue}
          totalChangePercent={portfolio.change24hPercent}
          onDepositClick={onDepositClick}
          onWithdrawClick={onWithdrawClick}
      />
      <QuickActions 
        onDepositClick={onDepositClick}
        onWithdrawClick={onWithdrawClick}
        setCurrentView={setCurrentView}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <InvestmentList investments={investmentAssets} onTransfer={onTransferToMain} />
            <TransactionHistory transactions={portfolio.transactions} />
        </div>
        <div className="lg:col-span-1 space-y-8">
            <PortfolioPerformanceChart portfolio={portfolio} />
            <ForumChat portfolio={portfolio} api={apiService.callCoPilot} />
            <WorldClockFXTicker />
            <TopMovers assets={portfolio.assets} />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
