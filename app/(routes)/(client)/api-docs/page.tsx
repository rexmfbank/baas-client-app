"use client"
import { useState } from "react";
import { ExternalLink, Play, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { API_ENDPOINTS } from "@/data/mock-data";
import { useActionState } from "@/hooks/use-action-state";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-success/10 text-success",
  POST: "bg-primary/10 text-primary",
  PUT: "bg-warning/10 text-warning",
  DELETE: "bg-destructive/10 text-destructive",
};

const sampleBodies: Record<string, string> = {
  "/v1/transfers": '{\n  "account_number": "0123456789",\n  "bank_code": "058",\n  "amount": 50000,\n  "currency": "NGN"\n}',
  "/v1/virtual-accounts": '{\n  "account_name": "Test User",\n  "bvn": "12345678901",\n  "provider": "rex"\n}',
  "/v1/wallets": '{\n  "customer_name": "Test Customer",\n  "email": "test@example.com"\n}',
};

const sampleResponses: Record<string, string> = {
  "/v1/transfers": '{\n  "status": "success",\n  "message": "Transfer initiated",\n  "data": {\n    "id": "txn_sandbox_001",\n    "status": "pending",\n    "amount": 50000,\n    "reference": "SBX-REF-001"\n  }\n}',
  "/v1/virtual-accounts": '{\n  "status": "success",\n  "data": {\n    "account_number": "7700000001",\n    "bank_name": "Rex MFB",\n    "account_name": "Test User",\n    "provider": "rex"\n  }\n}',
  "/v1/wallets": '{\n  "status": "success",\n  "data": {\n    "wallet_id": "wal_xyz789",\n    "balance": 0,\n    "currency": "NGN"\n  }\n}',
};

const DOC_LINKS: Record<string, string> = {
  "/v1/transfers": "https://docs.rexmfb.com/api/transfers",
  "/v1/transfers/:id": "https://docs.rexmfb.com/api/transfers#get-transfer",
  "/v1/virtual-accounts": "https://docs.rexmfb.com/api/virtual-accounts",
  "/v1/wallets": "https://docs.rexmfb.com/api/wallets",
  "/v1/wallets/:id/balance": "https://docs.rexmfb.com/api/wallets#balance",
  "/v1/collections": "https://docs.rexmfb.com/api/collections",
  "/v1/transactions": "https://docs.rexmfb.com/api/transactions",
  "/v1/identity/verify-bvn": "https://docs.rexmfb.com/api/identity",
  "/v1/webhooks": "https://docs.rexmfb.com/api/webhooks",
};

const ApiDocsPage = () => {
  const { executeAction, isLoading } = useActionState();
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0].path);
  const [body, setBody] = useState(sampleBodies[API_ENDPOINTS[0].path] || "{}");
  const [response, setResponse] = useState<string | null>(null);

  const endpoint = API_ENDPOINTS.find(e => e.path === selectedEndpoint);

  const handleSend = () => {
    executeAction("send-request", () => {
      setResponse(sampleResponses[selectedEndpoint] || '{\n  "status": "success",\n  "message": "Request processed",\n  "data": {}\n}');
    }, "Request sent successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">API Documentation & Sandbox</h1>
        <p className="text-muted-foreground text-sm">Explore endpoints and test them in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: API Documentation */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Endpoints</h2>
          {API_ENDPOINTS.map(ep => (
            <div
              key={ep.path}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/30 ${selectedEndpoint === ep.path ? "border-primary bg-primary/5" : ""}`}
              onClick={() => { setSelectedEndpoint(ep.path); setBody(sampleBodies[ep.path] || "{}"); setResponse(null); }}
            >
              <div className="flex items-center gap-2">
                <Badge className={`${METHOD_COLORS[ep.method]} font-mono text-[10px] px-1.5`}>{ep.method}</Badge>
                <code className="text-xs font-mono">{ep.path}</code>
              </div>
              <a
                href={DOC_LINKS[ep.path] || "https://docs.rexmfb.com"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-3">Click <ExternalLink className="h-3 w-3 inline" /> to view full documentation</p>
        </div>

        {/* Right: Sandbox Explorer */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">Sandbox Explorer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 items-center">
                <Badge className="bg-primary/10 text-primary font-mono shrink-0">{endpoint?.method}</Badge>
                <Select value={selectedEndpoint} onValueChange={v => { setSelectedEndpoint(v); setBody(sampleBodies[v] || "{}"); setResponse(null); }}>
                  <SelectTrigger className="text-xs font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent>{API_ENDPOINTS.map(e => <SelectItem key={e.path} value={e.path}>{e.path}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Textarea className="font-mono text-xs min-h-[160px]" value={body} onChange={e => setBody(e.target.value)} />
              <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSend} disabled={isLoading("send-request")}>
                {isLoading("send-request") ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Play className="mr-2 h-4 w-4" /> Send Request</>}
              </Button>
            </CardContent>
          </Card>

          {response && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">Response <Badge className="bg-success/10 text-success">200 OK</Badge></CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto">{response}</pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiDocsPage;