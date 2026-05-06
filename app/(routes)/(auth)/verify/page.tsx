"use client"
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import Logo from "@/components/logo";
import { useTimer } from "@/hooks/use-timer";
import { Spinner } from "@/components/ui/spinner";
import { LoadingFallback } from "@/components/loading-fallback";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const verifySchema = z.object({
  otp: z.string().length(6, "Enter a 6-digit code"),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const mode = searchParams.get("mode") || "signup";
  const intent = searchParams.get("intent") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const timer = useTimer(300); // 5 minutes expiry
  const resendIn = useTimer(30); // 30s resend cooldown

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleVerify = async (values: VerifyFormValues) => {
    if (locked) return;
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Mock: any 6-digit code passes; "000000" simulates wrong code
      if (values.otp === "000000") {
        const next = attempts + 1;
        setAttempts(next);
        form.reset();
        if (next >= 5) {
          setLocked(true);
          setError("Too many attempts. Try again in 5 minutes.");
        } else {
          setError(`Invalid code. Please try again. (${5 - next} attempts left)`);
        }
        return;
      }
      if (mode === "login") {
        router.push("/dashboard");
      } else {
        router.push(`/intent?intent=${intent}`);
      }
    }, 700);
  };

  const handleResend = () => {
    if (resendIn.seconds > 0) return;
    timer.reset(300);
    resendIn.reset(30);
    form.reset();
    setError("");
  };

  return (
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">
              {mode === "login" ? "Two-factor verification" : "Verify your email"}
            </CardTitle>
            <CardDescription>
              We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-4">
                <div className="flex justify-center">
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} className="w-12 h-12" />
                              <InputOTPSlot index={1} className="w-12 h-12" />
                            </InputOTPGroup>

                            <InputOTPSeparator />

                            <InputOTPGroup>
                              <InputOTPSlot index={2} className="w-12 h-12" />
                              <InputOTPSlot index={3} className="w-12 h-12" />
                            </InputOTPGroup>

                            <InputOTPSeparator />

                            <InputOTPGroup>
                              <InputOTPSlot index={4} className="w-12 h-12" />
                              <InputOTPSlot index={5} className="w-12 h-12" />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  {!timer.isExpired ? (
                    <span>Code expires in {timer.minutes}:{timer.secs.toString().padStart(2, "0")}</span>
                  ) : (
                    <span className="text-destructive">Code expired. Request a new one.</span>
                  )}
                </div>

                {error && (
                  <p className="text-xs text-destructive text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground"
                  disabled={form.formState.isSubmitting || timer.isExpired || locked}
                >
                  {loading && <Spinner />}
                  Verify <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={resendIn.seconds > 0 || locked}
                className="text-muted-foreground"
              >
                <RefreshCw className="size-3" />
                {resendIn.seconds > 0 ? `Resend code in ${resendIn.seconds}s` : "Resend code"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

const VerifyPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyContent />
    </Suspense>
  );
};

export default VerifyPage;