"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Key, Webhook, ArrowRightLeft, CreditCard,
  Settings, Scale, FileSearch,
  Activity, BookOpen, Users, Server, ShieldCheck
} from "lucide-react";
import { usePlatform } from "@/context/platform-context";
import { Role, ROLE_PORTAL } from "@/types/platform";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { getNavForRole } from "./navigation";

const PORTAL_LABEL: Record<string, string> = { client: "Client", admin: "Operator" };


const AppSidebar = () => {
  const { role, currentClient, environment } = usePlatform();
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const portal = ROLE_PORTAL[role];
  const navItems = getNavForRole(role);



  return (
      <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border gradient-sidebar"
    >
      {/* Brand block */}
      <div
        className={`h-16 flex items-center gap-3 border-b border-sidebar-border ${
          collapsed ? "justify-center px-2" : "px-5"
        }`}
      >
        <div className="relative h-9 w-9 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-soft">
          <span className="font-display text-[15px] font-semibold tracking-tight">R</span>
          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-sidebar" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="text-[13px] font-display font-semibold text-sidebar-foreground tracking-tight truncate">
              Rex BaaS
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {PORTAL_LABEL[portal] ?? "Portal"}
            </p>
          </div>
        )}
      </div>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-9 rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium hover:bg-sidebar-accent/60"
                    >
                      <Link
                        href={item.path}
                        className="group relative flex items-center gap-3 px-2.5 text-[13px] text-sidebar-foreground/70 transition-colors duration-200 ease-luxury hover:text-sidebar-foreground"
                      >
                        {/* Active rail */}
                        <span
                          aria-hidden
                          className={`absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full transition-all duration-300 ease-luxury ${
                            isActive ? "bg-accent opacity-100" : "opacity-0"
                          }`}
                        />
                        <item.icon
                          className={`h-[15px] w-[15px] shrink-0 transition-colors ${
                            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
                        {!collapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — environment + tenant chip */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 transition-colors hover:bg-sidebar-accent/70">
            <div className="flex items-center gap-2">
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  environment === "live" ? "bg-success" : "bg-warning"
                }`}
              >
                <span
                  className={`absolute inset-0 inline-flex h-2 w-2 animate-ping rounded-full opacity-60 ${
                    environment === "live" ? "bg-success" : "bg-warning"
                  }`}
                />
              </span>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {environment === "live" ? "Live" : "Sandbox"}
              </p>
            </div>
            <p className="mt-1.5 truncate font-display text-[13px] font-medium text-sidebar-foreground">
              {currentClient?.businessName ?? "—"}
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="truncate">{currentClient?.businessType ?? "Account"}</span>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </div>
          </div>
        ) : (
          <div className="mx-auto h-2 w-2 rounded-full bg-success" />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar