/* ════════════════════════════════════════════════════════════════
   components/admin/AdminShell.tsx
   Main client wrapper — theme-aware background, animated sidebar.
   The main content area width adjusts with a CSS transition to
   match the sidebar's GSAP-animated width.
════════════════════════════════════════════════════════════════ */
"use client";

import { useAdmin }         from "@/context/AdminContext";
import { useTheme }         from "@/context/ThemeContext";
import { useAuth }          from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar         from "./AdminSidebar";
import AdminNavbar          from "./AdminNavbar";
import NotificationToast    from "@/components/ui/NotificationToast";
import LoadingScreen        from "@/components/ui/loading-screen";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, sidebarCollapsed } = useAdmin();
  const { theme } = useTheme();
  const { adminUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDark = theme === "dark";

  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/forgot-password";

  useEffect(() => {
    if (!loading && !isAuthPage && !adminUser) {
      router.replace("/admin/login");
    }
  }, [loading, isAuthPage, adminUser, router]);

  if (!isAuthPage && loading) {
    return <LoadingScreen persist />;
  }

  if (!isAuthPage && !adminUser) {
    return null;
  }

  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-500 bg-brand-base"
      style={{
        background: isDark
          ? "linear-gradient(135deg, var(--bg-deep) 0%, var(--bg-base) 100%)"
          : "linear-gradient(135deg, var(--bg-base) 0%, var(--bg-deep) 100%)",
      }}
    >
      {/* Sidebar — mobile: overlay, desktop: static, GSAP-animated width */}
      <AdminSidebar />

      {/* Main content area — grows to fill remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminNavbar />
        <main key={pathname} className="flex-1 overflow-y-auto page-enter">
          {children}
        </main>
      </div>

      <NotificationToast />
    </div>
  );
}
