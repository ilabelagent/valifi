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
import { Bot, TrendingUp, TrendingDown, Play, Pause, Square, Plus, Activity, DollarSign, Target, BarChart3 } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { io, Socket } from "socket.io-client";

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

  const { data: bots, isLoading: botsLoading } = useQuery<TradingBot[]>({
    queryKey: ["/api/trading-bots"],
  });

  const { data: allExecutions, isLoading: executionsLoading } = useQuery<BotExecution[]>({
    queryKey: ["/api/bot-executions"],
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
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

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

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Trading Bots</h2>
          <p className="text-muted-foreground">Automated trading strategies across exchanges</p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-trades">
              {bots?.reduce((sum, bot) => sum + (bot.totalTrades || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Executed orders</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bots" className="w-full">
        <TabsList>
          <TabsTrigger value="bots" data-testid="tab-bots">My Bots</TabsTrigger>
          <TabsTrigger value="executions" data-testid="tab-executions">Execution History</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="bots" className="space-y-4">
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
      </Tabs>

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
