import React from 'react';
import { useTranslation } from 'react-i18next';
import { MenuIcon, NotificationIcon } from './icons';
import type { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  onMobileMenuToggle: () => void;
  unreadNotifications: number;
  onNotificationsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onMobileMenuToggle, unreadNotifications, onNotificationsClick }) => {
  const { t } = useTranslation(['sidebar', 'header', 'common']);
  
  const viewTitle = t(currentView.replace('-', '_') as any, { ns: 'sidebar', defaultValue: currentView.charAt(0).toUpperCase() + currentView.slice(1).replace('-', ' ') });

  return (
    <header className="bg-background/80 backdrop-blur-lg sticky top-0 z-20 border-b border-border h-20 flex-shrink-0">
      <div className="container mx-auto flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
            <button
                onClick={onMobileMenuToggle}
                className="lg:hidden text-muted-foreground hover:text-foreground p-2 -ml-2"
                aria-label={t('open_menu', { ns: 'common' })}
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{viewTitle}</h1>
        </div>
        
        <div className="flex items-center gap-4">
            <button
                onClick={onNotificationsClick}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent"
                aria-label={t('notifications', { ns: 'header' })}
            >
                <NotificationIcon className="w-6 h-6" />
                {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex justify-center items-center text-[10px] font-bold text-primary-foreground rounded-full h-5 w-5 bg-primary">
                            {unreadNotifications > 9 ? '9+' : unreadNotifications}
                        </span>
                    </span>
                )}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;