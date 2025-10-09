import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function NewsFeeds() {
  const { data: news, isLoading } = useQuery({
    queryKey: ["/api/news"],
  });

  const { data: songs } = useQuery({
    queryKey: ["/api/songs"],
  });

  const recentSongs = (songs && Array.isArray(songs)) ? songs.slice(0, 2) : [];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="card-news-feeds">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Newspaper className="h-4 w-4" />
          News & Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentSongs.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-primary">Jesus Cartel Releases</h4>
              {recentSongs.map((song: any) => (
                <div key={song.id} className="p-2 rounded-lg bg-primary/10 border border-primary/20" data-testid={`song-${song.id}`}>
                  <p className="text-sm font-medium">{song.title}</p>
                  <p className="text-xs text-muted-foreground">{song.artist}</p>
                  {song.isPublished && <Badge className="mt-1 text-xs">Published</Badge>}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-semibold">Market News</h4>
            {news && Array.isArray(news) && news.length > 0 ? (
              news.slice(0, 3).map((item: any) => (
                <a 
                  key={item.id} 
                  href={item.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  data-testid={`news-${item.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.source || 'Market Watch'}
                  </p>
                </a>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No news available</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
