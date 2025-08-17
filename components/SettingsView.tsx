import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as otpauth from 'otpauth';
import QRCode from 'qrcode';
import type { UserSettings, Language } from '../types';
import { ShieldCheckIcon, PaletteIcon, PrivacyIcon, DeviceMobileIcon, TwoFactorIcon, SettingsIcon, CameraIcon, CopyIcon, CheckCircleIcon, KeyIcon } from './icons';
import { useCurrency } from './CurrencyContext';
import { mockFxRates } from './fxService';
import { languageList } from '../i18n';

interface SettingsViewProps {
    settings: UserSettings;
    setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

const Card: React.FC<{ children: React.ReactNode, className?: string, title: string, description?: string }> = ({ children, className, title, description }) => (
    <div className={`bg-card text-card-foreground border border-border rounded-xl shadow-sm ${className}`}>
        <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean, onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-input rounded-full peer-focus:outline-none peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    </label>
);

const TwoFactorAuthSetup: React.FC<{ settings: UserSettings, setSettings: React.Dispatch<React.SetStateAction<UserSettings>>, onCancel: () => void }> = ({ settings, setSettings, onCancel }) => {
    const { t } = useTranslation(['settings', 'common']);
    const [secret, setSecret] = useState<otpauth.Secret | null>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const newSecret = otpauth.Secret.fromBase32(settings.settings.twoFactorAuth.secret || '');
        setSecret(newSecret);

        const totp = new otpauth.TOTP({
            issuer: 'Valifi',
            label: settings.profile.username,
            secret: newSecret,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
        });

        QRCode.toDataURL(totp.toString())
            .then(url => setQrCodeDataUrl(url))
            .catch(err => console.error("QR Code generation failed:", err));
    }, [settings.profile.username, settings.settings.twoFactorAuth.secret]);

    const handleVerify = () => {
        if (!secret) return;
        const totp = new otpauth.TOTP({ secret });
        const delta = totp.validate({ token: otp, window: 1 });

        if (delta !== null) {
            setSettings(s => ({
                ...s,
                settings: {
                    ...s.settings,
                    twoFactorAuth: { ...s.settings.twoFactorAuth, enabled: true, method: 'authenticator' }
                }
            }));
        } else {
            setError('Invalid or expired code. Please try again.');
        }
    };
    
    const handleCopy = () => {
        if(!secret) return;
        navigator.clipboard.writeText(secret.base32);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="mt-4 border-t border-border pt-4 space-y-4">
            <h4 className="font-semibold text-lg text-foreground">Set Up Authenticator App</h4>
            <p className="text-sm text-muted-foreground">Scan the QR code with your authenticator app (e.g., Google Authenticator) and enter the 6-digit code to verify.</p>
            <div className="flex flex-col md:flex-row items-center gap-6">
                {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="2FA QR Code" className="bg-white p-2 rounded-lg" />}
                <div className="space-y-3 flex-grow">
                    <p className="text-sm text-muted-foreground">Or enter this key manually:</p>
                    <div className="flex items-center gap-2 bg-secondary p-2 rounded-lg">
                        <span className="font-mono text-primary break-all">{secret?.base32}</span>
                        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground flex-shrink-0"><CopyIcon className="w-4 h-4" /></button>
                        {copied && <CheckCircleIcon className="w-4 h-4 text-success"/>}
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                 <label htmlFor="otp-input" className="text-sm font-medium text-muted-foreground">Verification Code</label>
                 <input id="otp-input" type="text" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="123456" className="w-full bg-input p-3 rounded-lg text-center font-mono text-2xl tracking-widest"/>
                 {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            <div className="flex gap-4">
                 <button onClick={onCancel} className="bg-secondary hover:bg-accent text-secondary-foreground font-bold py-2 px-4 rounded-lg w-full">{t('common:cancel')}</button>
                 <button onClick={handleVerify} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg w-full">Verify & Enable</button>
            </div>
        </div>
    )
};


