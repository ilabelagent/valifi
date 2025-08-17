import React, { useState, useMemo, useEffect } from 'react';
import type { Portfolio, KYCStatus, LoanApplication, Asset, LoanStatus } from '../types';
import { AssetType } from '../types';
import { LoanIcon, LockIcon, UsdIcon, CheckCircleIcon, UploadCloudIcon, XCircleIcon, ClockIcon } from './icons';
import { useCurrency } from './CurrencyContext';

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-card/50 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl shadow-black/20 ${className}`}>
      {children}
    </div>
);

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-6 py-3 text-md font-semibold rounded-t-lg transition-colors border-b-2 ${isActive ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'}`}>
        {label}
    </button>
);

interface LoansViewProps {
    portfolio: Portfolio;
    kycStatus: KYCStatus;
    loanApplications: LoanApplication[];
    onApplyForLoan: (application: Omit<LoanApplication, 'id' | 'date' | 'status'>) => void;
    onLoanRepayment: (loanId: string, paymentAmount: number) => void;
}

const FileInput: React.FC<{
    label: string;
    file: File | null;
    setFile: (file: File | null) => void;
    acceptedFormats: string;
}> = ({ label, file, setFile, acceptedFormats }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
    };

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">{label} <span className="text-destructive">*</span></label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border/70 px-6 py-10 bg-black/20 hover:border-primary/50 transition-colors">
                <div className="text-center">
                    {file ? (
                        <p className="text-success">{file.name}</p>
                    ) : (
                        <UploadCloudIcon className="mx-auto h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
                    )}
                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                        <label
                            htmlFor="contact-file-upload"
                            className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary focus-within:outline-none hover:text-primary/80"
                        >
                            <span>Upload a file</span>
                            <input id="contact-file-upload" name="contact-file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={acceptedFormats} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoanStatusChip: React.FC<{ status: LoanStatus }> = ({ status }) => {
    const config = {
        Active: { text: 'Active', Icon: ClockIcon, color: 'bg-primary/10 text-primary' },
        Late: { text: 'Late', Icon: ClockIcon, color: 'bg-amber-500/10 text-amber-400' },
        Repaid: { text: 'Repaid', Icon: CheckCircleIcon, color: 'bg-success/10 text-success' },
        Defaulted: { text: 'Defaulted', Icon: XCircleIcon, color: 'bg-destructive/10 text-destructive' },
        Rejected: { text: 'Rejected', Icon: XCircleIcon, color: 'bg-destructive/10 text-destructive' },
        Pending: { text: 'Pending', Icon: ClockIcon, color: 'bg-muted/40 text-muted-foreground animate-pulse' },
    }[status];

    if (!config) return null;

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${config.color}`}>
            {config.Icon && <config.Icon className="w-3.5 h-3.5" />}
            <span>{config.text}</span>
        </div>
    );
};


const LoansView: React.FC<LoansViewProps> = ({ portfolio, kycStatus, loanApplications, onApplyForLoan, onLoanRepayment }) => {
    const [activeTab, setActiveTab] = useState('apply');
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const { formatCurrency } = useCurrency();

    // Form State
    const [loanAmount, setLoanAmount] = useState('');
    const [repaymentTerm, setRepaymentTerm] = useState('60');
    const [collateralAssetId, setCollateralAssetId] = useState('');
    const [reason, setReason] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [contactAccess, setContactAccess] = useState(false);
    const [contactsFile, setContactsFile] = useState<File | null>(null);
    const [formError, setFormError] = useState('');
    
    const hasActiveInvestments = useMemo(() => portfolio.assets.some(a => a.type !== AssetType.CASH && a.status === 'Active'), [portfolio.assets]);
    const isEligible = kycStatus === 'Approved' && hasActiveInvestments && portfolio.totalValueUSD >= 100000;
    const hasPendingApplication = useMemo(() => loanApplications.some(app => app.status === 'Pending'), [loanApplications]);
    const collateralOptions = useMemo(() => portfolio.assets.filter(a => a.status === 'Active' && a.type !== AssetType.CASH), [portfolio.assets]);
    const maxLoanAmount = useMemo(() => Math.min(1000000, portfolio.totalValueUSD * 0.5), [portfolio.totalValueUSD]);
    
    const activeLoans = useMemo(() => loanApplications.filter(l => l.status === 'Active' || l.status === 'Late'), [loanApplications]);
    const loanHistory = useMemo(() => loanApplications.filter(l => ['Repaid', 'Defaulted', 'Rejected'].includes(l.status)), [loanApplications]);


    useEffect(() => {
        if (collateralOptions.length > 0) {
            setCollateralAssetId(collateralOptions[0].id);
        }
    }, [collateralOptions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        const amount = parseFloat(loanAmount);

        if (isNaN(amount) || amount < 50000 || amount > 1000000) {
            setFormError('Loan amount must be between $50,000 and $1,000,000.');
            return;
        }
        if (amount > maxLoanAmount) {
            setFormError(`Requested amount exceeds the maximum allowed of $${maxLoanAmount.toLocaleString()}.`);
            return;
        }
        if (!collateralAssetId) {
            setFormError('Please select an asset for collateral.');
            return;
        }
        if (!agreeToTerms) {
            setFormError('You must agree to the terms and policies.');
            return;
        }
        if (contactAccess && !contactsFile) {
            setFormError('Please upload your contacts file as you have authorized access.');
            return;
        }

        if (contactAccess && contactsFile) {
            console.log('--- ADMIN-ONLY ACTION ---');
            console.log('Uploading contact file to secure storage with loan application metadata:', contactsFile.name);
            console.log('-------------------------');
        }
        
        onApplyForLoan({
            amount,
            term: parseInt(repaymentTerm),
            interestRate: 5,
            collateralAssetId,
            reason,
        });

        setSubmissionSuccess(true);
        setShowApplicationForm(false);
        setContactAccess(false);
        setContactsFile(null);
    };

    const renderApplyContent = () => {
        if (!isEligible) {
            return (
                <Card className="p-8 text-center">
                    <LockIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground">Premium Financing is Locked</h2>
                    <p className="mt-2 max-w-lg mx-auto text-muted-foreground">You must have a fully KYC-verified account and an active Valifi investment portfolio of $100,000+ to qualify for premium financing.</p>
                </Card>
            );
        }
        if (hasPendingApplication || submissionSuccess) {
             return (
                <Card className="p-8 text-center">
                    <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground">Application Pending</h2>
                    <p className="mt-2 max-w-lg mx-auto text-muted-foreground">Your loan application has been submitted and is currently under review by our team. You will be notified of the decision shortly.</p>
                </Card>
            );
        }

        if (showApplicationForm) {
            const inputClass = "w-full bg-input border border-border rounded-lg py-3 px-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
            return (
                <Card className="p-8">
                     <h2 className="text-2xl font-bold text-foreground mb-6">Loan Application Form</h2>
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1.5">Loan Amount (USD)</label>
                            <input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} min="50000" max={maxLoanAmount} className={inputClass}/>
                            <p className="text-xs text-muted-foreground/80 mt-1">Max available: ${maxLoanAmount.toLocaleString()}</p>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                               <label className="block text-sm text-muted-foreground mb-1.5">Repayment Term</label>
                               <select value={repaymentTerm} onChange={e => setRepaymentTerm(e.target.value)} className={inputClass}>
                                   <option value="60">60 Days</option><option value="90">90 Days</option>
                                   <option value="180">180 Days</option><option value="365">365 Days</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-sm text-muted-foreground mb-1.5">Collateral Asset</label>
                               <select value={collateralAssetId} onChange={e => setCollateralAssetId(e.target.value)} className={inputClass}>
                                   {collateralOptions.map(asset => <option key={asset.id} value={asset.id}>{asset.name} (${asset.valueUSD.toLocaleString()})</option>)}
                               </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1.5">Reason for Loan (Optional)</label>
                            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className={inputClass}/>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" checked={agreeToTerms} onChange={e => setAgreeToTerms(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary"/>
                                <span className="text-sm text-muted-foreground">I agree to the 5% interest, repayment schedule, and collateral policy.</span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" checked={contactAccess} onChange={e => setContactAccess(e.target.checked)} className="mt-1 h-4 w-4 rounded border-border bg-input text-primary focus:ring-primary"/>
                                <span className="text-sm text-muted-foreground">I authorize Valifi to access my contact list if I default.</span>
                            </label>
                            {contactAccess && (
                                <div className="motion-safe:animate-slide-in-fade pl-9">
                                    <FileInput
                                        label="Upload Contact File (.vcf, .csv, or .txt)"
                                        file={contactsFile}
                                        setFile={setContactsFile}
                                        acceptedFormats=".vcf,.csv,.txt"
                                    />
                                    <p className="text-xs text-muted-foreground/80 mt-2">
                                        We recommend exporting from your phone contacts or address book to .csv format. Only used for recovery enforcement if default occurs.
                                    </p>
                                </div>
                            )}
                        </div>
                        {formError && <p className="text-sm text-destructive text-center">{formError}</p>}
                        <div className="flex justify-end gap-4 pt-4 border-t border-border">
                             <button type="button" onClick={() => setShowApplicationForm(false)} className="bg-secondary hover:bg-accent text-foreground font-bold py-2.5 px-6 rounded-lg">Back</button>
                             <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-lg">💸 Submit Application</button>
                        </div>
                     </form>
                </Card>
            );
        }

        return (
             <Card className="p-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <h2 className="text-2xl font-bold text-foreground">Premium Loan Terms</h2>
                        <ul className="mt-6 space-y-4">
                            {[
                                { label: 'Loan Range', value: '$50,000 – $1,000,000' },
                                { label: 'Interest Rate', value: '5% flat' },
                                { label: 'Repayment Terms', value: '60 to 365 days' },
                                { label: 'Overdue Penalty', value: '1.5% per missed period' },
                                { label: 'Disbursement', value: 'To Main Account Balance' }
                            ].map(item => (
                                <li key={item.label} className="flex justify-between text-sm border-b border-border/50 pb-2">
                                    <span className="text-muted-foreground">{item.label}</span>
                                    <span className="font-semibold text-foreground">{item.value}</span>
                                </li>
                            ))}
                        </ul>
                     </div>
                      <div className="bg-secondary p-6 rounded-xl border border-border">
                        <h3 className="font-semibold text-foreground">Eligibility Requirements</h3>
                        <ul className="mt-4 space-y-3 text-sm">
                           {[
                               { label: 'KYC Status', value: 'Approved', met: kycStatus === 'Approved' },
                               { label: 'Active Investments', value: 'Required', met: hasActiveInvestments },
                               { label: 'Portfolio Value', value: '≥ $100,000', met: portfolio.totalValueUSD >= 100000 },
                           ].map(item => (
                               <li key={item.label} className="flex items-center gap-2">
                                   {item.met ? <CheckCircleIcon className="w-5 h-5 text-success"/> : <XCircleIcon className="w-5 h-5 text-destructive"/>}
                                   <span className={item.met ? 'text-foreground' : 'text-muted-foreground'}>{item.label}: {item.value}</span>
                               </li>
                           ))}
                        </ul>
                         <button onClick={() => setShowApplicationForm(true)} className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-4 rounded-lg">
                            Proceed to Apply
                        </button>
                    </div>
                 </div>
             </Card>
        );
    };
    
    const renderActiveLoans = () => (
        <div className="space-y-4">
            {activeLoans.length > 0 ? (
                activeLoans.map(loan => (
                    <Card key={loan.id} className="p-6 !bg-card/80">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <h3 className="font-bold text-lg text-foreground">Loan ID: ...{loan.id.slice(-6)}</h3>
                                <p className="text-sm text-muted-foreground">Start Date: {loan.startDate ? new Date(loan.startDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <LoanStatusChip status={loan.status} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
                            <div><p className="text-xs text-muted-foreground">Loan Amount</p><p className="font-semibold text-foreground">{formatCurrency(loan.amount)}</p></div>
                            <div><p className="text-xs text-muted-foreground">Term</p><p className="font-semibold text-foreground">{loan.term} Days</p></div>
                            <div><p className="text-xs text-muted-foreground">Interest</p><p className="font-semibold text-foreground">{loan.interestRate}%</p></div>
                            <div><p className="text-xs text-muted-foreground">Due Date</p><p className="font-semibold text-foreground">{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}</p></div>
                        </div>
                        <div className="mt-4">
                            <label className="text-xs text-muted-foreground">Repayment Progress ({loan.repaymentProgress || 0}%)</label>
                            <div className="w-full bg-secondary rounded-full h-2.5 mt-1">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${loan.repaymentProgress || 0}%` }}></div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => onLoanRepayment(loan.id, 1000) /* Mock payment */} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-lg text-sm">Pay Now</button>
                        </div>
                    </Card>
                ))
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <p>You have no active loans.</p>
                </div>
            )}
        </div>
    );

    const renderLoanHistory = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-secondary/50">
                    <tr>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Closed</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Term</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interest Paid</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {loanHistory.length > 0 ? (
                        loanHistory.map(loan => (
                            <tr key={loan.id} className="hover:bg-accent">
                                <td className="p-4 text-sm text-muted-foreground">{loan.dateClosed ? new Date(loan.dateClosed).toLocaleDateString() : 'N/A'}</td>
                                <td className="p-4 font-mono font-semibold text-foreground">{formatCurrency(loan.amount)}</td>
                                <td className="p-4 text-sm text-muted-foreground">{loan.term} Days</td>
                                <td className="p-4 font-mono text-success">{formatCurrency(loan.interestPaid || 0)}</td>
                                <td className="p-4"><LoanStatusChip status={loan.status} /></td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={5} className="text-center py-16 text-muted-foreground">No loan history available.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
    
    return (
         <div className="p-6 lg:p-8 space-y-8 view-container">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                        <LoanIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Loan Center</h1>
                        <p className="text-muted-foreground mt-1">Access premium financing based on your portfolio's strength.</p>
                    </div>
                </div>
            </div>
            
            <Card>
                <div className="border-b border-border/50 px-4">
                    <TabButton label="Apply for Loan" isActive={activeTab === 'apply'} onClick={() => setActiveTab('apply')} />
                    <TabButton label="Active Loans" isActive={activeTab === 'active'} onClick={() => setActiveTab('active')} />
                    <TabButton label="Repayment Schedule" isActive={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
                    <TabButton label="Loan History" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                </div>

                <div className="p-0 sm:p-6">
                    {activeTab === 'apply' && renderApplyContent()}
                    {activeTab === 'active' && renderActiveLoans()}
                    {activeTab === 'schedule' && (
                        <div className="text-center py-16 text-muted-foreground">
                            <p>Repayment schedule will be displayed here for active loans.</p>
                        </div>
                    )}
                    {activeTab === 'history' && renderLoanHistory()}
                </div>
            </Card>
        </div>
    );
};

export default LoansView;
