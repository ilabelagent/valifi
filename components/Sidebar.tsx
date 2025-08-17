import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { NavItem, ViewType, UserSettings, Language } from '../types';
import { ValifiLogo, DashboardIcon, InvestmentsIcon, WalletIcon, BankIcon, PrivacyIcon, TaxIcon, ReferralsIcon, SettingsIcon, LogoutIcon, ExchangeIcon, P2PIcon, UserCheckIcon, InternalTransferIcon, CardIcon, LoanIcon, NftIcon, SearchIcon, PlusCircleIcon, ChevronDownIcon, GlobeIcon, PaletteIcon, NotificationIcon, MenuIcon, ChevronsLeftIcon, ChevronsRightIcon, CodeIcon } from './icons';
import { languageList } from '../i18n';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  unreadNotifications: number;
  onNotificationsClick: () => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileNav {...props} />
    </>
  );
};

// --- NAVIGATION DATA ---
const useNavGroups = () => {
  const { t } = useTranslation(['sidebar']);
  return useMemo(() => {
    const navGroups: { id: string; title: string; items: NavItem[] }[] = [
      { id: 'overview', title: t('group_overview'), items: [
          { id: 'dashboard', label: t('dashboard'), Icon: DashboardIcon },
          { id: 'investments', label: t('investments'), Icon: InvestmentsIcon },
          { id: 'nft', label: t('nft_gallery'), Icon: NftIcon, status: 'warning' },
      ]},
      { id: 'trading', title: t('group_trading'), items: [
          { id: 'exchange', label: t('exchange'), Icon: ExchangeIcon },
          { id: 'p2p', label: t('p2p_exchange'), Icon: P2PIcon, badge: 3 },
      ]},
      { id: 'money', title: t('group_money'), items: [
          { id: 'wallet', label: t('wallet'), Icon: WalletIcon },
          { id: 'internal-transfer', label: t('internal_transfer'), Icon: InternalTransferIcon },
          { id: 'banking', label: t('banking'), Icon: BankIcon },
          { id: 'cards', label: t('cards'), Icon: CardIcon },
      ]},
      { id: 'growth', title: t('group_growth'), items: [
          { id: 'loans', label: t('loans'), Icon: LoanIcon, status: 'danger' },
          { id: 'referrals', label: t('referrals'), Icon: ReferralsIcon },
      ]},
      { id: 'compliance', title: t('group_compliance'), items: [
          { id: 'kyc', label: t('kyc'), Icon: UserCheckIcon, status: 'good' },
          { id: 'privacy', label: t('privacy_hub'), Icon: PrivacyIcon },
          { id: 'tax', label: t('tax_center'), Icon: TaxIcon },
      ]},
      { id: 'developers', title: t('group_developers'), items: [
        { id: 'api_guide', label: t('api_guide'), Icon: CodeIcon },
      ]},
    ];
    return navGroups;
  }, [t]);
};


