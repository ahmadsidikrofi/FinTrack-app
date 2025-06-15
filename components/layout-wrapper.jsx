"use client"

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export function LayoutWrapper({ children, geistSans, geistMono }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    return (
      <main className={`${geistSans} ${geistMono} antialiased`}>
        {children}
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <main className={`${geistSans} flex-1 ${geistMono} antialiased`}>
          {children}
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
} 