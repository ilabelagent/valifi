import React, { useState, useEffect } from 'react';
import type { P2POrder, UserP2PProfile, P2PChatMessage, Notification } from '../types';
import { CloseIcon, ClockIcon, CopyIcon, ChatBubbleIcon, GavelIcon, PaperclipIcon } from './icons';
import { useCurrency } from './CurrencyContext';
import { timeAgo } from './utils';
import P2PChatInterface from './P2PChatInterface';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: P2POrder;
    currentUser: UserP2PProfile;
    onUpdateOrder: (order: P2POrder) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    onDispute: (order: P2POrder) => void;
}

const CountdownTimer: React.FC<{ expiry: string, onExpire: () => void }> = ({ expiry, onExpire }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiry) - +new Date();
        let timeLeft = { minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (newTimeLeft.minutes <= 0 && newTimeLeft.seconds <= 0 && !isExpired) {
                setIsExpired(true);
                onExpire();
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, isExpired, onExpire]);
    
    return (
        <div className={`font-mono text-lg font-bold ${isExpired ? 'text-red-500' : 'text-amber-400'}`}>
            {isExpired ? 'Expired' : `${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
        </div>
    );
};


const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order, currentUser, onUpdateOrder, addNotification, onDispute }) => {
    const { formatCurrency } = useCurrency();
    const [copied, setCopied] = useState<string | null>(null);
    const [localMessages, setLocalMessages] = useState(order.chatHistory);

    useEffect(() => {
        // Sync local state if the prop changes from parent (e.g., initial load or external update)
        setLocalMessages(order.chatHistory);
    }, [order.chatHistory]);

    // This effect syncs local chat changes back up to the parent single source of truth
    useEffect(() => {
        if (JSON.stringify(localMessages) !== JSON.stringify(order.chatHistory)) {
             onUpdateOrder({ ...order, chatHistory: localMessages });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localMessages]);


    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const userRole = order.buyer.id === currentUser.id ? 'buyer' : 'seller';
    const counterparty = userRole === 'buyer' ? order.seller : order.buyer;

    const handleAutoCancel = () => {
        if(order.status === 'Pending Payment') {
            onUpdateOrder({ ...order, status: 'Auto-Cancelled' });
        }
    }

    const handleMarkAsPaid = () => {
        const updatedOrder = { ...order, status: 'Payment Sent' as const, paymentSentAt: new Date().toISOString() };
        onUpdateOrder(updatedOrder);
        addNotification({
            type: 'p2p',
            title: 'Payment Marked as Sent',
            description: `You've marked order ${order.id.slice(-6)} as paid. The seller has been notified.`
        });
    };

    const handleReleaseEscrow = () => {
        const updatedOrder = { ...order, status: 'Escrow Released' as const };
        onUpdateOrder(updatedOrder);
    };
    
    const handleSendMessage = (text: string) => {
        const newMessage: P2PChatMessage = {
            id: `msg_${Date.now()}`,
            orderId: order.id,
            authorId: currentUser.id,
            authorName: currentUser.name,
            text,
            timestamp: new Date().toISOString()
        };
        setLocalMessages(prev => [...prev, newMessage]);

        // Simulate counterparty typing and replying
        setTimeout(() => {
            const typingMessage: P2PChatMessage = {
                id: `msg_typing_${Date.now()}`,
                orderId: order.id,
                authorId: counterparty.id,
                authorName: counterparty.name,
                text: '',
                timestamp: new Date().toISOString(),
                isTyping: true,
            };
            setLocalMessages(prev => [...prev, typingMessage]);

            setTimeout(() => {
                 const replyMessage: P2PChatMessage = {
                    id: `msg_reply_${Date.now()}`,
                    orderId: order.id,
                    authorId: counterparty.id,
                    authorName: counterparty.name,
                    text: 'Okay, I see your message. I will check it now.',
                    timestamp: new Date().toISOString()
                };
                setLocalMessages(prev => [...prev.filter(m => !m.isTyping), replyMessage]);
            }, 2000);
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl text-white transform transition-all max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold">
                        {userRole === 'buyer' ? `Buy ${order.offer.asset.ticker} from ${counterparty.name}` : `Sell ${order.offer.asset.ticker} to ${counterparty.name}`}
                    </h2>
                     <div className="flex items-center gap-4">
                        <span className="text-sm px-2 py-1 bg-slate-700 rounded-md">{order.status}</span>
                        <CountdownTimer expiry={order.expiresAt} onExpire={handleAutoCancel}/>
                        <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon className="w-6 h-6"/></button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    <div className="md:w-1/2 p-4 space-y-4 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-700">
                         <div className="bg-slate-900/50 p-4 rounded-lg">
                            <h3 className="font-semibold text-sky-400 mb-2">Order Details</h3>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between"><span className="text-slate-400">Amount to Pay:</span> <span className="font-bold text-lg">{formatCurrency(order.fiatAmount)}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">You will receive:</span> <span className="font-bold font-mono text-lg">{order.cryptoAmount.toFixed(8)} {order.offer.asset.ticker}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Price:</span> <span>{formatCurrency(order.offer.price)} / {order.offer.asset.ticker}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400">Order ID:</span> <span className="font-mono text-xs">{order.id}</span></div>
                            </div>
                         </div>
                         {userRole === 'buyer' && (
                             <div className="bg-slate-900/50 p-4 rounded-lg">
                                <h3 className="font-semibold text-sky-400 mb-2">Payment Instructions</h3>
                                <div className="text-sm space-y-2">
                                    <p className="text-slate-400">Transfer exactly <span className="font-bold text-white">{formatCurrency(order.fiatAmount)}</span> to the seller using the following details:</p>
                                    <div className="flex justify-between"><span className="text-slate-400">Method:</span> <span className="font-bold">{order.paymentMethod.methodType}</span></div>
                                    {Object.entries(order.paymentMethod.details).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{value}</span>
                                                <button onClick={() => handleCopy(value!, key)} className="text-slate-500 hover:text-white">
                                                    <CopyIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )}
                         <div className="bg-slate-900/50 p-4 rounded-lg">
                            <h3 className="font-semibold text-sky-400 mb-2">Seller's Terms</h3>
                            <p className="text-sm text-slate-400 italic">{order.offer.terms || "No specific terms provided by the seller."}</p>
                         </div>
                    </div>
                     <div className="md:w-1/2 p-4 flex flex-col">
                        <P2PChatInterface messages={localMessages} onSendMessage={handleSendMessage} currentUserId={currentUser.id} counterpartyName={counterparty.name} />
                    </div>
                </div>
                 <div className="p-4 border-t border-slate-700 flex-shrink-0 flex items-center justify-between gap-4">
                     <div>
                        <button onClick={() => onDispute(order)} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 font-semibold"><GavelIcon className="w-4 h-4"/> Raise a Dispute</button>
                     </div>
                     <div className="flex items-center gap-4">
                        <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-lg">Cancel</button>
                        {userRole === 'buyer' && order.status === 'Pending Payment' && (
                             <button onClick={handleMarkAsPaid} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg">I have paid, notify seller</button>
                        )}
                         {userRole === 'seller' && order.status === 'Payment Sent' && (
                             <button onClick={handleReleaseEscrow} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg">Confirm Payment & Release Crypto</button>
                        )}
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
