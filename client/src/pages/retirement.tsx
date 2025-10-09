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
import { TrendingUp, DollarSign, PiggyBank, Wallet, Calendar, Loader2, Building2 } from "lucide-react";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const contributionFormSchema = z.object({
  accountType: z.enum(["401k", "ira", "roth_ira", "pension"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  frequency: z.enum(["one_time", "monthly", "quarterly", "annual"]),
});

type ContributionForm = z.infer<typeof contributionFormSchema>;

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
  currentValue: string;
  totalInvested: string;
  metadata?: any;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

export default function RetirementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: holdings, isLoading: holdingsLoading } = useQuery<FinancialHolding[]>({
    queryKey: ["/api/financial/holdings/retirement"],
    refetchInterval: 5000,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<FinancialOrder[]>({
    queryKey: ["/api/financial/orders"],
    refetchInterval: 3000,
  });

  const retirementOrders = orders?.filter(o => 
    o.symbol === "401K" || o.symbol === "IRA" || o.symbol === "ROTH_IRA" || o.symbol === "PENSION"
  ) || [];

  const form = useForm<ContributionForm>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: {
      accountType: "401k",
      amount: 500,
      frequency: "monthly",
    },
  });

  const createContributionMutation = useMutation({
    mutationFn: async (data: ContributionForm) => {
      const response = await fetch("/api/financial/retirement/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process contribution");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial/holdings/retirement"] });
      toast({
        title: "Contribution Successful",
        description: "Your retirement contribution has been processed",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Contribution Failed",
        description: error.message,
      });
    },
  });

  // Mock data for accounts
  const accounts = [
    { name: "401(k)", balance: 125000, contributions: 18500, growth: 12.5, symbol: "401K" },
    { name: "Traditional IRA", balance: 45000, contributions: 6500, growth: 8.2, symbol: "IRA" },
    { name: "Roth IRA", balance: 32000, contributions: 6500, growth: 10.1, symbol: "ROTH_IRA" },
    { name: "Pension", balance: 85000, contributions: 0, growth: 5.5, symbol: "PENSION" },
  ];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalContributions = accounts.reduce((sum, acc) => sum + acc.contributions, 0);
  const totalGrowth = totalBalance - totalContributions;
  const avgGrowthRate = (totalGrowth / totalContributions) * 100;

  const pieData = accounts.map(acc => ({
    name: acc.name,
    value: acc.balance,
  }));

  const projectedRetirement = totalBalance * Math.pow(1.07, 20); // 7% annual return for 20 years

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <PiggyBank className="h-8 w-8" />
            Retirement Planning
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your 401(k), IRA, and pension accounts
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-contribute" className="divine-gradient">
              <Wallet className="mr-2 h-4 w-4" />
              Make Contribution
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Retirement Contribution</DialogTitle>
              <DialogDescription>Add funds to your retirement accounts</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createContributionMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-account-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="401k">401(k)</SelectItem>
                          <SelectItem value="ira">Traditional IRA</SelectItem>
                          <SelectItem value="roth_ira">Roth IRA</SelectItem>
                          <SelectItem value="pension">Pension</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contribution Amount ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="500" data-testid="input-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-frequency">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="one_time">One-time</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full divine-gradient" 
                  disabled={createContributionMutation.isPending}
                  data-testid="button-submit-contribution"
                >
                  {createContributionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Contribute Now
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-balance">
              ${totalBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500" data-testid="text-growth">
              +${totalGrowth.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{avgGrowthRate.toFixed(1)}% return</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Contributions</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-contributions">
              ${totalContributions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected at 65</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-projected">
              ${(projectedRetirement / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">7% annual growth</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocation</CardTitle>
            <CardDescription>Distribution across retirement accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>Your retirement accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accounts.map(account => (
                <div key={account.symbol} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`account-${account.symbol}`}>
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground">
                      YTD: ${account.contributions.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${account.balance.toLocaleString()}</p>
                    <Badge variant="outline" className="text-green-500">
                      +{account.growth}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accounts" data-testid="tab-accounts">Accounts</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Contribution History</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retirement Account Details</CardTitle>
              <CardDescription>Detailed view of your retirement savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {accounts.map(account => (
                  <div key={account.symbol} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        <h3 className="font-semibold">{account.name}</h3>
                      </div>
                      <Badge>{account.growth}% growth</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p className="font-medium">${account.balance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Contributions</p>
                        <p className="font-medium">${account.contributions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Earnings</p>
                        <p className="font-medium text-green-500">
                          ${(account.balance - account.contributions).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>Your retirement contributions</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : retirementOrders.length > 0 ? (
                <div className="space-y-4">
                  {retirementOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`contribution-${order.id}`}>
                      <div>
                        <p className="font-medium">{order.symbol.replace("_", " ")}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.metadata?.frequency || "One-time"} contribution
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
                <p className="text-center text-muted-foreground py-8">No contributions yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
