import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Bot, User, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  agentType?: string;
  status?: "completed" | "failed";
  result?: any;
  logs?: string[];
  timestamp: Date;
}

const AGENT_TYPES = [
  { value: "auto", label: "Auto-Detect Agent" },
  { value: "orchestrator", label: "Orchestrator" },
  { value: "blockchain", label: "Blockchain" },
  { value: "payment", label: "Payment" },
  { value: "kyc", label: "KYC" },
  { value: "security", label: "Security" },
  { value: "guardian_angel", label: "Guardian Angel" },
  { value: "publishing", label: "Publishing" },
  { value: "quantum", label: "Quantum" },
  { value: "analytics", label: "Analytics" },
  { value: "monitoring", label: "Monitoring" },
  { value: "financial_stocks", label: "Financial - Stocks" },
  { value: "financial_forex", label: "Financial - Forex" },
  { value: "financial_bonds", label: "Financial - Bonds" },
  { value: "financial_metals", label: "Financial - Metals" },
  { value: "trading_defi", label: "Trading - DeFi" },
  { value: "trading_advanced", label: "Trading - Advanced" },
  { value: "wallet_hd", label: "Wallet - HD" },
  { value: "wallet_multisig", label: "Wallet - MultiSig" },
  { value: "nft_minting", label: "NFT - Minting" },
];

export default function AgentChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      content: "Welcome to the Valifi AI Agent Command Center. I can help you execute tasks across 63+ specialized agents including blockchain operations, payments, trading, analytics, and more. What would you like me to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("auto");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const executeAgentMutation = useMutation({
    mutationFn: async ({ task, agentType }: { task: string; agentType?: string }) => {
      return apiRequest("/api/agents/execute", "POST", {
        task,
        agentType: agentType === "auto" ? undefined : agentType,
      }) as Promise<any>;
    },
    onSuccess: (data) => {
      const agentMessage: Message = {
        id: Date.now().toString(),
        role: "agent",
        content: data.result?.message || "Task completed",
        agentType: data.agentType,
        status: data.status,
        result: data.result,
        logs: data.logs,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
    },
    onError: (error: any) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "agent",
        content: `Error: ${error.message || "Failed to execute task"}`,
        status: "failed",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        title: "Agent Execution Failed",
        description: error.message || "Failed to execute task",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    executeAgentMutation.mutate({
      task: input,
      agentType: selectedAgent,
    });
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#FFD700]" />
              AI Agent Conversational Interface
            </CardTitle>
            <CardDescription>
              Execute tasks through 63+ specialized AI agents
            </CardDescription>
          </div>
          <div className="w-64">
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent type" />
              </SelectTrigger>
              <SelectContent>
                {AGENT_TYPES.map((agent) => (
                  <SelectItem key={agent.value} value={agent.value}>
                    {agent.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user"
                        ? "bg-blue-500"
                        : "bg-[#FFD700]"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-black" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : message.status === "failed"
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.agentType && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {message.agentType}
                        </Badge>
                        {message.status === "completed" && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                        {message.status === "failed" && (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    )}
                    {message.logs && message.logs.length > 0 && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">
                          View execution logs
                        </summary>
                        <div className="mt-2 space-y-1 pl-2 border-l-2 border-muted">
                          {message.logs.map((log, idx) => (
                            <div key={idx}>{log}</div>
                          ))}
                        </div>
                      </details>
                    )}
                    {message.result && message.result.task && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">
                          View result details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(message.result, null, 2)}
                        </pre>
                      </details>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the task you want agents to perform..."
            disabled={executeAgentMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || executeAgentMutation.isPending}
            className="bg-[#FFD700] text-black hover:bg-[#FFA500]"
          >
            {executeAgentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
