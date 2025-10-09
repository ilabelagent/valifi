import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Shield, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Globe, 
  Lock, 
  Award, 
  Heart,
  Coins,
  LineChart,
  Bot,
  Church,
  Crown,
  Gem,
  Scale,
  Wallet,
  Image,
  Users,
  ArrowRightLeft,
  Music,
  Play,
  Calendar,
  MapPin,
  Headphones,
  Mic2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Jesus Cartel Releases Component
function JesusCartelReleases() {
  const { data: releases, isLoading } = useQuery({
    queryKey: ["/api/jesus-cartel/releases"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-[#FFD700]/20">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="w-full aspect-square bg-muted rounded-lg" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!releases || releases.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No releases available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {releases.map((release: any) => (
        <motion.div
          key={release.id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Card className="group border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-all overflow-hidden" data-testid={`release-${release.id}`}>
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={release.albumArt || "/placeholder-album.jpg"} 
                alt={release.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  size="lg" 
                  className="bg-[#FFD700] text-black hover:bg-[#FFA500] rounded-full"
                  onClick={() => window.open(release.streamUrl, '_blank')}
                  data-testid={`play-${release.id}`}
                >
                  <Play className="w-6 h-6 mr-2" />
                  Play Now
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-1 truncate">{release.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                <Mic2 className="w-4 h-4" />
                {release.artist}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(release.releaseDate).toLocaleDateString()}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    {release.streamCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {release.likeCount || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Jesus Cartel Events Component
function JesusCartelEvents() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/jesus-cartel/events"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-[#FFD700]/20">
            <CardContent className="p-6">
              <div className="animate-pulse flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No upcoming events</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event: any) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-all" data-testid={`event-${event.id}`}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.name}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full md:w-32 h-32 bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 rounded-lg flex items-center justify-center">
                      <Music className="w-12 h-12 text-[#FFD700]" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">{event.name}</h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.venue}, {event.location}
                    </p>
                    {event.artistLineup && event.artistLineup.length > 0 && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mic2 className="w-4 h-4" />
                        {event.artistLineup.join(", ")}
                      </p>
                    )}
                  </div>
                  {event.ticketUrl && (
                    <Button 
                      className="bg-[#FFD700] text-black hover:bg-[#FFA500]"
                      onClick={() => window.open(event.ticketUrl, '_blank')}
                      data-testid={`tickets-${event.id}`}
                    >
                      Get Tickets
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleEnterKingdom = () => {
    window.location.href = "/api/login";
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleExplorePlatform = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-background to-blue-950/20 dark:from-[#FFD700]/5"></div>
        
        <motion.div 
          className="max-w-7xl mx-auto text-center relative z-10"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <Crown className="w-20 h-20 mx-auto text-[#FFD700] mb-4" />
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-6xl md:text-7xl font-serif font-bold mb-6"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            Valifi Kingdom
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8"
          >
            Divine fintech platform powered by 63+ autonomous AI agents. Real blockchain integration, 
            live payments, precious metals exchange, and Kingdom Standard ethics.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="mb-10 p-6 max-w-2xl mx-auto bg-blue-950/20 dark:bg-blue-950/10 rounded-xl border border-[#FFD700]/20"
          >
            <p className="text-lg font-serif italic text-muted-foreground">
              "The Kingdom of Heaven suffers violence, and the violent take it by force"
            </p>
            <p className="text-sm text-muted-foreground mt-2">- Matthew 11:12</p>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-[#FFD700] text-black hover:bg-[#FFA500] font-semibold text-lg px-8 py-6"
              onClick={handleEnterKingdom}
              data-testid="button-enter-kingdom"
            >
              <Crown className="mr-2 h-5 w-5" />
              Enter Kingdom
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-[#FFD700]/50 text-foreground hover:bg-[#FFD700]/10 text-lg px-8 py-6"
              onClick={handleLearnMore}
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-8 bg-gradient-to-b from-background to-blue-950/10 dark:to-blue-950/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                Platform Features
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive fintech ecosystem with divine stewardship
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Bot className="w-8 h-8" />,
                title: "63+ AI Agents",
                description: "Autonomous trading, analytics, and financial service bots orchestrated with LangGraph"
              },
              {
                icon: <Coins className="w-8 h-8" />,
                title: "Precious Metals Exchange",
                description: "Convert crypto to physical gold & silver with NFT certificates and vault storage"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "ETH Staking",
                description: "Pooled staking with 5.8% APY + 25% promotional boost. Multiple staking methods available"
              },
              {
                icon: <Church className="w-8 h-8" />,
                title: "Kingdom Standard Ethics",
                description: "Prayer integration, ethics checks, and auto-tithing for charitable stewardship"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "MEV Protection",
                description: "Mempool monitoring, sandwich attack detection, and heuristics-based risk scoring"
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: "Multi-Sig Governance",
                description: "N-of-M approval workflows and transparent multi-signature operations"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Real Blockchain",
                description: "Live NFT minting, ERC-20 deployment, and actual wallet management"
              },
              {
                icon: <LineChart className="w-8 h-8" />,
                title: "Advanced Trading",
                description: "Scalper backtesting, signal workflows, and persistent logging dashboard"
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "KYC & Compliance",
                description: "Production-ready compliance, payments integration, and security protocols"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-all hover:shadow-lg hover:shadow-[#FFD700]/10" data-testid={`feature-card-${index}`}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-[#FFD700]/10 rounded-lg flex items-center justify-center mb-3 text-[#FFD700]">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Spectrum Plans / Membership Tiers */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                Spectrum Kingdom Tiers
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Unlock exclusive benefits with higher holdings
            </p>
          </motion.div>

          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-2 mb-8" data-testid="tabs-list-plans">
              <TabsTrigger value="standard" data-testid="tab-standard-plans">Standard Tiers</TabsTrigger>
              <TabsTrigger value="elite" data-testid="tab-elite-plans">Elite Tiers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-[#CD7F32]/30" data-testid="plan-royal-bronze">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#CD7F32] to-[#8B4513] rounded-full flex items-center justify-center">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-center">Royal Bronze</CardTitle>
                    <CardDescription className="text-center">Entry Level</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm">✓ Entry-level gold purchases</p>
                      <p className="text-sm">✓ Digital NFT certificates</p>
                      <p className="text-sm">✓ Optional insured vault storage</p>
                      <p className="text-sm">✓ Basic platform access</p>
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setLocation("/spectrum-plans")}
                      data-testid="button-select-royal-bronze"
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-[#C0C0C0]/30" data-testid="plan-royal-silver">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#C0C0C0] to-[#A8A8A8] rounded-full flex items-center justify-center">
                      <Gem className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-center">Royal Silver</CardTitle>
                    <CardDescription className="text-center">$50k+ Holdings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm">✓ Free global shipping</p>
                      <p className="text-sm">✓ Priority support access</p>
                      <p className="text-sm">✓ Early access to limited drops</p>
                      <p className="text-sm">✓ Advanced trading features</p>
                    </div>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => setLocation("/spectrum-plans")}
                      data-testid="button-select-royal-silver"
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-[#FFD700]/50 bg-gradient-to-br from-[#FFD700]/5 to-background" data-testid="plan-royal-gold">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center">
                      <Crown className="w-8 h-8 text-black" />
                    </div>
                    <CardTitle className="text-2xl text-center text-[#FFD700]">Royal Gold</CardTitle>
                    <CardDescription className="text-center">$500k+ Holdings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm">✓ Dedicated concierge service</p>
                      <p className="text-sm">✓ Annual VIP events access</p>
                      <p className="text-sm">✓ Reduced spreads on purchases</p>
                      <p className="text-sm">✓ Premium analytics dashboard</p>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:from-[#FFA500] hover:to-[#FFD700]"
                      onClick={() => setLocation("/spectrum-plans")}
                      data-testid="button-select-royal-gold"
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="elite">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-background" data-testid="plan-kings-court">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-center text-purple-400">King's Court</CardTitle>
                    <CardDescription className="text-center">$5M+ Holdings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm">✓ Private jet perks & travel</p>
                      <p className="text-sm">✓ Exclusive supplier meetings</p>
                      <p className="text-sm">✓ Custom minted gold pieces</p>
                      <p className="text-sm">✓ Direct C-level access</p>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                      onClick={() => setLocation("/spectrum-plans")}
                      data-testid="button-select-kings-court"
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-background" data-testid="plan-king-david">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
                      <Scale className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-center text-red-400">King David Circle</CardTitle>
                    <CardDescription className="text-center">$10B+ Visionary</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm">✓ Sovereign lifestyle concierge</p>
                      <p className="text-sm">✓ Platform governance influence</p>
                      <p className="text-sm">✓ Treasury decision-making</p>
                      <p className="text-sm">✓ Bespoke financial instruments</p>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                      onClick={() => setLocation("/spectrum-plans")}
                      data-testid="button-select-king-david"
                    >
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Philosophy & Mission Section */}
      <section className="py-20 px-8 bg-gradient-to-b from-blue-950/10 to-background dark:from-blue-950/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                  Kingdom Standard Philosophy
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Built on principles of stewardship, ethics, and divine wisdom
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-[#FFD700]/20" data-testid="philosophy-stewardship">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-8 h-8 text-[#FFD700]" />
                    <CardTitle className="text-2xl">Stewardship & Auto-Tithing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    The Stewardship class automatically allocates a configurable percentage of realized profits 
                    to charitable causes. Donations are transparently tracked with receipts and on-chain verification.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Configure charity weightings and generate PDF receipts for all contributions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[#FFD700]/20" data-testid="philosophy-ethics">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Church className="w-8 h-8 text-[#FFD700]" />
                    <CardTitle className="text-2xl">Prayer & Ethics Engine</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Before executing high-risk transactions, the Ethics Engine applies rules to avoid abnormal 
                    trades and triggers prayer sessions with scripture verses for reflection and wisdom.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    3-5 minute prayer timers ensure thoughtful decision-making with operator approval.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-[#FFD700]/10 to-background border-[#FFD700]/30" data-testid="philosophy-mission">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
                  To bridge divine wisdom with cutting-edge financial technology. We unite blockchain innovation, 
                  AI automation, precious metals stability, and Kingdom values to create a platform where 
                  stewardship, ethics, and profitability coexist in harmony. Every transaction honors both 
                  fiduciary responsibility and charitable giving.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 px-8 bg-gradient-to-b from-background to-blue-950/10 dark:to-blue-950/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                Quick Actions
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started with the most popular features
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              size="lg"
              variant="outline"
              className="h-auto flex-col gap-2 py-6 border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/10"
              onClick={() => setLocation("/blockchain")}
              data-testid="button-quick-create-wallet"
            >
              <Wallet className="w-8 h-8 text-[#FFD700]" />
              <span className="font-semibold">Create Wallet</span>
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="h-auto flex-col gap-2 py-6 border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/10"
              onClick={() => setLocation("/trading")}
              data-testid="button-quick-trade"
            >
              <TrendingUp className="w-8 h-8 text-[#FFD700]" />
              <span className="font-semibold">Quick Trade</span>
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="h-auto flex-col gap-2 py-6 border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/10"
              onClick={() => setLocation("/blockchain")}
              data-testid="button-quick-mint-nft"
            >
              <Image className="w-8 h-8 text-[#FFD700]" />
              <span className="font-semibold">Mint NFT</span>
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="h-auto flex-col gap-2 py-6 border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/10"
              onClick={() => setLocation("/spectrum-plans")}
              data-testid="button-quick-stake"
            >
              <Coins className="w-8 h-8 text-[#FFD700]" />
              <span className="font-semibold">Stake Now</span>
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="h-auto flex-col gap-2 py-6 border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/10"
              onClick={() => setLocation("/metals")}
              data-testid="button-quick-buy-gold"
            >
              <Gem className="w-8 h-8 text-[#FFD700]" />
              <span className="font-semibold">Buy Gold</span>
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="h-auto flex-col gap-2 py-6 border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/10"
              onClick={() => setLocation("/p2p")}
              data-testid="button-quick-p2p"
            >
              <Users className="w-8 h-8 text-[#FFD700]" />
              <span className="font-semibold">P2P Trade</span>
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="h-auto flex-col gap-2 py-6 border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/10"
              onClick={() => setLocation("/trading-bots")}
              data-testid="button-quick-deploy-bot"
            >
              <Bot className="w-8 h-8 text-[#FFD700]" />
              <span className="font-semibold">Deploy Bot</span>
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="h-auto flex-col gap-2 py-6 border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/10"
              onClick={() => setLocation("/exchange")}
              data-testid="button-quick-exchange"
            >
              <ArrowRightLeft className="w-8 h-8 text-[#FFD700]" />
              <span className="font-semibold">Exchange</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Investment Options Showcase */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                Investment Opportunities
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Multiple paths to grow your wealth
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-blue-500/30" data-testid="investment-staking">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-10 h-10 text-blue-400" />
                  <div>
                    <CardTitle className="text-2xl">ETH Staking</CardTitle>
                    <CardDescription className="text-lg">5.8% APY + 25% Promo Boost</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Pooled Staking Benefits:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Low barrier entry (no 32 ETH required)</li>
                    <li>• Professional validator management</li>
                    <li>• Proportional rewards distribution</li>
                    <li>• Flexible withdrawal options</li>
                  </ul>
                </div>
                <div className="bg-blue-500/10 p-4 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">Current Rate:</span> 5.8% base APY
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Promotional:</span> +25% boost until Oct 31, 2025
                  </p>
                </div>
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => setLocation("/exchange")}
                  data-testid="button-start-eth-staking"
                >
                  Start Staking ETH
                </Button>
              </CardContent>
            </Card>

            <Card className="border-[#FFD700]/30" data-testid="investment-metals">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Coins className="w-10 h-10 text-[#FFD700]" />
                  <div>
                    <CardTitle className="text-2xl">Gold & Silver</CardTitle>
                    <CardDescription className="text-lg">8% APY Fixed Investment</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1-Year Fixed Investment:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 12-month minimum lock period</li>
                    <li>• Guaranteed appreciation bonus</li>
                    <li>• Free vault storage during term</li>
                    <li>• Option to renew or withdraw</li>
                  </ul>
                </div>
                <div className="bg-[#FFD700]/10 p-4 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">Instant Storage:</span> 0.5% annual fee
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Fixed Program:</span> 8% APY guaranteed
                  </p>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:from-[#FFA500] hover:to-[#FFD700]"
                  onClick={() => setLocation("/metals")}
                  data-testid="button-buy-precious-metals"
                >
                  Buy Precious Metals
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Jesus Cartel Music Ministry */}
      <section className="py-20 px-8 bg-gradient-to-b from-blue-950/10 to-background dark:from-blue-950/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Music className="w-12 h-12 text-[#FFD700]" />
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                  Jesus Cartel Music Ministry
                </span>
              </h2>
            </div>
            <p className="text-xl text-muted-foreground">
              Kingdom worship music with NFT & blockchain integration
            </p>
          </motion.div>

          <Tabs defaultValue="releases" className="w-full">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-2 mb-8" data-testid="tabs-jesus-cartel">
              <TabsTrigger value="releases" data-testid="tab-releases">
                <Headphones className="w-4 h-4 mr-2" />
                Latest Releases
              </TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="releases" className="mt-8">
              <JesusCartelReleases />
            </TabsContent>

            <TabsContent value="events" className="mt-8">
              <JesusCartelEvents />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-8 bg-gradient-to-br from-[#FFD700]/10 via-background to-blue-950/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Crown className="w-20 h-20 mx-auto text-[#FFD700] mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
              Join the Kingdom
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience divine fintech with 63+ AI agents, precious metals exchange, ETH staking, 
            and Kingdom Standard ethics. The violent take it by force.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-[#FFD700] text-black hover:bg-[#FFA500] font-semibold text-lg px-10 py-6"
              onClick={handleEnterKingdom}
              data-testid="button-final-cta"
            >
              <Crown className="mr-2 h-5 w-5" />
              Enter Now
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-[#FFD700]/50 text-foreground hover:bg-[#FFD700]/10 text-lg px-10 py-6"
              onClick={handleExplorePlatform}
              data-testid="button-explore-platform"
            >
              Explore Platform
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
