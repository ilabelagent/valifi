
import React, { useState, useCallback } from 'react';
import { ValifiLogo, CloseIcon, CheckCircleIcon, InfoIcon } from './icons';

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignUp: (fullName: string, username: string, email: string, password: string) => Promise<{ success: boolean, message?: string }>;
    onOpenSignIn: () => void;
    dbStatus: 'checking' | 'ok' | 'error';
    dbErrorMessage: string;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSignUp, onOpenSignIn, dbStatus, dbErrorMessage }) => {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // All hooks must be called before any conditional returns
    const handleOpenSignInClick = useCallback(() => {
        onClose();
        onOpenSignIn();
    }, [onClose, onOpenSignIn]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        setError('');
        setIsLoading(true);
        const result = await onSignUp(fullName, username, email, password);
        setIsLoading(false);
        if (!result.success) {
            setError(result.message || 'An unknown error occurred during registration.');
        }
    };

    // Conditional return must come after all hooks
    if (!isOpen) return null;
    
    const inputClass = "w-full bg-secondary border border-border rounded-lg py-2.5 px-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
    
    // Only disable if truly checking or has a critical error
    const isDisabled = isLoading || dbStatus === 'checking' || dbStatus === 'error';

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-modal-title"
        >
            <div 
                className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 text-foreground p-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative text-center">
                    <button onClick={onClose} className="absolute -top-4 -right-4 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-accent" aria-label="Close">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <ValifiLogo className="w-12 h-12 text-primary mx-auto mb-2" />
                    <h2 id="signup-modal-title" className="text-2xl font-bold">Create your Account</h2>
                    <p className="text-muted-foreground text-sm">Join the future of finance.</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
                    <div>
                        <label htmlFor="fullName" className="sr-only">Full Name</label>
                        <input 
                            id="fullName" 
                            name="fullName" 
                            type="text" 
                            autoComplete="name" 
                            required 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={isDisabled}
                            className={inputClass} 
                            placeholder="Full Name"
                        />
                    </div>
                    <div>
                        <label htmlFor="username" className="sr-only">Username</label>
                        <input 
                            id="username" 
                            name="username" 
                            type="text" 
                            autoComplete="username" 
                            required 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isDisabled}
                            className={inputClass} 
                            placeholder="Username"
                        />
                    </div>
                    <div>
                        <label htmlFor="signup-email" className="sr-only">Email Address</label>
                        <input 
                            id="signup-email" 
                            name="email" 
                            type="email" 
                            autoComplete="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isDisabled}
                            className={inputClass} 
                            placeholder="Email Address"
                        />
                    </div>
                    <div>
                        <label htmlFor="signup-password" className="sr-only">Password</label>
                        <input 
                            id="signup-password" 
                            name="password" 
                            type="password" 
                            autoComplete="new-password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isDisabled}
                            className={inputClass} 
                            placeholder="Password (min. 8 characters)"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                        <input 
                            id="confirm-password" 
                            name="confirmPassword" 
                            type="password" 
                            autoComplete="new-password" 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isDisabled}
                            className={inputClass} 
                            placeholder="Confirm Password"
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isDisabled}
                            className="w-full flex justify-center py-3 px-4 rounded-lg font-bold text-primary-foreground bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center text-xs">
                    {dbStatus === 'checking' && <p className="text-muted-foreground">Checking system status...</p>}
                    {dbStatus === 'ok' && <p className="text-success flex items-center justify-center gap-1.5"><CheckCircleIcon className="w-4 h-4" /> All systems operational.</p>}
                </div>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button type="button" onClick={handleOpenSignInClick} className="font-semibold leading-6 text-primary hover:text-primary/80">
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
};

export default React.memo(SignUpModal);