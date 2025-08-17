import React, { useState, useEffect } from 'react';
import { CloseIcon, CheckCircleIcon, UploadCloudIcon } from './icons';

interface JobApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({ isOpen, onClose, jobTitle }) => {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        expertise: jobTitle || '',
        resume: null as File | null,
        coverLetter: ''
    });
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [resumeFileName, setResumeFileName] = useState('');

    useEffect(() => {
        if (jobTitle) {
            setFormState(prev => ({...prev, expertise: jobTitle}));
        }
    }, [jobTitle]);
    
    useEffect(() => {
        if (submissionStatus === 'success') {
            const timer = setTimeout(() => {
                onClose();
                 // Reset form for next open after transition
                setTimeout(() => {
                     setSubmissionStatus('idle');
                     setFormState({ name: '', email: '', expertise: '', resume: null, coverLetter: ''});
                     setResumeFileName('');
                }, 500);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [submissionStatus, onClose]);

    if (!isOpen) return null;
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormState(prev => ({ ...prev, resume: file }));
        setResumeFileName(file ? file.name : '');
         if (errors.resume) {
            setErrors(prev => ({ ...prev, resume: '' }));
        }
    };
    
    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formState.name.trim()) newErrors.name = "Full name is required.";
        if (!formState.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
            newErrors.email = "Email is invalid.";
        }
        if (!formState.expertise) newErrors.expertise = "Please select your area of expertise.";
        if (!formState.resume) newErrors.resume = "A resume or CV is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setSubmissionStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            console.log("Form Submitted:", formState);
            setSubmissionStatus('success');
        }, 1500);
    };

    const inputClass = "w-full bg-slate-700/80 border border-slate-600 rounded-lg py-2.5 px-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500";

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl text-white transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold">{submissionStatus === 'success' ? 'Application Sent' : 'Apply for a Position'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/80"><CloseIcon className="w-6 h-6" /></button>
                </div>

                {submissionStatus === 'success' ? (
                    <div className="p-10 text-center">
                        <CheckCircleIcon className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white">Thank You for Applying!</h3>
                        <p className="mt-2 text-slate-300 max-w-md mx-auto">
                           Your application has been submitted and our team has been notified. We will get in touch with you shortly.
                        </p>
                    </div>
                ) : (
                     <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                                <input type="text" id="name" name="name" value={formState.name} onChange={handleInputChange} className={inputClass} required />
                                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                                <input type="email" id="email" name="email" value={formState.email} onChange={handleInputChange} className={inputClass} required />
                                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="expertise" className="block text-sm font-medium text-slate-300 mb-1.5">Area of Expertise</label>
                            <select id="expertise" name="expertise" value={formState.expertise} onChange={handleInputChange} className={inputClass} required>
                                <option value="" disabled>Select an area...</option>
                                <option value="Investment Analyst">Investment Analyst</option>
                                <option value="AI Developer">AI Developer</option>
                                <option value="Product Manager">Product Manager</option>
                                <option value="Exchanger Service Representative">Exchanger Service Representative</option>
                                <option value="Software Engineering">Software Engineering</option>
                                <option value="Marketing & Growth">Marketing & Growth</option>
                                <option value="Operations">Operations</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.expertise && <p className="text-xs text-red-400 mt-1">{errors.expertise}</p>}
                        </div>
                        <div>
                             <label htmlFor="resume" className="block text-sm font-medium text-slate-300 mb-1.5">Resume / CV</label>
                             <div className="mt-2 flex justify-center items-center rounded-lg border border-dashed border-slate-600 px-6 py-10 bg-slate-800/40 hover:border-sky-500/50 transition-colors">
                                <div className="text-center">
                                    <UploadCloudIcon className="mx-auto h-10 w-10 text-slate-500" />
                                    <div className="mt-4 flex text-sm leading-6 text-slate-400">
                                        <label htmlFor="resume" className="relative cursor-pointer rounded-md bg-transparent font-semibold text-sky-400 focus-within:outline-none hover:text-sky-300">
                                            <span>Upload a file</span>
                                            <input id="resume" name="resume" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" required />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs leading-5 text-slate-500">PDF, DOC, DOCX up to 10MB</p>
                                    {resumeFileName && <p className="text-xs text-emerald-400 mt-2">{resumeFileName}</p>}
                                </div>
                            </div>
                            {errors.resume && <p className="text-xs text-red-400 mt-1">{errors.resume}</p>}
                        </div>
                         <div>
                            <label htmlFor="coverLetter" className="block text-sm font-medium text-slate-300 mb-1.5">Cover Letter (Optional)</label>
                            <textarea id="coverLetter" name="coverLetter" rows={4} value={formState.coverLetter} onChange={handleInputChange} className={inputClass} />
                        </div>
                        <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                            <button type="button" onClick={onClose} className="bg-slate-600/80 hover:bg-slate-600 text-white font-bold py-2.5 px-6 rounded-lg">Cancel</button>
                            <button type="submit" disabled={submissionStatus === 'submitting'} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-6 rounded-lg shadow-md shadow-sky-500/20 disabled:bg-slate-700 disabled:cursor-not-allowed">
                                {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default JobApplicationModal;
