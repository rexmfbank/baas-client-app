
"use client"
import * as z from "zod";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { loginMutationFn } from "@/lib/api-mutations";
import type { LoginResponseType, loginType } from "@/types/auth.type";
import { useAuthStore } from "@/store/store";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to sign in";
};

const LoginPage = () => {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const clearVerificationTimer = useAuthStore((state) => state.clearVerificationTimer);
  const startVerificationTimer = useAuthStore((state) => state.startVerificationTimer);
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation<LoginResponseType, Error, loginType>({
    mutationFn: loginMutationFn,
    onSuccess: (response, variables) => {
      if (!response.success && response.message === "Account not verified") {
        clearAuth();
        startVerificationTimer(600);
        router.push(`/verify?email=${encodeURIComponent(variables.email)}&mode=login`);
        return;
      }
      if (!response.success) {
        toast({
          title: "Sign in failed",
          description: response.message || "Unable to sign in",
          variant: "destructive",
        });
        return;
      }
      if (response.data?.email && response.data?.token) {
        clearVerificationTimer();
        setAuth({
          user: {
            email: response.data.email,
            countryCode: response.data.countryCode,
          },
          token: response.data.token,
        });
        router.push("/dashboard");
        return;
      }

      toast({
        title: "Sign in failed",
        description: "Missing login data from server",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Sign in failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your Rex BaaS account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@company.com" {...field}
                         disabled={loginMutation.isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Password</FormLabel>
                        <Button variant="link" className="p-0 h-auto text-xs text-primary" type="button">Forgot password?</Button>
                      </div>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field}
                         disabled={loginMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full gradient-primary text-primary-foreground">
                  {loginMutation.isPending && <Spinner />}
                  Sign In<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Button variant="link" className="p-0 h-auto text-primary"
                onClick={() => router.push("/signup")}>Create one</Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

export default LoginPage
