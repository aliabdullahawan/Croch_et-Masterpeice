/* ════════════════════════════════════════════════════════════════
   components/UserSiteShell.tsx
   Client wrapper that renders Navbar + Footer only on non-admin routes.
   The admin panel has its own layout and nav — no user-site chrome needed.
════════════════════════════════════════════════════════════════ */
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/ui/loading-screen";

export default function UserSiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {/* LoadingScreen only on user site — admin doesn't need it */}
      {!isAdmin && <LoadingScreen />}

      {/* Navbar — hidden on all /admin/* routes */}
      {!isAdmin && <Navbar />}

      {/* Page content */}
      <main className={isAdmin ? "" : "min-h-screen page-enter"}>
        {children}
      </main>

      {/* Footer — hidden on all /admin/* routes */}
      {!isAdmin && <Footer />}
    </>
  );
}
