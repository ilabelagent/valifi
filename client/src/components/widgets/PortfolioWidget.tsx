import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

export default function PortfolioWidget() {
  const { data: wallets, isLoading } = useQuery<any[]>({
    queryKey: ['/api/wallets'],
  });

  const totalBalance = wallets?.reduce((sum, w) => sum + parseFloat(w.balance || "0"), 0) || 0;
  
  const portfolioData = wallets?.map((wallet, idx) => ({
    name: wallet.network,
    value: parseFloat(wallet.balance || "0"),
    color: COLORS[idx % COLORS.length]
  })).filter(item => item.value > 0) || [];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Portfolio Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="widget-portfolio">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Portfolio Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="text-3xl font-bold" data-testid="text-total-balance">
              ${totalBalance.toFixed(2)}
            </p>
            <div className="flex items-center gap-1 text-sm text-green-500 mt-1">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5%</span>
            </div>
          </div>
          
          {portfolioData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `$${parseFloat(value).toFixed(2)}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No portfolio data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
