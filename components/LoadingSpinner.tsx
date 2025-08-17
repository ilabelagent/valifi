import React from 'react';
import { ValifiLogo } from './icons';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full w-full p-8">
        <div className="relative w-16 h-16">
            <ValifiLogo className="w-16 h-16 text-primary" />
            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
        </div>
    </div>
);

export default LoadingSpinner;
