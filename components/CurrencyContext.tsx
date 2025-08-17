import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as fxService from './fxService';

interface CurrencyContextType {
    currency: string;
    setCurrency: (currency: string) => void;
    formatCurrency: (amountUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode; savedCurrency: string }> = ({ children, savedCurrency }) => {
    const [displayCurrency, setDisplayCurrency] = useState(savedCurrency);
    const { i18n } = useTranslation();

    // Sync with saved settings when they change from props
    useEffect(() => {
        setDisplayCurrency(savedCurrency);
    }, [savedCurrency]);

    const formatCurrencyCallback = useCallback((amountUSD: number) => {
        if (typeof amountUSD !== 'number') return '';
        const convertedAmount = fxService.convertFromUSD(amountUSD, displayCurrency);
        return fxService.formatCurrency(convertedAmount, displayCurrency, i18n.language);
    }, [displayCurrency, i18n.language]);

    const value = useMemo(() => ({
        currency: displayCurrency,
        setCurrency: setDisplayCurrency,
        formatCurrency: formatCurrencyCallback,
    }), [displayCurrency, formatCurrencyCallback]);

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};