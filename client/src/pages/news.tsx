import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { insertBlogPostSchema, type BlogPost } from "@shared/schema";
import {
  Newspaper,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Loader2,
  AlertCircle,
  Sparkles,
  Crown
} from "lucide-react";
import { useState } from "react";

const postFormSchema = insertBlogPostSchema.omit({ authorId: true }).extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
});

type PostForm = z.infer<typeof postFormSchema>;

export default function NewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const { data: posts, isLoading, isError, refetch } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts"],
    refetchInterval: 10000,
  });

  const form = useForm<PostForm>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "announcement",
      published: false,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: PostForm) => {
      const response = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      toast({
        title: "Post Created",
        description: "Blog post has been published",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Create Post",
        description: error.message,
      });
    },
  });

  // Calculate stats
  const totalPosts = posts?.length || 0;
  const publishedPosts = posts?.filter(p => p.published).length || 0;
  const totalViews = posts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

  const categoryColors: Record<string, string> = {
    announcement: "default",
    update: "secondary",
    feature: "outline",
    tutorial: "default",
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <Newspaper className="h-8 w-8" />
            Blog & News
          </h1>
          <p className="text-muted-foreground mt-1">
            Exchange updates and platform announcements
          </p>
        </div>
        {user?.isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2" data-testid="button-create-post">
                <Sparkles className="h-4 w-4" />
                New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Blog Post</DialogTitle>
                <DialogDescription>
                  Publish news and updates for the community
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Post title" {...field} data-testid="input-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            data-testid="select-category"
                          >
                            <option value="announcement">Announcement</option>
                            <option value="update">Update</option>
                            <option value="feature">Feature</option>
                            <option value="tutorial">Tutorial</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write your post content..."
                            rows={10}
                            {...field}
                            data-testid="textarea-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="published"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={field.onChange}
                              className="h-4 w-4"
                              data-testid="checkbox-published"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Publish immediately</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createPostMutation.isPending}
                    data-testid="button-submit-post"
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Create Post
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-posts">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">All articles</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-published-posts">{publishedPosts}</div>
            <p className="text-xs text-muted-foreground">Live articles</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold covenant-gradient-text" data-testid="text-total-views">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Article impressions</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-categories">4</div>
            <p className="text-xs text-muted-foreground">Content types</p>
          </CardContent>
        </Card>
      </div>

      {/* Posts Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Latest Articles</h2>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading articles...</p>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
              <p className="text-sm text-muted-foreground mb-4">Failed to load posts</p>
              <Button onClick={() => refetch()} variant="outline" size="sm" data-testid="button-retry">
                <Newspaper className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : !posts || posts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No blog posts yet</p>
              <p className="text-xs text-muted-foreground mt-1">Check back soon for updates</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="hover-elevate cursor-pointer"
                onClick={() => setSelectedPost(post)}
                data-testid={`card-post-${post.id}`}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={categoryColors[post.category || 'announcement'] as any} data-testid={`badge-category-${post.id}`}>
                      {post.category?.toUpperCase()}
                    </Badge>
                    {!post.published && (
                      <Badge variant="secondary" data-testid={`badge-draft-${post.id}`}>Draft</Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2" data-testid={`text-title-${post.id}`}>
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3" data-testid={`text-excerpt-${post.id}`}>
                    {post.content?.substring(0, 150)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span data-testid={`text-date-${post.id}`}>
                        {new Date(post.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                    {post.views !== undefined && (
                      <div className="flex items-center gap-1" data-testid={`text-views-${post.id}`}>
                        <Eye className="h-4 w-4" />
                        {post.views}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Dialog */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={categoryColors[selectedPost.category || 'announcement'] as any}>
                  {selectedPost.category?.toUpperCase()}
                </Badge>
                {!selectedPost.published && <Badge variant="secondary">Draft</Badge>}
              </div>
              <DialogTitle className="text-2xl">{selectedPost.title}</DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedPost.createdAt!).toLocaleDateString()}
                </div>
                {selectedPost.views !== undefined && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {selectedPost.views} views
                  </div>
                )}
              </div>
            </DialogHeader>
            <div className="mt-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedPost.content}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
