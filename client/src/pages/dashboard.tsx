import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Save, LayoutGrid, Trash2, Loader2, GripVertical, Wallet, TrendingUp, Image, Coins, Bot, ArrowRightLeft, Users, Gem } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { PortfolioOverview } from "@/components/dashboard-widgets/PortfolioOverview";
import { TradingBotStatus } from "@/components/dashboard-widgets/TradingBotStatus";
import { LiveMarketPrices } from "@/components/dashboard-widgets/LiveMarketPrices";
import { RecentTransactions } from "@/components/dashboard-widgets/RecentTransactions";
import { NewsFeeds } from "@/components/dashboard-widgets/NewsFeeds";
import { PerformanceCharts } from "@/components/dashboard-widgets/PerformanceCharts";

const WIDGET_COMPONENTS: Record<string, any> = {
  'portfolio-overview': PortfolioOverview,
  'trading-bot-status': TradingBotStatus,
  'live-market-prices': LiveMarketPrices,
  'recent-transactions': RecentTransactions,
  'news-feeds': NewsFeeds,
  'performance-charts': PerformanceCharts,
};

const DEFAULT_WIDGETS = [
  { 
    id: 'portfolio-overview', 
    name: 'Portfolio Overview', 
    type: 'stats',
    description: 'Total balance and profit/loss tracking',
    icon: 'wallet',
    defaultSize: { w: 4, h: 2 }
  },
  { 
    id: 'trading-bot-status', 
    name: 'Trading Bot Status', 
    type: 'stats',
    description: 'Active bots and win rates',
    icon: 'bot',
    defaultSize: { w: 4, h: 2 }
  },
  { 
    id: 'live-market-prices', 
    name: 'Live Market Prices', 
    type: 'market',
    description: 'Real-time crypto and stock prices',
    icon: 'trending-up',
    defaultSize: { w: 4, h: 2 }
  },
  { 
    id: 'recent-transactions', 
    name: 'Recent Transactions', 
    type: 'activity',
    description: 'Latest 10 transactions',
    icon: 'clock',
    defaultSize: { w: 6, h: 3 }
  },
  { 
    id: 'news-feeds', 
    name: 'News Feeds', 
    type: 'news',
    description: 'Jesus Cartel releases and market news',
    icon: 'newspaper',
    defaultSize: { w: 6, h: 3 }
  },
  { 
    id: 'performance-charts', 
    name: 'Performance Charts', 
    type: 'chart',
    description: 'Historical profit visualization',
    icon: 'activity',
    defaultSize: { w: 12, h: 3 }
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [layout, setLayout] = useState<Layout[]>([]);
  const [activeWidgets, setActiveWidgets] = useState<string[]>([]);
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false);

  const { data: dashboardConfig, isLoading: configLoading } = useQuery({
    queryKey: ["/api/dashboard/config"],
  });

  const { data: preferences, isLoading: prefsLoading } = useQuery({
    queryKey: ["/api/dashboard/preferences"],
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      return await apiRequest("/api/dashboard/config", {
        method: "POST",
        body: JSON.stringify(config),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/config"] });
      toast({
        title: "Dashboard Saved",
        description: "Your dashboard layout has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save dashboard configuration.",
        variant: "destructive",
      });
    },
  });

  const savePreferenceMutation = useMutation({
    mutationFn: async (pref: any) => {
      return await apiRequest("/api/dashboard/preferences", {
        method: "POST",
        body: JSON.stringify(pref),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/preferences"] });
    },
  });

  const deletePreferenceMutation = useMutation({
    mutationFn: async (widgetId: string) => {
      return await apiRequest(`/api/dashboard/preferences/${widgetId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/preferences"] });
    },
  });

  useEffect(() => {
    if (dashboardConfig?.layout) {
      setLayout(dashboardConfig.layout);
    } else {
      const defaultLayout: Layout[] = DEFAULT_WIDGETS.slice(0, 4).map((widget, index) => ({
        i: widget.id,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 2,
        w: widget.defaultSize.w,
        h: widget.defaultSize.h,
      }));
      setLayout(defaultLayout);
    }

    if (preferences && Array.isArray(preferences)) {
      const activeIds = preferences
        .filter((p: any) => p.isVisible)
        .map((p: any) => p.widgetId || p.widget?.id)
        .filter(Boolean);
      setActiveWidgets(activeIds);
    } else {
      setActiveWidgets(DEFAULT_WIDGETS.slice(0, 4).map(w => w.id));
    }
  }, [dashboardConfig, preferences]);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  const handleSaveLayout = () => {
    saveConfigMutation.mutate({
      layout,
      theme: "dark",
      preferences: { activeWidgets },
    });
  };

  const handleAddWidget = (widgetId: string) => {
    if (activeWidgets.includes(widgetId)) {
      toast({
        title: "Widget Already Added",
        description: "This widget is already on your dashboard.",
        variant: "destructive",
      });
      return;
    }

    const widget = DEFAULT_WIDGETS.find(w => w.id === widgetId);
    if (!widget) return;

    const newLayout: Layout = {
      i: widgetId,
      x: 0,
      y: Infinity,
      w: widget.defaultSize.w,
      h: widget.defaultSize.h,
    };

    setLayout([...layout, newLayout]);
    setActiveWidgets([...activeWidgets, widgetId]);

    savePreferenceMutation.mutate({
      widgetId,
      position: newLayout,
      config: {},
      isVisible: true,
    });

    setIsWidgetLibraryOpen(false);
    toast({
      title: "Widget Added",
      description: `${widget.name} has been added to your dashboard.`,
    });
  };

  const handleRemoveWidget = (widgetId: string) => {
    setLayout(layout.filter(l => l.i !== widgetId));
    setActiveWidgets(activeWidgets.filter(id => id !== widgetId));
    deletePreferenceMutation.mutate(widgetId);

    toast({
      title: "Widget Removed",
      description: "Widget has been removed from your dashboard.",
    });
  };

  if (configLoading || prefsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Kingdom Dashboard</h2>
            <p className="text-muted-foreground">
              Customize your command center with drag-and-drop widgets
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Sheet open={isWidgetLibraryOpen} onOpenChange={setIsWidgetLibraryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" data-testid="button-widget-library">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Widget
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Widget Library</SheetTitle>
                  <SheetDescription>
                    Add widgets to your dashboard
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
                  <div className="space-y-3">
                    {DEFAULT_WIDGETS.map((widget) => {
                      const isActive = activeWidgets.includes(widget.id);
                      return (
                        <Card key={widget.id} className="relative">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">{widget.name}</CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  {widget.description}
                                </CardDescription>
                              </div>
                              {isActive && (
                                <Badge variant="secondary" className="ml-2">Active</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Button 
                              size="sm" 
                              onClick={() => handleAddWidget(widget.id)}
                              disabled={isActive}
                              className="w-full"
                              data-testid={`button-add-widget-${widget.id}`}
                            >
                              {isActive ? 'Already Added' : 'Add to Dashboard'}
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <Button onClick={handleSaveLayout} disabled={saveConfigMutation.isPending} data-testid="button-save-layout">
              <Save className="mr-2 h-4 w-4" />
              {saveConfigMutation.isPending ? 'Saving...' : 'Save Layout'}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access common features quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => setLocation("/blockchain")}
                data-testid="button-dashboard-quick-wallet"
              >
                <Wallet className="w-6 h-6" />
                <span className="text-sm font-medium">Create Wallet</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => setLocation("/trading")}
                data-testid="button-dashboard-quick-trade"
              >
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm font-medium">Quick Trade</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => setLocation("/blockchain")}
                data-testid="button-dashboard-quick-mint"
              >
                <Image className="w-6 h-6" />
                <span className="text-sm font-medium">Mint NFT</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => setLocation("/spectrum-plans")}
                data-testid="button-dashboard-quick-stake"
              >
                <Coins className="w-6 h-6" />
                <span className="text-sm font-medium">Stake</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => setLocation("/metals")}
                data-testid="button-dashboard-quick-gold"
              >
                <Gem className="w-6 h-6" />
                <span className="text-sm font-medium">Buy Gold</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => setLocation("/trading-bots")}
                data-testid="button-dashboard-quick-bot"
              >
                <Bot className="w-6 h-6" />
                <span className="text-sm font-medium">Deploy Bot</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => setLocation("/p2p")}
                data-testid="button-dashboard-quick-p2p"
              >
                <Users className="w-6 h-6" />
                <span className="text-sm font-medium">P2P Trade</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={() => setLocation("/exchange")}
                data-testid="button-dashboard-quick-exchange"
              >
                <ArrowRightLeft className="w-6 h-6" />
                <span className="text-sm font-medium">Exchange</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          <GridLayout
            className="layout"
            layout={layout}
            onLayoutChange={handleLayoutChange}
            cols={12}
            rowHeight={100}
            width={1200}
            isDraggable={true}
            isResizable={true}
            compactType="vertical"
            preventCollision={false}
            draggableHandle=".drag-handle"
          >
            {activeWidgets.map((widgetId) => {
              const WidgetComponent = WIDGET_COMPONENTS[widgetId];
              if (!WidgetComponent) return null;

              return (
                <div key={widgetId} className="relative group" data-testid={`widget-container-${widgetId}`}>
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 drag-handle cursor-move"
                      data-testid={`button-drag-${widgetId}`}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 bg-destructive/10 hover:bg-destructive/20"
                      onClick={() => handleRemoveWidget(widgetId)}
                      data-testid={`button-remove-${widgetId}`}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <WidgetComponent />
                </div>
              );
            })}
          </GridLayout>
        </div>

        {activeWidgets.length === 0 && (
          <Card className="mt-8">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Widgets Added</h3>
              <p className="text-muted-foreground mb-4">Start by adding widgets to your dashboard</p>
              <Button onClick={() => setIsWidgetLibraryOpen(true)} data-testid="button-add-first-widget">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Widget
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
