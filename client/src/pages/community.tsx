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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { insertForumThreadSchema, insertForumReplySchema, type ForumCategory, type ForumThread, type ForumReply } from "@shared/schema";
import {
  Users,
  MessageSquare,
  Crown,
  Lock,
  TrendingUp,
  Star,
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
  Shield
} from "lucide-react";
import { useState } from "react";

const threadFormSchema = insertForumThreadSchema.omit({ userId: true }).extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
});

const replyFormSchema = insertForumReplySchema.omit({ userId: true }).extend({
  content: z.string().min(1, "Reply cannot be empty"),
  threadId: z.string().min(1),
});

type ThreadForm = z.infer<typeof threadFormSchema>;
type ReplyForm = z.infer<typeof replyFormSchema>;

export default function CommunityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery<ForumCategory[]>({
    queryKey: ["/api/forum/categories"],
  });

  const { data: threads, isLoading: threadsLoading } = useQuery<ForumThread[]>({
    queryKey: ["/api/forum/threads"],
    refetchInterval: 5000,
  });

  const { data: replies } = useQuery<ForumReply[]>({
    queryKey: ["/api/forum/replies"],
    enabled: !!selectedThread,
    refetchInterval: 3000,
  });

  const threadForm = useForm<ThreadForm>({
    resolver: zodResolver(threadFormSchema),
    defaultValues: {
      title: "",
      content: "",
      isPinned: false,
      isLocked: false,
    },
  });

  const replyForm = useForm<ReplyForm>({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const createThreadMutation = useMutation({
    mutationFn: async (data: ThreadForm) => {
      const response = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create thread");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/threads"] });
      toast({
        title: "Thread Created",
        description: "Your discussion thread has been posted",
      });
      setDialogOpen(false);
      threadForm.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Create Thread",
        description: error.message,
      });
    },
  });

  const createReplyMutation = useMutation({
    mutationFn: async (data: ReplyForm) => {
      const response = await fetch("/api/forum/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to post reply");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/replies"] });
      toast({
        title: "Reply Posted",
        description: "Your response has been added",
      });
      replyForm.reset();
      setReplyingTo(null);
    },
  });

  // Calculate stats
  const totalThreads = threads?.length || 0;
  const totalReplies = replies?.length || 0;
  const activeThreads = threads?.filter(t => !t.isLocked).length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <Users className="h-8 w-8" />
            VIP Community Forum
          </h1>
          <p className="text-muted-foreground mt-1">
            Private discussions for Kingdom members
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2" data-testid="button-create-thread">
              <Sparkles className="h-4 w-4" />
              New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start New Discussion</DialogTitle>
              <DialogDescription>
                Create a thread for VIP community members
              </DialogDescription>
            </DialogHeader>
            <Form {...threadForm}>
              <form onSubmit={threadForm.handleSubmit((data) => createThreadMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={threadForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          data-testid="select-category"
                        >
                          <option value="">Select category...</option>
                          {categories?.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={threadForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Discussion title" {...field} data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={threadForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts..."
                          rows={6}
                          {...field}
                          data-testid="textarea-content"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createThreadMutation.isPending}
                  data-testid="button-submit-thread"
                >
                  {createThreadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Create Thread
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threads</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-threads">{totalThreads}</div>
            <p className="text-xs text-muted-foreground">Community discussions</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-threads">{activeThreads}</div>
            <p className="text-xs text-muted-foreground">Open for replies</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Replies</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-replies">{totalReplies}</div>
            <p className="text-xs text-muted-foreground">Community responses</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-categories">{categories?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Discussion topics</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="threads" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="threads" data-testid="tab-threads">Discussions</TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="space-y-4">
          {threadsLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading discussions...</p>
              </CardContent>
            </Card>
          ) : !threads || threads.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No discussions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start the first conversation</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {threads.map((thread) => {
                const threadReplies = replies?.filter(r => r.threadId === thread.id) || [];
                
                return (
                  <Card
                    key={thread.id}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setSelectedThread(thread.id)}
                    data-testid={`card-thread-${thread.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {thread.isPinned && (
                              <Badge variant="outline" className="gap-1" data-testid={`badge-pinned-${thread.id}`}>
                                <Star className="h-3 w-3" />
                                Pinned
                              </Badge>
                            )}
                            {thread.isLocked && (
                              <Badge variant="secondary" className="gap-1" data-testid={`badge-locked-${thread.id}`}>
                                <Lock className="h-3 w-3" />
                                Locked
                              </Badge>
                            )}
                            {user?.isAdmin && (
                              <Badge variant="default" className="gap-1">
                                <Crown className="h-3 w-3" />
                                VIP
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg" data-testid={`text-thread-title-${thread.id}`}>
                            {thread.title}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2" data-testid={`text-thread-content-${thread.id}`}>
                            {thread.content}
                          </CardDescription>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p data-testid={`text-thread-date-${thread.id}`}>
                            {new Date(thread.createdAt!).toLocaleDateString()}
                          </p>
                          <p className="font-semibold mt-1" data-testid={`text-thread-replies-${thread.id}`}>
                            {threadReplies.length} replies
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {categoriesLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading categories...</p>
              </CardContent>
            </Card>
          ) : !categories || categories.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No categories available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => {
                const categoryThreads = threads?.filter(t => t.categoryId === category.id) || [];
                
                return (
                  <Card key={category.id} className="hover-elevate" data-testid={`card-category-${category.id}`}>
                    <CardHeader>
                      <CardTitle data-testid={`text-category-name-${category.id}`}>{category.name}</CardTitle>
                      <CardDescription data-testid={`text-category-desc-${category.id}`}>
                        {category.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Discussions</span>
                        <Badge variant="outline" data-testid={`badge-category-count-${category.id}`}>
                          {categoryThreads.length}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Thread Detail Dialog */}
      {selectedThread && (
        <Dialog open={!!selectedThread} onOpenChange={() => setSelectedThread(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{threads?.find(t => t.id === selectedThread)?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p>{threads?.find(t => t.id === selectedThread)?.content}</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Replies ({replies?.filter(r => r.threadId === selectedThread).length || 0})</h3>
                {replies?.filter(r => r.threadId === selectedThread).map((reply) => (
                  <Card key={reply.id} data-testid={`card-reply-${reply.id}`}>
                    <CardContent className="p-4">
                      <p className="text-sm" data-testid={`text-reply-content-${reply.id}`}>{reply.content}</p>
                      <p className="text-xs text-muted-foreground mt-2" data-testid={`text-reply-date-${reply.id}`}>
                        {new Date(reply.createdAt!).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Form {...replyForm}>
                <form
                  onSubmit={replyForm.handleSubmit((data) =>
                    createReplyMutation.mutate({ ...data, threadId: selectedThread })
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={replyForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Write your reply..."
                            rows={3}
                            {...field}
                            data-testid="textarea-reply"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createReplyMutation.isPending} data-testid="button-submit-reply">
                    {createReplyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Post Reply
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
