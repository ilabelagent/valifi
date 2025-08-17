import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReferralNode, ReferralActivity } from '../types';
import { UsersIcon, CopyIcon, UsdIcon, TwitterIcon, WhatsAppIcon, TelegramIcon, CheckCircleIcon } from './icons';
import { useCurrency } from './CurrencyContext';


// Reusable Card Component
const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

// Mock Data
const mockReferralTree: ReferralNode = {
    id: 'root', name: 'You', avatarUrl: 'https://i.pravatar.cc/40?u=valifi-user', level: 0,
    children: [
        { id: '1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/40?u=alice', level: 1, children: [
            { id: '1-1', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/40?u=charlie', level: 2, children: [] },
            { id: '1-2', name: 'David', avatarUrl: 'https://i.pravatar.cc/40?u=david', level: 2, children: [] },
        ]},
        { id: '2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/40?u=bob', level: 1, children: [] },
        { id: '3', name: 'Eve', avatarUrl: 'https://i.pravatar.cc/40?u=eve', level: 1, children: [
            { id: '3-1', name: 'Frank', avatarUrl: 'https://i.pravatar.cc/40?u=frank', level: 2, children: [
                { id: '3-1-1', name: 'Grace', avatarUrl: 'https://i.pravatar.cc/40?u=grace', level: 3, children: [] },
            ]},
        ]},
    ]
};

const mockReferralActivities: ReferralActivity[] = [
    { id: 'a1', date: '2024-07-30', description: 'Grace signed up', earningsUSD: 0.50 },
    { id: 'a2', date: '2024-07-29', description: 'Frank signed up', earningsUSD: 2.10 },
    { id: 'a3', date: '2024-07-28', description: 'David invested $100', earningsUSD: 3.00 },
    { id: 'a4', date: '2024-07-27', description: 'Bob signed up', earningsUSD: 10.00 },
];

const StatCard: React.FC<{ title: string; value: string; Icon: React.FC<any> }> = ({ title, value, Icon }) => (
    <Card className="p-6 flex items-center gap-4">
        <div className="bg-secondary p-4 rounded-lg border border-border"><Icon className="w-7 h-7 text-primary" /></div>
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground tracking-tight"><span className="blur-balance">{value}</span></p>
        </div>
    </Card>
);

const ReferralLinkCard: React.FC<{ username: string }> = ({ username }) => {
    const { t } = useTranslation(['referrals', 'common']);
    const referralLink = `https://valifi.com/ref/${username}`;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareText = `Join me on Valifi, the ultimate AI-powered finance platform! Use my link to sign up: ${referralLink}`;

    const socialLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`,
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground">{t('share_link_title')}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t('share_link_desc')}</p>
            
            <div className="mt-4 bg-secondary p-3 rounded-lg flex items-center justify-between gap-2 border border-border">
                <p className="text-sm text-primary font-mono break-all">{referralLink}</p>
                <button onClick={handleCopy} className="flex-shrink-0 flex items-center gap-2 bg-accent hover:bg-primary/20 text-foreground font-semibold py-2 px-3 rounded-lg transition-colors text-sm shadow-sm">
                    {copied ? <CheckCircleIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
                    <span>{copied ? t('common:copied') : t('common:copy')}</span>
                </button>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
                <p className="text-sm text-muted-foreground">{t('share_via')}</p>
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-foreground bg-accent hover:bg-primary/20 transition-colors" title="Share on Twitter">
                    <TwitterIcon className="w-5 h-5" />
                </a>
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-foreground bg-accent hover:bg-primary/20 transition-colors" title="Share on WhatsApp">
                    <WhatsAppIcon className="w-5 h-5" />
                </a>
                <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full text-foreground bg-accent hover:bg-primary/20 transition-colors" title="Share on Telegram">
                    <TelegramIcon className="w-5 h-5" />
                </a>
            </div>
        </Card>
    );
};

const TreeNode: React.FC<{ node: ReferralNode, isLast: boolean }> = ({ node, isLast }) => (
    <div className="relative pl-8">
        {/* Vertical and horizontal connection lines */}
        <div className="absolute left-[1px] top-5 -mt-px w-8 h-px bg-border"></div>
        {!isLast && <div className="absolute left-[1px] top-0 bottom-0 w-px bg-border"></div>}
        
        <div className="flex items-center gap-3 py-2 relative">
            <img src={node.avatarUrl} alt={node.name} className="w-10 h-10 rounded-full border-2 border-border bg-secondary" />
            <div>
                <p className="font-semibold text-foreground">{node.name}</p>
                <p className="text-sm text-muted-foreground">Gen {node.level}</p>
            </div>
        </div>
        {node.children.length > 0 && (
            <div className="border-l border-border">
                {node.children.map((child, index) => (
                    <TreeNode key={child.id} node={child} isLast={index === node.children.length - 1} />
                ))}
            </div>
        )}
    </div>
);


const ReferralsView: React.FC = () => {
    const { t } = useTranslation('referrals');
    const { formatCurrency } = useCurrency();
    const tiers = [
        { gen: 1, rate: 10 }, { gen: 2, rate: 3 }, { gen: 3, rate: 2 },
        { gen: '4-5', rate: 1 }, { gen: 'Rank Bonus', rate: 25 },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 view-container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <StatCard title={t('total_referrals')} value="8" Icon={UsersIcon} />
                <StatCard title={t('total_earnings')} value={formatCurrency(4520.50)} Icon={UsdIcon} />
            </div>
            
            <ReferralLinkCard username="DemoUser" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-foreground p-6 border-b border-border">{t('referral_tree')}</h3>
                    <div className="p-6">
                        <TreeNode node={mockReferralTree} isLast={true} />
                    </div>
                </Card>

                <div className="space-y-8">
                    <Card>
                        <h3 className="text-lg font-semibold text-foreground p-6 border-b border-border">{t('earnings_tiers')}</h3>
                        <ul className="divide-y divide-border">
                            {tiers.map(tier => (
                                <li key={tier.gen} className="flex justify-between items-center px-6 py-3 hover:bg-accent">
                                    <span className="text-muted-foreground">{t('generation', { gen: tier.gen })}</span>
                                    <span className="font-semibold text-primary">{tier.rate}%</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold text-foreground p-6 border-b border-border">{t('recent_activity')}</h3>
                        <ul className="divide-y divide-border">
                            {mockReferralActivities.map(activity => (
                                <li key={activity.id} className="flex justify-between items-center px-6 py-4 hover:bg-accent">
                                    <div>
                                        <p className="font-semibold text-foreground">{activity.description}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="font-semibold text-emerald-400">
                                        <span className="blur-balance">+{formatCurrency(activity.earningsUSD)}</span>
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ReferralsView;
