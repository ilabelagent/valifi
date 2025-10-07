import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type payments, type cryptoPayments, insertCryptoPaymentSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Bitcoin, 
  Wallet,
  ExternalLink,
  QrCode,
  Copy
} from "lucide-react";
import { SiStripe, SiPaypal } from "react-icons/si";
import { useState } from "react";

type SelectPayment = typeof payments.$inferSelect;
type SelectCryptoPayment = typeof cryptoPayments.$inferSelect;

const cryptoPaymentFormSchema = z.object({
  processor: z.enum(["bitpay", "binance_pay", "bybit", "kucoin", "luno"]),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().min(1, "Currency is required"),
});

type CryptoPaymentForm = z.infer<typeof cryptoPaymentFormSchema>;

export default function PaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { data: fiatPayments, isLoading: loadingFiat, isError: errorFiat, error: fiatError, refetch: refetchFiat } = useQuery<SelectPayment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: cryptoPayments, isLoading: loadingCrypto, isError: errorCrypto, error: cryptoError, refetch: refetchCrypto } = useQuery<SelectCryptoPayment[]>({
    queryKey: ["/api/crypto-payments"],
  });

  const form = useForm<CryptoPaymentForm>({
    resolver: zodResolver(cryptoPaymentFormSchema),
    defaultValues: {
      processor: "bitpay",
      amount: "",
      currency: "BTC",
    },
  });

  const createCryptoPaymentMutation = useMutation({
    mutationFn: async (data: CryptoPaymentForm) => {
      const res = await apiRequest("POST", "/api/crypto-payments/create", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/crypto-payments"] });
      setSelectedInvoice(data.invoice);
      form.reset();
      toast({
        title: "Crypto payment created",
        description: "Your crypto payment invoice has been generated.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Payment creation failed",
        description: error.message || "Failed to create crypto payment",
      });
    },
  });

  const onSubmit = (data: CryptoPaymentForm) => {
    createCryptoPaymentMutation.mutate(data);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
      case "paid":
      case "confirmed":
      case "completed":
        return "default";
      case "pending":
      case "new":
        return "secondary";
      case "failed":
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
      case "paid":
      case "confirmed":
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
      case "new":
        return <Clock className="h-4 w-4" />;
      case "failed":
      case "expired":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access payments.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="heading-payments">
              <CreditCard className="h-8 w-8 text-primary" />
              Payments & Transactions
            </h1>
            <p className="text-muted-foreground mt-1" data-testid="text-subtitle">
              Fiat and cryptocurrency payment processing for the Kingdom
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-crypto">
                <Bitcoin className="h-4 w-4 mr-2" />
                Create Crypto Payment
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-crypto">
              <DialogHeader>
                <DialogTitle>Create Crypto Payment</DialogTitle>
                <DialogDescription>
                  Generate a cryptocurrency payment invoice
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="processor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Processor</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-processor">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bitpay">BitPay</SelectItem>
                            <SelectItem value="binance_pay">Binance Pay</SelectItem>
                            <SelectItem value="bybit">Bybit</SelectItem>
                            <SelectItem value="kucoin">KuCoin</SelectItem>
                            <SelectItem value="luno">Luno</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (USD)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="100.00" {...field} data-testid="input-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cryptocurrency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-currency">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                            <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                            <SelectItem value="USDT">Tether (USDT)</SelectItem>
                            <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createCryptoPaymentMutation.isPending}
                    data-testid="button-submit-crypto"
                  >
                    {createCryptoPaymentMutation.isPending ? "Creating..." : "Create Payment"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        {/* Payment Processors Overview */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Processors</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Fiat Processors */}
            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <SiStripe className="h-5 w-5" />
                    Stripe
                  </CardTitle>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Cards, ACH, Bank Transfers</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <SiPaypal className="h-5 w-5" />
                    PayPal
                  </CardTitle>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">PayPal, Venmo, Credit Cards</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Plaid
                  </CardTitle>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Bank Account Linking, ACH</p>
              </CardContent>
            </Card>

            {/* Crypto Processors */}
            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bitcoin className="h-5 w-5" />
                    BitPay
                  </CardTitle>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">BTC, BCH, ETH, USDC, more</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bitcoin className="h-5 w-5" />
                    Binance Pay
                  </CardTitle>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">USDT, BUSD, BNB, Multi-crypto</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bitcoin className="h-5 w-5" />
                    Bybit
                  </CardTitle>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Crypto Deposits & Withdrawals</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bitcoin className="h-5 w-4" />
                    KuCoin Pay
                  </CardTitle>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Multi-chain Crypto Payments</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bitcoin className="h-5 w-5" />
                    Luno
                  </CardTitle>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">BTC, ETH, XRP, LTC, more</p>
              </CardContent>
            </Card>

            {/* Direct Blockchain */}
            <Card className="hover-elevate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Direct Blockchain
                  </CardTitle>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">ETH, MATIC, BNB, ARB, OP</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="fiat" className="space-y-4" data-testid="tabs-payments">
          <TabsList>
            <TabsTrigger value="fiat" data-testid="tab-fiat">
              <SiStripe className="h-4 w-4 mr-2" />
              Fiat Payments
            </TabsTrigger>
            <TabsTrigger value="crypto" data-testid="tab-crypto">
              <Bitcoin className="h-4 w-4 mr-2" />
              Crypto Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fiat" className="space-y-4">
            {loadingFiat ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : errorFiat ? (
              <Alert variant="destructive" data-testid="alert-fiat-error">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>Failed to load fiat payments: {(fiatError as any)?.message || "Unknown error"}</span>
                    <Button variant="outline" size="sm" onClick={() => refetchFiat()} data-testid="button-retry-fiat">
                      Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : !fiatPayments || fiatPayments.length === 0 ? (
              <Alert data-testid="alert-no-fiat">
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  No fiat payments found. Stripe and PayPal transactions will appear here.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {fiatPayments.map((payment) => (
                  <Card key={payment.id} data-testid={`card-fiat-${payment.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(payment.status)} className="gap-1" data-testid={`badge-status-${payment.id}`}>
                              {getStatusIcon(payment.status)}
                              {payment.status.toUpperCase()}
                            </Badge>
                            {payment.stripePaymentId && (
                              <Badge variant="outline" className="gap-1">
                                <SiStripe className="h-3 w-3" />
                                Stripe
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg" data-testid={`text-amount-${payment.id}`}>
                            ${parseFloat(payment.amount).toFixed(2)} {payment.currency?.toUpperCase()}
                          </CardTitle>
                          {payment.description && (
                            <CardDescription data-testid={`text-description-${payment.id}`}>
                              {payment.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {payment.stripePaymentId && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-stripe-id-${payment.id}`}>
                          <CreditCard className="h-4 w-4" />
                          <span className="font-mono">{payment.stripePaymentId}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(payment.stripePaymentId as string, "Stripe ID")}
                            data-testid={`button-copy-stripe-${payment.id}`}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-created-${payment.id}`}>
                        <Clock className="h-4 w-4" />
                        <span>{new Date(payment.createdAt as string | number | Date).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="crypto" className="space-y-4">
            {selectedInvoice && (
              <Alert className="bg-primary/10 border-primary" data-testid="alert-invoice">
                <QrCode className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p className="font-semibold">Payment Invoice Created</p>
                    <div className="flex flex-col gap-2">
                      {selectedInvoice.paymentUrl && (
                        <a 
                          href={selectedInvoice.paymentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover-elevate p-2 rounded"
                          data-testid="link-payment-url"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Payment Page
                        </a>
                      )}
                      {selectedInvoice.qrCode && (
                        <a 
                          href={selectedInvoice.qrCode} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm hover-elevate p-2 rounded"
                          data-testid="link-qr-code"
                        >
                          <QrCode className="h-4 w-4" />
                          View QR Code
                        </a>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedInvoice(null)}
                      data-testid="button-dismiss-invoice"
                    >
                      Dismiss
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {loadingCrypto ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : errorCrypto ? (
              <Alert variant="destructive" data-testid="alert-crypto-error">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>Failed to load crypto payments: {(cryptoError as any)?.message || "Unknown error"}</span>
                    <Button variant="outline" size="sm" onClick={() => refetchCrypto()} data-testid="button-retry-crypto">
                      Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : !cryptoPayments || cryptoPayments.length === 0 ? (
              <Alert data-testid="alert-no-crypto">
                <Bitcoin className="h-4 w-4" />
                <AlertDescription>
                  No crypto payments found. Create a crypto payment invoice to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {cryptoPayments.map((payment) => (
                  <Card key={payment.id} data-testid={`card-crypto-${payment.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(payment.status)} className="gap-1" data-testid={`badge-crypto-status-${payment.id}`}>
                              {getStatusIcon(payment.status)}
                              {payment.status.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{payment.processor}</Badge>
                            <Badge variant="outline">{payment.currency}</Badge>
                          </div>
                          <CardTitle className="text-lg" data-testid={`text-crypto-amount-${payment.id}`}>
                            {parseFloat(payment.amount).toFixed(8)} {payment.currency}
                          </CardTitle>
                          {payment.fiatAmount && (
                            <CardDescription data-testid={`text-fiat-amount-${payment.id}`}>
                              ≈ ${parseFloat(payment.fiatAmount).toFixed(2)} {payment.fiatCurrency?.toUpperCase()}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {payment.processorInvoiceId && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-invoice-id-${payment.id}`}>
                          <Wallet className="h-4 w-4" />
                          <span className="font-mono text-xs">{payment.processorInvoiceId}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(payment.processorInvoiceId as string, "Invoice ID")}
                            data-testid={`button-copy-invoice-${payment.id}`}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {payment.txHash && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-txhash-${payment.id}`}>
                          <Bitcoin className="h-4 w-4" />
                          <span className="font-mono text-xs">{payment.txHash}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(payment.txHash as string, "Transaction Hash")}
                            data-testid={`button-copy-txhash-${payment.id}`}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {payment.paymentUrl && (
                        <a 
                          href={payment.paymentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover-elevate p-2 rounded"
                          data-testid={`link-payment-${payment.id}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Payment Page
                        </a>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-crypto-created-${payment.id}`}>
                        <Clock className="h-4 w-4" />
                        <span>{new Date(payment.createdAt as string | number | Date).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
