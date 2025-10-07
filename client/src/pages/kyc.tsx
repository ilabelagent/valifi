import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type kycRecords, insertKycRecordSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  User,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";

type SelectKycRecord = typeof kycRecords.$inferSelect;

const kycSubmitSchema = insertKycRecordSchema.omit({ userId: true }).extend({
  documentType: z.string().min(1, "Document type is required"),
});

type KycSubmitForm = z.infer<typeof kycSubmitSchema>;

export default function KycPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: kycStatus, isLoading, isError, error, refetch } = useQuery<SelectKycRecord>({
    queryKey: ["/api/kyc/status"],
  });

  const form = useForm<KycSubmitForm>({
    resolver: zodResolver(kycSubmitSchema),
    defaultValues: {
      documentType: "",
      sumsubApplicantId: "",
    },
  });

  const submitKycMutation = useMutation({
    mutationFn: async (data: KycSubmitForm) => {
      const res = await apiRequest("POST", "/api/kyc/submit", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/status"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "KYC submitted",
        description: "Your KYC verification has been submitted for review.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message || "Failed to submit KYC verification",
      });
    },
  });

  const onSubmit = (data: KycSubmitForm) => {
    submitKycMutation.mutate(data);
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-5 w-5" />;
      case "pending": return <Clock className="h-5 w-5" />;
      case "rejected": return <XCircle className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusMessage = (status: string | null) => {
    switch (status) {
      case "approved": return "Your identity has been verified and approved.";
      case "pending": return "Your KYC submission is under review. This typically takes 1-2 business days.";
      case "rejected": return "Your KYC submission was rejected. Please review the reasons and resubmit.";
      default: return "Complete KYC verification to access all Kingdom features.";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access KYC verification.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="heading-kyc">
              <Shield className="h-8 w-8 text-primary" />
              KYC & Compliance
            </h1>
            <p className="text-muted-foreground mt-1" data-testid="text-subtitle">
              Identity verification and regulatory compliance for Kingdom citizens
            </p>
          </div>
          {(!kycStatus || kycStatus.verificationStatus === "rejected") && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-submit-kyc">
                  <FileText className="h-4 w-4 mr-2" />
                  {kycStatus?.verificationStatus === "rejected" ? "Resubmit KYC" : "Submit KYC"}
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-submit-kyc">
                <DialogHeader>
                  <DialogTitle>Submit KYC Verification</DialogTitle>
                  <DialogDescription>
                    Provide your verification details for Sumsub integration
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-document-type">
                                <SelectValue placeholder="Select document type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="passport">Passport</SelectItem>
                              <SelectItem value="drivers_license">Driver's License</SelectItem>
                              <SelectItem value="national_id">National ID Card</SelectItem>
                              <SelectItem value="residence_permit">Residence Permit</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sumsubApplicantId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sumsub Applicant ID (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter Sumsub applicant ID if you have one" 
                              {...field} 
                              value={field.value || ""}
                              data-testid="input-sumsub-id" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitKycMutation.isPending}
                      data-testid="button-submit-form"
                    >
                      {submitKycMutation.isPending ? "Submitting..." : "Submit for Verification"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ) : isError ? (
          <Alert variant="destructive" data-testid="alert-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Failed to load KYC status: {(error as any)?.message || "Unknown error"}</span>
                <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-retry">
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Card data-testid="card-status">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {getStatusIcon(kycStatus?.verificationStatus || null)}
                  </div>
                  Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={getStatusBadgeVariant(kycStatus?.verificationStatus || null)} 
                    className="text-sm"
                    data-testid="badge-status"
                  >
                    {kycStatus?.verificationStatus?.toUpperCase() || "NOT STARTED"}
                  </Badge>
                  <p className="text-sm text-muted-foreground" data-testid="text-status-message">
                    {getStatusMessage(kycStatus?.verificationStatus || null)}
                  </p>
                </div>

                {kycStatus?.submittedAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-submitted">
                    <Clock className="h-4 w-4" />
                    <span>Submitted: {new Date(kycStatus.submittedAt as string | number | Date).toLocaleString()}</span>
                  </div>
                )}

                {kycStatus?.reviewedAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-reviewed">
                    <CheckCircle className="h-4 w-4" />
                    <span>Reviewed: {new Date(kycStatus.reviewedAt as string | number | Date).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {kycStatus?.documentType && (
              <Card data-testid="card-details">
                <CardHeader>
                  <CardTitle>Verification Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2" data-testid="text-document-type">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Document Type:</span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {kycStatus.documentType.replace(/_/g, " ")}
                    </span>
                  </div>

                  {kycStatus.sumsubApplicantId && (
                    <div className="flex items-center gap-2" data-testid="text-applicant-id">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Applicant ID:</span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {kycStatus.sumsubApplicantId}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {kycStatus?.rejectionReason && (
              <Alert variant="destructive" data-testid="alert-rejection">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Rejection Reason</p>
                    <p className="text-sm" data-testid="text-rejection-reason">{kycStatus.rejectionReason}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {kycStatus?.reviewResult && typeof kycStatus.reviewResult === 'object' && Object.keys(kycStatus.reviewResult as Record<string, any>).length > 0 && (
              <Card data-testid="card-review-result">
                <CardHeader>
                  <CardTitle>Review Results</CardTitle>
                  <CardDescription>Detailed verification outcome from Sumsub</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto" data-testid="text-review-result">
                    {JSON.stringify(kycStatus.reviewResult as any, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {!kycStatus && (
              <Alert data-testid="alert-no-kyc">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Get Verified</p>
                    <p className="text-sm">
                      Complete KYC verification to unlock trading, payments, and advanced Kingdom features. 
                      Click "Submit KYC" above to get started.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
}
