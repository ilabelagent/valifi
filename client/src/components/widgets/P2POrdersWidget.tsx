import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function P2POrdersWidget() {
  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ['/api/p2p/orders'],
  });

  const activeOrders = orders?.filter(order => 
    ['created', 'escrowed', 'paid'].includes(order.status)
  ) || [];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            P2P Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="widget-p2p-orders">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          P2P Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeOrders.slice(0, 4).map((order) => (
            <div 
              key={order.id} 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              data-testid={`p2p-order-item-${order.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {order.amount} {order.cryptocurrency || 'USDT'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${order.fiatAmount}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={
                  order.status === 'completed' ? 'default' :
                  order.status === 'escrowed' ? 'secondary' : 'outline'
                }>
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}

          {activeOrders.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No active P2P orders</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create an offer to start trading
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
