import React from 'react';
import type { UserP2PProfile } from '../types';
import { CloseIcon, StarIcon, UserCheckIcon, ShieldCheckIcon } from './icons';
import { countries } from './countries';

interface P2PProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: UserP2PProfile | null;
}

const StatItem: React.FC<{ label: string; value: string | number; suffix?: string }> = ({ label, value, suffix }) => (
    <div className="text-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
        <p className="text-2xl font-bold text-sky-400">{value}<span className="text-lg">{suffix}</span></p>
        <p className="text-xs text-slate-400">{label}</p>
    </div>
);

const P2PProfileModal: React.FC<P2PProfileModalProps> = ({ isOpen, onClose, profile }) => {
    if (!isOpen || !profile) return null;

    const countryInfo = countries.find(c => c.code === profile.countryCode);
    const joinDate = new Date(profile.joinDate);
    const memberSince = `${joinDate.toLocaleString('default', { month: 'long' })} ${joinDate.getFullYear()}`;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg text-white transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold">Trader Profile</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/80"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <img src={profile.avatarUrl} alt={profile.name} className="w-20 h-20 rounded-full border-4 border-slate-600" />
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-bold">{profile.name}</h3>
                                {profile.isVerified && <span title="Verified User"><UserCheckIcon className="w-6 h-6 text-sky-400" /></span>}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(profile.rating) ? 'text-amber-400' : 'text-slate-600'}`} />
                                ))}
                                <span className="text-slate-300 font-bold ml-1">{profile.rating.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <StatItem label="Total Trades" value={profile.totalTrades} />
                        <StatItem label="Completion Rate" value={profile.completionRate} suffix="%" />
                        <StatItem label="Trust Score" value={profile.trustScore} suffix="/100" />
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                         <h4 className="font-semibold text-sky-400 mb-2">Details</h4>
                         <div className="text-sm space-y-2">
                            <div className="flex justify-between"><span className="text-slate-400">Country:</span> <span className="font-semibold flex items-center gap-2">{countryInfo?.name} <img src={`https://flagcdn.com/w20/${profile.countryCode.toLowerCase()}.png`} alt={profile.countryCode} className="rounded-sm"/></span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Member Since:</span> <span className="font-semibold">{memberSince}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Primary Language:</span> <span className="font-semibold">{profile.language}</span></div>
                         </div>
                    </div>

                    {profile.badges && profile.badges.length > 0 && (
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                             <h4 className="font-semibold text-sky-400 mb-2">Badges</h4>
                             <div className="flex flex-wrap gap-2">
                                {profile.badges.map(badge => (
                                    <div key={badge.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700/80 border border-slate-600">
                                        <ShieldCheckIcon className={`w-4 h-4 ${badge.color}`} />
                                        <span className="text-xs font-semibold">{badge.label}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default P2PProfileModal;