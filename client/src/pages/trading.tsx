import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { insertTradingBotSchema, type TradingBot, type BotExecution } from "@shared/schema";
import { Bot, TrendingUp, TrendingDown, Play, Pause, Square, Plus, Activity, DollarSign, Target, BarChart3, RefreshCw, ArrowUpDown, Filter, ShoppingCart, Heart, BookOpen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { io, Socket } from "socket.io-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const strategies = [
  { value: "grid", label: "Grid Trading", description: "Buy low, sell high in a range" },
  { value: "dca", label: "DCA", description: "Dollar cost averaging" },
  { value: "arbitrage", label: "Arbitrage", description: "Cross-exchange opportunities" },
  { value: "scalping", label: "Scalping", description: "Quick small profits" },
  { value: "market_making", label: "Market Making", description: "Provide liquidity" },
  { value: "momentum_ai", label: "Momentum AI", description: "AI-powered trend following" },
  { value: "mev", label: "MEV", description: "Maximal extractable value" },
];

const exchanges = [
  { value: "binance", label: "Binance" },
  { value: "bybit", label: "Bybit" },
  { value: "kucoin", label: "KuCoin" },
  { value: "okx", label: "OKX" },
  { value: "coinbase", label: "Coinbase" },
];

const marketAssets = [
  { symbol: "BTC/USDT", type: "crypto", name: "Bitcoin" },
  { symbol: "ETH/USDT", type: "crypto", name: "Ethereum" },
  { symbol: "AAPL", type: "stock", name: "Apple Inc." },
  { symbol: "TSLA", type: "stock", name: "Tesla Inc." },
  { symbol: "EUR/USD", type: "forex", name: "Euro/US Dollar" },
  { symbol: "gold", type: "metal", name: "Gold" },
  { symbol: "silver", type: "metal", name: "Silver" },
];

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

const tradeOrderSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["market", "limit"]),
  quantity: z.string().min(1, "Quantity is required"),
  price: z.string().optional(),
});

type TradeOrderFormValues = z.infer<typeof tradeOrderSchema>;

const createBotFormSchema = insertTradingBotSchema.omit({ userId: true }).extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  riskLimit: z.string().min(1, "Risk limit is required"),
  dailyLimit: z.string().min(1, "Daily limit is required"),
  config: z.object({
    gridLevels: z.number().optional(),
    gridSpacing: z.number().optional(),
    dcaInterval: z.number().optional(),
    dcaAmount: z.number().optional(),
    slippage: z.number().optional(),
    maxPositionSize: z.number().optional(),
  }).optional(),
});

type CreateBotFormValues = z.infer<typeof createBotFormSchema>;

export default function TradingPage() {
  const { toast } = useToast();
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [controlDialogOpen, setControlDialogOpen] = useState(false);
  const [controlAction, setControlAction] = useState<"start" | "pause" | "stop">("start");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [filterBot, setFilterBot] = useState<string>("all");
  const [filterStrategy, setFilterStrategy] = useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC/USDT");
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>({ bids: [], asks: [] });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [prayerDialogOpen, setPrayerDialogOpen] = useState(false);
  const [pendingTradeData, setPendingTradeData] = useState<TradeOrderFormValues | null>(null);
  const [prayerText, setPrayerText] = useState("");
  const [currentPrayerId, setCurrentPrayerId] = useState<string | null>(null);

  const { data: bots, isLoading: botsLoading } = useQuery<TradingBot[]>({
    queryKey: ["/api/trading-bots"],
  });

  const { data: allExecutions, isLoading: executionsLoading } = useQuery<BotExecution[]>({
    queryKey: ["/api/bot-executions"],
  });

  const { data: exchangeOrders } = useQuery({
    queryKey: ["/api/exchange/orders"],
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const executions = allExecutions?.filter(ex => {
    if (filterBot !== "all" && ex.botId !== filterBot) return false;
    if (filterStrategy !== "all" && ex.strategy !== filterStrategy) return false;
    return true;
  });

  const form = useForm<CreateBotFormValues>({
    resolver: zodResolver(createBotFormSchema),
    defaultValues: {
      name: "",
      strategy: "grid",
      exchange: "binance",
      tradingPair: "BTC/USDT",
      isActive: false,
      config: {},
      riskLimit: "100",
      dailyLimit: "500",
    },
  });

  const tradeForm = useForm<TradeOrderFormValues>({
    resolver: zodResolver(tradeOrderSchema),
    defaultValues: {
      symbol: selectedAsset,
      side: "buy",
      type: "market",
      quantity: "",
      price: "",
    },
  });

  const createBotMutation = useMutation({
    mutationFn: async (data: CreateBotFormValues) => {
      const res = await apiRequest("POST", "/api/trading-bots", {
        ...data,
        config: data.config || {},
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trading-bots"] });
      setCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Bot Created",
        description: "Your trading bot has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create bot",
        variant: "destructive",
      });
    },
  });

  const controlBotMutation = useMutation({
    mutationFn: async ({ botId, action }: { botId: string; action: "start" | "pause" | "stop" }) => {
      const res = await apiRequest("PATCH", `/api/trading-bots/${botId}`, {
        isActive: action === "start",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trading-bots"] });
      setControlDialogOpen(false);
      toast({
        title: "Bot Updated",
        description: `Bot has been ${controlAction === "start" ? "started" : controlAction === "pause" ? "paused" : "stopped"}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to control bot",
        variant: "destructive",
      });
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (data: TradeOrderFormValues) => {
      const res = await apiRequest("POST", "/api/exchange/orders", {
        symbol: data.symbol,
        side: data.side.toUpperCase(),
        type: data.type.toUpperCase(),
        quantity: parseFloat(data.quantity),
        price: data.price ? parseFloat(data.price) : undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchange/orders"] });
      setTradeDialogOpen(false);
      tradeForm.reset();
      toast({
        title: "Order Placed",
        description: "Your order has been placed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const newSocket = io({
      path: "/socket.io",
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      newSocket.emit("subscribe:trading");
    });

    newSocket.on("trading:event", (event) => {
      console.log("Trading event:", event);
      queryClient.invalidateQueries({ queryKey: ["/api/trading-bots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bot-executions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exchange/orders"] });
    });

    newSocket.on("market:update", (data: MarketData) => {
      setMarketData(prev => ({ ...prev, [data.symbol]: data }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchMarketData = async () => {
      for (const asset of marketAssets) {
        try {
          let endpoint = "";
          if (asset.type === "stock") {
            endpoint = `/api/market/stock/${asset.symbol}`;
          } else if (asset.type === "forex") {
            endpoint = `/api/market/forex/${asset.symbol}`;
          } else if (asset.type === "metal") {
            endpoint = `/api/market/metal/${asset.symbol}`;
          } else if (asset.type === "crypto") {
            endpoint = `/api/market/stock/BTC`;
          }

          if (endpoint) {
            const res = await fetch(endpoint);
            const data = await res.json();
            setMarketData(prev => ({ ...prev, [asset.symbol]: data }));
          }
        } catch (error) {
          console.error(`Error fetching ${asset.symbol}:`, error);
        }
      }
    };

    fetchMarketData();
    const interval = autoRefresh ? setInterval(fetchMarketData, 10000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    const generateOrderBook = () => {
      const currentPrice = marketData[selectedAsset]?.price || 50000;
      const bids: OrderBookEntry[] = [];
      const asks: OrderBookEntry[] = [];

      for (let i = 0; i < 15; i++) {
        const bidPrice = currentPrice - (i + 1) * (currentPrice * 0.001);
        const askPrice = currentPrice + (i + 1) * (currentPrice * 0.001);
        const bidQty = Math.random() * 2 + 0.1;
        const askQty = Math.random() * 2 + 0.1;

        bids.push({
          price: parseFloat(bidPrice.toFixed(2)),
          quantity: parseFloat(bidQty.toFixed(4)),
          total: parseFloat((bidPrice * bidQty).toFixed(2)),
        });

        asks.push({
          price: parseFloat(askPrice.toFixed(2)),
          quantity: parseFloat(askQty.toFixed(4)),
          total: parseFloat((askPrice * askQty).toFixed(2)),
        });
      }

      setOrderBook({ bids, asks });
    };

    generateOrderBook();
    const interval = setInterval(generateOrderBook, 3000);

    return () => clearInterval(interval);
  }, [selectedAsset, marketData]);

  const activeBots = bots?.filter(bot => bot.isActive) || [];
  const totalProfit = bots?.reduce((sum, bot) => sum + parseFloat(bot.totalProfit || "0"), 0) || 0;
  const totalLoss = bots?.reduce((sum, bot) => sum + parseFloat(bot.totalLoss || "0"), 0) || 0;
  const netPnL = totalProfit - totalLoss;
  const avgWinRate = bots && bots.length > 0 
    ? bots.reduce((sum, bot) => sum + parseFloat(bot.winRate || "0"), 0) / bots.length 
    : 0;

  const handleControlBot = (botId: string, action: "start" | "pause" | "stop") => {
    setSelectedBot(botId);
    setControlAction(action);
    setControlDialogOpen(true);
  };

  const confirmControl = () => {
    if (selectedBot) {
      controlBotMutation.mutate({ botId: selectedBot, action: controlAction });
    }
  };

  const onSubmit = (data: CreateBotFormValues) => {
    createBotMutation.mutate(data);
  };

  const equityData = executions?.map((ex, idx) => ({
    name: `Trade ${idx + 1}`,
    value: parseFloat(ex.profit || "0"),
    cumulative: executions.slice(0, idx + 1).reduce((sum, e) => sum + parseFloat(e.profit || "0"), 0),
  })) || [];

  const onSubmitTrade = (data: TradeOrderFormValues) => {
    setPendingTradeData(data);
    setTradeDialogOpen(false);
    setPrayerDialogOpen(true);
  };

  const logPrayerMutation = useMutation({
    mutationFn: async (prayerData: { prayerText: string; category: string }) => {
      const res = await apiRequest("POST", "/api/prayers", prayerData);
      return res.json();
    },
    onSuccess: (prayer) => {
      setCurrentPrayerId(prayer.id);
    },
  });

  const executeTrade = async () => {
    if (!pendingTradeData) return;

    if (prayerText.trim()) {
      const prayer = await logPrayerMutation.mutateAsync({
        prayerText: prayerText.trim(),
        category: "trade_guidance",
      });
      setCurrentPrayerId(prayer.id);
    }

    placeOrderMutation.mutate(pendingTradeData, {
      onSuccess: async (order: any) => {
        if (currentPrayerId && order?.id) {
          await apiRequest("POST", "/api/prayers/correlate", {
            prayerId: currentPrayerId,
            tradeId: order.id,
            outcome: "pending",
          });
        }
        setPrayerDialogOpen(false);
        setPendingTradeData(null);
        setPrayerText("");
        setCurrentPrayerId(null);
      },
    });
  };

  const skipPrayer = () => {
    if (pendingTradeData) {
      placeOrderMutation.mutate(pendingTradeData);
      setPrayerDialogOpen(false);
      setPendingTradeData(null);
      setPrayerText("");
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Trading Platform</h2>
          <p className="text-muted-foreground">Live market data, automated bots, and advanced trading</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Auto-refresh</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} data-testid="switch-auto-refresh" />
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Live Market Data</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {marketAssets.map((asset) => {
                  const data = marketData[asset.symbol];
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => setSelectedAsset(asset.symbol)}
                      className={`w-full text-left p-2 rounded hover:bg-accent transition-colors ${
                        selectedAsset === asset.symbol ? "bg-accent" : ""
                      }`}
                      data-testid={`button-select-${asset.symbol}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{asset.symbol}</p>
                          <p className="text-xs text-muted-foreground">{asset.name}</p>
                        </div>
                        {data && (
                          <div className="text-right">
                            <p className="text-sm font-medium">${data.price.toFixed(2)}</p>
                            <p className={`text-xs ${data.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {data.changePercent >= 0 ? "+" : ""}{data.changePercent.toFixed(2)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netPnL >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-total-pnl">
              {netPnL >= 0 ? '+' : ''}{netPnL.toFixed(2)} USDT
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">+{totalProfit.toFixed(2)}</span> / <span className="text-red-500">-{totalLoss.toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-bots">
              {activeBots.length}
            </div>
            <p className="text-xs text-muted-foreground">{bots?.length || 0} total bots</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-win-rate">
              {avgWinRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Average across all bots</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Trading Interface</CardTitle>
            <CardDescription>Execute trades manually</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" data-testid="button-open-trade">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Place Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Place Trading Order</DialogTitle>
                  <DialogDescription>Execute a buy or sell order</DialogDescription>
                </DialogHeader>
                <Form {...tradeForm}>
                  <form onSubmit={tradeForm.handleSubmit(onSubmitTrade)} className="space-y-4">
                    <FormField
                      control={tradeForm.control}
                      name="symbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symbol</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-trade-symbol">
                                <SelectValue placeholder="Select symbol" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {marketAssets.map((asset) => (
                                <SelectItem key={asset.symbol} value={asset.symbol}>
                                  {asset.symbol} - {asset.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={tradeForm.control}
                      name="side"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Side</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="buy" id="buy" data-testid="radio-buy" />
                                <label htmlFor="buy" className="text-sm font-medium text-green-500">Buy</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sell" id="sell" data-testid="radio-sell" />
                                <label htmlFor="sell" className="text-sm font-medium text-red-500">Sell</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={tradeForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-order-type">
                                <SelectValue placeholder="Select order type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="market">Market Order</SelectItem>
                              <SelectItem value="limit">Limit Order</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={tradeForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.00000001" placeholder="0.00" {...field} data-testid="input-quantity" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {tradeForm.watch("type") === "limit" && (
                      <FormField
                        control={tradeForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Limit Price</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setTradeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={placeOrderMutation.isPending} data-testid="button-submit-trade">
                        {placeOrderMutation.isPending ? "Placing..." : "Place Order"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Selected:</span>
                <span className="font-medium">{selectedAsset}</span>
              </div>
              {marketData[selectedAsset] && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">${marketData[selectedAsset].price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">24h Change:</span>
                    <span className={`font-medium ${marketData[selectedAsset].changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {marketData[selectedAsset].changePercent >= 0 ? '+' : ''}{marketData[selectedAsset].changePercent.toFixed(2)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Order Book</CardTitle>
            <CardDescription>Live bid/ask spread for {selectedAsset}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-green-500">Bids (Buy Orders)</h4>
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {orderBook.bids.slice(0, 10).map((bid, idx) => (
                      <div key={idx} className="flex justify-between text-xs" data-testid={`bid-${idx}`}>
                        <span className="text-green-500">${bid.price}</span>
                        <span className="text-muted-foreground">{bid.quantity}</span>
                        <span className="font-medium">${bid.total}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 text-red-500">Asks (Sell Orders)</h4>
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {orderBook.asks.slice(0, 10).map((ask, idx) => (
                      <div key={idx} className="flex justify-between text-xs" data-testid={`ask-${idx}`}>
                        <span className="text-red-500">${ask.price}</span>
                        <span className="text-muted-foreground">{ask.quantity}</span>
                        <span className="font-medium">${ask.total}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bots" className="w-full">
        <TabsList>
          <TabsTrigger value="bots" data-testid="tab-bots">Trading Bots</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
          <TabsTrigger value="executions" data-testid="tab-executions">Trade History</TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">My Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="bots" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Manage your automated trading bots</p>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-bot">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bot
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Trading Bot</DialogTitle>
              <DialogDescription>Configure a new automated trading bot</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Grid Bot" {...field} data-testid="input-bot-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="strategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strategy</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-strategy">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {strategies.map((strategy) => (
                            <SelectItem key={strategy.value} value={strategy.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{strategy.label}</span>
                                <span className="text-xs text-muted-foreground">{strategy.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="exchange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exchange</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-exchange">
                              <SelectValue placeholder="Select exchange" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {exchanges.map((exchange) => (
                              <SelectItem key={exchange.value} value={exchange.value}>
                                {exchange.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tradingPair"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trading Pair</FormLabel>
                        <FormControl>
                          <Input placeholder="BTC/USDT" {...field} data-testid="input-trading-pair" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="riskLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Limit ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100" {...field} data-testid="input-risk-limit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dailyLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Loss Limit ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="500" {...field} data-testid="input-daily-limit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBotMutation.isPending} data-testid="button-submit-bot">
                    {createBotMutation.isPending ? "Creating..." : "Create Bot"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
          </div>

          {botsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bots && bots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bots.map((bot) => (
                <Card key={bot.id} className="hover-elevate" data-testid={`card-bot-${bot.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <Badge variant={bot.isActive ? "default" : "secondary"} data-testid={`badge-status-${bot.id}`}>
                        {bot.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {strategies.find(s => s.value === bot.strategy)?.label} • {bot.exchange}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pair:</span>
                        <span className="font-medium">{bot.tradingPair}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">P&L:</span>
                        <span className={`font-medium ${parseFloat(bot.totalProfit || "0") - parseFloat(bot.totalLoss || "0") >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(parseFloat(bot.totalProfit || "0") - parseFloat(bot.totalLoss || "0")).toFixed(2)} USDT
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Win Rate:</span>
                        <span className="font-medium">{bot.winRate}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Trades:</span>
                        <span className="font-medium">{bot.totalTrades}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!bot.isActive ? (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleControlBot(bot.id, "start")}
                          data-testid={`button-start-${bot.id}`}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleControlBot(bot.id, "pause")}
                          data-testid={`button-pause-${bot.id}`}
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleControlBot(bot.id, "stop")}
                        data-testid={`button-stop-${bot.id}`}
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No trading bots yet</p>
                <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-first-bot">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Bot
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Execution History</CardTitle>
                  <CardDescription>Recent trades across all bots</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterBot} onValueChange={setFilterBot}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter-bot">
                      <SelectValue placeholder="Filter by bot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bots</SelectItem>
                      {bots?.map((bot) => (
                        <SelectItem key={bot.id} value={bot.id}>
                          {bot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStrategy} onValueChange={setFilterStrategy}>
                    <SelectTrigger className="w-[180px]" data-testid="select-filter-strategy">
                      <SelectValue placeholder="Filter by strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Strategies</SelectItem>
                      {strategies.map((strategy) => (
                        <SelectItem key={strategy.value} value={strategy.value}>
                          {strategy.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {executionsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : executions && executions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bot</TableHead>
                        <TableHead>Strategy</TableHead>
                        <TableHead>Entry Price</TableHead>
                        <TableHead>Exit Price</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>P&L</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {executions.map((execution) => (
                        <TableRow key={execution.id} data-testid={`row-execution-${execution.id}`}>
                          <TableCell className="font-medium">
                            {bots?.find(b => b.id === execution.botId)?.name || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {strategies.find(s => s.value === execution.strategy)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{execution.entryPrice ? parseFloat(execution.entryPrice).toFixed(2) : "-"}</TableCell>
                          <TableCell>{execution.exitPrice ? parseFloat(execution.exitPrice).toFixed(2) : "-"}</TableCell>
                          <TableCell>{parseFloat(execution.amount).toFixed(4)}</TableCell>
                          <TableCell>
                            <span className={execution.profit && parseFloat(execution.profit) >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {execution.profit ? parseFloat(execution.profit).toFixed(2) : "0.00"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              execution.status === "completed" ? "default" :
                              execution.status === "running" ? "secondary" :
                              execution.status === "failed" ? "destructive" : "outline"
                            }>
                              {execution.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {execution.startedAt ? new Date(execution.startedAt).toLocaleDateString() : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No executions yet. Select a bot to view its history.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Equity Curve</CardTitle>
                <CardDescription>Cumulative profit over time</CardDescription>
              </CardHeader>
              <CardContent>
                {equityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={equityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="cumulative" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No performance data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Drawdown Analysis</CardTitle>
                <CardDescription>Risk metrics and drawdown</CardDescription>
              </CardHeader>
              <CardContent>
                {equityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={equityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#82ca9d" name="Trade P&L" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No drawdown data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>Your recent trading orders</CardDescription>
            </CardHeader>
            <CardContent>
              {exchangeOrders && Array.isArray(exchangeOrders) && exchangeOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exchangeOrders.map((order: any) => (
                      <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                        <TableCell className="font-medium">{order.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={order.side === "BUY" ? "default" : "destructive"}>
                            {order.side}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.type}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>${order.price ? parseFloat(order.price).toFixed(2) : "-"}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === "FILLED" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No orders yet. Place your first trade to see orders here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={prayerDialogOpen} onOpenChange={setPrayerDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950" data-testid="dialog-pre-trade-prayer">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-yellow-600" />
              Seek Divine Guidance
            </DialogTitle>
            <DialogDescription>
              Pause and pray before executing your trade. Let wisdom guide your decisions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-r-lg">
              <div className="flex items-start gap-2">
                <BookOpen className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Scripture for Your Trade:</p>
                  <blockquote className="text-sm italic">
                    "The plans of the diligent lead to profit as surely as haste leads to poverty."
                  </blockquote>
                  <p className="text-xs text-muted-foreground">- Proverbs 21:5</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Prayer (Optional)</label>
              <Textarea
                value={prayerText}
                onChange={(e) => setPrayerText(e.target.value)}
                placeholder="Ask for wisdom, guidance, and protection in this trade..."
                className="min-h-[100px]"
                data-testid="textarea-pre-trade-prayer"
              />
              <p className="text-xs text-muted-foreground">
                This prayer will be recorded and linked to your trade outcome for spiritual insights.
              </p>
            </div>

            {pendingTradeData && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-semibold mb-1">Trade Summary:</p>
                <div className="space-y-0.5 text-muted-foreground">
                  <p>{pendingTradeData.side.toUpperCase()} {pendingTradeData.quantity} {pendingTradeData.symbol}</p>
                  <p>Type: {pendingTradeData.type.toUpperCase()}</p>
                  {pendingTradeData.price && <p>Price: ${pendingTradeData.price}</p>}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={skipPrayer}
              disabled={placeOrderMutation.isPending}
              data-testid="button-skip-prayer"
            >
              Skip Prayer
            </Button>
            <Button
              onClick={executeTrade}
              disabled={placeOrderMutation.isPending}
              className="gap-2"
              data-testid="button-execute-with-prayer"
            >
              {placeOrderMutation.isPending ? (
                "Executing..."
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  {prayerText.trim() ? "Pray & Execute" : "Execute Trade"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={controlDialogOpen} onOpenChange={setControlDialogOpen}>
        <DialogContent data-testid="dialog-control-bot">
          <DialogHeader>
            <DialogTitle>
              {controlAction === "start" ? "Start Bot" : controlAction === "pause" ? "Pause Bot" : "Stop Bot"}
            </DialogTitle>
            <DialogDescription>
              {controlAction === "start" 
                ? "Are you sure you want to start this trading bot? It will begin executing trades automatically."
                : controlAction === "pause"
                ? "Are you sure you want to pause this bot? Current positions will remain open."
                : "Are you sure you want to stop this bot? This will close all positions and deactivate the bot."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setControlDialogOpen(false)} data-testid="button-cancel-control">
              Cancel
            </Button>
            <Button
              variant={controlAction === "stop" ? "destructive" : "default"}
              onClick={confirmControl}
              disabled={controlBotMutation.isPending}
              data-testid="button-confirm-control"
            >
              {controlBotMutation.isPending ? "Processing..." : `Confirm ${controlAction === "start" ? "Start" : controlAction === "pause" ? "Pause" : "Stop"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
