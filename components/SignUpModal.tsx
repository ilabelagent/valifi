
import React, { useState, useCallback } from 'react';
import { ValifiLogo, CloseIcon, GoogleIcon, GithubIcon, CheckCircleIcon, AlertTriangleIcon } from './icons';

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

    if (!isOpen) return null;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError('');
        setIsLoading(true);
        const result = await onSignUp(fullName, username, email, password);
        setIsLoading(false);
        if (!result.success) {
            setError(result.message || 'An unknown error occurred during registration.');
        }
        // On success, parent component handles the state change and modal closure.
    };
    
    const handleOpenSignInClick = useCallback(() => {
        onClose();
        onOpenSignIn();
    }, [onClose, onOpenSignIn]);
    
    const inputClass = "w-full bg-secondary border border-border rounded-lg py-2 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
    const isDbError = dbStatus === 'error';

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
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <ValifiLogo className="w-10 h-10 text-primary" />
                        <h2 id="signup-modal-title" className="text-2xl font-bold">Create your Account</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-accent" aria-label="Close">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mb-4">
                    <button
                        type="button"
                        onClick={() => console.log('Continue with Google')}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-border rounded-lg text-foreground bg-secondary hover:bg-accent transition-colors"
                    >
                        <GoogleIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">Sign up with Google</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => console.log('Continue with GitHub')}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-border rounded-lg text-foreground bg-secondary hover:bg-accent transition-colors"
                    >
                        <GithubIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">Sign up with GitHub</span>
                    </button>
                </div>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-card px-2 text-muted-foreground">OR</span>
                    </div>
                </div>


                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
                        <input id="fullName" name="fullName" type="text" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-muted-foreground mb-1.5">Username</label>
                        <input id="username" name="username" type="text" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="signup-email" className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
                        <input id="signup-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="signup-password"className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
                        <input id="signup-password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="confirm-password"className="block text-sm font-medium text-muted-foreground mb-1.5">Confirm Password</label>
                        <input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
                    </div>
                    
                    {error && <div className="bg-destructive text-destructive-foreground text-sm p-3 rounded-lg text-center">{error}</div>}

                    <div className="pt-2">
                        <button type="submit" disabled={isLoading || isDbError} className="w-full flex justify-center py-3 px-4 rounded-lg font-bold text-primary-foreground bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed">
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
                </form>

                 <div className="mt-4 text-center text-xs">
                    {dbStatus === 'checking' && <p className="text-muted-foreground">Checking system status...</p>}
                    {dbStatus === 'ok' && <p className="text-success flex items-center justify-center gap-1.5"><CheckCircleIcon className="w-4 h-4" /> All systems operational.</p>}
                    {isDbError && <p className="text-destructive flex items-center justify-center gap-1.5"><AlertTriangleIcon className="w-4 h-4" /> {dbErrorMessage}</p>}
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
