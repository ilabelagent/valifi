import React, { useState } from 'react';
import { ValifiLogo, CloseIcon, GoogleIcon, GithubIcon } from './icons';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (email: string, password: string) => Promise<{ success: boolean, message?: string }>;
    onSocialLogin: (provider: string) => Promise<{ success: boolean, message?: string }>;
    onOpenSignUp: () => void;
    onOpenForgotPassword: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onLogin, onSocialLogin, onOpenSignUp, onOpenForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
        // On success, the parent component will handle closing the modal/transitioning the view.
    };

    const handleSocialLoginClick = async (provider: string) => {
        setError('');
        setIsLoading(true);
        const result = await onSocialLogin(provider);
        setIsLoading(false);
        if (!result.success) {
            setError(result.message || `Failed to sign in with ${provider}.`);
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade"
            onClick={onClose}
        >
            <div 
                className="bg-card/70 backdrop-blur-xl border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 text-foreground p-8"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <ValifiLogo className="w-10 h-10 text-primary" />
                        <h2 className="text-2xl font-bold">Sign In to Valifi</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-accent" aria-label="Close">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1.5">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-lg py-2.5 px-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                             <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
                             <div className="text-sm">
                                <button type="button" onClick={() => { onClose(); onOpenForgotPassword(); }} className="font-semibold text-primary hover:text-primary/80">Forgot password?</button>
                            </div>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-secondary border border-border rounded-lg py-2.5 px-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    {error && (
                        <div className="bg-destructive text-destructive-foreground text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-card px-2 text-muted-foreground">OR</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        type="button"
                        onClick={() => handleSocialLoginClick('google')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-border rounded-lg text-foreground bg-secondary hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <GoogleIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">Continue with Google</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialLoginClick('github')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-border rounded-lg text-foreground bg-secondary hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <GithubIcon className="w-5 h-5" />
                        <span className="text-sm font-semibold">Continue with GitHub</span>
                    </button>
                </div>

                 <p className="mt-8 text-center text-sm text-muted-foreground">
                    Not a member?{' '}
                    <button type="button" onClick={() => { onClose(); onOpenSignUp(); }} className="font-semibold leading-6 text-primary hover:text-primary/80">
                        Start your journey today
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignInModal;