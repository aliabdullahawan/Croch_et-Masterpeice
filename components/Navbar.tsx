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
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, Menu, X, User, LogOut } from "lucide-react";
import { useCart }     from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth }     from "@/context/AuthContext";
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

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-md border-b"
            : "bg-transparent"
        }`}
        style={scrolled ? {
          background: "rgba(253,248,243,0.55)",
          borderColor: "rgba(201,160,40,0.12)",
          boxShadow: "0 2px 20px rgba(61,43,31,0.06)",
        } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ── Brand Logo ─────────────────────────────── */}
            <Link
              href="/"
              className="font-display text-xl md:text-2xl font-semibold text-brand-cream tracking-wide hover:text-brand-gold transition-colors duration-300"
            >
              Croch_et
              <span className="text-brand-gold"> Masterpiece</span>
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

              {/* User */}
              <div className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(o => !o)}
                      className="p-2 text-brand-creamDim hover:text-brand-cream transition-colors"
                    >
                      <User size={20} />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-10 glass-card min-w-[160px] py-2 shadow-card animate-slideDown">
                        <p className="px-4 py-2 text-xs text-brand-creamDim border-b border-brand-cream/10 truncate">
                          {user.email}
                        </p>
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
        <div className="fixed inset-0 z-40 pt-16 bg-brand-base/95 backdrop-blur-xl md:hidden animate-fadeIn">
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
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="text-brand-rose font-body text-sm flex items-center gap-2">
                <LogOut size={16} /> Sign Out
              </button>
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
