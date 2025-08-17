import React, { useState, useEffect, useCallback } from 'react';
import type { KYCStatus } from '../types';
import { UserCheckIcon, UploadCloudIcon, LockIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from './icons';
import { countries } from './countries';
import * as apiService from '../services/api';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
    <div className={`bg-card/50 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl shadow-black/20 ${className}`}>
      {children}
    </div>
);

interface KYCViewProps {
    status: KYCStatus;
    setStatus: (status: KYCStatus) => void;
    reason: string;
    setReason: (reason: string) => void;
}

const FileInput: React.FC<{ label: string, file: File | null, setFile: (file: File | null) => void, preview: string | null, setPreview: (preview: string | null) => void }> = 
({ label, file, setFile, preview, setPreview }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
        if (preview) {
            URL.revokeObjectURL(preview);
        }
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);
        }
    };

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    return (
        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">{label}</label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border/70 px-6 py-10 bg-black/20 hover:border-primary/50 transition-colors">
                <div className="text-center">
                    {preview ? (
                        <img src={preview} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-contain" />
                    ) : file ? (
                        <p className="text-success">{file.name}</p>
                    ) : (
                        <UploadCloudIcon className="mx-auto h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
                    )}
                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                        <label
                            htmlFor={label.toLowerCase().replace(/\s/g, '-')}
                            className="relative cursor-pointer rounded-md bg-transparent font-semibold text-primary focus-within:outline-none hover:text-primary/80"
                        >
                            <span>Upload a file</span>
                            <input id={label.toLowerCase().replace(/\s/g, '-')} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png, application/pdf" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground/70">PNG, JPG, PDF up to 10MB</p>
                </div>
            </div>
        </div>
    );
};

const KYCForm: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
    const [idFile, setIdFile] = useState<File | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [idPreview, setIdPreview] = useState<string | null>(null);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const inputClass = "block w-full rounded-md border-0 bg-input py-2.5 px-3 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6";

    return (
        <Card>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8 p-8">
                <div className="border-b border-border/50 pb-8">
                    <h2 className="text-base font-semibold leading-7 text-foreground">Personal Information</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Use a permanent address where you can receive mail.</p>
                    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                            <label htmlFor="full-name" className="block text-sm font-medium leading-6 text-foreground">Full legal name</label>
                            <input type="text" name="full-name" id="full-name" required className={inputClass}/>
                        </div>
                         <div className="sm:col-span-3">
                            <label htmlFor="dob" className="block text-sm font-medium leading-6 text-foreground">Date of Birth</label>
                            <input type="date" name="dob" id="dob" required className={inputClass}/>
                        </div>
                        <div className="sm:col-span-3">
                           <label htmlFor="country" className="block text-sm font-medium leading-6 text-foreground">Country of Residence</label>
                           <select id="country" name="country" required className={inputClass}>
                                {countries.map(c => <option key={c.code}>{c.name}</option>)}
                           </select>
                        </div>
                        <div className="col-span-full">
                            <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-foreground">Residential Address (Optional)</label>
                            <input type="text" name="street-address" id="street-address" className={inputClass}/>
                        </div>
                    </div>
                </div>

                <div className="border-b border-border/50 pb-8">
                     <h2 className="text-base font-semibold leading-7 text-foreground">Identity Verification</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Upload a clear, high-resolution image or PDF of your identification.</p>
                     <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                         <div className="sm:col-span-3">
                            <label htmlFor="id-type" className="block text-sm font-medium leading-6 text-foreground">National ID Type</label>
                            <select id="id-type" name="id-type" required className={inputClass}>
                                <option>Passport</option><option>Driver's License</option><option>National ID</option>
                            </select>
                         </div>
                         <div className="sm:col-span-3">
                            <label htmlFor="id-number" className="block text-sm font-medium leading-6 text-foreground">ID Number</label>
                            <input type="text" name="id-number" id="id-number" required className={inputClass}/>
                        </div>
                        <div className="col-span-full">
                            <FileInput label="ID Document Upload" file={idFile} setFile={setIdFile} preview={idPreview} setPreview={setIdPreview} />
                        </div>
                         <div className="col-span-full">
                            <FileInput label="Live Photo (Selfie)" file={profilePhoto} setFile={setProfilePhoto} preview={profilePreview} setPreview={setProfilePreview} />
                        </div>
                     </div>
                </div>
                
                <div className="text-xs p-3 rounded-lg bg-secondary/70 text-muted-foreground flex items-start gap-2">
                    <LockIcon className="w-8 h-5 text-muted-foreground/80 flex-shrink-0 mt-0.5" />
                    <span>Your information is securely stored and used only for compliance verification. We do not share your data with third parties.</span>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button type="button" className="text-sm font-semibold leading-6 text-foreground hover:text-muted-foreground">Cancel</button>
                    <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Submit for Review</button>
                </div>
            </form>
        </Card>
    );
};

