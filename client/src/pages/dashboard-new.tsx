import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Settings, Trash2, Layout as LayoutIcon, Save } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

import PortfolioWidget from "@/components/widgets/PortfolioWidget";
import MarketWidget from "@/components/widgets/MarketWidget";
import BotPerformanceWidget from "@/components/widgets/BotPerformanceWidget";
import TransactionsWidget from "@/components/widgets/TransactionsWidget";
import NewsWidget from "@/components/widgets/NewsWidget";
import NFTWidget from "@/components/widgets/NFTWidget";
import P2POrdersWidget from "@/components/widgets/P2POrdersWidget";

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  portfolio: PortfolioWidget,
  market: MarketWidget,
  bot_performance: BotPerformanceWidget,
  transactions: TransactionsWidget,
  news: NewsWidget,
  nft: NFTWidget,
  p2p_orders: P2POrdersWidget,
};

const DEFAULT_WIDGETS = [
  { 
    id: 'portfolio', 
    name: 'Portfolio Value', 
    type: 'portfolio',
    defaultLayout: { x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 }
  },
  { 
    id: 'market', 
    name: 'Market Prices', 
    type: 'market',
    defaultLayout: { x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 3 }
  },
  { 
    id: 'bot_performance', 
    name: 'Bot Performance', 
    type: 'bot_performance',
    defaultLayout: { x: 0, y: 4, w: 6, h: 4, minW: 4, minH: 3 }
  },
  { 
    id: 'transactions', 
    name: 'Recent Transactions', 
    type: 'transactions',
    defaultLayout: { x: 6, y: 4, w: 6, h: 4, minW: 4, minH: 3 }
  },
  { 
    id: 'news', 
    name: 'News Feed', 
    type: 'news',
    defaultLayout: { x: 0, y: 8, w: 6, h: 4, minW: 4, minH: 3 }
  },
  { 
    id: 'nft', 
    name: 'NFT Gallery', 
    type: 'nft',
    defaultLayout: { x: 6, y: 8, w: 6, h: 4, minW: 4, minH: 3 }
  },
  { 
    id: 'p2p_orders', 
    name: 'P2P Orders', 
    type: 'p2p_orders',
    defaultLayout: { x: 0, y: 12, w: 12, h: 4, minW: 6, minH: 3 }
  },
];

export default function DashboardNew() {
  const { toast } = useToast();
  const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<string[]>(
    DEFAULT_WIDGETS.slice(0, 4).map(w => w.id)
  );

  const { data: dashboardConfig } = useQuery({
    queryKey: ['/api/dashboard/config'],
  });

  const [layouts, setLayouts] = useState<{ lg: Layout[] }>({
    lg: DEFAULT_WIDGETS.slice(0, 4).map(w => ({
      i: w.id,
      ...w.defaultLayout
    }))
  });

  // Set active widgets from saved config
  useEffect(() => {
    if (dashboardConfig && typeof dashboardConfig === 'object' && 'layout' in dashboardConfig) {
      const config = dashboardConfig as { layout: Layout[] };
      if (config.layout && config.layout.length > 0) {
        const savedWidgetIds = config.layout.map((item: any) => item.i);
        setActiveWidgets(savedWidgetIds);
        setLayouts({ lg: config.layout });
      }
    }
  }, [dashboardConfig]);

  const saveMutation = useMutation({
    mutationFn: async (layout: Layout[]) => {
      return await apiRequest('/api/dashboard/config', 'POST', { layout });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/config'] });
      toast({
        title: "Dashboard Saved",
        description: "Your dashboard layout has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save dashboard layout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayouts({ lg: newLayout });
  };

  const handleSaveLayout = () => {
    saveMutation.mutate(layouts.lg);
  };

  const handleToggleWidget = (widgetId: string) => {
    setActiveWidgets(prev => {
      if (prev.includes(widgetId)) {
        return prev.filter(id => id !== widgetId);
      } else {
        const widget = DEFAULT_WIDGETS.find(w => w.id === widgetId);
        if (widget) {
          setLayouts(prevLayouts => ({
            lg: [
              ...prevLayouts.lg,
              { i: widgetId, ...widget.defaultLayout }
            ]
          }));
        }
        return [...prev, widgetId];
      }
    });
  };

  const handleRemoveWidget = (widgetId: string) => {
    setActiveWidgets(prev => prev.filter(id => id !== widgetId));
    setLayouts(prev => ({
      lg: prev.lg.filter(item => item.i !== widgetId)
    }));
  };

  const currentWidgets = useMemo(() => {
    return layouts.lg
      .filter(item => activeWidgets.includes(item.i))
      .map(item => {
        const widget = DEFAULT_WIDGETS.find(w => w.id === item.i);
        return {
          ...item,
          widget: widget,
        };
      });
  }, [layouts.lg, activeWidgets]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
            Custom Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalize your Kingdom experience with drag-and-drop widgets
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isWidgetDialogOpen} onOpenChange={setIsWidgetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-add-widget">
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Widget Catalog</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {DEFAULT_WIDGETS.map((widget) => (
                  <div 
                    key={widget.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    data-testid={`widget-option-${widget.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={activeWidgets.includes(widget.id)}
                        onCheckedChange={() => handleToggleWidget(widget.id)}
                        data-testid={`checkbox-widget-${widget.id}`}
                      />
                      <div>
                        <p className="font-medium">{widget.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {widget.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleSaveLayout}
            disabled={saveMutation.isPending}
            data-testid="button-save-layout"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Layout'}
          </Button>
        </div>
      </div>

      {currentWidgets.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <LayoutIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Widgets Added</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding widgets to customize your dashboard
            </p>
            <Button onClick={() => setIsWidgetDialogOpen(true)} data-testid="button-add-first-widget">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Widget
            </Button>
          </div>
        </Card>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          compactType="vertical"
          preventCollision={false}
          data-testid="grid-layout"
        >
          {currentWidgets.map((item) => {
            const WidgetComponent = WIDGET_COMPONENTS[item.widget?.type || ''];
            
            return (
              <div 
                key={item.i} 
                className="relative group"
                data-testid={`widget-container-${item.i}`}
              >
                <div className="absolute -top-2 -right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-6 w-6 rounded-full"
                    onClick={() => handleRemoveWidget(item.i)}
                    data-testid={`button-remove-${item.i}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="h-full">
                  {WidgetComponent ? (
                    <WidgetComponent />
                  ) : (
                    <Card className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">Widget not found</p>
                    </Card>
                  )}
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
