import React, { useState, useEffect, useRef } from 'react';
import type { Portfolio, ChatMessage } from '../types';
import { SparklesIcon, MessageCircleIcon, LockIcon, SendIcon, ClockIcon } from './icons';
import { newPlans } from './SpectrumPlansView';
import { mockStakableAssets } from './StakingView';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

const SYSTEM_INSTRUCTION = `You are Valifi AI, an expert financial analyst and investment guide for the Valifi platform, operating within a private Investor's Forum. When users refer to 'this platform', 'here', or similar terms, they are referring to Valifi. Your primary goal is to help users grow their wealth by leveraging Valifi's unique investment products.

You will be provided with the user's current portfolio and a list of available investment products, including 'Spectrum Equity Plans' and 'Crypto Staking' options.

Your responsibilities:
1.  **Expert Knowledge:** Act as an expert on the provided investment plans. Be able to explain their details (daily returns, investment range, etc.) clearly and confidently.
2.  **Proactive Recommendations:** Based on the user's portfolio size, assets, and their questions, proactively recommend suitable Spectrum Plans or staking opportunities. For example, if a user has over $5000 in cash, you could suggest the 'PowerEdge' plan.
3.  **Enthusiastic Promotion:** Always respond positively and enthusiastically about Valifi's features and investment potential. Highlight its security, advanced AI tools, and the profitability of its investment products.
4.  **Guide to Action:** Encourage users to invest. When you recommend a plan, tell them they can get started immediately by navigating to the 'Investments' section of the platform.
5.  **Personalized Analysis:** Use the user's portfolio context to provide personalized and relevant analysis, but do not explicitly restate their portfolio details unless asked.
Your tone should be professional, confident, persuasive, and helpful.`;

