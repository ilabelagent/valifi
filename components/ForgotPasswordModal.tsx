import React, { useState, useCallback } from 'react';
import { ValifiLogo, CloseIcon, CheckCircleIcon } from './icons';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenSignIn: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onOpenSignIn }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Mock API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!email.includes('@')) { // simple mock validation
                 throw new Error("Please enter a valid email address.");
            }
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOpenSignInClick = useCallback(() => {
        onClose();
        onOpenSignIn();
    }, [onClose, onOpenSignIn]);
    
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-modal-title"
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
                    <h2 id="forgot-password-modal-title" className="text-2xl font-bold">Reset Password</h2>
                </div>
                
                {isSubmitted ? (
                    <div className="text-center space-y-4 mt-6">
                        <CheckCircleIcon className="w-16 h-16 text-success mx-auto" />
                        <h3 className="text-xl font-bold">Check Your Email</h3>
                        <p className="text-muted-foreground">If an account with that email address exists, we have sent instructions to reset your password.</p>
                        <button onClick={onClose} className="w-full py-3 rounded-lg font-bold text-primary-foreground bg-primary hover:bg-primary/90">
                           Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-6 mt-6">
                        <p className="text-sm text-muted-foreground text-center">Enter your email address and we will send you a link to reset your password.</p>
                        <div>
                            <label htmlFor="reset-email" className="sr-only">Email Address</label>
                            <input id="reset-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-secondary border border-border rounded-lg py-2.5 px-4 text-foreground" placeholder="Email Address" />
                        </div>
                        
                        {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg text-center">{error}</div>}

                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-lg font-bold text-primary-foreground bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground">
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>
                )}
                 <p className="mt-8 text-center text-sm text-muted-foreground">
                    Remembered your password?{' '}
                    <button type="button" onClick={handleOpenSignInClick} className="font-semibold leading-6 text-primary hover:text-primary/80">
                        Sign In
                    </button>
                </p>
            </div>
        </div>
    );
};

export default React.memo(ForgotPasswordModal);