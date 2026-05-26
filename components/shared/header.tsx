"use client"
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, User, Search, Command } from "lucide-react";
import { usePlatform } from "@/context/platform-context";
import { Role, ROLE_LABELS } from "@/types/platform";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "@/hooks/use-toast";
import { getDefaultPathForRole } from "./navigation";

const ROLES: Role[] = ["client"];

const Header = () => {
  const {
    role, setRole, environment, setEnvironment, canAccessLive,
    notifications, unreadNotificationCount, markNotificationRead,
    currentClient,
  } = usePlatform();
  const router = useRouter();

  const handleRoleSwitch = (r: Role) => {
    setRole(r);
    const path = getDefaultPathForRole(r);
    router.push(path);
  };

  const handleEnvironmentToggle = (checked: boolean) => {
    if (checked && !canAccessLive) {
      toast({
        title: "Live access restricted",
        description:
          "Complete compliance and obtain Rex MFB go-live approval to access live.",
        variant: "destructive",
      });
      return;
    }
    setEnvironment(checked ? "live" : "sandbox");
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border/70 glass-strong">
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-6">
        {/* Left — sidebar trigger + breadcrumb-ish */}
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60" />
          <div className="hidden h-6 w-px bg-border/80 md:block" />
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Workspace
            </span>
            <span className="text-muted-foreground/60">/</span>
            <span className="truncate text-[13px] font-medium text-foreground">
              {currentClient?.businessName ?? "Console"}
            </span>
          </div>
        </div>

        {/* Center — command/search */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <button
            type="button"
            className="group flex w-full items-center gap-2.5 rounded-lg border border-border/80 bg-surface-sunken/60 px-3 py-1.5 text-left text-[13px] text-muted-foreground transition-all duration-200 ease-luxury hover:border-border-strong hover:bg-surface-sunken hover:text-foreground"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1">Search transactions, accounts, docs…</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right — controls */}
        <div className="flex items-center gap-2">
          {/* Environment toggle */}
          <div className="hidden sm:flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-2 pr-3 text-[11px] font-medium shadow-xs">
            <span
              className={`px-1.5 transition-colors ${
                environment === "sandbox"
                  ? "text-warning"
                  : "text-muted-foreground"
              }`}
            >
              Sandbox
            </span>
            <Switch
              checked={environment === "live"}
              onCheckedChange={handleEnvironmentToggle}
              className="h-4 w-7 data-[state=checked]:bg-success data-[state=unchecked]:bg-warning [&>span]:h-3 [&>span]:w-3 data-[state=checked]:[&>span]:translate-x-3"
            />
            <span
              className={`px-1.5 transition-colors ${
                environment === "live" ? "text-success" : "text-muted-foreground"
              }`}
            >
              Live
            </span>
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <Bell className="h-[15px] w-[15px]" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-surface" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-96 p-0 border-border shadow-luxury overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                  <p className="text-[13px] font-medium">Notifications</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {unreadNotificationCount} unread
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-[11px] text-muted-foreground">
                  Mark all read
                </Button>
              </div>
              <ScrollArea className="max-h-[360px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-5 w-5 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-[12px] text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`group relative w-full text-left px-4 py-3 border-b border-border/60 last:border-0 transition-colors hover:bg-muted/40 ${
                        !n.read ? "bg-accent-soft/40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!n.read && (
                          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate">
                            {n.title}
                          </p>
                          <p className="text-[12px] text-muted-foreground line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-1.5">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <div className="hidden sm:block h-6 w-px bg-border/80 mx-1" />

          {/* Role switcher (workspace) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-2 rounded-lg pl-1.5 pr-2.5 hover:bg-muted/60"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <User className="h-3 w-3" />
                </span>
                <span className="hidden md:inline text-[12px] font-medium">
                  {ROLE_LABELS[role]}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-border shadow-luxury">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                Switch portal
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ROLES.map((r) => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`text-[13px] ${role === r ? "bg-muted" : ""}`}
                >
                  {ROLE_LABELS[r]}
                  {role === r && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;