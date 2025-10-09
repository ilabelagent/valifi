import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCelebrityProfileSchema, insertFanStakeSchema, insertCelebrityContentSchema, insertPredictionMarketSchema, insertFanBetSchema } from "@shared/schema";
import { z } from "zod";
import { UserPlus, Star, TrendingUp, MessageCircle, Trophy, Heart, Share2, Eye, Calendar, DollarSign, Lock } from "lucide-react";

export default function CelebrityPlatform() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedCelebrityId, setSelectedCelebrityId] = useState<string | null>(null);

  // Fetch all celebrities
  const { data: celebrities = [], isLoading: loadingCelebrities } = useQuery<any[]>({
    queryKey: ["/api/celebrities"],
  });

  // Fetch selected celebrity details
  const { data: celebrityDetails } = useQuery({
    queryKey: ["/api/celebrities", selectedCelebrityId],
    enabled: !!selectedCelebrityId,
  });

  // Fetch celebrity content
  const { data: celebrityContent = [] } = useQuery({
    queryKey: ["/api/celebrities", selectedCelebrityId, "content"],
    enabled: !!selectedCelebrityId,
  });

  // Fetch predictions
  const { data: predictions = [] } = useQuery<any[]>({
    queryKey: ["/api/twinn/predictions"],
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (celebrityId: string) => {
      return apiRequest("POST", `/api/celebrities/${celebrityId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities", selectedCelebrityId] });
      toast({ title: "Success", description: "Followed successfully!" });
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (celebrityId: string) => {
      return apiRequest("DELETE", `/api/celebrities/${celebrityId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities", selectedCelebrityId] });
      toast({ title: "Success", description: "Unfollowed successfully!" });
    },
  });

  // Stake mutation
  const stakeMutation = useMutation({
    mutationFn: async ({ celebrityId, data }: { celebrityId: string; data: z.infer<typeof insertFanStakeSchema> }) => {
      return apiRequest("POST", `/api/celebrities/${celebrityId}/stake`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities", selectedCelebrityId] });
      toast({ title: "Success", description: "Stake placed successfully!" });
    },
  });

  // Bet mutation
  const betMutation = useMutation({
    mutationFn: async ({ celebrityId, predId, data }: { celebrityId: string; predId: string; data: Record<string, any> }) => {
      return apiRequest("POST", `/api/celebrities/${celebrityId}/predictions/${predId}/bet`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/twinn/predictions"] });
      toast({ title: "Success", description: "Bet placed successfully!" });
    },
  });

  if (loadingCelebrities) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading celebrities...</p>
        </div>
      </div>
    );
  }

  // If a celebrity is selected, show detail view
  if (selectedCelebrityId && celebrityDetails) {
    return <CelebrityDetailView 
      celebrity={celebrityDetails} 
      content={celebrityContent}
      predictions={predictions.filter((p: any) => p.celebrityId === selectedCelebrityId)}
      onBack={() => setSelectedCelebrityId(null)}
      onFollow={() => followMutation.mutate(selectedCelebrityId)}
      onUnfollow={() => unfollowMutation.mutate(selectedCelebrityId)}
      onStake={(data: z.infer<typeof insertFanStakeSchema>) => stakeMutation.mutate({ celebrityId: selectedCelebrityId, data })}
      onBet={(predId: string, data: Record<string, any>) => betMutation.mutate({ celebrityId: selectedCelebrityId, predId, data })}
    />;
  }

  // Browse celebrities view
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid="text-page-title">
            Celebrity Fan Platform
          </h1>
          <p className="text-muted-foreground mt-2">Follow, stake, and bet on your favorite celebrities</p>
        </div>
        <CreateCelebrityDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {celebrities.map((celebrity: any) => (
          <CelebrityCard
            key={celebrity.id}
            celebrity={celebrity}
            onViewDetails={() => setSelectedCelebrityId(celebrity.id)}
            onFollow={() => followMutation.mutate(celebrity.id)}
            onUnfollow={() => unfollowMutation.mutate(celebrity.id)}
          />
        ))}
      </div>

      {celebrities.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No celebrities yet</h3>
          <p className="text-muted-foreground">Be the first to create a celebrity profile!</p>
        </div>
      )}
    </div>
  );
}

