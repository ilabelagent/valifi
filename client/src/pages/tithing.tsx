import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Heart, TrendingUp, FileText, Download, DollarSign, CheckCircle, Clock, XCircle, Gift } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function TithingPage() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [manualAmount, setManualAmount] = useState("");

  const { data: charities, isLoading: charitiesLoading } = useQuery({
    queryKey: ["/api/tithing/charities"],
  });

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["/api/tithing/config"],
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/tithing/history"],
  });

  const { data: impact, isLoading: impactLoading } = useQuery({
    queryKey: ["/api/tithing/impact"],
  });

  const { data: taxReport } = useQuery({
    queryKey: ["/api/tithing/tax-report", selectedYear],
    enabled: !!selectedYear,
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/tithing/config", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tithing/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tithing/impact"] });
      toast({
        title: "✝️ Configuration Saved",
        description: "Your tithing settings have been updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save configuration",
        variant: "destructive",
      });
    },
  });

  const executeManualTitheMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/tithing/execute", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tithing/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tithing/impact"] });
      setManualAmount("");
      toast({
        title: "✝️ Tithe Sent",
        description: "Your offering has been sent to the selected charity",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to execute tithe",
        variant: "destructive",
      });
    },
  });

  const [localConfig, setLocalConfig] = useState({
    percentage: config?.percentage || "10",
    charityId: config?.charityId || "",
    enabled: config?.enabled ?? true,
    autoExecute: config?.autoExecute ?? true,
    minProfitThreshold: config?.minProfitThreshold || "0",
  });

  const handleSaveConfig = () => {
    saveConfigMutation.mutate(localConfig);
  };

  const handleManualTithe = () => {
    if (!manualAmount || !localConfig.charityId) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and select a charity",
        variant: "destructive",
      });
      return;
    }

    executeManualTitheMutation.mutate({
      amount: manualAmount,
      charityId: localConfig.charityId,
      notes: "Manual tithe offering",
    });
  };

  const downloadStatement = async () => {
    try {
      const response = await fetch(`/api/tithing/statement/${selectedYear}`, {
        credentials: 'include',
      });
      const statement = await response.text();
      
      const blob = new Blob([statement], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `giving-statement-${selectedYear}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "✝️ Statement Downloaded",
        description: `Tax statement for ${selectedYear} has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download statement",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (configLoading || charitiesLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const selectedCharity = charities?.find((c: any) => c.id === localConfig.charityId);
  const charityBreakdownData = impact?.charityBreakdown?.map((item: any, index: number) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  })) || [];

  const monthlyData = impact?.monthlyGiving?.map((item: any) => ({
    month: item.month.substring(5),
    amount: parseFloat(item.amount),
  })) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Heart className="h-8 w-8 text-red-500" />
            Auto-Tithing System
          </h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            Give cheerfully, automatically - "God loves a cheerful giver" (2 Corinthians 9:7)
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="configure" data-testid="tab-configure">Configure</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
          <TabsTrigger value="tax" data-testid="tab-tax">Tax Report</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card data-testid="card-total-given">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Given</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-given">
                  ${impactLoading ? "..." : impact?.totalGiven || "0"}
                </div>
                <p className="text-xs text-muted-foreground">All-time charitable giving</p>
              </CardContent>
            </Card>

            <Card data-testid="card-transactions">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-transactions">
                  {impactLoading ? "..." : impact?.totalTransactions || 0}
                </div>
                <p className="text-xs text-muted-foreground">Completed tithes</p>
              </CardContent>
            </Card>

            <Card data-testid="card-current-percentage">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Rate</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-current-percentage">
                  {impact?.currentPercentage || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {impact?.autoTithingEnabled ? "Auto-tithe enabled" : "Auto-tithe disabled"}
                </p>
              </CardContent>
            </Card>
          </div>

          {impact?.currentCharity && (
            <Card data-testid="card-current-charity">
              <CardHeader>
                <CardTitle>Current Charity</CardTitle>
                <CardDescription>{impact.currentCharity.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium" data-testid="text-charity-name">{impact.currentCharity.name}</span>
                    <Badge data-testid="badge-charity-category">{impact.currentCharity.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card data-testid="card-charity-breakdown">
              <CardHeader>
                <CardTitle>Giving by Charity</CardTitle>
                <CardDescription>Distribution of your charitable gifts</CardDescription>
              </CardHeader>
              <CardContent>
                {charityBreakdownData.length > 0 ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={charityBreakdownData}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {charityBreakdownData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {charityBreakdownData.map((item: any) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium">${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">No giving history yet</div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-monthly-giving">
              <CardHeader>
                <CardTitle>Monthly Giving Trend</CardTitle>
                <CardDescription>Your charitable contributions over time</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted-foreground py-8">No data available</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configure" className="space-y-6">
          <Card data-testid="card-configure">
            <CardHeader>
              <CardTitle>Tithing Configuration</CardTitle>
              <CardDescription>
                Configure your automatic charitable giving settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="charity-select">Select Charity</Label>
                <Select
                  value={localConfig.charityId}
                  onValueChange={(value) => setLocalConfig({ ...localConfig, charityId: value })}
                >
                  <SelectTrigger id="charity-select" data-testid="select-charity">
                    <SelectValue placeholder="Choose a charity" />
                  </SelectTrigger>
                  <SelectContent>
                    {charities?.map((charity: any) => (
                      <SelectItem key={charity.id} value={charity.id} data-testid={`option-charity-${charity.id}`}>
                        {charity.name} - {charity.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCharity && (
                  <p className="text-sm text-muted-foreground" data-testid="text-charity-description">
                    {selectedCharity.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="percentage-slider">Tithing Percentage</Label>
                  <span className="text-sm font-medium" data-testid="text-percentage-value">{localConfig.percentage}%</span>
                </div>
                <Slider
                  id="percentage-slider"
                  data-testid="slider-percentage"
                  min={0}
                  max={20}
                  step={0.5}
                  value={[parseFloat(localConfig.percentage)]}
                  onValueChange={(value) =>
                    setLocalConfig({ ...localConfig, percentage: value[0].toString() })
                  }
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  This percentage of your trading profits will be automatically given to charity
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-threshold">Minimum Profit Threshold ($)</Label>
                <Input
                  id="min-threshold"
                  data-testid="input-min-threshold"
                  type="number"
                  step="0.01"
                  value={localConfig.minProfitThreshold}
                  onChange={(e) =>
                    setLocalConfig({ ...localConfig, minProfitThreshold: e.target.value })
                  }
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Only tithe on profits above this threshold
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Auto-Tithing</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically tithe from profitable trades
                  </p>
                </div>
                <Switch
                  data-testid="switch-auto-tithe"
                  checked={localConfig.autoExecute}
                  onCheckedChange={(checked) =>
                    setLocalConfig({ ...localConfig, autoExecute: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Tithing System</Label>
                  <p className="text-xs text-muted-foreground">
                    Master switch for all tithing features
                  </p>
                </div>
                <Switch
                  data-testid="switch-enable"
                  checked={localConfig.enabled}
                  onCheckedChange={(checked) =>
                    setLocalConfig({ ...localConfig, enabled: checked })
                  }
                />
              </div>

              <Button
                onClick={handleSaveConfig}
                className="w-full"
                disabled={saveConfigMutation.isPending}
                data-testid="button-save-config"
              >
                {saveConfigMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-manual-tithe">
            <CardHeader>
              <CardTitle>Manual Tithe</CardTitle>
              <CardDescription>Make a one-time charitable gift</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-amount">Amount ($)</Label>
                <Input
                  id="manual-amount"
                  data-testid="input-manual-amount"
                  type="number"
                  step="0.01"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <Button
                onClick={handleManualTithe}
                className="w-full"
                disabled={executeManualTitheMutation.isPending || !manualAmount}
                data-testid="button-execute-manual-tithe"
              >
                {executeManualTitheMutation.isPending ? "Processing..." : "Send Tithe"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card data-testid="card-history">
            <CardHeader>
              <CardTitle>Giving History</CardTitle>
              <CardDescription>All your charitable contributions</CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : history && history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Charity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tx Hash</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((record: any) => (
                      <TableRow key={record.id} data-testid={`row-history-${record.id}`}>
                        <TableCell data-testid={`cell-date-${record.id}`}>
                          {new Date(record.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell data-testid={`cell-charity-${record.id}`}>
                          {charities?.find((c: any) => c.id === record.charityId)?.name || "Unknown"}
                        </TableCell>
                        <TableCell data-testid={`cell-amount-${record.id}`}>${parseFloat(record.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            <Badge variant={record.status === "completed" ? "default" : "secondary"}>
                              {record.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell data-testid={`cell-txhash-${record.id}`}>
                          {record.txHash ? (
                            <span className="text-xs font-mono">{record.txHash.substring(0, 16)}...</span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No giving history yet. Start tithing to see your impact!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <Card data-testid="card-tax-report">
            <CardHeader>
              <CardTitle>Tax Deduction Report</CardTitle>
              <CardDescription>Generate your annual charitable giving statement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]" data-testid="select-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                      <SelectItem key={year} value={year.toString()} data-testid={`option-year-${year}`}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={downloadStatement} data-testid="button-download-statement">
                  <Download className="h-4 w-4 mr-2" />
                  Download Statement
                </Button>
              </div>

              {taxReport && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Given in {selectedYear}</p>
                      <p className="text-2xl font-bold" data-testid="text-tax-total">${taxReport.totalGiven}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Number of Gifts</p>
                      <p className="text-2xl font-bold" data-testid="text-tax-count">{taxReport.transactionCount}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Charities</h3>
                    {taxReport.charities?.map((charity: any) => (
                      <div key={charity.charityId} className="p-4 border rounded-lg space-y-2" data-testid={`card-tax-charity-${charity.charityId}`}>
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{charity.charityName}</h4>
                          <span className="text-sm text-muted-foreground">EIN: {charity.taxId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {charity.transactionCount} donations
                          </span>
                          <span className="font-semibold">${charity.totalDonated.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
