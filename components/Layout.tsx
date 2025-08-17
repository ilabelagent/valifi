import React, { useRef, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import WalletConnectModal from './WalletConnectModal';
import ImportSeedPhraseModal from './ImportSeedPhraseModal';
import WalletConnectQRModal from './WalletConnectQRModal';
import NotificationPanel from './NotificationPanel';
import ValifiCoPilot from './ValifiCoPilot';
import type { ViewType, Notification, UserActivity, NewsItem, UserSettings, Portfolio } from '../types';
import * as apiService from '../services/api';


interface LayoutProps {
  children: React.ReactNode;
  portfolio: Portfolio;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  onTransferToMain: (assetId: string) => void;
  isLiveUpdating: boolean;
  setIsLiveUpdating: (isUpdating: boolean) => void;
  isWalletConnectOpen: boolean;
  setIsWalletConnectOpen: (isOpen: boolean) => void;
  isWalletConnectQRModalOpen: boolean;
  setWalletConnectQRModalOpen: (isOpen: boolean) => void;
  isImportSeedPhraseModalOpen: boolean;
  setImportSeedPhraseModalOpen: (isOpen: boolean) => void;
  importSource: string;
  setImportSource: (source: any) => void;
  notifications: Notification[];
  userActivity: UserActivity[];
  newsItems: NewsItem[];
  isNotificationsOpen: boolean;
  setNotificationsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Layout: React.FC<LayoutProps> = (props) => {
  const { 
    children, 
    portfolio,
    currentView, 
    setCurrentView,
    notifications,
    isNotificationsOpen,
    setNotificationsOpen,
    userSettings,
    setUserSettings,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = props;
  
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isNotificationsOpen && notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) {
        const bellButton = document.querySelector('[aria-label="Notifications"]');
        if (bellButton && bellButton.contains(event.target as Node)) {
          return;
        }
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationsOpen, setNotificationsOpen]);
  
  // Close mobile menu on view change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView, setIsMobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        userSettings={userSettings}
        setUserSettings={setUserSettings}
        unreadNotifications={unreadCount}
        onNotificationsClick={() => setNotificationsOpen(prev => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
        {...props}
      />
      <div className="flex-1 flex flex-col relative min-w-0">
        <Header 
          currentView={currentView} 
          onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
          unreadNotifications={unreadCount}
          onNotificationsClick={() => setNotificationsOpen(prev => !prev)}
        />
        <main className="flex-1 overflow-y-auto">
          <div key={currentView}>
            {children}
          </div>
        </main>
        <NotificationPanel
            ref={notificationPanelRef}
            isOpen={isNotificationsOpen}
            {...props}
        />
        <ValifiCoPilot
            portfolio={portfolio}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onTransferToMain={props.onTransferToMain}
            userSettings={userSettings}
            onDepositClick={props.onDepositClick}
            api={apiService.callCoPilot}
        />
      </div>
      <WalletConnectModal 
        isOpen={props.isWalletConnectOpen} 
        onClose={() => props.setIsWalletConnectOpen(false)}
        onOpenQR={() => props.setWalletConnectQRModalOpen(true)}
        onOpenSeedImport={(source) => {
            props.setImportSource(source);
            props.setImportSeedPhraseModalOpen(true);
        }}
      />
       <WalletConnectQRModal 
        isOpen={props.isWalletConnectQRModalOpen} 
        onClose={() => props.setWalletConnectQRModalOpen(false)} 
      />
      <ImportSeedPhraseModal
        isOpen={props.isImportSeedPhraseModalOpen}
        onClose={() => props.setImportSeedPhraseModalOpen(false)}
        walletName={props.importSource}
      />
    </div>
  );
};

export default Layout;