function CelebrityCard({ celebrity, onViewDetails, onFollow, onUnfollow }: any) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-celebrity-${celebrity.id}`}>
      <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500">
        {celebrity.coverImage && (
          <img src={celebrity.coverImage} alt="Cover" className="w-full h-full object-cover" />
        )}
        <div className="absolute bottom-4 left-4">
          <Avatar className="h-20 w-20 border-4 border-white">
            <AvatarImage src={celebrity.profileImage} />
            <AvatarFallback>{celebrity.stageName?.[0] || "C"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {celebrity.stageName}
          {celebrity.verificationStatus === "verified" && (
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
              <Star className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{celebrity.category || "Celebrity"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm mb-4">
          <div>
            <p className="text-muted-foreground">Followers</p>
            <p className="font-semibold" data-testid={`text-followers-${celebrity.id}`}>{celebrity.followerCount || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Staked</p>
            <p className="font-semibold" data-testid={`text-staked-${celebrity.id}`}>${parseFloat(celebrity.totalStaked || "0").toFixed(2)}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{celebrity.bio || "No bio available"}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={onViewDetails}
          data-testid={`button-view-${celebrity.id}`}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Profile
        </Button>
        {celebrity.isFollowing ? (
          <Button 
            variant="secondary" 
            onClick={onUnfollow}
            data-testid={`button-unfollow-${celebrity.id}`}
          >
            <Heart className="h-4 w-4 fill-current" />
          </Button>
        ) : (
          <Button 
            variant="default" 
            onClick={onFollow}
            data-testid={`button-follow-${celebrity.id}`}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function CelebrityDetailView({ celebrity, content, predictions, onBack, onFollow, onUnfollow, onStake, onBet }: any) {
  const [activeTab, setActiveTab] = useState("content");

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Button variant="ghost" onClick={onBack} className="mb-4" data-testid="button-back">
        ← Back to Celebrities
      </Button>

      {/* Celebrity Header */}
      <div className="relative h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-6">
        {celebrity.coverImage && (
          <img src={celebrity.coverImage} alt="Cover" className="w-full h-full object-cover rounded-lg" />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage src={celebrity.profileImage} />
              <AvatarFallback>{celebrity.stageName?.[0] || "C"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold" data-testid="text-celebrity-name">{celebrity.stageName}</h1>
                {celebrity.verificationStatus === "verified" && (
                  <Star className="h-6 w-6 fill-blue-500 text-blue-500" />
                )}
              </div>
              <p className="text-white/90">{celebrity.category}</p>
            </div>
            <div className="flex gap-2">
              {celebrity.isFollowing ? (
                <Button variant="secondary" onClick={onUnfollow} data-testid="button-unfollow-detail">
                  <Heart className="h-4 w-4 mr-2 fill-current" />
                  Following
                </Button>
              ) : (
                <Button onClick={onFollow} data-testid="button-follow-detail">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </Button>
              )}
              <StakeDialog celebrity={celebrity} onStake={onStake} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold" data-testid="text-followers-detail">{celebrity.followerCount || 0}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold" data-testid="text-total-staked-detail">${parseFloat(celebrity.totalStaked || "0").toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Staked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold" data-testid="text-user-stake-detail">
                ${celebrity.userStake ? parseFloat(celebrity.userStake.amountStaked).toFixed(2) : "0.00"}
              </p>
              <p className="text-sm text-muted-foreground">Your Stake</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bio */}
      {celebrity.bio && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{celebrity.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content" data-testid="tab-content">
            <MessageCircle className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="predictions" data-testid="tab-predictions">
            <Trophy className="h-4 w-4 mr-2" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="social" data-testid="tab-social">
            <Share2 className="h-4 w-4 mr-2" />
            Social Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <div className="space-y-4">
            {content.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No content available yet</p>
                </CardContent>
              </Card>
            ) : (
              content.map((item: any) => (
                <ContentCard key={item.id} content={item} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="mt-6">
          <div className="space-y-4">
            {predictions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No predictions available</p>
                </CardContent>
              </Card>
            ) : (
              predictions.map((prediction: any) => (
                <PredictionCard key={prediction.id} prediction={prediction} onBet={(data: Record<string, any>) => onBet(prediction.id, data)} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {celebrity.socialLinks ? (
                <div className="space-y-2">
                  {Object.entries(celebrity.socialLinks).map(([platform, url]: any) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                      data-testid={`link-social-${platform}`}
                    >
                      <Share2 className="h-4 w-4" />
                      {platform}: {url}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No social links available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContentCard({ content }: any) {
  const accessIcons: any = {
    public: <Eye className="h-4 w-4" />,
    followers: <Heart className="h-4 w-4" />,
    stakers: <TrendingUp className="h-4 w-4" />,
    premium: <Lock className="h-4 w-4" />,
  };

  return (
    <Card data-testid={`card-content-${content.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{content.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {accessIcons[content.accessLevel || "public"]}
              <span className="capitalize">{content.accessLevel || "public"}</span>
              {content.isExclusive && <Badge variant="secondary">Exclusive</Badge>}
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {content.viewCount || 0}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {content.likeCount || 0}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{content.content}</p>
        {content.mediaUrl && (
          <div className="mt-4">
            {content.contentType === "video" ? (
              <video src={content.mediaUrl} controls className="w-full rounded-lg" />
            ) : content.contentType === "audio" ? (
              <audio src={content.mediaUrl} controls className="w-full" />
            ) : (
              <img src={content.mediaUrl} alt={content.title} className="w-full rounded-lg" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PredictionCard({ prediction, onBet }: any) {
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const { toast } = useToast();

  const handlePlaceBet = () => {
    if (!selectedOutcome || !betAmount) {
      toast({ title: "Error", description: "Please select an outcome and enter bet amount", variant: "destructive" });
      return;
    }

    onBet({
      betType: "prediction",
      description: `${prediction.question} - ${selectedOutcome}`,
      amountBet: betAmount,
      odds: "2.0",
      potentialPayout: (parseFloat(betAmount) * 2).toString(),
    });

    setSelectedOutcome("");
    setBetAmount("");
  };

  const isPredictionOpen = prediction.status === "open" && new Date(prediction.closesAt) > new Date();

  return (
    <Card data-testid={`card-prediction-${prediction.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{prediction.question}</CardTitle>
            <CardDescription>{prediction.description}</CardDescription>
          </div>
          <Badge variant={isPredictionOpen ? "default" : "secondary"}>
            {prediction.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Pool:</span>
            <span className="font-semibold">${parseFloat(prediction.totalPool || "0").toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Closes:</span>
            <span className="font-semibold">{new Date(prediction.closesAt).toLocaleDateString()}</span>
          </div>

          {isPredictionOpen && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Outcome</label>
                <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                  <SelectTrigger data-testid="select-outcome">
                    <SelectValue placeholder="Choose an outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    {prediction.outcomes?.map((outcome: string) => (
                      <SelectItem key={outcome} value={outcome}>
                        {outcome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bet Amount (USDT)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  data-testid="input-bet-amount"
                />
              </div>

              <Button onClick={handlePlaceBet} className="w-full" data-testid="button-place-bet">
                <TrendingUp className="h-4 w-4 mr-2" />
                Place Bet
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StakeDialog({ celebrity, onStake }: any) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const stakeForm = useForm({
    resolver: zodResolver(insertFanStakeSchema.omit({ fanId: true, celebrityId: true })),
    defaultValues: {
      amountStaked: "",
      currency: "USDT",
      stakingPeriod: 30,
      expectedReturn: "10",
    },
  });

  const handleStake = (data: any) => {
    onStake(data);
    setOpen(false);
    stakeForm.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-stake-dialog">
          <DollarSign className="h-4 w-4 mr-2" />
          Stake
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stake on {celebrity.stageName}</DialogTitle>
          <DialogDescription>
            Stake tokens on this celebrity's success and earn returns based on their performance.
          </DialogDescription>
        </DialogHeader>
        <Form {...stakeForm}>
          <form onSubmit={stakeForm.handleSubmit(handleStake)} className="space-y-4">
            <FormField
              control={stakeForm.control}
              name="amountStaked"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (USDT)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} data-testid="input-stake-amount" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={stakeForm.control}
              name="stakingPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staking Period (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="30" {...field} value={field.value || ""} onChange={(e) => field.onChange(parseInt(e.target.value))} data-testid="input-staking-period" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={stakeForm.control}
              name="expectedReturn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Return (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10" {...field} data-testid="input-expected-return" />
                  </FormControl>
                  <FormDescription>Estimated annual return percentage</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" data-testid="button-confirm-stake">Confirm Stake</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CreateCelebrityDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const createForm = useForm({
    resolver: zodResolver(insertCelebrityProfileSchema.omit({ userId: true })),
    defaultValues: {
      stageName: "",
      bio: "",
      category: "",
      profileImage: "",
      coverImage: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/celebrities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/celebrities"] });
      toast({ title: "Success", description: "Celebrity profile created successfully!" });
      setOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create celebrity profile", 
        variant: "destructive" 
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-celebrity">
          <UserPlus className="h-4 w-4 mr-2" />
          Become a Celebrity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Celebrity Profile</DialogTitle>
          <DialogDescription>
            Create your celebrity profile to connect with fans. KYC verification required.
          </DialogDescription>
        </DialogHeader>
        <Form {...createForm}>
          <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <FormField
              control={createForm.control}
              name="stageName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your celebrity name" {...field} data-testid="input-stage-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell fans about yourself..." {...field} data-testid="input-bio" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="musician">Musician</SelectItem>
                      <SelectItem value="athlete">Athlete</SelectItem>
                      <SelectItem value="influencer">Influencer</SelectItem>
                      <SelectItem value="actor">Actor</SelectItem>
                      <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="profileImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} data-testid="input-profile-image" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={createForm.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} data-testid="input-cover-image" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-celebrity">
                {createMutation.isPending ? "Creating..." : "Create Profile"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
