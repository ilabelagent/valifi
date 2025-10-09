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
import { TrendingUp, DollarSign, Calendar, Percent, ShoppingCart, Loader2, Landmark } from "lucide-react";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const orderFormSchema = z.object({
  symbol: z.string().min(1, "Bond symbol is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  price: z.coerce.number().positive("Price must be positive"),
  maturityDate: z.string().min(1, "Maturity date is required"),
  yieldRate: z.coerce.number().positive("Yield rate must be positive"),
});

type OrderForm = z.infer<typeof orderFormSchema>;

interface TreasuryYields {
  "1_month": number;
  "3_month": number;
  "6_month": number;
  "1_year": number;
  "2_year": number;
  "5_year": number;
  "10_year": number;
  "30_year": number;
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
  metadata?: any;
}

interface FinancialHolding {
  id: string;
  symbol: string;
  quantity: string;
  averagePurchasePrice: string;
  totalInvested: string;
  metadata?: any;
}

const popularBonds = [
  { symbol: "US10Y", name: "10-Year Treasury", yield: 4.2, price: 98.5, maturity: "2034-10-15" },
  { symbol: "US30Y", name: "30-Year Treasury", yield: 4.5, price: 97.2, maturity: "2054-10-15" },
  { symbol: "US2Y", name: "2-Year Treasury", yield: 4.8, price: 99.1, maturity: "2026-10-15" },
  { symbol: "CORP-AAA", name: "AAA Corporate", yield: 5.2, price: 96.8, maturity: "2029-12-31" },
];

export default function BondsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [treasuryYields, setTreasuryYields] = useState<TreasuryYields | null>(null);

  const { data: holdings, isLoading: holdingsLoading } = useQuery<FinancialHolding[]>({
    queryKey: ["/api/financial/holdings/bond"],
    refetchInterval: 5000,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<FinancialOrder[]>({
    queryKey: ["/api/financial/orders"],
    refetchInterval: 3000,
  });

  const bondOrders = orders?.filter(o => o.symbol.includes("Y") || o.symbol.includes("CORP")) || [];

  useEffect(() => {
    const fetchTreasuryYields = async () => {
      try {
        const response = await fetch("/api/market/bonds/treasury");
        if (response.ok) {
          const data = await response.json();
          setTreasuryYields(data);
        }
      } catch (error) {
        console.error("Error fetching treasury yields:", error);
      }
    };
    fetchTreasuryYields();
    const interval = setInterval(fetchTreasuryYields, 60000);
    return () => clearInterval(interval);
  }, []);

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      symbol: "US10Y",
      quantity: 10,
      price: 98.5,
      maturityDate: "2034-10-15",
      yieldRate: 4.2,
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderForm) => {
      const response = await fetch("/api/financial/bonds/order", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/financial/holdings/bond"] });
      toast({
        title: "Order Executed",
        description: "Bond purchase completed successfully",
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

  const totalInvested = holdings?.reduce((sum, h) => sum + parseFloat(h.totalInvested || "0"), 0) || 0;
  const totalBonds = holdings?.reduce((sum, h) => sum + parseFloat(h.quantity || "0"), 0) || 0;

  const yieldChartData = treasuryYields ? [
    { term: "1M", yield: treasuryYields["1_month"] },
    { term: "3M", yield: treasuryYields["3_month"] },
    { term: "6M", yield: treasuryYields["6_month"] },
    { term: "1Y", yield: treasuryYields["1_year"] },
    { term: "2Y", yield: treasuryYields["2_year"] },
    { term: "5Y", yield: treasuryYields["5_year"] },
    { term: "10Y", yield: treasuryYields["10_year"] },
    { term: "30Y", yield: treasuryYields["30_year"] },
  ] : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <Landmark className="h-8 w-8" />
            Bond Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Invest in government and corporate bonds with competitive yields
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-buy-bonds" className="divine-gradient">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Bonds
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase Bonds</DialogTitle>
              <DialogDescription>Invest in fixed-income securities</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createOrderMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bond Symbol</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        const bond = popularBonds.find(b => b.symbol === value);
                        if (bond) {
                          form.setValue("price", bond.price);
                          form.setValue("yieldRate", bond.yield);
                          form.setValue("maturityDate", bond.maturity);
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-bond">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {popularBonds.map(bond => (
                            <SelectItem key={bond.symbol} value={bond.symbol}>
                              {bond.name} ({bond.yield}%)
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
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity (bonds)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="10" data-testid="input-quantity" />
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
                      <FormLabel>Price per Bond ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="98.50" data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yieldRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yield Rate (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.1" placeholder="4.2" data-testid="input-yield" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maturityDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maturity Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-maturity" />
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
                  Purchase Bonds
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-invested">
              ${totalInvested.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Bond portfolio value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bonds</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-bonds">{totalBonds}</div>
            <p className="text-xs text-muted-foreground">Bonds owned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Yield</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500" data-testid="text-avg-yield">4.5%</div>
            <p className="text-xs text-muted-foreground">Portfolio average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-holdings-count">{holdings?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Different bonds</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Treasury Yield Curve</CardTitle>
            <CardDescription>Current US Treasury yields by maturity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={yieldChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="term" />
                <YAxis domain={[0, 'auto']} />
                <Tooltip />
                <Bar dataKey="yield" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Bonds</CardTitle>
            <CardDescription>Featured bond offerings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularBonds.map(bond => (
                <div key={bond.symbol} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`bond-${bond.symbol}`}>
                  <div>
                    <p className="font-medium">{bond.name}</p>
                    <p className="text-sm text-muted-foreground">{bond.symbol}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="mb-1">{bond.yield}% yield</Badge>
                    <p className="text-sm text-muted-foreground">${bond.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="holdings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="holdings" data-testid="tab-holdings">Holdings</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Purchase History</TabsTrigger>
        </TabsList>
        <TabsContent value="holdings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Bond Holdings</CardTitle>
              <CardDescription>Current fixed-income investments</CardDescription>
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
                          {holding.quantity} bonds @ ${parseFloat(holding.averagePurchasePrice).toFixed(2)}
                        </p>
                        {holding.metadata?.maturityDate && (
                          <p className="text-xs text-muted-foreground">
                            Matures: {new Date(holding.metadata.maturityDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${parseFloat(holding.totalInvested || "0").toFixed(2)}</p>
                        {holding.metadata?.yieldRate && (
                          <Badge variant="outline" className="mt-1">{holding.metadata.yieldRate}% yield</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No bond holdings yet. Start investing!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>Your bond transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : bondOrders.length > 0 ? (
                <div className="space-y-4">
                  {bondOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`order-${order.id}`}>
                      <div>
                        <p className="font-medium">{order.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity} bonds @ ${parseFloat(order.price).toFixed(2)}
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
                <p className="text-center text-muted-foreground py-8">No purchases yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
