import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowUpDown, Plus, MessageSquare, Shield, Star, TrendingUp, TrendingDown } from "lucide-react";

export default function P2PPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("buy");
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  // Fetch P2P offers
  const { data: offers = [], isLoading: offersLoading } = useQuery({
    queryKey: ["/api/p2p/offers"],
  });

  // Fetch user's orders
  const { data: myOrders = [] } = useQuery({
    queryKey: ["/api/p2p/orders/my"],
  });

  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ["/api/p2p/payment-methods"],
  });

  // Create offer mutation
  const createOfferMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/p2p/offers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/offers"] });
      toast({ title: "Offer created successfully!" });
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/p2p/orders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders/my"] });
      toast({ title: "Order created successfully!" });
      setSelectedOffer(null);
    },
  });

  const buyOffers = (offers as any[]).filter((o: any) => o.type === "sell");
  const sellOffers = (offers as any[]).filter((o: any) => o.type === "buy");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">P2P Trading</h1>
          <p className="text-muted-foreground mt-1">Buy and sell crypto directly with other users</p>
        </div>
        <CreateOfferDialog paymentMethods={paymentMethods as any[]} onCreate={(data) => createOfferMutation.mutate(data)} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard icon={<TrendingUp className="h-4 w-4" />} title="Active Offers" value={(offers as any[]).length.toString()} />
        <StatsCard icon={<ArrowUpDown className="h-4 w-4" />} title="Your Orders" value={(myOrders as any[]).length.toString()} />
        <StatsCard icon={<Shield className="h-4 w-4" />} title="Escrow Protected" value="100%" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buy" data-testid="tab-buy">Buy Crypto</TabsTrigger>
          <TabsTrigger value="sell" data-testid="tab-sell">Sell Crypto</TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">My Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4">
          {offersLoading ? (
            <Card><CardContent className="p-6">Loading offers...</CardContent></Card>
          ) : buyOffers.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">No buy offers available</CardContent></Card>
          ) : (
            buyOffers.map((offer: any) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                onTrade={(offer) => setSelectedOffer(offer)}
                type="buy"
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          {offersLoading ? (
            <Card><CardContent className="p-6">Loading offers...</CardContent></Card>
          ) : sellOffers.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">No sell offers available</CardContent></Card>
          ) : (
            sellOffers.map((offer: any) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                onTrade={(offer) => setSelectedOffer(offer)}
                type="sell"
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {(myOrders as any[]).length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">No orders yet</CardContent></Card>
          ) : (
            (myOrders as any[]).map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {selectedOffer && (
        <TradeDialog 
          offer={selectedOffer} 
          onClose={() => setSelectedOffer(null)}
          onTrade={(data) => createOrderMutation.mutate(data)}
        />
      )}
    </div>
  );
}

function StatsCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function OfferCard({ offer, onTrade, type }: { offer: any; onTrade: (offer: any) => void; type: "buy" | "sell" }) {
  return (
    <Card className="hover-elevate" data-testid={`offer-card-${offer.id}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={type === "buy" ? "default" : "secondary"}>
                {type === "buy" ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                {type === "buy" ? "Buy" : "Sell"}
              </Badge>
              <span className="text-lg font-semibold">{offer.cryptocurrency}</span>
              <Badge variant="outline">{offer.fiatCurrency}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-semibold">{offer.price} {offer.fiatCurrency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Limit</p>
                <p className="font-semibold">{offer.minAmount} - {offer.maxAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment</p>
                <p className="font-semibold text-sm">{offer.paymentMethods?.join(", ") || "Any"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="font-semibold">{offer.availableAmount}</p>
              </div>
            </div>
          </div>
          <Button onClick={() => onTrade(offer)} data-testid={`button-trade-${offer.id}`}>
            Trade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OrderCard({ order }: { order: any }) {
  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    paid: "default",
    released: "default",
    cancelled: "destructive",
    disputed: "destructive",
  };

  return (
    <Card data-testid={`order-card-${order.id}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant={statusColors[order.status] || "outline"}>{order.status}</Badge>
              <span className="font-semibold">{order.amount} {order.cryptocurrency}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold">{order.totalPrice} {order.fiatCurrency}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-semibold text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment</p>
                <p className="font-semibold text-sm">{order.paymentMethod}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" data-testid={`button-view-order-${order.id}`}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateOfferDialog({ paymentMethods, onCreate }: { paymentMethods: any[]; onCreate: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "sell",
    cryptocurrency: "BTC",
    fiatCurrency: "USD",
    price: "",
    minAmount: "",
    maxAmount: "",
    paymentMethods: [] as string[],
    terms: "",
  });

  const handleSubmit = () => {
    onCreate({
      ...formData,
      price: parseFloat(formData.price),
      minAmount: parseFloat(formData.minAmount),
      maxAmount: parseFloat(formData.maxAmount),
      availableAmount: parseFloat(formData.maxAmount),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-offer">
          <Plus className="h-4 w-4 mr-2" />
          Create Offer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create P2P Offer</DialogTitle>
          <DialogDescription>Set up your buy or sell offer for peer-to-peer trading</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Offer Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger data-testid="select-offer-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy (I want to buy)</SelectItem>
                  <SelectItem value="sell">Sell (I want to sell)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cryptocurrency</Label>
              <Select value={formData.cryptocurrency} onValueChange={(v) => setFormData({ ...formData, cryptocurrency: v })}>
                <SelectTrigger data-testid="select-crypto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price per unit</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                data-testid="input-price"
              />
            </div>
            <div className="space-y-2">
              <Label>Fiat Currency</Label>
              <Select value={formData.fiatCurrency} onValueChange={(v) => setFormData({ ...formData, fiatCurrency: v })}>
                <SelectTrigger data-testid="select-fiat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Amount</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={formData.minAmount}
                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                data-testid="input-min-amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Amount</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={formData.maxAmount}
                onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                data-testid="input-max-amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Methods (select from your saved methods)</Label>
            <Select onValueChange={(v) => setFormData({ ...formData, paymentMethods: [...formData.paymentMethods, v] })}>
              <SelectTrigger data-testid="select-payment-method">
                <SelectValue placeholder="Select payment methods" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm: any) => (
                  <SelectItem key={pm.id} value={pm.method}>{pm.method} - {pm.details}</SelectItem>
                ))}
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="venmo">Venmo</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 flex-wrap mt-2">
              {formData.paymentMethods.map((pm, idx) => (
                <Badge key={idx} variant="secondary">
                  {pm}
                  <button 
                    className="ml-2 hover:text-destructive" 
                    onClick={() => setFormData({ ...formData, paymentMethods: formData.paymentMethods.filter((_, i) => i !== idx) })}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Terms & Conditions (optional)</Label>
            <Textarea 
              placeholder="Enter any specific terms for this trade..."
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              data-testid="textarea-terms"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" data-testid="button-submit-offer">
            Create Offer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TradeDialog({ offer, onClose, onTrade }: { offer: any; onClose: () => void; onTrade: (data: any) => void }) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const total = parseFloat(amount || "0") * parseFloat(offer.price);

  const handleTrade = () => {
    onTrade({
      offerId: offer.id,
      amount: parseFloat(amount),
      paymentMethod,
      totalPrice: total,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trade {offer.cryptocurrency}</DialogTitle>
          <DialogDescription>Complete your P2P trade with escrow protection</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="font-semibold">{offer.price} {offer.fiatCurrency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Limit</span>
              <span className="font-semibold">{offer.minAmount} - {offer.maxAmount}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount ({offer.cryptocurrency})</Label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-trade-amount"
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger data-testid="select-trade-payment">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {offer.paymentMethods?.map((pm: string) => (
                  <SelectItem key={pm} value={pm}>{pm}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-primary/10 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold">{total.toFixed(2)} {offer.fiatCurrency}</span>
            </div>
          </div>

          <Button onClick={handleTrade} className="w-full" disabled={!amount || !paymentMethod} data-testid="button-confirm-trade">
            <Shield className="h-4 w-4 mr-2" />
            Start Escrow Trade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
