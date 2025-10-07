import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Sparkles, FileCode, Shield, Building2 } from "lucide-react";

export default function AnalyticsIntelligence() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold divine-gradient-text">Analytics & Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Advanced Analytics, AI Predictions, Security Testing & Banking Integration
            </p>
          </div>
          <Badge variant="default" className="flex items-center gap-1" data-testid="badge-analytics-count">
            <BarChart3 className="h-3 w-3" />
            6 Tools
          </Badge>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover-elevate" data-testid="card-portfolio-analytics">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Portfolio Analytics
                </CardTitle>
                <Badge variant="default" data-testid="badge-portfolio-analytics-status">Active</Badge>
              </div>
              <CardDescription>Performance metrics & risk analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" data-testid="button-view-analytics">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-transaction-history">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Transaction History
                </CardTitle>
                <Badge variant="default" data-testid="badge-tx-history-status">Active</Badge>
              </div>
              <CardDescription>Complete transaction analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" data-testid="button-view-history">
                View History
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-divine-oracle">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Divine Oracle
                </CardTitle>
                <Badge variant="default" data-testid="badge-oracle-status">Active</Badge>
              </div>
              <CardDescription>AI predictions & market sentiment</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" data-testid="button-divine-insights">
                Divine Insights
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-word-bot">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-primary" />
                  Word Bot
                </CardTitle>
                <Badge variant="default" data-testid="badge-word-status">Active</Badge>
              </div>
              <CardDescription>NLP & text processing</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" data-testid="button-nlp-tools">
                NLP Tools
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-cyberlab">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  CyberLab
                </CardTitle>
                <Badge variant="default" data-testid="badge-cyberlab-status">Active</Badge>
              </div>
              <CardDescription>Penetration testing & security</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" data-testid="button-security-testing">
                Run Tests
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate" data-testid="card-banking">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Banking Integration
                </CardTitle>
                <Badge variant="default" data-testid="badge-banking-status">Active</Badge>
              </div>
              <CardDescription>Traditional bank integration</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" data-testid="button-link-bank">
                Link Bank
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