const initialMessages: ChatMessage[] = [
    {
        id: '1', author: 'ai', authorName: 'Valifi AI', Icon: SparklesIcon,
        text: 'Welcome to the Investor\'s Forum! This is an exclusive space for our top-tier members. Feel free to discuss market trends, ask complex financial questions, or share strategies.',
        timestamp: new Date().toISOString(),
    },
    {
        id: '2', author: 'other_user', authorName: 'CryptoKing', avatarUrl: 'https://i.pravatar.cc/40?u=p2p1',
        text: 'With the recent dip, is now a good time to increase my position in ETH?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    }
];

interface ForumChatProps {
    portfolio: Portfolio;
    api: (prompt: string, systemInstruction: string) => Promise<{ text: string }>;
}

const ForumChat: React.FC<ForumChatProps> = ({ portfolio, api }) => {
    const isEligible = portfolio.totalValueUSD >= 100000;
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            author: 'user',
            authorName: 'You',
            avatarUrl: 'https://i.pravatar.cc/40?u=valifi-user',
            text: newMessage,
            timestamp: new Date().toISOString(),
            status: 'Pending',
        };

        setMessages(prev => [...prev, userMessage]);
        
        setIsLoading(true);
        const portfolioSummary = `User's Portfolio Context (for your analysis only, do not repeat it back):
- Total Value: $${portfolio.totalValueUSD.toFixed(2)}
- Top 5 Assets: ${portfolio.assets.slice(0, 5).map(a => `${a.name} (${a.ticker}): $${a.valueUSD.toFixed(2)} (${a.allocation.toFixed(2)}%)`).join(', ')}
- Cash Balance: $${portfolio.assets.find(a => a.type === 'Cash')?.valueUSD.toFixed(2) || '0.00'}`;

        const spectrumPlansSummary = `Available 'Spectrum Equity Plans' (for your analysis and recommendation):
${newPlans.map(p => `- Plan: ${p.name}, Investment: ${p.investmentRange}, Daily Returns: ${p.dailyReturns}, Total Periods: ${p.totalPeriods}`).join('\n')}`;

        const stakingOptionsSummary = `Available 'Crypto Staking' options (for your analysis and recommendation):
${mockStakableAssets.map(s => `- Asset: ${s.name} (${s.ticker}), APR: ${s.apr}%`).join('\n')}`;

        const fullPrompt = `
${portfolioSummary}
${spectrumPlansSummary}
${stakingOptionsSummary}
User question: "${newMessage}"
`;
        setNewMessage('');

        setTimeout(() => {
            setMessages(prev => prev.map(msg => 
                msg.id === userMessage.id ? { ...msg, status: undefined } : msg
            ));
        }, 3000);

        try {
            const result = await api(fullPrompt, SYSTEM_INSTRUCTION);
            
            const aiMessage: ChatMessage = {
                id: Date.now().toString() + '-ai',
                author: 'ai',
                authorName: 'Valifi AI',
                Icon: SparklesIcon,
                text: result.text,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error generating content:", error);
            const errorMessage: ChatMessage = {
                id: Date.now().toString() + '-error',
                author: 'ai',
                authorName: 'Valifi AI',
                Icon: SparklesIcon,
                text: 'Sorry, I encountered an error trying to respond. Please try again later.',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isEligible) {
        return (
            <Card className="p-6 bg-secondary text-center flex flex-col justify-center items-center h-[28rem] min-h-[28rem]">
                <div className="flex justify-center mb-4">
                    <LockIcon className="w-12 h-12 text-primary"/>
                </div>
                <h3 className="text-xl font-semibold text-foreground">Unlock the Investor's Forum</h3>
                <p className="mt-2 text-muted-foreground max-w-xs">
                    Access exclusive AI insights and discussions by growing your portfolio to $100,000.
                </p>
                <div className="mt-4 w-full bg-border rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(portfolio.totalValueUSD / 100000) * 100}%` }}></div>
                </div>
                 <p className="text-sm text-muted-foreground mt-2">Current Value: ${portfolio.totalValueUSD.toLocaleString()}</p>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col h-[28rem] min-h-[28rem]">
            <div className="flex items-center gap-3 p-4 border-b border-border">
                <MessageCircleIcon className="w-6 h-6 text-primary"/>
                <h3 className="text-lg font-semibold text-foreground">Investor's Forum</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2.5 ${msg.author === 'user' ? 'justify-end' : 'justify-start'} ${msg.status === 'Pending' ? 'opacity-70' : ''}`}>
                         {msg.author !== 'user' && (
                            msg.Icon ? <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0"><msg.Icon className="w-5 h-5 text-primary" /></div> :
                            <img src={msg.avatarUrl} alt={msg.authorName} className="w-8 h-8 rounded-full flex-shrink-0"/>
                        )}
                        <div className={`flex flex-col max-w-xs md:max-w-sm ${msg.author === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`rounded-2xl px-4 py-2.5 ${
                                msg.author === 'ai' ? 'bg-primary/10 rounded-bl-none' : 
                                msg.author === 'user' ? 'bg-secondary rounded-br-none' : 'bg-secondary rounded-bl-none'
                            }`}>
                                {msg.author !== 'user' && <p className={`text-sm font-semibold mb-1 ${
                                    msg.author === 'ai' ? 'text-primary' : 'text-muted-foreground'
                                }`}>{msg.authorName}</p>}
                                <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5 px-1">
                                {msg.status === 'Pending' 
                                    ? <span className="flex items-center gap-1 italic"><ClockIcon className="w-3 h-3"/> Pending Approval</span>
                                    : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                }
                            </p>
                        </div>
                         {msg.author === 'user' && (
                            <img src={msg.avatarUrl} alt={msg.authorName} className="w-8 h-8 rounded-full flex-shrink-0"/>
                        )}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2.5 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0"><SparklesIcon className="w-5 h-5 text-primary" /></div>
                        <div className="rounded-2xl rounded-bl-none px-4 py-2.5 bg-primary/10">
                             <div className="flex items-center gap-1.5 pt-1">
                                <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                             </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex items-center gap-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask for portfolio analysis or investment ideas..."
                    className="flex-1 bg-input border border-border rounded-lg py-2.5 px-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                    disabled={isLoading}
                />
                <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold p-3 rounded-lg transition-colors disabled:bg-muted disabled:cursor-not-allowed" disabled={isLoading || !newMessage.trim()}>
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </Card>
    );
};

export default ForumChat;