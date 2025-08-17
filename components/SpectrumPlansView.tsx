import React, { useState } from 'react';
import type { InvestmentPlan } from '../types';
import InvestModal from './InvestModal';

export const newPlans: InvestmentPlan[] = [
    {
        id: 'corestart',
        name: 'CoreStart Plan',
        investmentRange: '$500 – $4,999',
        dailyReturns: '2.5%',
        capitalReturn: 'After 10 days',
        returnType: 'Daily',
        totalPeriods: '10 Days',
        cancellation: 'Not Available',
        totalRevenue: '125%',
        note: 'Ideal for beginners.',
        colorClass: 'bg-gradient-to-br from-emerald-500 to-green-600',
        borderColor: 'border-emerald-400',
        buttonColor: 'bg-emerald-500 hover:bg-emerald-600',
        shadowColor: 'shadow-emerald-500/30'
    },
    {
        id: 'alphaplus',
        name: 'AlphaPlus Plan',
        investmentRange: '$5,000 – $49,999',
        dailyReturns: '3.0%',
        capitalReturn: 'After 20 days',
        returnType: 'Daily',
        totalPeriods: '20 Days',
        cancellation: 'After 10 days',
        totalRevenue: '160%',
        note: 'Balanced growth and returns.',
        colorClass: 'bg-gradient-to-br from-sky-500 to-blue-600',
        borderColor: 'border-sky-400',
        buttonColor: 'bg-sky-500 hover:bg-sky-600',
        shadowColor: 'shadow-sky-500/30'
    },
    {
        id: 'poweredge',
        name: 'PowerEdge Plan',
        investmentRange: '$50,000 – $499,999',
        dailyReturns: '3.5%',
        capitalReturn: 'After 30 days',
        returnType: 'Daily',
        totalPeriods: '30 Days',
        cancellation: 'After 15 days',
        totalRevenue: '205%',
        note: 'For serious investors.',
        colorClass: 'bg-gradient-to-br from-amber-500 to-orange-600',
        borderColor: 'border-amber-400',
        buttonColor: 'bg-amber-500 hover:bg-amber-600',
        shadowColor: 'shadow-amber-500/30'
    },
    {
        id: 'quantum',
        name: 'Quantum Leap Plan',
        investmentRange: '$500,000+',
        dailyReturns: '4.5%',
        capitalReturn: 'After 45 days',
        returnType: 'Daily',
        totalPeriods: '45 Days',
        cancellation: 'After 22 days',
        totalRevenue: '302.5%',
        note: 'Maximum yield for top-tier investors.',
        colorClass: 'bg-gradient-to-br from-purple-600 to-indigo-700',
        borderColor: 'border-purple-500',
        buttonColor: 'bg-purple-600 hover:bg-purple-700',
        shadowColor: 'shadow-purple-500/30'
    }
];

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

const PlanDetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-3.5 border-b border-border/50">
        <span className="text-sm text-muted-foreground">{label}:</span>
        <span className="font-semibold text-foreground text-sm text-right">{value}</span>
    </div>
);

const NewPlanCard: React.FC<{ plan: InvestmentPlan, onInvestClick: () => void }> = ({ plan, onInvestClick }) => {
    const details = [
        { label: 'Investment Range', value: plan.investmentRange },
        { label: 'Daily Returns', value: plan.dailyReturns },
        { label: 'Capital Return', value: plan.capitalReturn },
        { label: 'Return Type', value: plan.returnType },
        { label: 'Total Periods', value: plan.totalPeriods },
        { label: 'Cancellation', value: plan.cancellation },
        { label: 'Total Revenue', value: plan.totalRevenue },
        { label: 'Note', value: plan.note },
    ];
    
    return (
        <Card className={`flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 hover:shadow-2xl hover:${plan.shadowColor}`}>
            <div className={`p-5 ${plan.colorClass} border-b-2 ${plan.borderColor}`}>
                <h3 className="text-2xl font-bold text-white text-center tracking-tight">{plan.name}</h3>
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex-grow">
                   {details.map((detail) => (
                       <PlanDetailRow key={detail.label} label={detail.label} value={detail.value} />
                   ))}
                </div>
                <div className="mt-6">
                    <button 
                        onClick={onInvestClick}
                        className={`w-full text-lg font-bold py-3 rounded-lg text-white transition-colors ${plan.buttonColor} shadow-lg ${plan.shadowColor}`}>
                        Invest Now
                    </button>
                </div>
            </div>
        </Card>
    );
};


interface SpectrumPlansViewProps {
    plans: InvestmentPlan[];
    onInvest: (plan: InvestmentPlan, amount: number) => void;
    cashBalance: number;
}


const SpectrumPlansView: React.FC<SpectrumPlansViewProps> = ({ plans, onInvest, cashBalance }) => {
    const [isInvestModalOpen, setInvestModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);

    const handleInvestClick = (plan: InvestmentPlan) => {
        setSelectedPlan(plan);
        setInvestModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setInvestModalOpen(false);
        setSelectedPlan(null);
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Spectrum Equity Plans</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Choose an investment plan of your choice.
                    Remember, the bigger the investment, the bigger the return.
                </p>
            </div>
            {plans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {plans.map(plan => (
                        <NewPlanCard key={plan.id} plan={plan} onInvestClick={() => handleInvestClick(plan)} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16">
                    <p>No investment plans are available at this moment.</p>
                    <p>Please check back later.</p>
                </div>
            )}


            {selectedPlan && (
                <InvestModal
                    isOpen={isInvestModalOpen}
                    onClose={handleCloseModal}
                    plan={selectedPlan}
                    onInvest={onInvest}
                    cashBalance={cashBalance}
                />
            )}
        </div>
    );
};

export default SpectrumPlansView;