import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { insertChatMessageSchema, type ChatSession, type ChatMessage } from "@shared/schema";
import {
  MessageSquare,
  Bot,
  Send,
  Loader2,
  Sparkles,
  Zap,
  Crown,
  User,
  RefreshCw,
  Plus
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const messageFormSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  sessionId: z.string().min(1),
});

type MessageForm = z.infer<typeof messageFormSchema>;

export default function ChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: sessions, isLoading: sessionsLoading } = useQuery<ChatSession[]>({
    queryKey: ["/api/chat/sessions"],
    refetchInterval: 5000,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", selectedSession],
    enabled: !!selectedSession,
    refetchInterval: 2000, // Real-time chat updates
  });

  const form = useForm<MessageForm>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: "",
      sessionId: selectedSession || "",
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Update form when session changes
  useEffect(() => {
    if (selectedSession) {
      form.setValue("sessionId", selectedSession);
    }
  }, [selectedSession, form]);

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: `Chat ${new Date().toLocaleString()}` }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create session");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      setSelectedSession(data.id);
      setDialogOpen(false);
      toast({
        title: "Chat Session Created",
        description: "New AI conversation started",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageForm) => {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, role: "user" }),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedSession] });
      form.reset({ content: "", sessionId: selectedSession || "" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Message Failed",
        description: error.message,
      });
    },
  });

  // Calculate stats
  const totalSessions = sessions?.length || 0;
  const activeSessions = sessions?.filter(s => s.status === "active").length || 0;
  const totalMessages = messages?.length || 0;
  const aiMessages = messages?.filter(m => m.role === "assistant").length || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold divine-gradient-text flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            AI Chat Automator
          </h1>
          <p className="text-muted-foreground mt-1">
            Conversational AI with multi-agent orchestration
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => createSessionMutation.mutate()}
          disabled={createSessionMutation.isPending}
          data-testid="button-new-session"
        >
          {createSessionMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              New Chat
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-sessions">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">All conversations</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-sessions">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">Ongoing chats</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-messages">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">In current chat</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Responses</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold covenant-gradient-text" data-testid="text-ai-messages">{aiMessages}</div>
            <p className="text-xs text-muted-foreground">Agent replies</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sessions Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 p-4">
                {sessionsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : !sessions || sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No sessions</p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <Card
                      key={session.id}
                      className={`hover-elevate cursor-pointer ${selectedSession === session.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedSession(session.id)}
                      data-testid={`card-session-${session.id}`}
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm" data-testid={`text-session-title-${session.id}`}>
                            {session.title || `Chat ${session.id.slice(0, 8)}`}
                          </CardTitle>
                          <Badge variant={session.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1" data-testid={`text-session-date-${session.id}`}>
                          {new Date(session.createdAt!).toLocaleDateString()}
                        </p>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Chat
              </CardTitle>
              {selectedSession && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedSession] })}
                  data-testid="button-refresh-chat"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedSession ? (
              <div className="p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Select a session or create a new chat</p>
              </div>
            ) : (
              <div className="flex flex-col h-[500px]">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      </div>
                    ) : !messages || messages.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          data-testid={`message-${message.id}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Bot className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div
                            className={`max-w-[70%] p-4 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap" data-testid={`text-message-content-${message.id}`}>
                              {message.content}
                            </p>
                            <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`} data-testid={`text-message-time-${message.id}`}>
                              {new Date(message.createdAt!).toLocaleTimeString()}
                            </p>
                          </div>
                          {message.role === 'user' && (
                            <div className="p-2 rounded-lg bg-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit((data) => sendMessageMutation.mutate(data))}
                      className="flex gap-2"
                    >
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Type your message..."
                                {...field}
                                disabled={sendMessageMutation.isPending}
                                data-testid="input-message"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={sendMessageMutation.isPending}
                        data-testid="button-send-message"
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
