"use client"
import { useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, CreditCard, Wallet, Landmark, Globe2, Store, Compass, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/logo";

const INTENTS = [
  { icon: CreditCard, label: "Payments", desc: "Collections, transfers", value: "payments" },
  { icon: Wallet, label: "Savings / Wallets", desc: "Hold and manage funds", value: "wallets" },
  { icon: Landmark, label: "Lending / Credit", desc: "Loans, BNPL, credit lines", value: "lending" },
  { icon: Globe2, label: "Cross-border / FX", desc: "International payouts", value: "cross-border" },
  { icon: Store, label: "Marketplace / Platform", desc: "Multi-party payments", value: "marketplace" },
  { icon: Compass, label: "Just exploring", desc: "Browsing capabilities", value: "exploring" },
];

function IntentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetIntent = searchParams.get("intent") || "";
  const [selected, setSelected] = useState<string[]>(presetIntent ? [presetIntent] : []);

  const toggle = (value: string) => {
    setSelected(prev => prev.includes(value) ?
     prev.filter(v => v !== value) : [...prev, value]);
  };

  const handleContinue = () => {
    const params = new URLSearchParams();
    selected.forEach(intent => params.append("intents", intent));
    router.push(`/account-type?${params.toString()}`);
  };
  return (
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="h-1.5 w-8 rounded-full bg-primary" />
          <span className="h-1.5 w-8 rounded-full bg-primary" />
          <span className="h-1.5 w-8 rounded-full bg-muted" />
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">What are you trying to build?</CardTitle>
            <CardDescription>Select all that apply — this helps us personalize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              {INTENTS.map(intent => {
                const isSelected = selected.includes(intent.value);
                return (
                  <button
                    key={intent.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                    onClick={() => toggle(intent.value)}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "gradient-primary" : "bg-muted"
                    }`}>
                      <intent.icon className={`h-5 w-5 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{intent.label}</p>
                      <p className="text-xs text-muted-foreground">{intent.desc}</p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>

            <Button className="w-full gradient-primary text-primary-foreground" 
            onClick={handleContinue} disabled={selected.length === 0}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button variant="ghost" className="w-full text-muted-foreground" 
            onClick={() => router.push("/account-type")}>
              Skip for now
            </Button>
          </CardContent>
        </Card>
      </div>
  );
}

const IntentPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IntentContent />
    </Suspense>
  );
};

export default IntentPage;