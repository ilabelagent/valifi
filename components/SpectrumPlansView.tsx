import React, { useState } from 'react';
import type { InvestmentPlan } from '../types';
import InvestModal from './InvestModal';

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