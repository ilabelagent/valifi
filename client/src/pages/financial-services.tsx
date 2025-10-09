import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, PiggyBank, Building2, BarChart3, Bitcoin, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export default function FinancialServices() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [priceUpdates, setPriceUpdates] = useState<Record<string, MarketData>>({});

  // Initialize WebSocket for real-time updates
  useEffect(() => {
    const newSocket = io();
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      newSocket.emit("subscribe:trading");
    });

    newSocket.on("trading:event", (event: any) => {
      if (event.type === "pnl_update" && event.data?.marketData) {
        setPriceUpdates(prev => ({
          ...prev,
          [event.data.marketData.symbol]: event.data.marketData
        }));
      }
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch stock data with 30s auto-refresh
  const { data: stocksData, isLoading: stocksLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market/stocks'],
    queryFn: async () => {
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'SPY'];
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          const res = await fetch(`/api/market/stock/${symbol}`);
          return res.json();
        })
      );
      return results;
    },
    refetchInterval: 30000, // 30 seconds
  });

  // Fetch forex data with 30s auto-refresh
  const { data: forexData, isLoading: forexLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market/forex'],
    queryFn: async () => {
      const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
      const results = await Promise.all(
        pairs.map(async (pair) => {
          const res = await fetch(`/api/market/forex/${pair}`);
          return res.json();
        })
      );
      return results;
    },
    refetchInterval: 30000,
  });

  // Fetch metals data with 30s auto-refresh
  const { data: metalsData, isLoading: metalsLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market/metals'],
    queryFn: async () => {
      const metals = ['gold', 'silver', 'platinum'];
      const results = await Promise.all(
        metals.map(async (metal) => {
          const res = await fetch(`/api/market/metal/${metal}`);
          return res.json();
        })
      );
      return results;
    },
    refetchInterval: 30000,
  });

  // Fetch bonds data with 30s auto-refresh
  const { data: bondsData, isLoading: bondsLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market/bonds'],
    queryFn: async () => {
      const res = await fetch('/api/market/bonds/treasury');
      return res.json();
    },
    refetchInterval: 30000,
  });

  // Generate mock historical data for charts
  const generateChartData = (currentPrice: number) => {
    const data = [];
    const now = Date.now();
    for (let i = 23; i >= 0; i--) {
      const variance = (Math.random() - 0.5) * (currentPrice * 0.02);
      data.push({
        time: new Date(now - i * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit' }),
        price: currentPrice + variance,
      });
    }
    return data;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const formatted = value.toFixed(2);
    return value >= 0 ? `+${formatted}%` : `${formatted}%`;
  };

  const PriceChangeIndicator = ({ change, changePercent }: { change: number; changePercent: number }) => {
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span className="text-xs font-medium">{formatPercent(changePercent)}</span>
      </div>
    );
  };
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold divine-gradient-text">Financial Services</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Traditional finance bots: 401k, IRA, Stocks, Bonds, Forex, and more
            </p>
          </div>
          <Badge variant="default" className="flex items-center gap-1" data-testid="badge-services-count">
            <BarChart3 className="h-3 w-3" />
            13 Services
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="retirement" className="space-y-4" data-testid="tabs-financial">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="retirement" data-testid="tab-retirement">Retirement</TabsTrigger>
            <TabsTrigger value="trading" data-testid="tab-trading">Trading</TabsTrigger>
            <TabsTrigger value="investments" data-testid="tab-investments">Investments</TabsTrigger>
            <TabsTrigger value="derivatives" data-testid="tab-derivatives">Derivatives</TabsTrigger>
          </TabsList>

          {/* Retirement Accounts */}
          <TabsContent value="retirement" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* 401k Bot */}
              <Card className="hover-elevate" data-testid="card-401k">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-primary" />
                      401k Manager
                    </CardTitle>
                    <Badge variant="default" data-testid="badge-401k-status">Active</Badge>
                  </div>
                  <CardDescription>Retirement account management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Balance</span>
                      <span className="font-semibold" data-testid="text-401k-balance">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Contribution Rate</span>
                      <span data-testid="text-401k-rate">0%</span>
                    </div>
                    <Link href="/trading">
                      <Button size="sm" className="w-full mt-2" data-testid="button-manage-401k">
                        Manage 401k
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* IRA Bot */}
              <Card className="hover-elevate" data-testid="card-ira">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      IRA Account
                    </CardTitle>
                    <Badge variant="default" data-testid="badge-ira-status">Active</Badge>
                  </div>
                  <CardDescription>Individual retirement account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span data-testid="text-ira-type">Traditional</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">2025 Limit</span>
                      <span data-testid="text-ira-limit">$7,000</span>
                    </div>
                    <Link href="/trading">
                      <Button size="sm" className="w-full mt-2" data-testid="button-manage-ira">
                        Manage IRA
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Pension Bot */}
              <Card className="hover-elevate" data-testid="card-pension">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Pension Fund
                    </CardTitle>
                    <Badge variant="default" data-testid="badge-pension-status">Active</Badge>
                  </div>
                  <CardDescription>Pension benefit management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Benefit</span>
                      <span data-testid="text-pension-benefit">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Start Age</span>
                      <span data-testid="text-pension-age">65</span>
                    </div>
                    <Link href="/trading">
                      <Button size="sm" className="w-full mt-2" data-testid="button-manage-pension">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trading */}
          <TabsContent value="trading" className="space-y-4">
            {/* Real-Time Price Ticker */}
            <Card className="border-primary/20" data-testid="card-price-ticker">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Live Market Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stocksLoading ? (
                  <div className="flex gap-4 overflow-x-auto">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-32 flex-shrink-0" />)}
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {stocksData?.map(stock => (
                      <div key={stock.symbol} className="flex-shrink-0 bg-muted/50 rounded-lg p-3 min-w-[140px]" data-testid={`ticker-${stock.symbol.toLowerCase()}`}>
                        <div className="text-xs text-muted-foreground">{stock.symbol}</div>
                        <div className="text-lg font-bold">{formatCurrency(stock.price)}</div>
                        <PriceChangeIndicator change={stock.change} changePercent={stock.changePercent} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Stocks Bot with Live Data */}
              <Card className="hover-elevate" data-testid="card-stocks">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Stock Trading
                    </CardTitle>
                    <Badge variant="default" data-testid="badge-stocks-status">
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Live
                    </Badge>
                  </div>
                  <CardDescription>Automated stock trading</CardDescription>
                </CardHeader>
                <CardContent>
                  {stocksLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : stocksData && stocksData[0] ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">SPY Price</span>
                        <span className="font-semibold" data-testid="text-stocks-value">
                          {formatCurrency(stocksData.find(s => s.symbol === 'SPY')?.price || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-muted-foreground">Day Change</span>
                        <PriceChangeIndicator 
                          change={stocksData.find(s => s.symbol === 'SPY')?.change || 0} 
                          changePercent={stocksData.find(s => s.symbol === 'SPY')?.changePercent || 0} 
                        />
                      </div>
                      <div className="h-24 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={generateChartData(stocksData.find(s => s.symbol === 'SPY')?.price || 0)}>
                            <defs>
                              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="price" stroke="#22c55e" fillOpacity={1} fill="url(#stockGradient)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <Button size="sm" className="w-full" data-testid="button-trade-stocks">
                        Quick Trade
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Forex Bot with Live Data */}
              <Card className="hover-elevate" data-testid="card-forex">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Forex Trading
                    </CardTitle>
                    <Badge variant="default" data-testid="badge-forex-status">
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Live
                    </Badge>
                  </div>
                  <CardDescription>Foreign exchange trading</CardDescription>
                </CardHeader>
                <CardContent>
                  {forexLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : forexData && forexData[0] ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">EUR/USD</span>
                        <span className="font-semibold" data-testid="text-forex-pairs">
                          {forexData.find(f => f.symbol === 'EUR/USD')?.price.toFixed(4) || '0.0000'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-muted-foreground">24h Change</span>
                        <PriceChangeIndicator 
                          change={forexData.find(f => f.symbol === 'EUR/USD')?.change || 0} 
                          changePercent={forexData.find(f => f.symbol === 'EUR/USD')?.changePercent || 0} 
                        />
                      </div>
                      <div className="h-24 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={generateChartData(forexData.find(f => f.symbol === 'EUR/USD')?.price || 1)}>
                            <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <Button size="sm" className="w-full" data-testid="button-trade-forex">
                        Quick Trade
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {/* Options Bot */}
              <Card className="hover-elevate" data-testid="card-options">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Options Trading
                    </CardTitle>
                    <Badge variant="default" data-testid="badge-options-status">Active</Badge>
                  </div>
                  <CardDescription>Options strategies & Greeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Open Positions</span>
                      <span data-testid="text-options-positions">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Delta</span>
                      <span data-testid="text-options-delta">0.00</span>
                    </div>
                    <Link href="/trading">
                      <Button size="sm" className="w-full mt-2" data-testid="button-trade-options">
                        Trade Options
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Investments */}
          <TabsContent value="investments" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover-elevate" data-testid="card-bonds">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Bonds</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold" data-testid="text-bonds-value">$0.00</p>
                  <p className="text-xs text-muted-foreground">Portfolio value</p>
                  <Link href="/trading">
                    <Button size="sm" className="w-full mt-3" data-testid="button-manage-bonds">Manage</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-reit">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">REITs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold" data-testid="text-reit-value">$0.00</p>
                  <p className="text-xs text-muted-foreground">Real estate trusts</p>
                  <Link href="/trading">
                    <Button size="sm" className="w-full mt-3" data-testid="button-manage-reit">Manage</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-mutual-funds">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Mutual Funds</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold" data-testid="text-funds-value">$0.00</p>
                  <p className="text-xs text-muted-foreground">Fund holdings</p>
                  <Link href="/trading">
                    <Button size="sm" className="w-full mt-3" data-testid="button-manage-funds">Manage</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-commodities">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Commodities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold" data-testid="text-commodities-value">$0.00</p>
                  <p className="text-xs text-muted-foreground">Futures & physical</p>
                  <Link href="/metals">
                    <Button size="sm" className="w-full mt-3" data-testid="button-manage-commodities">Manage</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Derivatives & Advanced */}
          <TabsContent value="derivatives" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover-elevate" data-testid="card-crypto-derivatives">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bitcoin className="h-4 w-4 text-primary" />
                      Crypto Derivatives
                    </CardTitle>
                    <Badge variant="default" data-testid="badge-crypto-deriv-status">Active</Badge>
                  </div>
                  <CardDescription>Perpetuals & crypto futures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Open Positions</span>
                      <span data-testid="text-crypto-deriv-positions">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total PnL</span>
                      <span data-testid="text-crypto-deriv-pnl">$0.00</span>
                    </div>
                    <Link href="/exchange">
                      <Button size="sm" className="w-full mt-2" data-testid="button-trade-crypto-deriv">
                        Trade Perpetuals
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-metals">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">Precious Metals</CardTitle>
                    <Badge variant="default" data-testid="badge-metals-status">Active</Badge>
                  </div>
                  <CardDescription>Gold, Silver, Platinum</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Holdings</span>
                      <span data-testid="text-metals-holdings">0 oz</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Value</span>
                      <span data-testid="text-metals-value">$0.00</span>
                    </div>
                    <Link href="/metals">
                      <Button size="sm" className="w-full mt-2" data-testid="button-trade-metals">
                        Trade Metals
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-portfolio">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">Portfolio Manager</CardTitle>
                    <Badge variant="default" data-testid="badge-portfolio-status">Active</Badge>
                  </div>
                  <CardDescription>Cross-asset rebalancing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total AUM</span>
                      <span className="font-semibold" data-testid="text-portfolio-aum">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sharpe Ratio</span>
                      <span data-testid="text-portfolio-sharpe">0.00</span>
                    </div>
                    <Link href="/analytics-intelligence">
                      <Button size="sm" className="w-full mt-2" data-testid="button-manage-portfolio">
                        Rebalance
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
