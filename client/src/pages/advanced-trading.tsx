import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Zap, DollarSign, Link2, Sparkles, TrendingUp, Cpu, Pickaxe } from "lucide-react";

export default function AdvancedTrading() {
  const features = [
    { id: "amm", name: "AMM", icon: Activity, desc: "Automated Market Maker", testId: "amm" },
    { id: "liquidity", name: "Liquidity", icon: DollarSign, desc: "LP Management", testId: "liquidity" },
    { id: "defi", name: "DeFi", icon: Sparkles, desc: "Protocol Automation", testId: "defi" },
    { id: "bridge", name: "Bridge", icon: Link2, desc: "Cross-chain Bridging", testId: "bridge" },
    { id: "lending", name: "Lending", icon: TrendingUp, desc: "Borrow & Lend", testId: "lending" },
    { id: "gas", name: "Gas Optimizer", icon: Zap, desc: "Gas Savings", testId: "gas" },
    { id: "mining", name: "Mining", icon: Pickaxe, desc: "Mining Management", testId: "mining" },
    { id: "advanced", name: "Advanced", icon: Cpu, desc: "Flash Loans & Arbitrage", testId: "advanced" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold divine-gradient-text">Advanced Trading & DeFi</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AMM, Liquidity, Bridges, Lending, Gas Optimization & More
            </p>
          </div>
          <Badge variant="default" className="flex items-center gap-1" data-testid="badge-trading-count">
            <Cpu className="h-3 w-3" />
            8 Bots
          </Badge>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.id} className="hover-elevate" data-testid={`card-${feature.testId}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <feature.icon className="h-4 w-4 text-primary" />
                    {feature.name}
                  </CardTitle>
                  <Badge variant="default" data-testid={`badge-${feature.testId}-status`}>Active</Badge>
                </div>
                <CardDescription>{feature.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="sm" className="w-full" data-testid={`button-manage-${feature.testId}`}>
                  Manage
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
