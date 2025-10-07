import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Wallet as WalletIcon, Send, Plus, Download, Copy, ExternalLink, Coins, FileCode, Image as ImageIcon, RefreshCw, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import type { Wallet, Transaction, Token, Nft } from "@shared/schema";

const NETWORKS = [
  { value: "ethereum", label: "Ethereum", symbol: "ETH", icon: "Ξ" },
  { value: "polygon", label: "Polygon", symbol: "MATIC", icon: "◇" },
  { value: "bsc", label: "BNB Chain", symbol: "BNB", icon: "●" },
  { value: "arbitrum", label: "Arbitrum", symbol: "ETH", icon: "◆" },
  { value: "optimism", label: "Optimism", symbol: "ETH", icon: "○" },
];

const createWalletSchema = z.object({
  network: z.string().min(1, "Network is required"),
});

const importWalletSchema = z.object({
  network: z.string().min(1, "Network is required"),
  importType: z.enum(["mnemonic", "privateKey"]),
  mnemonic: z.string().optional(),
  privateKey: z.string().optional(),
}).refine((data) => {
  if (data.importType === "mnemonic" && !data.mnemonic) return false;
  if (data.importType === "privateKey" && !data.privateKey) return false;
  return true;
}, {
  message: "Please provide the required import data",
});

const sendTransactionSchema = z.object({
  walletId: z.string().min(1, "Wallet is required"),
  to: z.string().min(1, "Recipient address is required"),
  amount: z.string().min(1, "Amount is required"),
});

