import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Play, Plus, Activity, AlertCircle, CheckCircle, Clock, Shield, Sparkles, TrendingUp, Eye, Code2, Zap } from "lucide-react";
import type { Agent, AgentLog } from "@shared/schema";

const AGENT_TYPES = [
  { value: "orchestrator", label: "Orchestrator", icon: Bot, color: "text-primary" },
  { value: "blockchain", label: "Blockchain", icon: Code2, color: "text-blue-500" },
  { value: "payment", label: "Payment", icon: Zap, color: "text-green-500" },
  { value: "kyc", label: "KYC", icon: Shield, color: "text-purple-500" },
  { value: "security", label: "Security", icon: Shield, color: "text-red-500" },
  { value: "guardian_angel", label: "Guardian Angel", icon: Shield, color: "text-divine-gold" },
  { value: "publishing", label: "Publishing", icon: Sparkles, color: "text-pink-500" },
  { value: "quantum", label: "Quantum", icon: Activity, color: "text-cyan-500" },
  { value: "analytics", label: "Analytics", icon: TrendingUp, color: "text-orange-500" },
  { value: "monitoring", label: "Monitoring", icon: Eye, color: "text-indigo-500" },
];

const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  capabilities: z.string().min(1, "At least one capability required"),
  config: z.string().optional(),
});

const executeTaskSchema = z.object({
  task: z.string().min(1, "Task description is required"),
  agentType: z.string().optional(),
});

const updateStatusSchema = z.object({
  agentId: z.string(),
  status: z.enum(["active", "idle", "error", "maintenance"]),
  currentTask: z.string().optional(),
});

