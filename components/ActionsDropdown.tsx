import React, { useState, useRef, useEffect } from 'react';
import type { Asset } from '../types';
import { MoreHorizontalIcon } from './icons';
import { AssetType } from '../types';

interface ActionsDropdownProps {
    asset: Asset;
    onViewHistory: (asset: Asset) => void;
    onReinvest: (assetId: string) => void;
    onTransferToMain: (assetId: string) => void;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({ asset, onViewHistory, onReinvest, onTransferToMain }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);
    
    const handleAction = (action: (e: React.MouseEvent) => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        action(e);
        setIsOpen(false);
    };

    const isTransferable = asset.status === 'Matured' || asset.status === 'Withdrawable';

    const menuItems = [
        { label: 'View History & Logs', action: () => onViewHistory(asset), disabled: false },
        { label: 'Reinvest Earnings', action: () => onReinvest(asset.id), disabled: asset.type === AssetType.NFT || !asset.totalEarnings || asset.totalEarnings <= 0 },
        { label: 'Transfer to Main', action: () => onTransferToMain(asset.id), disabled: !isTransferable },
    ];


    return (
        <div className="relative" ref={ref}>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(prev => !prev);
                }}
                className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <MoreHorizontalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-popover backdrop-blur-md border border-border rounded-xl shadow-lg z-10 p-2 animate-slide-up-fade">
                    {menuItems.map(item => (
                         <a 
                            key={item.label} 
                            href="#" 
                            onClick={handleAction(item.action)} 
                            className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${item.disabled ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-popover-foreground hover:bg-accent'}`}
                            aria-disabled={item.disabled}
                         >
                            {item.label}
                         </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ActionsDropdown;