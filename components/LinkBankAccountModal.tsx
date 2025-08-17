import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { BankAccount } from '../types';
import { CloseIcon, UploadCloudIcon, LockIcon } from './icons';
import { countries } from './countries';
import { bankingFieldsConfig, FormField } from './banking.config';

interface LinkBankAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLinkAccount: (accountData: Omit<BankAccount, 'id' | 'status'>) => void;
}

// Reusable FileInput component (adapted from KYCView)
const FileInput: React.FC<{ label: string, file: File | null, setFile: (file: File | null) => void, isRequired: boolean }> = 
({ label, file, setFile, isRequired }) => {
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
        if (preview) URL.revokeObjectURL(preview);
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);
        }
    };

    useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

    return (
        <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">{label} {isRequired && <span className="text-red-400">*</span>}</label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-600 px-6 py-10 bg-slate-800/40 hover:border-sky-500/50 transition-colors">
                <div className="text-center">
                    {preview ? <img src={preview} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-contain" />
                    : file ? <p className="text-emerald-400">{file.name}</p>
                    : <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-500" aria-hidden="true" />}
                    <div className="mt-4 flex text-sm leading-6 text-slate-400">
                        <label
                            htmlFor={label.toLowerCase().replace(/\s/g, '-')}
                            className="relative cursor-pointer rounded-md bg-transparent font-semibold text-sky-400 focus-within:outline-none hover:text-sky-300"
                        >
                            <span>Upload a file</span>
                            <input id={label.toLowerCase().replace(/\s/g, '-')} name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png, application/pdf" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-slate-500">PNG, JPG, PDF up to 10MB</p>
                </div>
            </div>
        </div>
    );
};


const LinkBankAccountModal: React.FC<LinkBankAccountModalProps> = ({ isOpen, onClose, onLinkAccount }) => {
    const [selectedCountry, setSelectedCountry] = useState('US');
    const [details, setDetails] = useState<Record<string, string>>({});
    const [nickname, setNickname] = useState('');
    const [bankStatementFile, setBankStatementFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fieldsForCountry = useMemo(() => bankingFieldsConfig[selectedCountry] || bankingFieldsConfig['DEFAULT'], [selectedCountry]);

    useEffect(() => {
        if (isOpen) {
            setDetails({});
            setNickname('');
            setErrors({});
            setBankStatementFile(null);
            setSelectedCountry('US');
        }
    }, [isOpen]);
    
    useEffect(() => {
        setDetails({});
        setErrors({});
    }, [selectedCountry]);

    const validateField = (id: string, value: string): boolean => {
        const fieldConfig = fieldsForCountry.find(f => f.id === id);
        if (!fieldConfig?.validation) return true;

        const { required, pattern, minLength, maxLength } = fieldConfig.validation;
        let error = '';
        const trimmedValue = value ? value.trim() : '';

        if (required && !trimmedValue) error = 'This field is required.';
        else if (trimmedValue && pattern && !new RegExp(pattern).test(trimmedValue)) error = `Invalid format.`;
        else if (trimmedValue && minLength && trimmedValue.length < minLength) error = `Must be at least ${minLength} characters.`;
        else if (trimmedValue && maxLength && trimmedValue.length > maxLength) error = `Cannot exceed ${maxLength} characters.`;
        
        setErrors(prev => ({ ...prev, [id]: error }));
        return !error;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let isFormValid = true;
        fieldsForCountry.forEach(field => {
            if (!validateField(field.id, details[field.id] || '')) {
                isFormValid = false;
            }
        });

        if (!bankStatementFile) {
            setErrors(prev => ({...prev, bankStatement: 'Bank statement is required for verification.'}));
            isFormValid = false;
        }

        if (isFormValid) {
            const displayField = fieldsForCountry.find(f => f.isDisplayField);
            const providerField = fieldsForCountry.find(f => f.isProviderName);
            const providerName = providerField ? details[providerField.id] : `${selectedCountry} Bank`;
            const displayValue = displayField ? details[displayField.id] : '';
            const accountDisplay = `${providerName} (...${displayValue.slice(-4)})`;
            
            onLinkAccount({
                countryCode: selectedCountry,
                nickname: nickname || providerName,
                details,
                accountDisplay,
            });
            onClose();
        }
    };

    const renderField = (field: FormField) => {
        const inputBaseClass = `w-full bg-slate-700/80 border rounded-lg p-2.5 mt-1 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none`;
        const commonProps = {
            id: field.id,
            value: details[field.id] || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDetails(prev => ({...prev, [field.id]: e.target.value})),
            onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => validateField(field.id, e.target.value),
            className: `${inputBaseClass} ${errors[field.id] ? 'border-red-500' : 'border-slate-600'}`,
            required: field.validation?.required,
        };

        return (
            <div key={field.id}>
                <label htmlFor={field.id} className="text-sm text-slate-400" title={field.tooltip}>{field.label} {commonProps.required && <span className="text-red-400">*</span>}</label>
                <input type={field.type} placeholder={field.placeholder} {...commonProps} />
                {errors[field.id] && <p className="text-xs text-red-400 mt-1">{errors[field.id]}</p>}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-300/10 rounded-2xl shadow-2xl w-full max-w-2xl m-4 text-white transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-300/10">
                    <h2 className="text-2xl font-bold">Link a Bank Account</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/80"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="country-selector" className="text-sm text-slate-400">Country <span className="text-red-400">*</span></label>
                            <select id="country-selector" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-full bg-slate-700/80 border border-slate-600 rounded-lg p-2.5 mt-1 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none">
                                {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                           <label htmlFor="nickname" className="text-sm text-slate-400">Nickname (Optional)</label>
                           <input id="nickname" type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="e.g. My Chase Checking" className="w-full bg-slate-700/80 border border-slate-600 rounded-lg p-2.5 mt-1 text-white"/>
                        </div>
                    </div>
                    
                    <div className="space-y-4 border-t border-slate-700 pt-6">
                         <h3 className="font-semibold text-lg text-sky-400">Account Details for {countries.find(c=>c.code === selectedCountry)?.name}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {fieldsForCountry.map(field => renderField(field))}
                         </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-700 pt-6">
                        <h3 className="font-semibold text-lg text-sky-400">Verification Document</h3>
                        <FileInput label="Bank Statement or Account Screenshot" file={bankStatementFile} setFile={setBankStatementFile} isRequired={true} />
                        {errors.bankStatement && <p className="text-xs text-red-400 mt-1">{errors.bankStatement}</p>}
                    </div>

                     <div className="text-xs p-3 rounded-lg bg-slate-800/70 text-slate-400 flex items-start gap-2">
                        <LockIcon className="w-8 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <span>Your information is encrypted and securely stored. It is used for verification purposes only and will not be shared.</span>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2.5 px-6 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-6 rounded-lg shadow-md shadow-sky-500/20">Submit for Review</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LinkBankAccountModal;
