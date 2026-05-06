"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Building2, Rocket, Globe } from "lucide-react";
import Logo from "@/components/logo";

const TYPES = [
  { icon: User, label: "Individual", desc: "Personal use, freelancers, or testing", value: "individual" },
  { icon: Building2, label: "Business", desc: "Registered businesses (BNR, LLC, Cooperative)", value: "business" },
  { icon: Rocket, label: "Fintech / Startup", desc: "Building a financial product using Rex APIs", value: "fintech" },
  { icon: Globe, label: "Enterprise / Partner", desc: "Large organizations or integration partners", value: "enterprise" },
];

const AccountTypePage = () => {
   const router = useRouter();
  const [selected, setSelected] = useState("");

  const handleContinue = () => {
    // Mark first-login welcome modal eligibility
    localStorage.setItem("rex-first-login", "true");
    router.push("/dashboard");
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
          <span className="h-1.5 w-8 rounded-full bg-primary" />
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">What type of account?</CardTitle>
            <CardDescription>Select the option that best describes you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  className={`flex flex-col items-center gap-2 p-5 rounded-lg border-2 text-center transition-all ${
                    selected === t.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                  onClick={() => setSelected(t.value)}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    selected === t.value ? "gradient-primary" : "bg-muted"
                  }`}>
                    <t.icon className={`h-6 w-6 ${selected === t.value ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <span className="font-medium text-sm">{t.label}</span>
                  <span className="text-xs text-muted-foreground">{t.desc}</span>
                </button>
              ))}
            </div>

            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleContinue} disabled={!selected}>
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
  )
}

export default AccountTypePage