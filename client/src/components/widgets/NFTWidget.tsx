import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NFTWidget() {
  const { data: nfts, isLoading } = useQuery<any[]>({
    queryKey: ['/api/nfts'],
  });

  const recentNfts = nfts?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            NFT Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="widget-nft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          NFT Gallery
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentNfts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {recentNfts.map((nft) => (
              <div 
                key={nft.id} 
                className="group cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-colors"
                data-testid={`nft-item-${nft.id}`}
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {nft.imageUrl ? (
                    <img 
                      src={nft.imageUrl} 
                      alt={nft.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="p-2">
                  <p className="text-sm font-semibold truncate">{nft.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Token #{nft.tokenId}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No NFTs yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Mint your first NFT to see it here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
