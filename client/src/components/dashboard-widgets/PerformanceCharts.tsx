import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PerformanceCharts() {
  const { data: executions, isLoading } = useQuery({
    queryKey: ["/api/bot-executions"],
  });

  const chartData = (executions && Array.isArray(executions)) 
    ? executions.slice(0, 30).reverse().map((exec: any, index: number) => ({
        name: `T${index + 1}`,
        profit: parseFloat(exec.profit || "0"),
      }))
    : [];

  const totalProfit = (executions && Array.isArray(executions))
    ? executions.reduce((sum: number, exec: any) => {
        return sum + parseFloat(exec.profit || "0");
      }, 0)
    : 0;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="card-performance-charts">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Profit</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="text-total-profit">
                ${totalProfit.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Trades</p>
              <p className="text-2xl font-bold" data-testid="text-total-trades">
                {executions?.length || 0}
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
