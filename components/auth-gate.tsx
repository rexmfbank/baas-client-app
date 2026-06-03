"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingFallback } from "@/components/loading-fallback";
import { useAuthStore, useAuthStoreBase } from "@/store/store";

type AuthGateProps = {
  children: React.ReactNode;
  mode: "protected" | "public";
  isLanding?: boolean;
};

const AuthGate = ({ children, mode, isLanding = false }: AuthGateProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const [hydrated, setHydrated] = useState(
    () => useAuthStoreBase.persist?.hasHydrated() ?? true
  );

  useEffect(() => {
    if (hydrated) return;

    const persistAPI = useAuthStoreBase.persist;
    if (!persistAPI) {
      return;
    }

    const unsubscribe = persistAPI.onFinishHydration(() => {
      setHydrated(true);
    });
    
    return unsubscribe;
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    if (mode === "protected" && !token) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }

    if (mode === "public" && token) {
      router.replace("/dashboard");
    }
  }, [hydrated, mode, pathname, router, token]);

  if (!hydrated && !isLanding) {
    return <LoadingFallback />;
  }

  if (hydrated && mode === "protected" && !token) {
    return <LoadingFallback />;
  }

  if (hydrated && mode === "public" && token) {
    return <LoadingFallback />;
  }

  return <>{children}</>;
};

export default AuthGate;
