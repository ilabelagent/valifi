import React, { useState } from 'react';
import type { BankAccount, BankAccountStatus } from '../types';
import { BankIcon, PlusCircleIcon, TrashIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from './icons';
import LinkBankAccountModal from './LinkBankAccountModal';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card/50 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl shadow-black/20 ${className}`}>
      {children}
    </div>
);

interface BankingViewProps {
    linkedAccounts: BankAccount[];
    onLinkAccount: (accountData: Omit<BankAccount, 'id' | 'status'>) => void;
    setLinkedBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
}

const AccountStatusChip: React.FC<{ status: BankAccountStatus }> = ({ status }) => {
    const config = {
        Verified: { text: 'Verified', Icon: CheckCircleIcon, color: 'bg-success/10 text-success' },
        Pending: { text: 'Pending', Icon: ClockIcon, color: 'bg-amber-500/10 text-amber-400 animate-pulse' },
        Rejected: { text: 'Rejected', Icon: XCircleIcon, color: 'bg-destructive/10 text-destructive' },
    }[status];

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${config.color}`}>
            <config.Icon className="w-3.5 h-3.5" />
            <span>{config.text}</span>
        </div>
    );
};


const BankingView: React.FC<BankingViewProps> = ({ linkedAccounts, onLinkAccount, setLinkedBankAccounts }) => {
    const [isLinkModalOpen, setLinkModalOpen] = useState(false);

    const handleDeleteAccount = (id: string) => {
        if(window.confirm('Are you sure you want to remove this bank account?')) {
            setLinkedBankAccounts(prev => prev.filter(acc => acc.id !== id));
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 view-container">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                        <BankIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Global Banking</h1>
                        <p className="text-muted-foreground mt-1">Manage your linked bank accounts for seamless deposits and withdrawals.</p>
                    </div>
                </div>
                 <button onClick={() => setLinkModalOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm shadow-md shadow-primary/20">
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Link New Account</span>
                </button>
            </div>
            
            <Card>
                 <h3 className="text-lg font-semibold text-foreground p-6 border-b border-border/50">Linked Accounts</h3>
                 {linkedAccounts.length > 0 ? (
                    <ul className="divide-y divide-border/50">
                        {linkedAccounts.map(account => (
                            <li key={account.id} className="flex flex-wrap items-center justify-between p-4 hover:bg-accent/30 transition-colors group">
                                <div className="flex items-center gap-4">
                                     <img src={`https://flagcdn.com/w40/${account.countryCode.toLowerCase()}.png`} alt={`${account.countryCode} flag`} className="w-10 h-7 rounded-md object-cover" />
                                     <div>
                                        <p className="font-bold text-foreground">{account.nickname}</p>
                                        <p className="text-sm text-muted-foreground">{account.accountDisplay}</p>
                                     </div>
                                </div>
                                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                    <AccountStatusChip status={account.status} />
                                    <button onClick={() => handleDeleteAccount(account.id)} className="text-muted-foreground hover:text-destructive p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                 ) : (
                    <div className="text-center py-16 px-6">
                        <BankIcon className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                        <h4 className="text-lg font-semibold text-foreground mt-4">No Bank Accounts Linked</h4>
                        <p className="text-muted-foreground mt-1 max-w-md mx-auto">Link your bank account to easily move funds between Valifi and your bank.</p>
                         <button onClick={() => setLinkModalOpen(true)} className="mt-6 flex items-center gap-2 mx-auto bg-secondary hover:bg-primary text-foreground hover:text-primary-foreground font-semibold py-2 px-4 rounded-lg transition-colors text-sm shadow-md">
                            <PlusCircleIcon className="w-5 h-5" />
                            <span>Link Your First Account</span>
                        </button>
                    </div>
                 )}
            </Card>

            <LinkBankAccountModal 
                isOpen={isLinkModalOpen}
                onClose={() => setLinkModalOpen(false)}
                onLinkAccount={onLinkAccount}
            />
        </div>
    );
};

export default BankingView;
