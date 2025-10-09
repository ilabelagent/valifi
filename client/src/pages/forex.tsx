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
import { TrendingUp, TrendingDown, DollarSign, Globe, ArrowRightLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const orderFormSchema = z.object({
  pair: z.string().min(1, "Currency pair is required"),
  orderType: z.enum(["buy", "sell"]),
  quantity: z.coerce.number().positive("Quantity must be positive"),
});

type OrderForm = z.infer<typeof orderFormSchema>;

interface ForexData {
  pair: string;
  price: number;
  bid: number;
  ask: number;
  spread: number;
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

const popularPairs = ["USD/EUR", "USD/GBP", "USD/JPY", "EUR/GBP", "EUR/JPY", "GBP/JPY", "AUD/USD", "USD/CAD"];

export default function ForexPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState("USD/EUR");
  const [forexData, setForexData] = useState<ForexData | null>(null);

  const { data: orders, isLoading: ordersLoading } = useQuery<FinancialOrder[]>({
    queryKey: ["/api/financial/orders"],
    refetchInterval: 3000,
  });

  const forexOrders = orders?.filter(o => o.symbol.includes("/")) || [];

  useEffect(() => {
    const fetchForexData = async () => {
      try {
        const response = await fetch(`/api/market/forex/${selectedPair}`);
        if (response.ok) {
          const data = await response.json();
          setForexData(data);
        }
      } catch (error) {
        console.error("Error fetching forex data:", error);
      }
    };
    fetchForexData();
    const interval = setInterval(fetchForexData, 5000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      pair: selectedPair,
      orderType: "buy",
      quantity: 1000,
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderForm) => {
      const response = await fetch("/api/financial/forex/order", {
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
      toast({
        title: "Order Executed",
        description: "Forex order placed successfully",
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

  const totalVolume = forexOrders.reduce((sum, o) => sum + parseFloat(o.totalValue || "0"), 0);
  const buyOrders = forexOrders.filter(o => o.orderType === "buy").length;
  const sellOrders = forexOrders.filter(o => o.orderType === "sell").length;

  const mockChartData = Array.from({ length: 30 }, (_, i) => ({
    date: `${i}h`,
    rate: forexData ? forexData.price + (Math.random() - 0.5) * 0.02 : 1.1 + (Math.random() - 0.5) * 0.02,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Forex Trading
          </h1>
          <p className="text-muted-foreground mt-1">
            Trade currency pairs with real-time exchange rates
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-place-order" className="divine-gradient">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Place Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Place Forex Order</DialogTitle>
              <DialogDescription>Buy or sell currency pairs</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createOrderMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="pair"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Pair</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-pair">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {popularPairs.map(pair => (
                            <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                          ))}
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
                      <FormLabel>Amount (units)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="1000" data-testid="input-quantity" />
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
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-volume">
              ${totalVolume.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Traded volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buy Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500" data-testid="text-buy-orders">{buyOrders}</div>
            <p className="text-xs text-muted-foreground">Long positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sell Orders</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500" data-testid="text-sell-orders">{sellOrders}</div>
            <p className="text-xs text-muted-foreground">Short positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-orders">{forexOrders.length}</div>
            <p className="text-xs text-muted-foreground">Executed trades</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Live Exchange Rates</CardTitle>
            <CardDescription>Select a currency pair</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger data-testid="select-forex-pair">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {popularPairs.map(pair => (
                  <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {forexData && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold" data-testid="text-forex-rate">{forexData.price.toFixed(5)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bid:</span>
                    <span className="ml-2 font-medium">{forexData.bid.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ask:</span>
                    <span className="ml-2 font-medium">{forexData.ask.toFixed(5)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Spread:</span>
                    <span className="ml-2 font-medium">{forexData.spread.toFixed(5)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate Chart</CardTitle>
            <CardDescription>24-hour movement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Your forex transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : forexOrders.length > 0 ? (
            <div className="space-y-4">
              {forexOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`order-${order.id}`}>
                  <div>
                    <p className="font-medium">{order.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.orderType.toUpperCase()} {order.quantity} units @ {parseFloat(order.price).toFixed(5)}
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
            <p className="text-center text-muted-foreground py-8">No orders yet. Start trading!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
