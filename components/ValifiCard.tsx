import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CardDetails } from '../types';
import { ValifiLogo } from './icons';

interface ValifiCardProps {
    cardDetails: CardDetails;
    isMasked: boolean;
}

const ValifiCard: React.FC<ValifiCardProps> = ({ cardDetails, isMasked }) => {
    const { t } = useTranslation('cards');
    const { status, type, currency, theme, number, expiry, cvv, isFrozen } = cardDetails;

    const themeClasses: Record<typeof theme, string> = {
        'Obsidian': 'card-theme-obsidian text-slate-200',
        'Holographic': 'card-theme-holographic text-black',
        'Minimal White': 'card-theme-minimal text-slate-800'
    };
    
    const cardTextColor = theme === 'Holographic' || theme === 'Minimal White' ? 'text-slate-700' : 'text-slate-300';
    const cardStrongTextColor = theme === 'Holographic' || theme === 'Minimal White' ? 'text-slate-900' : 'text-white';

    const getStatusChip = () => {
        switch (status) {
            case 'Not Applied':
                return <div className={`px-2.5 py-1 text-xs font-bold rounded-full bg-slate-500/50 text-white`}>{t('status_not_applied')}</div>;
            case 'Pending Approval':
                return <div className={`px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/80 text-white animate-pulse`}>{t('status_pending')}</div>;
            case 'Approved':
                return <div className={`px-2.5 py-1 text-xs font-bold rounded-full ${isFrozen ? 'bg-red-500/90' : 'bg-emerald-500/90'} text-white`}>{isFrozen ? t('status_frozen') : t('status_active')}</div>;
        }
    };
    
    const displayCardNumber = () => {
        if (status === 'Not Applied' || status === 'Pending Approval') {
            return '2637 84•• •••• ••••';
        }
        if (!number) return '•••• •••• •••• ••••';
        if (isMasked) {
            return `${number.substring(0, 4)} •••• •••• ${number.substring(12)}`;
        }
        return number.replace(/(.{4})/g, '$1 ').trim();
    };

    return (
        <div className="card-3d-wrapper">
            <div className={`card-3d relative w-96 h-60 rounded-2xl p-6 flex flex-col justify-between shadow-2xl overflow-hidden ${themeClasses[theme]}`}>
                {isFrozen && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10"></div>}
                
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full opacity-50"></div>
                <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-white/5 rounded-full opacity-50"></div>

                <div className="z-0">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <ValifiLogo className={`w-10 h-10 ${cardStrongTextColor}`} />
                            <span className="font-semibold mt-1">{type} Card</span>
                        </div>
                        <div className="flex items-center gap-2">
                             {getStatusChip()}
                            <div className={`px-2.5 py-1 text-xs font-bold rounded-full bg-black/20 ${cardStrongTextColor}`}>{currency}</div>
                        </div>
                    </div>
                </div>

                <div className="z-0">
                    <p className={`font-mono text-2xl tracking-wider ${cardStrongTextColor}`}>{displayCardNumber()}</p>
                    <div className="flex justify-between items-end mt-4">
                        <div className="font-mono text-sm">
                            <p className={`uppercase text-xs ${cardTextColor}`}>Expiry</p>
                            <p className={cardStrongTextColor}>{status === 'Approved' && !isMasked ? expiry : '••/••'}</p>
                        </div>
                         <div className="font-mono text-sm">
                            <p className={`uppercase text-xs ${cardTextColor}`}>CVV</p>
                            <p className={cardStrongTextColor}>{status === 'Approved' && !isMasked ? cvv : '•••'}</p>
                        </div>
                        <p className="font-bold text-lg uppercase">{status === 'Approved' ? 'Demo User' : t('your_name_here')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ValifiCard;