// --- DESKTOP SIDEBAR ---
const DesktopSidebar: React.FC<SidebarProps> = (props) => {
  const { userSettings, setUserSettings } = props;
  const isCollapsed = userSettings.settings.preferences.sidebarCollapsed ?? false;
  
  const handleToggleCollapse = () => {
    setUserSettings(s => ({
      ...s,
      settings: { ...s.settings, preferences: { ...s.settings.preferences, sidebarCollapsed: !s.settings.preferences.sidebarCollapsed } }
    }));
  };

  return (
    <aside className={`hidden lg:flex flex-col flex-shrink-0 sidebar-glass transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-[280px]'}`}>
      <div className={`h-20 flex items-center border-b border-border/50 shrink-0 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
         <a href="#" onClick={(e) => { e.preventDefault(); props.setCurrentView('dashboard'); }} className="flex items-center gap-3">
            <ValifiLogo className="w-9 h-9 text-primary" />
            <span className={`text-xl font-bold text-foreground tracking-tighter whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Valifi</span>
         </a>
      </div>
      
      <nav className="flex-1 flex flex-col p-3 gap-4 overflow-y-auto">
        <TopSection {...props} />
        <NavigationGroups {...props} />
      </nav>

      <div className="p-3 border-t border-border/50 shrink-0">
        <BottomSection onToggleCollapse={handleToggleCollapse} {...props} />
      </div>
    </aside>
  );
};

const TopSection: React.FC<SidebarProps> = (props) => {
    const { t } = useTranslation(['sidebar', 'common']);
    const isCollapsed = props.userSettings.settings.preferences.sidebarCollapsed;
    
    return (
        <div className="space-y-2">
            <div className="relative group">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                <input 
                  type="text" 
                  placeholder={t('search', { ns: 'common' })}
                  className={`w-full bg-secondary border-transparent rounded-lg py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                />
            </div>
            <QuickAdd {...props} />
        </div>
    );
};

const QuickAdd: React.FC<SidebarProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { t } = useTranslation('sidebar');
    const isCollapsed = props.userSettings.settings.preferences.sidebarCollapsed;
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuItems = [
        { label: t('add_funds'), action: props.onDepositClick },
        { label: t('invest'), action: () => props.setCurrentView('investments') },
        { label: t('swap'), action: () => props.setCurrentView('exchange') },
        { label: t('withdraw'), action: props.onWithdrawClick },
        { label: t('create_p2p'), action: () => props.setCurrentView('p2p') },
        { label: t('new_transfer'), action: () => props.setCurrentView('internal-transfer') },
    ];
    
    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setIsOpen(p => !p)} className={`w-full flex items-center justify-center gap-2.5 text-left py-2.5 rounded-lg font-semibold transition-all duration-200 text-sm bg-primary/10 text-primary hover:bg-primary/20 ${isCollapsed ? 'px-0' : 'px-4'}`}>
                <PlusCircleIcon className="w-5 h-5" />
                <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{t('quick_add')}</span>
            </button>
            {isOpen && (
                <div className={`absolute z-20 w-56 rounded-xl shadow-lg bg-popover border border-border p-2 animate-slide-up-fade ${isCollapsed ? 'bottom-0 left-full ml-2' : 'bottom-full mb-2'}`}>
                   {menuItems.map(item => (
                       <a href="#" key={item.label} onClick={(e) => { e.preventDefault(); handleAction(item.action); }} className="block w-full text-left px-3 py-2 rounded-md text-sm text-popover-foreground hover:bg-accent">{item.label}</a>
                   ))}
                </div>
            )}
        </div>
    );
};


const NavigationGroups: React.FC<SidebarProps> = (props) => {
    const navGroups = useNavGroups();
    return (
        <ul className="flex-1 space-y-1">
            {navGroups.map(group => <NavGroup key={group.id} group={group} {...props} />)}
        </ul>
    );
};

const NavGroup: React.FC<SidebarProps & { group: ReturnType<typeof useNavGroups>[0] }> = ({ group, userSettings, setUserSettings, isMobileMenuOpen, ...rest }) => {
    const isCollapsed = userSettings.settings.preferences.sidebarCollapsed;
    const openGroups = userSettings.settings.preferences.openNavGroups || [];
    const isOpen = openGroups.includes(group.id);
    
    const handleToggle = () => {
        const newOpenGroups = isOpen ? openGroups.filter(id => id !== group.id) : [...openGroups, group.id];
        setUserSettings(s => ({ ...s, settings: { ...s.settings, preferences: { ...s.settings.preferences, openNavGroups: newOpenGroups } } }));
    };

    return (
        <li className={isCollapsed ? 'relative group' : ''}>
            <button onClick={handleToggle} className={`w-full flex items-center justify-between text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-2 rounded-lg hover:bg-accent transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
                <span className={isCollapsed ? 'hidden' : ''}>{group.title}</span>
                {!isCollapsed && <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            </button>
            
            {isCollapsed && (
                <div className="absolute left-full top-0 ml-4 w-auto p-2 min-w-max rounded-md shadow-md bg-popover text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-50 border border-border">
                    <span className="text-popover-foreground">{group.title}</span>
                </div>
            )}
            
            <div className={`accordion-content mt-1 ${isCollapsed ? 'overflow-visible' : ''}`} data-state={isOpen && !isCollapsed ? 'open' : 'closed'}>
                <div className="overflow-hidden">
                    <ul className={`space-y-1 ${!isCollapsed && isOpen ? 'pl-2' : ''}`}>
                      {group.items.map((item) => (
                        <NavLink key={item.id} item={item} isCollapsed={isCollapsed!} {...rest} />
                      ))}
                    </ul>
                </div>
            </div>
        </li>
    );
};

const NavLink: React.FC<{ item: NavItem, isCollapsed: boolean, currentView: ViewType, setCurrentView: (v: ViewType) => void }> = ({ item, isCollapsed, currentView, setCurrentView }) => {
    const isActive = currentView === item.id;
    return (
      <li className="relative group/navitem">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setCurrentView(item.id); }}
          className={`relative flex items-center gap-3.5 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm group/link transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isCollapsed ? 'px-3 justify-center' : 'px-4'} ${isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
          aria-current={isActive ? 'page' : undefined}
        >
          {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary-foreground rounded-r-full"></div>}
          <item.Icon className={`w-5 h-5 flex-shrink-0 transition-colors drop-shadow-sm ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover/link:text-foreground'}`} />
          <span className={`tracking-wide whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0 absolute' : 'opacity-100'}`}>{item.label}</span>
          {item.badge && <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{item.badge}</span>}
          {item.status && !item.badge && (
              <span className={`ml-auto w-2 h-2 rounded-full ${
                  item.status === 'good' ? 'bg-success' : item.status === 'warning' ? 'bg-amber-400' : 'bg-destructive'
              }`}></span>
          )}
        </a>
        {isCollapsed && (
          <span className="absolute left-full ml-4 w-auto p-2 min-w-max rounded-md shadow-md text-popover-foreground bg-popover text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover/navitem:scale-100 z-50 border border-border">
              {item.label}
          </span>
        )}
      </li>
    );
};

const BottomSection: React.FC<SidebarProps & { onToggleCollapse: () => void }> = (props) => {
    const { userSettings, setUserSettings, setCurrentView, onNotificationsClick, unreadNotifications, onToggleCollapse } = props;
    const isCollapsed = userSettings.settings.preferences.sidebarCollapsed ?? false;
    const { t, i18n } = useTranslation(['sidebar', 'common', 'settings']);

    const handleLanguageChange = (lang: Language) => {
        i18n.changeLanguage(lang);
        setUserSettings(s => ({ ...s, settings: { ...s.settings, preferences: { ...s.settings.preferences, language: lang } } }));
    };

    return (
        <div className="space-y-2">
            <div onClick={() => setCurrentView('settings')} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-accent transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
                <img src={userSettings.profile.profilePhotoUrl} alt="User" className="w-10 h-10 rounded-full" />
                <div className={`transition-opacity duration-200 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                    <p className="font-semibold text-sm text-foreground truncate">{userSettings.profile.fullName}</p>
                    <p className="text-xs text-muted-foreground">{t('common:tier')}: {t('common:gold')}</p>
                </div>
            </div>
            <div className="flex items-center justify-around">
                <BottomIcon icon={NotificationIcon} badgeCount={unreadNotifications} onClick={onNotificationsClick} isCollapsed={isCollapsed} tooltip={t('notifications', { ns: 'header' })} />
                <BottomIcon icon={SettingsIcon} onClick={() => setCurrentView('settings')} isCollapsed={isCollapsed} tooltip={t('settings')} />
                <BottomIcon icon={isCollapsed ? ChevronsRightIcon : ChevronsLeftIcon} onClick={onToggleCollapse} isCollapsed={isCollapsed} tooltip={isCollapsed ? t('expand') : t('collapse')} />
            </div>
        </div>
    );
};

const BottomIcon: React.FC<{icon: React.FC<any>, badgeCount?: number, onClick: () => void, isCollapsed: boolean, tooltip: string}> = ({ icon: Icon, badgeCount = 0, onClick, isCollapsed, tooltip }) => (
    <div className="relative group">
        <button onClick={onClick} className="p-2.5 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors relative">
            <Icon className="w-5 h-5"/>
            {badgeCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex justify-center items-center text-[10px] font-bold text-primary-foreground rounded-full h-4 w-4 bg-primary">
                        {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                </span>
            )}
        </button>
        <span className={`absolute ${isCollapsed ? 'left-full ml-4' : 'bottom-full mb-2 left-1/2 -translate-x-1/2'} w-auto p-2 min-w-max rounded-md shadow-md text-popover-foreground bg-popover text-xs font-bold transition-all duration-100 scale-0 origin-left group-hover:scale-100 z-50 border border-border`}>
            {tooltip}
        </span>
    </div>
);


// --- MOBILE NAVIGATION ---
const MobileNav: React.FC<SidebarProps> = (props) => (
    <>
        <MobileBottomNav {...props} />
        <MobileMenuSheet isOpen={props.isMobileMenuOpen} onClose={props.onMobileMenuToggle} {...props} />
    </>
);

const MobileBottomNav: React.FC<SidebarProps> = ({ currentView, setCurrentView, onMobileMenuToggle }) => {
    const { t } = useTranslation('sidebar');
    const navItems: Pick<NavItem, 'id' | 'label' | 'Icon'>[] = useMemo(() => [
        { id: 'dashboard', label: t('dashboard'), Icon: DashboardIcon },
        { id: 'investments', label: t('investments'), Icon: InvestmentsIcon },
        { id: 'exchange', label: t('exchange'), Icon: ExchangeIcon },
        { id: 'wallet', label: t('wallet'), Icon: WalletIcon },
    ], [t]);

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bottom-nav-glass z-40">
            <div className="flex justify-around items-center h-full px-2">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex flex-col items-center justify-center gap-1.5 transition-colors p-2 rounded-lg w-16 ${currentView === item.id ? 'text-primary' : 'text-muted-foreground'}`}>
                        <item.Icon className="w-6 h-6" />
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                ))}
                <button onClick={onMobileMenuToggle} className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground p-2 rounded-lg w-16">
                    <MenuIcon className="w-6 h-6"/>
                    <span className="text-[10px] font-bold">More</span>
                </button>
            </div>
        </div>
    );
};

