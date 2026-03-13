/* ════════════════════════════════════════════════════════════════
   context/NotificationContext.tsx
   Provides toast notification queue for both admin and user.
   Reads from localStorage for unread counts.
════════════════════════════════════════════════════════════════ */
"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getAdminNotifications, markAllAdminNotificationsRead } from "@/lib/order-store";

export interface Toast {
  id:      string;
  message: string;
  type:    "success" | "info" | "warning" | "error";
}

interface NotificationContextValue {
  toasts:           Toast[];
  addToast:         (message: string, type?: Toast["type"]) => void;
  removeToast:      (id: string) => void;
  adminUnread:      number;
  refreshAdminUnread: () => void;
  markAdminRead:    () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  toasts:             [],
  addToast:           () => {},
  removeToast:        () => {},
  adminUnread:        0,
  refreshAdminUnread: () => {},
  markAdminRead:      () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts,      setToasts]      = useState<Toast[]>([]);
  const [adminUnread, setAdminUnread] = useState(0);

  /* ── Add toast (auto-dismiss after 5s) ─────────────────────── */
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = `t-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /* ── Admin unread count ────────────────────────────────────── */
  const refreshAdminUnread = useCallback(() => {
    if (typeof window === "undefined") return;
    const count = getAdminNotifications().filter(n => !n.read).length;
    setAdminUnread(count);
  }, []);

  const markAdminRead = useCallback(() => {
    markAllAdminNotificationsRead();
    setAdminUnread(0);
  }, []);

  // Poll every 10 seconds for new admin notifications
  useEffect(() => {
    refreshAdminUnread();
    const interval = setInterval(refreshAdminUnread, 10000);
    return () => clearInterval(interval);
  }, [refreshAdminUnread]);

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast, adminUnread, refreshAdminUnread, markAdminRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
