"use client";
/**
 * components/ui/HeroSlider.tsx
 * Premium crochet hero — left-exit / right-enter slide animation.
 * ✦ Floating badges removed
 * ✦ Text always readable (frosted backdrop on left panel)
 * ✦ Richer crochet aesthetic: yarn-dot texture, warm gradients, stitched border accent
 */

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/products";

const SLIDES = [
  {
    id: 0,
    tag: "✦ New Arrivals",
    headline: ["Handmade with", "Love & Luxury."],
    accentLine: 1,
    sub: "Discover our premium handcrafted collections — each piece stitched with care, one loop at a time.",
    cta: { label: "Shop Collection", href: "/products" },
    ctaSecondary: { label: "Custom Order", href: "/custom-order" },
    accent: "#B8860A",
    accentLight: "#E2B84A",
    bgFrom: "#FDF0E6",
    bgTo:   "#F9E4D4",
    yarn:   "#F4C2A0",
    product: MOCK_PRODUCTS[0],
  },
  {
    id: 1,
    tag: "✦ Fan Favourite",
    headline: ["Adorable Friends", "for Everyone."],
    accentLine: 1,
    sub: "Hand-crocheted amigurumi toys stuffed with love — perfect gifts for children and collectors alike.",
    cta: { label: "Shop Amigurumi", href: "/products?category=amigurumi" },
    ctaSecondary: { label: "Order Custom", href: "/custom-order" },
    accent: "#3A9A9A",
    accentLight: "#6BBFBF",
    bgFrom: "#EAF7F7",
    bgTo:   "#D4F0F0",
    yarn:   "#A8DEDE",
    product: MOCK_PRODUCTS[1],
  },
  {
    id: 2,
    tag: "✦ Home Décor",
    headline: ["Beautiful Art", "for Your Walls."],
    accentLine: 1,
    sub: "Boho-inspired, handcrafted crochet wall art that adds warmth and texture to any space.",
    cta: { label: "Shop Home Décor", href: "/products?category=home-decor" },
    ctaSecondary: { label: "See All Products", href: "/products" },
    accent: "#C06080",
    accentLight: "#E8A0A8",
    bgFrom: "#FDF0F4",
    bgTo:   "#FAE0E8",
    yarn:   "#F0C0CC",
    product: MOCK_PRODUCTS[2],
  },
  {
    id: 3,
    tag: "✦ Accessories",
    headline: ["Stay Stylish", "This Season."],
    accentLine: 1,
    sub: "Lightweight crochet accessories for every occasion — hats, bags, and so much more.",
    cta: { label: "Shop Accessories", href: "/products?category=accessories" },
    ctaSecondary: { label: "View All", href: "/products" },
    accent: "#7A5AC0",
    accentLight: "#A090D8",
    bgFrom: "#F4F0FD",
    bgTo:   "#EAE0FA",
    yarn:   "#C8B8F0",
    product: MOCK_PRODUCTS[3],
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [dir, setDir]         = useState<"next" | "prev">("next");
  const [busy, setBusy]       = useState(false);

  const goTo = useCallback(
    (next: number, d: "next" | "prev" = "next") => {
      if (busy) return;
      setBusy(true); setPrev(current); setDir(d); setCurrent(next);
      setTimeout(() => { setPrev(null); setBusy(false); }, 650);
    },
    [busy, current]
  );

  const goNext = useCallback(() => goTo((current + 1) % SLIDES.length, "next"), [current, goTo]);
  const goPrev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length, "prev"), [current, goTo]);

  useEffect(() => { const t = setInterval(goNext, 5500); return () => clearInterval(t); }, [goNext]);

  const slide = SLIDES[current];
  const prevSlide = prev !== null ? SLIDES[prev] : null;

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: `linear-gradient(145deg, ${slide.bgFrom} 0%, ${slide.bgTo} 100%)`, transition: "background 0.8s ease" }}
    >
      {/* ── Yarn-texture blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{ position:"absolute", top:"-15%", left:"-10%", width:"55vw", height:"55vw", borderRadius:"50%", background: slide.yarn, opacity:0.28, filter:"blur(100px)", transition:"background 1s ease" }} />
        <div style={{ position:"absolute", bottom:"-15%", right:"-10%", width:"45vw", height:"45vw", borderRadius:"50%", background: slide.accentLight, opacity:0.18, filter:"blur(110px)", transition:"background 1s ease" }} />
        {/* Stitched circle ring decorations */}
        <svg className="absolute top-16 right-[46%] opacity-10" width="220" height="220" viewBox="0 0 220 220" fill="none">
          <circle cx="110" cy="110" r="100" stroke={slide.accent} strokeWidth="1.5" strokeDasharray="6 6"/>
        </svg>
        <svg className="absolute bottom-20 left-[52%] opacity-8" width="140" height="140" viewBox="0 0 140 140" fill="none">
          <circle cx="70" cy="70" r="62" stroke={slide.accent} strokeWidth="1.2" strokeDasharray="4 5"/>
        </svg>
        {/* Gold yarn dots */}
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ position:"absolute", width:`${3+(i%3)*3}px`, height:`${3+(i%3)*3}px`, borderRadius:"50%", background:`linear-gradient(135deg, ${slide.accent}, ${slide.accentLight})`, top:`${8+i*9}%`, left:`${2+i*10}%`, opacity:0.3+(i%3)*0.08 }} />
        ))}
      </div>

      {/* ── Previous slide exits ── */}
      {prevSlide && (
        <div className="absolute inset-0 z-10" style={{ animation: dir==="next" ? "heroExitL 0.65s cubic-bezier(0.4,0,0.2,1) forwards" : "heroExitR 0.65s cubic-bezier(0.4,0,0.2,1) forwards" }}>
          <SlideContent slide={prevSlide} />
        </div>
      )}

      {/* ── Current slide enters ── */}
      <div
        key={current}
        className="relative z-20 min-h-screen flex items-center"
        style={{ animation: prev !== null ? (dir==="next" ? "heroEnterR 0.65s cubic-bezier(0.4,0,0.2,1) forwards" : "heroEnterL 0.65s cubic-bezier(0.4,0,0.2,1) forwards") : "none" }}
      >
        <SlideContent slide={slide} />
      </div>

      {/* ── Nav arrows ── */}
      {(["prev","next"] as const).map((d) => (
        <button
          key={d}
          onClick={d === "prev" ? goPrev : goNext}
          aria-label={d === "prev" ? "Previous slide" : "Next slide"}
          className="absolute top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ [d === "prev" ? "left" : "right"]: "20px", background:"rgba(255,255,255,0.82)", border:`1.5px solid ${slide.accent}44`, color:"#1A0A05", boxShadow:"0 4px 18px rgba(61,43,31,0.13)" }}
        >
          {d === "prev" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      ))}

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-30 flex gap-2.5 items-center">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? "next" : "prev")}
            aria-label={`Slide ${i+1}`}
            style={{ width: i===current ? "30px" : "8px", height:"8px", borderRadius:"999px", background: i===current ? slide.accent : "rgba(61,43,31,0.18)", transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        ))}
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes heroExitL  { from{transform:translateX(0);opacity:1} to{transform:translateX(-70px);opacity:0} }
        @keyframes heroExitR  { from{transform:translateX(0);opacity:1} to{transform:translateX(70px);opacity:0} }
        @keyframes heroEnterR { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes heroEnterL { from{transform:translateX(-60px);opacity:0} to{transform:translateX(0);opacity:1} }

        /* Dark mode overrides */
        [data-theme="dark"] .hero-panel {
          background: rgba(10,18,10,0.72) !important;
          border-color: rgba(255,255,255,0.07) !important;
        }
        [data-theme="dark"] .hero-h1   { color: #FFFFFF !important; }
        [data-theme="dark"] .hero-sub  { color: rgba(240,228,210,0.85) !important; }
        [data-theme="dark"] .hero-stat-val { color: inherit; }
        [data-theme="dark"] .hero-stat-lbl { color: rgba(220,205,185,0.7) !important; }
        [data-theme="dark"] .hero-outline  { background: rgba(255,255,255,0.07) !important; color: #F2E9DE !important; }
        [data-theme="dark"] .hero-divider  { border-color: rgba(255,255,255,0.1) !important; }
      `}</style>
    </div>
  );
}

function SlideContent({ slide }: { slide: typeof SLIDES[0] }) {
  const p = slide.product;
  const img = p.images?.[0] ?? "/placeholder-product.jpg";

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

      {/* ── Left: Text panel with frosted backdrop ── */}
      <div
        className="hero-panel rounded-3xl p-8 lg:p-10"
        style={{
          background: "rgba(255,255,255,0.62)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 8px 40px rgba(61,43,31,0.08)",
        }}
      >
        {/* Tag */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 font-body text-[11px] uppercase tracking-[0.22em]"
          style={{ background: `${slide.accent}18`, border:`1px solid ${slide.accent}44`, color: slide.accent, fontWeight:700 }}
        >
          <Sparkles size={10} />
          {slide.tag.replace("✦ ", "")}
        </div>

        {/* Headline */}
        <h1 className="hero-h1 font-display leading-[1.08] mb-4" style={{ fontSize:"clamp(2.2rem,4.5vw,3.8rem)", color:"#160A02" }}>
          {slide.headline.map((line, i) => (
            <span key={i} className="block" style={i === slide.accentLine ? { color: slide.accent } : {}}>
              {line}
            </span>
          ))}
        </h1>

        {/* Sub */}
        <p className="hero-sub font-body text-[15px] leading-relaxed mb-7 max-w-sm" style={{ color:"#3A1E0A" }}>
          {slide.sub}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href={slide.cta.href}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-body font-bold text-sm transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
            style={{ background:`linear-gradient(135deg, ${slide.accent}, ${slide.accentLight})`, color:"#fff", boxShadow:`0 6px 22px ${slide.accent}55` }}
          >
            {slide.cta.label} <ArrowRight size={14} />
          </Link>
          <Link
            href={slide.ctaSecondary.href}
            className="hero-outline inline-flex items-center gap-2 px-6 py-3 rounded-full font-body font-semibold text-sm transition-all duration-200 hover:scale-105"
            style={{ border:`1.5px solid ${slide.accent}50`, color:"#160A02", background:"rgba(255,255,255,0.65)" }}
          >
            {slide.ctaSecondary.label}
          </Link>
        </div>

        {/* Stats row */}
        <div className="hero-divider flex gap-8 pt-6" style={{ borderTop:`1px solid rgba(61,43,31,0.1)` }}>
          {[{ value:"200+", label:"Happy Customers" }, { value:"100%", label:"Handmade" }, { value:"Custom", label:"Orders Welcome" }].map(s => (
            <div key={s.label}>
              <p className="hero-stat-val font-display text-2xl font-bold" style={{ color: slide.accent }}>{s.value}</p>
              <p className="hero-stat-lbl font-body text-[11px] mt-0.5" style={{ color:"#5C3020" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Product image (clean, no floating badges) ── */}
      <div className="relative hidden lg:flex flex-col gap-0">
        {/* Decorative stitched border frame */}
        <div
          className="absolute -inset-3 rounded-[2.5rem] pointer-events-none z-0"
          style={{ border:`2px dashed ${slide.accent}30`, borderRadius:"2.4rem" }}
        />

        {/* Image */}
        <div
          className="relative h-[490px] rounded-3xl overflow-hidden z-10"
          style={{ boxShadow:`0 30px 80px rgba(61,43,31,0.2)`, border:"3px solid rgba(255,255,255,0.92)" }}
        >
          <Image
            src={img}
            alt={p.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Bottom gradient for product info */}
          <div
            className="absolute inset-0"
            style={{ background:"linear-gradient(to top, rgba(14,6,2,0.72) 0%, rgba(14,6,2,0.18) 45%, transparent 100%)" }}
          />
          {/* Product info at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="font-body text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color:`${slide.accentLight}` }}>
              {p.category?.name}
            </p>
            <p className="font-display text-xl font-semibold" style={{ color:"#FFFFFF" }}>{p.name}</p>
            <div className="flex items-center justify-between mt-3">
              {p.price && (
                <p className="font-body font-bold text-base" style={{ color: slide.accentLight }}>
                  PKR {p.price.toLocaleString()}
                </p>
              )}
              <Link
                href={`/products/${p.slug}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-xs font-bold transition-all hover:scale-105"
                style={{ background:`linear-gradient(135deg,${slide.accent},${slide.accentLight})`, color:"#fff" }}
              >
                <ShoppingBag size={11} /> View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
