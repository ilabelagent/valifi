import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Sparkles, Flame, Wind, Droplet, Zap, Crown, Shield, Sword, Heart, Star, TrendingUp, Users, Send } from "lucide-react";

interface EtherealElement {
  id: string;
  name: string;
  description: string;
  elementType: string;
  power: number;
  rarity: string;
  attributes?: any;
  imageUrl?: string;
  animationUrl?: string;
  totalSupply?: number;
  mintedCount: number;
  available: boolean;
  remainingSupply?: number;
  price: number;
}

interface UserCollection {
  id: string;
  elementId: string;
  quantity: number;
  acquiredAt: string;
  element: EtherealElement;
}

const rarityColors: Record<string, string> = {
  common: "bg-gray-500",
  rare: "bg-blue-500",
  epic: "bg-purple-500",
  legendary: "bg-amber-500",
  divine: "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600",
};

const elementIcons: Record<string, any> = {
  spiritual: Star,
  divine: Crown,
  quantum: Zap,
  dimensional: Sparkles,
  fire: Flame,
  water: Droplet,
  air: Wind,
  earth: Shield,
};

export default function EtherealElementsPage() {
  const { toast } = useToast();
  const [selectedElement, setSelectedElement] = useState<EtherealElement | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [filterRarity, setFilterRarity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [transferDialog, setTransferDialog] = useState(false);
  const [transferElementId, setTransferElementId] = useState("");
  const [transferUserId, setTransferUserId] = useState("");
  const [transferQuantity, setTransferQuantity] = useState(1);

  const { data: marketplace = [], isLoading: marketplaceLoading } = useQuery<EtherealElement[]>({
    queryKey: ["/api/ethereal/marketplace"],
  });

  const { data: userCollection = [], isLoading: collectionLoading } = useQuery<UserCollection[]>({
    queryKey: ["/api/ethereal/collection"],
  });

  const { data: topElements = [] } = useQuery<EtherealElement[]>({
    queryKey: ["/api/ethereal/top"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async ({ elementId, quantity }: { elementId: string; quantity: number }) => {
      return apiRequest("POST", "/api/ethereal/purchase", { elementId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ethereal/marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ethereal/collection"] });
      setSelectedElement(null);
      setPurchaseQuantity(1);
      toast({
        title: "Success!",
        description: "Ethereal Element acquired successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase element",
        variant: "destructive",
      });
    },
  });

  const transferMutation = useMutation({
    mutationFn: async ({ toUserId, elementId, quantity }: any) => {
      return apiRequest("POST", "/api/ethereal/transfer", { toUserId, elementId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ethereal/collection"] });
      setTransferDialog(false);
      setTransferUserId("");
      setTransferElementId("");
      setTransferQuantity(1);
      toast({
        title: "Success!",
        description: "Element transferred successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer element",
        variant: "destructive",
      });
    },
  });

  const filteredMarketplace = marketplace.filter((element) => {
    if (filterRarity !== "all" && element.rarity.toLowerCase() !== filterRarity) return false;
    if (filterType !== "all" && element.elementType.toLowerCase() !== filterType) return false;
    return true;
  });

  const handlePurchase = () => {
    if (!selectedElement) return;
    purchaseMutation.mutate({ elementId: selectedElement.id, quantity: purchaseQuantity });
  };

  const handleTransfer = () => {
    if (!transferElementId || !transferUserId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    transferMutation.mutate({ toUserId: transferUserId, elementId: transferElementId, quantity: transferQuantity });
  };

  const ElementIcon = (type: string) => {
    const Icon = elementIcons[type.toLowerCase()] || Sparkles;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-purple-950 dark:to-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Ethereal Elements
            </h1>
            <Crown className="w-12 h-12 text-amber-400" />
          </div>
          <p className="text-xl text-purple-200 dark:text-purple-300">
            Divine Collectibles from the Kingdom Realm
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 bg-slate-800/50 dark:bg-black/50 border-purple-500/50 backdrop-blur-sm" data-testid="card-stats">
            <CardHeader>
              <CardTitle className="text-purple-200 dark:text-purple-300">Top Divine Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {topElements.slice(0, 5).map((element, index) => (
                    <div
                      key={element.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 dark:bg-slate-900/30 hover:bg-slate-700/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedElement(element)}
                      data-testid={`top-element-${element.id}`}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white dark:text-gray-100">{element.name}</div>
                        <div className="text-sm text-purple-300 dark:text-purple-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Power: {element.power}
                        </div>
                      </div>
                      <Badge className={rarityColors[element.rarity.toLowerCase()] || "bg-gray-500"}>
                        {element.rarity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-slate-800/50 dark:bg-black/50 border-purple-500/50 backdrop-blur-sm" data-testid="card-collection-stats">
            <CardHeader>
              <CardTitle className="text-purple-200 dark:text-purple-300">Your Collection</CardTitle>
              <CardDescription className="text-purple-300 dark:text-purple-400">
                {userCollection.length} Elements Owned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {collectionLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 bg-slate-700/30 dark:bg-slate-900/30" />
                  ))
                ) : userCollection.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-purple-300 dark:text-purple-400">
                    <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No elements in your collection yet</p>
                    <p className="text-sm">Start collecting below!</p>
                  </div>
                ) : (
                  userCollection.map((item) => (
                    <Card
                      key={item.id}
                      className="bg-slate-700/30 dark:bg-slate-900/30 border-purple-500/30 hover:border-purple-500 transition-all cursor-pointer"
                      onClick={() => setSelectedElement(item.element)}
                      data-testid={`collection-item-${item.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-2">
                          {ElementIcon(item.element.elementType)}
                        </div>
                        <div className="text-sm font-semibold text-white dark:text-gray-100 truncate">
                          {item.element.name}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <Badge variant="outline" className="text-xs">
                            x{item.quantity}
                          </Badge>
                          <Badge className={`text-xs ${rarityColors[item.element.rarity.toLowerCase()]}`}>
                            {item.element.rarity}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              {userCollection.length > 0 && (
                <Button
                  onClick={() => setTransferDialog(true)}
                  variant="outline"
                  className="w-full mt-4 border-purple-500 text-purple-300 hover:bg-purple-500/20"
                  data-testid="button-transfer-element"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Transfer Element
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="marketplace" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 dark:bg-black/50">
            <TabsTrigger value="marketplace" data-testid="tab-marketplace">
              <TrendingUp className="w-4 h-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="my-collection" data-testid="tab-my-collection">
              <Users className="w-4 h-4 mr-2" />
              My Collection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-4">
            <Card className="bg-slate-800/50 dark:bg-black/50 border-purple-500/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <CardTitle className="text-purple-200 dark:text-purple-300">Divine Marketplace</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={filterRarity} onValueChange={setFilterRarity}>
                      <SelectTrigger className="w-32 bg-slate-700 dark:bg-slate-900 border-purple-500/30" data-testid="select-filter-rarity">
                        <SelectValue placeholder="Rarity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rarities</SelectItem>
                        <SelectItem value="common">Common</SelectItem>
                        <SelectItem value="rare">Rare</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                        <SelectItem value="divine">Divine</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32 bg-slate-700 dark:bg-slate-900 border-purple-500/30" data-testid="select-filter-type">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="spiritual">Spiritual</SelectItem>
                        <SelectItem value="divine">Divine</SelectItem>
                        <SelectItem value="quantum">Quantum</SelectItem>
                        <SelectItem value="dimensional">Dimensional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketplaceLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-80 bg-slate-700/30 dark:bg-slate-900/30" />
                    ))
                  ) : filteredMarketplace.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-purple-300 dark:text-purple-400">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No elements match your filters</p>
                    </div>
                  ) : (
                    filteredMarketplace.map((element) => (
                      <Card
                        key={element.id}
                        className="group bg-slate-700/30 dark:bg-slate-900/30 border-purple-500/30 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                        data-testid={`marketplace-element-${element.id}`}
                      >
                        <CardHeader>
                          <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                            <div className="text-6xl">{ElementIcon(element.elementType)}</div>
                          </div>
                          <CardTitle className="text-white dark:text-gray-100">{element.name}</CardTitle>
                          <CardDescription className="text-purple-300 dark:text-purple-400 line-clamp-2">
                            {element.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Badge className={rarityColors[element.rarity.toLowerCase()]}>
                              {element.rarity}
                            </Badge>
                            <Badge variant="outline" className="border-purple-500 text-purple-300">
                              {element.elementType}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-purple-300 dark:text-purple-400">Power</span>
                              <span className="text-white dark:text-gray-100 font-semibold">{element.power}</span>
                            </div>
                            <Progress value={(element.power / 1000) * 100} className="h-2 bg-slate-600 dark:bg-slate-800" />
                          </div>
                          <Separator className="bg-purple-500/30" />
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-purple-300 dark:text-purple-400">
                              {element.remainingSupply !== null ? (
                                <span>{element.remainingSupply} / {element.totalSupply} left</span>
                              ) : (
                                <span>Unlimited Supply</span>
                              )}
                            </div>
                            <div className="text-lg font-bold text-amber-400">
                              ${element.price}
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() => {
                              setSelectedElement(element);
                              setPurchaseQuantity(1);
                            }}
                            disabled={!element.available}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            data-testid={`button-purchase-${element.id}`}
                          >
                            {element.available ? (
                              <>
                                <Crown className="w-4 h-4 mr-2" />
                                Acquire Element
                              </>
                            ) : (
                              "Sold Out"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-collection" className="space-y-4">
            <Card className="bg-slate-800/50 dark:bg-black/50 border-purple-500/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-purple-200 dark:text-purple-300">
                  Collection Overview
                </CardTitle>
                <CardDescription className="text-purple-300 dark:text-purple-400">
                  Manage and view your ethereal elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collectionLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-64 bg-slate-700/30 dark:bg-slate-900/30" />
                    ))
                  ) : userCollection.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Sparkles className="w-20 h-20 mx-auto mb-4 text-purple-400 opacity-50" />
                      <h3 className="text-xl font-semibold text-purple-200 dark:text-purple-300 mb-2">
                        Your collection is empty
                      </h3>
                      <p className="text-purple-300 dark:text-purple-400 mb-4">
                        Visit the marketplace to acquire your first ethereal element
                      </p>
                    </div>
                  ) : (
                    userCollection.map((item) => (
                      <Card
                        key={item.id}
                        className="bg-slate-700/30 dark:bg-slate-900/30 border-purple-500/30"
                        data-testid={`detailed-collection-item-${item.id}`}
                      >
                        <CardHeader>
                          <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-2">
                            <div className="text-7xl">{ElementIcon(item.element.elementType)}</div>
                          </div>
                          <CardTitle className="text-white dark:text-gray-100">{item.element.name}</CardTitle>
                          <CardDescription className="text-purple-300 dark:text-purple-400">
                            {item.element.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <Badge className={rarityColors[item.element.rarity.toLowerCase()]}>
                              {item.element.rarity}
                            </Badge>
                            <Badge variant="outline">x{item.quantity}</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-purple-300 dark:text-purple-400">Power</span>
                              <span className="text-white dark:text-gray-100 font-semibold">{item.element.power}</span>
                            </div>
                            <Progress value={(item.element.power / 1000) * 100} className="h-2 bg-slate-600 dark:bg-slate-800" />
                          </div>
                          <div className="text-sm text-purple-300 dark:text-purple-400">
                            Acquired: {new Date(item.acquiredAt).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedElement} onOpenChange={() => setSelectedElement(null)}>
        <DialogContent className="bg-slate-800 dark:bg-slate-900 border-purple-500/50 text-white dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {selectedElement?.name}
            </DialogTitle>
            <DialogDescription className="text-purple-300 dark:text-purple-400">
              {selectedElement?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
              <div className="text-9xl">{selectedElement && ElementIcon(selectedElement.elementType)}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-purple-300 dark:text-purple-400">Type</Label>
                <p className="text-white dark:text-gray-100 font-semibold">{selectedElement?.elementType}</p>
              </div>
              <div>
                <Label className="text-purple-300 dark:text-purple-400">Rarity</Label>
                <Badge className={rarityColors[selectedElement?.rarity.toLowerCase() || ""]}>
                  {selectedElement?.rarity}
                </Badge>
              </div>
              <div>
                <Label className="text-purple-300 dark:text-purple-400">Power</Label>
                <p className="text-white dark:text-gray-100 font-semibold">{selectedElement?.power}</p>
              </div>
              <div>
                <Label className="text-purple-300 dark:text-purple-400">Price</Label>
                <p className="text-amber-400 font-bold text-xl">${selectedElement?.price}</p>
              </div>
            </div>
            <div>
              <Label className="text-purple-300 dark:text-purple-400">Quantity</Label>
              <Input
                type="number"
                min="1"
                max={selectedElement?.remainingSupply || 100}
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                className="bg-slate-700 dark:bg-slate-900 border-purple-500/30 text-white dark:text-gray-100"
                data-testid="input-purchase-quantity"
              />
            </div>
            <div className="text-sm text-purple-300 dark:text-purple-400">
              {selectedElement?.remainingSupply !== null && selectedElement?.remainingSupply !== undefined ? (
                <span>{selectedElement.remainingSupply} of {selectedElement.totalSupply} remaining</span>
              ) : (
                <span>Unlimited supply available</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedElement(null)}
              className="border-purple-500 text-purple-300"
              data-testid="button-cancel-purchase"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending || !selectedElement?.available}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              data-testid="button-confirm-purchase"
            >
              {purchaseMutation.isPending ? "Processing..." : `Purchase for $${(selectedElement?.price || 0) * purchaseQuantity}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transferDialog} onOpenChange={setTransferDialog}>
        <DialogContent className="bg-slate-800 dark:bg-slate-900 border-purple-500/50 text-white dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>Transfer Element</DialogTitle>
            <DialogDescription className="text-purple-300 dark:text-purple-400">
              Send an element to another user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Element</Label>
              <Select value={transferElementId} onValueChange={setTransferElementId}>
                <SelectTrigger className="bg-slate-700 dark:bg-slate-900 border-purple-500/30" data-testid="select-transfer-element">
                  <SelectValue placeholder="Select element" />
                </SelectTrigger>
                <SelectContent>
                  {userCollection.map((item) => (
                    <SelectItem key={item.id} value={item.elementId}>
                      {item.element.name} (x{item.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Recipient User ID</Label>
              <Input
                value={transferUserId}
                onChange={(e) => setTransferUserId(e.target.value)}
                placeholder="Enter user ID"
                className="bg-slate-700 dark:bg-slate-900 border-purple-500/30 text-white dark:text-gray-100"
                data-testid="input-transfer-userid"
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={transferQuantity}
                onChange={(e) => setTransferQuantity(parseInt(e.target.value) || 1)}
                className="bg-slate-700 dark:bg-slate-900 border-purple-500/30 text-white dark:text-gray-100"
                data-testid="input-transfer-quantity"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransferDialog(false)}
              className="border-purple-500 text-purple-300"
              data-testid="button-cancel-transfer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={transferMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
              data-testid="button-confirm-transfer"
            >
              {transferMutation.isPending ? "Transferring..." : "Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
