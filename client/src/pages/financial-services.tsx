import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, PiggyBank, Building2, BarChart3, Bitcoin } from "lucide-react";
import { Link } from "wouter";

export default function FinancialServices() {
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Stocks Bot */}
              <Card className="hover-elevate" data-testid="card-stocks">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Stock Trading
                    </CardTitle>
                    <Badge variant="default" data-testid="badge-stocks-status">Active</Badge>
                  </div>
                  <CardDescription>Automated stock trading</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Portfolio Value</span>
                      <span className="font-semibold" data-testid="text-stocks-value">$0.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Day Change</span>
                      <span className="text-green-600" data-testid="text-stocks-change">+0.00%</span>
                    </div>
                    <Link href="/trading">
                      <Button size="sm" className="w-full mt-2" data-testid="button-trade-stocks">
                        Trade Stocks
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Forex Bot */}
              <Card className="hover-elevate" data-testid="card-forex">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Forex Trading
                    </CardTitle>
                    <Badge variant="default" data-testid="badge-forex-status">Active</Badge>
                  </div>
                  <CardDescription>Foreign exchange trading</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Active Pairs</span>
                      <span data-testid="text-forex-pairs">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Daily P&L</span>
                      <span data-testid="text-forex-pnl">$0.00</span>
                    </div>
                    <Link href="/trading">
                      <Button size="sm" className="w-full mt-2" data-testid="button-trade-forex">
                        Trade Forex
                      </Button>
                    </Link>
                  </div>
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
