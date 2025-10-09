import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  TrendingUp, 
  Shield, 
  Crown, 
  Gem, 
  Coins, 
  Calculator,
  CheckCircle,
  ArrowUpCircle,
  DollarSign,
  AlertCircle,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIER_ICONS: any = {
  royal_bronze: Shield,
  royal_silver: Coins,
  royal_gold: Gem,
  kings_court: Crown,
  king_david_circle: TrendingUp,
};

const TIER_COLORS: any = {
  royal_bronze: "from-amber-700 to-amber-900",
  royal_silver: "from-slate-400 to-slate-600",
  royal_gold: "from-yellow-400 to-yellow-600",
  kings_court: "from-purple-500 to-purple-700",
  king_david_circle: "from-blue-500 to-cyan-500",
};

const TIER_DATA = [
  {
    tier: "royal_bronze",
    name: "Royal Bronze",
    apy: 8,
    minStake: 1000,
    benefits: [
      "8% Annual Yield",
      "Daily Compound Interest",
      "24/7 Support",
      "Basic Dashboard Access",
    ],
  },
  {
    tier: "royal_silver",
    name: "Royal Silver",
    apy: 12,
    minStake: 10000,
    benefits: [
      "12% Annual Yield",
      "Priority Support",
      "Advanced Analytics",
      "Quarterly Bonus",
      "VIP Events Access",
    ],
  },
  {
    tier: "royal_gold",
    name: "Royal Gold",
    apy: 18,
    minStake: 100000,
    benefits: [
      "18% Annual Yield",
      "Dedicated Account Manager",
      "Premium Analytics Suite",
      "Monthly Bonus",
      "Exclusive Investment Opportunities",
      "Tax Optimization Tools",
    ],
  },
  {
    tier: "kings_court",
    name: "King's Court",
    apy: 25,
    minStake: 5000000,
    benefits: [
      "25% Annual Yield",
      "White Glove Service",
      "Custom Investment Strategies",
      "Weekly Performance Reviews",
      "Private Investment Fund Access",
      "Estate Planning Services",
      "Global Network Access",
    ],
  },
  {
    tier: "king_david_circle",
    name: "King David Circle",
    apy: 35,
    minStake: 10000000000,
    benefits: [
      "35% Annual Yield",
      "Ultra-Premium Concierge",
      "Bespoke Portfolio Management",
      "Daily Strategy Sessions",
      "Exclusive Deal Flow",
      "Family Office Integration",
      "Legacy Planning",
      "Kingdom Network Governance Rights",
    ],
  },
];

