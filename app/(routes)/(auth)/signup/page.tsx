
'use client'
import * as z from "zod";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import { LoadingFallback } from "@/components/loading-fallback";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCountriesMutationFn, registerMutationFn } from "@/lib/api-mutations";
import { toast } from "@/hooks/use-toast";
import { registerType } from "@/types/auth.type";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/store";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  countryCode: z.string().min(1, "Please select a country"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to create account";
};

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intentFromLanding = searchParams.get("intent") || "";
  const setUser = useAuthStore((state) => state.setUser);
  const startVerificationTimer = useAuthStore((state) => state.startVerificationTimer);

  const countriesQuery = useQuery({
    queryKey: ["countries"],
    queryFn: getCountriesMutationFn,
  });

  const registerMutation = useMutation({
    mutationFn: registerMutationFn,
  });

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      countryCode: "",
      password: "",
    },
  });

  const handleSignup = async (values: SignupFormValues) => {
    try {
      const response = await registerMutation.mutateAsync(values as registerType);

      if (!response.success) {
        toast({
          title: "Signup failed",
          description: response.message || "Unable to create account",
          variant: "destructive",
        });
        return;
      }

      setUser({
        email: values.email,
        countryCode: values.countryCode,
      });
      startVerificationTimer(600);
      toast({
        title: "Success",
        description: "Account created successfully",
        variant: "success",
      });
      router.push(`/verify?email=${encodeURIComponent(values.email)}&intent=${intentFromLanding}`);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const countries = countriesQuery.data?.data ?? [];
  const isLoadingCountries = countriesQuery.isLoading || countriesQuery.isFetching;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="flex justify-center">
        <Logo />
      </div>

      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-xl">Create your account</CardTitle>
          <CardDescription>Start building with Rex BaaS in under a minute</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@company.com" {...field}
                        disabled={registerMutation.isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={registerMutation.isPending || isLoadingCountries}>
                          <SelectValue placeholder={isLoadingCountries ? "Loading countries..." : "Select country"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password"
                        placeholder="Min 6 characters" {...field}
                        disabled={registerMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
                {registerMutation.isPending ? <Spinner className="h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0 h-auto text-primary" onClick={() => router.push("/login")}>Sign in</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const SignUpPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignupContent />
    </Suspense>
  );
};

export default SignUpPage;
