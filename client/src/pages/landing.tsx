import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-serif divine-gradient-text">
            Valifi Kingdom
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Divine fintech platform powered by 63+ autonomous AI agents. Real blockchain integration, 
            live payments, KYC compliance, and quantum computing.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground font-serif italic">
            "The Kingdom of Heaven suffers violence, and the violent take it by force"
            <br />
            <span className="text-xs">- Matthew 11:12</span>
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Enter Kingdom
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold covenant-gradient-text">Multi-Agent AI</h3>
            <p className="text-sm text-muted-foreground">
              63+ autonomous bots orchestrated with LangGraph for maximum efficiency
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold covenant-gradient-text">Real Blockchain</h3>
            <p className="text-sm text-muted-foreground">
              Live NFT minting, ERC-20 deployment, and real wallet management
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold covenant-gradient-text">Kingdom Standard</h3>
            <p className="text-sm text-muted-foreground">
              Production-ready with KYC, payments, security, and quantum computing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
