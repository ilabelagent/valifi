import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  Wallet,
  Bot,
  Music,
  Shield,
  CreditCard,
  FileCheck,
  Zap,
  TrendingUp,
  Coins,
  ShieldCheck,
  Users,
  MessageSquare,
  Crown,
  Newspaper,
  ArrowLeftRight,
  ArrowUpDown,
} from "lucide-react";
import { Link, useLocation } from "wouter";

const tradingItems = [
  {
    title: "Exchange Platform",
    url: "/exchange",
    icon: ArrowLeftRight,
  },
  {
    title: "Trading Bots Arsenal",
    url: "/trading-bots",
    icon: Bot,
  },
  {
    title: "Metals & Gold",
    url: "/metals",
    icon: Crown,
  },
  {
    title: "Legacy Trading",
    url: "/trading",
    icon: TrendingUp,
  },
];

const blockchainItems = [
  {
    title: "Wallets & Blockchain",
    url: "/blockchain",
    icon: Wallet,
  },
  {
    title: "Coin Mixer",
    url: "/mixer",
    icon: ShieldCheck,
  },
];

const communityItems = [
  {
    title: "VIP Forum",
    url: "/community",
    icon: Users,
  },
  {
    title: "AI Chat",
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Blog & News",
    url: "/news",
    icon: Newspaper,
  },
];

const platformItems = [
  {
    title: "Agent Orchestra",
    url: "/agents",
    icon: Bot,
  },
  {
    title: "Jesus Cartel Publishing",
    url: "/publishing",
    icon: Music,
  },
  {
    title: "Guardian Angel",
    url: "/security",
    icon: Shield,
  },
  {
    title: "Payments",
    url: "/payments",
    icon: CreditCard,
  },
  {
    title: "P2P Trading",
    url: "/p2p",
    icon: ArrowUpDown,
  },
  {
    title: "KYC/Compliance",
    url: "/kyc",
    icon: FileCheck,
  },
  {
    title: "Quantum Computing",
    url: "/quantum",
    icon: Zap,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-serif divine-gradient-text">
            Valifi Kingdom
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  data-active={location === "/"}
                  className="data-[active=true]:bg-sidebar-accent"
                >
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Trading & Finance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tradingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={location === item.url}
                    className="data-[active=true]:bg-sidebar-accent"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Blockchain</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {blockchainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={location === item.url}
                    className="data-[active=true]:bg-sidebar-accent"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Community</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={location === item.url}
                    className="data-[active=true]:bg-sidebar-accent"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Platform Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={location === item.url}
                    className="data-[active=true]:bg-sidebar-accent"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
