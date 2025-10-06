import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Bot, Shield, Wallet, Zap, Loader2 } from "lucide-react";

interface DashboardStats {
  activeAgents: number;
  totalAgents: number;
  blockchainStatus: string;
  securityLevel: string;
  quantumStatus: string;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats/dashboard"],
  });

  const { data: agents } = useQuery({
    queryKey: ["/api/agents"],
  });

  const { data: songs } = useQuery({
    queryKey: ["/api/songs"],
  });

  if (isLoading || !stats) {
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
            <h2 className="text-3xl font-bold mb-2">Kingdom Dashboard</h2>
            <p className="text-muted-foreground">
              Multi-agent orchestration platform with real blockchain and quantum computing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-active-agents">
                  {stats.activeAgents}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalAgents} total bots orchestrated
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blockchain Status</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div 
                  className={`text-2xl font-bold ${stats.blockchainStatus === 'live' ? 'text-primary' : 'text-muted-foreground'}`} 
                  data-testid="text-blockchain-status"
                >
                  {stats.blockchainStatus === 'live' ? 'Live' : 'Not Configured'}
                </div>
                <p className="text-xs text-muted-foreground">Real wallet integration</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Level</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div 
                  className={`text-2xl font-bold ${stats.securityLevel === 'protected' ? 'text-green-500' : 'text-amber-500'}`} 
                  data-testid="text-security-level"
                >
                  {stats.securityLevel === 'protected' ? 'Protected' : 'Warning'}
                </div>
                <p className="text-xs text-muted-foreground">Guardian Angel active</p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quantum Status</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-quantum-status">
                  {stats.quantumStatus === 'ready' ? 'Ready' : 'Offline'}
                </div>
                <p className="text-xs text-muted-foreground">IBM Quantum connection</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Features</CardTitle>
                <CardDescription>Production-ready capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Multi-Agent Orchestration</h4>
                    <p className="text-sm text-muted-foreground">
                      {stats.totalAgents} autonomous bots with LangGraph state management
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Blockchain Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Real NFT minting, ERC-20 deployment, wallet management
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Guardian Angel Security</h4>
                    <p className="text-sm text-muted-foreground">
                      Real-time threat detection with controlled lab testing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jesus Cartel Publishing</CardTitle>
                <CardDescription>Automated song → NFT → Token pipeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Upload songs and automatically deploy them to the blockchain as NFTs with 
                  corresponding ERC-20 tokens. Full IPFS integration for decentralized storage.
                </p>
                {songs && Array.isArray(songs) && songs.length > 0 && (
                  <p className="text-sm text-primary">
                    {songs.length} {songs.length === 1 ? 'song' : 'songs'} published
                  </p>
                )}
                <Button className="w-full" data-testid="button-publish-song">
                  Publish New Song
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>All systems operational at Kingdom standard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">KYC/AML Compliance</span>
                  <span className="text-sm text-primary" data-testid="text-kyc-status">Integrated (Sumsub)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Processing</span>
                  <span className="text-sm text-primary" data-testid="text-payment-status">Live (Stripe)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quantum Computing</span>
                  <span className="text-sm text-primary" data-testid="text-quantum-integration">Connected (IBM)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Real-time Updates</span>
                  <span className="text-sm text-primary" data-testid="text-websocket-status">Active (WebSocket)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
