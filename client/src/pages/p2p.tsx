import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowUpDown, MessageCircle, AlertTriangle, Send, ShieldCheck, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { io, Socket } from "socket.io-client";

// Schema for creating offers
const createOfferSchema = z.object({
  type: z.enum(["buy", "sell"]),
  cryptocurrency: z.string().min(1, "Required"),
  amount: z.string().min(1, "Required"),
  fiatCurrency: z.string().min(1, "Required"),
  pricePerUnit: z.string().min(1, "Required"),
  paymentMethods: z.array(z.string()).min(1, "Select at least one payment method"),
  minAmount: z.string().optional(),
  maxAmount: z.string().optional(),
  timeLimit: z.number().default(30),
  terms: z.string().optional(),
});

type CreateOfferFormData = z.infer<typeof createOfferSchema>;

// Schema for creating orders
const createOrderSchema = z.object({
  offerId: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  amount: z.string(),
  fiatAmount: z.string(),
  paymentMethod: z.string(),
});

// Schema for chat messages
const chatMessageSchema = z.object({
  orderId: z.string(),
  message: z.string().min(1, "Message required"),
});

// Schema for disputes
const disputeSchema = z.object({
  orderId: z.string(),
  reason: z.string().min(10, "Provide detailed reason (min 10 characters)"),
});

