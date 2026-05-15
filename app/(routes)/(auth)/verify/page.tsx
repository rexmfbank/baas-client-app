"use client"
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import Logo from "@/components/logo";
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
import { useMutation } from "@tanstack/react-query";
import { resendOtpMutationFn, verifyOtpMutationFn } from "@/lib/api-mutations";
import type { VerifyOtpResponseType, VerifyPayloadType } from "@/types/auth.type";
import { useAuthStore } from "@/store/store";

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

  const [error, setError] = useState("");
  const verificationExpiresAt = useAuthStore((state) => state.verificationExpiresAt);
  const startVerificationTimer = useAuthStore((state) => state.startVerificationTimer);
  const clearVerificationTimer = useAuthStore((state) => state.clearVerificationTimer);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const secondsLeft = useMemo(() => {
    if (!verificationExpiresAt) return 0;
    return Math.max(0, Math.ceil((verificationExpiresAt - now) / 1000));
  }, [now, verificationExpiresAt]);

  const isExpired = secondsLeft <= 0;

  const resendMutation = useMutation({
    mutationFn: resendOtpMutationFn,
  });

  const verifyMutation = useMutation<VerifyOtpResponseType, Error, VerifyPayloadType>({
    mutationFn: verifyOtpMutationFn,
  });

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleVerify = async (values: VerifyFormValues) => {
    setError("");
    try {
      await verifyMutation.mutateAsync({
        otp: values.otp,
        email,
      });
      
      clearVerificationTimer();
      if (mode === "login") {
        router.push("/dashboard");
      } else {
        router.push(`/intent?intent=${intent}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification failed");
    }
  };

  const handleResend = async () => {
    if (!isExpired || resendMutation.isPending || verifyMutation.isPending) return;

    setError("");
    try {
      await resendMutation.mutateAsync({ email });
      startVerificationTimer(600);
      form.reset({ otp: "" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to resend code");
    }
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
                          <InputOTP maxLength={6} {...field} disabled={verifyMutation.isPending}>
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
                  {!isExpired ? (
                    <span>
                      Code expires in {Math.floor(secondsLeft / 60)}:
                      {(secondsLeft % 60).toString().padStart(2, "0")}
                    </span>
                  ) : (
                    <span className="text-destructive">Code expired. You can request a new one now.</span>
                  )}
                </div>

                {error && (
                  <p className="text-xs text-destructive text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground"
                  disabled={verifyMutation.isPending || isExpired || resendMutation.isPending}
                >
                  {verifyMutation.isPending && <Spinner />}
                  Verify <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={!isExpired || resendMutation.isPending || verifyMutation.isPending}
                className="text-muted-foreground"
              >
                {resendMutation.isPending ? <Spinner /> : <RefreshCw className="size-3" />}
                {resendMutation.isPending ? "Sending new code..." : "Resend code"}
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
