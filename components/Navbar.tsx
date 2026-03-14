"use client";
/**
 * components/Navbar.tsx
 * ─────────────────────────────────────────────────────
 * Sticky navigation bar.
 * • Transparent at top → glass blur on scroll
 * • Mobile hamburger menu
 * • Cart & wishlist badge counts
 * • User login/logout button
 */

import Link                   from "next/link";
import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Heart, Menu, X, User, LogOut, Bell } from "lucide-react";
import { useCart }     from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth }     from "@/context/AuthContext";
import { fetchSiteNotifications, type SiteNotificationItem } from "@/lib/db-client";
import ThemeToggle     from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/",              label: "Home"         },
  { href: "/products",      label: "Shop"         },
  { href: "/custom-order",  label: "Custom Order" },
  { href: "/contact",       label: "Contact"      },
];

export default function Navbar() {
  const { totalItems }  = useCart();
  const { count }       = useWishlist();
  const { user, signOut } = useAuth();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [userMenuOpen,setUserMenuOpen]= useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<SiteNotificationItem[]>([]);
  const [lastSeen, setLastSeen] = useState<number>(0);
  const notifCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Scroll detection ─────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close mobile menu on resize ─────────────────── */
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const storedSeen = Number(localStorage.getItem("cm_notif_last_seen") ?? "0");
    setLastSeen(Number.isFinite(storedSeen) ? storedSeen : 0);

    void (async () => {
      const rows = await fetchSiteNotifications(8);
      setNotifications(rows);
    })();
  }, []);

  const unreadNotifications = notifications.filter((item) => new Date(item.created_at).getTime() > lastSeen).length;

  function markNotificationsSeen() {
    const now = Date.now();
    setLastSeen(now);
    localStorage.setItem("cm_notif_last_seen", String(now));
  }

  function openNotifMenu() {
    if (notifCloseTimer.current) {
      clearTimeout(notifCloseTimer.current);
      notifCloseTimer.current = null;
    }
    setNotifOpen(true);
    markNotificationsSeen();
  }

  function closeNotifMenuWithDelay() {
    if (notifCloseTimer.current) {
      clearTimeout(notifCloseTimer.current);
    }
    notifCloseTimer.current = setTimeout(() => {
      setNotifOpen(false);
    }, 140);
  }

  function openUserMenu() {
    if (userCloseTimer.current) {
      clearTimeout(userCloseTimer.current);
      userCloseTimer.current = null;
    }
    setUserMenuOpen(true);
  }

  function closeUserMenuWithDelay() {
    if (userCloseTimer.current) {
      clearTimeout(userCloseTimer.current);
    }
    userCloseTimer.current = setTimeout(() => {
      setUserMenuOpen(false);
    }, 140);
  }

  useEffect(() => {
    return () => {
      if (notifCloseTimer.current) clearTimeout(notifCloseTimer.current);
      if (userCloseTimer.current) clearTimeout(userCloseTimer.current);
    };
  }, []);

  return (
    <>
      <nav
        className={`group/nav fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? "backdrop-blur-xl border-b"
            : "backdrop-blur-sm border-b border-transparent"
        }`}
        style={{
          background: scrolled ? "var(--bg-card)" : "rgba(var(--bg-base-rgb), 0.1)",
          borderColor: scrolled ? "var(--border)" : "transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.1)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ── Brand Logo ─────────────────────────────── */}
            <Link
              href="/"
              className={`font-display text-xl md:text-2xl font-semibold tracking-wide transition-all duration-500 ${
                scrolled ? "text-brand-cream" : "text-brand-cream"
              } hover:text-brand-gold`}
            >
              Croch_et
              <span className="text-brand-gold animate-pulse-slow"> Masterpiece</span>
            </Link>

            {/* ── Desktop Links ──────────────────────────── */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-body text-sm text-brand-creamDim hover:text-brand-cream transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-gold transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* ── Actions ────────────────────────────────── */}
            <div className="flex items-center gap-3 md:gap-4">

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-brand-creamDim hover:text-brand-cream transition-colors">
                <Heart size={20} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-rose text-brand-base text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-brand-creamDim hover:text-brand-cream transition-colors">
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-base text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Notifications (desktop hover + mobile tap) */}
              <div
                className="relative"
                onMouseEnter={openNotifMenu}
                onMouseLeave={closeNotifMenuWithDelay}
              >
                <button
                  onClick={() => {
                    setNotifOpen((prev) => !prev);
                    markNotificationsSeen();
                  }}
                  className="relative p-2 text-brand-creamDim hover:text-brand-cream transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-base text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 glass-card min-w-[250px] max-w-[300px] py-2 shadow-card animate-slideDown"
                    onMouseEnter={openNotifMenu}
                    onMouseLeave={closeNotifMenuWithDelay}
                  >
                    <p className="px-4 py-2 text-xs text-brand-creamDim border-b border-brand-cream/10">Latest updates</p>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-brand-creamDim/70">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 5).map((item) => (
                        <div key={item.id} className="px-4 py-2 border-b last:border-b-0 border-brand-cream/10">
                          <p className="text-xs font-semibold text-brand-cream line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-brand-creamDim leading-relaxed line-clamp-2">{item.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* User */}
              <div
                className="relative"
                onMouseEnter={openUserMenu}
                onMouseLeave={closeUserMenuWithDelay}
              >
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(o => !o)}
                      className="p-2 text-brand-creamDim hover:text-brand-cream transition-colors"
                      aria-label="Open user menu"
                    >
                      <User size={20} />
                    </button>
                    {userMenuOpen && (
                      <div
                        className="absolute right-0 top-full mt-1 glass-card min-w-[160px] py-2 shadow-card animate-slideDown"
                        onMouseEnter={openUserMenu}
                        onMouseLeave={closeUserMenuWithDelay}
                      >
                        <p className="px-4 py-2 text-xs text-brand-creamDim border-b border-brand-cream/10 truncate">
                          {user.email}
                        </p>
                        <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-cream hover:bg-brand-green/50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <User size={14} /> Profile
                        </Link>
                        <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-cream hover:bg-brand-green/50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Heart size={14} /> Wishlist
                        </Link>
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-brand-rose hover:bg-brand-green/50 transition-colors"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="hidden md:block btn-outline text-xs px-4 py-2"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="md:hidden p-2 text-brand-creamDim hover:text-brand-cream transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu ──────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-16 bg-brand-base/80 backdrop-blur-2xl md:hidden animate-fadeIn">
          <div className="flex flex-col items-center justify-center h-full gap-8 pb-16">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-display text-3xl text-brand-cream hover:text-brand-gold transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
            <div className="w-16 h-px bg-brand-gold/40 my-2" />
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="text-brand-cream font-body text-sm flex items-center gap-2">
                  <User size={16} /> Profile
                </Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-brand-rose font-body text-sm flex items-center gap-2">
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="btn-outline text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
