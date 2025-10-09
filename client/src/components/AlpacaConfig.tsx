import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Check, AlertCircle, Loader2, ExternalLink, Key, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const alpacaConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  secretKey: z.string().min(1, "Secret Key is required"),
  paper: z.boolean().default(true),
});

type AlpacaConfigForm = z.infer<typeof alpacaConfigSchema>;

export default function AlpacaConfig() {
  const { toast } = useToast();
  const [showKeys, setShowKeys] = useState(false);

  const { data: account, isLoading: accountLoading, refetch: refetchAccount } = useQuery<any>({
    queryKey: ["/api/broker/alpaca/account"],
    retry: false,
    refetchInterval: false,
  });

  const { data: marketStatus } = useQuery<{ isOpen: boolean }>({
    queryKey: ["/api/broker/alpaca/market-status"],
    retry: false,
    refetchInterval: 30000,
  });

  const form = useForm<AlpacaConfigForm>({
    resolver: zodResolver(alpacaConfigSchema),
    defaultValues: {
      apiKey: "",
      secretKey: "",
      paper: true,
    },
  });

  const initializeMutation = useMutation({
    mutationFn: async (data: AlpacaConfigForm) => {
      const response = await fetch("/api/broker/alpaca/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          apiKey: data.apiKey,
          secretKey: data.secretKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to initialize Alpaca");
      }

      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "✅ Alpaca Connected",
        description: "Your Alpaca broker is now connected and ready to trade!",
      });
      form.reset();
      await refetchAccount();
      queryClient.invalidateQueries({ queryKey: ["/api/broker/alpaca/account"] });
      queryClient.invalidateQueries({ queryKey: ["/api/broker/alpaca/market-status"] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Connection Failed",
        description: error.message || "Failed to connect to Alpaca",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AlpacaConfigForm) => {
    initializeMutation.mutate(data);
  };

  const isConnected = account && !accountLoading;

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2" data-testid="title-alpaca-config">
              <Activity className="h-5 w-5 text-purple-500" />
              Alpaca Paper Trading
            </CardTitle>
            <CardDescription data-testid="text-alpaca-description">
              Connect your Alpaca account for live paper trading execution
            </CardDescription>
          </div>
          {isConnected && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400" data-testid="badge-connected">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            <Alert className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20" data-testid="alert-get-keys">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Get your free Alpaca Paper Trading API keys from{" "}
                <a
                  href="https://alpaca.markets/docs/trading/getting-started/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium inline-flex items-center gap-1"
                  data-testid="link-alpaca-docs"
                >
                  Alpaca Markets
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="paper"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4 bg-white/50 dark:bg-gray-900/50">
                      <div className="space-y-0.5">
                        <FormLabel data-testid="label-paper-trading">Paper Trading Mode</FormLabel>
                        <FormDescription data-testid="text-paper-description">
                          Use paper trading for risk-free testing (recommended)
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-paper-trading"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-api-key">
                        <Key className="h-4 w-4 inline mr-1" />
                        API Key ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={showKeys ? "text" : "password"}
                          placeholder="Enter your Alpaca API Key ID"
                          data-testid="input-api-key"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secretKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel data-testid="label-secret-key">
                        <Key className="h-4 w-4 inline mr-1" />
                        Secret Key
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={showKeys ? "text" : "password"}
                          placeholder="Enter your Alpaca Secret Key"
                          data-testid="input-secret-key"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeys(!showKeys)}
                    data-testid="button-toggle-keys"
                  >
                    {showKeys ? "Hide" : "Show"} Keys
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={initializeMutation.isPending}
                  data-testid="button-connect-alpaca"
                >
                  {initializeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect to Alpaca"
                  )}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1" data-testid="account-info-buying-power">
                <p className="text-sm text-muted-foreground">Buying Power</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${parseFloat(account.buying_power || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1" data-testid="account-info-portfolio-value">
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${parseFloat(account.portfolio_value || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1" data-testid="account-info-cash">
                <p className="text-sm text-muted-foreground">Cash</p>
                <p className="text-xl font-semibold">
                  ${parseFloat(account.cash || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1" data-testid="account-info-equity">
                <p className="text-sm text-muted-foreground">Equity</p>
                <p className="text-xl font-semibold">
                  ${parseFloat(account.equity || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {marketStatus && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-gray-900/50" data-testid="market-status">
                <div className={`h-2 w-2 rounded-full ${marketStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <p className="text-sm">
                  Market is {marketStatus.isOpen ? 'OPEN' : 'CLOSED'}
                </p>
              </div>
            )}

            <Alert className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20" data-testid="alert-connected">
              <Check className="h-4 w-4" />
              <AlertDescription>
                ✅ Your Alpaca account is connected and ready for paper trading!
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
