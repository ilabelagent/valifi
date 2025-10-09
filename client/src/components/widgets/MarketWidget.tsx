import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const mockMarketData = [
  { symbol: "BTC", name: "Bitcoin", price: 67234.50, change: 5.2, changePercent: 0.008 },
  { symbol: "ETH", name: "Ethereum", price: 3542.10, change: -23.4, changePercent: -0.0066 },
  { symbol: "USDT", name: "Tether", price: 1.00, change: 0.001, changePercent: 0.0001 },
  { symbol: "SOL", name: "Solana", price: 142.34, change: 8.7, changePercent: 0.065 },
];

export default function MarketWidget() {
  const { data: markets = mockMarketData, isLoading } = useQuery<any[]>({
    queryKey: ['/api/market/prices'],
    initialData: mockMarketData,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Market Prices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="widget-market">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Market Prices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {markets.map((market) => (
            <div 
              key={market.symbol} 
              className="flex items-center justify-between py-2 border-b last:border-0"
              data-testid={`market-item-${market.symbol}`}
            >
              <div>
                <p className="font-semibold">{market.symbol}</p>
                <p className="text-xs text-muted-foreground">{market.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold" data-testid={`price-${market.symbol}`}>
                  ${market.price.toLocaleString()}
                </p>
                <div className={`flex items-center gap-1 text-sm ${
                  market.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {market.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}</span>
                  <span>({(market.changePercent * 100).toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
