import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, TrendingUp, Target, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function BotPerformanceWidget() {
  const { data: bots, isLoading } = useQuery<any[]>({
    queryKey: ['/api/trading-bots'],
  });

  const activeBots = bots?.filter(bot => bot.isActive) || [];
  const totalProfit = bots?.reduce((sum, bot) => sum + parseFloat(bot.totalProfit || "0"), 0) || 0;
  const avgWinRate = bots?.length 
    ? bots.reduce((sum, bot) => sum + parseFloat(bot.winRate || "0"), 0) / bots.length 
    : 0;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Bot Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="widget-bot-performance">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Bot Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Bots</p>
              <p className="text-2xl font-bold" data-testid="text-active-bots">
                {activeBots.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Profit</p>
              <p className="text-2xl font-bold text-green-500" data-testid="text-total-profit">
                ${totalProfit.toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Win Rate</p>
              <p className="text-sm font-semibold">{avgWinRate.toFixed(1)}%</p>
            </div>
            <Progress value={avgWinRate} className="h-2" />
          </div>

          <div className="space-y-2">
            {bots?.slice(0, 3).map((bot) => (
              <div 
                key={bot.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                data-testid={`bot-item-${bot.id}`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium">{bot.name}</p>
                    <p className="text-xs text-muted-foreground">{bot.strategy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    parseFloat(bot.totalProfit || "0") >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    ${parseFloat(bot.totalProfit || "0").toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bot.winRate}% win
                  </p>
                </div>
              </div>
            ))}
          </div>

          {(!bots || bots.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No trading bots configured
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
