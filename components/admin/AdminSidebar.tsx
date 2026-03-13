/* ════════════════════════════════════════════════════════════════
   components/admin/AdminSidebar.tsx
   
   Animated collapsible sidebar with GSAP:
   – Desktop: Full (256px) ↔ Icon-rail (64px) toggle
   – Mobile: Off-canvas slide-in/out overlay drawer
   – Kinetic: labels fade-slide on collapse/expand
   – Hover: icon scales up when collapsed
════════════════════════════════════════════════════════════════ */
"use client";

import { useEffect, useRef }  from "react";
import Link                   from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Tag, BarChart3,
  ClipboardList, Users, X, Scissors,
  MessageCircle, XCircle, Sun, Moon, LogOut,
  ChevronRight, User, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import gsap                   from "gsap";
import { useTheme }           from "@/context/ThemeContext";
import { useAdmin }           from "@/context/AdminContext";

/* ── Nav links ─────────────────────────────────────────────── */
interface NavLink { href: string; label: string; icon: React.ReactNode }
const NAV_LINKS: NavLink[] = [
  { href: "/admin",                  label: "Dashboard",     icon: <LayoutDashboard size={18} /> },
  { href: "/admin/products",         label: "Products",      icon: <ShoppingBag     size={18} /> },
  { href: "/admin/categories",       label: "Categories",    icon: <Tag             size={18} /> },
  { href: "/admin/analytics",        label: "Analytics",     icon: <BarChart3       size={18} /> },
  { href: "/admin/orders",           label: "Active Orders", icon: <ClipboardList   size={18} /> },
  { href: "/admin/orders/custom",    label: "Custom Orders", icon: <MessageCircle   size={18} /> },
  { href: "/admin/orders/cancelled", label: "Cancelled",     icon: <XCircle         size={18} /> },
  { href: "/admin/customers",        label: "Customers",     icon: <Users           size={18} /> },
];