const MobileMenuSheet: React.FC<SidebarProps & { isOpen: boolean; onClose: () => void }> = (props) => {
    const { isOpen, onClose, ...rest } = props;
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    }, [onClose]);

    useEffect(() => {
        if(isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = '' };
    }, [isOpen]);

    if (!isOpen && !isClosing) return null;

    const navProps = { ...rest, userSettings: {...rest.userSettings, settings: {...rest.userSettings.settings, preferences: {...rest.userSettings.settings.preferences, sidebarCollapsed: false}}}, setCurrentView: (view: ViewType) => { rest.setCurrentView(view); handleClose(); } };
    
    return (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
            <div onClick={handleClose} className={`absolute inset-0 mobile-menu-sheet-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}></div>
            <div className={`absolute top-0 right-0 bottom-0 w-full max-w-xs sm:max-w-sm mobile-menu-sheet flex flex-col ${isClosing ? 'animate-slide-out-to-right' : 'animate-slide-in-from-right'}`}>
                 <div className="h-20 flex items-center justify-between px-4 border-b border-border shrink-0">
                    <a href="#" onClick={(e) => { e.preventDefault(); props.setCurrentView('dashboard'); handleClose(); }} className="flex items-center gap-3">
                        <ValifiLogo className="w-9 h-9 text-primary" />
                        <span className="text-xl font-bold text-foreground">Valifi</span>
                    </a>
                    <button onClick={handleClose} className="p-2 text-muted-foreground hover:text-foreground">
                        <ChevronsRightIcon className="w-6 h-6"/>
                    </button>
                 </div>
                 <nav className="flex-1 flex flex-col p-3 gap-4 overflow-y-auto">
                    <TopSection {...navProps} />
                    <NavigationGroups {...navProps} />
                 </nav>
                 <div className="p-3 border-t border-border shrink-0">
                    <BottomSection {...navProps} onToggleCollapse={() => {}} />
                 </div>
            </div>
        </div>
    );
};


export default Sidebar;