export default function SpectrumPlansPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [compoundAmount, setCompoundAmount] = useState("10000");
  const [compoundYears, setCompoundYears] = useState("5");

  // Fetch user info for KYC status
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Fetch all plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/spectrum/plans"],
  });

  // Fetch user's current position
  const { data: position, isLoading: positionLoading } = useQuery({
    queryKey: ["/api/spectrum/positions"],
  });

  // Fetch earnings history
  const { data: earnings = [] } = useQuery({
    queryKey: ["/api/spectrum/earnings"],
  });

  // Stake mutation
  const stakeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/spectrum/stake", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spectrum/positions"] });
      toast({
        title: "Success!",
        description: "Successfully staked in Spectrum plan!",
      });
      setSelectedPlan(null);
      setStakeAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to stake",
        variant: "destructive",
      });
    },
  });

  // Claim mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/spectrum/claim");
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/spectrum/positions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/spectrum/earnings"] });
      toast({
        title: "Rewards Claimed!",
        description: `Successfully claimed $${data.claimed}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim rewards",
        variant: "destructive",
      });
    },
  });

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/spectrum/upgrade", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spectrum/positions"] });
      toast({
        title: "Upgraded!",
        description: "Successfully upgraded to new tier!",
      });
      setSelectedPlan(null);
      setStakeAmount("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upgrade",
        variant: "destructive",
      });
    },
  });

  const handleStake = () => {
    if (!selectedPlan || !stakeAmount) return;
    
    const tierData = TIER_DATA.find(t => t.tier === selectedPlan.tier);
    if (tierData && parseFloat(stakeAmount) < tierData.minStake) {
      toast({
        title: "Invalid Amount",
        description: `Minimum stake for ${tierData.name} is $${tierData.minStake.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }
    
    stakeMutation.mutate({
      planId: selectedPlan.id,
      amount: stakeAmount,
      paymentMethod,
    });
  };

  const handleUpgrade = (plan: any) => {
    if (!position) return;
    
    const currentStake = parseFloat(position.stakedAmount);
    const newMinStake = parseFloat(plan.minimumStake);
    const additionalNeeded = Math.max(0, newMinStake - currentStake);
    
    upgradeMutation.mutate({
      planId: plan.id,
      additionalAmount: additionalNeeded.toString(),
      paymentMethod,
    });
  };

  const calculateCompoundInterest = () => {
    const principal = parseFloat(compoundAmount);
    const selectedTierData = TIER_DATA.find(t => position?.tier === t.tier);
    const rate = selectedTierData ? selectedTierData.apy / 100 : 0.08;
    const years = parseFloat(compoundYears);
    const n = 365; // Daily compounding

    const amount = principal * Math.pow(1 + rate / n, n * years);
    const interest = amount - principal;

    return {
      principal,
      interest,
      total: amount,
    };
  };

  const getCurrentTierData = () => {
    if (!position) return null;
    return TIER_DATA.find(t => t.tier === position.tier);
  };

  const compoundResult = position ? calculateCompoundInterest() : null;
  const currentTierData = getCurrentTierData();

  const kycApproved = user?.kycStatus === "approved";

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent" data-testid="text-page-title">
          Spectrum Investment Plans
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          High-yield staking with tiered rewards and exclusive Kingdom benefits
        </p>
      </div>

      {!kycApproved && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950" data-testid="alert-kyc-required">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">KYC Verification Required</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            You must complete KYC verification before you can stake in Spectrum plans.
            <Button variant="link" className="p-0 ml-2 text-yellow-600 hover:text-yellow-700" asChild>
              <a href="/kyc">Complete KYC Now →</a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">My Dashboard</TabsTrigger>
          <TabsTrigger value="compare" data-testid="tab-compare">Compare Tiers</TabsTrigger>
          <TabsTrigger value="calculator" data-testid="tab-calculator">Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {position && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Active Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Tier</p>
                    <p className="text-2xl font-bold" data-testid="text-current-tier">{currentTierData?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Staked Amount</p>
                    <p className="text-2xl font-bold" data-testid="text-staked-amount">
                      ${parseFloat(position.stakedAmount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current APY</p>
                    <p className="text-2xl font-bold text-green-500" data-testid="text-current-apy">
                      {position.currentApy}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                    <p className="text-2xl font-bold text-green-500" data-testid="text-total-earned">
                      ${parseFloat(position.totalEarned || "0").toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TIER_DATA.map((tier) => {
              const Icon = TIER_ICONS[tier.tier];
              const isCurrentTier = position?.tier === tier.tier;
              const canUpgrade = position && parseFloat(position.stakedAmount) >= tier.minStake && !isCurrentTier;

              return (
                <Card key={tier.tier} className={`relative overflow-hidden ${isCurrentTier ? 'border-2 border-primary' : ''}`} data-testid={`card-tier-${tier.tier}`}>
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${TIER_COLORS[tier.tier]}`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8" />
                      {isCurrentTier && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl" data-testid={`text-tier-name-${tier.tier}`}>{tier.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-green-500" data-testid={`text-tier-apy-${tier.tier}`}>{tier.apy}%</span> APY
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Minimum Stake</p>
                      <p className="text-xl font-bold" data-testid={`text-tier-min-${tier.tier}`}>
                        ${tier.minStake.toLocaleString()}
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="font-semibold">Benefits:</p>
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700" 
                          onClick={() => setSelectedPlan(plans.find((p: any) => p.tier === tier.tier))}
                          variant={isCurrentTier ? "outline" : canUpgrade ? "default" : "default"}
                          disabled={!kycApproved && !isCurrentTier}
                          data-testid={`button-select-tier-${tier.tier}`}
                        >
                          {isCurrentTier ? "Current Plan" : canUpgrade ? "Upgrade Now" : !kycApproved ? "KYC Required" : "Select Plan"}
                        </Button>
                      </DialogTrigger>
                      {selectedPlan?.tier === tier.tier && (
                        <DialogContent data-testid={`dialog-stake-${tier.tier}`}>
                          <DialogHeader>
                            <DialogTitle>
                              {position ? "Upgrade" : "Stake in"} {tier.name}
                            </DialogTitle>
                            <DialogDescription>
                              Minimum stake: ${tier.minStake.toLocaleString()} | APY: {tier.apy}%
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="stake-amount">Amount to Stake</Label>
                              <Input
                                id="stake-amount"
                                type="number"
                                placeholder={`Min: ${tier.minStake}`}
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(e.target.value)}
                                data-testid="input-stake-amount"
                              />
                            </div>
                            <div>
                              <Label htmlFor="payment-method">Payment Method</Label>
                              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger data-testid="select-payment-method">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="stripe">Stripe / Card</SelectItem>
                                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              className="w-full"
                              onClick={position ? () => handleUpgrade(selectedPlan) : handleStake}
                              disabled={stakeMutation.isPending || upgradeMutation.isPending}
                              data-testid="button-confirm-stake"
                            >
                              {stakeMutation.isPending || upgradeMutation.isPending
                                ? "Processing..."
                                : position
                                ? "Upgrade Tier"
                                : "Stake Now"}
                            </Button>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          {!position ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No active subscription. Select a plan to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card data-testid="card-staked-value">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Staked Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">${parseFloat(position.stakedAmount).toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card data-testid="card-accrued-rewards">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Accrued Rewards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-500">
                      ${parseFloat(position.accruedRewards || "0").toLocaleString()}
                    </p>
                    <Button
                      className="mt-4 w-full"
                      onClick={() => claimMutation.mutate()}
                      disabled={claimMutation.isPending || parseFloat(position.accruedRewards || "0") <= 0}
                      data-testid="button-claim-rewards"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Claim Rewards
                    </Button>
                  </CardContent>
                </Card>

                <Card data-testid="card-total-value">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">${parseFloat(position.totalValue || "0").toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>APY Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Current APY</span>
                        <span className="text-sm font-bold text-green-500" data-testid="text-dashboard-apy">
                          {position.currentApy}%
                        </span>
                      </div>
                      <Progress value={parseFloat(position.currentApy)} max={35} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your investment is growing at {position.currentApy}% annually with daily compounding.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {earnings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>APY</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {earnings.map((earning: any) => (
                          <TableRow key={earning.id} data-testid={`row-earning-${earning.id}`}>
                            <TableCell>{new Date(earning.distributedAt).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium text-green-500">
                              ${parseFloat(earning.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>{earning.apy}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="compare" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tier Comparison</CardTitle>
              <CardDescription>Compare features and benefits across all tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Feature</TableHead>
                      {TIER_DATA.map((tier) => (
                        <TableHead key={tier.tier} className="text-center" data-testid={`column-${tier.tier}`}>
                          {tier.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">APY</TableCell>
                      {TIER_DATA.map((tier) => (
                        <TableCell key={tier.tier} className="text-center font-bold text-green-500">
                          {tier.apy}%
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Minimum Stake</TableCell>
                      {TIER_DATA.map((tier) => (
                        <TableCell key={tier.tier} className="text-center">
                          ${tier.minStake.toLocaleString()}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Support Level</TableCell>
                      <TableCell className="text-center">24/7</TableCell>
                      <TableCell className="text-center">Priority</TableCell>
                      <TableCell className="text-center">Dedicated Manager</TableCell>
                      <TableCell className="text-center">White Glove</TableCell>
                      <TableCell className="text-center">Ultra-Premium</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Analytics</TableCell>
                      <TableCell className="text-center">Basic</TableCell>
                      <TableCell className="text-center">Advanced</TableCell>
                      <TableCell className="text-center">Premium Suite</TableCell>
                      <TableCell className="text-center">Custom Strategies</TableCell>
                      <TableCell className="text-center">Bespoke Portfolio</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Exclusive Benefits</TableCell>
                      <TableCell className="text-center">-</TableCell>
                      <TableCell className="text-center">VIP Events</TableCell>
                      <TableCell className="text-center">Investment Opportunities</TableCell>
                      <TableCell className="text-center">Private Fund Access</TableCell>
                      <TableCell className="text-center">Governance Rights</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Compound Interest Calculator
              </CardTitle>
              <CardDescription>
                See how your investment grows with compound interest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calc-amount">Initial Investment</Label>
                  <Input
                    id="calc-amount"
                    type="number"
                    value={compoundAmount}
                    onChange={(e) => setCompoundAmount(e.target.value)}
                    data-testid="input-calc-amount"
                  />
                </div>
                <div>
                  <Label htmlFor="calc-years">Years</Label>
                  <Input
                    id="calc-years"
                    type="number"
                    value={compoundYears}
                    onChange={(e) => setCompoundYears(e.target.value)}
                    data-testid="input-calc-years"
                  />
                </div>
              </div>

              {position && compoundResult && (
                <div className="space-y-4">
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Principal</p>
                      <p className="text-2xl font-bold" data-testid="text-calc-principal">
                        ${compoundResult.principal.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Interest Earned</p>
                      <p className="text-2xl font-bold text-green-500" data-testid="text-calc-interest">
                        ${compoundResult.interest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-calc-total">
                        ${compoundResult.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    With {currentTierData?.apy}% APY and daily compounding over {compoundYears} years
                  </p>
                </div>
              )}

              {!position && (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p className="text-muted-foreground">
                    Select a plan to use the compound interest calculator
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