/* ── Component ──────────────────────────────────────────────── */
export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { theme, toggle }         = useTheme();
  const { sidebarOpen, closeSidebar, sidebarCollapsed, toggleCollapsed } = useAdmin();
  const isDark = theme === "dark";

  /* ── Refs for GSAP targets ──────────────────────────────── */
  const sidebarRef   = useRef<HTMLElement>(null);
  const labelsRef    = useRef<(HTMLSpanElement | null)[]>([]);
  const logoTextRef  = useRef<HTMLDivElement>(null);
  const profileRef   = useRef<HTMLDivElement>(null);
  const footerRef    = useRef<HTMLDivElement>(null);

  /* ── GSAP collapse/expand animation ──────────────────────── */
  useEffect(() => {
    if (!sidebarRef.current) return;
    const FULL  = 256;
    const RAIL  = 64;
    const labels = labelsRef.current.filter(Boolean) as HTMLElement[];
    const logoText   = logoTextRef.current;
    const profile    = profileRef.current;
    const footer     = footerRef.current;

    const tl = gsap.timeline({ defaults: { ease: "power3.inOut", duration: 0.38 } });

    if (sidebarCollapsed) {
      // COLLAPSE → rail mode
      tl.to(sidebarRef.current, { width: RAIL })
        .to(labels,   { autoAlpha: 0, x: -8, duration: 0.2 },   "<")
        .to(logoText, { autoAlpha: 0, x: -8, duration: 0.2 },   "<")
        .to(profile,  { autoAlpha: 0, scale: 0.9, duration: 0.2 }, "<")
        .to(footer,   { autoAlpha: 0, duration: 0.15 },          "<");
    } else {
      // EXPAND → full mode
      tl.to(sidebarRef.current, { width: FULL })
        .to(labels,   { autoAlpha: 1, x: 0, duration: 0.3 },    "<+=0.1")
        .to(logoText, { autoAlpha: 1, x: 0, duration: 0.3 },    "<")
        .to(profile,  { autoAlpha: 1, scale: 1, duration: 0.3 }, "<")
        .to(footer,   { autoAlpha: 1, duration: 0.25 },          "<+=0.05");
    }

    return () => { tl.kill(); };
  }, [sidebarCollapsed]);

  /* ── Active check ─────────────────────────────────────────── */
  function isActive(href: string) {
    if (href === "/admin")        return pathname === "/admin";
    if (href === "/admin/orders") return pathname === "/admin/orders";
    return pathname.startsWith(href);
  }

  /* ── Theme-aware colors from variables ─────────────────────── */
  const sidebarBg   = "var(--bg-base)";
  const borderColor = "var(--border)";
  const textMuted   = "var(--cream-dim)";
  const textFaint   = "var(--cream-muted)";
  const hoverBg     = "rgba(201,160,40,0.10)";
  const hoverText   = "var(--cream)";
  const activeBg    = "var(--gold)";
  const activeText  = isDark ? "#1C1208" : "#FDF8F3";
  const footerBg    = "var(--bg-deep)";

  return (
    <>
      {/* ── Mobile dark backdrop ─────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fadeIn"
          onClick={closeSidebar}
          style={{ backdropFilter: "blur(2px)" }}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        ref={sidebarRef}
        className={[
          "fixed top-0 left-0 h-full z-40 flex flex-col overflow-hidden",
          "lg:static lg:z-auto lg:translate-x-0",
          // Mobile: slide in/out
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{
          width:       sidebarCollapsed ? 64 : 256,
          background:  sidebarBg,
          borderRight: `1px solid ${borderColor}`,
          transition:  "transform 0.32s cubic-bezier(0.4,0,0.2,1), background 0.3s ease",
        }}
        data-sidebar
        data-collapsed={sidebarCollapsed ? "true" : "false"}
      >
        {/* ── Brand header ───────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-3 pt-5 pb-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${borderColor}`, minHeight: 65 }}
        >
          <Link href="/admin" onClick={closeSidebar} className="flex items-center gap-2.5 group min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
              style={{ background: "linear-gradient(135deg, #C9A028, #E2B84A)", boxShadow: "0 3px 12px rgba(201,160,40,0.3)" }}
            >
              <Scissors size={15} className="text-[#1C1208]" />
            </div>
            <div ref={logoTextRef} className="min-w-0" style={{ opacity: sidebarCollapsed ? 0 : 1 }}>
              <div className="font-display text-sm font-semibold leading-none whitespace-nowrap" style={{ color: "var(--cream)" }}>Croch_et</div>
              <div className="text-[10px] mt-0.5 font-body tracking-wider uppercase whitespace-nowrap" style={{ color: "var(--gold)" }}>Admin Panel</div>
            </div>
          </Link>

          {/* Collapse toggle button (desktop) */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 flex-shrink-0"
            style={{ color: textFaint, marginLeft: sidebarCollapsed ? "auto" : 0, marginRight: sidebarCollapsed ? "auto" : 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = "#C9A028"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textFaint; }}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed
              ? <PanelLeftOpen  size={15} />
              : <PanelLeftClose size={15} />
            }
          </button>

          {/* Close button (mobile only) */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1.5 rounded-lg transition-colors flex-shrink-0"
            style={{ color: textFaint }}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Profile chip (hidden when collapsed) ───────────── */}
        <div ref={profileRef} style={{ opacity: sidebarCollapsed ? 0 : 1, pointerEvents: sidebarCollapsed ? "none" : "auto" }}>
          <button
            onClick={() => { router.push("/admin/profile"); closeSidebar(); }}
            className="flex items-center gap-3 mx-3 mt-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left w-[calc(100%-24px)]"
            style={{ background: isDark ? "rgba(201,160,40,0.06)" : "rgba(201,160,40,0.08)" }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = isDark ? "rgba(201,160,40,0.06)" : "rgba(201,160,40,0.08)")}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(201,160,40,0.15)", border: "1.5px solid rgba(201,160,40,0.3)" }}>
              <User size={15} style={{ color: "#C9A028" }} />
            </div>
            <div ref={profileRef} className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "var(--cream)" }}>Admin</div>
              <div className="text-[10px] truncate" style={{ color: textFaint }}>View Profile</div>
            </div>
            <ChevronRight size={12} style={{ color: textFaint }} />
          </button>
        </div>

        {/* ── Navigation links ───────────────────────────────── */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden space-y-0.5">
          {NAV_LINKS.map((link, i) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeSidebar}
                title={sidebarCollapsed ? link.label : undefined}
                className="flex items-center gap-3 rounded-xl text-sm font-body transition-all duration-200 group relative overflow-hidden"
                style={{
                  padding:     sidebarCollapsed ? "10px 0" : "10px 12px",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start",
                  background:  active ? activeBg : "transparent",
                  color:       active ? activeText : textMuted,
                  fontWeight:  active ? 600 : 400,
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = hoverBg;
                    e.currentTarget.style.color = hoverText;
                  }
                  if (!sidebarCollapsed) e.currentTarget.style.transform = "translateX(3px)";
                  const icon = e.currentTarget.querySelector(".nav-icon") as HTMLElement;
                  if (icon) gsap.to(icon, { scale: 1.25, duration: 0.2, ease: "back.out(2)" });
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = textMuted;
                  }
                  e.currentTarget.style.transform = "translateX(0)";
                  const icon = e.currentTarget.querySelector(".nav-icon") as HTMLElement;
                  if (icon) gsap.to(icon, { scale: 1, duration: 0.2, ease: "power2.out" });
                }}
              >
                {/* Active pill */}
                {active && !sidebarCollapsed && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full" style={{ background: "#1C1208" }} />
                )}

                {/* Icon */}
                <span
                  className="nav-icon flex-shrink-0 transition-colors"
                  style={{ color: active ? activeText : "#C9A028", opacity: active ? 1 : 0.75 }}
                >
                  {link.icon}
                </span>

                {/* Label — fades out on collapse */}
                <span
                  ref={el => { labelsRef.current[i] = el; }}
                  className="whitespace-nowrap overflow-hidden"
                  style={{
                    opacity:  sidebarCollapsed ? 0 : 1,
                    maxWidth: sidebarCollapsed ? 0 : 200,
                  }}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ── Footer: theme + sign out ────────────────────────── */}
        <div
          ref={footerRef}
          className="px-2 py-3 space-y-1 flex-shrink-0"
          style={{
            borderTop: `1px solid ${borderColor}`,
            background: footerBg,
            opacity: sidebarCollapsed ? 0 : 1,
            pointerEvents: sidebarCollapsed ? "none" : "auto",
          }}
        >
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-body"
            style={{ color: textMuted }}
            onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = hoverText; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textMuted; }}
          >
            <span style={{ color: "#C9A028" }}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </span>
            {isDark ? "Light Mode" : "Dark Mode"}
            <div className="ml-auto">
              <div className="w-9 h-5 rounded-full relative transition-colors duration-300"
                style={{ background: isDark ? "#C9A028" : "rgba(61,43,31,0.15)" }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300"
                  style={{ left: isDark ? "calc(100% - 18px)" : "2px" }} />
              </div>
            </div>
          </button>

          {/* Sign out */}
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-body"
            style={{ color: textFaint }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,38,38,0.1)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textFaint; }}
          >
            <LogOut size={15} />
            Sign Out
          </button>

          <div className="text-[10px] px-2 pt-1" style={{ color: textFaint }}>
            Croch_et Masterpiece · Admin v2.0
          </div>
        </div>
      </aside>
    </>
  );
}
