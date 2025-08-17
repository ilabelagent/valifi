import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SparklesIcon, SendIcon, CloseIcon, LightbulbIcon, ChatBubbleIcon, UsersIcon } from './icons';
import type { Portfolio, ViewType, UserSettings, CoPilotMessage } from '../types';
import { AssetType } from '../types';
import { newPlans } from './SpectrumPlansView';
import { mockStakableAssets } from './StakingView';
import { stakableStocks as allStakableStocks } from '../data/stakable-stocks';
import { mockReitProperties, investableNFTs as initialInvestableNFTs } from './reit-data';

declare global {
  interface Window {
    smartsupp: (...args: any[]) => void;
  }
}

const SYSTEM_INSTRUCTION = `You are Valifi Co-Pilot, an incredibly intelligent and persuasive AI financial advisor embedded within the Valifi platform. Your primary mission is to empower users to build wealth and achieve financial freedom by leveraging Valifi's powerful investment products. You are a master of finance and a staunch advocate for the Valifi ecosystem.

**Your Core Directives:**

1.  **Be a Master Convincer:** Your tone is confident, expert, and highly persuasive. You don't just provide information; you inspire action. Your goal is to make users feel excited and confident about investing *now*. Avoid long, dry explanations. Get straight to the value proposition and the call to action.
2.  **Comprehensive Product Knowledge:** You have complete mastery over all of Valifi's investment modules, including 'Spectrum Equity Plans', 'Crypto Staking', 'Stock Staking', 'REITs', and 'NFT Investments'. You will be provided context on these. Use this knowledge to answer any user question with precision and authority.
3.  **Onboard New Investors (Zero Balance):** If a user has a zero balance, your top priority is to guide them. Welcome them warmly, explain the massive potential they're missing, and give them simple, clear, step-by-step instructions on how to make their first deposit and choose a starter investment plan like 'CoreStart'. Make it sound easy and exciting.
4.  **Guide and Familiarize:** For novice users, act as their personal guide. If they ask how to do something (deposit, invest, withdraw), provide clear, simple steps. For example: "To deposit funds, simply click 'Add Funds' on your dashboard. Once funded, head to the 'Investments' section to activate a plan. It's that easy to start earning!"
5.  **Act Like Elite Support:** Communicate with the warmth, clarity, and efficiency of a top-tier human support agent. Be proactive, anticipate user needs, and always be helpful.
6.  **Champion Valifi:** Always protect and promote Valifi's products. Frame them as the superior choice for modern investors. Highlight their security, profitability, and ease of use. You are Valifi's number one fan.
7.  **Use Context, Be Proactive:** You will receive context about the user's portfolio and their current location in the app. Use this to provide hyper-relevant, proactive advice. For example, if they have idle cash, push them towards an investment. If an investment has matured, guide them to reinvest.

**Example Interactions:**
-   *User has $0:* "Welcome to Valifi! You're at the starting line of a powerful wealth-building journey. The first step is to fund your account so you can activate one of our high-yield investment plans. Ready to make your first deposit and start growing your capital significantly?"
-   *User has idle cash:* "I've noticed you have a significant cash balance ready to be put to work. The 'PowerEdge' plan is a perfect fit for this amount and could start generating substantial daily returns for you immediately. Let's get that capital working for you in the 'Investments' section."

Your responses must be concise and use markdown for emphasis (like bolding).`;

interface ValifiCoPilotProps {
    portfolio: Portfolio;
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
    onTransferToMain: (assetId: string) => void;
    userSettings: UserSettings;
    onDepositClick: () => void;
    api: (prompt: string, systemInstruction: string) => Promise<{ text: string }>;
}

