import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Heart, TrendingUp, Calendar, Clock, Send, Sparkles, Crown, Award, Target } from "lucide-react";
import type { Prayer } from "@shared/schema";

const prayerCategories = [
  { value: "trade_guidance", label: "Trade Guidance", icon: TrendingUp },
  { value: "wisdom", label: "Wisdom", icon: BookOpen },
  { value: "gratitude", label: "Gratitude", icon: Heart },
  { value: "protection", label: "Protection", icon: Award },
  { value: "prosperity", label: "Prosperity", icon: Crown },
  { value: "general", label: "General", icon: Sparkles },
];

const prayerSchema = z.object({
  prayerText: z.string().min(10, "Prayer must be at least 10 characters"),
  category: z.string(),
});

type PrayerFormValues = z.infer<typeof prayerSchema>;

export default function PrayerCenterPage() {
  const { toast } = useToast();
  const [prayerDialogOpen, setPrayerDialogOpen] = useState(false);
  const [meditationTime, setMeditationTime] = useState(0);
  const [meditationActive, setMeditationActive] = useState(false);
  const [meditationDuration, setMeditationDuration] = useState(5);

  const { data: dailyScripture, isLoading: scriptureLoading } = useQuery({
    queryKey: ["/api/prayers/daily-scripture"],
  });

  const { data: prayers, isLoading: prayersLoading } = useQuery<Prayer[]>({
    queryKey: ["/api/prayers"],
  });

  const { data: prayerHistory } = useQuery({
    queryKey: ["/api/prayers/history"],
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/prayers/insights"],
  });

  const form = useForm<PrayerFormValues>({
    resolver: zodResolver(prayerSchema),
    defaultValues: {
      prayerText: "",
      category: "general",
    },
  });

  const logPrayerMutation = useMutation({
    mutationFn: async (data: PrayerFormValues) => {
      const res = await apiRequest("POST", "/api/prayers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prayers/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prayers/insights"] });
      setPrayerDialogOpen(false);
      form.reset();
      toast({
        title: "Prayer Recorded",
        description: "Your prayer has been added to your journal.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log prayer",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (meditationActive && meditationTime < meditationDuration * 60) {
      interval = setInterval(() => {
        setMeditationTime((prev) => {
          if (prev >= meditationDuration * 60 - 1) {
            setMeditationActive(false);
            toast({
              title: "Meditation Complete",
              description: "May you walk in divine guidance today.",
            });
            return meditationDuration * 60;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [meditationActive, meditationTime, meditationDuration, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const startMeditation = () => {
    setMeditationTime(0);
    setMeditationActive(true);
  };

  const stopMeditation = () => {
    setMeditationActive(false);
    setMeditationTime(0);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-prayer-center">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Crown className="h-8 w-8 text-yellow-500" />
            Prayer Center
          </h1>
          <p className="text-muted-foreground">
            Seek divine wisdom in your trading journey
          </p>
        </div>
        <Dialog open={prayerDialogOpen} onOpenChange={setPrayerDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2" data-testid="button-new-prayer">
              <Send className="h-4 w-4" />
              New Prayer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg" data-testid="dialog-new-prayer">
            <DialogHeader>
              <DialogTitle>Record Your Prayer</DialogTitle>
              <DialogDescription>
                Share your heart with the Divine. Your prayers guide your trading wisdom.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => logPrayerMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prayer Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-prayer-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prayerCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              <div className="flex items-center gap-2">
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prayerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Prayer</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Pour out your heart... Ask for wisdom, guidance, protection..."
                          className="min-h-[150px]"
                          data-testid="textarea-prayer-text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPrayerDialogOpen(false)}
                    data-testid="button-cancel-prayer"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={logPrayerMutation.isPending} data-testid="button-submit-prayer">
                    {logPrayerMutation.isPending ? "Recording..." : "Record Prayer"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="today" className="space-y-4" data-testid="tabs-prayer-center">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" data-testid="tab-today">Today's Word</TabsTrigger>
          <TabsTrigger value="journal" data-testid="tab-journal">Prayer Journal</TabsTrigger>
          <TabsTrigger value="meditation" data-testid="tab-meditation">Meditation</TabsTrigger>
          <TabsTrigger value="insights" data-testid="tab-insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950" data-testid="card-daily-scripture">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-yellow-600" />
                Daily Scripture
              </CardTitle>
              <CardDescription>Divine guidance for your trading journey today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scriptureLoading ? (
                <div className="space-y-2">
                  <div className="h-20 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <blockquote className="text-lg italic border-l-4 border-yellow-500 pl-4 py-2">
                    "{dailyScripture?.verse}"
                  </blockquote>
                  <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    - {dailyScripture?.reference}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {prayerCategories.slice(0, 3).map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.value} className="hover:shadow-lg transition-shadow" data-testid={`card-category-${category.value}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="h-5 w-5" />
                      {category.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        form.setValue("category", category.value);
                        setPrayerDialogOpen(true);
                      }}
                      data-testid={`button-pray-${category.value}`}
                    >
                      Pray for {category.label}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <Card data-testid="card-prayer-journal">
            <CardHeader>
              <CardTitle>Prayer Journal</CardTitle>
              <CardDescription>Your sacred conversation with the Divine</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {prayersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border rounded-lg space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-16 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ) : prayers && prayers.length > 0 ? (
                  <div className="space-y-4">
                    {prayers.map((prayer) => {
                      const category = prayerCategories.find((c) => c.value === prayer.category);
                      const Icon = category?.icon || Sparkles;
                      return (
                        <div
                          key={prayer.id}
                          className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                          data-testid={`prayer-item-${prayer.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="gap-1">
                              <Icon className="h-3 w-3" />
                              {category?.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(prayer.createdAt!).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{prayer.prayerText}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No prayers recorded yet. Start your spiritual trading journey.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meditation" className="space-y-4">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950" data-testid="card-meditation-timer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-purple-600" />
                Guided Meditation
              </CardTitle>
              <CardDescription>Center your mind and spirit before trading decisions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meditation Audio Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Meditation Track:</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={meditationDuration === 5 ? "default" : "outline"}
                    onClick={() => setMeditationDuration(5)}
                    className="justify-start"
                    data-testid="button-track-peace"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Peace & Clarity (5 min)
                  </Button>
                  <Button
                    variant={meditationDuration === 10 ? "default" : "outline"}
                    onClick={() => setMeditationDuration(10)}
                    className="justify-start"
                    data-testid="button-track-wisdom"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Divine Wisdom (10 min)
                  </Button>
                  <Button
                    variant={meditationDuration === 15 ? "default" : "outline"}
                    onClick={() => setMeditationDuration(15)}
                    className="justify-start"
                    data-testid="button-track-deep"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Deep Contemplation (15 min)
                  </Button>
                  <Button
                    variant={meditationDuration === 3 ? "default" : "outline"}
                    onClick={() => setMeditationDuration(3)}
                    className="justify-start"
                    data-testid="button-track-quick"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Quick Focus (3 min)
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Meditation Timer Display */}
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-purple-700 dark:text-purple-400" data-testid="text-meditation-timer">
                  {formatTime(meditationTime)}
                </div>
                <Progress
                  value={(meditationTime / (meditationDuration * 60)) * 100}
                  className="h-3"
                  data-testid="progress-meditation"
                />
                
                {/* Meditation Controls */}
                <div className="flex gap-2 justify-center items-center">
                  {!meditationActive ? (
                    <Button
                      size="lg"
                      onClick={startMeditation}
                      className="gap-2"
                      data-testid="button-start-meditation"
                    >
                      <Clock className="h-4 w-4" />
                      Start Meditation
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        variant="destructive"
                        onClick={stopMeditation}
                        className="gap-2"
                        data-testid="button-stop-meditation"
                      >
                        Stop
                      </Button>
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        <span className="animate-pulse mr-2">●</span>
                        Meditating...
                      </Badge>
                    </>
                  )}
                </div>

                {meditationActive && (
                  <div className="p-4 bg-white/50 dark:bg-black/30 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">
                      {meditationTime < 60 && "Taking deep breaths... Clearing your mind..."}
                      {meditationTime >= 60 && meditationTime < 120 && "Focusing on your breath... Finding your center..."}
                      {meditationTime >= 120 && meditationTime < 240 && "Opening your heart to divine wisdom..."}
                      {meditationTime >= 240 && "Deep in contemplation... Seeking guidance..."}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Meditation Guide */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-purple-600" />
                  Meditation Guide
                </h3>
                <div className="bg-white/50 dark:bg-black/30 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">1.</span>
                      <span>Find a quiet place and sit comfortably</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">2.</span>
                      <span>Close your eyes and breathe deeply</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">3.</span>
                      <span>Clear your mind of market noise and distractions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">4.</span>
                      <span>Seek divine wisdom for your trading decisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">5.</span>
                      <span>Focus on patience, discipline, and trust</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">6.</span>
                      <span>Remember: Trust in the Kingdom's provision</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Ambient Sound Info */}
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <p className="text-xs text-purple-900 dark:text-purple-200">
                  <strong>🎵 Ambient Sounds:</strong> Peaceful piano melodies, gentle rain, and binaural beats for deep meditation
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card data-testid="card-total-prayers">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Prayers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights?.totalPrayers || 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-prayers-with-trades">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Prayer-Guided Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{insights?.prayersWithTrades || 0}</div>
              </CardContent>
            </Card>
            <Card data-testid="card-success-rate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{insights?.successRate || 0}%</div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-prayer-categories">
            <CardHeader>
              <CardTitle>Prayer Categories</CardTitle>
              <CardDescription>Distribution of your prayers</CardDescription>
            </CardHeader>
            <CardContent>
              {insights?.categoryStats && Object.keys(insights.categoryStats).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(insights.categoryStats).map(([category, count]) => {
                    const cat = prayerCategories.find((c) => c.value === category);
                    const Icon = cat?.icon || Sparkles;
                    const total = insights.totalPrayers;
                    const percentage = total > 0 ? ((count as number / total) * 100).toFixed(0) : 0;
                    return (
                      <div key={category} className="space-y-1" data-testid={`category-stat-${category}`}>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{cat?.label || category}</span>
                          </div>
                          <span className="font-semibold">{count} ({percentage}%)</span>
                        </div>
                        <Progress value={Number(percentage)} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No prayer data available yet
                </p>
              )}
            </CardContent>
          </Card>

          {insights?.recentCorrelations && insights.recentCorrelations.length > 0 && (
            <Card data-testid="card-recent-correlations">
              <CardHeader>
                <CardTitle>Recent Trade Correlations</CardTitle>
                <CardDescription>How your prayers aligned with trading outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.recentCorrelations.slice(0, 5).map((corr: any) => (
                    <div
                      key={corr.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-testid={`correlation-${corr.id}`}
                    >
                      <div>
                        <p className="text-sm font-medium">{corr.outcome}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(corr.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {corr.profitLoss && (
                        <Badge variant={parseFloat(corr.profitLoss) >= 0 ? "default" : "destructive"}>
                          ${parseFloat(corr.profitLoss).toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
