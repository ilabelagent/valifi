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

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
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
              <Route path="/trading" component={TradingPage} />
              <Route path="/blockchain" component={() => <div className="p-6">Blockchain coming soon...</div>} />
              <Route path="/agents" component={() => <div className="p-6">Agents coming soon...</div>} />
              <Route path="/publishing" component={() => <div className="p-6">Publishing coming soon...</div>} />
              <Route path="/security" component={() => <div className="p-6">Security coming soon...</div>} />
              <Route path="/payments" component={() => <div className="p-6">Payments coming soon...</div>} />
              <Route path="/kyc" component={() => <div className="p-6">KYC coming soon...</div>} />
              <Route path="/quantum" component={() => <div className="p-6">Quantum coming soon...</div>} />
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
