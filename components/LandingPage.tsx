

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ValifiLogo, SparklesIcon, P2PIcon, InvestmentsIcon, NftIcon, HomeIcon, CardIcon, ShieldCheckIcon, LockIcon, TwitterIcon, InstagramIcon, LinkedInIcon, ForbesLogo, TechCrunchLogo, BloombergLogo, BriefcaseIcon, TrendingUpIcon, EyeIcon, ClockIcon, SettingsIcon, CloseIcon, PaletteIcon, GlobeIcon } from './icons';
import { newPlans } from './SpectrumPlansView';
import JobApplicationModal from './JobApplicationModal';
import FAQSection from './FAQSection';
import FeatureDetailModal from './FeatureDetailModal';
import type { Feature } from './FeatureDetailModal';
import type { UserSettings, Language } from '../types';
import { languageList } from '../i18n';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import * as apiService from '../services/api';


interface LandingPageProps {
    onLogin: (email: string, password: string) => Promise<{ success: boolean, message?: string }>;
    onSignUp: (fullName: string, username: string, email: string, password: string) => Promise<{ success: boolean, message?: string }>;
    userSettings: UserSettings;
    setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

const features: Feature[] = [
    {
        Icon: SparklesIcon,
        title: "AI-Powered Insights",
        description: "Leverage our advanced AI for portfolio analysis, market predictions, and personalized investment strategies.",
        details: {
            headline: "Your Personal Wall Street Analyst, On-Demand.",
            body: "Valifi Co-Pilot isn't just a chatbot; it's a sophisticated financial AI trained on terabytes of market data. It proactively analyzes your portfolio, identifies growth opportunities, and alerts you to potential risks. From suggesting the perfect Spectrum Plan for your idle cash to providing in-depth analysis on market trends, our AI gives you the edge you need to invest with confidence and precision.",
            points: [
                "Personalized portfolio analysis based on your holdings.",
                "Proactive investment suggestions tailored to you.",
                "Real-time market trend and sentiment analysis.",
                "24/7 access to expert-level financial guidance."
            ]
        }
    },
    {
        Icon: InvestmentsIcon,
        title: "High-Yield Staking",
        description: "Earn passive income by staking your crypto and stock assets in our secure, high-return pools.",
        details: {
            headline: "Earn Passive Income, Effortlessly.",
            body: "Put your assets to work. Valifi's staking modules allow you to earn competitive returns on your crypto and stock holdings. By participating in our secure staking pools, you contribute to network security (for crypto) or provide liquidity (for stocks) and are rewarded with consistent payouts. It's the simplest way to grow your portfolio without active trading.",
            points: [
                "Stake both cryptocurrencies and top-tier stocks.",
                "Competitive APY and monthly ROI.",
                "Flexible terms and transparent reward structures.",
                "Automatic reward compounding options."
            ]
        }
    },
    {
        Icon: P2PIcon,
        title: "Global P2P Exchange",
        description: "Trade crypto directly and securely with other users worldwide using your preferred payment methods.",
        details: {
            headline: "Trade Without Borders.",
            body: "Break free from traditional exchanges. Our P2P Smart Trading Engine connects you directly with buyers and sellers across the globe. Set your own prices, choose from hundreds of payment methods, and trade securely with our smart contract-based escrow system. It's peer-to-peer finance with enterprise-grade security.",
            points: [
                "Trade directly with other users.",
                "Support for global payment methods.",
                "Smart contract escrow for ultimate security.",
                "Advanced reputation and dispute resolution system."
            ]
        }
    },
    {
        Icon: NftIcon,
        title: "Fractional NFTs",
        description: "Invest in shares of high-value digital art and collectibles, making blue-chip NFTs accessible to everyone.",
        details: {
            headline: "Own a Piece of Digital History.",
            body: "The world of blue-chip NFTs is no longer just for the ultra-wealthy. Valifi's fractionalization protocol allows you to buy and sell shares of iconic digital art and collectibles. Diversify your portfolio with a stake in a CryptoPunk or a Bored Ape, and benefit from the appreciation of these high-value assets.",
            points: [
                "Invest in blue-chip NFTs for as little as $100.",
                "Liquid, tradable shares of high-value assets.",
                "Earn passive income from staked NFT shares.",
                "Fully transparent and on-chain ownership."
            ]
        }
    },
    {
        Icon: HomeIcon,
        title: "Real Estate (REITs)",
        description: "Diversify your portfolio with fractional ownership in high-yield commercial and residential properties.",
        details: {
            headline: "Build Your Real Estate Empire, One Share at a Time.",
            body: "Diversify into one of the most stable asset classes with Valifi REITs. We offer tokenized, fractional ownership in a curated portfolio of high-yield commercial and residential properties across the globe. Earn monthly dividends from rental income and benefit from property value appreciation, all without the hassles of traditional property management.",
            points: [
                "Invest in global real estate with a small capital.",
                "Receive monthly passive income from rental yields.",
                "Liquid and tradable property shares.",
                "Professionally managed, high-quality properties."
            ]
        }
    },
    {
        Icon: CardIcon,
        title: "Valifi Cards",
        description: "Spend your earnings globally with our virtual and physical cards, seamlessly connected to your portfolio.",
        details: {
            headline: "Spend Your Profits, Instantly.",
            body: "Bridge the gap between your digital assets and the real world. The Valifi Card lets you spend your crypto or fiat balance anywhere cards are accepted. Withdraw cash from ATMs, make online purchases, or pay for your daily coffee. With virtual and physical options, it's the ultimate tool for financial freedom.",
            points: [
                "Available in virtual and physical formats.",
                "Spend directly from your Valifi balance.",
                "Global ATM withdrawals.",
                "Advanced security features, including card freezing."
            ]
        }
    }
];

const philosophyPoints = [
    {
        Icon: TrendingUpIcon,
        title: "Follow Proven Strategies",
        description: "We leverage advanced quantitative models based on the latest academic research and market-tested methodologies to guide every decision. By using data-driven insights rather than intuition or guesswork, we ensure that our investments are grounded in objective analysis, not emotion. Our strategy blends fundamental analysis (understanding the true value of assets) with technical analysis (spotting trends and market signals), ensuring that we identify the best opportunities, irrespective of short-term volatility.",
        subPoints: [
            { label: "Data-driven decisions:", text: "Every asset, every portfolio is backed by quantitative models, ensuring that risk is minimized and returns are optimized." },
            { label: "Cutting-edge research:", text: "We base our strategies on rigorous academic research, ensuring we’re always at the forefront of the latest financial advancements." }
        ]
    },
    {
        Icon: ShieldCheckIcon,
        title: "Blend Strategies to Manage Risk and Increase Returns",
        description: "At Valifi, we understand that risk and return are inextricably linked. Therefore, we blend various strategies to manage risk effectively while maximizing returns. By diversifying across different asset classes and using methods such as quantitative portfolio optimization, we ensure that each investment is balanced with a level of risk suitable for your goals.",
        subPoints: [
            { label: "Risk mitigation through diversification:", text: "By blending multiple asset classes (stocks, crypto, real estate, and more), we reduce exposure to any single market or risk factor." },
            { label: "Portfolio optimization:", text: "We constantly optimize portfolios using a combination of efficient frontier analysis and mean-variance optimization, guaranteeing the highest possible return for the least amount of risk." }
        ]
    },
    {
        Icon: LockIcon,
        title: "Invest with Discipline",
        description: "We do not allow emotions to dictate our investment decisions. Unlike traditional approaches where impulsive market decisions can wreak havoc on returns, Valifi’s disciplined approach ensures that every investment is made based on systematic logic. By focusing on objective data rather than reacting to market noise, we create a steady, predictable path to wealth creation.",
        subPoints: [
            { label: "Systematic portfolio management:", text: "Our automated systems track and re-balance portfolios, ensuring they’re always in line with your financial goals." },
            { label: "No emotional bias:", text: "We remove the emotional influence that often clouds investor decision-making, allowing us to stay objective, even when markets experience extreme volatility." },
            { label: "Smart exit strategies:", text: "We employ intelligent selling techniques, keeping only the most valuable assets while divesting underperforming ones at optimal times, ensuring we preserve your wealth." }
        ]
    },
    {
        Icon: ClockIcon,
        title: "Long-Term Focus",
        description: "We firmly believe that long-term investing is the key to significant wealth creation. While others might chase short-term gains or attempt to time the market, we understand that patience and strategy over time yield the highest returns. Valifi adopts a long-term view, where we focus on high-quality assets with a proven track record and let the market’s natural growth unfold.",
        subPoints: [
            { label: "Maximized tax efficiency:", text: "Our long-term strategies incorporate tax minimization tactics, ensuring you keep more of what you earn and avoid unnecessary tax burdens." },
            { label: "Sustainable, compound growth:", text: "By sticking to a steady, disciplined investment strategy, we allow your investments to grow exponentially, thanks to the power of compound interest and reinvested earnings." },
            { label: "Tested models for consistent returns:", text: "Our models have been designed for the long haul, constantly evolving and adapting to market changes while maintaining focus on steady growth." },
            { label: "Adhering to strategies that work:", text: "We don’t chase short-term fads; we stick to what has been proven over decades of research. Our commitment to proven long-term strategies gives investors the peace of mind to watch their portfolios grow over time." }
        ]
    },
    {
        Icon: EyeIcon,
        title: "Transparent and Ethical Practices",
        description: "At Valifi, we hold ourselves to the highest standards of transparency and ethical investing. We adhere strictly to anti-money laundering (AML) and know-your-customer (KYC) regulations, ensuring your investments are always compliant with global financial laws.",
        subPoints: [
            { label: "Complete transparency:", text: "All of our strategies, fees, and financial instruments are clearly communicated to investors. No hidden fees, no surprises." },
            { label: "Ethical investment practices:", text: "We believe that it’s important to align our investment strategy with ethical standards. We invest in companies and assets that prioritize sustainability, social responsibility, and long-term value." }
        ]
    },
    {
        Icon: SparklesIcon,
        title: "AI-Powered Investment Strategy",
        description: "Our AI-powered investment platform provides cutting-edge tools to help investors make more informed decisions. The AI Co-Pilot provides real-time portfolio analysis, suggesting adjustments based on market conditions and individual investor profiles.",
        subPoints: [
            { label: "Data-backed portfolio management:", text: "Our AI models analyze millions of data points every second, making real-time investment decisions and adjustments that optimize your returns." },
            { label: "AI recommendations:", text: "With AI-driven insights, investors receive suggestions for portfolio adjustments, ensuring they’re always positioned to maximize returns while minimizing risk." }
        ]
    },
    {
        Icon: InvestmentsIcon,
        title: "Spectrum Equity Plans",
        description: "We understand that investors are looking for high returns, and Valifi’s Spectrum Equity Plans deliver exactly that. These plans are designed to provide high returns with controlled risk, making them an ideal choice for both new and seasoned investors.",
        subPoints: [
            { label: "High ROI:", text: "The Spectrum Equity Plans offer impressive returns that are substantially higher than traditional investment options, thanks to our strategic focus on high-performing assets." },
            { label: "Low risk:", text: "By balancing multiple types of assets, including real estate, stocks, and digital assets, we provide stable income and capital appreciation for long-term investors." },
            { label: "Automatic Rebalancing:", text: "The Spectrum Equity Plans are automatically rebalanced based on real-time market data, ensuring you always hold the best-performing assets." }
        ]
    },
    {
        Icon: SettingsIcon,
        title: "Premium Investor Tools",
        description: "Valifi provides a suite of tools designed to give you a clear view of your financial landscape and empower your decisions.",
        subPoints: [
            { label: "Dynamic ROI Calculator:", text: "Users can enter their investment amounts into a dynamic ROI calculator that instantly displays projected returns for each Spectrum plan based on real-time data and market conditions." },
            { label: "Investment Dashboard:", text: "A real-time, interactive dashboard that gives investors a live overview of their assets, total ROI, and future projections." }
        ]
    }
];

const leadershipTeam = [
    {
        name: "Reese",
        title: "CEO & Founder",
        bio: "Reese’s vision for Valifi stems from his experience in quantitative finance and AI development. His goal was to democratize high-end investment strategies and offer them to a global audience using cutting-edge technology."
    },
    {
        name: "Jack Michael",
        title: "CIO",
        bio: "Jack has over 15 years of experience in financial portfolio management. He has worked closely with the founder to design Valifi’s quantitative models, ensuring that every investor has access to intelligent and optimized investment solutions."
    },
    {
        name: "Stephanie White",
        title: "Investment Strategy Advisor",
        bio: "Stephanie is a highly respected figure in the finance industry, with over 20 years of experience in investment research and portfolio management. She brings her expertise to Valifi, ensuring that our strategies remain innovative, adaptable, and profitable for our clients."
    }
];

// --- NEW LEGAL MODAL COMPONENT ---
interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: React.ReactNode;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-modal-title"
        >
            <div 
                className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl shadow-2xl w-full max-w-3xl m-4 text-foreground transform transition-all max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-border flex-shrink-0">
                    <h2 id="legal-modal-title" className="text-2xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-accent" aria-label="Close">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-8 space-y-4 overflow-y-auto prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground max-w-none">
                    {content}
                </div>
                <div className="p-4 border-t border-border flex-shrink-0 flex justify-end">
                    <button onClick={onClose} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const infoDocs = {
    terms: {
        title: "Terms of Service",
        content: (
            <>
                <p className="lead">Valifi’s Terms of Service ensure full transparency and protection for all our users. By using our services, you agree to these terms, which include provisions for security, transaction management, and investment risk.</p>
                <p>This document governs your use of the Valifi platform. It is a legal agreement between you and Valifi, Inc. By accessing or using the platform, you agree that you have read, understood, and accept all of the terms and conditions contained in this agreement. If you do not agree, do not use the service.</p>
                <h4>1. Eligibility</h4>
                <p>You must be 18 years or older to use Valifi. By using our services, you represent and warrant that you meet this requirement.</p>
                <h4>2. Investment Risks</h4>
                <p>All investments involve risk. Valifi provides tools and information, but does not guarantee profits or protect against losses. The value of investments can go up as well as down. You are solely responsible for your investment decisions.</p>
                <h4>3. User Conduct</h4>
                <p>You agree not to use the service for any illegal activities, including but not limited to money laundering, terrorist financing, or fraudulent activities. You are responsible for maintaining the security of your account credentials.</p>
            </>
        )
    },
    privacy: {
        title: "Privacy Policy",
        content: (
            <>
                <p className="lead">Your privacy is our top priority. Our Privacy Policy outlines how we manage your personal data, ensuring compliance with global standards like GDPR, AML, and KYC regulations.</p>
                <h4>1. Information We Collect</h4>
                <p>To comply with regulations (AML/KYC), we collect personal information such as your name, address, date of birth, and government-issued identification. We also collect transaction data and usage information to improve our services.</p>
                <h4>2. How We Use Your Information</h4>
                <p>Your information is used to: verify your identity, process transactions, secure your account, communicate with you, and comply with legal obligations. We do not sell your personal data to third parties.</p>
                <h4>3. Data Security</h4>
                <p>We implement state-of-the-art security measures, including AES-256 encryption and cold storage for digital assets, to protect your information from unauthorized access.</p>
            </>
        )
    },
    about: {
        title: "About Us",
        content: (
            <>
                <p className="lead">At Valifi, we combine decades of industry expertise with the power of artificial intelligence to help you achieve financial success.</p>
                <p>Whether you’re a beginner investor or an experienced trader, Valifi provides the right tools, investment strategies, and a transparent platform to help you reach your goals. Our mission is to democratize access to sophisticated financial instruments, making it possible for anyone to build long-term wealth with confidence.</p>
                <p>We are built on a foundation of data-driven strategies, rigorous security, and an unwavering commitment to our users' success.</p>
            </>
        )
    },
    contact: {
        title: "Contact Us",
        content: (
            <>
                <p className="lead">If you have any questions, concerns, or inquiries, please feel free to reach out to us. Our support team is here to assist you.</p>
                <h4>General & Support Inquiries</h4>
                <p>For all support-related questions, please email our dedicated team at:</p>
                <p><strong>Email:</strong> <a href="mailto:support@valifi.net" className="text-primary hover:underline">support@valifi.net</a></p>
                <h4>Business & Partnership Inquiries</h4>
                <p>For business proposals or partnership opportunities, please contact our business development team at <a href="mailto:partners@valifi.net" className="text-primary hover:underline">partners@valifi.net</a>.</p>
                <h4>Address</h4>
                <p>Valifi, Inc.<br/>123 Finance Avenue<br/>Innovation City, 10101, USA</p>
            </>
        )
    }
};


const LandingHeader: React.FC<{
    onSignInClick: () => void;
    onExplore: () => void;
    onCareersClick: () => void;
    onFaqClick: () => void;
    onPhilosophyClick: () => void;
    onLeadershipClick: () => void;
    userSettings: UserSettings;
    setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}> = ({ onSignInClick, onExplore, onCareersClick, onFaqClick, onPhilosophyClick, onLeadershipClick, userSettings, setUserSettings }) => {
    const { t, i18n } = useTranslation('landing');
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const langMenuRef = useRef<HTMLDivElement>(null);

    const handleLanguageChange = (langCode: Language) => {
        i18n.changeLanguage(langCode);
        setUserSettings(prev => ({ ...prev, settings: { ...prev.settings, preferences: { ...prev.settings.preferences, language: langCode } } }));
        setIsLangMenuOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
                setIsLangMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [langMenuRef]);

    return (
        <header className="absolute top-0 left-0 right-0 z-30 p-4">
            <div className="container mx-auto flex justify-between items-center bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                    <ValifiLogo className="w-9 h-9 text-primary" />
                    <span className="text-xl font-bold text-white tracking-tighter">Valifi</span>
                    <div className="relative" ref={langMenuRef}>
                        <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="text-muted-foreground hover:text-foreground p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title={t('change_language')}>
                            <GlobeIcon className="w-5 h-5" />
                        </button>
                        {isLangMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-56 max-h-96 overflow-y-auto bg-popover/90 backdrop-blur-md border border-border rounded-xl shadow-2xl p-2 z-50">
                                {languageList.map(lang => (
                                    <button key={lang.code} onClick={() => handleLanguageChange(lang.code)} className={`w-full text-left px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${i18n.language === lang.code ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <a href="#features" onClick={(e) => { e.preventDefault(); onExplore(); }} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden md:block">{t('header_features')}</a>
                    <a href="#philosophy" onClick={(e) => { e.preventDefault(); onPhilosophyClick(); }} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden md:block">{t('header_philosophy')}</a>
                    <a href="#leadership" onClick={(e) => { e.preventDefault(); onLeadershipClick(); }} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden md:block">{t('header_leadership')}</a>
                    <a href="#spectrum" onClick={(e) => { e.preventDefault(); document.getElementById('spectrum')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden md:block">{t('header_plans')}</a>
                    <a href="#testimonials" onClick={(e) => { e.preventDefault(); document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden md:block">{t('header_testimonials')}</a>
                    <a href="#careers" onClick={(e) => { e.preventDefault(); onCareersClick(); }} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden md:block">{t('header_careers')}</a>
                    <a href="#faq" onClick={(e) => { e.preventDefault(); onFaqClick(); }} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden md:block">{t('header_faq')}</a>
                    
                    <button onClick={onSignInClick} className="text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                        {t('header_signin')}
                    </button>
                </div>
            </div>
        </header>
    );
};

const HeroSection: React.FC<{ onSignUpClick: () => void; onExplore: () => void }> = ({ onSignUpClick, onExplore }) => {
    const { t } = useTranslation('landing');
    return (
        <section className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
            <div className="absolute inset-0 bg-background">
                <img src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop" alt="Financial Growth Background" className="w-full h-full object-cover opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
            </div>
            <div className="relative z-10 p-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-muted-foreground">
                    {t('hero_title')}
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                    {t('hero_subtitle')}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={onSignUpClick} className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/20">
                        {t('get_started_now')}
                    </button>
                    <button onClick={onExplore} className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-lg transition-colors backdrop-blur-sm border border-white/20">
                        {t('explore_platform')}
                    </button>
                </div>
            </div>
        </section>
    );
};

const FeatureCard: React.FC<{ feature: Feature, onLearnMore: () => void }> = ({ feature, onLearnMore }) => (
    <div className="bg-card/50 p-6 rounded-2xl border border-border transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
        <div className="bg-secondary w-12 h-12 flex items-center justify-center rounded-xl mb-4">
            <feature.Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
        <button onClick={onLearnMore} className="text-sm font-semibold text-primary hover:text-primary/80 mt-4 inline-block">Learn More &rarr;</button>
    </div>
);

const FeaturesSection = React.forwardRef<HTMLDivElement, { onLearnMore: (feature: Feature) => void }>((props, ref) => {
    const { t } = useTranslation('landing');
    return (
        <section ref={ref} id="features" className="py-20 sm:py-32">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('features_title')}</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">{t('features_subtitle')}</p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map(feature => (
                        <FeatureCard key={feature.title} feature={feature} onLearnMore={() => props.onLearnMore(feature)} />
                    ))}
                </div>
            </div>
        </section>
    );
});
FeaturesSection.displayName = 'FeaturesSection';

const PhilosophyCard: React.FC<{ item: typeof philosophyPoints[0], index: number }> = ({ item, index }) => (
    <div className="bg-card/50 p-6 rounded-2xl border border-border transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
        <div className="flex items-center gap-4">
            <div className="bg-secondary w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0">
                <item.Icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{index + 1}. {item.title}</h3>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{item.description}</p>
        {item.subPoints && item.subPoints.length > 0 && (
            <ul className="mt-4 space-y-2">
                {item.subPoints.map((sp, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                        <strong className="text-foreground">{sp.label}</strong> {sp.text}
                    </li>
                ))}
            </ul>
        )}
    </div>
);

const PhilosophySection = React.forwardRef<HTMLDivElement>((props, ref) => (
    <section ref={ref} id="philosophy" className="py-20 sm:py-32 bg-background/40">
        <div className="container mx-auto px-4">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">What We Believe</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Our Investment Philosophy at Valifi</p>
            </div>
            <p className="mt-8 max-w-4xl mx-auto text-center text-foreground">
                At Valifi, we recognize that successful investing isn’t about speculation or following trends—it’s about precision, discipline, and data-backed insights. Our philosophy is rooted in proven strategies, systematic processes, and a deep commitment to helping our clients build long-term wealth. We believe that anyone, regardless of their experience or wealth, can achieve financial success when they invest intelligently. Here’s how we approach it:
            </p>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                {philosophyPoints.map((point, index) => (
                    <PhilosophyCard key={point.title} item={point} index={index} />
                ))}
            </div>
        </div>
    </section>
));
PhilosophySection.displayName = 'PhilosophySection';

const LeadershipSection = React.forwardRef<HTMLDivElement>((props, ref) => (
    <section ref={ref} id="leadership" className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Founders and Leadership</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">The leadership at Valifi brings a wealth of knowledge, experience, and expertise from across the financial and tech industries:</p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {leadershipTeam.map(leader => (
                    <div key={leader.name} className="bg-card/50 p-8 rounded-2xl border border-border text-center transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
                        <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                            {leader.name}
                        </h3>
                        <p className="font-semibold text-primary mt-1">{leader.title}</p>
                        <p className="mt-4 text-sm text-muted-foreground">{leader.bio}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
));
LeadershipSection.displayName = 'LeadershipSection';


const formatCurrencyFallback = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};


const ProfitCalculator = () => {
    const formatCurrency = formatCurrencyFallback;
    const [amount, setAmount] = useState('10000');
    const [duration, setDuration] = useState('90');
    const defaultPlan = newPlans.find(p => p.id === 'alphaplus') || newPlans[0];
    const [selectedPlanId, setSelectedPlanId] = useState(defaultPlan.id);

    const { projectedProfit, totalReturn, roiPercentage, selectedPlan } = useMemo(() => {
        const numericAmount = parseFloat(amount);
        const numericDuration = parseInt(duration);
        const plan = newPlans.find(p => p.id === selectedPlanId);

        if (!plan || isNaN(numericAmount) || numericAmount <= 0 || isNaN(numericDuration)) {
            return { projectedProfit: 0, totalReturn: 0, roiPercentage: 0, selectedPlan: null };
        }

        const dailyReturnPercent = parseFloat(plan.dailyReturns.replace('%', '')) / 100;
        const profit = numericAmount * dailyReturnPercent * numericDuration;
        const total = numericAmount + profit;
        const roi = total > 0 && numericAmount > 0 ? (profit / numericAmount) * 100 : 0;

        return {
            projectedProfit: profit,
            totalReturn: total,
            roiPercentage: roi,
            selectedPlan: plan,
        };
    }, [amount, duration, selectedPlanId]);
    
    const initialAmountPercentage = useMemo(() => {
        if (totalReturn === 0) return 100;
        return (parseFloat(amount) / totalReturn) * 100;
    }, [amount, totalReturn]);


    return (
        <div className="bg-card/50 p-6 md:p-8 rounded-2xl border border-border shadow-2xl shadow-black/30">
            <h3 className="text-2xl font-bold text-white text-center mb-6">Profit Calculator</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="investment-amount" className="block text-sm font-medium text-muted-foreground">Investment Amount (USD)</label>
                        <input
                            id="investment-amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-1 w-full bg-secondary border border-border rounded-lg py-2 px-3 text-white text-lg"
                            placeholder="e.g., 10000"
                        />
                    </div>
                     <div>
                        <label htmlFor="spectrum-plan" className="block text-sm font-medium text-muted-foreground">Spectrum Equity Plan</label>
                        <select
                            id="spectrum-plan"
                            value={selectedPlanId}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            className="mt-1 w-full bg-secondary border border-border rounded-lg py-2.5 px-3 text-white"
                        >
                            {newPlans.map(plan => (
                                <option key={plan.id} value={plan.id}>{plan.name} ({plan.dailyReturns} Daily)</option>
                            ))}
                        </select>
                        {selectedPlan && <p className="text-xs text-muted-foreground mt-1">Range: {selectedPlan.investmentRange}</p>}
                    </div>
                     <div>
                        <label htmlFor="investment-duration" className="block text-sm font-medium text-muted-foreground">Investment Duration</label>
                         <input
                            id="investment-duration"
                            type="range"
                            min="7"
                            max="365"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="mt-2 w-full range-lg"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>7 days</span>
                            <span className="font-bold text-primary">{duration} days</span>
                            <span>365 days</span>
                        </div>
                    </div>
                </div>

                <div className="bg-secondary/60 p-6 rounded-xl border border-border h-full flex flex-col justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Projected Profit</p>
                        <p className="text-4xl lg:text-5xl font-bold text-success tracking-tighter my-1">{formatCurrency(projectedProfit)}</p>
                        <p className="text-lg text-muted-foreground font-semibold">Total ROI: <span className="text-success">{roiPercentage.toFixed(2)}%</span></p>
                    </div>
                    <div className="mt-6">
                        <div className="w-full bg-muted rounded-full h-4 relative text-xs font-bold text-white overflow-hidden flex">
                            <div className="bg-primary h-full flex items-center justify-center pl-2" style={{ width: `${initialAmountPercentage}%`}}>Initial</div>
                            <div className="bg-success h-full flex items-center justify-center pr-2" style={{ width: `${100-initialAmountPercentage}%`}}>Profit</div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{formatCurrency(parseFloat(amount) || 0)}</span>
                            <span>{formatCurrency(totalReturn)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const PlanDetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-white/10">
        <span className="text-sm text-muted-foreground">{label}:</span>
        <span className="font-semibold text-white text-sm text-right">{value}</span>
    </div>
);

const LandingPlanCard: React.FC<{ plan: any, onInvestClick: () => void }> = ({ plan, onInvestClick }) => {
    const { t } = useTranslation('landing');
    return (
        <div className={`flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 hover:shadow-2xl hover:${plan.shadowColor} bg-card/50 p-6 rounded-2xl border border-border`}>
            <div className={`p-3 -m-6 mb-6 ${plan.colorClass} border-b-2 ${plan.borderColor}`}>
                <h3 className="text-xl font-bold text-white text-center tracking-tight">{plan.name}</h3>
            </div>
            <div className="flex-grow">
               <PlanDetailRow label="Investment Range" value={plan.investmentRange} />
               <PlanDetailRow label="Daily Returns" value={plan.dailyReturns} />
               <PlanDetailRow label="Capital Return" value={plan.capitalReturn} />
               <PlanDetailRow label="Total Periods" value={plan.totalPeriods} />
            </div>
            <div className="mt-6">
                <button 
                    onClick={onInvestClick}
                    className={`w-full text-md font-bold py-2.5 rounded-lg text-white transition-colors ${plan.buttonColor} shadow-lg ${plan.shadowColor}`}>
                    {t('invest_now', 'Invest Now')}
                </button>
            </div>
        </div>
    );
}

const SpectrumSection: React.FC<{ onSignInClick: () => void }> = ({ onSignInClick }) => (
     <section id="spectrum" className="py-20 sm:py-32 bg-background/40">
        <div className="container mx-auto px-4">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Spectrum Equity Plans</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    Choose a plan that matches your ambition. The bigger the investment, the greater the return. Calculate your potential profit below.
                </p>
            </div>

            <div className="mt-16">
                 <ProfitCalculator />
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {newPlans.slice(0, 4).map(plan => (
                    <LandingPlanCard key={plan.id} plan={plan} onInvestClick={onSignInClick} />
                ))}
            </div>
        </div>
    </section>
);


const initialTestimonials = [
    {
        id: 1,
        name: "Alex Johnson",
        title: "Early Adopter & Tech Investor",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2960&auto=format&fit=crop",
        quote: "Valifi’s AI Co-Pilot is a game-changer. It’s like having a personal Wall Street analyst helping me make smarter decisions and optimize my returns.",
        rating: 5,
        likes: 132,
        isLiked: false,
    },
    {
        id: 2,
        name: "Maria Garcia",
        title: "Freelance Designer",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2861&auto=format&fit=crop",
        quote: "The P2P exchange is incredibly intuitive and fast. I was able to trade with users in three different countries in one afternoon, with zero hassle.",
        rating: 5,
        likes: 98,
        isLiked: false,
    },
    {
        id: 3,
        name: "Kenji Tanaka",
        title: "Digital Artist",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2874&auto=format&fit=crop",
        quote: "As an artist, the fractional NFT platform has been revolutionary. It’s opened up a new market for my work and allowed more people to invest in my art.",
        rating: 5,
        likes: 215,
        isLiked: false,
    },
    {
        id: 4,
        name: "John Green",
        title: "Crypto Enthusiast & Blockchain Developer",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2874&auto=format&fit=crop",
        quote: "I started using Valifi because of the seamless integration between cryptocurrency wallets and investments. It’s easy, secure, and the AI-driven insights are spot on.",
        rating: 4,
        likes: 76,
        isLiked: false,
    },
    {
        id: 5,
        name: "Sarah Williams",
        title: "Business Owner & Entrepreneur",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2874&auto=format&fit=crop",
        quote: "I was initially hesitant about using a platform for both investing and managing business finance, but Valifi’s clear dashboard and investment tracking tools convinced me.",
        rating: 5,
        likes: 154,
        isLiked: false,
    },
    {
        id: 6,
        name: "Kevin Wright",
        title: "Stock Investor & Fund Manager",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2874&auto=format&fit=crop",
        quote: "The Stock Staking feature is brilliant. I can track my investments and receive passive returns weekly. The platform feels trustworthy and stable.",
        rating: 5,
        likes: 188,
        isLiked: false,
    },
    {
        id: 7,
        name: "Amira Hassan",
        title: "Real Estate Investor",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2876&auto=format&fit=crop",
        quote: "I invested in Valifi’s Spectrum Equity Plans, and the returns have been more than I expected. The platform provides solid analysis and confidence in where I invest.",
        rating: 5,
        likes: 201,
        isLiked: false,
    }
];

interface TestimonialCardProps {
    id: number;
    quote: string;
    name: string;
    title: string;
    avatar: string;
    rating: number;
    likes: number;
    isLiked: boolean;
    onLike: (id: number) => void;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ id, quote, name, title, avatar, rating, likes, isLiked, onLike }) => (
    <figure className="relative bg-card p-6 rounded-2xl border border-border transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 backdrop-blur-sm flex flex-col h-full">
        <span className="absolute top-4 left-5 text-7xl font-serif text-muted-foreground/50" aria-hidden="true">“</span>
        <blockquote className="text-muted-foreground mt-4 flex-grow relative z-10 pt-8">
            <p>{quote}</p>
        </blockquote>
        <figcaption className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
                <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-border shadow-lg"/>
                <div>
                    <div className="font-bold text-foreground text-base">{name}</div>
                    <div className="text-sm font-semibold text-muted-foreground">{title}</div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-muted-foreground/30'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                </div>
                 <button onClick={() => onLike(id)} className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${isLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}>
                    <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {likes}
                </button>
            </div>
        </figcaption>
    </figure>
);

const TestimonialsSection: React.FC<{ onSignInClick: () => void; }> = ({ onSignInClick }) => {
    const [testimonials, setTestimonials] = useState(initialTestimonials);

    const handleLike = (id: number) => {
        setTestimonials(currentTestimonials =>
            currentTestimonials.map(testimonial => {
                if (testimonial.id === id) {
                    return {
                        ...testimonial,
                        likes: testimonial.isLiked ? testimonial.likes - 1 : testimonial.likes + 1,
                        isLiked: !testimonial.isLiked,
                    };
                }
                return testimonial;
            })
        );
    };


    return (
        <section id="testimonials" className="py-20 sm:py-32 bg-background/50">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">Trusted by Investors Worldwide</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Hear what our users are saying about their success with Valifi.</p>
                </div>
            </div>
            <div className="testimonial-slider-wrapper mt-16">
                 <div className="testimonial-slider animate-marquee">
                    {testimonials.map((t) => (
                        <div key={`testimonial-${t.id}`} className="w-[90vw] sm:w-[60vw] md:w-[45vw] lg:w-[35vw] xl:w-[30vw] p-4 flex-shrink-0">
                             <TestimonialCard {...t} onLike={handleLike} />
                        </div>
                    ))}
                     {testimonials.map((t) => (
                        <div key={`testimonial-clone-${t.id}`} className="w-[90vw] sm:w-[60vw] md:w-[45vw] lg:w-[35vw] xl:w-[30vw] p-4 flex-shrink-0" aria-hidden="true">
                             <TestimonialCard {...t} onLike={handleLike} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="container mx-auto px-4 mt-16 text-center">
                 <button onClick={onSignInClick} className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/20">
                    Join Valifi Today and Start Your Investment Journey
                </button>
            </div>
        </section>
    );
};


const TrustSection: React.FC = () => (
    <section id="trust" className="py-20 sm:py-32">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Backed by Proven Expertise, Secured by Advanced Technology</h2>
                <p className="mt-6 text-muted-foreground">
                    Valifi combines decades of experience from Validea’s proven model-driven strategies. With over $1.5 billion under management, Validea Capital has a track record of delivering superior returns by leveraging quantitative analysis and investment strategies used by some of the world’s greatest investors.
                </p>
                <p className="mt-4 text-muted-foreground">
                    We've built Valifi on this foundation of trust, employing state-of-the-art security measures to protect your assets and data, so you can invest with complete peace of mind.
                </p>
                <ul className="mt-8 space-y-4">
                    <li className="flex items-start gap-4">
                        <ShieldCheckIcon className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-foreground">Military-Grade Encryption</h3>
                            <p className="text-sm text-muted-foreground">All data is secured with AES-256 encryption, both in transit and at rest.</p>
                        </div>
                    </li>
                     <li className="flex items-start gap-4">
                        <LockIcon className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-foreground">Multi-Layer Security</h3>
                            <p className="text-sm text-muted-foreground">From mandatory 2FA to cold storage for digital assets, we protect your account from all angles.</p>
                        </div>
                    </li>
                </ul>
            </div>
            <div className="grid grid-cols-2 gap-8 text-center">
                <div className="bg-card/50 p-6 rounded-2xl border border-border">
                    <p className="text-4xl font-bold text-primary">99.9%</p>
                    <p className="text-muted-foreground mt-2">Uptime</p>
                </div>
                 <div className="bg-card/50 p-6 rounded-2xl border border-border">
                    <p className="text-4xl font-bold text-primary">$1.5B+</p>
                    <p className="text-muted-foreground mt-2">Assets Secured</p>
                </div>
                 <div className="bg-card/50 p-6 rounded-2xl border border-border">
                    <p className="text-4xl font-bold text-primary">SOC 2</p>
                    <p className="text-muted-foreground mt-2">Compliant</p>
                </div>
                 <div className="bg-card/50 p-6 rounded-2xl border border-border">
                    <p className="text-4xl font-bold text-primary">24/7</p>
                    <p className="text-muted-foreground mt-2">Support</p>
                </div>
            </div>
        </div>
    </section>
);

const JobListingCard: React.FC<{ title: string; location: string; type: string; onApply: () => void; }> = ({ title, location, type, onApply }) => (
    <div className="bg-card/50 p-6 rounded-2xl border border-border transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span>{location}</span>
                <span className="w-1 h-1 bg-border rounded-full"></span>
                <span>{type}</span>
            </div>
        </div>
        <button onClick={onApply} className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-5 rounded-lg transition-colors flex-shrink-0">
            Apply Now
        </button>
    </div>
);

const CareersSection = React.forwardRef<HTMLDivElement, { onApplyClick: (jobTitle: string) => void }>((props, ref) => (
    <section ref={ref} id="careers" className="py-20 sm:py-32 bg-background/40">
        <div className="container mx-auto px-4">
            <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold border border-primary/20">
                    <BriefcaseIcon className="w-4 h-4" />
                    <span>We're Hiring!</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4">Join Our Team</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    We are building the future of finance and creating opportunities for exceptional people to make a global impact. Explore how you can grow with us.
                </p>
            </div>
            <div className="mt-16 max-w-4xl mx-auto space-y-6">
                <JobListingCard title="Investment Analyst" location="Remote / Global" type="Full-time" onApply={() => props.onApplyClick('Investment Analyst')} />
                <JobListingCard title="AI Developer" location="Remote / Global" type="Full-time" onApply={() => props.onApplyClick('AI Developer')} />
                <JobListingCard title="Product Manager" location="Remote / Global" type="Full-time" onApply={() => props.onApplyClick('Product Manager')} />
                <JobListingCard title="Exchanger Service Representative" location="Remote / Global" type="Full-time" onApply={() => props.onApplyClick('Exchanger Service Representative')} />
            </div>
            <div className="mt-16 text-center">
                <p className="text-lg text-muted-foreground">Interested in working with us?</p>
                <button onClick={() => props.onApplyClick('')} className="mt-4 px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/20">
                    Apply now and join a team that is transforming the future of investment.
                </button>
            </div>
        </div>
    </section>
));
CareersSection.displayName = 'CareersSection';

const CtaSection: React.FC<{ onSignUpClick: () => void }> = ({ onSignUpClick }) => {
    const { t } = useTranslation('landing');
    return (
        <section className="py-20 sm:py-32">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">{t('cta_title')}</h2>
                    <p className="mt-4 max-w-xl mx-auto text-muted-foreground">{t('cta_subtitle')}</p>
                    <div className="mt-8">
                        <button
                            onClick={onSignUpClick}
                            className="px-10 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
                        >
                            {t('get_started_now')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const LandingFooter: React.FC<{ onLegalLinkClick: (doc: 'terms' | 'privacy' | 'about' | 'contact') => void }> = ({ onLegalLinkClick }) => {
    const { t } = useTranslation('landing');
    return (
    <footer className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                     <div className="flex items-center gap-3">
                        <ValifiLogo className="w-9 h-9 text-primary" />
                        <span className="text-xl font-bold text-foreground tracking-tighter">Valifi</span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">The AI-powered financial operating system for the new economy.</p>
                </div>
                 <div className="col-span-1">
                    <h3 className="font-semibold text-foreground">{t('footer_platform')}</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><a href="#" className="text-muted-foreground hover:text-foreground">Investments</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-foreground">P2P Exchange</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-foreground">Valifi Cards</a></li>
                    </ul>
                </div>
                 <div className="col-span-1">
                    <h3 className="font-semibold text-foreground">{t('footer_company')}</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onLegalLinkClick('about'); }} className="text-muted-foreground hover:text-foreground">{t('footer_about')}</a></li>
                        <li><a href="#careers" onClick={(e) => { e.preventDefault(); document.getElementById('careers')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-muted-foreground hover:text-foreground">Careers</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onLegalLinkClick('contact'); }} className="text-muted-foreground hover:text-foreground">{t('footer_contact')}</a></li>
                    </ul>
                </div>
                 <div className="col-span-1">
                    <h3 className="font-semibold text-foreground">{t('footer_legal')}</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onLegalLinkClick('privacy'); }} className="text-muted-foreground hover:text-foreground">{t('footer_privacy')}</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); onLegalLinkClick('terms'); }} className="text-muted-foreground hover:text-foreground">{t('footer_terms')}</a></li>
                    </ul>
                </div>
            </div>
             <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center">
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Valifi, Inc. All rights reserved.</p>
                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                    <a href="#" aria-label="Follow us on Twitter" className="text-muted-foreground hover:text-foreground transition-colors"><TwitterIcon className="w-5 h-5" /></a>
                    <a href="#" aria-label="Follow us on Instagram" className="text-muted-foreground hover:text-foreground transition-colors"><InstagramIcon className="w-5 h-5" /></a>
                    <a href="#" aria-label="Follow us on LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors"><LinkedInIcon className="w-5 h-5" /></a>
                </div>
            </div>
        </div>
    </footer>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignUp, userSettings, setUserSettings }) => {
    const featuresRef = useRef<HTMLDivElement>(null);
    const careersRef = useRef<HTMLDivElement>(null);
    const faqRef = useRef<HTMLDivElement>(null);
    const philosophyRef = useRef<HTMLDivElement>(null);
    const leadershipRef = useRef<HTMLDivElement>(null);
    const [isApplicationModalOpen, setApplicationModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState('');
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const [isLegalModalOpen, setLegalModalOpen] = useState(false);
    const [legalContent, setLegalContent] = useState<{title: string, content: React.ReactNode} | null>(null);
    const [isSignInModalOpen, setSignInModalOpen] = useState(false);
    const [isSignUpModalOpen, setSignUpModalOpen] = useState(false);
    const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
    const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');
    const [dbErrorMessage, setDbErrorMessage] = useState('');

    useEffect(() => {
        const checkStatus = async () => {
            const result = await apiService.checkDbStatus();
            if (result.success) {
                setDbStatus('ok');
                setDbErrorMessage('');
            } else {
                setDbStatus('error');
                setDbErrorMessage(result.message || 'System temporarily unavailable');
            }
        };
        checkStatus();
    }, []);

    const handleExploreClick = useCallback(() => {
        featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleCareersClick = useCallback(() => {
        careersRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleFaqClick = useCallback(() => {
        faqRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handlePhilosophyClick = useCallback(() => {
        philosophyRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const handleLeadershipClick = useCallback(() => {
        leadershipRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);
    
    const handleApplyClick = useCallback((jobTitle: string) => {
        setSelectedJob(jobTitle);
        setApplicationModalOpen(true);
    }, []);

    const handleLearnMore = useCallback((feature: Feature) => {
        setSelectedFeature(feature);
    }, []);

    const handleLegalLinkClick = useCallback((doc: 'terms' | 'privacy' | 'about' | 'contact') => {
        setLegalContent(infoDocs[doc]);
        setLegalModalOpen(true);
    }, []);

    const handleOpenSignIn = useCallback(() => setSignInModalOpen(true), []);
    const handleCloseSignIn = useCallback(() => setSignInModalOpen(false), []);
    const handleOpenSignUp = useCallback(() => setSignUpModalOpen(true), []);
    const handleCloseSignUp = useCallback(() => setSignUpModalOpen(false), []);
    const handleOpenForgotPassword = useCallback(() => setForgotPasswordModalOpen(true), []);
    const handleCloseForgotPassword = useCallback(() => setForgotPasswordModalOpen(false), []);

    const handleSwitchToSignUp = useCallback(() => {
        setSignInModalOpen(false);
        setSignUpModalOpen(true);
    }, []);

    const handleSwitchToSignIn = useCallback(() => {
        setSignUpModalOpen(false);
        setForgotPasswordModalOpen(false);
        setSignInModalOpen(true);
    }, []);
    
    const handleSwitchToForgotPassword = useCallback(() => {
        setSignInModalOpen(false);
        setForgotPasswordModalOpen(true);
    }, []);


    return (
        <div className="bg-background">
            <LandingHeader onSignInClick={handleOpenSignIn} onExplore={handleExploreClick} onCareersClick={handleCareersClick} onFaqClick={handleFaqClick} onPhilosophyClick={handlePhilosophyClick} onLeadershipClick={handleLeadershipClick} userSettings={userSettings} setUserSettings={setUserSettings}/>
            <main>
                <HeroSection onSignUpClick={handleOpenSignUp} onExplore={handleExploreClick} />
                <FeaturesSection ref={featuresRef} onLearnMore={handleLearnMore} />
                <PhilosophySection ref={philosophyRef} />
                <LeadershipSection ref={leadershipRef} />
                <SpectrumSection onSignInClick={handleOpenSignUp} />
                <TestimonialsSection onSignInClick={handleOpenSignUp} />
                <TrustSection />
                <CareersSection ref={careersRef} onApplyClick={handleApplyClick} />
                <FAQSection ref={faqRef} />
                <CtaSection onSignUpClick={handleOpenSignUp} />
            </main>
            <LandingFooter onLegalLinkClick={handleLegalLinkClick} />
            <JobApplicationModal 
                isOpen={isApplicationModalOpen}
                onClose={() => setApplicationModalOpen(false)}
                jobTitle={selectedJob}
            />
            <FeatureDetailModal 
                isOpen={!!selectedFeature}
                onClose={() => setSelectedFeature(null)}
                feature={selectedFeature}
            />
            <LegalModal 
                isOpen={isLegalModalOpen}
                onClose={() => setLegalModalOpen(false)}
                title={legalContent?.title || ''}
                content={legalContent?.content}
            />
            <SignInModal
                isOpen={isSignInModalOpen}
                onClose={handleCloseSignIn}
                onLogin={onLogin}
                onOpenSignUp={handleSwitchToSignUp}
                onOpenForgotPassword={handleSwitchToForgotPassword}
                dbStatus={dbStatus}
                dbErrorMessage={dbErrorMessage}
            />
             <SignUpModal
                isOpen={isSignUpModalOpen}
                onClose={handleCloseSignUp}
                onSignUp={onSignUp}
                onOpenSignIn={handleSwitchToSignIn}
                dbStatus={dbStatus}
                dbErrorMessage={dbErrorMessage}
            />
            <ForgotPasswordModal
                isOpen={isForgotPasswordModalOpen}
                onClose={handleCloseForgotPassword}
                onOpenSignIn={handleSwitchToSignIn}
            />
        </div>
    );
};

export default React.memo(LandingPage);