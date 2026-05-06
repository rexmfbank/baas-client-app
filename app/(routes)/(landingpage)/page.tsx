"use client"
import Footer from "@/components/footer";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
    CreditCard,
    ArrowRightLeft,
    Wallet,
    Code2,
    ArrowRight,
    CheckCircle,
    Rocket,
    Building2,
    Globe
} from "lucide-react";
import Navigation from "@/components/navigation";

const CAPABILITIES = [
    { icon: CreditCard, title: "Payments", desc: "Accept local & global payments" },
    { icon: ArrowRightLeft, title: "Transfers", desc: "Cross-border money movement" },
    { icon: Wallet, title: "Wallets", desc: "Multi-currency wallet infrastructure" },
    { icon: Code2, title: "APIs", desc: "Developer-friendly integration" },
];

const STEPS = [
    { num: "01", title: "Create Account", desc: "Sign up in under a minute" },
    { num: "02", title: "Access Sandbox", desc: "Instantly explore APIs" },
    { num: "03", title: "Go Live", desc: "Launch when you're ready" },
];

const USE_CASES = [
    { icon: Rocket, title: "Startups", desc: "Launch financial products fast" },
    { icon: Code2, title: "Developers", desc: "Build with powerful APIs" },
    { icon: Building2, title: "Businesses", desc: "Automate payment workflows" },
    { icon: Globe, title: "Enterprises", desc: "Scale across Africa" },
];

const SAMPLE_REQUEST = `curl -X POST https://api.rexbaas.com/v1/transfers \\
  -H "Authorization: Bearer sk_test_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "currency": "NGN",
    "recipient": {
      "account_number": "0123456789",
      "bank_code": "058"
    },
    "narration": "Payment for services"
  }'`;

const SAMPLE_RESPONSE = `{
  "status": "success",
  "data": {
    "id": "txn_abc123def456",
    "amount": 50000,
    "currency": "NGN",
    "status": "pending",
    "reference": "REF-1234567890",
    "created_at": "2026-04-14T10:30:00Z"
  }
}`;

export default function LandingPage() {
    const router = useRouter();

    const handleUseCase = (title: string) => {
        router.push("/signup?intent=" + title);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* NAV */}
            <Navigation />

            {/* HERO */}
            <section className="py-20 sm:py-28 px-4">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
                            Build and launch financial products across Africa — <span className="text-gradient">faster.</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-lg">
                            Payments, wallets, transfers, and APIs powered by Rex MFB.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button size="lg" className="gradient-primary text-primary-foreground"
                                onClick={() => router.push("/signup")}>
                                Create Account <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline"
                                onClick={() => router.push("/login")}>
                                Sign In</Button>
                            <Button size="lg" variant="ghost"
                                onClick={() => window.open("https://docs.rexbaas.com", "_blank")}>
                                Explore API Docs <Code2 className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <Card className="border-2 shadow-xl">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-3 w-3 rounded-full bg-destructive" />
                                    <div className="h-3 w-3 rounded-full bg-warning" />
                                    <div className="h-3 w-3 rounded-full bg-success" />
                                    <span className="text-xs text-muted-foreground ml-2">Dashboard Preview</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: "Total Volume", value: "₦125.4M", color: "text-primary" },
                                        { label: "Success Rate", value: "99.2%", color: "text-success" },
                                        { label: "Active Wallets", value: "2,340", color: "text-secondary" },
                                        { label: "API Calls", value: "45.2K", color: "text-accent" },
                                    ].map(s => (
                                        <div key={s.label} className="p-3 rounded-lg bg-muted/50">
                                            <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
                                            <p className={`text-lg font-display font-bold ${s.color}`}>{s.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-muted/30 rounded-lg p-3">
                                    <p className="text-[10px] text-muted-foreground uppercase mb-2">Recent API Activity</p>
                                    {["POST /v1/transfers — 200", "GET /v1/wallets — 200", "POST /v1/collections — 201"].map((l, i) => (
                                        <div key={i} className="flex items-center gap-2 py-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-success" />
                                            <code className="text-[11px] font-mono text-muted-foreground">{l}</code>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CAPABILITIES */}
            <section className="py-20 bg-muted/30 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold">Everything you need to build financial products</h2>
                        <p className="text-muted-foreground mt-2">Powerful APIs, instant sandbox, production-ready infrastructure</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {CAPABILITIES.map(c => (
                            <Card key={c.title} className="group hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                                <CardContent className="p-6 space-y-3">
                                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <c.icon className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <h3 className="font-display font-semibold text-lg">{c.title}</h3>
                                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold">Get started in 3 simple steps</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {STEPS.map((s, i) => (
                            <div key={s.num} className="relative text-center space-y-4">
                                <div className="text-5xl font-display font-bold text-primary/10">{s.num}</div>
                                <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center mx-auto -mt-8">
                                    <CheckCircle className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="font-display font-semibold text-xl">{s.title}</h3>
                                <p className="text-sm text-muted-foreground">{s.desc}</p>
                                {i < 2 && <div className="hidden md:block absolute top-12 right-0 translate-x-1/2 w-16 border-t-2 border-dashed border-primary/20" />}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* USE CASES */}
            <section className="py-20 bg-muted/30 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold">Built for every builder</h2>
                        <p className="text-muted-foreground mt-2">Select your use case to get started</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {USE_CASES.map(uc => (
                            <Card
                                key={uc.title}
                                className="cursor-pointer group hover:shadow-lg transition-all border-2 hover:border-primary/30"
                                onClick={() => handleUseCase(uc.title)}
                            >
                                <CardContent className="p-6 text-center space-y-3">
                                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                                        <uc.icon className="h-7 w-7 text-primary" />
                                    </div>
                                    <h3 className="font-display font-semibold">{uc.title}</h3>
                                    <p className="text-sm text-muted-foreground">{uc.desc}</p>
                                    <Button variant="ghost" size="sm" className="text-primary">
                                        Get Started <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* SANDBOX PREVIEW */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-display font-bold">Try the API instantly</h2>
                        <p className="text-muted-foreground mt-2">No signup required to explore. Create an account to start building.</p>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                        <Card className="border-2">
                            <CardContent className="p-0">
                                <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
                                    <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-warning" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-success" />
                                    <span className="text-xs text-muted-foreground ml-2">Request</span>
                                </div>
                                <pre className="p-4 text-xs font-mono text-foreground/80 overflow-x-auto leading-relaxed">{SAMPLE_REQUEST}</pre>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-success/20">
                            <CardContent className="p-0">
                                <div className="flex items-center gap-2 px-4 py-2 border-b bg-success/5">
                                    <div className="h-2.5 w-2.5 rounded-full bg-success" />
                                    <span className="text-xs text-muted-foreground ml-2">Response — 200 OK</span>
                                </div>
                                <pre className="p-4 text-xs font-mono text-foreground/80 overflow-x-auto leading-relaxed">{SAMPLE_RESPONSE}</pre>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="text-center mt-8">
                        <Button size="lg" className="gradient-primary text-primary-foreground" 
                        onClick={() => router.push("/signup")}>
                            Create Account <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <Footer />
        </div>
    );
}
