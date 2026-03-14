/* ════════════════════════════════════════════════════════════════
   components/UserSiteShell.tsx
   Client wrapper that renders Navbar + Footer only on non-admin routes.
   The admin panel has its own layout and nav — no user-site chrome needed.
════════════════════════════════════════════════════════════════ */
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/ui/loading-screen";

export default function UserSiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const { loading } = useAuth();

  // If we are on an admin route, this shell does nothing (AdminShell handles it)
  if (isAdmin) {
    return <>{children}</>;
  }

  // Exact same loading behavior as AdminShell: block render until auth finishes
  if (loading) {
    return <LoadingScreen persist />;
  }

  return (
    <>
      {/* Navbar — visually floats on top */}
      <Navbar />

      {/* Page content */}
      <main className="min-h-screen page-enter pb-24 sm:pb-0"> 
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
