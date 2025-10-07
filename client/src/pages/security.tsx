import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type securityEvents } from "@shared/schema";
import { Shield, AlertTriangle, AlertCircle, CheckCircle, Clock, MapPin, Activity } from "lucide-react";

type SelectSecurityEvent = typeof securityEvents.$inferSelect;

export default function SecurityPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: events, isLoading, isError, error, refetch } = useQuery<SelectSecurityEvent[]>({
    queryKey: ["/api/security/events"],
  });

  const resolveMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await apiRequest("POST", `/api/security/events/${eventId}/resolve`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/events"] });
      toast({
        title: "Event resolved",
        description: "Security event has been marked as resolved.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Resolution failed",
        description: error.message || "Failed to resolve security event",
      });
    },
  });

  const getThreatBadgeVariant = (level: string | null) => {
    switch (level) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getThreatIcon = (level: string | null) => {
    switch (level) {
      case "critical": return <AlertTriangle className="h-4 w-4" />;
      case "high": return <AlertCircle className="h-4 w-4" />;
      case "medium": return <Activity className="h-4 w-4" />;
      case "low": return <Shield className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const criticalEvents = events?.filter(e => e.threatLevel === "critical").length || 0;
  const highEvents = events?.filter(e => e.threatLevel === "high").length || 0;
  const mediumEvents = events?.filter(e => e.threatLevel === "medium").length || 0;
  const lowEvents = events?.filter(e => e.threatLevel === "low").length || 0;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access Guardian Angel Security.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="heading-security">
          <Shield className="h-8 w-8 text-primary" />
          Guardian Angel Security
        </h1>
        <p className="text-muted-foreground mt-1" data-testid="text-subtitle">
          AI-powered threat detection and incident response with Kingdom protection
        </p>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card data-testid="card-critical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Threats</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-critical-count">{criticalEvents}</div>
              <p className="text-xs text-muted-foreground">Requires immediate action</p>
            </CardContent>
          </Card>

          <Card data-testid="card-high">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-high-count">{highEvents}</div>
              <p className="text-xs text-muted-foreground">Urgent attention needed</p>
            </CardContent>
          </Card>

          <Card data-testid="card-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-medium-count">{mediumEvents}</div>
              <p className="text-xs text-muted-foreground">Monitor closely</p>
            </CardContent>
          </Card>

          <Card data-testid="card-low">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Priority</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-low-count">{lowEvents}</div>
              <p className="text-xs text-muted-foreground">Informational</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4" data-testid="heading-events">
            Security Events
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive" data-testid="alert-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Failed to load security events: {(error as any)?.message || "Unknown error"}</span>
                  <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-retry">
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : !events || events.length === 0 ? (
            <Alert data-testid="alert-no-events">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All clear! No unresolved security events detected. The Kingdom is protected.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Card key={event.id} data-testid={`card-event-${event.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getThreatBadgeVariant(event.threatLevel)} className="gap-1" data-testid={`badge-threat-${event.id}`}>
                            {getThreatIcon(event.threatLevel)}
                            {event.threatLevel?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                          <Badge variant="outline" data-testid={`badge-type-${event.id}`}>
                            {event.eventType}
                          </Badge>
                        </div>
                        <CardTitle className="text-base" data-testid={`text-description-${event.id}`}>
                          {event.description}
                        </CardTitle>
                      </div>
                      {user && user.isAdmin === true && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveMutation.mutate(event.id)}
                          disabled={resolveMutation.isPending}
                          data-testid={`button-resolve-${event.id}`}
                        >
                          {resolveMutation.isPending ? "Resolving..." : "Resolve"}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {event.ipAddress && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-ip-${event.id}`}>
                        <MapPin className="h-4 w-4" />
                        <span>IP: {event.ipAddress}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid={`text-time-${event.id}`}>
                      <Clock className="h-4 w-4" />
                      <span>{new Date(event.createdAt as string | number | Date).toLocaleString()}</span>
                    </div>
                    {event.metadata && typeof event.metadata === 'object' && Object.keys(event.metadata as Record<string, any>).length > 0 ? (
                      <details className="mt-2" data-testid={`details-metadata-${event.id}`}>
                        <summary className="text-sm text-muted-foreground cursor-pointer hover-elevate p-2 rounded" data-testid={`summary-metadata-${event.id}`}>
                          View Metadata
                        </summary>
                        <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto mt-2">
                          {JSON.stringify(event.metadata as any, null, 2)}
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
