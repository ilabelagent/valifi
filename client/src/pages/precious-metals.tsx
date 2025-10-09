import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Coins, 
  TrendingUp, 
  Vault, 
  Truck, 
  ShieldCheck, 
  Loader2,
  ShoppingCart,
  Award,
  Package,
  Bitcoin,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";

interface MetalPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface MetalProduct {
  id: string;
  metal: string;
  weight: string;
  form: string;
  productName: string;
  description: string;
  imageUrl: string;
  premium: string;
  inStock: boolean;
}

interface MetalOwnership {
  id: string;
  productId: string;
  quantity: number;
  location: string;
  purchasePrice: string;
  spotPriceAtPurchase: string;
  cryptoPaymentTx: string;
  certificateUrl: string;
  deliveryAddress: string;
  trackingNumber: string;
  purchasedAt: string;
  deliveredAt: string;
}

const purchaseSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  location: z.enum(["vault", "delivery_pending"]),
  deliveryAddress: z.string().optional(),
  cryptoPaymentTx: z.string().min(1, "Crypto transaction hash is required"),
});

type PurchaseForm = z.infer<typeof purchaseSchema>;

const deliverySchema = z.object({
  ownershipId: z.string(),
  deliveryAddress: z.string().min(10, "Please provide a valid delivery address"),
});

type DeliveryForm = z.infer<typeof deliverySchema>;

