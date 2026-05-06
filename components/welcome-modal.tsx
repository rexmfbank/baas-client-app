"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rocket, BookOpen } from "lucide-react";

const STORAGE_KEY = "rex-welcome-dismissed";
const TRIGGER_KEY = "rex-first-login";

const WelcomeModal =()=> {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const triggered = localStorage.getItem(TRIGGER_KEY) === "true";
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    if (triggered && !dismissed) {
      // Defer slightly so dashboard mounts first
      const t = setTimeout(() => setOpen(true), 350);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.removeItem(TRIGGER_KEY);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mb-2">
            <Rocket className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogTitle className="font-display text-2xl">Welcome to Rex BaaS 🚀</DialogTitle>
          <DialogDescription className="text-center">
            Start building financial products effortlessly. Explore APIs, test in sandbox, and go live when you're ready.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            className="w-full gradient-primary text-primary-foreground"
            onClick={() => { dismiss(); }}
          >
            Explore Dashboard
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => { dismiss(); router.push("/api-docs"); }}
          >
            <BookOpen className="mr-2 h-4 w-4" /> View API Docs
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={dismiss}>
            Skip for now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default WelcomeModal;