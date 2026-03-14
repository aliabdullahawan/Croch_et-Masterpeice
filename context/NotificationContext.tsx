/* ════════════════════════════════════════════════════════════════
   context/NotificationContext.tsx
   Provides toast notification queue for both admin and user.
   Reads from localStorage for unread counts.
════════════════════════════════════════════════════════════════ */
"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { fetchAdminNotifications, type AdminNotificationItem } from "@/lib/db-client";

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
  adminNotifications: AdminNotificationItem[];
  refreshAdminUnread: () => void;
  markAdminRead:    () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  toasts:             [],
  addToast:           () => {},
  removeToast:        () => {},
  adminUnread:        0,
  adminNotifications: [],
  refreshAdminUnread: () => {},
  markAdminRead:      () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts,      setToasts]      = useState<Toast[]>([]);
  const [adminUnread, setAdminUnread] = useState(0);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotificationItem[]>([]);

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
    void (async () => {
      const items = await fetchAdminNotifications();
      setAdminNotifications(items);
      setAdminUnread(items.length);
    })();
  }, []);

  const markAdminRead = useCallback(() => {
    setAdminNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    setAdminUnread(0);
  }, []);

  // Poll every 10 seconds for new admin notifications
  useEffect(() => {
    refreshAdminUnread();
    const interval = setInterval(refreshAdminUnread, 10000);
    return () => clearInterval(interval);
  }, [refreshAdminUnread]);

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast, adminUnread, adminNotifications, refreshAdminUnread, markAdminRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
