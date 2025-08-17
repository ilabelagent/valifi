import React, { useState } from 'react';
import type { P2PReview } from '../types';
import { CloseIcon, StarIcon } from './icons';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (review: Pick<P2PReview, 'rating' | 'comment'>) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating.');
            return;
        }
        setError('');
        onSubmit({ rating, comment });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg text-white" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold">Leave a Review</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <p className="text-center text-slate-300 mb-4">How was your trading experience?</p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none"
                                >
                                    <StarIcon
                                        className={`w-10 h-10 cursor-pointer transition-colors ${
                                            (hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-600'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="review-comment" className="text-sm font-medium text-slate-300">Comment (Optional)</label>
                        <textarea
                            id="review-comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            placeholder="Share more details about your experience..."
                            className="mt-2 w-full bg-slate-700/80 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={rating === 0}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg disabled:bg-slate-700 disabled:cursor-not-allowed"
                    >
                        Submit Review
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewModal;
