"use client"
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePlatform } from "@/context/platform-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "@/hooks/use-action-state";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, TestTube, RotateCcw, Pencil, Check, X } from "lucide-react";
import { Webhook } from "@/types/platform";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { createWebhookMutationFn } from "@/lib/api-mutations";

const WebhooksPage = () => {
  const { webhooks, removeWebhook, updateWebhook, currentClientId } = usePlatform();
  const { executeAction, isLoading } = useActionState();
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const createWebhookMutation = useMutation({
    mutationFn: createWebhookMutationFn,
    onSuccess: (response) => {
      if (!response.success) {
        toast({
          title: "Error",
          description: response.message || "Failed to create webhook, Try again.",
          variant: "destructive",
        });
        return;
      }
      setShowAdd(false);
      setUrl("");
      toast({
        title: "Success",
        description: response.message || "Webhook added successfully.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create webhook. Try again.",
        variant: "destructive",
      });
    },
  });

  const clientWebhooks = webhooks.filter(w => w.clientId === currentClientId);
  //const hasWebhook = clientWebhooks.length > 0;

  const handleAdd = () => {
    createWebhookMutation.mutate({ webhookUrl: url });
  };

  const handleTest = (whId: string) => {
    executeAction(`test-${whId}`, () => {}, "Test webhook delivered successfully");
  };

  const handleRetry = (whId: string) => {
    executeAction(`retry-${whId}`, () => {}, "Webhook delivery retried");
  };

  const startEdit = (wh: Webhook) => {
    setEditingId(wh.id);
    setEditUrl(wh.url);
  };

  const saveEdit = (whId: string) => {
    executeAction(`edit-${whId}`, () => {
      updateWebhook(whId, { url: editUrl });
      setEditingId(null);
    }, "Webhook URL updated");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Webhooks</h1>
          <p className="text-muted-foreground text-sm">Receive real-time notifications for all Rex MFB events</p>
        </div>
      
        <Button className="gradient-primary text-primary-foreground" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Webhook
        </Button>
        
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientWebhooks.map(wh => (
                <TableRow key={wh.id}>
                  <TableCell className="font-mono text-xs max-w-[250px]">
                    {editingId === wh.id ? (
                      <div className="flex items-center gap-1">
                        <Input className="h-7 text-xs font-mono" value={editUrl} onChange={e => setEditUrl(e.target.value)} />
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success" onClick={() => saveEdit(wh.id)} disabled={isLoading(`edit-${wh.id}`)}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="truncate">{wh.url}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => startEdit(wh)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">All Events</Badge></TableCell>
                  <TableCell><Badge className={wh.isActive ? "bg-success" : "bg-muted"}>{wh.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell>{wh.successRate.toFixed(1)}%</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleTest(wh.id)} disabled={isLoading(`test-${wh.id}`)}>
                        {isLoading(`test-${wh.id}`) ? <Spinner /> : <TestTube className="h-3.5 w-3.5 mr-1" />  }
                        Test
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRetry(wh.id)} disabled={isLoading(`retry-${wh.id}`)}>
                        {isLoading(`retry-${wh.id}`) ? <Spinner /> : <RotateCcw className="h-3.5 w-3.5 mr-1" />  }
                        Retry
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeWebhook(wh.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clientWebhooks.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No webhooks configured. Add one to receive event notifications.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Add Webhook</DialogTitle>
            <DialogDescription>Add a webhook endpoint to receive all Rex MFB events automatically</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-api.com/webhooks" />
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">All events included</p>
              <p>Rex MFB automatically delivers all event types to your webhook endpoint including transactions, transfers, wallets, disputes, and more.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleAdd} disabled={createWebhookMutation.isPending || !url}>
              {createWebhookMutation.isPending ? 
              <><Spinner/> Adding...</>
              : "Add Webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WebhooksPage;


