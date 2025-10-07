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
} from "lucide-react";
import { Link, useLocation } from "wouter";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Trading Bots",
    url: "/trading",
    icon: TrendingUp,
  },
  {
    title: "Wallets & Blockchain",
    url: "/blockchain",
    icon: Wallet,
  },
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
              {menuItems.map((item) => (
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
