import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import type { Language } from './types';
import { translations } from './translations';

export const languageList: { code: Language; name: string, dir?: 'ltr' | 'rtl' }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
    { code: 'he', name: 'עברית', dir: 'rtl' },
    { code: 'zh-CN', name: '中文 (简体)' },
    { code: 'zh-TW', name: '中文 (繁體)' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'it', name: 'Italiano' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'sw', name: 'Kiswahili' },
];


i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: translations,
        fallbackLng: 'en',
        debug: false,
        ns: ['common', 'landing', 'header', 'sidebar', 'dashboard', 'investments', 'referrals', 'privacy', 'exchange', 'p2p', 'wallet', 'tax', 'kyc', 'cards', 'banking', 'loans', 'settings', 'modals', 'time'],
        defaultNS: 'common',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        detection: {
            order: ['querystring', 'localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupQuerystring: 'lng',
        }
    });

export default i18n;