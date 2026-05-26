"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, AlertTriangle } from "lucide-react";

import { DataTable, type ColumnDef } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { usePlatform } from "@/context/platform-context";
import { toast } from "@/hooks/use-toast";
import { createApiKeysAction, getApiKeysAction } from "@/lib/api-key-actions";
import { maskKey } from "@/lib/formatters";

type ApiKeyRow = {
  id: "publicKey" | "secretKey";
  name: string;
  key: string;
  status: "active";
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Please try again";
};

const ApiKeysPage = () => {
  const { environment, canAccessLive } = usePlatform();
  const queryClient = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);

  const apiKeysQuery = useQuery({
    queryKey: ["api-keys"],
    queryFn: getApiKeysAction,
  });

  const createApiKeysMutation = useMutation({
    mutationFn: createApiKeysAction,
    onSuccess: (response) => {
      if (!response.success) {
        toast({
          title: "Unable to generate API keys",
          description: response.message || "Please try again",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "API keys generated",
        description: response.message || "Your API keys are ready.",
        variant: "success",
      });
      setShowGenerate(false);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (error) => {
      toast({
        title: "Unable to generate API keys",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const rows: ApiKeyRow[] = apiKeysQuery.data?.data
    ? [
        {
          id: "publicKey",
          name: "Public Key",
          key: apiKeysQuery.data.data.publicKey,
          status: "active",
        },
        {
          id: "secretKey",
          name: "Secret Key",
          key: apiKeysQuery.data.data.secretKey,
          status: "active",
        },
      ].filter((row) => row.key)
    : [];

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
      variant: "success",
    });
  };

  const handleGenerate = () => {
    if (environment === "live" && !canAccessLive) {
      toast({
        title: "Live access restricted",
        description: "Complete onboarding before generating live API keys.",
        variant: "destructive",
      });
      return;
    }

    createApiKeysMutation.mutate();
  };

  const columns: ColumnDef<ApiKeyRow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "key",
      header: "Key",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-xs">
          {maskKey(row.original.key)}
        </code>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: () => (
        <Badge variant="default" className="bg-success">
          Active
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => copyKey(row.original.key)}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">API Keys</h1>
          <p className="text-muted-foreground text-sm">
            Manage your API credentials.
          </p>
        </div>
        <Button
          className="gradient-primary text-primary-foreground"
          onClick={() => setShowGenerate(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Generate Key
        </Button>
      </div>

      {environment === "live" && !canAccessLive && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium">
              You must complete onboarding before accessing live environment.
            </p>
            <p className="text-xs text-muted-foreground">
              Switch to sandbox to use your test keys.
            </p>
          </div>
        </div>
      )}

      <DataTable
        data={rows}
        columns={columns}
        showSearch={false}
        isShowPagination={false}
        isLoading={apiKeysQuery.isLoading || apiKeysQuery.isFetching}
        emptyTitle="No API keys"
        emptyDescription={`No API keys for ${environment} environment.`}
        tableClassName="rounded-lg"
      />

      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Generate API Keys</DialogTitle>
            <DialogDescription>
              Create public and secret keys for your integration.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerate(false)}
              disabled={createApiKeysMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="gradient-primary text-primary-foreground"
              onClick={handleGenerate}
              disabled={createApiKeysMutation.isPending}
            >
              {createApiKeysMutation.isPending ? (
                <>
                  <Spinner /> Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeysPage;
