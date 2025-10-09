import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

const mockNews = [
  {
    id: "1",
    title: "Jesus Cartel Releases New Gospel Track",
    excerpt: "The Kingdom's official music collective drops another spiritual anthem...",
    category: "Jesus Cartel",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2", 
    title: "Bitcoin Surges Past $70K",
    excerpt: "Cryptocurrency markets rally as institutional adoption continues...",
    category: "Crypto News",
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Kingdom Platform Updates",
    excerpt: "New features and improvements rolled out to enhance user experience...",
    category: "Platform",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function NewsWidget() {
  const { data: news = mockNews, isLoading } = useQuery<any[]>({
    queryKey: ['/api/blog/posts'],
    initialData: mockNews,
  });

  const recentNews = news?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            News Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full" data-testid="widget-news">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          News Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentNews.map((item) => (
            <div 
              key={item.id} 
              className="group cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors"
              data-testid={`news-item-${item.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {item.excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
