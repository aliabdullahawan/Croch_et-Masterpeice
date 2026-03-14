/* ════════════════════════════════════════════════════════════════
   components/admin/AdminNavbar.tsx
   Theme-aware sticky navbar — light+dark support.
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, Bell, User, Scissors,
  LayoutDashboard, ShoppingBag, Tag,
  BarChart3, ClipboardList, Users,
  ChevronDown, LogOut, Settings,
} from "lucide-react";
import { useAdmin }         from "@/context/AdminContext";
import { useTheme }         from "@/context/ThemeContext";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth }          from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/admin",            label: "Dashboard",  icon: <LayoutDashboard size={14} /> },
  { href: "/admin/products",   label: "Products",   icon: <ShoppingBag     size={14} /> },
  { href: "/admin/categories", label: "Categories", icon: <Tag             size={14} /> },
  { href: "/admin/analytics",  label: "Analytics",  icon: <BarChart3       size={14} /> },
  { href: "/admin/orders",     label: "Orders",     icon: <ClipboardList   size={14} /> },
  { href: "/admin/customers",  label: "Customers",  icon: <Users           size={14} /> },
];

export default function AdminNavbar() {
  const pathname                   = usePathname();
  const router                     = useRouter();
  const { toggleSidebar }          = useAdmin();
  const { theme }                  = useTheme();
  const { adminUnread, markAdminRead, adminNotifications, refreshAdminUnread } = useNotifications();
  const { adminUser, adminSignOut } = useAuth();
  const isDark = theme === "dark";

  const [scrolled,      setScrolled]      = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  /* Theme-aware colours */
  const navBg      = isDark
    ? (scrolled ? "rgba(26,13,6,0.92)"   : "transparent")
    : (scrolled ? "rgba(253,248,243,0.92)" : "transparent");
  const borderCol  = "var(--border)";
  const textMain   = "var(--cream)";
  const textMuted  = "var(--cream-dim)";
  const textFaint  = "var(--cream-muted)";
  const dropdownBg = "var(--bg-base)";
  const hoverLinkBg = "rgba(201,160,40,0.12)";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function openNotifications() {
    setNotifOpen((open) => {
      const nextOpen = !open;
      if (nextOpen) {
        markAdminRead();
      }
      return nextOpen;
    });
  }

  useEffect(() => {
    refreshAdminUnread();
  }, [refreshAdminUnread]);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="sticky top-0 z-30 w-full transition-all duration-300"
      style={{
        background: navBg,
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${borderCol}` : "none",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="flex items-center h-14 px-4 lg:px-6 gap-4">

        {/* Mobile: hamburger */}
        <button onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: textMuted }}
          onMouseEnter={e => (e.currentTarget.style.color = "#C9A028")}
          onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
        >
          <Menu size={20} />
        </button>

        {/* Brand */}
        <Link href="/admin" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C9A028, #E2B84A)" }}>
            <Scissors size={13} className="text-[#1C1208]" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display text-sm font-semibold" style={{ color: textMain }}>Croch_et</span>
            <span className="ml-1 font-body text-[10px] text-[#C9A028] uppercase tracking-widest">Admin</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all duration-200"
              style={{
                background: isActive(link.href) ? "#C9A028" : "transparent",
                color: isActive(link.href) ? "#1C1208" : textMuted,
              }}
              onMouseEnter={e => { if (!isActive(link.href)) { e.currentTarget.style.background = hoverLinkBg; e.currentTarget.style.color = textMain; }}}
              onMouseLeave={e => { if (!isActive(link.href)) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textMuted; }}}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Bell + Profile */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button onClick={openNotifications}
              className="relative p-2 rounded-lg transition-all"
              style={{ color: textMuted }}
              onMouseEnter={e => { e.currentTarget.style.color = "#C9A028"; e.currentTarget.style.background = "rgba(201,160,40,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = textMuted; e.currentTarget.style.background = "transparent"; }}
            >
              <Bell size={18} />
              {adminUnread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C9A028] text-[#1C1208] text-[9px] font-bold flex items-center justify-center">
                  {adminUnread > 9 ? "9+" : adminUnread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl overflow-hidden animate-slideDown"
                style={{ background: dropdownBg, border: `1px solid ${borderCol}` }}>
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${borderCol}` }}>
                  <div className="text-xs font-semibold text-[#C9A028] uppercase tracking-wide">Notifications</div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {adminNotifications.length === 0 ? (
                    <p className="text-xs text-center py-6" style={{ color: textFaint }}>No notifications yet</p>
                  ) : (
                    adminNotifications.slice(0, 10).map(n => (
                      <div key={n.id} className={`px-4 py-3 text-xs ${n.read ? "opacity-50" : ""}`}
                        style={{ borderBottom: `1px solid ${borderCol}` }}>
                        <p style={{ color: textMuted }}>{n.message}</p>
                        <p className="mt-1" style={{ color: textFaint }}>
                          {new Date(n.created_at).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <button onClick={() => setProfileOpen(o => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all"
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,160,40,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(201,160,40,0.15)", border: "1px solid rgba(201,160,40,0.3)" }}>
                <User size={13} className="text-[#C9A028]" />
              </div>
              <span className="hidden sm:block text-xs transition-colors" style={{ color: textMuted }}>
                {adminUser?.name ?? "Admin"}
              </span>
              <ChevronDown size={12} style={{ color: textFaint }} className={`transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl shadow-2xl py-1 overflow-hidden animate-slideDown"
                style={{ background: dropdownBg, border: `1px solid ${borderCol}` }}>
                <Link href="/admin/profile" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: textMuted }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,160,40,0.1)"; e.currentTarget.style.color = textMain; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textMuted; }}
                >
                  <Settings size={13} style={{ color: textFaint }} /> Profile Settings
                </Link>
                <button
                  onClick={async () => { await adminSignOut(); router.push("/admin/login"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: textMuted }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.1)"; e.currentTarget.style.color = "#f87171"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textMuted; }}
                >
                  <LogOut size={13} style={{ color: textFaint }} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