const deployTokenSchema = z.object({
  walletId: z.string().min(1, "Wallet is required"),
  name: z.string().min(1, "Token name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  initialSupply: z.string().min(1, "Initial supply is required"),
  network: z.string().default("polygon"),
});

const deployNftSchema = z.object({
  walletId: z.string().min(1, "Wallet is required"),
  name: z.string().min(1, "Collection name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  network: z.string().default("polygon"),
});

const mintNftSchema = z.object({
  walletId: z.string().min(1, "Wallet is required"),
  contractAddress: z.string().min(1, "Contract address is required"),
  tokenId: z.string().min(1, "Token ID is required"),
  tokenURI: z.string().min(1, "Metadata URI is required"),
  network: z.string().default("polygon"),
});

export default function BlockchainPage() {
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState<string>("");
  const [mnemonicWarning, setMnemonicWarning] = useState<{ mnemonic: string; address: string; acknowledged: boolean } | null>(null);
  const [showMnemonic, setShowMnemonic] = useState(false);

  const { data: wallets, isLoading: walletsLoading, error: walletsError } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", selectedWallet],
    enabled: !!selectedWallet,
  });

  const { data: tokens } = useQuery<Token[]>({
    queryKey: ["/api/tokens", selectedWallet],
    enabled: !!selectedWallet,
  });

  const { data: nfts } = useQuery<Nft[]>({
    queryKey: ["/api/nfts", selectedWallet],
    enabled: !!selectedWallet,
  });

  const createWalletForm = useForm({
    resolver: zodResolver(createWalletSchema),
    defaultValues: { network: "ethereum" },
  });

  const importWalletForm = useForm({
    resolver: zodResolver(importWalletSchema),
    defaultValues: { network: "ethereum", importType: "mnemonic" as const, mnemonic: "", privateKey: "" },
  });

  const sendTxForm = useForm({
    resolver: zodResolver(sendTransactionSchema),
    defaultValues: { walletId: "", to: "", amount: "" },
  });

  const deployTokenForm = useForm({
    resolver: zodResolver(deployTokenSchema),
    defaultValues: { walletId: "", name: "", symbol: "", initialSupply: "", network: "polygon" },
  });

  const deployNftForm = useForm({
    resolver: zodResolver(deployNftSchema),
    defaultValues: { walletId: "", name: "", symbol: "", network: "polygon" },
  });

  const mintNftForm = useForm({
    resolver: zodResolver(mintNftSchema),
    defaultValues: { walletId: "", contractAddress: "", tokenId: "", tokenURI: "", network: "polygon" },
  });

  useEffect(() => {
    if (mnemonicWarning && !mnemonicWarning.acknowledged) {
      const timer = setTimeout(() => {
        setMnemonicWarning(null);
        setShowMnemonic(false);
      }, 300000);
      return () => clearTimeout(timer);
    }
  }, [mnemonicWarning]);

  const createWalletMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createWalletSchema>) => {
      const result = await apiRequest("/api/web3/create-wallet", "POST", data);
      return result as any;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      if (data.mnemonic) {
        setMnemonicWarning({ mnemonic: data.mnemonic, address: data.address, acknowledged: false });
        setShowMnemonic(false);
      }
      toast({
        title: "Wallet Created",
        description: "Save your recovery phrase securely!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create wallet",
        variant: "destructive",
      });
    },
  });

  const importWalletMutation = useMutation({
    mutationFn: async (data: z.infer<typeof importWalletSchema>) => {
      const payload: any = { network: data.network };
      if (data.importType === "mnemonic") {
        payload.mnemonic = data.mnemonic;
      } else {
        payload.privateKey = data.privateKey;
      }
      return apiRequest("/api/web3/import-wallet", "POST", payload) as Promise<any>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({
        title: "Wallet Imported",
        description: "Your wallet has been successfully imported",
      });
      importWalletForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import wallet",
        variant: "destructive",
      });
    },
  });

  const sendTxMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sendTransactionSchema>) => {
      return apiRequest("/api/web3/send-transaction", "POST", data) as Promise<any>;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({
        title: "Transaction Sent",
        description: `Tx Hash: ${data.hash}`,
      });
      sendTxForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send transaction",
        variant: "destructive",
      });
    },
  });

  const deployTokenMutation = useMutation({
    mutationFn: async (data: z.infer<typeof deployTokenSchema>) => {
      return apiRequest("/api/web3/deploy-erc20", "POST", data) as Promise<any>;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({
        title: "Token Deployed",
        description: `Contract: ${data.contractAddress}`,
      });
      deployTokenForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy token",
        variant: "destructive",
      });
    },
  });

  const deployNftMutation = useMutation({
    mutationFn: async (data: z.infer<typeof deployNftSchema>) => {
      return apiRequest("/api/web3/deploy-erc721", "POST", data) as Promise<any>;
    },
    onSuccess: (data: any) => {
      toast({
        title: "NFT Contract Deployed",
        description: `Contract: ${data.address}`,
      });
      deployNftForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy NFT contract",
        variant: "destructive",
      });
    },
  });

  const mintNftMutation = useMutation({
    mutationFn: async (data: z.infer<typeof mintNftSchema>) => {
      return apiRequest("/api/web3/mint-nft", "POST", data) as Promise<any>;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/nfts"] });
      toast({
        title: "NFT Minted",
        description: `Tx Hash: ${data.txHash}`,
      });
      mintNftForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      });
    },
  });

  const refreshBalanceMutation = useMutation({
    mutationFn: async (walletId: string) => {
      return apiRequest(`/api/web3/balance/${walletId}`, "GET");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      toast({ title: "Balance Updated" });
    },
  });

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(""), 2000);
  };

  const getExplorerUrl = (network: string, txHash?: string, address?: string) => {
    const explorers: Record<string, string> = {
      ethereum: "https://etherscan.io",
      polygon: "https://polygonscan.com",
      bsc: "https://bscscan.com",
      arbitrum: "https://arbiscan.io",
      optimism: "https://optimistic.etherscan.io",
    };
    const base = explorers[network] || explorers.ethereum;
    if (txHash) return `${base}/tx/${txHash}`;
    if (address) return `${base}/address/${address}`;
    return base;
  };

  const getNetworkInfo = (network: string) => {
    return NETWORKS.find(n => n.value === network) || NETWORKS[0];
  };

  if (walletsLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Skeleton className="h-8 w-64 mb-6" data-testid="skeleton-loading" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" data-testid={`skeleton-wallet-${i}`} />)}
        </div>
      </div>
    );
  }

  if (walletsError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert variant="destructive" data-testid="alert-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load wallets. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold" data-testid="heading-wallets">Wallets & Blockchain</h2>
            <p className="text-muted-foreground" data-testid="text-description">Multi-chain Web3 wallet management with real blockchain integration</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-import-wallet" className="gap-2">
                  <Download className="h-4 w-4" />
                  Import Wallet
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-import-wallet">
                <DialogHeader>
                  <DialogTitle data-testid="title-import-dialog">Import Wallet</DialogTitle>
                  <DialogDescription data-testid="description-import-dialog">Import an existing wallet using mnemonic phrase or private key</DialogDescription>
                </DialogHeader>
                <Form {...importWalletForm}>
                  <form onSubmit={importWalletForm.handleSubmit((data) => importWalletMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={importWalletForm.control}
                      name="network"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-import-network">Network</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-import-network">
                                <SelectValue placeholder="Select network" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NETWORKS.map(network => (
                                <SelectItem key={network.value} value={network.value} data-testid={`option-network-${network.value}`}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{network.icon}</span>
                                    <span>{network.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={importWalletForm.control}
                      name="importType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-import-type">Import Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-import-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mnemonic" data-testid="option-import-mnemonic">Mnemonic Phrase (12/24 words)</SelectItem>
                              <SelectItem value="privateKey" data-testid="option-import-privatekey">Private Key</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {importWalletForm.watch("importType") === ("mnemonic" as const) && (
                      <FormField
                        control={importWalletForm.control}
                        name="mnemonic"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-mnemonic">Mnemonic Phrase</FormLabel>
                            <FormControl>
                              <Textarea placeholder="word1 word2 word3..." rows={3} {...field} data-testid="input-mnemonic" className="font-mono" />
                            </FormControl>
                            <FormDescription data-testid="description-mnemonic">Enter your 12 or 24 word recovery phrase</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {importWalletForm.watch("importType") === ("privateKey" as const) && (
                      <FormField
                        control={importWalletForm.control}
                        name="privateKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-private-key">Private Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="0x..." {...field} data-testid="input-private-key" className="font-mono" />
                            </FormControl>
                            <FormDescription data-testid="description-private-key">Your wallet's private key (starts with 0x)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <DialogFooter>
                      <Button type="submit" disabled={importWalletMutation.isPending} data-testid="button-submit-import">
                        {importWalletMutation.isPending ? "Importing..." : "Import Wallet"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="button-create-wallet" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Wallet
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-create-wallet">
                <DialogHeader>
                  <DialogTitle data-testid="title-create-dialog">Create New Wallet</DialogTitle>
                  <DialogDescription data-testid="description-create-dialog">Generate a new blockchain wallet on your chosen network</DialogDescription>
                </DialogHeader>
                <Form {...createWalletForm}>
                  <form onSubmit={createWalletForm.handleSubmit((data) => createWalletMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={createWalletForm.control}
                      name="network"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-network">Network</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-network">
                                <SelectValue placeholder="Select network" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NETWORKS.map(network => (
                                <SelectItem key={network.value} value={network.value} data-testid={`option-network-${network.value}`}>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{network.icon}</span>
                                    <span>{network.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createWalletMutation.isPending} data-testid="button-submit-create-wallet">
                        {createWalletMutation.isPending ? "Creating..." : "Create Wallet"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {mnemonicWarning && (
          <Alert className="border-divine-gold bg-divine-gold/10" data-testid="alert-mnemonic">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-semibold" data-testid="text-mnemonic-warning">⚠️ Save Your Recovery Phrase - This Will Never Be Shown Again!</p>
                <p className="text-sm" data-testid="text-wallet-address">Wallet: <code className="font-mono">{mnemonicWarning.address}</code></p>
                <div className="relative">
                  <div className={`p-3 bg-background rounded font-mono text-sm break-all ${!showMnemonic ? 'filter blur-sm select-none' : ''}`} data-testid="text-mnemonic">
                    {mnemonicWarning.mnemonic}
                  </div>
                  {!showMnemonic && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      onClick={() => setShowMnemonic(true)}
                      data-testid="button-reveal-mnemonic"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Click to Reveal
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(mnemonicWarning.mnemonic);
                      toast({ title: "Copied to clipboard" });
                    }}
                    disabled={!showMnemonic}
                    data-testid="button-copy-mnemonic"
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setMnemonicWarning({ ...mnemonicWarning, acknowledged: true });
                      setTimeout(() => setMnemonicWarning(null), 1000);
                      setShowMnemonic(false);
                    }}
                    data-testid="button-acknowledge-mnemonic"
                  >
                    I've Saved It Securely
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets?.map(wallet => {
            const networkInfo = getNetworkInfo(wallet.network);
            return (
              <Card key={wallet.id} className="hover-elevate" data-testid={`card-wallet-${wallet.id}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg" data-testid={`icon-network-${wallet.id}`}>
                      {networkInfo.icon}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium" data-testid={`text-network-name-${wallet.id}`}>{networkInfo.label}</CardTitle>
                      <Badge variant="outline" className="mt-1" data-testid={`badge-symbol-${wallet.id}`}>{networkInfo.symbol}</Badge>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => refreshBalanceMutation.mutate(wallet.id)}
                    disabled={refreshBalanceMutation.isPending}
                    data-testid={`button-refresh-${wallet.id}`}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshBalanceMutation.isPending ? 'animate-spin' : ''}`} />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid={`text-balance-${wallet.id}`}>
                    {wallet.balance} {networkInfo.symbol}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <code className="text-xs font-mono truncate flex-1" data-testid={`text-address-${wallet.id}`}>
                      {wallet.address}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => copyAddress(wallet.address)}
                      data-testid={`button-copy-address-${wallet.id}`}
                    >
                      {copiedAddress === wallet.address ? (
                        <Check className="h-3 w-3 text-primary" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      asChild
                    >
                      <a href={getExplorerUrl(wallet.network, undefined, wallet.address)} target="_blank" rel="noopener noreferrer" data-testid={`link-explorer-${wallet.id}`}>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => sendTxForm.setValue("walletId", wallet.id)} data-testid={`button-send-${wallet.id}`}>
                          <Send className="h-3 w-3 mr-1" />
                          Send
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-testid="dialog-send-transaction">
                        <DialogHeader>
                          <DialogTitle data-testid="title-send">Send Transaction</DialogTitle>
                          <DialogDescription data-testid="description-send">Send {networkInfo.symbol} to another address</DialogDescription>
                        </DialogHeader>
                        <Form {...sendTxForm}>
                          <form onSubmit={sendTxForm.handleSubmit((data) => sendTxMutation.mutate(data))} className="space-y-4">
                            <input type="hidden" {...sendTxForm.register("walletId")} />
                            <FormField
                              control={sendTxForm.control}
                              name="to"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel data-testid="label-recipient">Recipient Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="0x..." className="font-mono" {...field} data-testid="input-recipient" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={sendTxForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel data-testid="label-amount">Amount ({networkInfo.symbol})</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.000001" placeholder="0.0" {...field} data-testid="input-amount" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit" disabled={sendTxMutation.isPending} data-testid="button-submit-send">
                                {sendTxMutation.isPending ? "Sending..." : "Send Transaction"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline" onClick={() => setSelectedWallet(wallet.id)} data-testid={`button-view-${wallet.id}`}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!wallets?.length && (
          <Card className="p-12" data-testid="card-empty-state">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <WalletIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold" data-testid="text-empty-title">No Wallets Yet</h3>
              <p className="text-muted-foreground" data-testid="text-empty-description">Create your first blockchain wallet to get started</p>
            </div>
          </Card>
        )}

        {selectedWallet && (
          <Tabs defaultValue="transactions" className="space-y-6" data-testid="tabs-wallet-details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transactions" data-testid="tab-transactions">Transactions</TabsTrigger>
              <TabsTrigger value="tokens" data-testid="tab-tokens">Tokens</TabsTrigger>
              <TabsTrigger value="nfts" data-testid="tab-nfts">NFTs</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle data-testid="title-transactions">Transaction History</CardTitle>
                  <CardDescription data-testid="description-transactions">All blockchain transactions for this wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  {transactions?.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="header-type">Type</TableHead>
                          <TableHead data-testid="header-from">From</TableHead>
                          <TableHead data-testid="header-to">To</TableHead>
                          <TableHead data-testid="header-value">Value</TableHead>
                          <TableHead data-testid="header-status">Status</TableHead>
                          <TableHead data-testid="header-hash">Tx Hash</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map(tx => (
                          <TableRow key={tx.id} data-testid={`row-tx-${tx.id}`}>
                            <TableCell className="font-medium" data-testid={`cell-type-${tx.id}`}>{tx.type}</TableCell>
                            <TableCell data-testid={`cell-from-${tx.id}`}><code className="text-xs">{tx.from.slice(0, 10)}...</code></TableCell>
                            <TableCell data-testid={`cell-to-${tx.id}`}><code className="text-xs">{tx.to.slice(0, 10)}...</code></TableCell>
                            <TableCell data-testid={`cell-value-${tx.id}`}>{tx.value} {getNetworkInfo(tx.network).symbol}</TableCell>
                            <TableCell data-testid={`cell-status-${tx.id}`}>
                              <Badge variant={tx.status === "confirmed" ? "default" : "secondary"} data-testid={`badge-status-${tx.id}`}>
                                {tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {tx.txHash && (
                                <a
                                  href={getExplorerUrl(tx.network, tx.txHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-primary hover:underline"
                                  data-testid={`link-tx-${tx.id}`}
                                >
                                  <code className="text-xs">{tx.txHash.slice(0, 10)}...</code>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-transactions">No transactions yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tokens" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold" data-testid="heading-tokens">ERC-20 Tokens</h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-tokens-description">Deploy and manage custom tokens</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => deployTokenForm.setValue("walletId", selectedWallet)} data-testid="button-deploy-token">
                      <Coins className="h-4 w-4 mr-2" />
                      Deploy Token
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-deploy-token">
                    <DialogHeader>
                      <DialogTitle data-testid="title-deploy-token">Deploy ERC-20 Token</DialogTitle>
                      <DialogDescription data-testid="description-deploy-token">Create a new fungible token on the blockchain</DialogDescription>
                    </DialogHeader>
                    <Form {...deployTokenForm}>
                      <form onSubmit={deployTokenForm.handleSubmit((data) => deployTokenMutation.mutate(data))} className="space-y-4">
                        <input type="hidden" {...deployTokenForm.register("walletId")} />
                        <FormField
                          control={deployTokenForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel data-testid="label-token-name">Token Name</FormLabel>
                              <FormControl>
                                <Input placeholder="My Token" {...field} data-testid="input-token-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={deployTokenForm.control}
                          name="symbol"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel data-testid="label-token-symbol">Symbol</FormLabel>
                              <FormControl>
                                <Input placeholder="MTK" {...field} data-testid="input-token-symbol" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={deployTokenForm.control}
                          name="initialSupply"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel data-testid="label-token-supply">Initial Supply</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="1000000" {...field} data-testid="input-token-supply" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={deployTokenForm.control}
                          name="network"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel data-testid="label-token-network">Network</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-token-network">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {NETWORKS.map(network => (
                                    <SelectItem key={network.value} value={network.value} data-testid={`option-token-network-${network.value}`}>{network.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit" disabled={deployTokenMutation.isPending} data-testid="button-submit-deploy-token">
                            {deployTokenMutation.isPending ? "Deploying..." : "Deploy Token"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {tokens?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tokens.map(token => (
                    <Card key={token.id} data-testid={`card-token-${token.id}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between" data-testid={`title-token-${token.id}`}>
                          <span>{token.name}</span>
                          <Badge data-testid={`badge-token-symbol-${token.id}`}>{token.symbol}</Badge>
                        </CardTitle>
                        <CardDescription>
                          <a
                            href={getExplorerUrl(token.network, undefined, token.contractAddress)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline font-mono text-xs"
                            data-testid={`link-token-contract-${token.id}`}
                          >
                            {token.contractAddress.slice(0, 20)}...
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground" data-testid={`label-supply-${token.id}`}>Total Supply:</span>
                            <span className="font-medium" data-testid={`value-supply-${token.id}`}>{token.totalSupply}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground" data-testid={`label-token-network-${token.id}`}>Network:</span>
                            <Badge variant="outline" data-testid={`badge-token-network-${token.id}`}>{getNetworkInfo(token.network).label}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12" data-testid="card-no-tokens">
                  <div className="text-center space-y-2">
                    <Coins className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground" data-testid="text-no-tokens">No tokens deployed yet</p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="nfts" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold" data-testid="heading-nfts">NFT Collections</h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-nfts-description">Deploy collections and mint NFTs</p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => deployNftForm.setValue("walletId", selectedWallet)} data-testid="button-deploy-nft">
                        <FileCode className="h-4 w-4 mr-2" />
                        Deploy Collection
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-testid="dialog-deploy-nft">
                      <DialogHeader>
                        <DialogTitle data-testid="title-deploy-nft">Deploy NFT Collection</DialogTitle>
                        <DialogDescription data-testid="description-deploy-nft">Create a new ERC-721 NFT contract</DialogDescription>
                      </DialogHeader>
                      <Form {...deployNftForm}>
                        <form onSubmit={deployNftForm.handleSubmit((data) => deployNftMutation.mutate(data))} className="space-y-4">
                          <input type="hidden" {...deployNftForm.register("walletId")} />
                          <FormField
                            control={deployNftForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel data-testid="label-nft-name">Collection Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="My NFT Collection" {...field} data-testid="input-nft-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={deployNftForm.control}
                            name="symbol"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel data-testid="label-nft-symbol">Symbol</FormLabel>
                                <FormControl>
                                  <Input placeholder="MNFT" {...field} data-testid="input-nft-symbol" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={deployNftForm.control}
                            name="network"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel data-testid="label-nft-network">Network</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-nft-network">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {NETWORKS.map(network => (
                                      <SelectItem key={network.value} value={network.value} data-testid={`option-nft-network-${network.value}`}>{network.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit" disabled={deployNftMutation.isPending} data-testid="button-submit-deploy-nft">
                              {deployNftMutation.isPending ? "Deploying..." : "Deploy Collection"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button onClick={() => mintNftForm.setValue("walletId", selectedWallet)} data-testid="button-mint-nft">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Mint NFT
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-testid="dialog-mint-nft">
                      <DialogHeader>
                        <DialogTitle data-testid="title-mint-nft">Mint NFT</DialogTitle>
                        <DialogDescription data-testid="description-mint-nft">Mint a new NFT on an existing collection</DialogDescription>
                      </DialogHeader>
                      <Form {...mintNftForm}>
                        <form onSubmit={mintNftForm.handleSubmit((data) => mintNftMutation.mutate(data))} className="space-y-4">
                          <input type="hidden" {...mintNftForm.register("walletId")} />
                          <FormField
                            control={mintNftForm.control}
                            name="contractAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel data-testid="label-contract-address">Collection Contract Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="0x..." className="font-mono" {...field} data-testid="input-contract-address" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={mintNftForm.control}
                            name="tokenId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel data-testid="label-token-id">Token ID</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="1" {...field} data-testid="input-token-id" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={mintNftForm.control}
                            name="tokenURI"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel data-testid="label-token-uri">Metadata URI</FormLabel>
                                <FormControl>
                                  <Input placeholder="ipfs://..." {...field} data-testid="input-token-uri" />
                                </FormControl>
                                <FormDescription data-testid="description-token-uri">IPFS or HTTP URL to NFT metadata</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={mintNftForm.control}
                            name="network"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel data-testid="label-mint-network">Network</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-mint-network">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {NETWORKS.map(network => (
                                      <SelectItem key={network.value} value={network.value} data-testid={`option-mint-network-${network.value}`}>{network.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit" disabled={mintNftMutation.isPending} data-testid="button-submit-mint">
                              {mintNftMutation.isPending ? "Minting..." : "Mint NFT"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {nfts?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nfts.map(nft => (
                    <Card key={nft.id} data-testid={`card-nft-${nft.id}`}>
                      {nft.imageUrl && (
                        <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                          <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover" data-testid={`image-nft-${nft.id}`} />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-base" data-testid={`title-nft-${nft.id}`}>{nft.name}</CardTitle>
                        <CardDescription className="text-xs" data-testid={`description-nft-${nft.id}`}>
                          Token ID: {nft.tokenId}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-xs">
                          {nft.description && (
                            <p className="text-muted-foreground line-clamp-2" data-testid={`text-nft-description-${nft.id}`}>{nft.description}</p>
                          )}
                          <a
                            href={getExplorerUrl(nft.network, undefined, nft.contractAddress)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline font-mono"
                            data-testid={`link-nft-contract-${nft.id}`}
                          >
                            {nft.contractAddress.slice(0, 16)}...
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12" data-testid="card-no-nfts">
                  <div className="text-center space-y-2">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground" data-testid="text-no-nfts">No NFTs minted yet</p>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