// Schema for reviews
const reviewSchema = z.object({
  orderId: z.string(),
  reviewedUserId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export default function P2PTradingPage() {
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const { toast } = useToast();

  // Filters
  const [cryptoFilter, setCryptoFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("");

  // WebSocket connection
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Subscribe to order updates
  useEffect(() => {
    if (socket && selectedOrder) {
      socket.emit("subscribe:p2p", selectedOrder.id);

      socket.on("p2p:message", (message) => {
        queryClient.invalidateQueries({ queryKey: ["/api/p2p/messages", selectedOrder.id] });
      });

      socket.on("p2p:order_update", (update) => {
        queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders", selectedOrder.id] });
        toast({
          title: "Order Updated",
          description: `Order status changed to: ${update.status}`,
        });
      });

      return () => {
        socket.emit("unsubscribe:p2p", selectedOrder.id);
        socket.off("p2p:message");
        socket.off("p2p:order_update");
      };
    }
  }, [socket, selectedOrder]);

  // Fetch offers
  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ["/api/p2p/offers", typeFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (typeFilter) params.append("type", typeFilter);
      return fetch(`/api/p2p/offers?${params}`).then(res => res.json());
    },
  });

  // Fetch user orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/p2p/orders"],
  });

  // Fetch chat messages for selected order
  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["/api/p2p/messages", selectedOrder?.id],
    enabled: !!selectedOrder,
  });

  // Create offer mutation
  const createOfferForm = useForm<CreateOfferFormData>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      type: "sell",
      cryptocurrency: "BTC",
      fiatCurrency: "USD",
      paymentMethods: [],
      timeLimit: 30,
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: (data: CreateOfferFormData) => 
      apiRequest("/api/p2p/offers", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/offers"] });
      toast({ title: "Success", description: "Offer created successfully!" });
      createOfferForm.reset();
      setActiveTab("browse");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create offer",
        variant: "destructive" 
      });
    },
  });

  // Accept offer mutation
  const acceptOfferMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/p2p/orders", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders"] });
      toast({ title: "Success", description: "Order created! Funds are in escrow." });
      setSelectedOffer(null);
      setActiveTab("orders");
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create order",
        variant: "destructive" 
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { orderId: string; message: string }) =>
      apiRequest("/api/p2p/messages", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/messages", selectedOrder?.id] });
      setChatMessage("");
    },
  });

  // Mark as paid mutation
  const markPaidMutation = useMutation({
    mutationFn: (orderId: string) => 
      apiRequest(`/api/p2p/orders/${orderId}/mark-paid`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders"] });
      toast({ title: "Success", description: "Payment marked as sent!" });
    },
  });

  // Release funds mutation
  const releaseFundsMutation = useMutation({
    mutationFn: (data: { orderId: string; txHash?: string }) =>
      apiRequest(`/api/p2p/orders/${data.orderId}/release`, "POST", { txHash: data.txHash }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders"] });
      toast({ title: "Success", description: "Funds released successfully!" });
    },
  });

  // Create dispute mutation
  const createDisputeMutation = useMutation({
    mutationFn: (data: { orderId: string; reason: string }) =>
      apiRequest("/api/p2p/disputes", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/p2p/orders"] });
      toast({ title: "Dispute Created", description: "Support will review your case." });
    },
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/p2p/reviews", "POST", data),
    onSuccess: () => {
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
    },
  });

  // Filter offers
  const filteredOffers = offers?.filter((offer: any) => {
    if (cryptoFilter && offer.cryptocurrency !== cryptoFilter) return false;
    if (paymentMethodFilter && !offer.paymentMethods?.includes(paymentMethodFilter)) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      created: "default",
      escrowed: "secondary",
      paid: "outline",
      released: "default",
      disputed: "destructive",
      cancelled: "destructive",
      completed: "default",
    };

    const icons: Record<string, any> = {
      created: Clock,
      escrowed: ShieldCheck,
      paid: DollarSign,
      completed: CheckCircle,
      disputed: AlertTriangle,
      cancelled: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <Badge variant={variants[status] as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 dark:text-white">P2P Trading</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Trade cryptocurrencies directly with other users using secure escrow
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6" data-testid="tabs-p2p">
          <TabsTrigger value="browse" data-testid="tab-browse">Browse Offers</TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">My Orders</TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create">Create Offer</TabsTrigger>
        </TabsList>

        {/* Browse Offers Tab */}
        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <CardTitle>Available Offers</CardTitle>
              <CardDescription>Find the best P2P trading offers</CardDescription>
              
              {/* Filters */}
              <div className="flex gap-4 mt-4">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="buy">Buy Offers</SelectItem>
                    <SelectItem value="sell">Sell Offers</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={cryptoFilter} onValueChange={setCryptoFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-crypto-filter">
                    <SelectValue placeholder="All Cryptos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cryptos</SelectItem>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-payment-filter">
                    <SelectValue placeholder="All Payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Methods</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="venmo">Venmo</SelectItem>
                    <SelectItem value="cash_app">Cash App</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <div className="text-center py-8">Loading offers...</div>
              ) : filteredOffers?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No offers available</div>
              ) : (
                <div className="space-y-4">
                  {filteredOffers?.map((offer: any) => (
                    <Card key={offer.id} className="hover:shadow-md transition-shadow" data-testid={`offer-card-${offer.id}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={offer.type === "buy" ? "default" : "secondary"}>
                                <ArrowUpDown className="h-3 w-3 mr-1" />
                                {offer.type.toUpperCase()}
                              </Badge>
                              <span className="font-bold text-lg">{offer.cryptocurrency}</span>
                              <span className="text-gray-500">for {offer.fiatCurrency}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Price:</span>
                                <span className="ml-2 font-semibold">${offer.pricePerUnit}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Amount:</span>
                                <span className="ml-2 font-semibold">{offer.amount} {offer.cryptocurrency}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Min/Max:</span>
                                <span className="ml-2">{offer.minAmount || '0'} - {offer.maxAmount || offer.amount}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Payment:</span>
                                <span className="ml-2">{offer.paymentMethods?.join(", ")}</span>
                              </div>
                            </div>

                            {offer.terms && (
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{offer.terms}</p>
                            )}
                          </div>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => setSelectedOffer(offer)} data-testid={`button-trade-${offer.id}`}>
                                Trade
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Accept Offer</DialogTitle>
                              </DialogHeader>
                              <AcceptOfferDialog 
                                offer={selectedOffer} 
                                onAccept={(data) => acceptOfferMutation.mutate(data)}
                                isLoading={acceptOfferMutation.isPending}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Orders Tab */}
        <TabsContent value="orders">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>Track your active and completed trades</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">Loading orders...</div>
                ) : orders?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No orders yet</div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {orders?.map((order: any) => (
                        <Card 
                          key={order.id}
                          className={`cursor-pointer transition-all ${selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => setSelectedOrder(order)}
                          data-testid={`order-card-${order.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-bold">{order.amount} {order.offer?.cryptocurrency}</span>
                                <span className="text-gray-500 ml-2">${order.fiatAmount}</span>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <div>Payment: {order.paymentMethod}</div>
                              <div>Created: {new Date(order.createdAt).toLocaleString()}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {selectedOrder && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Trade Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderDetails 
                    order={selectedOrder}
                    messages={messages || []}
                    chatMessage={chatMessage}
                    setChatMessage={setChatMessage}
                    onSendMessage={() => sendMessageMutation.mutate({ orderId: selectedOrder.id, message: chatMessage })}
                    onMarkPaid={() => markPaidMutation.mutate(selectedOrder.id)}
                    onReleaseFunds={() => releaseFundsMutation.mutate({ orderId: selectedOrder.id })}
                    onCreateDispute={(reason: string) => createDisputeMutation.mutate({ orderId: selectedOrder.id, reason })}
                    sendingMessage={sendMessageMutation.isPending}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Create Offer Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Offer</CardTitle>
              <CardDescription>List your crypto for P2P trading</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...createOfferForm}>
                <form onSubmit={createOfferForm.handleSubmit((data) => createOfferMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={createOfferForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-offer-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="buy">Buy (I want to buy crypto)</SelectItem>
                            <SelectItem value="sell">Sell (I want to sell crypto)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createOfferForm.control}
                      name="cryptocurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cryptocurrency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-cryptocurrency">
                                <SelectValue placeholder="Select crypto" />
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

                    <FormField
                      control={createOfferForm.control}
                      name="fiatCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fiat Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-fiat-currency">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createOfferForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.00000001" placeholder="1.5" data-testid="input-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createOfferForm.control}
                      name="pricePerUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Unit</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" placeholder="45000" data-testid="input-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createOfferForm.control}
                      name="minAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Amount (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.00000001" placeholder="0.1" data-testid="input-min-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createOfferForm.control}
                      name="maxAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Amount (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.00000001" placeholder="1.0" data-testid="input-max-amount" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createOfferForm.control}
                    name="paymentMethods"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Methods</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {["bank_transfer", "paypal", "venmo", "cash_app", "zelle"].map((method) => (
                            <label key={method} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                value={method}
                                checked={field.value?.includes(method)}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const newValue = e.target.checked
                                    ? [...(field.value || []), value]
                                    : field.value?.filter((v) => v !== value) || [];
                                  field.onChange(newValue);
                                }}
                                data-testid={`checkbox-${method}`}
                              />
                              <span className="capitalize">{method.replace("_", " ")}</span>
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createOfferForm.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (minutes)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" onChange={(e) => field.onChange(parseInt(e.target.value))} data-testid="input-time-limit" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createOfferForm.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terms & Conditions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Enter your trading terms..." data-testid="textarea-terms" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={createOfferMutation.isPending} data-testid="button-create-offer">
                    {createOfferMutation.isPending ? "Creating..." : "Create Offer"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Accept Offer Dialog Component
function AcceptOfferDialog({ offer, onAccept, isLoading }: { offer: any; onAccept: (data: any) => void; isLoading: boolean }) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  if (!offer) return null;

  const fiatAmount = (parseFloat(amount || "0") * parseFloat(offer.pricePerUnit)).toFixed(2);

  const handleAccept = () => {
    onAccept({
      offerId: offer.id,
      buyerId: offer.type === "sell" ? "current-user-id" : offer.userId,
      sellerId: offer.type === "sell" ? offer.userId : "current-user-id",
      amount,
      fiatAmount,
      paymentMethod,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Amount ({offer.cryptocurrency})</label>
        <Input 
          type="number" 
          step="0.00000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Min: ${offer.minAmount || 0}, Max: ${offer.maxAmount || offer.amount}`}
          data-testid="input-accept-amount"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger data-testid="select-accept-payment">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {offer.paymentMethods?.map((method: string) => (
              <SelectItem key={method} value={method}>{method.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Alert>
        <AlertDescription>
          You will {offer.type === "sell" ? "pay" : "receive"}: <strong>${fiatAmount} {offer.fiatCurrency}</strong>
        </AlertDescription>
      </Alert>

      <Button 
        onClick={handleAccept} 
        disabled={!amount || !paymentMethod || isLoading} 
        className="w-full"
        data-testid="button-confirm-accept"
      >
        {isLoading ? "Processing..." : "Accept Offer"}
      </Button>
    </div>
  );
}

// Order Details Component
function OrderDetails({ order, messages = [], chatMessage, setChatMessage, onSendMessage, onMarkPaid, onReleaseFunds, onCreateDispute, sendingMessage }: { 
  order: any; 
  messages: any[]; 
  chatMessage: string; 
  setChatMessage: (msg: string) => void;
  onSendMessage: () => void;
  onMarkPaid: () => void;
  onReleaseFunds: () => void;
  onCreateDispute: (reason: string) => void;
  sendingMessage: boolean;
}) {
  const [disputeReason, setDisputeReason] = useState("");
  const [showDispute, setShowDispute] = useState(false);

  return (
    <div className="space-y-4">
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertDescription>
          Status: {getStatusBadge(order.status)}
          {order.status === "escrowed" && " - Funds are securely held in escrow"}
        </AlertDescription>
      </Alert>

      <ScrollArea className="h-[300px] border rounded-lg p-4">
        <div className="space-y-4">
          {messages?.map((msg: any) => (
            <div key={msg.id} className={`flex ${msg.senderId === order.buyerId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg p-3 ${msg.senderId === order.buyerId ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{msg.message}</p>
                <span className="text-xs opacity-70">{new Date(msg.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          data-testid="input-chat-message"
        />
        <Button onClick={onSendMessage} disabled={!chatMessage || sendingMessage} size="icon" data-testid="button-send-message">
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        {order.status === "escrowed" && (
          <Button onClick={onMarkPaid} className="w-full" data-testid="button-mark-paid">
            <DollarSign className="h-4 w-4 mr-2" />
            Mark as Paid
          </Button>
        )}

        {order.status === "paid" && (
          <Button onClick={onReleaseFunds} className="w-full" data-testid="button-release-funds">
            <CheckCircle className="h-4 w-4 mr-2" />
            Release Funds
          </Button>
        )}

        {["escrowed", "paid"].includes(order.status) && (
          <Button 
            variant="destructive" 
            onClick={() => setShowDispute(true)} 
            className="w-full"
            data-testid="button-open-dispute"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Open Dispute
          </Button>
        )}
      </div>

      {showDispute && (
        <div className="space-y-2">
          <Textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder="Describe the issue in detail..."
            data-testid="textarea-dispute-reason"
          />
          <Button 
            onClick={() => {
              onCreateDispute(disputeReason);
              setShowDispute(false);
              setDisputeReason("");
            }}
            disabled={disputeReason.length < 10}
            className="w-full"
            data-testid="button-submit-dispute"
          >
            Submit Dispute
          </Button>
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status: string) {
  const variants: Record<string, string> = {
    created: "default",
    escrowed: "secondary",
    paid: "outline",
    released: "default",
    disputed: "destructive",
    cancelled: "destructive",
    completed: "default",
  };

  const icons: Record<string, any> = {
    created: Clock,
    escrowed: ShieldCheck,
    paid: DollarSign,
    completed: CheckCircle,
    disputed: AlertTriangle,
    cancelled: XCircle,
  };

  const Icon = icons[status] || Clock;

  return (
    <Badge variant={variants[status] as any} className="gap-1">
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}
