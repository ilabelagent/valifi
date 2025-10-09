// Valifi Kingdom Platform - blueprint: javascript_log_in_with_replit
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import TradingPage from "@/pages/trading";
import TerminalPage from "@/pages/terminal";
import BlockchainPage from "@/pages/blockchain";
import AgentsPage from "@/pages/agents";
import PublishingPage from "@/pages/publishing";
import SecurityPage from "@/pages/security";
import PaymentsPage from "@/pages/payments";
import KycPage from "@/pages/kyc";
import QuantumPage from "@/pages/quantum";
import ExchangePage from "@/pages/exchange";
import TradingBotsPage from "@/pages/trading-bots";
import MixerPage from "@/pages/mixer";
import CommunityPage from "@/pages/community";
import ChatPage from "@/pages/chat";
import MetalsPage from "@/pages/metals";
import PreciousMetalsPage from "@/pages/precious-metals";
import NewsPage from "@/pages/news";
import P2PPage from "@/pages/p2p";
import FinancialServicesPage from "@/pages/financial-services";
import StocksPage from "@/pages/stocks";
import ForexPage from "@/pages/forex";
import BondsPage from "@/pages/bonds";
import RetirementPage from "@/pages/retirement";
import AdvancedTradingPage from "@/pages/advanced-trading";
import WalletSecurityPage from "@/pages/wallet-security";
import AnalyticsIntelligencePage from "@/pages/analytics-intelligence";
import AdminPage from "@/pages/admin";
import WalletConnectPage from "@/pages/wallet-connect";
import TWinnPage from "@/pages/twinn";
import DashboardNewPage from "@/pages/dashboard-new";
import BotMarketplace from "@/pages/bot-marketplace";
import CelebrityPlatform from "@/pages/celebrity-platform";
import SpectrumPlansPage from "@/pages/spectrum-plans";
import AssetsPage from "@/pages/assets";
import PrayerCenterPage from "@/pages/prayer-center";
import TithingPage from "@/pages/tithing";
import EtherealElementsPage from "@/pages/ethereal-elements";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/terminal" component={TerminalPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.firstName} {user?.lastName}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/api/logout")}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard-new" component={DashboardNewPage} />
              <Route path="/exchange" component={ExchangePage} />
              <Route path="/trading-bots" component={TradingBotsPage} />
              <Route path="/financial-services" component={FinancialServicesPage} />
              <Route path="/advanced-trading" component={AdvancedTradingPage} />
              <Route path="/mixer" component={MixerPage} />
              <Route path="/wallet-security" component={WalletSecurityPage} />
              <Route path="/analytics-intelligence" component={AnalyticsIntelligencePage} />
              <Route path="/community" component={CommunityPage} />
              <Route path="/chat" component={ChatPage} />
              <Route path="/metals" component={MetalsPage} />
              <Route path="/precious-metals" component={PreciousMetalsPage} />
              <Route path="/stocks" component={StocksPage} />
              <Route path="/forex" component={ForexPage} />
              <Route path="/bonds" component={BondsPage} />
              <Route path="/retirement" component={RetirementPage} />
              <Route path="/news" component={NewsPage} />
              <Route path="/trading" component={TradingPage} />
              <Route path="/terminal" component={TerminalPage} />
              <Route path="/blockchain" component={BlockchainPage} />
              <Route path="/agents" component={AgentsPage} />
              <Route path="/publishing" component={PublishingPage} />
              <Route path="/security" component={SecurityPage} />
              <Route path="/payments" component={PaymentsPage} />
              <Route path="/p2p" component={P2PPage} />
              <Route path="/kyc" component={KycPage} />
              <Route path="/quantum" component={QuantumPage} />
              <Route path="/wallet-connect" component={WalletConnectPage} />
              <Route path="/twinn" component={TWinnPage} />
              <Route path="/celebrity-platform" component={CelebrityPlatform} />
              <Route path="/bot-marketplace" component={BotMarketplace} />
              <Route path="/spectrum-plans" component={SpectrumPlansPage} />
              <Route path="/assets" component={AssetsPage} />
              <Route path="/prayer-center" component={PrayerCenterPage} />
              <Route path="/tithing" component={TithingPage} />
              <Route path="/ethereal-elements" component={EtherealElementsPage} />
              <Route path="/admin" component={AdminPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
