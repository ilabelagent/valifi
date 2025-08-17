import React from 'react';
import { CloseIcon } from './icons';

export interface Feature {
    Icon: React.FC<any>;
    title: string;
    description: string;
    details: {
        headline: string;
        body: string;
        points: string[];
    };
}

interface FeatureDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: Feature | null;
}

const FeatureDetailModal: React.FC<FeatureDetailModalProps> = ({ isOpen, onClose, feature }) => {
    if (!isOpen || !feature) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4 motion-safe:animate-slide-in-fade"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feature-detail-title"
        >
            <div 
                className="bg-slate-900/70 backdrop-blur-xl border border-slate-300/10 rounded-2xl shadow-2xl w-full max-w-2xl m-4 text-white transform transition-all max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-slate-700 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-800/70 w-12 h-12 flex items-center justify-center rounded-xl">
                            <feature.Icon className="w-6 h-6 text-sky-400" />
                        </div>
                        <h2 id="feature-detail-title" className="text-2xl font-bold">{feature.title}</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700/80" aria-label="Close">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto">
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-400">
                        {feature.details.headline}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                        {feature.details.body}
                    </p>
                    <div>
                        <h4 className="font-semibold text-white mb-3">Key Highlights:</h4>
                        <ul className="space-y-3">
                            {feature.details.points.map((point, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    </div>
                                    <span className="text-slate-300">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-700 flex-shrink-0 flex justify-end">
                    <button onClick={onClose} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeatureDetailModal;