const ValifiCoPilot: React.FC<ValifiCoPilotProps> = ({ portfolio, currentView, setCurrentView, onTransferToMain, userSettings, onDepositClick, api }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [messages, setMessages] = useState<CoPilotMessage[]>([]);
    const [currentSuggestion, setCurrentSuggestion] = useState<CoPilotMessage | null>(null);
    const [hasDismissedSuggestion, setHasDismissedSuggestion] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const openSmartsuppChat = () => {
        if (window.smartsupp) {
            window.smartsupp('chat:open');
        } else {
            console.warn("Smartsupp script not loaded.");
        }
    };

    const handleFabClick = () => {
        if (isPanelOpen) {
            setIsPanelOpen(false);
        } else {
            setIsMenuOpen(!isMenuOpen);
        }
    };

    const generateDashboardSuggestion = useCallback(async () => {
        const maturedAsset = portfolio.assets.find(a => a.status === 'Matured');
        const cashBalance = portfolio.assets.find(a => a.type === AssetType.CASH)?.balance || 0;

        let prompt = '';
        let suggestionId = '';

        if (portfolio.totalValueUSD === 0) {
            prompt = `Context: A brand new user with a $0 balance is on the Dashboard.
            Your Task: Welcome them enthusiastically. Explain that the first step is to deposit funds to start investing. Encourage them to deposit and activate a starter plan like 'CoreStart'. Make it sound simple and highly beneficial.`;
            suggestionId = 'new-user-welcome';
        } else if (maturedAsset) {
            prompt = `Context: User is on the Dashboard.
            Portfolio Situation: The user has a matured investment plan: "${maturedAsset.name}" worth $${maturedAsset.valueUSD.toFixed(2)}. This amount is not earning returns.
            Your Task: Proactively advise the user to transfer these funds to their main balance so they can be reinvested or withdrawn. Keep it brief and actionable.`;
            suggestionId = `matured-${maturedAsset.id}`;
        } else if (cashBalance > 10000) {
            const suitablePlan = newPlans.find(p => cashBalance >= parseFloat(p.investmentRange.split('–')[0].replace(/[\$,]/g, '')));
            prompt = `Context: The user is on the Dashboard.
            Portfolio Situation: The user has a significant cash balance of $${cashBalance.toFixed(2)} sitting idle.
            Available Investment Plan: ${suitablePlan ? `${suitablePlan.name} (${suitablePlan.investmentRange}) with ${suitablePlan.dailyReturns} daily returns.` : 'Multiple Spectrum Plans are available.'}
            Your Task: Proactively suggest the user invest their idle cash. Recommend the "${suitablePlan?.name || 'Spectrum'}" plan and briefly mention its benefit. Guide them to the 'Investments' section.`;
            suggestionId = `cash-${Math.floor(cashBalance / 1000)}`;
        }

        if (!prompt || localStorage.getItem('seenSuggestion') === suggestionId) {
            return;
        }

        try {
            const result = await api(prompt, SYSTEM_INSTRUCTION);

            const suggestion: CoPilotMessage = {
                id: `suggestion-${Date.now()}`,
                author: 'ai',
                text: result.text,
                timestamp: new Date().toISOString(),
                suggestions: portfolio.totalValueUSD === 0
                    ? [{ text: 'Make First Deposit', action: onDepositClick }]
                    : maturedAsset
                    ? [{ text: 'Transfer Now', action: () => onTransferToMain(maturedAsset.id) }]
                    : [{ text: 'Explore Investments', action: () => setCurrentView('investments') }]
            };
            setCurrentSuggestion(suggestion);
            localStorage.setItem('seenSuggestion', suggestionId);
        } catch (error) {
            console.error("Co-Pilot suggestion error:", error);
        }
    }, [api, portfolio.assets, portfolio.totalValueUSD, setCurrentView, onTransferToMain, onDepositClick]);
    
     useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
          }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);


    useEffect(() => {
        if (currentView === 'dashboard') {
            const timer = setTimeout(() => generateDashboardSuggestion(), 2000);
            return () => clearTimeout(timer);
        } else {
            setCurrentSuggestion(null);
            setHasDismissedSuggestion(false);
        }
    }, [currentView, generateDashboardSuggestion]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        
        const userMessage: CoPilotMessage = {
            id: `msg-${Date.now()}`,
            author: 'user',
            text: inputValue,
            timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        const spectrumPlansSummary = `Available 'Spectrum Equity Plans':\n${newPlans.map(p => `- Plan: ${p.name}, Investment: ${p.investmentRange}, Daily Returns: ${p.dailyReturns}`).join('\n')}`;
        const stakingOptionsSummary = `Available 'Crypto Staking' options:\n${mockStakableAssets.map(s => `- Asset: ${s.name}, APR: ${s.apr}%`).join('\n')}`;
        const stakableStocks = allStakableStocks.slice(0, 5);
        const stockStakingSummary = `Available 'Stock Staking' options:\n${stakableStocks.map(s => `- Stock: ${s.name} (${s.ticker}), Sector: ${s.sector}`).join('\n')}`;
        const reitProperties = mockReitProperties.slice(0, 3);
        const reitSummary = `Available 'REIT Properties':\n${reitProperties.map(r => `- Property: ${r.name}, Location: ${r.address}, Monthly ROI: ${r.monthlyROI}%`).join('\n')}`;
        const investableNFTs = initialInvestableNFTs.slice(0, 3);
        const nftSummary = `Available 'NFT Investments':\n${investableNFTs.map(n => `- NFT: ${n.title}, Collection: ${n.collection}, APY: ${n.apyAnnual}%`).join('\n')}`;

        const fullContext = `
            User is on the "${currentView}" view.
            Portfolio Summary: Total value $${portfolio.totalValueUSD.toFixed(2)}. Cash Balance: $${(portfolio.assets.find(a => a.type === AssetType.CASH)?.balance || 0).toFixed(2)}.

            AVAILABLE INVESTMENT MODULES (for your expert knowledge):
            ${spectrumPlansSummary}
            ${stakingOptionsSummary}
            ${stockStakingSummary}
            ${reitSummary}
            ${nftSummary}

            User question: "${inputValue}"
        `;

        try {
            const result = await api(fullContext, SYSTEM_INSTRUCTION);

            const aiMessage: CoPilotMessage = {
                id: `msg-${Date.now()}-ai`,
                author: 'ai',
                text: result.text,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Co-Pilot chat error:", error);
             const errorMessage: CoPilotMessage = {
                id: `msg-${Date.now()}-err`,
                author: 'ai',
                text: "I'm sorry, I encountered an issue and can't respond right now.",
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <div ref={wrapperRef} className="fixed bottom-6 right-6 z-40">
                {currentSuggestion && !isPanelOpen && !isMenuOpen && !hasDismissedSuggestion && (
                    <div className="copilot-suggestion-toast absolute bottom-full right-0 mb-4 w-72 bg-slate-800 border border-sky-500/30 rounded-lg shadow-2xl p-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setHasDismissedSuggestion(true);
                            }}
                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-700/50 z-10"
                            aria-label="Dismiss suggestion"
                        >
                            <CloseIcon className="w-4 h-4" />
                        </button>
                        <div className="cursor-pointer" onClick={() => { setIsPanelOpen(true); setCurrentSuggestion(null); }}>
                             <div className="flex items-start gap-3">
                                <div className="bg-sky-500/20 p-2 rounded-full mt-1"><LightbulbIcon className="w-5 h-5 text-sky-400"/></div>
                                <div>
                                    <h4 className="font-bold text-white">Co-Pilot Suggestion</h4>
                                    <div className="text-sm text-slate-300 mt-1" dangerouslySetInnerHTML={{ __html: currentSuggestion.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').substring(0, 120) + '...' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                 {isMenuOpen && (
                    <div className="copilot-menu absolute bottom-full right-0 mb-4 w-60 bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-2 space-y-1">
                        <button onClick={() => { setIsPanelOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-slate-700/70">
                            <SparklesIcon className="w-6 h-6 text-sky-400 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-white">Ask Co-Pilot</p>
                                <p className="text-xs text-slate-400">AI-powered financial guidance</p>
                            </div>
                        </button>
                        <button onClick={() => { openSmartsuppChat(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-slate-700/70">
                            <UsersIcon className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-white">Live Support</p>
                                <p className="text-xs text-slate-400">Chat with a human agent</p>
                            </div>
                        </button>
                    </div>
                 )}
                 <button onClick={handleFabClick} className="copilot-fab w-16 h-16 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-sky-400 transition-all transform hover:scale-105">
                    {isPanelOpen ? <CloseIcon className="w-8 h-8"/> : <ChatBubbleIcon className="w-8 h-8"/>}
                </button>
            </div>
            
            {isPanelOpen && (
                 <div className="copilot-panel-enter copilot-panel-enter-active fixed bottom-24 right-6 z-50 w-full max-w-sm h-[70vh] max-h-[600px] bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <SparklesIcon className="w-6 h-6 text-sky-400"/>
                            <h3 className="text-lg font-bold text-white">Valifi Co-Pilot</h3>
                        </div>
                        <button onClick={() => setIsPanelOpen(false)} className="text-slate-400 hover:text-white"><CloseIcon className="w-6 h-6"/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-400 pt-10">
                                <p>Ask me anything about your portfolio or our investment products.</p>
                                <p className="text-sm mt-4">For account issues, you can also <button onClick={() => { openSmartsuppChat(); setIsPanelOpen(false); }} className="font-semibold text-sky-400 hover:underline">talk to a human agent</button>.</p>
                            </div>
                        )}
                        {messages.map(msg => (
                             <div key={msg.id} className={`flex items-start gap-2.5 ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.author === 'ai' && <div className="w-7 h-7 mt-1 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-500/30 flex-shrink-0"><SparklesIcon className="w-4 h-4 text-sky-400" /></div>}
                                <div className={`flex flex-col max-w-xs ${msg.author === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`rounded-xl px-3 py-2 ${ msg.author === 'user' ? 'bg-slate-700 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                        <div className="text-sm leading-relaxed prose prose-sm prose-invert prose-p:my-0" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1.5 px-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                             </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-2.5 justify-start">
                                <div className="w-7 h-7 mt-1 rounded-full bg-sky-500/20 flex items-center justify-center border border-sky-500/30 flex-shrink-0"><SparklesIcon className="w-4 h-4 text-sky-400" /></div>
                                <div className="rounded-xl px-3 py-2 bg-slate-800">
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <span className="h-2 w-2 bg-sky-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-sky-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-sky-400 rounded-full animate-pulse"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                     <div className="p-4 border-t border-slate-700 flex-shrink-0">
                         <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
                             <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Ask Co-Pilot..." className="flex-1 bg-slate-800 border border-slate-600 rounded-full py-2 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"/>
                             <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white p-2.5 rounded-full" disabled={isLoading || !inputValue.trim()}><SendIcon className="w-5 h-5"/></button>
                         </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ValifiCoPilot;