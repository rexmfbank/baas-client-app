import { Badge } from "@/components/ui/badge";
import { TransactionStatus, OnboardingStage, DisputeStatus, DocumentStatus, ServiceStatus } from "@/types/platform";
import { cn } from "@/lib/utils";

const txnColors: Record<TransactionStatus, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  successful: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  reversed: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, type = "transaction" }: { status?: string; type?: string }) {
  if (!status) {
    return (
      <Badge variant="outline" className="capitalize text-xs font-medium bg-muted text-muted-foreground border-border">
        unknown
      </Badge>
    );
  }
  let className = "";

  if (type === "transaction") {
    className = txnColors[status as TransactionStatus] || "";
  } else if (type === "onboarding") {
    const s = status as OnboardingStage;
    if (["active", "live-approved", "approved-sandbox"].includes(s)) className = "bg-success/10 text-success border-success/20";
    else if (["draft", "submitted"].includes(s)) className = "bg-muted text-muted-foreground border-border";
    else if (["under-review", "compliance-review", "go-live-requested"].includes(s)) className = "bg-warning/10 text-warning border-warning/20";
    else if (["rejected", "suspended"].includes(s)) className = "bg-destructive/10 text-destructive border-destructive/20";
    else if (s === "more-info-required") className = "bg-accent/10 text-accent border-accent/20";
    else if (s === "sandbox-active") className = "bg-primary/10 text-primary border-primary/20";
    else className = "bg-muted text-muted-foreground border-border";
  } else if (type === "dispute") {
    const s = status as DisputeStatus;
    if (s === "open") className = "bg-warning/10 text-warning border-warning/20";
    else if (s === "under-review") className = "bg-primary/10 text-primary border-primary/20";
    else if (s === "resolved") className = "bg-success/10 text-success border-success/20";
    else className = "bg-destructive/10 text-destructive border-destructive/20";
  } else if (type === "service") {
    const s = status as ServiceStatus;
    if (s === "active") className = "bg-success/10 text-success border-success/20";
    else if (s === "degraded") className = "bg-warning/10 text-warning border-warning/20";
    else className = "bg-destructive/10 text-destructive border-destructive/20";
  } else if (type === "document") {
    const s = status as DocumentStatus;
    if (s === "accepted") className = "bg-success/10 text-success border-success/20";
    else if (s === "under-review" || s === "uploaded") className = "bg-warning/10 text-warning border-warning/20";
    else className = "bg-destructive/10 text-destructive border-destructive/20";
  }

  return (
    <Badge variant="outline" className={cn("capitalize text-xs font-medium", className)}>
      {status.replace(/-/g, " ")}
    </Badge>
  );
}
