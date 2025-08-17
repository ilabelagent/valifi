import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InvestableNFT, Asset } from '../types';
import { useCurrency } from './CurrencyContext';
import NFTInvestModal from './NFTInvestModal';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

const NFTInvestmentView: React.FC<{
    investableNFTs: InvestableNFT[],
    userNFTAssets: Asset[],
    cashBalance: number;
    onInvest: (nft: InvestableNFT, amount: number, paymentMethod: 'funds' | 'btc') => void;
    onStake: (asset: Asset, duration: number) => void;
    onSell: (asset: Asset, shares: number) => void;
    onClaim: (asset: Asset) => void;
}> = ({ investableNFTs, userNFTAssets, cashBalance, onInvest, onStake, onSell, onClaim }) => {
    const { t } = useTranslation('common');
    const [isInvestModalOpen, setInvestModalOpen] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState<InvestableNFT | null>(null);
    const { formatCurrency } = useCurrency();

    const handleInvestClick = (nft: InvestableNFT) => {
        setSelectedNFT(nft);
        setInvestModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {investableNFTs.map(nft => (
                    <Card key={nft.id} className="flex flex-col">
                        <img src={nft.imageUrl} alt={nft.title} className="aspect-square w-full object-cover"/>
                        <div className="p-4 flex-grow flex flex-col">
                            <p className="text-xs text-muted-foreground">{nft.collection}</p>
                            <h3 className="font-bold text-foreground">{nft.title}</h3>
                            <div className="text-sm space-y-2 mt-2 flex-grow">
                                <div className="flex justify-between"><span className="text-muted-foreground">Floor Price:</span><span className="font-semibold">{formatCurrency(nft.floorPrice)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Investors:</span><span className="font-semibold">{nft.investors}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">APY (Annual):</span><span className="font-semibold text-emerald-400">{nft.apyAnnual}%</span></div>
                            </div>
                             <button onClick={() => handleInvestClick(nft)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg mt-4">{t('invest')}</button>
                        </div>
                    </Card>
                ))}
            </div>
            {isInvestModalOpen && selectedNFT && <NFTInvestModal isOpen={isInvestModalOpen} onClose={() => setInvestModalOpen(false)} nft={selectedNFT} cashBalance={cashBalance} onConfirm={onInvest} />}
        </div>
    );
};

export default NFTInvestmentView;
