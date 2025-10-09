import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Coins, TrendingUp, TrendingDown, Package, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface EtherealElement {
  id: string;
  name: string;
  description: string;
  elementType: string;
  power: number;
  rarity: string;
  attributes: any;
  imageUrl: string;
  animationUrl?: string;
  totalSupply: number;
  mintedCount: number;
}

interface MetalOffering {
  id: string;
  name: string;
  symbol: string;
  weight: string;
  purity: string;
  price: number;
  change: number;
  changePercent: number;
  imageUrl: string;
}

interface IndividualAsset {
  id: string;
  name: string;
  assetType: string;
  marketValue: string;
  purchasePrice: string;
  quantity: string;
  metadata: any;
  imageUrl?: string;
  certificateUrl?: string;
  livePrice?: number;
  change?: number;
  changePercent?: number;
}

export default function AssetsPage() {
  const { toast } = useToast();
  const [selectedElement, setSelectedElement] = useState<EtherealElement | null>(null);
  const [selectedMetal, setSelectedMetal] = useState<MetalOffering | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch ethereal elements
  const { data: etherealElements = [] } = useQuery<EtherealElement[]>({
    queryKey: ["/api/assets/ethereal"],
  });

  // Fetch precious metals
  const { data: metalOfferings = [] } = useQuery<MetalOffering[]>({
    queryKey: ["/api/assets/metals"],
    refetchInterval: 60000, // Refresh every minute for live prices
  });

  // Fetch user assets
  const { data: userAssets } = useQuery<{ individualAssets: IndividualAsset[], etherealAssets: any[] }>({
    queryKey: ["/api/assets/user"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Purchase ethereal element
  const purchaseElementMutation = useMutation({
    mutationFn: async (data: { elementId: string; quantity: number; price: string }) =>
      apiRequest("/api/assets/ethereal/buy", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets/ethereal"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assets/user"] });
      toast({
        title: "Purchase Successful",
        description: "Divine element added to your collection!",
      });
      setSelectedElement(null);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase element",
        variant: "destructive",
      });
    },
  });

  // Purchase precious metal
  const purchaseMetalMutation = useMutation({
    mutationFn: async (data: { metalId: string; quantity: number; paymentMethod: string }) =>
      apiRequest("/api/assets/metals/buy", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets/user"] });
      toast({
        title: "Purchase Successful",
        description: "Precious metal added to your vault!",
      });
      setSelectedMetal(null);
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase metal",
        variant: "destructive",
      });
    },
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "divine": return "bg-gradient-to-r from-yellow-400 to-orange-500";
      case "legendary": return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "epic": return "bg-gradient-to-r from-purple-400 to-indigo-500";
      case "rare": return "bg-gradient-to-r from-blue-400 to-cyan-500";
      default: return "bg-gradient-to-r from-gray-400 to-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Kingdom Assets
        </h1>
      </div>

      <Tabs defaultValue="ethereal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ethereal" data-testid="tab-ethereal">
            <Sparkles className="w-4 h-4 mr-2" />
            Ethereal Elements
          </TabsTrigger>
          <TabsTrigger value="metals" data-testid="tab-metals">
            <Coins className="w-4 h-4 mr-2" />
            Precious Metals
          </TabsTrigger>
          <TabsTrigger value="my-assets" data-testid="tab-my-assets">
            <Package className="w-4 h-4 mr-2" />
            My Assets
          </TabsTrigger>
        </TabsList>

        {/* Ethereal Elements Tab */}
        <TabsContent value="ethereal">
          <Card>
            <CardHeader>
              <CardTitle>Divine Collectibles Marketplace</CardTitle>
              <CardDescription>
                Browse and acquire ethereal elements with divine powers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {etherealElements.map((element) => (
                  <Card key={element.id} className="overflow-hidden hover:shadow-xl transition-shadow" data-testid={`card-element-${element.id}`}>
                    <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600">
                      {element.imageUrl && (
                        <img
                          src={element.imageUrl}
                          alt={element.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <Badge className={`absolute top-2 right-2 ${getRarityColor(element.rarity)}`}>
                        {element.rarity}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-bold mb-2">{element.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {element.description}
                      </p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm">Power: {element.power}</span>
                        <Badge variant="outline">{element.elementType}</Badge>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-muted-foreground">
                          {element.mintedCount || 0} / {element.totalSupply || "∞"} minted
                        </span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            onClick={() => setSelectedElement(element)}
                            data-testid={`button-buy-element-${element.id}`}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Acquire Element
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Acquire {element.name}</DialogTitle>
                            <DialogDescription>
                              Add this divine element to your collection
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="element-quantity">Quantity</Label>
                              <Input
                                id="element-quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                data-testid="input-element-quantity"
                              />
                            </div>
                            <div>
                              <Label>Price: $100 per element</Label>
                              <p className="text-2xl font-bold">${100 * quantity}</p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                if (selectedElement) {
                                  purchaseElementMutation.mutate({
                                    elementId: selectedElement.id,
                                    quantity,
                                    price: (100 * quantity).toString(),
                                  });
                                }
                              }}
                              disabled={purchaseElementMutation.isPending}
                              data-testid="button-confirm-purchase-element"
                            >
                              {purchaseElementMutation.isPending ? "Processing..." : "Confirm Purchase"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {etherealElements.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                  No ethereal elements available yet. Check back soon for divine offerings!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Precious Metals Tab */}
        <TabsContent value="metals">
          <Card>
            <CardHeader>
              <CardTitle>Precious Metals Vault</CardTitle>
              <CardDescription>
                Invest in gold and silver coins with live market prices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metalOfferings.map((metal) => (
                  <Card key={metal.id} className="overflow-hidden" data-testid={`card-metal-${metal.id}`}>
                    <div className="relative h-64 bg-gradient-to-br from-yellow-600 to-yellow-800">
                      <img
                        src={metal.imageUrl}
                        alt={metal.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">{metal.name}</h3>
                          <p className="text-sm text-muted-foreground">{metal.weight} • {metal.purity}</p>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {metal.symbol}
                        </Badge>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">${metal.price.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground">per oz</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {metal.changePercent >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={metal.changePercent >= 0 ? "text-green-500" : "text-red-500"}>
                            {metal.changePercent >= 0 ? "+" : ""}{metal.changePercent.toFixed(2)}%
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({metal.change >= 0 ? "+" : ""}${metal.change.toFixed(2)})
                          </span>
                        </div>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            onClick={() => setSelectedMetal(metal)}
                            data-testid={`button-buy-metal-${metal.id}`}
                          >
                            <Coins className="w-4 h-4 mr-2" />
                            Purchase {metal.symbol}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Purchase {metal.name}</DialogTitle>
                            <DialogDescription>
                              Add precious metal to your vault
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="metal-quantity">Quantity (oz)</Label>
                              <Input
                                id="metal-quantity"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                data-testid="input-metal-quantity"
                              />
                            </div>
                            <div>
                              <Label>Total Price</Label>
                              <p className="text-3xl font-bold">
                                ${(metal.price * quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                if (selectedMetal) {
                                  purchaseMetalMutation.mutate({
                                    metalId: selectedMetal.id,
                                    quantity,
                                    paymentMethod: "stripe",
                                  });
                                }
                              }}
                              disabled={purchaseMetalMutation.isPending}
                              data-testid="button-confirm-purchase-metal"
                            >
                              {purchaseMetalMutation.isPending ? "Processing..." : "Confirm Purchase"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Assets Tab */}
        <TabsContent value="my-assets">
          <div className="space-y-6">
            {/* Ethereal Assets */}
            {userAssets?.etherealAssets && userAssets.etherealAssets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>My Ethereal Elements</CardTitle>
                  <CardDescription>Your divine collectibles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {userAssets.etherealAssets.map((item: any) => (
                      <Card key={item.ownership.id} data-testid={`card-owned-element-${item.ownership.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{item.element?.name}</h4>
                            <Badge className={getRarityColor(item.element?.rarity || "common")}>
                              {item.element?.rarity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Quantity: {item.ownership.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Acquired: {new Date(item.ownership.acquiredAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Individual Assets */}
            {userAssets?.individualAssets && userAssets.individualAssets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>My Individual Assets</CardTitle>
                  <CardDescription>Your precious metals and other assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userAssets.individualAssets.map((asset) => (
                      <Card key={asset.id} data-testid={`card-asset-${asset.id}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{asset.name}</h4>
                              <Badge variant="outline" className="mb-2">{asset.assetType}</Badge>
                              <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                  <p className="text-sm text-muted-foreground">Current Value</p>
                                  <p className="text-xl font-bold">${asset.marketValue}</p>
                                  {asset.changePercent !== undefined && (
                                    <div className="flex items-center gap-1 mt-1">
                                      {asset.changePercent >= 0 ? (
                                        <TrendingUp className="w-3 h-3 text-green-500" />
                                      ) : (
                                        <TrendingDown className="w-3 h-3 text-red-500" />
                                      )}
                                      <span className={`text-xs ${asset.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {asset.changePercent >= 0 ? "+" : ""}{asset.changePercent.toFixed(2)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Purchase Price</p>
                                  <p className="text-lg">${asset.purchasePrice}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Quantity</p>
                                  <p className="text-lg">{asset.quantity} {asset.metadata?.weight || ""}</p>
                                </div>
                                {asset.livePrice && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Live Price/oz</p>
                                    <p className="text-lg">${asset.livePrice.toFixed(2)}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            {asset.imageUrl && (
                              <img
                                src={asset.imageUrl}
                                alt={asset.name}
                                className="w-24 h-24 object-cover rounded ml-4"
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(!userAssets || (userAssets.individualAssets.length === 0 && userAssets.etherealAssets.length === 0)) && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Assets Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your kingdom's wealth by acquiring ethereal elements or precious metals
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