const StatusDisplay: React.FC<{ status: KYCStatus, reason: string, onResubmit: () => void }> = ({ status, reason, onResubmit }) => {
    const statusConfig = {
        Pending: { Icon: ClockIcon, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', title: 'Submission Pending Review', message: 'Your documents have been submitted and are currently under review. This process usually takes 1-2 business days.'},
        Approved: { Icon: CheckCircleIcon, color: 'text-success', bg: 'bg-success/10 border-success/20', title: 'KYC Verification Approved!', message: 'Congratulations! Your identity has been successfully verified. You now have full access to all platform features.' },
        Rejected: { Icon: XCircleIcon, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', title: 'Submission Rejected', message: `Your submission could not be approved. Reason: ${reason}. Please review the feedback and resubmit your documents.` },
        'Resubmit Required': { Icon: XCircleIcon, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', title: 'Resubmission Required', message: `Your submission could not be approved. Reason: ${reason}. Please review the feedback and resubmit your documents.` },
        'Not Started': { Icon: UserCheckIcon, color: '', bg: '', title: '', message: '' }
    };

    const config = statusConfig[status];
    if (!config || status === 'Not Started') return null;

    return (
        <Card className={`p-8 text-center ${config.bg}`}>
            <config.Icon className={`w-16 h-16 mx-auto mb-4 ${config.color}`} />
            <h2 className="text-2xl font-bold text-foreground">{config.title}</h2>
            <p className="mt-2 max-w-lg mx-auto text-muted-foreground">{config.message}</p>
            {(status === 'Rejected' || status === 'Resubmit Required') && (
                 <button onClick={onResubmit} className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                    Resubmit Information
                 </button>
            )}
        </Card>
    );
};

const KYCView: React.FC<KYCViewProps> = ({ status, setStatus, reason, setReason }) => {
    
    const [isFormVisible, setIsFormVisible] = useState(status === 'Not Started' || status === 'Resubmit Required');

    useEffect(() => {
        setIsFormVisible(status === 'Not Started' || status === 'Resubmit Required');
    }, [status]);
    
    const handleFormSubmit = async () => {
        try {
            await apiService.submitKyc();
            setStatus('Pending');
            setIsFormVisible(false);
        } catch (error) {
            // Optionally, show an error message to the user
        }
    };

    const handleResubmit = () => {
        setStatus('Not Started');
        setIsFormVisible(true);
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 view-container">
            <div className="flex items-center gap-4">
                 <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                    <UserCheckIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">KYC Verification</h1>
                    <p className="text-muted-foreground mt-1">Verify your identity to unlock all platform features.</p>
                </div>
            </div>

            {isFormVisible ? (
                <KYCForm onSubmit={handleFormSubmit} />
            ) : (
                <StatusDisplay status={status} reason={reason} onResubmit={handleResubmit} />
            )}
        </div>
    );
};

export default KYCView;