import React, { useState, useMemo, useEffect } from 'react';
import type { KYCStatus } from '../types'; // This seems unused, but let's keep it for now in case of future use.
import { KeyIcon, CloseIcon, AlertTriangleIcon } from './icons';

type WalletStatus = 'loading' | 'none' | 'generated' | 'backed_up';

const MOCK_SECRET_PHRASE = "orbit mimic solar custom stable track vendor coral crazy vessel eternal kiwi";

const shuffleArray = <T,>(array: T[]): T[] => {
    return array.map(value => ({ value, sort: Math.random() }))
               .sort((a, b) => a.sort - b.sort)
               .map(({ value }) => value);
};

const SecretPhraseModal: React.FC<{ status: WalletStatus, onConfirmBackup: () => void, onClose: () => void }> = ({ status, onConfirmBackup, onClose }) => {
    const [step, setStep] = useState(1); // 1: Show phrase, 2: Verify
    const [shuffledPhrase, setShuffledPhrase] = useState<string[]>([]);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [error, setError] = useState('');
    const originalWords = useMemo(() => MOCK_SECRET_PHRASE.split(' '), []);

    useEffect(() => {
        if (status === 'generated' && step === 1) {
            setShuffledPhrase(shuffleArray([...originalWords]));
        }
    }, [status, step, originalWords]);
    
    const handleWordSelect = (word: string) => {
        setSelectedWords(prev => [...prev, word]);
        setShuffledPhrase(prev => prev.filter(w => w !== word));
    };

    const handleWordDeselect = (word: string, index: number) => {
        setSelectedWords(prev => prev.filter((_, i) => i !== index));
        setShuffledPhrase(prev => [...prev, word].sort(() => Math.random() - 0.5)); // re-shuffle for UX
    };
    
    const handleVerify = () => {
        if (selectedWords.join(' ') === MOCK_SECRET_PHRASE) {
            onConfirmBackup();
        } else {
            setError('Incorrect order. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-card-foreground">{step === 1 ? 'Back Up Your Wallet' : 'Verify Your Phrase'}</h2>
                    {step === 1 && <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><CloseIcon className="w-6 h-6"/></button>}
                </div>
                 <div className="p-6 space-y-4">
                     <div className="text-xs p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex gap-2">
                        <AlertTriangleIcon className="w-10 h-4 flex-shrink-0" />
                        Never share your secret phrase with anyone. This phrase is the only way to recover your wallet. Store it in a secure, offline location.
                     </div>
                     {step === 1 ? (
                        <>
                             <div className="grid grid-cols-3 gap-2 bg-secondary p-4 rounded-lg font-mono">
                                {MOCK_SECRET_PHRASE.split(' ').map((word, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-muted-foreground text-sm">{index + 1}.</span>
                                        <span className="text-foreground">{word}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setStep(2)} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg">I've Backed It Up, Let's Verify</button>
                        </>
                     ) : (
                         <>
                             <div className="bg-secondary p-4 rounded-lg min-h-[8rem] border border-border flex flex-wrap gap-2">
                                {selectedWords.map((word, index) => (
                                     <button key={index} onClick={() => handleWordDeselect(word, index)} className="bg-primary/20 text-primary font-mono px-2 py-1 rounded-md">{word}</button>
                                ))}
                             </div>
                            <p className="text-sm text-center text-muted-foreground">Tap the words in the correct order.</p>
                             <div className="flex flex-wrap gap-2 justify-center">
                                {shuffledPhrase.map(word => (
                                     <button key={word} onClick={() => handleWordSelect(word)} className="bg-input text-foreground font-mono px-2 py-1 rounded-md">{word}</button>
                                ))}
                             </div>
                              {error && <p className="text-destructive text-sm text-center">{error}</p>}
                             <button onClick={handleVerify} disabled={selectedWords.length !== 12} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg disabled:bg-muted">Verify</button>
                         </>
                     )}
                 </div>
            </div>
        </div>
    );
}

export default SecretPhraseModal;