const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings }) => {
    const { t } = useTranslation('settings');
    const [activeSection, setActiveSection] = useState('account');
    const [tempSettings, setTempSettings] = useState<UserSettings>(settings);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [is2FASetup, setIs2FASetup] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const { setCurrency } = useCurrency();

    useEffect(() => {
        setTempSettings(settings);
    }, [settings]);
    
    useEffect(() => {
        setCurrency(tempSettings.settings.preferences.currency);
        // Theme and Privacy are handled in App.tsx to avoid conflicts
    }, [tempSettings.settings.preferences, setCurrency]);

    const navItems = [
        { id: 'account', label: t('nav_account'), Icon: ShieldCheckIcon },
        { id: 'preferences', label: t('nav_preferences'), Icon: PaletteIcon },
        { id: 'privacy', label: t('nav_privacy'), Icon: PrivacyIcon },
    ];
    
    const inputClass = "block w-full rounded-md border-0 bg-input py-2.5 px-3 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6";
    const buttonClass = "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed";

    const hasUnsavedPreferences = useMemo(() => {
        return JSON.stringify(tempSettings.settings.preferences) !== JSON.stringify(settings.settings.preferences);
    }, [tempSettings.settings.preferences, settings.settings.preferences]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
            setTempSettings(s => ({...s, profile: {...s.profile, profilePhotoUrl: previewUrl}}));
        }
    };
    
    const handle2FAToggle = (enabled: boolean) => {
        if (enabled) {
            const newSecret = new otpauth.Secret();
            setTempSettings(s => ({...s, settings: { ...s.settings, twoFactorAuth: { ...s.settings.twoFactorAuth, method: 'authenticator', secret: newSecret.base32}}}));
            setIs2FASetup(true);
        } else {
            // In a real app, this would require OTP verification to disable.
            setSettings(s => ({...s, settings: { ...s.settings, twoFactorAuth: { enabled: false, method: 'none', secret: undefined }}}));
        }
    }
    
    const handleSaveProfile = () => {
        setSettings(s => ({...s, profile: tempSettings.profile }));
        alert('Profile saved!');
    }

    const handleSavePreferences = () => {
        setIsSaving(true);
        setTimeout(() => {
            setSettings(tempSettings);
            setIsSaving(false);
            alert('✅ Preferences saved successfully!');
        }, 300);
    };
    
    const handlePreferenceChange = <K extends keyof UserSettings['settings']['preferences']>(key: K, value: UserSettings['settings']['preferences'][K]) => {
        setTempSettings(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                preferences: { ...prev.settings.preferences, [key]: value }
            }
        }));
    };


    const renderAccountSection = () => (
        <div className="space-y-8">
            <Card title={t('profile_title')} description={t('profile_description')}>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <img src={avatarPreview || settings.profile.profilePhotoUrl} alt="Profile" className="w-20 h-20 rounded-full"/>
                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <CameraIcon className="w-8 h-8"/>
                            <input type="file" id="avatar-upload" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleAvatarChange} />
                        </label>
                    </div>
                    <div className="flex-grow space-y-4">
                        <input type="text" value={tempSettings.profile.fullName} onChange={e => setTempSettings(s => ({...s, profile: {...s.profile, fullName: e.target.value}}))} className={inputClass} placeholder="Full Name" />
                        <input type="text" value={tempSettings.profile.username} onChange={e => setTempSettings(s => ({...s, profile: {...s.profile, username: e.target.value}}))} className={inputClass} placeholder="Username" />
                    </div>
                    <button onClick={handleSaveProfile} className={buttonClass}>{t('profile_save')}</button>
                </div>
            </Card>
             <Card title={t('password_title')} description={t('password_description')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-4">
                        <input type="password" placeholder="Current Password" className={inputClass} />
                        <input type="password" placeholder="New Password" className={inputClass} />
                        <input type="password" placeholder="Confirm New Password" className={inputClass} />
                    </div>
                    <button className={buttonClass}>{t('password_update')}</button>
                </div>
            </Card>
            <Card title={t('2fa_title')} description={t('2fa_description')}>
                 <div className="flex items-center justify-between">
                    <div>
                        <p className={settings.settings.twoFactorAuth.enabled ? 'text-success font-semibold' : 'text-muted-foreground'}>
                            Status: {settings.settings.twoFactorAuth.enabled ? `Enabled (${settings.settings.twoFactorAuth.method})` : 'Disabled'}
                        </p>
                    </div>
                    <ToggleSwitch checked={settings.settings.twoFactorAuth.enabled} onChange={handle2FAToggle} />
                </div>
                {is2FASetup && !settings.settings.twoFactorAuth.enabled && (
                    <TwoFactorAuthSetup settings={tempSettings} setSettings={setSettings} onCancel={() => setIs2FASetup(false)} />
                )}
            </Card>
            <Card title="Login Alerts" description="Receive a notification whenever a login occurs on your account.">
                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Enable login alerts</p>
                    <ToggleSwitch checked={settings.settings.loginAlerts} onChange={(val) => setSettings(s => ({...s, settings: {...s.settings, loginAlerts: val}}))} />
                </div>
            </Card>
             <Card title="Device & Session Manager" description="This is a list of devices that have logged into your account. Revoke any sessions that you do not recognize.">
                <ul className="divide-y divide-border">
                    {settings.sessions.map(session => (
                        <li key={session.id} className="py-3 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <DeviceMobileIcon className="w-6 h-6 text-muted-foreground"/>
                                <div>
                                    <p className="font-semibold text-foreground">{session.device} {session.isCurrent && <span className="text-xs text-primary">(Current)</span>}</p>
                                    <p className="text-sm text-muted-foreground">{session.location} - Last active {session.lastActive}</p>
                                </div>
                            </div>
                            {!session.isCurrent && <button className="text-sm text-destructive hover:text-destructive/80 font-semibold">Revoke</button>}
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );

     const renderPreferencesSection = () => (
        <div className="space-y-8">
            <Card title={t('display_title')} description={t('display_description')}>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-muted-foreground">{t('display_currency')}</label>
                        <select value={tempSettings.settings.preferences.currency} onChange={e => handlePreferenceChange('currency', e.target.value)} className={inputClass + " w-1/2"}>
                             {Object.keys(mockFxRates).sort().map(code => <option key={code} value={code}>{code}</option>)}
                        </select>
                    </div>
                     <div className="flex items-center justify-between">
                        <label className="text-muted-foreground">{t('display_language')}</label>
                        <select value={tempSettings.settings.preferences.language} onChange={e => handlePreferenceChange('language', e.target.value as Language)} className={inputClass + " w-1/2"}>
                             {languageList.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                        </select>
                    </div>
                     <div className="flex items-center justify-between">
                        <label className="text-muted-foreground">{t('display_privacy_mode')}</label>
                        <ToggleSwitch checked={tempSettings.settings.preferences.balancePrivacy} onChange={(val) => handlePreferenceChange('balancePrivacy', val)} />
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border flex justify-end">
                    <button onClick={handleSavePreferences} className={buttonClass} disabled={!hasUnsavedPreferences || isSaving}>
                        {isSaving ? 'Saving...' : t('display_save')}
                    </button>
                </div>
            </Card>
        </div>
    );

    const renderPrivacySection = () => (
         <div className="space-y-8">
             <Card title="Data Management" description="Manage your personal data and account status.">
                 <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Download an archive of your data.</p>
                        <button className={buttonClass}>Request Archive</button>
                    </div>
                     <div className="flex justify-between items-center p-4 border border-destructive/30 bg-destructive/10 rounded-lg">
                        <div>
                            <p className="font-semibold text-destructive">Delete Your Account</p>
                             <p className="text-sm text-muted-foreground">This action is permanent and cannot be undone.</p>
                        </div>
                        <button className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90">Request Deletion</button>
                    </div>
                 </div>
             </Card>
              <Card title="Consent & Permissions" description="Control how we use your information.">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">Receive email marketing</p>
                        <ToggleSwitch checked={settings.settings.privacy.emailMarketing} onChange={val => setSettings(s => ({...s, settings: {...s.settings, privacy: {...s.settings.privacy, emailMarketing: val}}}))} />
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">Receive platform news and updates</p>
                        <ToggleSwitch checked={settings.settings.privacy.platformMessages} onChange={val => setSettings(s => ({...s, settings: {...s.settings, privacy: {...s.settings.privacy, platformMessages: val}}}))} />
                    </div>
                </div>
            </Card>
         </div>
    );

    return (
        <div className="p-6 lg:p-8 space-y-8 view-container">
             <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                    <SettingsIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('description')}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <ul className="space-y-2 sticky top-24">
                        {navItems.map(item => (
                             <li key={item.id}>
                                <button
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg font-semibold text-left transition-all duration-200 group ${
                                    activeSection === item.id 
                                      ? 'bg-primary/10 text-primary' 
                                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                  }`}
                                >
                                  <item.Icon className={`w-5 h-5 transition-colors ${activeSection === item.id ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                  <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="lg:col-span-3">
                    {activeSection === 'account' && renderAccountSection()}
                    {activeSection === 'preferences' && renderPreferencesSection()}
                    {activeSection === 'privacy' && renderPrivacySection()}
                </main>
            </div>
        </div>
    );
};

export default SettingsView;