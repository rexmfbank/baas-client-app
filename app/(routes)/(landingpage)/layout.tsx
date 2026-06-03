"use client";

import AuthGate from "@/components/auth-gate";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate mode="public" isLanding>
        {children}
    </AuthGate>
  );
}
