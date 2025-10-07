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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { insertTradingBotSchema, type TradingBot, type BotExecution } from "@shared/schema";
import {
  Bot,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Zap,
  Settings,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  Shield,
  Sparkles,
  Target,
  BarChart3,
  Loader2,
  Crown,
  Swords
} from "lucide-react";
import { useState } from "react";

const botFormSchema = insertTradingBotSchema.omit({ userId: true }).extend({
  strategy: z.enum(["grid_trading", "dca", "arbitrage", "scalping", "market_making", "momentum_ai", "mev_protection"]),
  tradingPair: z.string().min(1, "Trading pair is required"),
  config: z.string().optional(),
  isActive: z.boolean(),
});

type BotForm = z.infer<typeof botFormSchema>;

const strategyInfo: Record<string, { name: string; icon: JSX.Element; color: string; description: string }> = {
  grid_trading: {
    name: "Grid Trading",
    icon: <BarChart3 className="h-4 w-4" />,
    color: "text-blue-500",
    description: "Automated buy/sell at price intervals"
  },
  dca: {
    name: "Dollar Cost Averaging",
    icon: <Target className="h-4 w-4" />,
    color: "text-green-500",
    description: "Consistent buying at intervals"
  },
  arbitrage: {
    name: "Arbitrage",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-purple-500",
    description: "Price differential capture"
  },
  scalping: {
    name: "Scalping",
    icon: <Zap className="h-4 w-4" />,
    color: "text-yellow-500",
    description: "Rapid micro-profit trading"
  },
  market_making: {
    name: "Market Making",
    icon: <Activity className="h-4 w-4" />,
    color: "text-cyan-500",
    description: "Liquidity provision & spread capture"
  },
  momentum_ai: {
    name: "Momentum AI",
    icon: <Sparkles className="h-4 w-4" />,
    color: "text-pink-500",
    description: "AI-powered pattern recognition"
  },
  mev_protection: {
    name: "MEV Protection",
    icon: <Shield className="h-4 w-4" />,
    color: "text-red-500",
    description: "Kingdom ethics frontrunning guard"
  }
};

