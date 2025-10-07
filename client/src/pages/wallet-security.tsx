import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Shield, Key, HardDrive, Eye} from "lucide-react";

export default function WalletSecurity() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold divine-gradient-text">Wallet & Security</h1>
            <p className="text-sm text-muted-foreground mt-1">
              HD Wallets, Hardware Integration, Multisig & Privacy Tools
            </p>
          </div>
          <Badge variant="default" className="flex items-center gap-1" data-testid="badge-wallet-count">
            <Shield className="h-3 w-3" />
            5 Features
          </Badge>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover-elevate" data-testid="card-hd-wallet">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  HD Wallet
                </CardTitle>
                <Badge variant="default" data-testid="badge-hd-status">Active</Badge>
              </div>
              <CardDescription>Hierarchical deterministic wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" data-testid="button-manage-hd">
                Derive Addresses
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-hardware">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-primary" />
                  Hardware Wallet
                </CardTitle>
                <Badge variant="default" data-testid="badge-hardware-status">Active</Badge>
              </div>
              <CardDescription>Ledger & Trezor integration</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" data-testid="button-connect-hardware">
                Connect Device
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-multisig">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Multisig
                </CardTitle>
                <Badge variant="default" data-testid="badge-multisig-status">Active</Badge>
              </div>
              <CardDescription>Multi-signature wallets</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" data-testid="button-create-multisig">
                Create Multisig
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-seed">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  Seed Management
                </CardTitle>
                <Badge variant="default" data-testid="badge-seed-status">Active</Badge>
              </div>
              <CardDescription>Secure mnemonic management</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" data-testid="button-manage-seed">
                Manage Seeds
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-privacy">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Privacy Tools
                </CardTitle>
                <Badge variant="default" data-testid="badge-privacy-status">Active</Badge>
              </div>
              <CardDescription>Coin mixing & stealth addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" data-testid="button-privacy-tools">
                Privacy Features
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
