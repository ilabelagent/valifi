import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CardDetails, CardApplicationData } from '../types';
import ValifiCard from './ValifiCard';
import CardApplicationModal from './CardApplicationModal';
import { CardIcon, LockIcon, RefreshIcon, CopyIcon, EyeIcon, EyeOffIcon, ApplePayIcon, GooglePayIcon } from './icons';

interface CardsViewProps {
    cardDetails: CardDetails;
    onApply: (data: CardApplicationData) => void;
    setCardDetails: React.Dispatch<React.SetStateAction<CardDetails>>;
}

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

const CardsView: React.FC<CardsViewProps> = ({ cardDetails, onApply, setCardDetails }) => {
    const { t } = useTranslation(['cards', 'common']);
    const [isApplicationModalOpen, setApplicationModalOpen] = useState(false);
    const [isMasked, setIsMasked] = useState(true);
    const [copied, setCopied] = useState(false);

    const handleCopyToClipboard = () => {
        if(cardDetails.number) {
            navigator.clipboard.writeText(cardDetails.number.replace(/\s/g, ''));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    const toggleFreeze = () => {
        setCardDetails(prev => ({...prev, isFrozen: !prev.isFrozen}));
    };
    
    const CardAction: React.FC<{ Icon: React.FC<any>, label: string, onClick?: () => void, disabled?: boolean }> = ({ Icon, label, onClick, disabled }) => (
        <button onClick={onClick} disabled={disabled} className="flex flex-col items-center gap-2 text-center text-muted-foreground hover:text-foreground disabled:text-muted-foreground/50 disabled:cursor-not-allowed transition-colors group">
            <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-secondary border border-border group-hover:bg-accent transition-colors ${disabled ? '' : 'hover:border-primary/50'}`}>
                <Icon className="w-6 h-6"/>
            </div>
            <span className="text-xs font-semibold">{label}</span>
        </button>
    );

    const renderContent = () => {
        switch (cardDetails.status) {
            case 'Not Applied':
                return (
                    <div className="text-center">
                        <ValifiCard cardDetails={cardDetails} isMasked={true} />
                        <button onClick={() => setApplicationModalOpen(true)} className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg text-lg shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                            {t('apply_button')}
                        </button>
                         <p className="text-muted-foreground mt-6 max-w-md mx-auto">
                            💳 <span className="font-semibold text-foreground">{t('apply_cta_1')}</span>
                            <br/>{t('apply_cta_2')}
                        </p>
                    </div>
                );
            case 'Pending Approval':
                 return (
                    <div className="text-center">
                        <ValifiCard cardDetails={cardDetails} isMasked={true} />
                        <div className="mt-8 bg-secondary border border-border rounded-lg p-6 max-w-md mx-auto">
                            <h3 className="text-xl font-bold text-amber-400">🎉 {t('pending_title')}</h3>
                            <p className="text-muted-foreground mt-2">{t('pending_desc', { type: cardDetails.type, currency: cardDetails.currency })}</p>
                        </div>
                    </div>
                );
            case 'Approved':
                 return (
                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        <ValifiCard cardDetails={cardDetails} isMasked={isMasked} />
                        <div className="w-full lg:w-auto flex-grow space-y-6">
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">{t('card_actions')}</h3>
                                <div className="grid grid-cols-4 gap-4">
                                     <CardAction Icon={cardDetails.isFrozen ? RefreshIcon : LockIcon} label={cardDetails.isFrozen ? t('unfreeze') : t('freeze')} onClick={toggleFreeze} />
                                     <CardAction Icon={isMasked ? EyeIcon : EyeOffIcon} label={isMasked ? t('show') : t('hide')} onClick={() => setIsMasked(!isMasked)} />
                                     <CardAction Icon={CopyIcon} label={copied ? t('common:copied') : t('copy_no')} onClick={handleCopyToClipboard} />
                                     <CardAction Icon={RefreshIcon} label={t('request_new')} disabled/>
                                </div>
                            </Card>
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">{t('digital_wallets')}</h3>
                                <div className="flex items-center gap-4">
                                     <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg opacity-50 cursor-not-allowed">
                                        <ApplePayIcon className="w-8 h-8" />
                                    </button>
                                     <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg opacity-50 cursor-not-allowed">
                                        <GooglePayIcon className="w-8 h-8"/>
                                    </button>
                                    <p className="text-sm text-muted-foreground">{t('coming_soon')}</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <div className="p-6 lg:p-8 space-y-8 view-container">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                    <CardIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('description')}</p>
                </div>
            </div>
            
            <div className="flex justify-center items-center py-8">
                {renderContent()}
            </div>

            <CardApplicationModal
                isOpen={isApplicationModalOpen}
                onClose={() => setApplicationModalOpen(false)}
                onSubmit={onApply}
            />
        </div>
    );
};

export default CardsView;
