import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function RecentTransactions() {
  const { data: wallets } = useQuery({
    queryKey: ["/api/wallets"],
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const recentTx = (transactions && Array.isArray(transactions)) ? transactions.slice(0, 10) : [];

  const getWalletAddress = (walletId: string) => {
    const wallet = (wallets && Array.isArray(wallets)) ? wallets.find((w: any) => w.id === walletId) : null;
    return wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Unknown';
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="card-recent-transactions">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentTx.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent transactions</p>
          ) : (
            recentTx.map((tx: any) => {
              const isSend = tx.type === 'send';
              return (
                <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors" data-testid={`transaction-${tx.id}`}>
                  <div className="flex items-center gap-3">
                    {isSend ? (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {isSend ? 'Sent' : 'Received'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.createdAt ? formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true }) : 'Unknown time'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isSend ? 'text-red-500' : 'text-green-500'}`}>
                      {isSend ? '-' : '+'}{parseFloat(tx.value || "0").toFixed(4)}
                    </p>
                    <Badge variant={tx.status === 'confirmed' ? 'default' : 'outline'} className="text-xs">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
