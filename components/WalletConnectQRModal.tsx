import React from 'react';
import { CloseIcon } from './icons';

interface WalletConnectQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletConnectQRModal: React.FC<WalletConnectQRModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const qrData = 'wc:00e46b69-d0cc-4b3e-b6a2-cee442f97488@1?bridge=https%3A%2F%2Fbridge.walletconnect.org&key=...';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">WalletConnect</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon className="w-6 h-6"/></button>
        </div>
        <div className="p-6 space-y-4 text-center">
            <p className="text-slate-300">Scan this QR code with a WalletConnect-compatible wallet.</p>
            <div className="bg-white p-4 rounded-lg inline-block">
                <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}&qzone=1`} 
                    alt="WalletConnect QR Code" 
                    className="rounded-md"
                />
            </div>
            <p className="text-sm text-slate-400">Alternatively, you can copy the code to your clipboard.</p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectQRModal;