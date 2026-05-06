"use client"

import { useState } from "react";
import { usePlatform } from "@/context/platform-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionState } from "@/hooks/use-action-state";
import { maskKey, formatDate } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ApiKey } from "@/types/platform";

const ApiKeysPage = () => {
  const { apiKeys, addApiKey, revokeApiKey, environment, currentClientId, canAccessLive } = usePlatform();
  const { executeAction, isLoading } = useActionState();
  const [showGenerate, setShowGenerate] = useState(false);
  const [showRevoke, setShowRevoke] = useState<string | null>(null);
  const [keyName, setKeyName] = useState("");
  const [keyEnv, setKeyEnv] = useState(environment);

  const clientKeys = apiKeys.filter(k => k.clientId === currentClientId && k.environment === environment);

  const handleGenerate = () => {
    if (keyEnv === "live" && !canAccessLive) {
      toast({ title: "Live access restricted", description: "Complete onboarding before generating live API keys.", variant: "destructive" });
      return;
    }
    executeAction("generate-key", () => {
      const newKey: ApiKey = {
        id: `key-${Date.now()}`,
        clientId: currentClientId,
        name: keyName || "New API Key",
        key: `sk_${keyEnv === "sandbox" ? "test" : "live"}_${Math.random().toString(36).substring(2, 18)}`,
        environment: keyEnv,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      addApiKey(newKey);
      setShowGenerate(false);
      setKeyName("");
    }, "API key generated successfully");
  };

  const handleRevoke = (keyId: string) => {
    executeAction("revoke-key", () => {
      revokeApiKey(keyId);
      setShowRevoke(null);
    }, "API key revoked");
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ 
        title: "Copied", 
        description: "API key copied to clipboard",
         variant:"success"
 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">API Keys</h1>
          <p className="text-muted-foreground text-sm">Manage your API credentials — sandbox keys are auto-generated</p>
        </div>
        <Button className="gradient-primary text-primary-foreground" onClick={() => setShowGenerate(true)}>
          <Plus className="mr-2 h-4 w-4" /> Generate Key
        </Button>
      </div>

      {environment === "live" && !canAccessLive && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-medium">You must complete onboarding before accessing live environment.</p>
            <p className="text-xs text-muted-foreground">Switch to sandbox to use your auto-generated test keys.</p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientKeys.map(k => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{maskKey(k.key)}</code></TableCell>
                  <TableCell className="text-sm">{formatDate(k.createdAt)}</TableCell>
                  <TableCell className="text-sm">{k.lastUsed ? formatDate(k.lastUsed) : "Never"}</TableCell>
                  <TableCell>
                    <Badge variant={k.isActive ? "default" : "secondary"} className={k.isActive ? "bg-success" : ""}>
                      {k.isActive ? "Active" : "Revoked"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyKey(k.key)}><Copy className="h-3.5 w-3.5" /></Button>
                      {k.isActive && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setShowRevoke(k.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clientKeys.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No API keys for {environment} environment.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Generate API Key</DialogTitle>
            <DialogDescription>Create a new API key for your integration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Key Name</Label><Input value={keyName} onChange={e => setKeyName(e.target.value)} placeholder="e.g., Production Key" /></div>
            <div className="space-y-2">
              <Label>Environment</Label>
              <Select value={keyEnv} onValueChange={v => setKeyEnv(v as "sandbox" | "live")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="live" disabled={!canAccessLive}>Live {!canAccessLive && "(requires onboarding)"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerate(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleGenerate} disabled={isLoading("generate-key")}>
              {isLoading("generate-key") ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showRevoke} onOpenChange={() => setShowRevoke(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Revoke API Key</DialogTitle>
            <DialogDescription>This action cannot be undone. Any integrations using this key will stop working.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevoke(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => showRevoke && handleRevoke(showRevoke)} disabled={isLoading("revoke-key")}>
              {isLoading("revoke-key") ? "Revoking..." : "Revoke Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ApiKeysPage;
