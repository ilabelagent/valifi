import React, { useState } from 'react';
import type { CardApplicationData, CardType, CardCurrency, CardTheme } from '../types';
import { CloseIcon, CheckCircleIcon } from './icons';

interface CardApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CardApplicationData) => void;
}

const ThemeOption: React.FC<{ theme: CardTheme, label: string, selected: boolean, onSelect: () => void }> = ({ theme, label, selected, onSelect }) => {
    const themeClasses: Record<CardTheme, string> = {
        'Obsidian': 'card-theme-obsidian',
        'Holographic': 'card-theme-holographic',
        'Minimal White': 'card-theme-minimal'
    };
    return (
        <button type="button" onClick={onSelect} className={`relative rounded-lg p-2 border-2 transition-all ${selected ? 'border-sky-500 scale-105' : 'border-slate-600'}`}>
            <div className={`w-full h-16 rounded-md ${themeClasses[theme]}`}></div>
            <p className="text-sm font-semibold mt-2">{label}</p>
            {selected && <CheckCircleIcon className="absolute -top-2 -right-2 w-6 h-6 text-sky-400 bg-slate-800 rounded-full" />}
        </button>
    )
}

const CardApplicationModal: React.FC<CardApplicationModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [selectedTheme, setSelectedTheme] = useState<CardTheme>('Obsidian');
    const [selectedType, setSelectedType] = useState<CardType>('Virtual');
    const [selectedCurrency, setSelectedCurrency] = useState<CardCurrency>('USD');
    const [address, setAddress] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data: CardApplicationData = {
            theme: selectedTheme,
            type: selectedType,
            currency: selectedCurrency,
        };
        if(selectedType === 'Physical') {
            data.address = address;
        }
        onSubmit(data);
        setIsSubmitted(true);
        setTimeout(() => {
            onClose();
            // Reset for next time modal opens
            setTimeout(() => setIsSubmitted(false), 300);
        }, 3000);
    };

    if (!isOpen) return null;
    
    const inputClass = "w-full bg-slate-700/80 border border-slate-600 rounded-lg py-2.5 px-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500";

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-300/10 rounded-2xl shadow-2xl w-full max-w-2xl m-4 text-white transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-300/10">
                    <h2 className="text-2xl font-bold">{isSubmitted ? "Application Received" : "Apply for Valifi Card"}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/80"><CloseIcon className="w-6 h-6" /></button>
                </div>
                
                {isSubmitted ? (
                    <div className="p-10 text-center">
                        <CheckCircleIcon className="w-20 h-20 text-emerald-400 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-2xl font-bold text-white">🎉 Application Submitted!</h3>
                        <p className="mt-2 text-slate-300 max-w-md mx-auto">You're one step ahead of seamless finance. Your application is being reviewed and you will be notified shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                        <div>
                            <label className="block text-lg font-semibold text-sky-400 mb-2">1. Choose your style</label>
                            <div className="grid grid-cols-3 gap-4">
                                <ThemeOption theme="Obsidian" label="Obsidian" selected={selectedTheme === 'Obsidian'} onSelect={() => setSelectedTheme('Obsidian')} />
                                <ThemeOption theme="Holographic" label="Holographic" selected={selectedTheme === 'Holographic'} onSelect={() => setSelectedTheme('Holographic')} />
                                <ThemeOption theme="Minimal White" label="Minimal White" selected={selectedTheme === 'Minimal White'} onSelect={() => setSelectedTheme('Minimal White')} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-lg font-semibold text-sky-400 mb-2">2. Select card type & currency</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex rounded-md bg-slate-700 p-1">
                                    <button type="button" onClick={() => setSelectedType('Virtual')} className={`flex-1 p-2 text-sm font-bold rounded transition-colors ${selectedType === 'Virtual' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600'}`}>Virtual</button>
                                    <button type="button" onClick={() => setSelectedType('Physical')} className={`flex-1 p-2 text-sm font-bold rounded transition-colors ${selectedType === 'Physical' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600'}`}>Physical</button>
                                </div>
                                <select value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value as CardCurrency)} className={inputClass}>
                                    <option value="USD">USD</option>
                                    <option value="GBP">GBP</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                        </div>

                        {selectedType === 'Physical' && (
                             <div className="motion-safe:animate-slide-in-fade">
                                <label htmlFor="address" className="block text-lg font-semibold text-sky-400 mb-2">3. Shipping Address</label>
                                <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="Enter your full shipping address" className={inputClass} required/>
                                <p className="text-xs text-slate-400 mt-1">Physical cards are typically delivered within 7-10 business days.</p>
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-4 pt-4 border-t border-slate-300/10">
                            <button type="button" onClick={onClose} className="bg-slate-600/80 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Cancel</button>
                            <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg shadow-md shadow-sky-500/20">Submit Application</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CardApplicationModal;
