import {
  LayoutDashboard, Key, Webhook, ArrowRightLeft, CreditCard,
  Settings, Scale, FileSearch,
  Activity, BookOpen, Users, Server, ShieldCheck
} from "lucide-react";
import { Role, ROLE_PORTAL } from "@/types/platform";

export interface NavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const clientNav: NavItem[] = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "API Keys", path: "/api-keys", icon: Key },
  { title: "API Docs & Sandbox", path: "/api-docs", icon: BookOpen },
  { title: "Webhooks", path: "/webhooks", icon: Webhook },
  { title: "Transactions", path: "/transactions", icon: ArrowRightLeft },
  { title: "Virtual Accounts", path: "/virtual-accounts", icon: CreditCard },
  { title: "Compliance", path: "/compliance", icon: ShieldCheck },
  { title: "Settings", path: "/settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { title: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Go-Live Requests", path: "/admin/onboarding", icon: ArrowRightLeft },
  { title: "Compliance Review", path: "/admin/compliance", icon: ShieldCheck },
  { title: "Client Management", path: "/admin/clients", icon: Users },
  { title: "Sandbox Clients", path: "/admin/sandbox-clients", icon: Server },
  { title: "Limits & Controls", path: "/admin/limits", icon: Scale },
  { title: "Notifications", path: "/admin/notifications", icon: Activity },
  { title: "Audit Logs", path: "/admin/audit", icon: FileSearch },
  { title: "Service Health", path: "/admin/service-health", icon: Activity },
];

export function getNavForRole(role: Role): NavItem[] {
  const portal = ROLE_PORTAL[role];
  switch (portal) {
    case "client": return clientNav;
    case "admin": return adminNav;
  }
}

export function getDefaultPathForRole(role: Role): string {
  const nav = getNavForRole(role);
  return nav[0]?.path || "/";
}
