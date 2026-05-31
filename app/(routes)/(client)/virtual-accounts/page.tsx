"use client"
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatNaira, downloadCSV } from "@/lib/formatters";
import { usePlatform } from "@/context/platform-context";
import { useActionState } from "@/hooks/use-action-state";
import { Eye, Power, PowerOff, Download, ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { VirtualAccount } from "@/types/platform";
import { Spinner } from "@/components/ui/spinner";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { getVirtualAccountsQueryFn } from "@/lib/api-mutations";

const VirtualAccountsPage = () => {
  const { currentClientId,updateVirtualAccount, virtualAccounts,transactions } = usePlatform();
    const accounts = virtualAccounts.filter(a => a.clientId === currentClientId);
  const { executeAction, isLoading } = useActionState();
  const virtualAccountsQuery = useQuery({
    queryKey: ["virtual-accounts"],
    queryFn: getVirtualAccountsQueryFn,
  });

  const [selectedAccount, setSelectedAccount] = useState<VirtualAccount | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "activate" | "deactivate" } | null>(null);

  const handleToggleStatus = () => {
    if (!confirmAction) return;
    const newStatus = confirmAction.action === "activate" ? "active" : "inactive";
    executeAction(`toggle-${confirmAction.id}`, () => {
      updateVirtualAccount(confirmAction.id, { status: newStatus });
      if (selectedAccount?.id === confirmAction.id) {
        setSelectedAccount(prev => prev ? { ...prev, status: newStatus } : null);
      }
      setConfirmAction(null);
    }, `Account ${confirmAction.action}d successfully`);
  };

  const accountTxns = selectedAccount
    ? transactions.slice(0, 10)
    : [];

  const handleExportTxns = () => {
    downloadCSV(accountTxns.map(t => ({
      Reference: t.reference,
      Type: t.type,
      Amount: t.amount,
      Status: t.status,
      Date: t.createdAt,
      Sender: t.senderName,
      Recipient: t.recipientName,
    })), `rex-va-transactions-${selectedAccount?.accountNumber}.csv`);
  };

  const virtual_accountData = virtualAccountsQuery.data?.data ?? []
  const columns: ColumnDef<VirtualAccount, unknown>[] = [
    {
      accessorKey: "accountName",
      header: "Account Name",
      cell: ({ row }) => <span className="font-medium">{row.original.accountName}</span>,
    },
    {
      accessorKey: "accountNumber",
      header: "Account Number",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.accountNumber}</span>,
    },
    {
      accessorKey: "bankName",
      header: "Bank",
      cell: ({ row }) => <span>{row.original.bankName}</span>,
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => <span className="font-medium">{formatNaira(row.original.balance)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={row.original.status === "active" ? "bg-success" : "bg-muted"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => <span>{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setSelectedAccount(row.original)}>
            <Eye className="h-3.5 w-3.5 mr-1" /> View
          </Button>
          {row.original.status === "active" ? (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirmAction({ id: row.original.id, action: "deactivate" })}>
              <PowerOff className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="text-success" onClick={() => setConfirmAction({ id: row.original.id, action: "activate" })}>
              <Power className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (selectedAccount) {
    const freshAccount = accounts.find(a => a.id === selectedAccount.id) || selectedAccount;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedAccount(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">{freshAccount.accountName}</h1>
            <p className="text-muted-foreground text-sm">Rex Virtual Account Details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Balance</p>
              <p className="text-2xl font-display font-bold mt-1">{formatNaira(freshAccount.balance)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Account Number</p>
              <p className="text-2xl font-display font-bold mt-1 font-mono">{freshAccount.accountNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">{freshAccount.bankName}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge className={freshAccount.status === "active" ? "bg-success" : "bg-muted"}>{freshAccount.status}</Badge>
                {freshAccount.status === "active" ? (
                  <Button variant="outline" size="sm" onClick={() => setConfirmAction({ id: freshAccount.id, action: "deactivate" })}>
                    <PowerOff className="h-3 w-3 mr-1" /> Deactivate
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setConfirmAction({ id: freshAccount.id, action: "activate" })}>
                    <Power className="h-3 w-3 mr-1" /> Activate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between py-2 border-b"><span className="text-sm text-muted-foreground">Wallet Reference</span><span className="text-sm font-mono font-medium">{freshAccount.walletReference}</span></div>
            <div className="flex justify-between py-2 border-b"><span className="text-sm text-muted-foreground">Provider</span><span className="text-sm font-medium">Rex</span></div>
            <div className="flex justify-between py-2"><span className="text-sm text-muted-foreground">Created</span><span className="text-sm font-medium">{formatDate(freshAccount.createdAt)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-display">Transaction History</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportTxns}>
              <Download className="h-3 w-3 mr-1" /> Export CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountTxns.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.reference.substring(0, 16)}…</TableCell>
                    <TableCell className="capitalize">{t.type}</TableCell>
                    <TableCell>{formatNaira(t.amount)}</TableCell>
                    <TableCell><StatusBadge status={t.status} type="transaction" /></TableCell>
                    <TableCell>{formatDate(t.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {accountTxns.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No transactions</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Confirm Activate/Deactivate Modal */}
        <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display capitalize">{confirmAction?.action} Rex Account</DialogTitle>
              <DialogDescription>
                {confirmAction?.action === "deactivate"
                  ? "This will stop all incoming payments to this Rex virtual account. You can reactivate it later."
                  : "This will enable incoming payments to this Rex virtual account."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
              <Button
                variant={confirmAction?.action === "deactivate" ? "destructive" : "default"}
                className={confirmAction?.action === "activate" ? "gradient-primary text-primary-foreground" : ""}
                onClick={handleToggleStatus}
                disabled={isLoading(`toggle-${confirmAction?.id}`)}
              >
                {isLoading(`toggle-${confirmAction?.id}`) ? <> <Spinner /> Processing...</> : `${confirmAction?.action === "activate" ? "Activate" : "Deactivate"} Account`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Rex Virtual Accounts</h1>
          <p className="text-muted-foreground text-sm">{virtual_accountData?.length || 0} accounts powered by Rex</p>
        </div>
      </div>
      <DataTable
        data={virtual_accountData}
        columns={columns}
        showSearch={false}
        isShowPagination={false}
        isLoading={virtualAccountsQuery.isLoading || virtualAccountsQuery.isFetching}
        emptyTitle="No Rex virtual accounts yet"
        emptyDescription="No virtual accounts were returned for this client."
        tableClassName="rounded-lg"
      />

      {/* Confirm Modal for list actions */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display capitalize">{confirmAction?.action} Rex Account</DialogTitle>
            <DialogDescription>
              {confirmAction?.action === "deactivate"
                ? "This will stop all incoming payments to this Rex virtual account."
                : "This will enable incoming payments to this Rex virtual account."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction?.action === "deactivate" ? "destructive" : "default"}
              className={confirmAction?.action === "activate" ? "gradient-primary text-primary-foreground" : ""}
              onClick={handleToggleStatus}
              disabled={isLoading(`toggle-${confirmAction?.id}`)}
            >
              {isLoading(`toggle-${confirmAction?.id}`) ? <> <Spinner /> Processing...</> : `${confirmAction?.action === "activate" ? "Activate" : "Deactivate"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VirtualAccountsPage;
