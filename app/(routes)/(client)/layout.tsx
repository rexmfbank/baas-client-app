"use client";

import AppSidebar from "@/components/shared/app-sidebar";
import Header from "@/components/shared/header";
import AuthGate from "@/components/auth-gate";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PlatformProvider } from "@/context/platform-context";

export default function DashboardLayout({
    children
}: { children: React.ReactNode }) {
    return (
        <AuthGate mode="protected">
            <PlatformProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset className="flex-1 flex flex-col min-w-0">
                        <Header />
                        <div className="flex-1 overflow-auto">
                            <div className="mx-auto w-full max-w-[1400px] px-4 py-6
            md:px-8 md:py-10 animate-fade-in">
                                {children}
                            </div>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </PlatformProvider>
        </AuthGate>
    );
}
