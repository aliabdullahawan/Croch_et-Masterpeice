/* ════════════════════════════════════════════════════════════════
   app/admin/layout.tsx
   Admin panel segment layout — COMPLETELY ISOLATED from user site.
   ────────────────────────────────────────────────────────────────
   IMPORTANT: This is a nested layout (segment layout), NOT a root
   layout. It MUST NOT include <html> or <body> tags — those come
   from app/layout.tsx. The user-site Navbar/Footer/LoadingScreen
   are suppressed by UserSiteShell which checks usePathname().

   This layout provides:
   - AdminProvider context (sidebar open/close state)
   - AdminShell (sidebar + scrollable main content area)

   SEO: The admin metadata (noindex) is set here.
════════════════════════════════════════════════════════════════ */
import type { Metadata }  from "next";
import { AdminProvider }  from "@/context/AdminContext";
import AdminShell         from "@/components/admin/AdminShell";

/* ── SEO: prevent search engines from indexing the admin ─────── */
export const metadata: Metadata = {
  title: "Admin Panel · Croch_et Masterpiece",
  robots: { index: false, follow: false },
};

/* ── Layout ──────────────────────────────────────────────────── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    /* AdminProvider → shares sidebarOpen state via useAdmin() hook */
    <AdminProvider>
      {/* AdminShell is a client component that renders sidebar + main */}
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
