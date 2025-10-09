import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PortfolioOverview() {
  const { data: wallets, isLoading } = useQuery({
    queryKey: ["/api/wallets"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const totalBalance = (wallets && Array.isArray(wallets)) ? wallets.reduce((sum: number, wallet: any) => {
    return sum + parseFloat(wallet.balance || "0");
  }, 0) : 0;

  const calculateProfitLoss = () => {
    if (!transactions || !Array.isArray(transactions)) return { value: 0, percentage: 0 };
    
    const recentTx = transactions.slice(0, 10);
    const profit = recentTx.reduce((sum: number, tx: any) => {
      return sum + (parseFloat(tx.profit || "0"));
    }, 0);
    
    const percentage = totalBalance > 0 ? (profit / totalBalance) * 100 : 0;
    return { value: profit, percentage };
  };

  const profitLoss = calculateProfitLoss();
  const isProfit = profitLoss.value >= 0;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-40 mb-4" />
          <Skeleton className="h-6 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="card-portfolio-overview">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Portfolio Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
            <p className="text-3xl font-bold" data-testid="text-total-balance">
              ${totalBalance.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isProfit ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">Profit/Loss</p>
              <p className={`text-lg font-semibold ${isProfit ? 'text-green-500' : 'text-red-500'}`} data-testid="text-profit-loss">
                {isProfit ? '+' : ''}{profitLoss.value.toFixed(2)} ({profitLoss.percentage.toFixed(2)}%)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