export default function AgentsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: agents, isLoading: agentsLoading, error: agentsError } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const { data: selectedAgentData } = useQuery<Agent>({
    queryKey: ["/api/agents", selectedAgent as string],
    enabled: !!selectedAgent,
  });

  const { data: agentLogs } = useQuery<AgentLog[]>({
    queryKey: ["/api/agents", selectedAgent as string, "logs"],
    enabled: !!selectedAgent,
  });

  const createAgentForm = useForm({
    resolver: zodResolver(createAgentSchema),
    defaultValues: { name: "", type: "", capabilities: "", config: "" },
  });

  const executeTaskForm = useForm({
    resolver: zodResolver(executeTaskSchema),
    defaultValues: { task: "", agentType: "" },
  });

  const updateStatusForm = useForm({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: { agentId: "", status: "idle" as const, currentTask: "" },
  });

  const createAgentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createAgentSchema>) => {
      const capabilities = data.capabilities.split(",").map(c => c.trim()).filter(Boolean);
      const config = data.config ? JSON.parse(data.config) : {};
      return apiRequest("/api/agents", "POST", {
        ...data,
        capabilities,
        config,
      }) as Promise<any>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({ title: "Agent Created", description: "New agent has been added to the orchestra" });
      createAgentForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create agent",
        variant: "destructive",
      });
    },
  });

  const executeTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof executeTaskSchema>) => {
      return apiRequest("/api/agents/execute", "POST", data) as Promise<any>;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Task Executed",
        description: `Status: ${data.status}`,
      });
      executeTaskForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Execution Failed",
        description: error.message || "Failed to execute task",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updateStatusSchema>) => {
      const { agentId, ...payload } = data;
      return apiRequest(`/api/agents/${agentId}/status`, "POST", payload) as Promise<any>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents", selectedAgent] });
      toast({ title: "Status Updated", description: "Agent status has been changed" });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update agent status",
        variant: "destructive",
      });
    },
  });

  const getAgentTypeInfo = (type: string) => {
    return AGENT_TYPES.find(t => t.value === type) || AGENT_TYPES[0];
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "active": return "default";
      case "idle": return "secondary";
      case "error": return "destructive";
      case "maintenance": return "outline";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "active": return <Activity className="h-3 w-3 animate-pulse" />;
      case "idle": return <Clock className="h-3 w-3" />;
      case "error": return <AlertCircle className="h-3 w-3" />;
      case "maintenance": return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const filteredAgents = agents?.filter(agent => {
    const typeMatch = filterType === "all" || agent.type === filterType;
    const statusMatch = filterStatus === "all" || agent.status === filterStatus;
    return typeMatch && statusMatch;
  });

  if (agentsLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Skeleton className="h-8 w-64 mb-6" data-testid="skeleton-loading" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48" data-testid={`skeleton-agent-${i}`} />)}
        </div>
      </div>
    );
  }

  if (agentsError) {
    return (
      <div className="container mx-auto px-6 py-8">
        <Alert variant="destructive" data-testid="alert-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load agents. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold" data-testid="heading-agents">Agent Orchestra</h2>
            <p className="text-muted-foreground" data-testid="text-description">
              Multi-agent AI orchestration with 63+ autonomous bots
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-execute-task" className="gap-2">
                  <Play className="h-4 w-4" />
                  Execute Task
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-execute-task">
                <DialogHeader>
                  <DialogTitle data-testid="title-execute">Execute Agent Task</DialogTitle>
                  <DialogDescription data-testid="description-execute">
                    Submit a task for agent orchestration
                  </DialogDescription>
                </DialogHeader>
                <Form {...executeTaskForm}>
                  <form onSubmit={executeTaskForm.handleSubmit((data) => executeTaskMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={executeTaskForm.control}
                      name="task"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-task">Task Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what you want the agents to do..." 
                              rows={4} 
                              {...field} 
                              data-testid="input-task"
                            />
                          </FormControl>
                          <FormDescription data-testid="description-task">
                            The orchestrator will automatically route to the appropriate agent
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={executeTaskForm.control}
                      name="agentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-agent-type">Agent Type (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-agent-type">
                                <SelectValue placeholder="Auto-detect from task" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="" data-testid="option-agent-auto">Auto-detect</SelectItem>
                              {AGENT_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value} data-testid={`option-agent-${type.value}`}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={executeTaskMutation.isPending} data-testid="button-submit-execute">
                        {executeTaskMutation.isPending ? (
                          <><Activity className="h-4 w-4 mr-2 animate-spin" /> Executing...</>
                        ) : (
                          "Execute Task"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            {user && user.isAdmin === true && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-agent" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Agent
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="dialog-create-agent">
                  <DialogHeader>
                    <DialogTitle data-testid="title-create">Create New Agent</DialogTitle>
                    <DialogDescription data-testid="description-create">
                      Add a new autonomous agent to the orchestra
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createAgentForm}>
                    <form onSubmit={createAgentForm.handleSubmit((data) => createAgentMutation.mutate(data))} className="space-y-4">
                      <FormField
                        control={createAgentForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-name">Agent Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Guardian Angel #1" {...field} data-testid="input-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createAgentForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-type">Agent Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-type">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {AGENT_TYPES.map(type => (
                                  <SelectItem key={type.value} value={type.value} data-testid={`option-type-${type.value}`}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createAgentForm.control}
                        name="capabilities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-capabilities">Capabilities</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="threat_detection, anomaly_analysis, incident_response" 
                                {...field} 
                                data-testid="input-capabilities"
                              />
                            </FormControl>
                            <FormDescription data-testid="description-capabilities">
                              Comma-separated list of agent capabilities
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createAgentForm.control}
                        name="config"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-config">Configuration (JSON)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder='{"threshold": 0.8, "autoResponse": true}' 
                                rows={3} 
                                {...field} 
                                data-testid="input-config"
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormDescription data-testid="description-config">Optional JSON configuration</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={createAgentMutation.isPending} data-testid="button-submit-create">
                          {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48" data-testid="select-filter-type">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="option-filter-all-types">All Types</SelectItem>
              {AGENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value} data-testid={`option-filter-${type.value}`}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48" data-testid="select-filter-status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="option-filter-all-status">All Status</SelectItem>
              <SelectItem value="active" data-testid="option-filter-active">Active</SelectItem>
              <SelectItem value="idle" data-testid="option-filter-idle">Idle</SelectItem>
              <SelectItem value="error" data-testid="option-filter-error">Error</SelectItem>
              <SelectItem value="maintenance" data-testid="option-filter-maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents?.map(agent => {
            const typeInfo = getAgentTypeInfo(agent.type);
            const IconComponent = typeInfo.icon;
            return (
              <Card key={agent.id} className="hover-elevate" data-testid={`card-agent-${agent.id}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${typeInfo.color}`}>
                      <IconComponent className="h-5 w-5" data-testid={`icon-agent-${agent.id}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base" data-testid={`text-name-${agent.id}`}>{agent.name}</CardTitle>
                      <Badge variant="outline" className="mt-1" data-testid={`badge-type-${agent.id}`}>
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(agent.status)} className="gap-1" data-testid={`badge-status-${agent.id}`}>
                    {getStatusIcon(agent.status)}
                    {agent.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agent.currentTask && (
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1" data-testid={`label-current-task-${agent.id}`}>Current Task:</p>
                        <p className="font-medium line-clamp-2" data-testid={`text-current-task-${agent.id}`}>{agent.currentTask}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground" data-testid={`label-success-rate-${agent.id}`}>Success Rate</p>
                        <p className="text-lg font-bold" data-testid={`text-success-rate-${agent.id}`}>
                          {(Number(agent.successRate || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground" data-testid={`label-operations-${agent.id}`}>Operations</p>
                        <p className="text-lg font-bold" data-testid={`text-operations-${agent.id}`}>
                          {agent.totalOperations}
                        </p>
                      </div>
                    </div>
                    {agent.capabilities && Array.isArray(agent.capabilities) && agent.capabilities.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2" data-testid={`label-capabilities-${agent.id}`}>Capabilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.slice(0, 3).map((cap: any, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs" data-testid={`badge-capability-${agent.id}-${idx}`}>
                              {String(cap)}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="secondary" className="text-xs" data-testid={`badge-more-capabilities-${agent.id}`}>
                              +{agent.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => setSelectedAgent(agent.id)}
                        data-testid={`button-view-${agent.id}`}
                      >
                        View Details
                      </Button>
                      {user && user.isAdmin === true && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                updateStatusForm.setValue("agentId", agent.id);
                                const status: "active" | "idle" | "error" | "maintenance" = 
                                  (agent.status === "active" || agent.status === "idle" || agent.status === "error" || agent.status === "maintenance") 
                                    ? agent.status 
                                    : "idle";
                                updateStatusForm.setValue("status", status);
                              }}
                              data-testid={`button-update-status-${agent.id}`}
                            >
                              Update
                            </Button>
                          </DialogTrigger>
                          <DialogContent data-testid="dialog-update-status">
                            <DialogHeader>
                              <DialogTitle data-testid="title-update-status">Update Agent Status</DialogTitle>
                              <DialogDescription data-testid="description-update-status">
                                Change the operational status of {agent.name}
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...updateStatusForm}>
                              <form onSubmit={updateStatusForm.handleSubmit((data) => updateStatusMutation.mutate(data))} className="space-y-4">
                                <input type="hidden" {...updateStatusForm.register("agentId")} />
                                <FormField
                                  control={updateStatusForm.control}
                                  name="status"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel data-testid="label-status">Status</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger data-testid="select-status">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="active" data-testid="option-status-active">Active</SelectItem>
                                          <SelectItem value="idle" data-testid="option-status-idle">Idle</SelectItem>
                                          <SelectItem value="error" data-testid="option-status-error">Error</SelectItem>
                                          <SelectItem value="maintenance" data-testid="option-status-maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={updateStatusForm.control}
                                  name="currentTask"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel data-testid="label-current-task-update">Current Task (Optional)</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Processing blockchain transactions..." {...field} data-testid="input-current-task" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <DialogFooter>
                                  <Button type="submit" disabled={updateStatusMutation.isPending} data-testid="button-submit-update-status">
                                    {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!filteredAgents?.length && (
          <Card className="p-12" data-testid="card-empty-state">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold" data-testid="text-empty-title">No Agents Found</h3>
              <p className="text-muted-foreground" data-testid="text-empty-description">
                {filterType !== "all" || filterStatus !== "all" 
                  ? "No agents match the selected filters" 
                  : "Create your first agent to get started"}
              </p>
            </div>
          </Card>
        )}

        {selectedAgent && selectedAgentData && (
          <Dialog open={!!selectedAgent} onOpenChange={(open) => !open && setSelectedAgent(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh]" data-testid="dialog-agent-details">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3" data-testid="title-agent-details">
                  <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center ${getAgentTypeInfo(selectedAgentData.type).color}`}>
                    {(() => {
                      const IconComponent = getAgentTypeInfo(selectedAgentData.type).icon;
                      return <IconComponent className="h-5 w-5" />;
                    })()}
                  </div>
                  <div>
                    <div data-testid="text-selected-name">{selectedAgentData.name}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" data-testid="badge-selected-type">{getAgentTypeInfo(selectedAgentData.type).label}</Badge>
                      <Badge variant={getStatusBadgeVariant(selectedAgentData.status)} className="gap-1" data-testid="badge-selected-status">
                        {getStatusIcon(selectedAgentData.status)}
                        {selectedAgentData.status}
                      </Badge>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="info" className="mt-4" data-testid="tabs-agent-details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info" data-testid="tab-info">Information</TabsTrigger>
                  <TabsTrigger value="capabilities" data-testid="tab-capabilities">Capabilities</TabsTrigger>
                  <TabsTrigger value="logs" data-testid="tab-logs">Execution Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium" data-testid="label-info-success">Success Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold" data-testid="text-info-success">
                          {(Number(selectedAgentData.successRate || 0) * 100).toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium" data-testid="label-info-operations">Total Operations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold" data-testid="text-info-operations">{selectedAgentData.totalOperations}</div>
                      </CardContent>
                    </Card>
                  </div>
                  {selectedAgentData.currentTask && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm" data-testid="label-info-current">Current Task</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p data-testid="text-info-current">{selectedAgentData.currentTask}</p>
                      </CardContent>
                    </Card>
                  )}
                  {selectedAgentData.config && typeof selectedAgentData.config === 'object' && Object.keys(selectedAgentData.config as Record<string, any>).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm" data-testid="label-info-config">Configuration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm bg-muted p-3 rounded-lg overflow-auto" data-testid="text-info-config">
                          {JSON.stringify(selectedAgentData.config as any, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                  <div className="text-sm text-muted-foreground" data-testid="text-info-last-active">
                    Last active: {selectedAgentData.lastActiveAt ? new Date(selectedAgentData.lastActiveAt as string | number | Date).toLocaleString() : "Never"}
                  </div>
                </TabsContent>

                <TabsContent value="capabilities" className="space-y-4">
                  {selectedAgentData.capabilities && Array.isArray(selectedAgentData.capabilities) && selectedAgentData.capabilities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedAgentData.capabilities.map((capability: any, idx) => (
                        <Card key={idx} data-testid={`card-capability-${idx}`}>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span className="font-medium" data-testid={`text-capability-${idx}`}>{String(capability)}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-capabilities">
                      No capabilities defined
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                  {agentLogs && agentLogs.length > 0 ? (
                    <ScrollArea className="h-96" data-testid="scroll-logs">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead data-testid="header-action">Action</TableHead>
                            <TableHead data-testid="header-log-status">Status</TableHead>
                            <TableHead data-testid="header-duration">Duration</TableHead>
                            <TableHead data-testid="header-timestamp">Timestamp</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {agentLogs.map(log => (
                            <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                              <TableCell className="font-medium" data-testid={`cell-action-${log.id}`}>{log.action}</TableCell>
                              <TableCell data-testid={`cell-log-status-${log.id}`}>
                                <Badge variant={log.status === "success" ? "default" : log.status === "failed" ? "destructive" : "secondary"} data-testid={`badge-log-status-${log.id}`}>
                                  {log.status}
                                </Badge>
                              </TableCell>
                              <TableCell data-testid={`cell-duration-${log.id}`}>{log.duration}ms</TableCell>
                              <TableCell className="text-sm text-muted-foreground" data-testid={`cell-timestamp-${log.id}`}>
                                {log.createdAt ? new Date(log.createdAt as string | number | Date).toLocaleString() : "N/A"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-logs">No execution logs available</p>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
