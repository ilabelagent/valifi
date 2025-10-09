import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Activity, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function TradingBotStatus() {
  const { data: bots, isLoading } = useQuery({
    queryKey: ["/api/trading-bots"],
  });

  const activeBots = (bots && Array.isArray(bots)) ? bots.filter((bot: any) => bot.isActive) : [];
  const avgWinRate = activeBots.length > 0 
    ? activeBots.reduce((sum: number, bot: any) => sum + parseFloat(bot.winRate || "0"), 0) / activeBots.length
    : 0;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-4" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="card-trading-bot-status">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Trading Bot Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Active Bots</p>
              <p className="text-2xl font-bold" data-testid="text-active-bots">
                {activeBots.length}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-green-500" data-testid="text-win-rate">
                {avgWinRate.toFixed(1)}%
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            {activeBots.slice(0, 3).map((bot: any) => (
              <div key={bot.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-green-500" />
                  <span className="text-xs font-medium">{bot.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {bot.strategy}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