export default function TradingBotsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);

  const { data: bots, isLoading: botsLoading, isError: botsError, refetch: refetchBots } = useQuery<TradingBot[]>({
    queryKey: ["/api/trading/bots"],
    refetchInterval: 3000, // Real-time updates
  });

  const { data: executions, isLoading: executionsLoading } = useQuery<BotExecution[]>({
    queryKey: ["/api/trading/executions"],
    refetchInterval: 5000,
  });

  const form = useForm<BotForm>({
    resolver: zodResolver(botFormSchema),
    defaultValues: {
      strategy: "grid_trading",
      tradingPair: "BTC/USDT",
      isActive: true,
      config: "{}",
    },
  });

  const createBotMutation = useMutation({
    mutationFn: async (data: BotForm) => {
      const response = await fetch("/api/trading/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create bot");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trading/bots"] });
      toast({
        title: "Bot Created",
        description: "Trading bot deployed successfully",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Bot Creation Failed",
        description: error.message,
      });
    },
  });

  const toggleBotMutation = useMutation({
    mutationFn: async ({ botId, isActive }: { botId: number; isActive: boolean }) => {
      const response = await fetch(`/api/trading/bots/${botId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to toggle bot");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trading/bots"] });
      toast({
        title: "Bot Updated",
        description: "Trading bot status changed",
      });
    },
  });

  // Calculate stats
  const activeBots = bots?.filter(b => b.isActive).length || 0;
  const totalBots = bots?.length || 0;
  const totalPnL = executions?.reduce((sum, e) => sum + Number(e.profit || 0), 0) || 0;
  const totalTrades = executions?.length || 0;
  const winningTrades = executions?.filter(e => Number(e.profit || 0) > 0).length || 0;
  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : "0";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <Bot className="h-8 w-8" />
            Trading Bots Arsenal
          </h1>
          <p className="text-muted-foreground mt-1">
            7 active strategies with Kingdom ethics protection
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2" data-testid="button-create-bot">
              <Crown className="h-4 w-4" />
              Deploy Bot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Deploy Trading Bot</DialogTitle>
              <DialogDescription>
                Configure and activate an automated trading strategy
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createBotMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="strategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strategy</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-strategy">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(strategyInfo).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                {info.icon}
                                {info.name}
                              </div>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-trading-pair">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                          <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                          <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
                          <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                          <SelectItem value="MATIC/USDT">MATIC/USDT</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="config"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Configuration (JSON)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='{"interval": 3600, "threshold": 0.02}'
                          {...field}
                          data-testid="input-config"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Activate Immediately</FormLabel>
                        <p className="text-xs text-muted-foreground mt-1">
                          Start trading as soon as bot is deployed
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-is-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createBotMutation.isPending}
                  data-testid="button-submit-bot"
                >
                  {createBotMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Swords className="mr-2 h-4 w-4" />
                      Deploy Bot
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
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-bots">
              {activeBots} / {totalBots}
            </div>
            <p className="text-xs text-muted-foreground">Currently executing</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-total-pnl">
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </div>
            <p className="text-xs text-muted-foreground">All-time performance</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-trades">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">{winningTrades} winning trades</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold covenant-gradient-text" data-testid="text-win-rate">{winRate}%</div>
            <p className="text-xs text-muted-foreground">Strategy accuracy</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bots" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bots" data-testid="tab-bots">Active Bots</TabsTrigger>
          <TabsTrigger value="executions" data-testid="tab-executions">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="bots" className="space-y-4">
          {botsLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading bots...</p>
              </CardContent>
            </Card>
          ) : botsError ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                <p className="text-sm text-muted-foreground mb-4">Failed to load bots</p>
                <Button onClick={() => refetchBots()} variant="outline" size="sm" data-testid="button-retry-bots">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : !bots || bots.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No trading bots deployed yet</p>
                <p className="text-xs text-muted-foreground mt-1">Deploy your first bot to start automated trading</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {bots.map((bot) => {
                const info = strategyInfo[bot.strategy || 'grid_trading'];
                const botExecutions = executions?.filter(e => e.botId === bot.id) || [];
                const botPnL = botExecutions.reduce((sum, e) => sum + Number(e.profit || 0), 0);
                
                return (
                  <Card key={bot.id} className="hover-elevate" data-testid={`card-bot-${bot.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-muted ${info.color}`}>
                            {info.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg" data-testid={`text-bot-name-${bot.id}`}>
                              {info.name}
                            </CardTitle>
                            <CardDescription data-testid={`text-bot-pair-${bot.id}`}>
                              {bot.tradingPair}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={bot.isActive ? "default" : "secondary"} data-testid={`badge-status-${bot.id}`}>
                            {bot.isActive ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
                            {bot.isActive ? "Active" : "Paused"}
                          </Badge>
                          <Switch
                            checked={bot.isActive || false}
                            onCheckedChange={(checked) => toggleBotMutation.mutate({ botId: bot.id, isActive: checked })}
                            data-testid={`switch-bot-${bot.id}`}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Executions</p>
                          <p className="font-mono font-semibold" data-testid={`text-executions-${bot.id}`}>
                            {botExecutions.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">P&L</p>
                          <p className={`font-mono font-semibold ${botPnL >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid={`text-pnl-${bot.id}`}>
                            {botPnL >= 0 ? '+' : ''}{botPnL.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Run</p>
                          <p className="font-mono text-xs" data-testid={`text-last-run-${bot.id}`}>
                            {bot.lastExecutionAt ? new Date(bot.lastExecutionAt).toLocaleString() : 'Never'}
                          </p>
                        </div>
                      </div>
                      {bot.config && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Configuration</p>
                          <code className="text-xs font-mono" data-testid={`text-config-${bot.id}`}>
                            {JSON.stringify(bot.config)}
                          </code>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {executionsLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading trade history...</p>
              </CardContent>
            </Card>
          ) : !executions || executions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No trade executions yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => {
                const bot = bots?.find(b => b.id === execution.botId);
                const info = strategyInfo[bot?.strategy || 'grid_trading'];
                const pnl = Number(execution.profit || 0);
                const isBuy = execution.entryPrice && execution.exitPrice ? Number(execution.entryPrice) < Number(execution.exitPrice) : true;
                
                return (
                  <Card key={execution.id} className="hover-elevate" data-testid={`card-execution-${execution.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-muted ${info.color}`}>
                            {info.icon}
                          </div>
                          <div>
                            <p className="font-semibold" data-testid={`text-execution-bot-${execution.id}`}>
                              {info.name}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`text-execution-date-${execution.id}`}>
                              {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge variant={execution.status === 'completed' ? 'outline' : 'default'} data-testid={`badge-status-${execution.id}`}>
                              {execution.status?.toUpperCase() || 'PENDING'}
                            </Badge>
                            {execution.amount && (
                              <span className="font-mono text-sm" data-testid={`text-execution-amount-${execution.id}`}>
                                {Number(execution.amount).toFixed(4)}
                              </span>
                            )}
                          </div>
                          <p className={`font-mono font-bold mt-1 ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid={`text-execution-pnl-${execution.id}`}>
                            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
