"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlatform } from "@/context/platform-context";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatNaira, formatDate } from "@/lib/formatters";
import {
  ArrowRightLeft, Wallet, TrendingUp, TrendingDown, ArrowRight, AlertTriangle,
  Info, Key, CreditCard, Link2, ArrowUpRight, Eye, EyeOff, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WelcomeModal from "@/components/welcome-modal";

export default function DashboardPage() {
  const {
    transactions, wallets, environment, currentClient,
    canAccessLive, isOnboardingComplete, setEnvironment,
  } = usePlatform();
  const router = useRouter();
  const [hideBalances, setHideBalances] = useState(false);

  const envTxns = transactions.filter(
    (t) => t.environment === environment && t.clientId === currentClient?.id,
  );
  const totalVolume = envTxns.reduce((sum, t) => sum + t.amount, 0);
  const successRate = envTxns.length
    ? (envTxns.filter((t) => t.status === "successful").length / envTxns.length) * 100
    : 0;
  const activeWallets = wallets.filter(
    (w) => w.clientId === currentClient?.id && w.status === "active",
  ).length;

  const showOnboardingBanner = currentClient && !isOnboardingComplete;
  const showLiveBlockedBanner = environment === "live" && !canAccessLive;

  const balances = [
    { currency: "NGN", symbol: "₦", amount: 12540000, label: "Naira" },
    { currency: "USD", symbol: "$", amount: 25400, label: "Dollar" },
    { currency: "EUR", symbol: "€", amount: 18200, label: "Euro" },
    { currency: "GBP", symbol: "£", amount: 9800, label: "Sterling" },
  ];
  const primaryBalance = balances[0];

  const formatBalance = (n: number) =>
    hideBalances ? "••••••" : n.toLocaleString();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-8">
      <WelcomeModal />

      {/* Banners */}
      {showOnboardingBanner && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-warning/20 surface-warning/40 px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <Info className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-foreground">Complete your profile to unlock live access</p>
              <p className="text-[12px] text-muted-foreground">
                Your sandbox environment is active. Complete compliance to request go-live.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => router.push("/compliance")} className="shrink-0">
            Continue <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      )}

      {showLiveBlockedBanner && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/20 surface-destructive/40 px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-foreground">Live access restricted</p>
              <p className="text-[12px] text-muted-foreground">
                Complete your profile and get approved before accessing live.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => setEnvironment("sandbox")}>
              Switch to Sandbox
            </Button>
            <Button size="sm" onClick={() => router.push("/compliance")}>
              Complete Profile
            </Button>
          </div>
        </div>
      )}

      {/* Editorial header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>{greeting}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</span>
        </div>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <h1 className="font-display text-[32px] leading-tight font-medium tracking-[-0.03em]">
            {currentClient?.businessName || "Welcome back"}.
          </h1>
          <Button variant="outline" size="sm" onClick={() => setHideBalances(!hideBalances)}>
            {hideBalances ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {hideBalances ? "Show" : "Hide"} balances
          </Button>
        </div>
      </header>

      {/* Hero balance composition */}
      <Card className="overflow-hidden p-0 shadow-elevated">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative p-7 lg:p-9 border-b lg:border-b-0 lg:border-r border-border/70 bg-gradient-to-br from-card to-surface-sunken/40">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${environment === "live" ? "bg-success" : "bg-warning"}`} />
                <span>Primary balance · {environment}</span>
              </div>
              <div>
                <p className="font-display text-[56px] leading-none font-medium tracking-[-0.04em] tabular-nums">
                  <span className="text-muted-foreground/70 text-[36px] mr-1">{primaryBalance.symbol}</span>
                  {formatBalance(primaryBalance.amount)}
                </p>
                <p className="text-[12px] text-muted-foreground mt-2 uppercase tracking-wider">
                  {primaryBalance.currency} · {primaryBalance.label}
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => router.push("/transactions")}>
                  <Plus className="h-3 w-3" /> New transfer
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push("/transactions")}>
                  Statement <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-7 lg:p-9 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">
                Other holdings
              </p>
              <button
                onClick={() => router.push("/virtual-accounts")}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                All accounts <ArrowUpRight className="h-2.5 w-2.5" />
              </button>
            </div>
            <div className="space-y-3">
              {balances.slice(1).map((b) => (
                <div
                  key={b.currency}
                  className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-[12px] font-mono-ui uppercase tracking-wider text-muted-foreground">
                      {b.currency}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">{b.label}</p>
                  </div>
                  <p className="font-display text-[18px] font-medium tabular-nums">
                    <span className="text-muted-foreground/60 text-[14px] mr-0.5">{b.symbol}</span>
                    {formatBalance(b.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* KPIs — refined editorial grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden bg-border/60 border border-border/60">
        {[
          { label: "Total Volume", value: formatNaira(totalVolume), icon: ArrowRightLeft, change: "+12.5%", up: true },
          { label: "Success Rate", value: `${successRate.toFixed(1)}%`, icon: TrendingUp, change: "+2.3%", up: true },
          { label: "Active Wallets", value: activeWallets.toString(), icon: Wallet, change: "+8", up: true },
          { label: "Pending Items", value: "0", icon: AlertTriangle, change: "0", up: true },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card p-5 lg:p-6 transition-colors hover:bg-muted/30">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                {kpi.label}
              </p>
              <kpi.icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <p className="font-display text-[28px] font-medium tracking-tight tabular-nums mt-3">
              {kpi.value}
            </p>
            <p
              className={`text-[11.5px] mt-1.5 flex items-center gap-1 font-mono-ui ${
                kpi.up ? "text-success" : "text-destructive"
              }`}
            >
              {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {kpi.change}
              <span className="text-muted-foreground/70">vs last month</span>
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions — minimal pill row */}
      <div className="space-y-3">
        <p className="text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground px-1">
          Quick actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: CreditCard, label: "Payment Link", action: () => router.push("/transactions") },
            { icon: ArrowRightLeft, label: "Make Transfer", action: () => router.push("/transactions") },
            { icon: Key, label: "API Keys", action: () => router.push("/api-keys") },
            { icon: Link2, label: "Webhooks", action: () => router.push("/webhooks") },
          ].map((qa) => (
            <button
              key={qa.label}
              onClick={qa.action}
              className="group relative flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 text-left transition-all duration-200 ease-luxury hover:border-border-strong hover:shadow-soft hover:-translate-y-px"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <qa.icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[13px] font-medium truncate">{qa.label}</span>
              </div>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground/60 transition-transform duration-200 ease-luxury group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-baseline justify-between border-b border-border/60">
            <CardTitle>Recent transactions</CardTitle>
            <button
              onClick={() => router.push("/transactions")}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-2.5 w-2.5" />
            </button>
          </CardHeader>
          <div className="divide-y divide-border/60">
            {envTxns.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-12">
                No transactions in {environment}
              </p>
            ) : (
              envTxns.slice(0, 5).map((txn) => (
                <div key={txn.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">{txn.recipientName}</p>
                    <p className="text-[11px] text-muted-foreground font-mono-ui">{formatDate(txn.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-medium tabular-nums">
                      {formatNaira(txn.amount)}
                    </span>
                    <StatusBadge status={txn.status} type="transaction" />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <NotificationsPreview />
        </Card>
      </div>
    </div>
  );
}

function NotificationsPreview() {
  const { notifications, markNotificationRead } = usePlatform();
  const recent = notifications.slice(0, 5);

  if (recent.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground text-center py-12">No notifications</p>
    );
  }

  return (
    <div className="divide-y divide-border/60">
      {recent.map((n) => (
        <button
          key={n.id}
          onClick={() => markNotificationRead(n.id)}
          className={`group w-full flex items-start gap-3 px-6 py-3.5 text-left transition-colors hover:bg-muted/30 ${
            !n.read ? "bg-accent-soft/30" : ""
          }`}
        >
          {!n.read ? (
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
          ) : (
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-transparent shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate">{n.title}</p>
            <p className="text-[12px] text-muted-foreground line-clamp-1 mt-0.5">{n.message}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
