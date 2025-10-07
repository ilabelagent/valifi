import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { insertMixingRequestSchema, type MixingRequest } from "@shared/schema";
import {
  ShieldCheck,
  Shuffle,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Crown
} from "lucide-react";
import { useState } from "react";

const mixingFormSchema = insertMixingRequestSchema.omit({ userId: true }).extend({
  inputAddress: z.string().min(10, "Valid wallet address required"),
  outputAddress: z.string().min(10, "Valid wallet address required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  coin: z.string().min(1, "Coin selection required"),
  delayHours: z.coerce.number().min(0).max(168), // Max 1 week
});

type MixingForm = z.infer<typeof mixingFormSchema>;

export default function MixerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);

  const { data: requests, isLoading, isError, refetch } = useQuery<MixingRequest[]>({
    queryKey: ["/api/mixer/requests"],
    refetchInterval: 5000, // Real-time updates
  });

  const form = useForm<MixingForm>({
    resolver: zodResolver(mixingFormSchema),
    defaultValues: {
      coin: "BTC",
      delayHours: 2,
      amount: 0,
    },
  });

  const createMixingMutation = useMutation({
    mutationFn: async (data: MixingForm) => {
      const response = await fetch("/api/mixer/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create mixing request");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mixer/requests"] });
      toast({
        title: "Mixing Request Created",
        description: "Your privacy mixing request has been initiated",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Mixing Failed",
        description: error.message,
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      mixing: "default",
      completed: "outline",
      failed: "destructive",
    };
    return variants[status] || "default";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      pending: <Clock className="h-3 w-3" />,
      mixing: <Shuffle className="h-3 w-3 animate-spin" />,
      completed: <CheckCircle2 className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />,
    };
    return icons[status] || <Clock className="h-3 w-3" />;
  };

  // Calculate stats
  const totalRequests = requests?.length || 0;
  const completedRequests = requests?.filter(r => r.status === "completed").length || 0;
  const mixingRequests = requests?.filter(r => r.status === "mixing").length || 0;
  const totalVolume = requests?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
  const totalFees = requests?.reduce((sum, r) => sum + Number(r.fee || 0), 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <ShieldCheck className="h-8 w-8" />
            Coin Mixing Service
          </h1>
          <p className="text-muted-foreground mt-1">
            Privacy-focused coin mixing with batch processing and Kingdom ethics
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2" data-testid="button-create-mixing">
              <Lock className="h-4 w-4" />
              New Mixing Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Mixing Request</DialogTitle>
              <DialogDescription>
                Mix your coins for enhanced privacy and security
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMixingMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="coin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coin</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-coin">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                          <SelectItem value="USDT">Tether (USDT)</SelectItem>
                          <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                          <SelectItem value="MATIC">Polygon (MATIC)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inputAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Input Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0x... or bc1..."
                          {...field}
                          data-testid="input-input-address"
                        />
                      </FormControl>
                      <FormDescription>
                        The wallet address to mix from
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outputAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Output Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0x... or bc1..."
                          {...field}
                          data-testid="input-output-address"
                        />
                      </FormControl>
                      <FormDescription>
                        The destination wallet address (must be different)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            placeholder="0.0000"
                            {...field}
                            data-testid="input-amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delayHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delay (hours)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="168"
                            placeholder="2"
                            {...field}
                            data-testid="input-delay"
                          />
                        </FormControl>
                        <FormDescription>
                          Time delay for enhanced privacy (max 168h)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Privacy Notice</p>
                      <p className="text-muted-foreground">
                        Mixing fee: 0.5% - 2% depending on amount and delay. Your coins will be mixed through our secure network.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMixingMutation.isPending}
                  data-testid="button-submit-mixing"
                >
                  {createMixingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Request...
                    </>
                  ) : (
                    <>
                      <Shuffle className="mr-2 h-4 w-4" />
                      Start Mixing
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Shuffle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-requests">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">All-time mixing</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-mixing-requests">{mixingRequests}</div>
            <p className="text-xs text-muted-foreground">Currently mixing</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-completed-requests">{completedRequests}</div>
            <p className="text-xs text-muted-foreground">Successfully mixed</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-volume">
              {totalVolume.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
            <p className="text-xs text-muted-foreground">Mixed coins</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-fees">
              {totalFees.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
            <p className="text-xs text-muted-foreground">Service fees paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mixing Requests</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddresses(!showAddresses)}
            data-testid="button-toggle-addresses"
          >
            {showAddresses ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showAddresses ? "Hide" : "Show"} Addresses
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading mixing requests...</p>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
              <p className="text-sm text-muted-foreground mb-4">Failed to load requests</p>
              <Button onClick={() => refetch()} variant="outline" size="sm" data-testid="button-retry">
                <Shuffle className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : !requests || requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No mixing requests yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first mixing request for enhanced privacy</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="hover-elevate" data-testid={`card-request-${request.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" data-testid={`badge-coin-${request.id}`}>
                        {request.coin}
                      </Badge>
                      <Badge
                        variant={getStatusBadgeVariant(request.status || 'pending')}
                        className="gap-1"
                        data-testid={`badge-status-${request.id}`}
                      >
                        {getStatusIcon(request.status || 'pending')}
                        {request.status?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid={`text-date-${request.id}`}>
                      {new Date(request.createdAt!).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-mono font-semibold" data-testid={`text-amount-${request.id}`}>
                        {request.amount} {request.coin}
                      </p>
                    </div>
                    {request.fee && (
                      <div>
                        <p className="text-muted-foreground">Fee</p>
                        <p className="font-mono" data-testid={`text-fee-${request.id}`}>
                          {request.fee} {request.coin}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Delay</p>
                      <p className="font-mono" data-testid={`text-delay-${request.id}`}>
                        {request.delayHours}h
                      </p>
                    </div>
                  </div>

                  {showAddresses && (
                    <div className="space-y-2 p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Input Address</p>
                        <code className="text-xs font-mono break-all" data-testid={`text-input-${request.id}`}>
                          {request.inputAddress}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Output Address</p>
                        <code className="text-xs font-mono break-all" data-testid={`text-output-${request.id}`}>
                          {request.outputAddress}
                        </code>
                      </div>
                    </div>
                  )}

                  {request.mixingTransactionHash && (
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Transaction:</span>
                      <code className="text-xs font-mono" data-testid={`text-tx-${request.id}`}>
                        {request.mixingTransactionHash.slice(0, 16)}...
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
