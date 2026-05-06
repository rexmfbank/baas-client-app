"use client"

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Search, Download, Eye, AlertTriangle } from "lucide-react";
import { usePlatform } from "@/context/platform-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { usePagination } from "@/hooks/use-pagination";
import { formatNaira, formatDateTime, downloadCSV } from "@/lib/formatters";
import { useActionState } from "@/hooks/use-action-state";
import {  Transaction } from "@/types/platform";
import { Spinner } from "@/components/ui/spinner";

const TransactionsPage = ()=> {
  const { transactions, environment, currentClientId, addDispute } = usePlatform();
  const { executeAction, isLoading } = useActionState();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const filtered = transactions
    .filter(t => t.environment === environment && t.clientId === currentClientId)
    .filter(t => statusFilter === "all" || t.status === statusFilter)
    .filter(t => !search || t.reference.toLowerCase().includes(search.toLowerCase()) || t.recipientName.toLowerCase().includes(search.toLowerCase()));

  const { currentPage, totalPages, startIndex, endIndex, goToPage } = usePagination({ totalItems: filtered.length });
  const paged = filtered.slice(startIndex, endIndex);

  const handleExport = () => {
    downloadCSV(filtered.map(t => ({ Reference: t.reference, Type: t.type, Amount: t.amount, Status: t.status, Recipient: t.recipientName, Date: t.createdAt })), "transactions.csv");
    toast({ title: "Exported", description: "CSV downloaded", variant:"success" });
  };

  const handleRaiseDispute = () => {
    if (!selectedTxn) return;
    executeAction("raise-dispute", () => {
      addDispute({
        id: `dsp-${Date.now()}`,
        transactionId: selectedTxn.id,
        clientId: currentClientId,
        clientName: selectedTxn.clientName,
        reason: disputeReason,
        status: "open",
        amount: selectedTxn.amount,
        currency: "NGN",
        createdAt: new Date().toISOString(),
      });
      setShowDispute(false);
      setDisputeReason("");
      setSelectedTxn(null);
    }, "Dispute raised successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Transactions</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} transactions</p>
        </div>
        <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by reference or recipient..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="successful">Successful</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="reversed">Reversed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map(txn => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-xs">{txn.reference.substring(0, 20)}...</TableCell>
                  <TableCell className="capitalize text-sm">{txn.type}</TableCell>
                  <TableCell className="text-sm">{txn.recipientName}</TableCell>
                  <TableCell className="font-medium text-sm">{formatNaira(txn.amount)}</TableCell>
                  <TableCell><StatusBadge status={txn.status} type="transaction" /></TableCell>
                  <TableCell className="text-sm">{formatDateTime(txn.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedTxn(txn)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {txn.status === "successful" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-warning" onClick={() => { setSelectedTxn(txn); setShowDispute(true); }}>
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />

      {/* Transaction Detail */}
      <Dialog open={!!selectedTxn && !showDispute} onOpenChange={() => setSelectedTxn(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Transaction Details</DialogTitle></DialogHeader>
          {selectedTxn && (
            <div className="space-y-3">
              {[
                ["Reference", selectedTxn.reference],
                ["Type", selectedTxn.type],
                ["Amount", formatNaira(selectedTxn.amount)],
                ["Status", selectedTxn.status],
                ["Sender", `${selectedTxn.senderName} (${selectedTxn.senderBank})`],
                ["Recipient", `${selectedTxn.recipientName} (${selectedTxn.recipientBank})`],
                ["Narration", selectedTxn.narration],
                ["Date", formatDateTime(selectedTxn.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium capitalize">{value}</span>
                </div>
              ))}
              {selectedTxn.status === "successful" && (
                <Button variant="outline" className="w-full" onClick={() => setShowDispute(true)}>
                  <AlertTriangle className="mr-2 h-4 w-4" /> Raise Dispute
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dispute Modal */}
      <Dialog open={showDispute} onOpenChange={v => { setShowDispute(v); if (!v) setDisputeReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Raise Dispute</DialogTitle>
            <DialogDescription>Describe the issue with this transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTxn && <p className="text-sm"><span className="text-muted-foreground">Transaction:</span> <span className="font-mono">{selectedTxn.reference}</span></p>}
            <Input placeholder="Reason for dispute" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDispute(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={handleRaiseDispute} disabled={isLoading("raise-dispute") || !disputeReason}>
              {isLoading("raise-dispute") ? <><Spinner /> Submitting...</> : "Submit Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TransactionsPage;
