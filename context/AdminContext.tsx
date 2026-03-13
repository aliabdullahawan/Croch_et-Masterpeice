/* ════════════════════════════════════════════════════════════════
   context/AdminContext.tsx
   Provides two sidebar states:
   - sidebarOpen  → mobile drawer (overlay)
   - sidebarCollapsed → desktop collapse (icon-only rail mode)
════════════════════════════════════════════════════════════════ */
"use client";

import { createContext, useContext, useState } from "react";

interface AdminContextValue {
  sidebarOpen:       boolean;
  toggleSidebar:     () => void;
  closeSidebar:      () => void;
  sidebarCollapsed:  boolean;
  toggleCollapsed:   () => void;
}

const AdminContext = createContext<AdminContextValue>({
  sidebarOpen:       false,
  toggleSidebar:     () => {},
  closeSidebar:      () => {},
  sidebarCollapsed:  false,
  toggleCollapsed:   () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [open,      setOpen]      = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <AdminContext.Provider value={{
      sidebarOpen:      open,
      toggleSidebar:    () => setOpen(s => !s),
      closeSidebar:     () => setOpen(false),
      sidebarCollapsed: collapsed,
      toggleCollapsed:  () => setCollapsed(s => !s),
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
