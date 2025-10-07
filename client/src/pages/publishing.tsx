import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSongSchema, type songs, type wallets } from "@shared/schema";

type SelectSong = typeof songs.$inferSelect;
type SelectWallet = typeof wallets.$inferSelect;
import { z } from "zod";
import { Music, Upload, CheckCircle, Clock, AlertCircle, Coins, Image, Play, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";

const uploadSongSchema = insertSongSchema.omit({ userId: true }).extend({
  albumArt: z.string().optional(),
  audioFile: z.string().optional(),
});

const publishSchema = z.object({
  walletId: z.string().min(1, "Please select a wallet"),
  mintNFT: z.boolean().default(true),
  createToken: z.boolean().default(true),
  network: z.string().default("polygon"),
  tokenSupply: z.string().default("1000000"),
});

type UploadSongForm = z.infer<typeof uploadSongSchema>;
type PublishForm = z.infer<typeof publishSchema>;

export default function PublishingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSong, setSelectedSong] = useState<SelectSong | null>(null);
  const [publishResult, setPublishResult] = useState<any>(null);

  const { data: songs, isLoading: songsLoading } = useQuery<any[]>({
    queryKey: ["/api/songs?includeDetails=true"],
  });

  const { data: wallets } = useQuery<SelectWallet[]>({
    queryKey: ["/api/wallets"],
  });

  const uploadForm = useForm<UploadSongForm>({
    resolver: zodResolver(uploadSongSchema),
    defaultValues: {
      title: "",
      artist: "",
      albumArt: "",
      audioFile: "",
    },
  });

  const publishForm = useForm<PublishForm>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      walletId: "",
      mintNFT: true,
      createToken: true,
      network: "polygon",
      tokenSupply: "1000000",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadSongForm) => {
      const res = await apiRequest("POST", "/api/songs", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs?includeDetails=true"] });
      uploadForm.reset();
      toast({
        title: "Song uploaded",
        description: "Your song has been successfully uploaded to the Kingdom library.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload song",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async ({ songId, data }: { songId: string; data: PublishForm }) => {
      const res = await apiRequest("POST", `/api/songs/${songId}/publish`, data);
      return await res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs?includeDetails=true"] });
      publishForm.reset();
      setSelectedSong(null);
      setPublishResult(result);
      toast({
        title: "Publication successful!",
        description: `NFT deployed at ${result.nft?.contractAddress || 'N/A'}, Token at ${result.token?.contractAddress || 'N/A'}`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Publication failed",
        description: error.message || "Failed to publish song",
      });
    },
  });

  const onUploadSubmit = uploadForm.handleSubmit((data) => {
    uploadMutation.mutate(data);
  });

  const onPublishSubmit = publishForm.handleSubmit((data) => {
    if (!selectedSong) return;
    publishMutation.mutate({ songId: selectedSong.id, data });
  });

  const getStatusBadgeVariant = (isPublished: boolean | null) => {
    return isPublished ? "default" : "secondary";
  };

  const getStatusIcon = (isPublished: boolean | null) => {
    if (isPublished) return <CheckCircle className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const publishedSongs = songs?.filter(s => s.isPublished) || [];
  const unpublishedSongs = songs?.filter(s => !s.isPublished) || [];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access Jesus Cartel Publishing.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="heading-publishing">
            <Music className="h-8 w-8 text-primary" />
            Jesus Cartel Publishing
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-subtitle">
            Automated song → NFT → ERC-20 token pipeline with Kingdom excellence
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-song" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Song
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle data-testid="heading-upload-dialog">Upload New Song</DialogTitle>
              <DialogDescription>
                Add your song to the Jesus Cartel library. IPFS hashes for album art and audio files optional.
              </DialogDescription>
            </DialogHeader>
            <Form {...uploadForm}>
              <form onSubmit={onUploadSubmit} className="space-y-4">
                <FormField
                  control={uploadForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Song Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Kingdom Anthem" data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={uploadForm.control}
                  name="artist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artist Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Jesus Cartel" data-testid="input-artist" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={uploadForm.control}
                  name="albumArt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Album Art (IPFS Hash)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="QmXx..." data-testid="input-albumart" />
                      </FormControl>
                      <FormDescription>Optional - IPFS hash for album artwork</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={uploadForm.control}
                  name="audioFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audio File (IPFS Hash)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="QmYy..." data-testid="input-audiofile" />
                      </FormControl>
                      <FormDescription>Optional - IPFS hash for audio file</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={uploadMutation.isPending} data-testid="button-submit-upload">
                    {uploadMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      "Upload Song"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {publishResult && (
        <Alert className="mx-6 mt-6" data-testid="alert-publish-result">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-semibold">Publishing Complete for "{publishResult.song?.title}"</div>
              {publishResult.nft && (
                <div className="text-sm font-mono" data-testid="text-nft-result">
                  NFT: {publishResult.nft.contractAddress} (Tx: {publishResult.nft.txHash?.slice(0, 10)}...)
                </div>
              )}
              {publishResult.token && (
                <div className="text-sm font-mono" data-testid="text-token-result">
                  Token: {publishResult.token.contractAddress} ({publishResult.token.symbol}) (Tx: {publishResult.token.txHash?.slice(0, 10)}...)
                </div>
              )}
              <Button size="sm" variant="outline" onClick={() => setPublishResult(null)} data-testid="button-dismiss-result">
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="unpublished" className="flex-1 p-6">
        <TabsList data-testid="tabs-publishing">
          <TabsTrigger value="unpublished" data-testid="tab-unpublished">
            Unpublished ({unpublishedSongs.length})
          </TabsTrigger>
          <TabsTrigger value="published" data-testid="tab-published">
            Published ({publishedSongs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unpublished" className="mt-6">
          {songsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : unpublishedSongs.length === 0 ? (
            <Alert data-testid="alert-no-unpublished">
              <Music className="h-4 w-4" />
              <AlertDescription>
                No unpublished songs. Upload your first track to begin the divine publishing pipeline.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unpublishedSongs.map((song) => (
                <Card key={song.id} data-testid={`card-song-${song.id}`}>
                  <CardHeader className="gap-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg" data-testid={`text-song-title-${song.id}`}>{song.title}</CardTitle>
                        <CardDescription data-testid={`text-song-artist-${song.id}`}>{song.artist}</CardDescription>
                      </div>
                      <Badge variant={getStatusBadgeVariant(song.isPublished)} className="gap-1" data-testid={`badge-status-${song.id}`}>
                        {getStatusIcon(song.isPublished)}
                        {song.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {song.albumArt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-albumart-${song.id}`}>
                        <Image className="h-4 w-4" />
                        <span className="font-mono text-xs truncate">{song.albumArt}</span>
                      </div>
                    )}
                    {song.audioFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-audiofile-${song.id}`}>
                        <Play className="h-4 w-4" />
                        <span className="font-mono text-xs truncate">{song.audioFile}</span>
                      </div>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          className="w-full gap-2"
                          onClick={() => setSelectedSong(song)}
                          data-testid={`button-publish-${song.id}`}
                        >
                          <Coins className="h-4 w-4" />
                          Publish to Blockchain
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle data-testid="heading-publish-dialog">Publish "{song.title}"</DialogTitle>
                          <DialogDescription>
                            Deploy NFT (ERC-721) and create token (ERC-20) for this song with divine excellence.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...publishForm}>
                          <form onSubmit={onPublishSubmit} className="space-y-4">
                            <FormField
                              control={publishForm.control}
                              name="walletId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Wallet</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-wallet">
                                        <SelectValue placeholder="Select wallet" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {wallets?.map((wallet) => (
                                        <SelectItem key={wallet.id} value={wallet.id} data-testid={`option-wallet-${wallet.id}`}>
                                          {wallet.network} - {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={publishForm.control}
                              name="network"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Network</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-network">
                                        <SelectValue placeholder="Select network" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="ethereum" data-testid="option-ethereum">Ethereum</SelectItem>
                                      <SelectItem value="polygon" data-testid="option-polygon">Polygon</SelectItem>
                                      <SelectItem value="bsc" data-testid="option-bsc">BSC</SelectItem>
                                      <SelectItem value="arbitrum" data-testid="option-arbitrum">Arbitrum</SelectItem>
                                      <SelectItem value="optimism" data-testid="option-optimism">Optimism</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={publishForm.control}
                              name="tokenSupply"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Token Supply</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="1000000" data-testid="input-tokensupply" />
                                  </FormControl>
                                  <FormDescription>Total supply for ERC-20 token</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit" disabled={publishMutation.isPending} data-testid="button-submit-publish">
                                {publishMutation.isPending ? (
                                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing...</>
                                ) : (
                                  "Publish to Blockchain"
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          {publishedSongs.length === 0 ? (
            <Alert data-testid="alert-no-published">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No published songs yet. Publish your first track to launch it into the Kingdom blockchain.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publishedSongs.map((song) => (
                <Card key={song.id} data-testid={`card-published-${song.id}`}>
                  <CardHeader className="gap-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg" data-testid={`text-published-title-${song.id}`}>{song.title}</CardTitle>
                        <CardDescription data-testid={`text-published-artist-${song.id}`}>{song.artist}</CardDescription>
                      </div>
                      <Badge variant="default" className="gap-1" data-testid={`badge-published-${song.id}`}>
                        <CheckCircle className="h-3 w-3" />
                        Published
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {song.nftDetails && (
                      <div className="space-y-1" data-testid={`nft-details-${song.id}`}>
                        <div className="text-xs font-semibold text-muted-foreground">NFT Contract</div>
                        <div className="font-mono text-xs break-all" data-testid={`text-nft-contract-${song.id}`}>
                          {song.nftDetails.contractAddress}
                        </div>
                        {song.nftDetails.mintTxHash && (
                          <div className="text-xs text-muted-foreground font-mono" data-testid={`text-nft-tx-${song.id}`}>
                            Mint Tx: {song.nftDetails.mintTxHash.slice(0, 10)}...{song.nftDetails.mintTxHash.slice(-8)}
                          </div>
                        )}
                      </div>
                    )}
                    {song.tokenDetails && (
                      <div className="space-y-1" data-testid={`token-details-${song.id}`}>
                        <div className="text-xs font-semibold text-muted-foreground">
                          Token ({song.tokenDetails.symbol})
                        </div>
                        <div className="font-mono text-xs break-all" data-testid={`text-token-contract-${song.id}`}>
                          {song.tokenDetails.contractAddress}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Supply: {song.tokenDetails.totalSupply}
                        </div>
                        {song.tokenDetails.deployTxHash && (
                          <div className="text-xs text-muted-foreground font-mono" data-testid={`text-token-tx-${song.id}`}>
                            Deploy Tx: {song.tokenDetails.deployTxHash.slice(0, 10)}...{song.tokenDetails.deployTxHash.slice(-8)}
                          </div>
                        )}
                      </div>
                    )}
                    {song.publishedAt && (
                      <div className="text-xs text-muted-foreground" data-testid={`text-published-at-${song.id}`}>
                        Published: {new Date(song.publishedAt as string | number | Date).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
