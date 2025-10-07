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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertExchangeOrderSchema, type ExchangeOrder, type LiquidityPool } from "@shared/schema";
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Activity,
  Sparkles,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2
} from "lucide-react";
import { useState } from "react";

const orderFormSchema = insertExchangeOrderSchema.omit({ userId: true }).extend({
  orderType: z.enum(["market", "limit", "stop_loss", "stop_limit"]),
  orderSide: z.enum(["buy", "sell"]),
  tradingPair: z.string().min(1, "Trading pair is required"),
  price: z.coerce.number().positive().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  network: z.enum(["ethereum", "polygon", "bsc", "arbitrum", "optimism"]),
});

type OrderForm = z.infer<typeof orderFormSchema>;

export default function ExchangePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState("BTC/USDT");

  const { data: orders, isLoading: ordersLoading, isError: ordersError, error: ordersErrorData, refetch: refetchOrders } = useQuery<ExchangeOrder[]>({
    queryKey: ["/api/exchange/orders"],
    refetchInterval: 3000, // Real-time updates every 3 seconds
  });

  const { data: pools, isLoading: poolsLoading } = useQuery<LiquidityPool[]>({
    queryKey: ["/api/exchange/pools"],
    refetchInterval: 5000,
  });

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      orderType: "market",
      orderSide: "buy",
      tradingPair: "BTC/USDT",
      amount: 0,
      network: "ethereum",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderForm) => {
      const response = await fetch("/api/exchange/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create order");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exchange/orders"] });
      toast({
        title: "Order Created",
        description: "Your exchange order has been placed successfully",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: error.message,
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "default",
      partially_filled: "secondary",
      filled: "outline",
      cancelled: "destructive",
      expired: "destructive",
    };
    return variants[status] || "default";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      open: <Clock className="h-3 w-3" />,
      partially_filled: <Activity className="h-3 w-3" />,
      filled: <CheckCircle2 className="h-3 w-3" />,
      cancelled: <XCircle className="h-3 w-3" />,
      expired: <AlertCircle className="h-3 w-3" />,
    };
    return icons[status] || <Activity className="h-3 w-3" />;
  };

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const openOrders = orders?.filter(o => o.status === "open").length || 0;
  const filledOrders = orders?.filter(o => o.status === "filled").length || 0;
  const totalVolume = orders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <Coins className="h-8 w-8" />
            Exchange Platform
          </h1>
          <p className="text-muted-foreground mt-1">
            Procure coins with advanced order book and liquidity pools
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2" data-testid="button-create-order">
              <Sparkles className="h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Exchange Order</DialogTitle>
              <DialogDescription>
                Place a market, limit, or stop order on the exchange
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createOrderMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="orderSide"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Side</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-order-side">
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
                    name="orderType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-order-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="market">Market</SelectItem>
                            <SelectItem value="limit">Limit</SelectItem>
                            <SelectItem value="stop_loss">Stop Loss</SelectItem>
                            <SelectItem value="stop_limit">Stop Limit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  {form.watch("orderType") !== "market" && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (USDT)</FormLabel>
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
                  )}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            placeholder="0.000"
                            {...field}
                            data-testid="input-amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="network"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Network</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-network">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                          <SelectItem value="polygon">Polygon</SelectItem>
                          <SelectItem value="bsc">BSC</SelectItem>
                          <SelectItem value="arbitrum">Arbitrum</SelectItem>
                          <SelectItem value="optimism">Optimism</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createOrderMutation.isPending}
                  data-testid="button-submit-order"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Place Order
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
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-orders">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All-time exchange orders</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-open-orders">{openOrders}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filled Orders</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-filled-orders">{filledOrders}</div>
            <p className="text-xs text-muted-foreground">Successfully executed</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-volume">
              ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">USDT equivalent</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
          <TabsTrigger value="pools" data-testid="tab-pools">Liquidity Pools</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {ordersLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading orders...</p>
              </CardContent>
            </Card>
          ) : ordersError ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                <p className="text-sm text-muted-foreground mb-4">Failed to load orders</p>
                <Button onClick={() => refetchOrders()} variant="outline" size="sm" data-testid="button-retry-orders">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : !orders || orders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No exchange orders yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first order to start trading</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover-elevate" data-testid={`card-order-${order.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={order.orderSide === "buy" ? "default" : "destructive"}
                          className="gap-1"
                          data-testid={`badge-side-${order.id}`}
                        >
                          {order.orderSide === "buy" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {order.orderSide?.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" data-testid={`badge-type-${order.id}`}>
                          {order.orderType?.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(order.status || 'open')} className="gap-1" data-testid={`badge-status-${order.id}`}>
                          {getStatusIcon(order.status || 'open')}
                          {order.status?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid={`text-date-${order.id}`}>
                        {new Date(order.createdAt!).toLocaleDateString()}
                      </div>
                    </div>
                    <CardTitle className="text-lg" data-testid={`text-pair-${order.id}`}>{order.tradingPair}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-mono" data-testid={`text-amount-${order.id}`}>{order.amount}</p>
                      </div>
                      {order.price && (
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-mono" data-testid={`text-price-${order.id}`}>
                            ${Number(order.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Filled</p>
                        <p className="font-mono" data-testid={`text-filled-${order.id}`}>
                          {order.filled || '0'} / {order.amount}
                        </p>
                      </div>
                      {order.total && (
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-mono" data-testid={`text-total-${order.id}`}>
                            ${Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="gap-1">
                        <Activity className="h-3 w-3" />
                        {order.network?.toUpperCase()}
                      </Badge>
                      {order.externalOrderId && (
                        <span className="text-xs text-muted-foreground font-mono" data-testid={`text-external-id-${order.id}`}>
                          {order.externalOrderId}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pools" className="space-y-4">
          {poolsLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading liquidity pools...</p>
              </CardContent>
            </Card>
          ) : !pools || pools.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No liquidity pools available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pools.map((pool) => (
                <Card key={pool.id} className="hover-elevate" data-testid={`card-pool-${pool.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle data-testid={`text-pool-name-${pool.id}`}>{pool.poolName}</CardTitle>
                      <Badge variant="outline">{pool.network?.toUpperCase()}</Badge>
                    </div>
                    <CardDescription className="font-mono text-xs" data-testid={`text-contract-${pool.id}`}>
                      {pool.contractAddress}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Reserve {pool.tokenA}</p>
                        <p className="font-mono font-semibold" data-testid={`text-reserve-a-${pool.id}`}>
                          {Number(pool.reserveA || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reserve {pool.tokenB}</p>
                        <p className="font-mono font-semibold" data-testid={`text-reserve-b-${pool.id}`}>
                          {Number(pool.reserveB || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {pool.apy && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">APY</span>
                        <span className="text-lg font-bold covenant-gradient-text" data-testid={`text-apy-${pool.id}`}>
                          {Number(pool.apy).toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {pool.totalValueLocked && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">TVL</span>
                        <span className="font-mono" data-testid={`text-tvl-${pool.id}`}>
                          ${Number(pool.totalValueLocked).toLocaleString()}
                        </span>
                      </div>
                    )}
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
