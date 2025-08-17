import { countries } from './countries';

// Mock rates with USD as the base currency
export const mockFxRates: Record<string, number> = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  JPY: 157.5,
  NGN: 1480.5,
  INR: 83.5,
  CAD: 1.37,
  AUD: 1.51,
  CNY: 7.25,
  CHF: 0.91,
  BRL: 5.25,
  ZAR: 18.8,
  KES: 130.0,
  GHS: 14.5,
  TRY: 32.27,
  RUB: 91.5,
  KRW: 1378.5,
};

export const getCurrencyInfo = (currencyCode: string) => {
  for (const country of countries) {
    if (country.currency && country.currency.code === currencyCode) {
      return country.currency;
    }
  }
  // Fallback for currencies not in the main countries list (like NGN which might be used in multiple)
  const knownSymbols: Record<string, string> = {
      'NGN': '₦',
      'TRY': '₺',
      'RUB': '₽',
      'KRW': '₩'
  }
  if (knownSymbols[currencyCode]) {
      return { code: currencyCode, name: currencyCode, symbol: knownSymbols[currencyCode] };
  }

  return { code: currencyCode, name: 'Unknown Currency', symbol: currencyCode };
};


export const convertFromUSD = (amountUSD: number, targetCurrency: string): number => {
  const rate = mockFxRates[targetCurrency] || 1;
  return amountUSD * rate;
};

export const formatCurrency = (amount: number, currencyCode: string, locale: string = 'en-US'): string => {
   try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    // Fallback for unsupported currency codes or environments
    const info = getCurrencyInfo(currencyCode);
    const formattedAmount = amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Basic symbol placement logic
    const isLeft = ['$', '£', '€', '¥', '₦', '₹', 'R', '₱'].includes(info.symbol);
    if (isLeft) {
        return `${info.symbol}${formattedAmount}`;
    }
    return `${formattedAmount} ${info.symbol}`;
  }
};