import React, { useState } from 'react';
import type { P2POrder, UserP2PProfile } from '../types';
import { timeAgo } from './utils';
import { useCurrency } from './CurrencyContext';
import { GavelIcon } from './icons';

interface MyP2POrdersViewProps {
    orders: P2POrder[];
    currentUser: UserP2PProfile;
    onViewOrder: (order: P2POrder) => void;
    onDisputeOrder: (order: P2POrder) => void;
}

const OrderStatusPill: React.FC<{ status: P2POrder['status'] }> = ({ status }) => {
    const statusClasses: Record<P2POrder['status'], string> = {
        'Pending Payment': 'bg-amber-500/10 text-amber-400',
        'Payment Sent': 'bg-sky-500/10 text-sky-400',
        'Escrow Released': 'bg-indigo-500/10 text-indigo-400',
        'Completed': 'bg-emerald-500/10 text-emerald-400',
        'Cancelled': 'bg-slate-600/20 text-slate-400',
        'Auto-Cancelled': 'bg-slate-600/20 text-slate-400',
        'Disputed': 'bg-red-500/10 text-red-400',
        'Under Review': 'bg-red-500/10 text-red-400 animate-pulse',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>
            {status}
        </span>
    );
};

const MyP2POrdersView: React.FC<MyP2POrdersViewProps> = ({ orders, currentUser, onViewOrder, onDisputeOrder }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'disputed'>('pending');
    const { formatCurrency } = useCurrency();

    const filteredOrders = {
        pending: orders.filter(o => ['Pending Payment', 'Payment Sent', 'Escrow Released'].includes(o.status)),
        completed: orders.filter(o => ['Completed', 'Cancelled', 'Auto-Cancelled'].includes(o.status)),
        disputed: orders.filter(o => ['Disputed', 'Under Review'].includes(o.status)),
    };

    const ordersToShow = filteredOrders[activeTab];

    return (
        <div className="space-y-4">
            <div className="flex items-center border-b border-slate-700">
                <button onClick={() => setActiveTab('pending')} className={`p-4 text-sm font-semibold ${activeTab === 'pending' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400'}`}>
                    Pending ({filteredOrders.pending.length})
                </button>
                <button onClick={() => setActiveTab('completed')} className={`p-4 text-sm font-semibold ${activeTab === 'completed' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400'}`}>
                    Completed ({filteredOrders.completed.length})
                </button>
                <button onClick={() => setActiveTab('disputed')} className={`p-4 text-sm font-semibold ${activeTab === 'disputed' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400'}`}>
                    Disputed / Under Review ({filteredOrders.disputed.length})
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/40">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type / Coin</th>
                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Counterparty</th>
                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {ordersToShow.length > 0 ? ordersToShow.map(order => {
                            const isUserBuyer = order.buyer.id === currentUser.id;
                            const counterparty = isUserBuyer ? order.seller : order.buyer;
                            return (
                                <tr key={order.id} className="hover:bg-slate-800/60">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${isUserBuyer ? 'text-emerald-400' : 'text-red-400'}`}>{isUserBuyer ? 'BUY' : 'SELL'}</span>
                                            <order.offer.asset.Icon className="w-6 h-6"/>
                                            <span>{order.offer.asset.ticker}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-white">{counterparty.name}</td>
                                    <td className="p-4">
                                        <p className="font-mono text-white">{order.cryptoAmount.toFixed(6)} {order.offer.asset.ticker}</p>
                                        <p className="text-xs text-slate-400">{formatCurrency(order.fiatAmount)}</p>
                                    </td>
                                    <td className="p-4"><OrderStatusPill status={order.status}/></td>
                                    <td className="p-4 text-slate-400 text-sm">{timeAgo(order.createdAt)}</td>
                                    <td className="p-4 text-right space-x-4">
                                        {activeTab !== 'completed' && (
                                            <button onClick={() => onDisputeOrder(order)} className="font-semibold text-sm text-red-400 hover:text-red-300">
                                                <GavelIcon className="w-4 h-4 inline-block mr-1"/>
                                                Dispute
                                            </button>
                                        )}
                                        <button onClick={() => onViewOrder(order)} className="font-semibold text-sm text-sky-400 hover:text-sky-300">View Details</button>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={6} className="text-center py-16 text-slate-500">
                                    No {activeTab} orders.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyP2POrdersView;
