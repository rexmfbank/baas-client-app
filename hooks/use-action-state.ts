import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export function useActionState() {
  const [loading, setLoading] = useState<string | null>(null);

  const executeAction = useCallback(async (
    actionId: string,
    action: () => void | Promise<void>,
    successMessage: string,
    errorMessage?: string
  ) => {
    setLoading(actionId);
    try {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
      await action();
      toast({ title: "Success", description: successMessage, variant: "success" });
    } catch {
      toast({ title: "Error", description: errorMessage || "Something went wrong. Try again.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }, []);

  return { loading, executeAction, isLoading: (id: string) => loading === id };
}
