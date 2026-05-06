"use client"

import { useMemo, useState } from "react";
import { usePlatform } from "@/context/platform-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useActionState } from "@/hooks/use-action-state";
import { getDocumentRequirements } from "@/data/compliance-data";
import {
  BUSINESS_TYPE_LABELS, BusinessTypeCode, ClientDocument, BusinessPerson, PersonRole,
} from "@/types/platform";
import {
  CheckCircle2, XCircle, Clock, Upload, Plus, Trash2, AlertTriangle, FileText,
  Building2, Users, Landmark, FileSignature, ListChecks, UserPlus,
  Shield, ArrowUpRight, Sparkles, Lock,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const SECTION_ORDER = [
  { key: "business", label: "Business", icon: Building2 },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "people", label: "Team", icon: Users },
  { key: "account", label: "Bank Account", icon: Landmark },
  { key: "service_agreement", label: "Agreement", icon: FileSignature },
  { key: "summary", label: "Summary", icon: ListChecks },
] as const;

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: any }> = {
    not_started: { label: "Not started", cls: "bg-muted text-muted-foreground border-border/60", Icon: Clock },
    in_progress: { label: "In progress", cls: "surface-warning border-warning/20", Icon: Clock },
    submitted: { label: "Submitted", cls: "surface-info border-info/20", Icon: Clock },
    pending_review: { label: "In review", cls: "surface-info border-info/20", Icon: Clock },
    approved: { label: "Approved", cls: "surface-success border-success/20", Icon: CheckCircle2 },
    rejected: { label: "Action needed", cls: "surface-destructive border-destructive/20", Icon: XCircle },
    replaced: { label: "Replaced", cls: "bg-muted text-muted-foreground border-border/60", Icon: Clock },
    verified: { label: "Verified", cls: "surface-success border-success/20", Icon: CheckCircle2 },
    pending: { label: "Pending", cls: "surface-warning border-warning/20", Icon: Clock },
    accepted: { label: "Accepted", cls: "surface-success border-success/20", Icon: CheckCircle2 },
  };
  const m = map[status] || map.not_started;
  const Icon = m.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${m.cls}`}
    >
      <Icon className="h-2.5 w-2.5" /> {m.label}
    </span>
  );
}

const CompliancePage = () => {
  const {
    currentClient, currentCompliance, updateClient,
    setBusinessType, updateBusinessInformation,
    upsertPerson, removePerson, uploadDocument, removeDocument,
    updateBankAccount, acceptServiceAgreement, requestGoLive,
  } = usePlatform();
  const { executeAction, isLoading } = useActionState();
  const [activeTab, setActiveTab] = useState<string>("business");
  const [personDialog, setPersonDialog] = useState(false);
  const [editingPerson, setEditingPerson] = useState<BusinessPerson | null>(null);
  const [brandColor, setBrandColor] = useState<string>(currentClient?.brandColor || "#6C5CE7");
  const [displayName, setDisplayName] = useState<string>(currentClient?.displayName || "");
  const [logoUrl, setLogoUrl] = useState<string>(currentClient?.logoUrl || "");

  // Team invite dialog state
  const [showInvite, setShowInvite] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Developer" | "Viewer">("Developer");

  if (!currentClient || !currentCompliance) {
    return <div className="p-8 text-sm text-muted-foreground">Compliance profile not found.</div>;
  }

  const cp = currentCompliance;
  const requirements = useMemo(() => getDocumentRequirements(cp.businessTypeCode), [cp.businessTypeCode]);

  const docByReq = (reqId: string) =>
    cp.documents.filter(d => d.requirementId === reqId && d.status !== "replaced")[0];

  /* ---------- Mock upload handler ---------- */
  const handleUpload = (requirementId: string, file?: File) => {
    const fakeName = file?.name || `${requirementId}.pdf`;
    const doc: ClientDocument = {
      id: `cd-${Date.now()}`,
      requirementId,
      fileName: fakeName,
      fileType: fakeName.split(".").pop()?.toLowerCase() || "pdf",
      fileSizeMb: file ? +(file.size / 1024 / 1024).toFixed(2) : 1.0,
      status: "pending_review",
      uploadedAt: new Date().toISOString(),
    };
    executeAction(`upload-${requirementId}`, () => {
      uploadDocument(currentClient.id, doc);
    }, "Document uploaded for review");
  };

  /* ---------- Text-entry handler (for non-file requirements) ---------- */
  const handleSaveText = (requirementId: string, value: string) => {
    if (!value.trim()) return;
    const doc: ClientDocument = {
      id: `cd-${Date.now()}`,
      requirementId,
      fileName: value.trim(),
      fileType: "text",
      fileSizeMb: 0,
      status: "pending_review",
      uploadedAt: new Date().toISOString(),
    };
    executeAction(`save-${requirementId}`, () => {
      uploadDocument(currentClient.id, doc);
    }, "Information saved for review");
  };

  /* ---------- Submit handlers ---------- */
  const submitBusiness = () => {
    executeAction("save-business", () => {
      // Persist branding fields onto client record alongside business info submission
      updateClient(currentClient.id, { brandColor, displayName, logoUrl });
      updateBusinessInformation(currentClient.id, { ...cp.businessInformation, status: "submitted" });
    }, "Business information submitted");
  };

  const submitBank = () => {
    executeAction("save-bank", () => {
      updateBankAccount(currentClient.id, { ...cp.bankAccount, verificationStatus: "verified", isSkipped: false });
    }, "Bank account verified");
  };

  const acceptAgreement = () => {
    executeAction("accept-agreement", () => {
      acceptServiceAgreement(currentClient.id, currentClient.businessName);
    }, "Service agreement accepted");
  };

  const handleGoLive = () => {
    executeAction("go-live", () => {
      requestGoLive(currentClient.id, currentClient.businessName);
    }, "Go-live request submitted to Rex MFB");
  };

  const handleSavePerson = (p: BusinessPerson) => {
    executeAction("save-person", () => {
      upsertPerson(currentClient.id, p);
      setPersonDialog(false);
      setEditingPerson(null);
    }, "Person saved");
  };

  const handleInviteMember = () => {
    if (!inviteEmail) return;
    executeAction("invite-member", () => {
      const newMember = {
        id: `tm-${Date.now()}`,
        email: inviteEmail,
        name: inviteEmail.split("@")[0],
        role: inviteRole,
        joinedAt: new Date().toISOString(),
      };
      updateClient(currentClient.id, {
        teamMembers: [...(currentClient.teamMembers || []), newMember],
      });
      setShowInvite(false);
      setInviteEmail("");
    }, "Invitation sent successfully");
  };

  const handleRemoveMember = (memberId: string) => {
    executeAction("remove-member", () => {
      updateClient(currentClient.id, {
        teamMembers: currentClient.teamMembers.filter(m => m.id !== memberId),
      });
      setShowRemoveMember(null);
    }, "Team member removed");
  };

  const requiredCount = requirements.filter(r => r.isRequired).length;
  const approvedDocs = cp.documents.filter(d => d.status === "approved").length;
  const lastGoLive = cp.goLiveRequests[cp.goLiveRequests.length - 1];

  return (
    <div className="space-y-8">
      {/* Editorial header */}
      <header className="space-y-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Regulatory Compliance</span>
          <span className="text-muted-foreground/40">·</span>
          <span>Rex Microfinance Bank</span>
        </div>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-display text-[34px] leading-[1.05] font-medium tracking-[-0.03em]">
              Activate your live environment.
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Complete the items below in any order. Each is independently reviewed by Rex MFB compliance.
              You'll be notified the moment your account is ready for production.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border bg-surface">
              {BUSINESS_TYPE_LABELS[cp.businessTypeCode]}
            </Badge>
            <StatusPill status={cp.overallStatus} />
          </div>
        </div>
      </header>

      {/* Progress orchestration — single luxurious panel */}
      <Card className="overflow-hidden p-0 shadow-elevated">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          {/* Left — progress */}
          <div className="p-7 lg:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-border/70">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                  Compliance Progress
                </p>
                <p className="font-display text-[28px] font-medium tracking-tight tabular-nums mt-1.5">
                  {cp.approvedPercentage}
                  <span className="text-muted-foreground/60 text-[20px]">%</span>
                  <span className="ml-2 text-[12px] text-muted-foreground tracking-normal">approved</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                  Submitted
                </p>
                <p className="font-display text-[20px] font-medium tabular-nums mt-1.5">
                  {cp.completionPercentage}<span className="text-muted-foreground/60 text-[14px]">%</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="uppercase tracking-wider text-muted-foreground">Submission</span>
                  <span className="font-mono-ui tabular-nums text-foreground">{cp.completionPercentage}%</span>
                </div>
                <Progress value={cp.completionPercentage} className="bg-muted/80 h-1" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between text-[11px]">
                  <span className="uppercase tracking-wider text-muted-foreground">Approved by Rex MFB</span>
                  <span className="font-mono-ui tabular-nums text-foreground">{cp.approvedPercentage}%</span>
                </div>
                <Progress value={cp.approvedPercentage} className="bg-muted/80 h-1 [&>div]:bg-accent" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-px rounded-lg overflow-hidden bg-border/60 border border-border/60">
              <Stat label="Documents" value={`${approvedDocs}/${requiredCount}`} />
              <Stat label="People" value={`${cp.people.length}`} />
              <Stat
                label="Bank"
                value={cp.bankAccount.verificationStatus === "verified" ? "Verified" : "Pending"}
              />
            </div>
          </div>

          {/* Right — Go-Live */}
          <div
            className={`relative p-7 lg:p-8 flex flex-col justify-between gap-6 ${
              cp.goLiveEligible ? "bg-accent-soft/30" : "bg-surface-sunken/40"
            }`}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "var(--gradient-ring-subtle)" }}
            />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
                {cp.goLiveEligible ? <Sparkles className="h-3 w-3 text-accent" /> : <Lock className="h-3 w-3" />}
                <span>Live Activation</span>
              </div>
              <h3 className="font-display text-[22px] font-medium tracking-tight leading-tight">
                {cp.goLiveEligible ? "Ready for production." : "Locked until reviewed."}
              </h3>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed max-w-sm">
                {cp.goLiveEligible
                  ? "All required items have been approved. Submit your go-live request to begin processing live transactions."
                  : "All required items must be approved by Rex MFB compliance before you can request go-live."}
              </p>
              {lastGoLive && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Latest request
                  </span>
                  <StatusPill status={lastGoLive.status} />
                </div>
              )}
              {lastGoLive?.reviewComment && (
                <p className="text-[12px] text-muted-foreground border-l-2 border-accent/40 pl-3 mt-2 italic">
                  "{lastGoLive.reviewComment}"
                </p>
              )}
            </div>
            <Button
              size="lg"
              variant={cp.goLiveEligible ? "default" : "outline"}
              className="relative w-full justify-between group"
              disabled={!cp.goLiveEligible || isLoading("go-live") || lastGoLive?.status === "pending"}
              onClick={handleGoLive}
            >
              <span>
                {lastGoLive?.status === "pending" ? "Awaiting Rex Review" : "Request Go-Live"}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 ease-luxury group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Business type selector (only when nothing started) */}
      {cp.documents.length === 0 && cp.businessInformation.status === "not_started" && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">Confirm your business type</CardTitle>
            <CardDescription>This determines which compliance documents are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={cp.businessTypeCode} onValueChange={(v) => setBusinessType(currentClient.id, v as BusinessTypeCode)}>
              <SelectTrigger className="max-w-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BNR">Business Name Registration</SelectItem>
                <SelectItem value="LLC">Limited Liability Company</SelectItem>
                <SelectItem value="COOP">Cooperative Society</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Tabs — editorial side rail */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6"
        orientation="vertical"
      >
        <div className="lg:sticky lg:top-24 self-start">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-1 mb-3">
            Sections
          </p>
          <TabsList className="flex flex-col h-auto items-stretch w-full bg-transparent border-0 p-0 gap-0.5">
            {SECTION_ORDER.map((s, idx) => {
              const Icon = s.icon;
              const sectionStatus =
                s.key === "documents" ? (approvedDocs === requiredCount && requiredCount > 0 ? "approved" : cp.documents.length ? "in_progress" : "not_started")
                : s.key === "business" ? cp.businessInformation.status
                : s.key === "people" ? (cp.people[0]?.status || "not_started")
                : s.key === "account" ? (cp.bankAccount.verificationStatus === "verified" ? "approved" : cp.bankAccount.accountNumber ? "submitted" : "not_started")
                : s.key === "service_agreement" ? (cp.serviceAgreement.status === "accepted" ? "approved" : "not_started")
                : cp.goLiveEligible ? "approved" : "in_progress";
              return (
                <TabsTrigger
                  key={s.key}
                  value={s.key}
                  className="group relative justify-between gap-2 h-10 rounded-lg px-3 text-[13px] font-normal text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:font-medium data-[state=active]:shadow-none hover:text-foreground hover:bg-muted/40 transition-colors"
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-ui text-[10px] text-muted-foreground/60 tabular-nums w-4">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </span>
                  {sectionStatus === "approved" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                  )}
                  {sectionStatus === "rejected" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  )}
                  {sectionStatus === "in_progress" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                  )}
                  {sectionStatus === "submitted" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-info shrink-0" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <div className="space-y-4 min-w-0">
          {/* DOCUMENTS */}
          <TabsContent value="documents" className="m-0">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/60">
                <div className="flex items-baseline justify-between">
                  <div>
                    <CardTitle>Required documentation</CardTitle>
                    <CardDescription>
                      Tailored to {BUSINESS_TYPE_LABELS[cp.businessTypeCode]} · {requiredCount} required
                    </CardDescription>
                  </div>
                  <span className="font-mono-ui text-[11px] text-muted-foreground tabular-nums">
                    {approvedDocs}/{requiredCount} approved
                  </span>
                </div>
              </CardHeader>
              <div className="divide-y divide-border/60">
                {requirements.map((req) => {
                  const doc = docByReq(req.id);
                  const isText = req.inputType === "text";
                  return (
                    <div
                      key={req.id}
                      className="group p-5 transition-colors duration-200 ease-luxury hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className={`mt-0.5 h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center ${
                              doc?.status === "approved"
                                ? "border-success/30 surface-success"
                                : doc?.status === "rejected"
                                ? "border-destructive/30 surface-destructive"
                                : doc
                                ? "border-info/30 surface-info"
                                : "border-border bg-surface-sunken text-muted-foreground"
                            }`}
                          >
                            {isText ? <FileSignature className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[13.5px] font-medium text-foreground">
                                {req.documentName}
                              </p>
                              {!req.isRequired && (
                                <Badge variant="outline" className="text-[9.5px]">Optional</Badge>
                              )}
                              {doc && <StatusPill status={doc.status} />}
                            </div>
                            <p className="text-[11.5px] text-muted-foreground mt-1 font-mono-ui">
                              {isText
                                ? "Text entry"
                                : `${req.allowedFileTypes.join(" · ").toUpperCase()} · max ${req.maxFileSizeMb}MB`}
                              {req.maxAgeMonths ? ` · ≤ ${req.maxAgeMonths}mo old` : ""}
                            </p>
                            {doc?.fileName && !isText && (
                              <p className="text-[12px] text-foreground/80 mt-1.5 truncate flex items-center gap-1.5">
                                <FileText className="h-3 w-3 text-muted-foreground" />
                                {doc.fileName}
                              </p>
                            )}
                          </div>
                        </div>

                        {!isText && (
                          <div className="flex items-center gap-1 shrink-0">
                            <label>
                              <input
                                type="file"
                                className="hidden"
                                accept={req.allowedFileTypes.map((t) => `.${t}`).join(",")}
                                onChange={(e) => handleUpload(req.id, e.target.files?.[0])}
                              />
                              <Button
                                asChild
                                size="sm"
                                variant={doc?.status === "approved" ? "outline" : doc ? "outline" : "default"}
                              >
                                <span className="cursor-pointer">
                                  <Upload className="h-3 w-3" />
                                  {doc ? "Replace" : "Upload"}
                                </span>
                              </Button>
                            </label>
                            {doc && doc.status !== "approved" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeDocument(currentClient.id, doc.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {isText && (
                        <div className="mt-3 pl-12">
                          <TextRequirementEditor
                            placeholder={req.textPlaceholder || "Enter details, one per line"}
                            initialValue={doc?.fileName || ""}
                            onSave={(v) => handleSaveText(req.id, v)}
                            isSaving={isLoading(`save-${req.id}`)}
                            canRemove={!!doc && doc.status !== "approved"}
                            onRemove={() => doc && removeDocument(currentClient.id, doc.id)}
                          />
                        </div>
                      )}

                      {doc?.reviewerComment && doc.status === "rejected" && (
                        <div className="mt-3 ml-12 rounded-lg border border-destructive/30 surface-destructive/30 px-3 py-2 text-[12px] flex gap-2">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{doc.reviewerComment}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* BUSINESS INFO */}
          <TabsContent value="business" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Business information</CardTitle>
                <CardDescription>Brand identity, trading details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cp.businessInformation.reviewerComment && cp.businessInformation.status === "rejected" && (
                  <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-xs text-destructive flex gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{cp.businessInformation.reviewerComment}</span>
                  </div>
                )}

                {/* Brand identity */}
                <div className="rounded-xl border border-border/60 bg-surface-sunken/40 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <p className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">Brand identity</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-start">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-20 w-20 rounded-xl border border-dashed border-border bg-card flex items-center justify-center overflow-hidden">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo preview" className="h-full w-full object-contain" />
                        ) : (
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const reader = new FileReader();
                            reader.onload = () => setLogoUrl(String(reader.result || ""));
                            reader.readAsDataURL(f);
                          }}
                        />
                        <Button asChild size="sm" variant="outline">
                          <span className="cursor-pointer">{logoUrl ? "Replace logo" : "Upload logo"}</span>
                        </Button>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Display name</Label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g., PayFast"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Brand colour</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={brandColor}
                            onChange={(e) => setBrandColor(e.target.value)}
                            className="h-10 w-14 rounded-md border border-border cursor-pointer bg-transparent"
                          />
                          <Input
                            value={brandColor}
                            onChange={(e) => setBrandColor(e.target.value)}
                            className="font-mono-ui"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Legal business name" value={cp.businessInformation.legalBusinessName}
                    onChange={v => updateBusinessInformation(currentClient.id, { legalBusinessName: v })} />
                  <Field label="Industry" value={cp.businessInformation.industry}
                    onChange={v => updateBusinessInformation(currentClient.id, { industry: v })} />
                  <Field label="Category" value={cp.businessInformation.category}
                    onChange={v => updateBusinessInformation(currentClient.id, { category: v })} />
                  <Field label="Business email" type="email" value={cp.businessInformation.businessEmail}
                    onChange={v => updateBusinessInformation(currentClient.id, { businessEmail: v })} />
                  <Field label="Phone number" value={cp.businessInformation.businessPhoneNumber}
                    onChange={v => updateBusinessInformation(currentClient.id, { businessPhoneNumber: v })} />
                </div>
                <div className="space-y-2">
                  <Label>Business description (min. 100 characters)</Label>
                  <Textarea rows={3} value={cp.businessInformation.businessDescription}
                    onChange={e => updateBusinessInformation(currentClient.id, { businessDescription: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Address" value={cp.businessInformation.addressLine1}
                    onChange={v => updateBusinessInformation(currentClient.id, { addressLine1: v })} />
                  <Field label="City" value={cp.businessInformation.city}
                    onChange={v => updateBusinessInformation(currentClient.id, { city: v })} />
                  <Field label="State" value={cp.businessInformation.state}
                    onChange={v => updateBusinessInformation(currentClient.id, { state: v })} />
                  <Field label="Country" value={cp.businessInformation.country}
                    onChange={v => updateBusinessInformation(currentClient.id, { country: v })} />
                </div>
                <Button onClick={submitBusiness} disabled={isLoading("save-business")}>
                  {isLoading("save-business") ? "Submitting..." : "Submit for review"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEAM (people + team management) */}
          <TabsContent value="people" className="m-0">
            <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display">Team</CardTitle>
                  <CardDescription>
                    {cp.businessTypeCode === "BNR" && "Add at least one owner."}
                    {cp.businessTypeCode === "LLC" && "Add at least two directors and any significant shareholders."}
                    {cp.businessTypeCode === "COOP" && "Add at least one authorized representative."}
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => { setEditingPerson(null); setPersonDialog(true); }}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add person
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {cp.people.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">No people added yet.</p>
                )}
                {cp.people.map(p => (
                  <div key={p.id} className="flex items-start justify-between gap-4 p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{p.role.replace("_", " ")}</Badge>
                        {p.isPrimaryRepresentative && <Badge className="text-[10px]">Primary</Badge>}
                        <StatusPill status={p.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {p.nationality} · DOB {p.dateOfBirth}
                        {p.ownershipPercentage ? ` · ${p.ownershipPercentage}% ownership` : ""}
                        · BVN {p.bvnVerified ? "verified" : p.bvnConsentGiven ? "consent given" : "not provided"}
                      </p>
                      {p.reviewerComment && p.status === "rejected" && (
                        <div className="mt-2 p-2 rounded bg-destructive/5 border border-destructive/20 text-xs text-destructive">
                          {p.reviewerComment}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => { setEditingPerson(p); setPersonDialog(true); }}>Edit</Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                        onClick={() => removePerson(currentClient.id, p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Team management — platform users */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display">Team management</CardTitle>
                  <CardDescription>Invite teammates to access this workspace</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowInvite(true)}>
                  <UserPlus className="h-3.5 w-3.5 mr-1" /> Invite user
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {(!currentClient.teamMembers || currentClient.teamMembers.length === 0) && (
                  <p className="text-sm text-muted-foreground py-6 text-center">No teammates invited yet.</p>
                )}
                {currentClient.teamMembers?.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setShowRemoveMember(m.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* BANK ACCOUNT */}
          <TabsContent value="account" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Corporate bank account</CardTitle>
                <CardDescription>Used for settlements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Bank name" value={cp.bankAccount.bankName}
                    onChange={v => updateBankAccount(currentClient.id, { bankName: v })} />
                  <Field label="Account number" value={cp.bankAccount.accountNumber}
                    onChange={v => updateBankAccount(currentClient.id, { accountNumber: v })} />
                  <Field label="Account name (auto-resolved)" value={cp.bankAccount.accountName || ""}
                    onChange={v => updateBankAccount(currentClient.id, { accountName: v })} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={submitBank} disabled={isLoading("save-bank")}>
                    {isLoading("save-bank") ? "Verifying..." : "Verify account"}
                  </Button>
                  <Button variant="outline" onClick={() => updateBankAccount(currentClient.id, { isSkipped: true })}>
                    Skip for now
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Status: <StatusPill status={cp.bankAccount.verificationStatus} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SERVICE AGREEMENT */}
          <TabsContent value="service_agreement" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Service agreement</CardTitle>
                <CardDescription>Rex BaaS Service Agreement {cp.serviceAgreement.agreementVersion}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 max-h-64 overflow-auto text-xs text-muted-foreground space-y-2 bg-muted/20">
                  <p>This Service Agreement governs your use of the Rex BaaS platform, including virtual accounts, transfers, collections, and related APIs.</p>
                  <p>You agree to comply with all CBN regulations, AML/KYC obligations, and to maintain accurate, up-to-date business information.</p>
                  <p>Settlement, fees, dispute handling, data privacy, and termination terms are described in the full agreement.</p>
                  <p>By accepting, you confirm that you are authorized to bind your organization to this agreement.</p>
                </div>
                {cp.serviceAgreement.status === "accepted" ? (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Accepted by {cp.serviceAgreement.acceptedBy} on {new Date(cp.serviceAgreement.acceptedAt!).toLocaleString()}
                  </div>
                ) : (
                  <Button onClick={acceptAgreement} disabled={isLoading("accept-agreement")}>
                    {isLoading("accept-agreement") ? "Submitting..." : "I agree and accept"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUMMARY */}
          <TabsContent value="summary" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Summary</CardTitle>
                <CardDescription>Overview of your compliance status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {SECTION_ORDER.filter(s => s.key !== "summary").map(s => {
                  const sectionStatus =
                    s.key === "documents" ? `${approvedDocs}/${requiredCount} approved`
                    : s.key === "business" ? cp.businessInformation.status
                    : s.key === "people" ? `${cp.people.length} people · ${currentClient.teamMembers?.length || 0} teammates`
                    : s.key === "account" ? cp.bankAccount.verificationStatus
                    : cp.serviceAgreement.status;
                  return (
                    <div key={s.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <s.icon className="h-4 w-4 text-muted-foreground" /> {s.label}
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">{String(sectionStatus).replace("_", " ")}</span>
                    </div>
                  );
                })}
                <div className="pt-3 border-t flex items-center justify-between">
                  <p className="text-sm">Live access</p>
                  {cp.goLiveEligible
                    ? <StatusPill status="approved" />
                    : <span className="text-xs text-muted-foreground">Locked until all required items are approved</span>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Person Dialog */}
      <PersonDialog
        open={personDialog}
        onClose={() => { setPersonDialog(false); setEditingPerson(null); }}
        existing={editingPerson}
        businessTypeCode={cp.businessTypeCode}
        onSave={handleSavePerson}
        loading={isLoading("save-person")}
      />

      {/* Invite Team Member */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Invite team member</DialogTitle>
            <DialogDescription>Send an invitation to join your workspace</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email address</Label>
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.ng"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "Admin" | "Developer" | "Viewer")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={handleInviteMember} disabled={isLoading("invite-member") || !inviteEmail}>
              {isLoading("invite-member") ? "Sending..." : "Send invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Team Member */}
      <Dialog open={!!showRemoveMember} onOpenChange={() => setShowRemoveMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Remove team member</DialogTitle>
            <DialogDescription>This will revoke their access immediately.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveMember(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => showRemoveMember && handleRemoveMember(showRemoveMember)}
              disabled={isLoading("remove-member")}
            >
              {isLoading("remove-member") ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="font-display text-[15px] font-medium tabular-nums mt-1">{value}</p>
    </div>
  );
}

function TextRequirementEditor({
  placeholder, initialValue, onSave, isSaving, canRemove, onRemove,
}: {
  placeholder: string;
  initialValue: string;
  onSave: (value: string) => void;
  isSaving: boolean;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const [val, setVal] = useState(initialValue);
  const dirty = val.trim() !== initialValue.trim();
  return (
    <div className="space-y-2">
      <Textarea
        rows={4}
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => onSave(val)}
          disabled={isSaving || !dirty || !val.trim()}
        >
          {isSaving ? "Saving..." : initialValue ? "Update" : "Save"}
        </Button>
        {canRemove && (
          <Button size="sm" variant="ghost" className="text-destructive" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}

function PersonDialog({
  open, onClose, existing, businessTypeCode, onSave, loading,
}: {
  open: boolean; onClose: () => void; existing: BusinessPerson | null;
  businessTypeCode: BusinessTypeCode; onSave: (p: BusinessPerson) => void; loading: boolean;
}) {
  const defaultRole: PersonRole =
    businessTypeCode === "BNR" ? "owner"
    : businessTypeCode === "COOP" ? "signatory" : "director";

  const [form, setForm] = useState<BusinessPerson>(existing || {
    id: `bp-${Date.now()}`, firstName: "", lastName: "", dateOfBirth: "",
    nationality: "Nigerian", role: defaultRole, isPrimaryRepresentative: false,
    bvnConsentGiven: false, bvnVerified: false, status: "in_progress",
  });

  // sync when existing changes
  useMemo(() => {
    if (existing) setForm(existing);
    else setForm({
      id: `bp-${Date.now()}`, firstName: "", lastName: "", dateOfBirth: "",
      nationality: "Nigerian", role: defaultRole, isPrimaryRepresentative: false,
      bvnConsentGiven: false, bvnVerified: false, status: "in_progress",
    });
  }, [existing, open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{existing ? "Edit person" : "Add person"}</DialogTitle>
          <DialogDescription>Owner, director, shareholder or authorized representative</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">First name</Label>
              <Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Last name</Label>
              <Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Date of birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Nationality</Label>
              <Input value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as PersonRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="shareholder">Shareholder</SelectItem>
                  <SelectItem value="authorized_representative">Authorized Representative</SelectItem>
                  <SelectItem value="signatory">Signatory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.role === "shareholder" && (
              <div className="space-y-1.5"><Label className="text-xs">Ownership %</Label>
                <Input type="number" min={1} max={100} value={form.ownershipPercentage || ""}
                  onChange={e => setForm({ ...form, ownershipPercentage: Number(e.target.value) })} /></div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.isPrimaryRepresentative}
              onChange={e => setForm({ ...form, isPrimaryRepresentative: e.target.checked })} />
            <span>Primary representative</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={form.bvnConsentGiven}
              onChange={e => setForm({ ...form, bvnConsentGiven: e.target.checked })} />
            <span>I give consent to verify BVN</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={loading || !form.firstName || !form.lastName}
            onClick={() => onSave(form)}>
            {loading ? 
            <> <Spinner /> Saving... </>
            : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CompliancePage;
