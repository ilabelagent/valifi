import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Brain, 
  TrendingUp, 
  Award, 
  MessageSquare, 
  PlayCircle, 
  BarChart3,
  Zap,
  Target,
  Star,
  Search,
  Filter
} from "lucide-react";
import { SkillTree } from "@/components/SkillTree";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { io } from "socket.io-client";

interface BotWithStats {
  id: string;
  name: string;
  strategy: string;
  exchange: string;
  tradingPair: string;
  status: string;
  winRate: string | null;
  totalProfit: string | null;
  totalLoss: string | null;
  totalTrades: number | null;
  isActive: boolean;
  totalSkills: number;
  totalXP: number;
  avgLevel: number;
  totalTrainingSessions: number;
  completedSessions: number;
}

interface Skill {
  id: string;
  skillName: string;
  skillLevel: number | null;
  category: string | null;
  experiencePoints: number | null;
  lastUsedAt: Date | null;
}

interface TrainingSession {
  id: string;
  sessionType: string;
  status: string;
  performanceBefore: any;
  performanceAfter: any;
  improvementRate: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export default function BotMarketplace() {
  const { toast } = useToast();
  const [selectedBot, setSelectedBot] = useState<BotWithStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStrategy, setFilterStrategy] = useState<string>("all");
  const [questionText, setQuestionText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const [datasetFile, setDatasetFile] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Fetch marketplace bots
  const { data: bots = [], isLoading } = useQuery<BotWithStats[]>({
    queryKey: ['/api/bots/marketplace'],
  });

  // Fetch bot skills
  const { data: botSkills = [] } = useQuery<Skill[]>({
    queryKey: ['/api/bots', selectedBot?.id, 'skills'],
    enabled: !!selectedBot,
  });

  // Fetch bot training data
  const { data: trainingData } = useQuery({
    queryKey: ['/api/bots', selectedBot?.id, 'training'],
    enabled: !!selectedBot,
  });

  // Ask Bot mutation
  const askBotMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string }) => {
      const res = await apiRequest('POST', `/api/bots/${selectedBot?.id}/ask`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Bot Learned!",
        description: "The bot has successfully learned from your input.",
      });
      setQuestionText("");
      setAnswerText("");
      queryClient.invalidateQueries({ queryKey: ['/api/bots', selectedBot?.id, 'training'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bots', selectedBot?.id, 'skills'] });
    },
  });

  // Start training mutation
  const startTrainingMutation = useMutation({
    mutationFn: async (data: { sessionType: string; datasetFile?: string }) => {
      const res = await apiRequest('POST', `/api/bots/${selectedBot?.id}/train/manual`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Training Started!",
        description: "The bot is now training. Watch for real-time updates.",
      });
      setDatasetFile("");
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['/api/bots', selectedBot?.id, 'training'] });
    },
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    const newSocket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      newSocket.emit('subscribe:trading');
    });

    newSocket.on('trading:event', (event: any) => {
      console.log('Trading event received:', event);
      
      if (event.botId === selectedBot?.id) {
        toast({
          title: "Bot Update",
          description: event.data.message || "Bot learning progress updated",
        });
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/bots', selectedBot?.id, 'skills'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bots', selectedBot?.id, 'training'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bots/marketplace'] });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [selectedBot?.id, toast]);

  // Filter bots
  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bot.strategy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStrategy = filterStrategy === 'all' || bot.strategy === filterStrategy;
    return matchesSearch && matchesStrategy;
  });

  const strategies = Array.from(new Set(bots.map(b => b.strategy)));

  // Generate performance chart data
  const performanceChartData = (trainingData as any)?.sessions?.map((session: TrainingSession, index: number) => ({
    name: `Session ${index + 1}`,
    winRate: session.performanceAfter?.winRate || session.performanceBefore?.winRate || 0,
    profit: session.performanceAfter?.totalProfit || session.performanceBefore?.totalProfit || 0,
    improvement: parseFloat(session.improvementRate || '0'),
  })) || [];

  const handleAskBot = () => {
    if (!questionText || !answerText) {
      toast({
        title: "Missing Information",
        description: "Please provide both a question and an answer.",
        variant: "destructive",
      });
      return;
    }
    askBotMutation.mutate({ question: questionText, answer: answerText });
  };

  const handleDatasetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress((e.loaded / e.total) * 100);
      }
    };
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setDatasetFile(text);
      setUploadProgress(100);
      toast({
        title: "Dataset Uploaded!",
        description: `${file.name} loaded successfully`,
      });
    };
    reader.onerror = () => {
      toast({
        title: "Upload Failed",
        description: "Failed to read the dataset file",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-title">
            <Bot className="w-8 h-8" />
            Bot Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore 63+ intelligent trading bots. Train them, watch them learn, and see them evolve!
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {bots.length} Bots Available
        </Badge>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bots by name or strategy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterStrategy}
            onChange={(e) => setFilterStrategy(e.target.value)}
            className="px-3 py-2 rounded-md border bg-background"
            data-testid="select-strategy-filter"
          >
            <option value="all">All Strategies</option>
            {strategies.map(strategy => (
              <option key={strategy} value={strategy}>{strategy}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bot Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBots.map((bot) => (
            <Card 
              key={bot.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedBot(bot)}
              data-testid={`card-bot-${bot.id}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  {bot.name}
                  {bot.isActive && (
                    <Badge variant="outline" className="ml-auto">
                      <Zap className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{bot.strategy} on {bot.exchange}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Win Rate</span>
                  <span className="font-bold text-green-500">
                    {parseFloat(bot.winRate || '0').toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Profit</span>
                  <span className="font-bold text-primary">
                    ${parseFloat(bot.totalProfit || '0').toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-500">{bot.totalSkills}</div>
                    <div className="text-xs text-muted-foreground">Skills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-500">{bot.avgLevel}</div>
                    <div className="text-xs text-muted-foreground">Avg Lvl</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-500">{bot.totalXP}</div>
                    <div className="text-xs text-muted-foreground">Total XP</div>
                  </div>
                </div>
                <Progress 
                  value={(bot.completedSessions / Math.max(bot.totalTrainingSessions, 1)) * 100} 
                  className="h-2" 
                />
                <div className="text-xs text-muted-foreground text-center">
                  {bot.completedSessions} / {bot.totalTrainingSessions} training sessions completed
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bot Detail Modal */}
      <Dialog open={!!selectedBot} onOpenChange={() => setSelectedBot(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              {selectedBot?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedBot?.strategy} • {selectedBot?.exchange} • {selectedBot?.tradingPair}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="skills" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="skills" data-testid="tab-skills">
                <Award className="w-4 h-4 mr-2" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="training" data-testid="tab-training">
                <Brain className="w-4 h-4 mr-2" />
                Training
              </TabsTrigger>
              <TabsTrigger value="ask" data-testid="tab-ask">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask Bot
              </TabsTrigger>
              <TabsTrigger value="performance" data-testid="tab-performance">
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
            </TabsList>

            {/* Skills Tab */}
            <TabsContent value="skills">
              <ScrollArea className="h-[60vh] pr-4">
                {botSkills.length > 0 ? (
                  <SkillTree skills={botSkills} botId={selectedBot?.id || ''} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No skills yet. Start training this bot to unlock skills!</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Training Tab */}
            <TabsContent value="training">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Upload Training Dataset (Optional)</CardTitle>
                      <CardDescription>
                        Upload a JSON file with training examples. Format: [{"{"}"input": "...", "output": "..."{"}"}]
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label 
                          htmlFor="dataset-upload" 
                          className="flex-1 cursor-pointer border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors"
                        >
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              {datasetFile ? '✓ Dataset loaded' : 'Click to upload dataset JSON'}
                            </p>
                          </div>
                          <input
                            id="dataset-upload"
                            type="file"
                            accept=".json"
                            onChange={handleDatasetUpload}
                            className="hidden"
                            data-testid="input-dataset-upload"
                          />
                        </label>
                        {datasetFile && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDatasetFile("");
                              setUploadProgress(0);
                            }}
                            data-testid="button-clear-dataset"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <Progress value={uploadProgress} className="h-2" />
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Start Training Session</CardTitle>
                      <CardDescription>
                        Train your bot to improve its performance and unlock new skills
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          onClick={() => startTrainingMutation.mutate({ sessionType: 'supervised', datasetFile })}
                          disabled={startTrainingMutation.isPending}
                          className="w-full"
                          data-testid="button-train-supervised"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Supervised
                        </Button>
                        <Button
                          onClick={() => startTrainingMutation.mutate({ sessionType: 'reinforcement', datasetFile })}
                          disabled={startTrainingMutation.isPending}
                          variant="outline"
                          className="w-full"
                          data-testid="button-train-reinforcement"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Reinforcement
                        </Button>
                        <Button
                          onClick={() => startTrainingMutation.mutate({ sessionType: 'transfer', datasetFile })}
                          disabled={startTrainingMutation.isPending}
                          variant="outline"
                          className="w-full"
                          data-testid="button-train-transfer"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Transfer
                        </Button>
                      </div>
                      {startTrainingMutation.isPending && (
                        <div className="text-sm text-center text-muted-foreground animate-pulse">
                          Starting training session...
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Training History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(trainingData as any)?.sessions?.length > 0 ? (
                        <div className="space-y-3">
                          {(trainingData as any).sessions.slice(0, 10).map((session: TrainingSession) => (
                            <div key={session.id} className="border rounded-lg p-3" data-testid={`session-${session.id}`}>
                              <div className="flex items-center justify-between mb-2">
                                <Badge>{session.sessionType}</Badge>
                                <Badge variant={session.status === 'completed' ? 'default' : 'outline'}>
                                  {session.status}
                                </Badge>
                              </div>
                              
                              {session.status === 'completed' && session.performanceBefore && session.performanceAfter && (
                                <div className="grid grid-cols-2 gap-4 mt-3 mb-2">
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground">Before</p>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>Win Rate:</span>
                                        <span className="font-medium">{session.performanceBefore.winRate?.toFixed(1)}%</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Profit:</span>
                                        <span className="font-medium">${session.performanceBefore.totalProfit?.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground">After</p>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>Win Rate:</span>
                                        <span className="font-medium text-green-500">{session.performanceAfter.winRate?.toFixed(1)}%</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Profit:</span>
                                        <span className="font-medium text-green-500">${session.performanceAfter.totalProfit?.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {session.improvementRate && (
                                <div className="flex items-center gap-2 mt-2">
                                  <TrendingUp className={`w-4 h-4 ${parseFloat(session.improvementRate) > 0 ? 'text-green-500' : 'text-red-500'}`} />
                                  <span className={`text-sm font-semibold ${parseFloat(session.improvementRate) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {parseFloat(session.improvementRate) > 0 ? '+' : ''}{(parseFloat(session.improvementRate) * 100).toFixed(1)}% improvement
                                  </span>
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground mt-2">
                                {new Date(session.createdAt).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-6">
                          No training sessions yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Ask Bot Tab */}
            <TabsContent value="ask">
              <ScrollArea className="h-[60vh] pr-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Train Bot with Q&A</CardTitle>
                    <CardDescription>
                      Ask a question and provide the answer. The bot will learn from your input.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Question</label>
                      <Input
                        placeholder="What should the bot know?"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        data-testid="input-question"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Answer/Response</label>
                      <Textarea
                        placeholder="Teach the bot the correct response..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        rows={4}
                        data-testid="textarea-answer"
                      />
                    </div>
                    <Button
                      onClick={handleAskBot}
                      disabled={askBotMutation.isPending}
                      className="w-full"
                      data-testid="button-teach-bot"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {askBotMutation.isPending ? 'Teaching...' : 'Teach Bot'}
                    </Button>

                    {(trainingData as any)?.trainingData?.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3">Recent Interactions</h4>
                        <div className="space-y-2">
                          {(trainingData as any).trainingData.slice(0, 5).map((data: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3 text-sm">
                              <div className="font-medium">Q: {data.input}</div>
                              <div className="text-muted-foreground mt-1">A: {data.actualOutput}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">
                            {parseFloat(selectedBot?.winRate || '0').toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Win Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            ${parseFloat(selectedBot?.totalProfit || '0').toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Profit</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500">
                            ${parseFloat(selectedBot?.totalLoss || '0').toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Loss</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{selectedBot?.totalTrades || 0}</div>
                          <div className="text-sm text-muted-foreground">Total Trades</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {performanceChartData.length > 0 && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Performance Improvement Timeline</CardTitle>
                          <CardDescription>
                            Track win rate and profit improvements across training sessions
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={performanceChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="winRate" stroke="#10b981" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Profit Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={performanceChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Area type="monotone" dataKey="profit" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Learning Improvement Rate</CardTitle>
                          <CardDescription>
                            Percentage improvement from each training session
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={performanceChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="improvement" stroke="#8b5cf6" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
