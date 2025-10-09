import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface MarketPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export function LiveMarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([
    { symbol: "BTC/USD", price: 43250.00, change: 1234.50, changePercent: 2.94 },
    { symbol: "ETH/USD", price: 2280.45, change: -45.20, changePercent: -1.94 },
    { symbol: "AAPL", price: 182.52, change: 3.15, changePercent: 1.76 },
    { symbol: "GOLD", price: 2045.30, change: 12.80, changePercent: 0.63 },
  ]);

  useEffect(() => {
    const socket: Socket = io();
    
    socket.emit("subscribe:market");
    
    socket.on("market:update", (data: any) => {
      if (data.prices) {
        setPrices(data.prices);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Card className="h-full" data-testid="card-live-market-prices">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Live Market Prices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prices.map((item) => {
            const isPositive = item.change >= 0;
            return (
              <div key={item.symbol} className="flex items-center justify-between" data-testid={`market-price-${item.symbol.toLowerCase().replace('/', '-')}`}>
                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">{item.symbol}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                  <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
