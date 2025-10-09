import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  Link2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Send,
  QrCode,
  Clock,
  Network
} from "lucide-react";
import type { WalletConnectSession } from "@shared/schema";
import { walletConnectService } from "@/lib/walletConnect";
import { parseEther, formatEther } from "ethers";

interface SessionInfo {
  peerName?: string;
  peerUrl?: string;
  expiry?: number;
  topic?: string;
}

export default function WalletConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isSendingTx, setIsSendingTx] = useState(false);
  const [txRecipient, setTxRecipient] = useState("");
  const [txAmount, setTxAmount] = useState("");

  const { data: sessions, isLoading } = useQuery<WalletConnectSession[]>({
    queryKey: ["/api/walletconnect/sessions"],
  });

  const connectMutation = useMutation({
    mutationFn: async (walletData: { 
      walletAddress: string; 
      chainId: number; 
      walletType: string; 
      network: string;
      sessionData?: any;
    }) => {
      return await apiRequest("/api/walletconnect/sessions", {
        method: "POST",
        body: JSON.stringify(walletData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/walletconnect/sessions"] });
      toast({
        title: "Wallet Connected",
        description: "Your external wallet has been successfully connected via WalletConnect!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await apiRequest(`/api/walletconnect/sessions/${sessionId}/disconnect`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/walletconnect/sessions"] });
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const wallet = await walletConnectService.connect();
      
      setConnectedWallet(wallet);

      const session = walletConnectService.getSession();
      if (session) {
        setSessionInfo({
          peerName: session.peer?.metadata?.name,
          peerUrl: session.peer?.metadata?.url,
          expiry: session.expiry,
          topic: session.topic,
        });
      }

      const balanceWei = await walletConnectService.getBalance();
      const balanceEth = formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(6));

      await connectMutation.mutateAsync({
        walletAddress: wallet.address,
        chainId: wallet.chainId,
        network: wallet.network,
        walletType: wallet.walletType,
        sessionData: session,
      });
    } catch (error: any) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect wallet via WalletConnect",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await walletConnectService.disconnect();
      setConnectedWallet(null);
      setSessionInfo(null);
      setBalance("0");
      
      if (sessions && sessions.length > 0) {
        await disconnectMutation.mutateAsync(sessions[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect",
        variant: "destructive",
      });
    }
  };

  const handleSendTransaction = async () => {
    if (!txRecipient || !txAmount) {
      toast({
        title: "Invalid Input",
        description: "Please enter recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTx(true);
    try {
      const valueWei = parseEther(txAmount);
      const txHash = await walletConnectService.sendTransaction(txRecipient, valueWei.toString());
      
      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });

      setTxRecipient("");
      setTxAmount("");

      const balanceWei = await walletConnectService.getBalance();
      const balanceEth = formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(6));
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send transaction",
        variant: "destructive",
      });
    } finally {
      setIsSendingTx(false);
    }
  };

  useEffect(() => {
    if (walletConnectService.isConnected()) {
      const wallet = walletConnectService.getConnectedWallet();
      if (wallet) {
        setConnectedWallet(wallet);
        const session = walletConnectService.getSession();
        if (session) {
          setSessionInfo({
            peerName: session.peer?.metadata?.name,
            peerUrl: session.peer?.metadata?.url,
            expiry: session.expiry,
            topic: session.topic,
          });
        }
        walletConnectService.getBalance().then((balanceWei) => {
          const balanceEth = formatEther(balanceWei);
          setBalance(parseFloat(balanceEth).toFixed(6));
        });
      }
    }
  }, []);

  const getChainName = (chainId: number): string => {
    const chainNames: Record<number, string> = {
      1: "Ethereum Mainnet",
      137: "Polygon",
      56: "BSC",
      42161: "Arbitrum",
      10: "Optimism"
    };
    return chainNames[chainId] || `Chain ${chainId}`;
  };

  const getWalletIcon = (walletType: string) => {
    const icons: Record<string, string> = {
      metamask: "🦊",
      trust: "⭐",
      rainbow: "🌈",
      coinbase: "💎",
      walletconnect: "🔗",
    };
    return icons[walletType.toLowerCase()] || "💼";
  };

  const formatExpiryTime = (expiry?: number): string => {
    if (!expiry) return "Unknown";
    const expiryDate = new Date(expiry * 1000);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} days`;
    if (diffHours > 0) return `${diffHours} hours`;
    return "Expired";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">WalletConnect Integration</h2>
          <p className="text-muted-foreground">
            Connect your external wallet using WalletConnect protocol for seamless DeFi access
          </p>
        </div>

        <Alert>
          <QrCode className="h-4 w-4" />
          <AlertDescription>
            Click "Connect with WalletConnect" to open QR code modal. Scan with MetaMask, Trust Wallet, Rainbow, Coinbase Wallet, or any WalletConnect-compatible wallet.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {connectedWallet ? "Connected Wallet" : "Connect Wallet"}
              </CardTitle>
              <CardDescription>
                {connectedWallet 
                  ? "Your wallet is connected via WalletConnect" 
                  : "Scan QR code with your mobile wallet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!connectedWallet ? (
                <Button
                  className="w-full"
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  data-testid="button-connect-walletconnect"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening QR Modal...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Connect with WalletConnect
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getWalletIcon(connectedWallet.walletType)}</div>
                      <div>
                        <p className="font-medium text-sm" data-testid="text-connected-address">
                          {connectedWallet.address.slice(0, 6)}...{connectedWallet.address.slice(-4)}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid="text-connected-chain">
                          {getChainName(connectedWallet.chainId)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 border rounded-lg">
                      <p className="text-muted-foreground text-xs mb-1">Balance</p>
                      <p className="font-semibold" data-testid="text-balance">{balance} ETH</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-muted-foreground text-xs mb-1">Network</p>
                      <p className="font-semibold capitalize" data-testid="text-network">{connectedWallet.network}</p>
                    </div>
                  </div>

                  {sessionInfo && (
                    <div className="p-4 border rounded-lg space-y-2 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Wallet App</span>
                        <span className="text-sm font-medium" data-testid="text-peer-name">
                          {sessionInfo.peerName || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires In
                        </span>
                        <span className="text-sm font-medium" data-testid="text-expiry">
                          {formatExpiryTime(sessionInfo.expiry)}
                        </span>
                      </div>
                      {sessionInfo.topic && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Session Topic</span>
                          <span className="text-xs font-mono" data-testid="text-topic">
                            {sessionInfo.topic.slice(0, 8)}...{sessionInfo.topic.slice(-6)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDisconnect}
                    data-testid="button-disconnect"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Disconnect Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                {sessions && sessions.length > 0
                  ? `You have ${sessions.length} active wallet ${sessions.length === 1 ? "session" : "sessions"}`
                  : "No active wallet sessions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`session-${session.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getWalletIcon(session.walletType)}</div>
                        <div>
                          <p className="font-medium text-sm" data-testid={`text-wallet-address-${session.id}`}>
                            {session.walletAddress.slice(0, 6)}...{session.walletAddress.slice(-4)}
                          </p>
                          <p className="text-xs text-muted-foreground" data-testid={`text-chain-${session.id}`}>
                            {getChainName(session.chainId)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={session.status === "active" ? "default" : "secondary"}
                          data-testid={`badge-status-${session.id}`}
                        >
                          {session.status === "active" ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {session.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => disconnectMutation.mutate(session.id)}
                          disabled={disconnectMutation.isPending}
                          data-testid={`button-disconnect-${session.id}`}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No wallet sessions. Connect a wallet to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {connectedWallet && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Transaction Demo
              </CardTitle>
              <CardDescription>
                Test the WalletConnect integration by sending a transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={txRecipient}
                    onChange={(e) => setTxRecipient(e.target.value)}
                    data-testid="input-recipient"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ETH)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.001"
                    placeholder="0.01"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    data-testid="input-amount"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleSendTransaction}
                  disabled={isSendingTx || !txRecipient || !txAmount}
                  data-testid="button-send-transaction"
                >
                  {isSendingTx ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Transaction...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Transaction
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How WalletConnect Works</CardTitle>
            <CardDescription>External wallet integration via WalletConnect protocol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">1. Scan QR Code</h4>
                  <p className="text-xs text-muted-foreground">
                    Open your mobile wallet and scan the QR code that appears in the modal
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">2. Approve Connection</h4>
                  <p className="text-xs text-muted-foreground">
                    Approve the connection request in your wallet app to establish a session
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">3. Start Using</h4>
                  <p className="text-xs text-muted-foreground">
                    Your wallet is connected! You can now sign transactions and interact with DeFi
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
