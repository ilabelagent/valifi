import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Heart, TrendingUp, DollarSign, Star, Users, Eye, ThumbsUp, Trophy, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CelebrityProfile {
  id: string;
  userId: string;
  stageName: string;
  bio: string | null;
  category: string | null;
  verificationStatus: string;
  followerCount: number;
  totalStaked: string;
  profileImage: string | null;
  coverImage: string | null;
  socialLinks: any;
  metadata: any;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PredictionMarket {
  id: string;
  celebrityId: string | null;
  question: string;
  description: string | null;
  outcomes: string[];
  totalPool: string;
  resolutionCriteria: string;
  resolvedOutcome: string | null;
  status: string;
  closesAt: string;
  resolvedAt: string | null;
  createdAt: string;
}

interface CelebrityContent {
  id: string;
  celebrityId: string;
  contentType: string;
  title: string;
  content: string | null;
  mediaUrl: string | null;
  isExclusive: boolean;
  accessLevel: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
}

export default function TWinnPage() {
  const { toast } = useToast();
  const [selectedCelebrity, setSelectedCelebrity] = useState<CelebrityProfile | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeCurrency, setStakeCurrency] = useState("USDT");
  const [betAmount, setBetAmount] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionMarket | null>(null);

  const { data: celebrities, isLoading: loadingCelebrities } = useQuery<CelebrityProfile[]>({
    queryKey: ["/api/twinn/celebrities"],
  });

  const { data: predictions } = useQuery<PredictionMarket[]>({
    queryKey: ["/api/twinn/predictions"],
  });

  const { data: content } = useQuery<CelebrityContent[]>({
    queryKey: ["/api/twinn/content", selectedCelebrity?.id],
    enabled: !!selectedCelebrity,
  });

  const followMutation = useMutation({
    mutationFn: async (celebrityId: string) => {
      return await apiRequest("POST", `/api/twinn/follow/${celebrityId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/twinn/celebrities"] });
      toast({ title: "Success", description: "Follow status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update follow status", variant: "destructive" });
    },
  });

  const stakeMutation = useMutation({
    mutationFn: async ({ celebrityId, data }: { celebrityId: string; data: any }) => {
      return await apiRequest("POST", `/api/twinn/stake/${celebrityId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/twinn/celebrities"] });
      toast({ title: "Success", description: "Stake placed successfully" });
      setStakeAmount("");
      setSelectedCelebrity(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to place stake", variant: "destructive" });
    },
  });

  const betMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/twinn/bets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/twinn/predictions"] });
      toast({ title: "Success", description: "Bet placed successfully" });
      setBetAmount("");
      setSelectedOutcome("");
      setSelectedPrediction(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to place bet", variant: "destructive" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (contentId: string) => {
      return await apiRequest("POST", `/api/twinn/content/like/${contentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/twinn/content", selectedCelebrity?.id] });
    },
  });

  const handleFollow = (celebrity: CelebrityProfile) => {
    followMutation.mutate(celebrity.id);
  };

  const handleStake = () => {
    if (!selectedCelebrity || !stakeAmount) {
      toast({ title: "Error", description: "Please enter stake amount", variant: "destructive" });
      return;
    }

    stakeMutation.mutate({
      celebrityId: selectedCelebrity.id,
      data: {
        amountStaked: stakeAmount,
        currency: stakeCurrency,
        stakingPeriod: 30,
        expectedReturn: "5.0",
      },
    });
  };

  const handleBet = () => {
    if (!selectedPrediction || !betAmount || !selectedOutcome) {
      toast({ title: "Error", description: "Please fill all bet details", variant: "destructive" });
      return;
    }

    const odds = 2.5;
    betMutation.mutate({
      celebrityId: selectedPrediction.celebrityId,
      betType: "prediction",
      description: selectedPrediction.question,
      amountBet: betAmount,
      odds: odds.toString(),
      potentialPayout: (parseFloat(betAmount) * odds).toString(),
    });
  };

  if (loadingCelebrities) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const sortedCelebrities = celebrities
    ?.sort((a, b) => {
      const aIsJC = a.category?.toLowerCase().includes('jesus cartel') || a.metadata?.isJesusCartel;
      const bIsJC = b.category?.toLowerCase().includes('jesus cartel') || b.metadata?.isJesusCartel;
      if (aIsJC && !bIsJC) return -1;
      if (!aIsJC && bIsJC) return 1;
      return b.followerCount - a.followerCount;
    });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Sparkles className="h-8 w-8 text-purple-500" />
            TWinn Celebrity Fan Platform
          </h1>
          <p className="text-muted-foreground mt-2">
            Follow, stake, and bet on your favorite celebrities
          </p>
        </div>
      </div>

      <Tabs defaultValue="celebrities" className="w-full">
        <TabsList>
          <TabsTrigger value="celebrities" data-testid="tab-celebrities">Celebrities</TabsTrigger>
          <TabsTrigger value="predictions" data-testid="tab-predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="celebrities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCelebrities?.map((celebrity) => {
              const isJesusCartel = celebrity.category?.toLowerCase().includes('jesus cartel') || celebrity.metadata?.isJesusCartel;
              return (
                <Card key={celebrity.id} className="overflow-hidden" data-testid={`card-celebrity-${celebrity.id}`}>
                  <div 
                    className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{
                      backgroundImage: celebrity.coverImage ? `url(${celebrity.coverImage})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <CardHeader className="relative -mt-12">
                    <Avatar className="h-20 w-20 border-4 border-background">
                      <AvatarImage src={celebrity.profileImage || undefined} />
                      <AvatarFallback>{celebrity.stageName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="mt-2 flex items-center gap-2" data-testid={`text-celebrity-name-${celebrity.id}`}>
                      {celebrity.stageName}
                      {isJesusCartel && (
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          Jesus Cartel
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {celebrity.category && !isJesusCartel && (
                        <Badge variant="outline" className="mt-1">{celebrity.category}</Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{celebrity.bio || "No bio available"}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span data-testid={`text-followers-${celebrity.id}`}>{celebrity.followerCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span data-testid={`text-staked-${celebrity.id}`}>{parseFloat(celebrity.totalStaked).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      onClick={() => handleFollow(celebrity)}
                      variant={celebrity.isFollowing ? "secondary" : "default"}
                      className="flex-1"
                      data-testid={`button-follow-${celebrity.id}`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${celebrity.isFollowing ? 'fill-current' : ''}`} />
                      {celebrity.isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedCelebrity(celebrity)}
                          data-testid={`button-stake-${celebrity.id}`}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Stake
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Stake on {celebrity.stageName}</DialogTitle>
                          <DialogDescription>
                            Stake tokens to show support and earn returns
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="stake-amount">Stake Amount</Label>
                            <Input
                              id="stake-amount"
                              type="number"
                              value={stakeAmount}
                              onChange={(e) => setStakeAmount(e.target.value)}
                              placeholder="Enter amount"
                              data-testid="input-stake-amount"
                            />
                          </div>
                          <div>
                            <Label htmlFor="stake-currency">Currency</Label>
                            <Select value={stakeCurrency} onValueChange={setStakeCurrency}>
                              <SelectTrigger data-testid="select-currency">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USDT">USDT</SelectItem>
                                <SelectItem value="ETH">ETH</SelectItem>
                                <SelectItem value="BTC">BTC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            onClick={handleStake}
                            disabled={stakeMutation.isPending}
                            className="w-full"
                            data-testid="button-confirm-stake"
                          >
                            {stakeMutation.isPending ? "Processing..." : "Confirm Stake"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedCelebrity(celebrity)}
                          data-testid={`button-content-${celebrity.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{celebrity.stageName}'s Content</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {content?.map((item) => (
                            <Card key={item.id}>
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                    <CardDescription>
                                      <Badge variant="secondary">{item.contentType}</Badge>
                                      {item.isExclusive && <Badge variant="default" className="ml-2">Exclusive</Badge>}
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                {item.mediaUrl && (
                                  <img src={item.mediaUrl} alt={item.title} className="w-full rounded-md mb-3" />
                                )}
                                <p className="text-sm">{item.content}</p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" /> {item.viewCount}
                                  </span>
                                  <button
                                    onClick={() => likeMutation.mutate(item.id)}
                                    className="flex items-center gap-1 hover:text-foreground"
                                  >
                                    <ThumbsUp className="h-4 w-4" /> {item.likeCount}
                                  </button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {(!content || content.length === 0) && (
                            <p className="text-center text-muted-foreground py-8">No content available</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {(!celebrities || celebrities.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No celebrities available yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions?.filter(p => p.status === "open").map((prediction) => (
              <Card key={prediction.id} data-testid={`card-prediction-${prediction.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-prediction-question-${prediction.id}`}>
                        {prediction.question}
                      </CardTitle>
                      <CardDescription>{prediction.description}</CardDescription>
                    </div>
                    <Badge variant={prediction.status === "open" ? "default" : "secondary"}>
                      {prediction.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>Pool: {parseFloat(prediction.totalPool).toFixed(2)} USDT</span>
                  </div>

                  <div className="space-y-2">
                    <Label>Outcomes</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {prediction.outcomes.map((outcome: string, idx: number) => (
                        <Button
                          key={idx}
                          variant="outline"
                          className="w-full"
                          data-testid={`button-outcome-${idx}`}
                        >
                          {outcome}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Closes: {new Date(prediction.closesAt).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => setSelectedPrediction(prediction)}
                        data-testid={`button-bet-${prediction.id}`}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Place Bet
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Place Bet</DialogTitle>
                        <DialogDescription>{prediction.question}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bet-outcome">Select Outcome</Label>
                          <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                            <SelectTrigger data-testid="select-bet-outcome">
                              <SelectValue placeholder="Choose outcome" />
                            </SelectTrigger>
                            <SelectContent>
                              {prediction.outcomes.map((outcome: string, idx: number) => (
                                <SelectItem key={idx} value={outcome}>{outcome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="bet-amount">Bet Amount (USDT)</Label>
                          <Input
                            id="bet-amount"
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            placeholder="Enter amount"
                            data-testid="input-bet-amount"
                          />
                        </div>
                        {betAmount && (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">Potential Payout: <span className="font-bold">{(parseFloat(betAmount) * 2.5).toFixed(2)} USDT</span></p>
                            <p className="text-xs text-muted-foreground">Odds: 2.5x</p>
                          </div>
                        )}
                        <Button
                          onClick={handleBet}
                          disabled={betMutation.isPending}
                          className="w-full"
                          data-testid="button-confirm-bet"
                        >
                          {betMutation.isPending ? "Processing..." : "Confirm Bet"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>

          {(!predictions || predictions.filter(p => p.status === "open").length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active predictions available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
