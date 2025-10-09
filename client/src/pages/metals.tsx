import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { insertMetalTradeSchema, type MetalInventory, type MetalTrade } from "@shared/schema";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Crown,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";

const tradeFormSchema = insertMetalTradeSchema.omit({ userId: true }).extend({
  metalType: z.enum(["gold", "silver", "platinum", "palladium"]),
  tradeType: z.enum(["buy", "sell"]),
  weight: z.coerce.number().positive("Weight must be positive"),
  pricePerOunce: z.coerce.number().positive("Price must be positive"),
});

type TradeForm = z.infer<typeof tradeFormSchema>;

interface MetalPrice {
  metal: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
}

export default function MetalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [metalPrices, setMetalPrices] = useState<Record<string, number>>({
    gold: 2050,
    silver: 24.5,
    platinum: 950,
    palladium: 1100,
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery<MetalInventory[]>({
    queryKey: ["/api/metals/inventory"],
    refetchInterval: 5000,
  });

  const { data: trades, isLoading: tradesLoading } = useQuery<MetalTrade[]>({
    queryKey: ["/api/metals/trades"],
    refetchInterval: 3000,
  });

  const form = useForm<TradeForm>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      metalType: "gold",
      tradeType: "buy",
      weight: 0,
      pricePerOunce: 0,
    },
  });

  const createTradeMutation = useMutation({
    mutationFn: async (data: TradeForm) => {
      const response = await fetch("/api/metals/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create trade");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metals/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metals/inventory"] });
      toast({
        title: "Trade Executed",
        description: "Precious metals trade completed successfully",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Trade Failed",
        description: error.message,
      });
    },
  });

  // Calculate stats
  const totalInventory = inventory?.reduce((sum, i) => sum + Number(i.weight || 0), 0) || 0;
  const totalValue = inventory?.reduce((sum, i) => sum + Number(i.currentValue || 0), 0) || 0;
  const totalTrades = trades?.length || 0;
  const buyTrades = trades?.filter(t => t.tradeType === "buy").length || 0;
  const sellTrades = trades?.filter(t => t.tradeType === "sell").length || 0;

  // Fetch real-time metal prices
  useEffect(() => {
    const fetchMetalPrices = async () => {
      try {
        const metals = ["gold", "silver", "platinum", "palladium"];
        const pricePromises = metals.map(async (metal) => {
          const response = await fetch(`/api/market/metal/${metal}`);
          if (response.ok) {
            const data = await response.json();
            return { metal, price: data.price };
          }
          return null;
        });
        
        const results = await Promise.all(pricePromises);
        const prices: Record<string, number> = {};
        results.forEach(result => {
          if (result) prices[result.metal] = result.price;
        });
        
        if (Object.keys(prices).length > 0) {
          setMetalPrices(prices);
        }
      } catch (error) {
        console.error("Error fetching metal prices:", error);
      }
    };

    fetchMetalPrices();
    const interval = setInterval(fetchMetalPrices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <Coins className="h-8 w-8" />
            Metals & Gold Trading
          </h1>
          <p className="text-muted-foreground mt-1">
            Precious metals marketplace with real-time pricing
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2" data-testid="button-create-trade">
              <ShoppingCart className="h-4 w-4" />
              New Trade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Execute Metals Trade</DialogTitle>
              <DialogDescription>
                Buy or sell precious metals at market prices
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createTradeMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tradeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trade Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-trade-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="buy">Buy</SelectItem>
                            <SelectItem value="sell">Sell</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metalType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metal Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-metal-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="silver">Silver</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                            <SelectItem value="palladium">Palladium</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (oz)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            data-testid="input-weight"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricePerOunce"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Ounce (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            data-testid="input-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">Current Market Prices</p>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Gold</p>
                      <p className="font-mono">${metalPrices.gold}/oz</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Silver</p>
                      <p className="font-mono">${metalPrices.silver}/oz</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Platinum</p>
                      <p className="font-mono">${metalPrices.platinum}/oz</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Palladium</p>
                      <p className="font-mono">${metalPrices.palladium}/oz</p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createTradeMutation.isPending}
                  data-testid="button-submit-trade"
                >
                  {createTradeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Execute Trade
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-inventory">
              {totalInventory.toFixed(2)} oz
            </div>
            <p className="text-xs text-muted-foreground">All precious metals</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold covenant-gradient-text" data-testid="text-total-value">
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Current market value</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buy Trades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500" data-testid="text-buy-trades">{buyTrades}</div>
            <p className="text-xs text-muted-foreground">Purchase transactions</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sell Trades</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500" data-testid="text-sell-trades">{sellTrades}</div>
            <p className="text-xs text-muted-foreground">Sale transactions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory</TabsTrigger>
          <TabsTrigger value="trades" data-testid="tab-trades">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {inventoryLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading inventory...</p>
              </CardContent>
            </Card>
          ) : !inventory || inventory.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No metals in inventory</p>
                <p className="text-xs text-muted-foreground mt-1">Execute your first trade to build your portfolio</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {inventory.map((item) => (
                <Card key={item.id} className="hover-elevate" data-testid={`card-inventory-${item.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2" data-testid={`text-metal-${item.id}`}>
                        <Crown className="h-5 w-5 text-yellow-500" />
                        {item.metalType?.toUpperCase()}
                      </CardTitle>
                      <Badge variant="outline">{item.storageLocation || 'Vault'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-mono font-semibold" data-testid={`text-weight-${item.id}`}>
                          {Number(item.weight || 0).toFixed(4)} oz
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Purchase Price</p>
                        <p className="font-mono" data-testid={`text-purchase-price-${item.id}`}>
                          ${Number(item.purchasePrice || 0).toFixed(2)}/oz
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                      <p className="text-lg font-bold covenant-gradient-text" data-testid={`text-value-${item.id}`}>
                        ${Number(item.currentValue || 0).toLocaleString()}
                      </p>
                    </div>
                    {item.certificateNumber && (
                      <p className="text-xs text-muted-foreground" data-testid={`text-cert-${item.id}`}>
                        Certificate: {item.certificateNumber}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          {tradesLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading trades...</p>
              </CardContent>
            </Card>
          ) : !trades || trades.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No trades executed yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {trades.map((trade) => (
                <Card key={trade.id} className="hover-elevate" data-testid={`card-trade-${trade.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${trade.tradeType === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                          {trade.tradeType === 'buy' ? (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold" data-testid={`text-trade-metal-${trade.id}`}>
                            {trade.metalType?.toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground" data-testid={`text-trade-date-${trade.id}`}>
                            {new Date(trade.createdAt!).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={trade.tradeType === 'buy' ? 'default' : 'destructive'} data-testid={`badge-type-${trade.id}`}>
                          {trade.tradeType?.toUpperCase()}
                        </Badge>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-mono" data-testid={`text-trade-weight-${trade.id}`}>
                            {Number(trade.weight || 0).toFixed(4)} oz
                          </p>
                          <p className="text-sm font-mono text-muted-foreground" data-testid={`text-trade-price-${trade.id}`}>
                            ${Number(trade.pricePerOunce || 0).toFixed(2)}/oz
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
