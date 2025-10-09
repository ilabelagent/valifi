import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function TransactionsWidget() {
  const { data: transactions, isLoading } = useQuery<any[]>({
    queryKey: ['/api/transactions'],
  });

  const recentTxs = transactions?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="widget-transactions">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTxs.map((tx) => {
            const isSend = tx.type === 'send';
            return (
              <div 
                key={tx.id} 
                className="flex items-center justify-between py-2 border-b last:border-0"
                data-testid={`transaction-item-${tx.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    isSend ? 'bg-red-500/10' : 'bg-green-500/10'
                  }`}>
                    {isSend ? (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.network} • {tx.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    isSend ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {isSend ? '-' : '+'}{tx.value} ETH
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.createdAt ? formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true }) : 'Just now'}
                  </p>
                </div>
              </div>
            );
          })}
          
          {(!transactions || transactions.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
