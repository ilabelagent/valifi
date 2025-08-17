import React, { useState } from 'react';
import type { P2POrder } from '../types';
import { CloseIcon, GavelIcon } from './icons';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: P2POrder;
  onSubmitDispute: (reason: string) => void;
}

const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose, order, onSubmitDispute }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 20) {
      setError('Please provide a detailed reason of at least 20 characters.');
      return;
    }
    setError('');
    onSubmitDispute(reason);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-slate-800 border border-red-500/30 rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Raise a Dispute</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
        </div>
        <div className="p-8 space-y-4">
          <GavelIcon className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-slate-300 text-center">
            You are raising a dispute for Order ID: <span className="font-mono text-sky-300">{order.id}</span>.
            The trade will be paused and an admin will review the case.
          </p>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            rows={4}
            placeholder="Please explain the issue in detail. For example: 'I have sent the payment but the seller has not released the crypto after 15 minutes and is not responding in chat.'"
            className={`w-full bg-slate-900/50 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500`}
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div className="text-xs p-3 rounded-lg bg-slate-900/50 text-slate-400 border border-slate-700">
            <p className="font-semibold">Please provide clear evidence (e.g., screenshots of payment) in the trade chat to help our admins resolve the dispute quickly.</p>
          </div>
          <button
            type="submit"
            disabled={!reason.trim()}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg disabled:bg-slate-700 disabled:cursor-not-allowed"
          >
            Submit Dispute
          </button>
        </div>
      </form>
    </div>
  );
};

export default DisputeModal;
