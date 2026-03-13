/* ════════════════════════════════════════════════════════════════
   components/admin/AdminShell.tsx
   Main client wrapper — theme-aware background, animated sidebar.
   The main content area width adjusts with a CSS transition to
   match the sidebar's GSAP-animated width.
════════════════════════════════════════════════════════════════ */
"use client";

import { useAdmin }         from "@/context/AdminContext";
import { useTheme }         from "@/context/ThemeContext";
import { usePathname }      from "next/navigation";
import AdminSidebar         from "./AdminSidebar";
import AdminNavbar          from "./AdminNavbar";
import NotificationToast    from "@/components/ui/NotificationToast";
import LoadingScreen        from "@/components/ui/loading-screen";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, sidebarCollapsed } = useAdmin();
  const { theme } = useTheme();
  const pathname = usePathname();
  const isDark = theme === "dark";

  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-300"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #120A04 0%, #1C1208 60%, #140D06 100%)"
          : "linear-gradient(135deg, #FDF8F3 0%, #F5EDE4 60%, #F0E5D8 100%)",
      }}
    >
      <LoadingScreen />
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
