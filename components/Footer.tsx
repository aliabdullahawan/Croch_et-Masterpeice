"use client";
/**
 * components/Footer.tsx
 * Fixes applied:
 *  1. Social icons → AnimatedSocialIcons (click + to expand)
 *  2. TextHoverEffect no longer overlaps grid (-mt-10 not -mt-52)
 *  3. Bottom copyright bar removed entirely
 */

import Link                    from "next/link";
import { Instagram, Facebook, MessageCircle, Mail, Phone } from "lucide-react";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/hover-footer";
import { AnimatedSocialIcons } from "@/components/ui/floating-action-button";
import type { LucideIcon }     from "lucide-react";

/* ── TikTok as a LucideIcon-shaped component ─────────── */
const TikTokIcon: LucideIcon = function TikTokIcon({ size = 18, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}
      fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0
        01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32
        6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0
        006.33-6.34V8.83a8.21 8.21 0 004.81 1.54V6.93a4.85 4.85 0 01-1.04-.24z"/>
    </svg>
  );
} as unknown as LucideIcon;

/* ── Nav data ─────────────────────────────────────────── */
const SHOP_LINKS = [
  { label: "Shop All",    href: "/products" },
  { label: "Bags",        href: "/products?category=bags" },
  { label: "Amigurumi",   href: "/products?category=amigurumi" },
  { label: "Home Décor",  href: "/products?category=home-decor" },
  { label: "Accessories", href: "/products?category=accessories" },
];

const HELPFUL_LINKS = [
  { label: "Custom Order", href: "/custom-order" },
  { label: "Wishlist",     href: "/wishlist" },
  { label: "Cart",         href: "/cart" },
  { label: "Contact Us",   href: "/contact", pulse: true },
  { label: "Sign In",      href: "/auth/login" },
];

const CONTACT_INFO = [
  { icon: <MessageCircle size={14} className="text-brand-gold shrink-0 mt-0.5" />, text: "WhatsApp Channel", href: "https://whatsapp.com/channel/0029VbBXbGv9WtC90s3UER04" },
  { icon: <Mail          size={14} className="text-brand-gold shrink-0 mt-0.5" />, text: "amnamubeen516@gmail.com", href: "mailto:amnamubeen516@gmail.com" },
  { icon: <Phone         size={14} className="text-brand-gold shrink-0 mt-0.5" />, text: "0315-9202186",            href: "tel:+923159202186" },
  { icon: <Instagram     size={14} className="text-brand-gold shrink-0 mt-0.5" />, text: "@croch_etmasterpiece",    href: "https://www.instagram.com/croch_etmasterpiece?igsh=bzN4ZzEzYXZiZ2py" },
];

/* Social icons passed to AnimatedSocialIcons */
const SOCIALS = [
  { Icon: Instagram,    href: "https://www.instagram.com/croch_etmasterpiece?igsh=bzN4ZzEzYXZiZ2py", label: "Instagram" },
  { Icon: Facebook,     href: "https://www.facebook.com/profile.php?id=61579353555271",               label: "Facebook"  },
  { Icon: TikTokIcon,   href: "https://www.tiktok.com/@croch_et.masterpiece",                         label: "TikTok"    },
  { Icon: MessageCircle,href: "https://whatsapp.com/channel/0029VbBXbGv9WtC90s3UER04",               label: "WhatsApp Channel" },
];

/* ══════════════════════════════════════════════════════ */
export default function Footer() {
  return (
    <footer className="relative bg-brand-base/80 rounded-3xl overflow-hidden
      mx-4 mb-4 mt-20 border border-brand-cream/5">

      {/* WhatsApp CTA Banner */}
      <div className="relative z-10 bg-brand-deep/80 py-5 text-center border-b border-brand-cream/5">
        <p className="font-body text-xs text-brand-creamDim/50 mb-3 uppercase tracking-widest">
          Ready to order?
        </p>
        <a
          href="https://wa.me/923159202186?text=Hi%20Amna!%20I'm%20interested%20in%20ordering."
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-body
            font-semibold text-sm text-brand-base transition-all duration-300 hover:scale-105"
          style={{ background: "linear-gradient(135deg,#c4843c,#e0a85a)" }}
        >
          <MessageCircle size={15} />
          Chat on WhatsApp
        </a>
      </div>

      {/* ── Main Grid ───────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-14 pt-16 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-10">

          {/* Col 1 — Brand + Animated Social */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span className="text-brand-gold text-xl">✦</span>
              <span className="font-display text-xl text-brand-cream">
                Croch_et<span className="text-brand-gold"> Masterpiece</span>
              </span>
            </div>
            <p className="font-body text-sm text-brand-creamDim/55 leading-relaxed max-w-xs">
              Every stitch tells a story. Handcrafted crochet pieces made with love
              in Pakistan — bags, amigurumi, home décor &amp; custom creations.
            </p>

            {/* ── AnimatedSocialIcons
                Click the gold + button to fan out all social links.
                Icons blur/rotate in on open, reverse on close.
            ──────────────────────────────────────────── */}
            <div>
              <p className="font-body text-[10px] uppercase tracking-widest
                text-brand-creamDim/30 mb-3">Follow us</p>
              <AnimatedSocialIcons icons={SOCIALS} iconSize={17} />
            </div>
          </div>

          {/* Col 2 — Shop */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-widest text-brand-gold mb-5">Shop</h4>
            <ul className="space-y-3">
              {SHOP_LINKS.map(l => (
                <li key={l.label}>
                  <Link href={l.href}
                    className="font-body text-sm text-brand-creamDim/55 hover:text-brand-cream transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Helpful Links */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-widest text-brand-gold mb-5">Helpful Links</h4>
            <ul className="space-y-3">
              {HELPFUL_LINKS.map(l => (
                <li key={l.label} className="relative">
                  <Link href={l.href}
                    className="font-body text-sm text-brand-creamDim/55 hover:text-brand-cream transition-colors">
                    {l.label}
                  </Link>
                  {l.pulse && (
                    <span className="absolute top-1 -right-3 w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h4 className="font-body text-xs uppercase tracking-widest text-brand-gold mb-5">Contact Us</h4>
            <ul className="space-y-4">
              {CONTACT_INFO.map(item => (
                <li key={item.text} className="flex items-start gap-3">
                  {item.icon}
                  <a href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="font-body text-sm text-brand-creamDim/55 hover:text-brand-cream
                      transition-colors break-all leading-relaxed">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider — clean separation before big SVG text */}
        <div className="w-full h-px bg-brand-cream/8" />
      </div>

      {/* ── "Masterpiece" hover SVG text ─────────────────
          Sits BELOW the grid. -mt-8 lifts it just to touch
          the divider — no overlap with any grid content.
          -mb-10 lets the footer end cleanly.
      ──────────────────────────────────────────────── */}
      <div className="relative z-10 lg:flex hidden h-44 -mt-8 -mb-10 px-6">
        <TextHoverEffect text="Masterpiece" />
      </div>

      {/* Background gradient */}
      <FooterBackgroundGradient />
    </footer>
  );
}
