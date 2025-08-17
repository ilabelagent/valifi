import React, { useState, forwardRef } from 'react';
import type { Notification, UserActivity, NewsItem, NotificationType } from '../types';
import { timeAgo } from './utils';
import { NotificationIcon, HistoryIcon, NewspaperIcon, InvestmentsIcon, LoanIcon, UserCheckIcon, AlertTriangleIcon, InfoIcon, CloseIcon, P2PIcon } from './icons';

interface NotificationPanelProps {
    isOpen: boolean;
    notifications: Notification[];
    userActivity: UserActivity[];
    newsItems: NewsItem[];
    onMarkAsRead: (id: string) => void;
    onDismiss: (id: string) => void;
    onMarkAllRead: () => void;
    onClearAll: () => void;
}

const TabButton: React.FC<{ label: string; Icon: React.FC<any>; isActive: boolean; onClick: () => void }> = ({ label, Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex justify-center items-center gap-2 p-3 text-sm font-semibold border-b-2 transition-colors ${
            isActive ? 'text-sky-400 border-sky-400' : 'text-slate-400 border-transparent hover:text-white'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

const typeToIconMap: Record<NotificationType, React.FC<React.SVGProps<SVGSVGElement>>> = {
    investment: InvestmentsIcon,
    loan: LoanIcon,
    kyc: UserCheckIcon,
    system: InfoIcon,
    admin: InfoIcon,
    security: AlertTriangleIcon,
    p2p: P2PIcon
};

const NotificationItem: React.FC<{ item: Notification; onMarkAsRead: (id: string) => void; onDismiss: (id: string) => void }> = ({ item, onMarkAsRead, onDismiss }) => {
    const Icon = typeToIconMap[item.type];

    return (
        <li className={`relative flex items-start gap-3 p-4 transition-colors ${!item.isRead ? 'bg-sky-900/20' : ''} hover:bg-slate-800/60`}>
            {!item.isRead && <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-2 bg-sky-400 rounded-full"></div>}
            <div className="flex-shrink-0 pt-1">
                <Icon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-white text-sm">{item.title}</p>
                <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-slate-500">{timeAgo(item.timestamp)}</p>
                    {!item.isRead && (
                        <button onClick={() => onMarkAsRead(item.id)} className="text-xs text-sky-400 hover:text-sky-300 font-semibold">Mark as read</button>
                    )}
                </div>
            </div>
            <button onClick={() => onDismiss(item.id)} className="flex-shrink-0 text-slate-500 hover:text-white p-1" title="Dismiss">
                <CloseIcon className="w-4 h-4" />
            </button>
        </li>
    );
};


const NotificationPanel = forwardRef<HTMLDivElement, NotificationPanelProps>(({ isOpen, notifications, userActivity, newsItems, onMarkAsRead, onDismiss, onMarkAllRead, onClearAll }, ref) => {
    const [activeTab, setActiveTab] = useState<'notifications' | 'activity' | 'news'>('notifications');
    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!isOpen) return null;

    return (
        <div ref={ref} className="absolute top-20 right-6 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-300/10 rounded-2xl shadow-2xl z-30 overflow-hidden motion-safe:animate-slide-in-fade">
            <div className="p-4 border-b border-slate-700/80">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Updates</h3>
                    {activeTab === 'notifications' && unreadCount > 0 && (
                        <div className="flex items-center gap-2">
                            <button onClick={onMarkAllRead} className="text-xs text-sky-400 hover:text-sky-300 font-semibold">Mark all as read</button>
                            <span className="text-slate-600">|</span>
                            <button onClick={onClearAll} className="text-xs text-slate-400 hover:text-white">Clear read</button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex border-b border-slate-700/80">
                <TabButton label="Notifications" Icon={NotificationIcon} isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                <TabButton label="Activity" Icon={HistoryIcon} isActive={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
                <TabButton label="News" Icon={NewspaperIcon} isActive={activeTab === 'news'} onClick={() => setActiveTab('news')} />
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
                {activeTab === 'notifications' && (
                    <ul className="divide-y divide-slate-700/80">
                        {notifications.length > 0 ? (
                            notifications.map(item => <NotificationItem key={item.id} item={item} onMarkAsRead={onMarkAsRead} onDismiss={onDismiss} />)
                        ) : (
                            <p className="text-center text-slate-500 p-8">No new notifications.</p>
                        )}
                    </ul>
                )}
                {activeTab === 'activity' && (
                     <ul className="divide-y divide-slate-700/80">
                        {userActivity.length > 0 ? (
                            userActivity.map(item => (
                                <li key={item.id} className="flex items-center gap-4 p-4">
                                    <item.icon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <p className="text-sm text-white">{item.description}</p>
                                        <p className="text-xs text-slate-500">{timeAgo(item.timestamp)}</p>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-center text-slate-500 p-8">No recent activity.</p>
                        )}
                    </ul>
                )}
                {activeTab === 'news' && (
                     <ul className="divide-y divide-slate-700/80">
                        {newsItems.map(item => (
                            <li key={item.id} className="p-4">
                                <p className="font-semibold text-white text-sm">{item.title}</p>
                                <p className="text-xs text-slate-400 mt-1">{item.content}</p>
                                <p className="text-xs text-slate-500 mt-2">{timeAgo(item.timestamp)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
});

export default NotificationPanel;