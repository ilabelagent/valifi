import React, { useState } from 'react';
import type { InvestmentPlan } from '../types';
import InvestModal from './InvestModal';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
);

// New data structure and mock data as per user request
export const newPlans: InvestmentPlan[] = [
  {
    id: 'corestart',
    name: 'CoreStart',
    investmentRange: '$500 – $4,999',
    dailyReturns: '2%',
    capitalReturn: 'Yes',
    returnType: 'Period',
    totalPeriods: '7 Times',
    cancellation: 'Within 59 Minutes',
    totalRevenue: 'Unlimited Earning Potential',
    note: 'No Profit Holidays',
    colorClass: 'bg-sky-900/50',
    borderColor: 'border-sky-500',
    buttonColor: 'bg-sky-600 hover:bg-sky-500',
    shadowColor: 'shadow-sky-500/20'
  },
  {
    id: 'poweredge',
    name: 'PowerEdge',
    investmentRange: '$5,000 – $9,999',
    dailyReturns: '2.2%',
    capitalReturn: 'Yes',
    returnType: 'Period',
    totalPeriods: '14 Times',
    cancellation: 'Within 40 Minutes',
    totalRevenue: 'Unlimited Earning Potential',
    note: 'No Profit Holidays',
    colorClass: 'bg-teal-900/50',
    borderColor: 'border-teal-400',
    buttonColor: 'bg-teal-600 hover:bg-teal-500',
    shadowColor: 'shadow-teal-400/20'
  },
  {
    id: 'alphaplus',
    name: 'AlphaPlus',
    investmentRange: '$10,000 – $14,999',
    dailyReturns: '2.5%',
    capitalReturn: 'Yes',
    returnType: 'Period',
    totalPeriods: '21 Times',
    cancellation: 'Within 59 Minutes',
    totalRevenue: 'Unlimited Earning Potential',
    note: 'No Profit Holidays',
    colorClass: 'bg-indigo-900/50',
    borderColor: 'border-indigo-400',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-500',
    shadowColor: 'shadow-indigo-400/20'
  },
  {
    id: 'titancore',
    name: 'TitanCore',
    investmentRange: '$15,000 – $39,999',
    dailyReturns: '2.7%',
    capitalReturn: 'Yes',
    returnType: 'Period',
    totalPeriods: '28 Times',
    cancellation: 'Within 50 Minutes',
    totalRevenue: 'Unlimited Earning Potential',
    note: 'No Profit Holidays',
    colorClass: 'bg-purple-900/50',
    borderColor: 'border-purple-400',
    buttonColor: 'bg-purple-600 hover:bg-purple-500',
    shadowColor: 'shadow-purple-400/20'
  },
  {
    id: 'goldtrust',
    name: 'GoldTrust',
    investmentRange: '$40,000 – $79,999',
    dailyReturns: '3%',
    capitalReturn: 'Yes',
    returnType: 'Period',
    totalPeriods: '42 Times',
    cancellation: 'Within 56 Minutes',
    totalRevenue: 'Unlimited Earning Potential',
    note: 'No Profit Holidays',
    colorClass: 'bg-amber-800/40',
    borderColor: 'border-amber-400',
    buttonColor: 'bg-amber-600 hover:bg-amber-500',
    shadowColor: 'shadow-amber-400/20'
  },
  {
    id: 'globalrise',
    name: 'GlobalRise',
    investmentRange: '$80,000 – $399,999',
    dailyReturns: '4.5%',
    capitalReturn: 'Yes',
    returnType: 'Period',
    totalPeriods: '21 Times',
    cancellation: 'Within 59 Minutes',
    totalRevenue: 'Unlimited Earning Potential',
    note: 'No Profit Holidays',
    colorClass: 'bg-emerald-900/50',
    borderColor: 'border-emerald-400',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-500',
    shadowColor: 'shadow-emerald-400/20'
  },
  {
    id: 'ironhold',
    name: 'IronHold',
    investmentRange: '$400,000 – $1,000,000',
    dailyReturns: '6%',
    capitalReturn: 'Yes',
    returnType: 'Period',
    totalPeriods: '28 Times',
    cancellation: 'Not Allowed',
    totalRevenue: 'Unlimited Earning Potential',
    note: 'No Profit Holidays',
    colorClass: 'bg-red-900/50',
    borderColor: 'border-red-400',
    buttonColor: 'bg-red-600 hover:bg-red-500',
    shadowColor: 'shadow-red-400/20'
  },
];


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
    onInvest: (plan: InvestmentPlan, amount: number) => void;
    cashBalance: number;
}


const SpectrumPlansView: React.FC<SpectrumPlansViewProps> = ({ onInvest, cashBalance }) => {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {newPlans.map(plan => (
                    <NewPlanCard key={plan.id} plan={plan} onInvestClick={() => handleInvestClick(plan)} />
                ))}
            </div>

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