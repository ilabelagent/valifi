import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type quantumJobs, insertQuantumJobSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Cpu, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Zap,
  Play,
  Loader2,
  XCircle
} from "lucide-react";
import { useState } from "react";

type SelectQuantumJob = typeof quantumJobs.$inferSelect;

const quantumJobFormSchema = insertQuantumJobSchema.omit({ userId: true }).extend({
  algorithm: z.string().min(1, "Algorithm is required"),
  qubitsUsed: z.coerce.number().min(1, "At least 1 qubit required").max(127, "Maximum 127 qubits"),
  parameters: z.string().optional().refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Parameters must be valid JSON" }
  ),
});

type QuantumJobForm = z.infer<typeof quantumJobFormSchema>;

export default function QuantumPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: jobs, isLoading, isError, error, refetch } = useQuery<SelectQuantumJob[]>({
    queryKey: ["/api/quantum/jobs"],
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const form = useForm<QuantumJobForm>({
    resolver: zodResolver(quantumJobFormSchema),
    defaultValues: {
      algorithm: "",
      qubitsUsed: 5,
      parameters: "",
    },
  });

  const submitJobMutation = useMutation({
    mutationFn: async (data: QuantumJobForm) => {
      const payload = {
        algorithm: data.algorithm,
        qubitsUsed: data.qubitsUsed,
        parameters: data.parameters ? JSON.parse(data.parameters) : {},
      };
      const res = await apiRequest("POST", "/api/quantum/jobs", payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quantum/jobs"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Quantum job submitted",
        description: "Your quantum algorithm has been queued for execution.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Job submission failed",
        description: error.message || "Failed to submit quantum job",
      });
    },
  });

  const onSubmit = (data: QuantumJobForm) => {
    submitJobMutation.mutate(data);
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "completed": return "default";
      case "running": return "secondary";
      case "queued": return "outline";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "running": return <Loader2 className="h-4 w-4 animate-spin" />;
      case "queued": return <Clock className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access quantum computing.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="heading-quantum">
              <Cpu className="h-8 w-8 text-primary" />
              Quantum Computing
            </h1>
            <p className="text-muted-foreground mt-1" data-testid="text-subtitle">
              IBM Quantum integration for portfolio optimization and risk analysis
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-submit-job">
                <Play className="h-4 w-4 mr-2" />
                Submit Quantum Job
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-submit-job">
              <DialogHeader>
                <DialogTitle>Submit Quantum Algorithm</DialogTitle>
                <DialogDescription>
                  Configure and execute quantum computing algorithms on IBM Quantum
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="algorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Algorithm</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-algorithm">
                              <SelectValue placeholder="Select quantum algorithm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="portfolio_optimization">Portfolio Optimization</SelectItem>
                            <SelectItem value="risk_analysis">Risk Analysis</SelectItem>
                            <SelectItem value="option_pricing">Option Pricing</SelectItem>
                            <SelectItem value="vqe">Variational Quantum Eigensolver (VQE)</SelectItem>
                            <SelectItem value="qaoa">Quantum Approximate Optimization (QAOA)</SelectItem>
                            <SelectItem value="grovers">Grover's Search Algorithm</SelectItem>
                            <SelectItem value="shors">Shor's Factorization</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="qubitsUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qubits</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={127} 
                            {...field} 
                            data-testid="input-qubits" 
                          />
                        </FormControl>
                        <FormDescription>Number of qubits to use (1-127)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parameters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parameters (JSON)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder='{"iterations": 100, "shots": 1024}'
                            className="font-mono text-sm"
                            {...field}
                            data-testid="input-parameters"
                          />
                        </FormControl>
                        <FormDescription>Optional JSON configuration for the algorithm</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitJobMutation.isPending}
                    data-testid="button-submit-form"
                  >
                    {submitJobMutation.isPending ? "Submitting..." : "Execute Algorithm"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        <div className="grid gap-4 md:grid-cols-3">
          <Card data-testid="card-completed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-completed-count">
                {jobs?.filter(j => j.status === "completed").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-running">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-running-count">
                {jobs?.filter(j => j.status === "running").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-queued">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queued</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-queued-count">
                {jobs?.filter(j => j.status === "queued").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4" data-testid="heading-jobs">
            Quantum Jobs
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive" data-testid="alert-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Failed to load quantum jobs: {(error as any)?.message || "Unknown error"}</span>
                  <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-retry">
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : !jobs || jobs.length === 0 ? (
            <Alert data-testid="alert-no-jobs">
              <Cpu className="h-4 w-4" />
              <AlertDescription>
                No quantum jobs found. Submit your first quantum algorithm to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Card key={job.id} data-testid={`card-job-${job.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(job.status)} className="gap-1" data-testid={`badge-status-${job.id}`}>
                            {getStatusIcon(job.status)}
                            {job.status?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Cpu className="h-3 w-3" />
                            IBM Quantum
                          </Badge>
                        </div>
                        <CardTitle className="text-base" data-testid={`text-algorithm-${job.id}`}>
                          {job.algorithm.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-qubits-${job.id}`}>
                      <Zap className="h-4 w-4" />
                      <span>{job.qubitsUsed} Qubits</span>
                    </div>
                    {job.ibmJobId && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-ibm-id-${job.id}`}>
                        <Cpu className="h-4 w-4" />
                        <span className="font-mono text-xs">{job.ibmJobId}</span>
                      </div>
                    )}
                    {job.executionTime && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-execution-time-${job.id}`}>
                        <Clock className="h-4 w-4" />
                        <span>{job.executionTime}ms execution time</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-created-${job.id}`}>
                      <Clock className="h-4 w-4" />
                      <span>Submitted: {new Date(job.createdAt as string | number | Date).toLocaleString()}</span>
                    </div>
                    {job.completedAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-completed-${job.id}`}>
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed: {new Date(job.completedAt as string | number | Date).toLocaleString()}</span>
                      </div>
                    )}
                    {job.parameters && typeof job.parameters === 'object' && Object.keys(job.parameters as Record<string, any>).length > 0 ? (
                      <details className="mt-2" data-testid={`details-parameters-${job.id}`}>
                        <summary className="text-sm text-muted-foreground cursor-pointer hover-elevate p-2 rounded" data-testid={`summary-parameters-${job.id}`}>
                          View Parameters
                        </summary>
                        <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto mt-2">
                          {JSON.stringify(job.parameters as any, null, 2)}
                        </pre>
                      </details>
                    ) : null}
                    {job.result && typeof job.result === 'object' && Object.keys(job.result as Record<string, any>).length > 0 ? (
                      <details className="mt-2" data-testid={`details-result-${job.id}`}>
                        <summary className="text-sm text-primary cursor-pointer hover-elevate p-2 rounded font-medium" data-testid={`summary-result-${job.id}`}>
                          View Results
                        </summary>
                        <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto mt-2">
                          {JSON.stringify(job.result as any, null, 2)}
                        </pre>
                      </details>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
