
"use client"
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Mandatory OTP on every login (2FA)
      // Trigger welcome modal only on the very first successful login per browser
      if (!localStorage.getItem("rex-welcome-dismissed")) {
        localStorage.setItem("rex-first-login", "true");
      }
      router.push(`/verify?email=${values.email}&mode=login`);
    }, 800);
    // Mandatory OTP on every login (2FA)
    // Trigger welcome modal only on the very first successful login per browser
    // if (!localStorage.getItem("rex-welcome-dismissed")) {
    //   localStorage.setItem("rex-first-login", "true");
    // }
    // router.push(`/verify?email=${values.email}&mode=login`);
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
                        <Input type="email" placeholder="you@company.com" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit"
                  disabled={loading}
                  className="w-full gradient-primary text-primary-foreground">
                  {loading && <Spinner />}
                  Sign In<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button variant="link" className="p-0 h-auto text-primary"
                onClick={() => router.push("/signup")}>Create one</Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

export default LoginPage