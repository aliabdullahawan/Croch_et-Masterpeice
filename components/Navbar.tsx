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
import { ShoppingBag, Heart, User, LogOut, Bell, Home, Store, Sparkles, MessageCircle } from "lucide-react";
import { useCart }     from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth }     from "@/context/AuthContext";
import { fetchSiteNotifications, type SiteNotificationItem } from "@/lib/db-client";
import ThemeToggle     from "@/components/ui/ThemeToggle";
import { MorphingTextReveal } from "@/components/ui/morphing-text-reveal";
import { NavBar as TubelightNavBar, type NavItem } from "@/components/ui/tubelight-navbar";

const TUBELIGHT_ITEMS: NavItem[] = [
  { name: "Home", url: "/", icon: Home },
  { name: "Shop", url: "/products", icon: Store },
  { name: "Custom", url: "/custom-order", icon: Sparkles },
  { name: "Contact", url: "/contact", icon: MessageCircle },
];

export default function Navbar() {
  const { totalItems }  = useCart();
  const { count }       = useWishlist();
  const { user, signOut } = useAuth();

  const [scrolled,    setScrolled]    = useState(false);
  const [userMenuOpen,setUserMenuOpen]= useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<SiteNotificationItem[]>([]);
  const [lastSeen, setLastSeen] = useState<number>(0);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);
  const notifCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Scroll detection ─────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <>
      <header
        className={`group/nav sticky top-0 z-[100] w-full transform-gpu transition-all duration-500 ease-out border-b ${
          scrolled 
            ? "backdrop-blur-xl bg-brand-base/85 border-brand-gold/30 shadow-[0_14px_38px_rgba(0,0,0,0.24)]"
            : "backdrop-blur-md bg-brand-base/60 border-brand-gold/10 shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="navbar-aurora" />
          <div className="navbar-sheen" />
          <div className="navbar-topline" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 flex items-center justify-between h-16 md:h-20">

            {/* ── Brand Logo + Global Morphing Text ─────────────────────────────── */}
            <div className="flex flex-col">
              <Link
                href="/"
                className={`font-display text-xl md:text-2xl font-semibold tracking-wide transition-all duration-500 ${
                  scrolled ? "text-brand-cream" : "text-brand-cream"
                } hover:text-brand-gold`}
              >
                Croch_et
                <span className="text-brand-gold animate-pulse-slow"> Masterpiece</span>
              </Link>
              <div className="hidden lg:block -mt-0.5">
                <MorphingTextReveal
                  texts={[
                    "Handmade With Purpose",
                    "Crafted For Your Story",
                    "Design Through Intention",
                    "Creation Without Limitation",
                  ]}
                  className="text-[10px] text-brand-creamDim/70"
                  interval={3600}
                  glitchOnHover
                />
              </div>
            </div>

            {/* ── Tubelight Links (desktop in top bar, mobile floating) ───────── */}
            <div className="pointer-events-auto">
              <TubelightNavBar items={TUBELIGHT_ITEMS} />
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
                ref={notificationRef}
                className="relative hidden md:block"
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

              {/* Notifications mobile */}
              <div className="relative md:hidden">
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
                  <div className="absolute right-0 top-full mt-1 glass-card min-w-[240px] max-w-[280px] py-2 shadow-card animate-slideDown">
                    <p className="px-4 py-2 text-xs text-brand-creamDim border-b border-brand-cream/10">Latest updates</p>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-brand-creamDim/70">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 5).map((item) => (
                        <div key={`m-${item.id}`} className="px-4 py-2 border-b last:border-b-0 border-brand-cream/10">
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
                ref={userRef}
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

            </div>
          </div>
        </div>
      </header>
    </>
  );
}
