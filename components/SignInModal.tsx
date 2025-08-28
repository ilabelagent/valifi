
import React, { useState } from 'react';
import { ValifiLogo, CloseIcon, CheckCircleIcon, InfoIcon } from './icons';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (email: string, password: string) => Promise<{ success: boolean, message?: string }>;
    onOpenSignUp: () => void;
    onOpenForgotPassword: () => void;
    dbStatus: 'checking' | 'ok' | 'error' | 'demo';
    dbErrorMessage: string;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onLogin, onOpenSignUp, onOpenForgotPassword, dbStatus, dbErrorMessage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await onLogin(email, password);
        setIsLoading(false);
        if (!result.success) {
            setError(result.message || 'An unknown error occurred.');
        }
    };
    
    // Only disable if truly checking or has a critical error (not demo mode)
    const isDisabled = isLoading || dbStatus === 'checking';
    const isDemoMode = dbStatus === 'demo' || dbStatus === 'error';

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-modal-title"
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
                    <h2 id="signin-modal-title" className="text-2xl font-bold">Welcome Back</h2>
                    <p className="text-muted-foreground text-sm">Sign in to access your financial dashboard.</p>
                </div>

                {isDemoMode && (
                    <div className="mt-6 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <InfoIcon className="w-5 h-5 text-primary mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-primary">Demo Mode Active</p>
                                <p className="text-muted-foreground mt-1">Use these test accounts:</p>
                                <div className="mt-2 space-y-1 text-xs font-mono">
                                    <p className="text-foreground">demo@valifi.com / demo123</p>
                                    <p className="text-foreground">admin@valifi.com / admin123</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
                    <div>
                        <label htmlFor="email" className="sr-only">Email Address</label>
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            autoComplete="email" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-lg py-2.5 px-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
                            placeholder="Email Address"
                        />
                    </div>
                    <div className="relative">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input 
                            id="password" 
                            name="password" 
                            type={showPassword ? "text" : "password"} 
                            autoComplete="current-password" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-lg py-2.5 px-4 pr-12 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    
                    <div className="text-right text-sm">
                        <button type="button" onClick={onOpenForgotPassword} className="font-semibold text-primary hover:text-primary/80">
                            Forgot password?
                        </button>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div>
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
                                    Signing In...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center text-xs">
                    {dbStatus === 'checking' && <p className="text-muted-foreground">Checking system status...</p>}
                    {dbStatus === 'ok' && <p className="text-success flex items-center justify-center gap-1.5"><CheckCircleIcon className="w-4 h-4" /> All systems operational.</p>}
                    {dbStatus === 'demo' && <p className="text-primary flex items-center justify-center gap-1.5"><InfoIcon className="w-4 h-4" /> Demo mode - No database configured</p>}
                </div>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    Not a member?{' '}
                    <button type="button" onClick={onOpenSignUp} className="font-semibold leading-6 text-primary hover:text-primary/80">
                        Start your journey today
                    </button>
                </p>
            </div>
        </div>
    );
};

export default React.memo(SignInModal);