export default function PreciousMetalsPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedOwnership, setSelectedOwnership] = useState<MetalOwnership | null>(null);
  const [metalPrices, setMetalPrices] = useState<Record<string, MetalPrice>>({});

  // Fetch metal prices from marketDataService
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const metals = ['gold', 'silver', 'platinum', 'palladium'];
        const pricePromises = metals.map(async (metal) => {
          const response = await fetch(`/api/market/metal/${metal}`);
          if (response.ok) {
            return { metal, data: await response.json() };
          }
          return null;
        });
        
        const results = await Promise.all(pricePromises);
        const prices: Record<string, MetalPrice> = {};
        results.forEach(result => {
          if (result) prices[result.metal] = result.data;
        });
        
        setMetalPrices(prices);
      } catch (error) {
        console.error("Error fetching metal prices:", error);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const { data: products, isLoading: productsLoading } = useQuery<MetalProduct[]>({
    queryKey: ["/api/metals/products"],
  });

  const { data: ownership, isLoading: ownershipLoading } = useQuery<MetalOwnership[]>({
    queryKey: ["/api/metals/ownership"],
  });

  const form = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      productId: "",
      quantity: 1,
      location: "vault",
      deliveryAddress: "",
      cryptoPaymentTx: "",
    },
  });

  const deliveryForm = useForm<DeliveryForm>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      ownershipId: "",
      deliveryAddress: "",
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (data: PurchaseForm) => {
      return apiRequest("POST", "/api/metals/purchase", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metals/ownership"] });
      toast({
        title: "Purchase Successful",
        description: "Your precious metal has been secured",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error.message,
      });
    },
  });

  const deliveryMutation = useMutation({
    mutationFn: async (data: DeliveryForm) => {
      return apiRequest("POST", "/api/metals/delivery", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metals/ownership"] });
      toast({
        title: "Delivery Requested",
        description: "Your delivery request has been submitted",
      });
      setDeliveryDialogOpen(false);
      deliveryForm.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Delivery Request Failed",
        description: error.message,
      });
    },
  });

  const calculatePrice = (product: MetalProduct | undefined) => {
    if (!product) return 0;
    const metalPrice = metalPrices[product.metal.toLowerCase()];
    if (!metalPrice) return 0;
    const premiumMultiplier = 1 + (Number(product.premium) / 100);
    return metalPrice.price * premiumMultiplier * Number(product.weight);
  };

  const selectedProduct = products?.find(p => p.id === form.watch("productId"));
  const totalPrice = calculatePrice(selectedProduct) * (form.watch("quantity") || 1);

  const totalHoldings = ownership?.reduce((sum, o) => {
    const product = products?.find(p => p.id === o.productId);
    const weight = Number(product?.weight || 0) * o.quantity;
    return sum + weight;
  }, 0) || 0;

  const totalValue = ownership?.reduce((sum, o) => sum + Number(o.purchasePrice || 0), 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <Coins className="h-8 w-8" />
            Precious Metals Exchange
          </h1>
          <p className="text-muted-foreground mt-1">
            Convert crypto to physical gold, silver & platinum
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2" data-testid="button-purchase-metals">
              <ShoppingCart className="h-4 w-4" />
              Buy Metals
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Purchase Precious Metals</DialogTitle>
              <DialogDescription>
                Buy physical gold, silver, or platinum with cryptocurrency
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => purchaseMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-product">
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.productName} - {product.weight}oz {product.metal}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            data-testid="input-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Option</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-location">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vault">Secure Vault Storage</SelectItem>
                            <SelectItem value="delivery_pending">Request Delivery</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("location") === "delivery_pending" && (
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Full delivery address"
                            {...field}
                            data-testid="input-delivery-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="cryptoPaymentTx"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crypto Payment Transaction Hash</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0x..."
                          {...field}
                          data-testid="input-crypto-tx"
                        />
                      </FormControl>
                      <FormDescription>
                        Complete crypto payment first and paste transaction hash here
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedProduct && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spot Price ({selectedProduct.metal}):</span>
                      <span className="font-mono">${metalPrices[selectedProduct.metal.toLowerCase()]?.price.toFixed(2) || '...'}/oz</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Premium:</span>
                      <span className="font-mono">{selectedProduct.premium}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price per Item:</span>
                      <span className="font-mono">${calculatePrice(selectedProduct).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="covenant-gradient-text">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={purchaseMutation.isPending}
                  data-testid="button-submit-purchase"
                >
                  {purchaseMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Bitcoin className="mr-2 h-4 w-4" />
                      Purchase with Crypto
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Live Price Ticker */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(metalPrices).map(([metal, data]) => (
          <Card key={metal} className="hover-elevate">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="capitalize">{metal}</span>
                <Badge variant={data.changePercent >= 0 ? "default" : "destructive"}>
                  {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-price-${metal}`}>
                ${data.price.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">per troy oz</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-holdings">
              {totalHoldings.toFixed(4)} oz
            </div>
            <p className="text-xs text-muted-foreground">All precious metals</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold covenant-gradient-text" data-testid="text-total-value">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Purchase value</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Owned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-items">
              {ownership?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Ownership certificates</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" data-testid="tab-products">Product Catalog</TabsTrigger>
          <TabsTrigger value="ownership" data-testid="tab-ownership">My Holdings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {productsLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading products...</p>
              </CardContent>
            </Card>
          ) : !products || products.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No products available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {products.map((product) => {
                const price = calculatePrice(product);
                const metalPrice = metalPrices[product.metal.toLowerCase()];
                return (
                  <Card key={product.id} className="hover-elevate" data-testid={`card-product-${product.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between" data-testid={`text-product-name-${product.id}`}>
                        <span>{product.productName}</span>
                        <Badge variant={product.inStock ? "default" : "secondary"}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Metal</p>
                          <p className="font-semibold capitalize">{product.metal}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Weight</p>
                          <p className="font-semibold">{product.weight} oz</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Form</p>
                          <p className="font-semibold capitalize">{product.form}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Premium</p>
                          <p className="font-semibold">{product.premium}%</p>
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Price (incl. premium)</p>
                        <p className="text-xl font-bold covenant-gradient-text" data-testid={`text-product-price-${product.id}`}>
                          ${price.toFixed(2)}
                        </p>
                        {metalPrice && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Spot: ${metalPrice.price.toFixed(2)}/oz
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ownership" className="space-y-4">
          {ownershipLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading holdings...</p>
              </CardContent>
            </Card>
          ) : !ownership || ownership.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No metals owned yet</p>
                <p className="text-xs text-muted-foreground mt-1">Purchase your first precious metal to start building your portfolio</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ownership.map((item) => {
                const product = products?.find(p => p.id === item.productId);
                const totalWeight = Number(product?.weight || 0) * item.quantity;
                return (
                  <Card key={item.id} className="hover-elevate" data-testid={`card-ownership-${item.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold" data-testid={`text-ownership-product-${item.id}`}>
                              {product?.productName}
                            </h3>
                            <Badge variant="outline">
                              {item.location === 'vault' && <><Vault className="h-3 w-3 mr-1" /> Vault</>}
                              {item.location === 'delivery_pending' && <><Truck className="h-3 w-3 mr-1" /> Delivery Pending</>}
                              {item.location === 'delivered' && <><ShieldCheck className="h-3 w-3 mr-1" /> Delivered</>}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground">Quantity</p>
                              <p className="font-mono">{item.quantity} units</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Weight</p>
                              <p className="font-mono">{totalWeight.toFixed(4)} oz</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Purchase Price</p>
                              <p className="font-mono">${Number(item.purchasePrice).toFixed(2)}</p>
                            </div>
                          </div>
                          {item.cryptoPaymentTx && (
                            <p className="text-xs text-muted-foreground truncate" data-testid={`text-tx-${item.id}`}>
                              <Bitcoin className="h-3 w-3 inline mr-1" />
                              Tx: {item.cryptoPaymentTx}
                            </p>
                          )}
                          {item.trackingNumber && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <Truck className="h-3 w-3 inline mr-1" />
                              Tracking: {item.trackingNumber}
                            </p>
                          )}
                        </div>
                        {item.location === 'vault' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOwnership(item);
                              deliveryForm.setValue("ownershipId", item.id);
                              setDeliveryDialogOpen(true);
                            }}
                            data-testid={`button-request-delivery-${item.id}`}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Request Delivery
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delivery Request Dialog */}
      <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Physical Delivery</DialogTitle>
            <DialogDescription>
              Your precious metal will be securely shipped to your address
            </DialogDescription>
          </DialogHeader>
          <Form {...deliveryForm}>
            <form onSubmit={deliveryForm.handleSubmit((data) => deliveryMutation.mutate(data))} className="space-y-4">
              <FormField
                control={deliveryForm.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Full delivery address with postal code"
                        {...field}
                        data-testid="input-delivery-address-form"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={deliveryMutation.isPending}
                data-testid="button-submit-delivery"
              >
                {deliveryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Request Delivery
                  </>
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
