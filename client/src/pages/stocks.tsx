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
import { TrendingUp, TrendingDown, DollarSign, Activity, ShoppingCart, Loader2, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const orderFormSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  orderType: z.enum(["buy", "sell"]),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  price: z.coerce.number().optional(),
});

type OrderForm = z.infer<typeof orderFormSchema>;

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

interface FinancialOrder {
  id: string;
  symbol: string;
  orderType: string;
  quantity: string;
  price: string;
  totalValue: string;
  status: string;
  createdAt: Date;
}

interface FinancialHolding {
  id: string;
  symbol: string;
  quantity: string;
  averagePurchasePrice: string;
  currentValue: string;
  totalInvested: string;
}

const popularStocks = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "JPM"];

export default function StocksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [stockData, setStockData] = useState<StockData | null>(null);

  const { data: holdings, isLoading: holdingsLoading } = useQuery<FinancialHolding[]>({
    queryKey: ["/api/financial/holdings/stock"],
    refetchInterval: 5000,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<FinancialOrder[]>({
    queryKey: ["/api/financial/orders"],
    refetchInterval: 3000,
  });

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch(`/api/market/stock/${selectedStock}`);
        if (response.ok) {
          const data = await response.json();
          setStockData(data);
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };
    fetchStockData();
    const interval = setInterval(fetchStockData, 5000);
    return () => clearInterval(interval);
  }, [selectedStock]);

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      symbol: selectedStock,
      orderType: "buy",
      quantity: 1,
      price: stockData?.price || 0,
    },
  });

  useEffect(() => {
    if (stockData) {
      form.setValue("price", stockData.price);
    }
  }, [stockData, form]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderForm) => {
      const response = await fetch("/api/financial/stocks/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to place order");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/holdings/stock"] });
      toast({
        title: "Order Executed",
        description: "Stock order placed successfully",
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

  const totalHoldingsValue = holdings?.reduce((sum, h) => sum + parseFloat(h.currentValue || "0"), 0) || 0;
  const totalInvested = holdings?.reduce((sum, h) => sum + parseFloat(h.totalInvested || "0"), 0) || 0;
  const totalGainLoss = totalHoldingsValue - totalInvested;
  const gainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const mockChartData = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    price: stockData ? stockData.price + (Math.random() - 0.5) * 20 : 100 + (Math.random() - 0.5) * 20,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Stock Trading
          </h1>
          <p className="text-muted-foreground mt-1">
            Trade stocks with real-time market data
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-place-order" className="divine-gradient">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Place Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Place Stock Order</DialogTitle>
              <DialogDescription>Buy or sell stocks at current market prices</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createOrderMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Symbol</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="AAPL" data-testid="input-symbol" />
                      </FormControl>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-order-type">
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="1" data-testid="input-quantity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Share</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full divine-gradient" 
                  disabled={createOrderMutation.isPending}
                  data-testid="button-submit-order"
                >
                  {createOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Execute Order
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-portfolio-value">
              ${totalHoldingsValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total invested: ${totalInvested.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gain/Loss</CardTitle>
            {totalGainLoss >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-gain-loss">
              {totalGainLoss >= 0 ? '+' : ''}{totalGainLoss.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-holdings-count">{holdings?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-orders-count">{orders?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Executed trades</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Market Watch</CardTitle>
            <CardDescription>Select a stock to view real-time data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedStock} onValueChange={setSelectedStock}>
              <SelectTrigger data-testid="select-stock">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {popularStocks.map(symbol => (
                  <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stockData && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold" data-testid="text-stock-price">${stockData.price.toFixed(2)}</span>
                  <Badge variant={stockData.change >= 0 ? "default" : "destructive"}>
                    {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Volume: {stockData.volume.toLocaleString()} | Market Cap: ${(stockData.marketCap / 1e9).toFixed(2)}B
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Chart</CardTitle>
            <CardDescription>30-day price movement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="holdings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="holdings" data-testid="tab-holdings">Holdings</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Order History</TabsTrigger>
        </TabsList>
        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Stock Holdings</CardTitle>
              <CardDescription>Current portfolio positions</CardDescription>
            </CardHeader>
            <CardContent>
              {holdingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : holdings && holdings.length > 0 ? (
                <div className="space-y-4">
                  {holdings.map((holding) => (
                    <div key={holding.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`holding-${holding.symbol}`}>
                      <div>
                        <p className="font-medium">{holding.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {holding.quantity} shares @ ${parseFloat(holding.averagePurchasePrice).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${parseFloat(holding.currentValue).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          Invested: ${parseFloat(holding.totalInvested || "0").toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No holdings yet. Start by placing an order!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>Your recent stock transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.filter(o => o.symbol).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`order-${order.id}`}>
                      <div>
                        <p className="font-medium">{order.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.orderType.toUpperCase()} {order.quantity} @ ${parseFloat(order.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={order.status === "executed" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${parseFloat(order.totalValue).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No orders yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
