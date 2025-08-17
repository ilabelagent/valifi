import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { PaymentMethod } from '../types';
import { CloseIcon, PlusCircleIcon, BankIcon, TrashIcon, ChevronDownIcon, PayPalIcon, WiseIcon, CashAppIcon, SkrillIcon, RevolutIcon, UPIIcon, MobileMoneyIcon, InteracIcon, PIXIcon, DefaultPaymentIcon } from './icons';
import { countries } from './countries';
import { paymentMethodsConfig, getAvailableMethodsForCountry, FormField } from './payment-methods.config';

interface ManagePaymentMethodsModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentMethods: PaymentMethod[];
    setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
}

const AddPaymentMethodForm: React.FC<{ onAdd: (method: PaymentMethod) => void, onCancel: () => void }> = ({ onAdd, onCancel }) => {
    const [selectedCountry, setSelectedCountry] = useState('US');
    const [availableMethods, setAvailableMethods] = useState(() => getAvailableMethodsForCountry(selectedCountry));
    const [selectedMethodType, setSelectedMethodType] = useState(() => Object.keys(getAvailableMethodsForCountry(selectedCountry))[0] || '');
    
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [nickname, setNickname] = useState('');

    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [countrySearchTerm, setCountrySearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const iconMap: { [key: string]: React.FC<any> } = {
        'Bank Transfer': BankIcon,
        'Wise': WiseIcon,
        'PayPal': PayPalIcon,
        'Cash App': CashAppIcon,
        'Skrill': SkrillIcon,
        'Revolut': RevolutIcon,
        'UPI': UPIIcon,
        'Mobile Money': MobileMoneyIcon,
        'Interac': InteracIcon,
        'PIX': PIXIcon,
        'default': DefaultPaymentIcon,
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCountryDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const filteredCountries = useMemo(() =>
        countries.filter(c =>
            c.name.toLowerCase().includes(countrySearchTerm.toLowerCase())
        ),
    [countrySearchTerm]);

    useEffect(() => {
        const methods = getAvailableMethodsForCountry(selectedCountry);
        setAvailableMethods(methods);
        const firstMethod = Object.keys(methods)[0] || '';
        setSelectedMethodType(firstMethod);
        setFormData({});
        setFormErrors({});
        setNickname('');
    }, [selectedCountry]);

    useEffect(() => {
        setFormData({});
        setFormErrors({});
        setNickname(selectedMethodType);
    }, [selectedMethodType]);

    const currentFields = availableMethods[selectedMethodType] || [];

    const handleInputChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
        if (formErrors[id]) {
            validateField(id, value);
        }
    };

    const validateField = (id: string, value: string): boolean => {
        const fieldConfig = currentFields.find(f => f.id === id);
        if (!fieldConfig?.validation) return true;

        const { required, pattern, minLength, maxLength } = fieldConfig.validation;
        let error = '';
        const trimmedValue = value ? value.trim() : '';

        if (required && !trimmedValue) {
            error = 'This field is required.';
        } else if (trimmedValue && pattern && !new RegExp(pattern).test(trimmedValue)) {
            error = `Invalid format.`;
        } else if (trimmedValue && minLength && trimmedValue.length < minLength) {
            error = `Must be at least ${minLength} characters.`;
        } else if (trimmedValue && maxLength && trimmedValue.length > maxLength) {
            error = `Cannot exceed ${maxLength} characters.`;
        }
        
        setFormErrors(prev => ({ ...prev, [id]: error }));
        return !error;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let isValid = true;
        currentFields.forEach(field => {
            if (!validateField(field.id, formData[field.id] || '')) {
                isValid = false;
            }
        });

        if (isValid) {
            const newMethod: PaymentMethod = {
                id: `pm${Date.now()}`,
                methodType: selectedMethodType,
                nickname: nickname || `${selectedMethodType}`,
                country: selectedCountry,
                details: { ...formData }
            };
            onAdd(newMethod);
        }
    };
    
    const renderField = (field: FormField) => {
        const inputBaseClass = `w-full bg-slate-700/80 border rounded-lg p-2.5 mt-1 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none`;
        const commonProps = {
            id: field.id,
            value: formData[field.id] || '',
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => handleInputChange(field.id, e.target.value),
            onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => validateField(field.id, e.target.value),
            className: `${inputBaseClass} ${formErrors[field.id] ? 'border-red-500' : 'border-slate-600'}`,
            required: field.validation?.required,
        };

        return (
            <div className="relative" key={field.id}>
                <label htmlFor={field.id} className="text-sm text-slate-400" title={field.tooltip}>{field.label}</label>
                {field.type === 'select' ? (
                    <select {...commonProps}>
                        <option value="">{field.placeholder || 'Select...'}</option>
                        {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                ) : (
                    <input type={field.type} placeholder={field.placeholder} {...commonProps} />
                )}
                {formErrors[field.id] && <p className="text-xs text-red-400 mt-1">{formErrors[field.id]}</p>}
            </div>
        );
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             <h3 className="text-lg font-semibold text-white">Add New Payment Method</h3>
             <div className="space-y-4">
                <div>
                    <label htmlFor="country-selector" className="text-sm text-slate-400">Country</label>
                    <div className="relative mt-1" ref={dropdownRef}>
                        <button
                            id="country-selector"
                            type="button"
                            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                            className="relative w-full cursor-default rounded-md bg-slate-700/80 py-2 pl-3 pr-10 text-left text-white shadow-sm ring-1 ring-inset ring-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 h-[46px] flex items-center"
                            aria-haspopup="listbox"
                            aria-expanded={isCountryDropdownOpen}
                        >
                            <span className="flex items-center">
                                <img src={`https://flagcdn.com/w20/${selectedCountry.toLowerCase()}.png`} alt="" className="h-5 w-5 flex-shrink-0 rounded-full object-cover" />
                                <span className="ml-3 block truncate">{countries.find(c => c.code === selectedCountry)?.name}</span>
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </button>

                        {isCountryDropdownOpen && (
                            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                <div className="p-2 sticky top-0 bg-slate-800 z-10">
                                     <input
                                        type="text"
                                        placeholder="Search country..."
                                        value={countrySearchTerm}
                                        onChange={(e) => setCountrySearchTerm(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    />
                                </div>
                                <ul role="listbox" aria-labelledby="country-selector">
                                    {filteredCountries.length > 0 ? filteredCountries.map((country) => (
                                        <li
                                            key={country.code}
                                            className="text-white relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-sky-600"
                                            onClick={() => {
                                                setSelectedCountry(country.code);
                                                setIsCountryDropdownOpen(false);
                                                setCountrySearchTerm('');
                                            }}
                                            role="option"
                                            aria-selected={country.code === selectedCountry}
                                        >
                                            <div className="flex items-center">
                                                <img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt={`${country.name} flag`} className="h-5 w-5 flex-shrink-0 rounded-full object-cover" />
                                                <span className="font-normal ml-3 block truncate">{country.name}</span>
                                            </div>
                                        </li>
                                    )) : (
                                        <li className="text-slate-400 relative cursor-default select-none py-2 px-4">
                                            No countries found.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <label className="text-sm text-slate-400">Payment Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                        {Object.keys(availableMethods).length > 0 ? Object.keys(availableMethods).map(methodKey => {
                            const IconComponent = Object.keys(iconMap).find(key => methodKey.toLowerCase().includes(key.toLowerCase())) ? iconMap[Object.keys(iconMap).find(key => methodKey.toLowerCase().includes(key.toLowerCase()))!] : iconMap['default'];
                            return (
                                <button
                                    type="button"
                                    key={methodKey}
                                    onClick={() => setSelectedMethodType(methodKey)}
                                    className={`p-3 border rounded-lg flex flex-col items-center justify-center text-center transition-colors h-28 ${selectedMethodType === methodKey ? 'bg-sky-600/20 border-sky-500' : 'bg-slate-700/80 border-slate-600 hover:bg-slate-700'}`}
                                >
                                    <IconComponent className="w-8 h-8 mb-2" />
                                    <span className="text-xs font-semibold">{methodKey}</span>
                                </button>
                            )
                        }) : <p className="text-slate-500 col-span-full text-center p-4">No specific payment methods for this country. Global options are available.</p>}
                    </div>
                </div>
             </div>
             
             <div className="space-y-4 border-t border-slate-300/10 pt-4">
                <h4 className="font-semibold text-slate-300">Enter Details for <span className="text-sky-400">{selectedMethodType}</span></h4>
                 {currentFields.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentFields.map(field => renderField(field))}
                        <div>
                            <label htmlFor="nickname" className="text-sm text-slate-400">Nickname (Optional)</label>
                            <input id="nickname" type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="e.g., My Savings" className="w-full bg-slate-700/80 border border-slate-600 rounded-lg p-2.5 mt-1 text-white"/>
                        </div>
                    </div>
                 ) : (
                    <div className="text-center text-slate-400 py-4">
                        <p>No specific fields required for this payment type.</p>
                        <p className="text-sm">You can add a nickname for your reference.</p>
                         <div>
                            <label htmlFor="nickname" className="text-sm text-slate-400 sr-only">Nickname (Optional)</label>
                            <input id="nickname" type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="e.g., My Global PayPal" className="mt-2 w-full max-w-sm mx-auto bg-slate-700/80 border border-slate-600 rounded-lg p-2.5 text-white"/>
                        </div>
                    </div>
                 )}
             </div>

             <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg shadow-md shadow-sky-500/20">Add Method</button>
             </div>
        </form>
    );
};

const ManagePaymentMethodsModal: React.FC<ManagePaymentMethodsModalProps> = ({ isOpen, onClose, paymentMethods, setPaymentMethods }) => {
    const [isAdding, setIsAdding] = useState(false);

    const handleAddMethod = (method: PaymentMethod) => {
        setPaymentMethods(prev => [...prev, method]);
        setIsAdding(false);
    };
    
    const handleDeleteMethod = (id: string) => {
        if(window.confirm('Are you sure you want to delete this payment method?')) {
            setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
        }
    };

    if (!isOpen) return null;

    const getPrimaryDetail = (pm: PaymentMethod): string => {
        const details = pm.details;
        if (details.accountNumber) return `...${details.accountNumber.slice(-4)}`;
        if (details.iban) return `...${details.iban.slice(-4)}`;
        if (details.cashtag) return details.cashtag;
        if (details.upiId) return details.upiId;
        if (details.emailOrPhone) return details.emailOrPhone;
        if (details.email) return details.email;
        if (details.mobileNumber) return details.mobileNumber;
        return pm.country;
    };


    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-300/10 rounded-2xl shadow-2xl w-full max-w-3xl m-4 text-white transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-300/10">
                    <h2 className="text-2xl font-bold">Manage Payment Methods</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/80"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    {isAdding ? (
                        <AddPaymentMethodForm onAdd={handleAddMethod} onCancel={() => setIsAdding(false)} />
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">Your Saved Methods</h3>
                            {paymentMethods.length > 0 ? (
                                <ul className="space-y-3">
                                {paymentMethods.map(pm => (
                                    <li key={pm.id} className="bg-slate-700/50 rounded-lg p-4 flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <img src={`https://flagcdn.com/w40/${pm.country === 'GLOBAL' ? 'un' : pm.country.toLowerCase()}.png`} alt={`${pm.country} flag`} className="w-8 h-6 rounded-sm object-cover" />
                                            <div>
                                                <p className="font-bold">{pm.nickname}</p>
                                                <p className="text-sm text-slate-400">
                                                   {pm.methodType} - {getPrimaryDetail(pm)}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteMethod(pm.id)} className="text-slate-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <div className="text-slate-400 text-center py-8 border border-dashed border-slate-600 rounded-lg">
                                    <p>No payment methods added yet.</p>
                                    <p className="text-sm">Click below to add your first one.</p>
                                </div>
                            )}
                             <button onClick={() => setIsAdding(true)} className="w-full mt-4 flex items-center justify-center gap-2 bg-sky-800/20 hover:bg-sky-800/40 border border-dashed border-sky-700 text-sky-300 font-semibold py-3 px-4 rounded-lg transition-colors">
                                <PlusCircleIcon className="w-5 h-5"/> Add Payment Method
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagePaymentMethodsModal;
