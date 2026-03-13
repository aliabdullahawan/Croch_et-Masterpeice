"use client";
/**
 * components/ui/HeroSlider.tsx
 * Full-screen immersive background slider with glassmorphism content panels and product display.
 */

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_PRODUCTS } from "@/data/products";

const SLIDES = [
  {
    id: 0,
    tag: "Handcrafted Luxury",
    headline: ["Stitched with Love,", "Crafted for You."],
    accentLine: 1,
    sub: "Discover our premium handcrafted collections — where every loop tells a story of care and dedication.",
    cta: { label: "Shop Collection", href: "/products" },
    ctaSecondary: { label: "Custom Order", href: "/custom-order" },
    image: "/images/hero-bg-1.jpg",
    product: MOCK_PRODUCTS[0],
  },
  {
    id: 1,
    tag: "Creative Passion",
    headline: ["Beautiful Art,", "Thread by Thread."],
    accentLine: 0,
    sub: "Unique amigurumi, warm home décor, and cozy accessories made from the finest yarns.",
    cta: { label: "Explore Accessories", href: "/products?category=accessories" },
    ctaSecondary: { label: "Our Story", href: "/about" },
    image: "/images/hero-bg-2.jpg",
    product: MOCK_PRODUCTS[1],
  },
  {
    id: 2,
    tag: "Premium Materials",
    headline: ["Where Yarn Meets", "Masterpiece."],
    accentLine: 1,
    sub: "We use only the highest quality materials to ensure your crochet items last a lifetime.",
    cta: { label: "Shop Home Décor", href: "/products?category=home-decor" },
    ctaSecondary: { label: "View All", href: "/products" },
    image: "/images/hero-bg-3.jpg",
    product: MOCK_PRODUCTS[2],
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [busy, setBusy]       = useState(false);

  const goNext = useCallback(() => {
    if (busy) return;
    setBusy(true);
    setCurrent((prev) => (prev + 1) % SLIDES.length);
    setTimeout(() => setBusy(false), 800);
  }, [busy]);

  const goPrev = useCallback(() => {
    if (busy) return;
    setBusy(true);
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setTimeout(() => setBusy(false), 800);
  }, [busy]);

  useEffect(() => {
    const t = setInterval(goNext, 6000); 
    return () => clearInterval(t); 
  }, [goNext]);

  return (
    <div className="relative w-full min-h-[90vh] md:min-h-screen overflow-hidden flex items-center justify-center bg-brand-base dark:bg-[#1A0A05] transition-colors duration-700">
      
      {/* ── Immersive Background Images (Crossfade & Ken Burns) ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          {/* Ken Burns Scale Wrapper */}
          <motion.div
            className="w-full h-full"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "easeOut" }}
          >
            <Image
              src={SLIDES[current].image}
              alt="Hero Background"
              fill
              priority
              className="object-cover"
            />
          </motion.div>
          {/* Theme-aware Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-base via-brand-base/40 to-transparent dark:from-[#1A0A05]/90 dark:via-[#1A0A05]/60 dark:to-transparent z-10 opacity-90 transition-all duration-700" />
          <div className="absolute inset-0 bg-brand-base/10 dark:bg-black/20 z-10" />
        </motion.div>
      </AnimatePresence>

      {/* ── Content Container ── */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 pointer-events-none mt-16 md:mt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pointer-events-auto origin-left w-full"
            initial={{ opacity: 0, x: -40, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Left: Glassmorphism Text Panel */}
            <div 
              className="p-8 md:p-10 rounded-3xl w-full max-w-xl"
              style={{
                background: "rgba(25, 10, 5, 0.45)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              }}
            >
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 font-body text-[11px] uppercase tracking-[0.2em]"
                style={{ background: "rgba(226, 184, 74, 0.15)", border: "1px solid rgba(226, 184, 74, 0.3)", color: "#E2B84A", fontWeight: 700 }}
              >
                <Sparkles size={12} />
                {SLIDES[current].tag}
              </motion.div>

              {/* Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display leading-[1.05] mb-5 text-brand-cream" 
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
              >
                {SLIDES[current].headline.map((line, i) => (
                  <span key={i} className="block" style={i === SLIDES[current].accentLine ? { color: "#D4A820", fontStyle: "italic" } : {}}>
                    {line}
                  </span>
                ))}
              </motion.h1>

              {/* Sub */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-body text-[15px] md:text-base leading-relaxed mb-8 text-brand-creamDim/80" 
              >
                {SLIDES[current].sub}
              </motion.p>

              {/* CTAs */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href={SLIDES[current].cta.href}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-body font-bold text-sm transition-all duration-300 hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #C9A028, #E2B84A)", color: "#fff", boxShadow: "0 6px 20px rgba(226, 184, 74, 0.4)" }}
                >
                  {SLIDES[current].cta.label} 
                  <motion.span className="group-hover:translate-x-1 transition-transform"><ArrowRight size={15} /></motion.span>
                </Link>
                <Link
                  href={SLIDES[current].ctaSecondary.href}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-body font-semibold text-sm transition-all duration-300 hover:scale-105"
                  style={{ border: "1.5px solid var(--border)", color: "var(--cream)", background: "rgba(255,255,255,0.05)" }}
                >
                  {SLIDES[current].ctaSecondary.label}
                </Link>
              </motion.div>
            </div>

            {/* Right: Product Display Image Container */}
            <div className="hidden lg:flex justify-end">
              <motion.div 
                initial={{ opacity: 0, x: 20, rotate: 2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
                className="relative w-full max-w-[420px] aspect-[4/5] rounded-[2.5rem] overflow-hidden group"
                style={{ 
                  boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.2)",
                }}
              >
                <Image 
                  src={SLIDES[current].product?.images?.[0] ?? "/placeholder-product.jpg"}
                  alt={SLIDES[current].product?.name ?? "Product image"}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                
                {/* Product Info Gradient Overlay */}
                <div 
                  className="absolute inset-x-0 bottom-0 p-8 pt-16 flex flex-col justify-end"
                  style={{ background: "linear-gradient(to top, rgba(15, 5, 2, 0.9) 0%, rgba(15, 5, 2, 0.4) 60%, transparent 100%)" }}
                >
                  <p className="font-body text-[10px] uppercase tracking-[0.2em] mb-1.5" style={{ color: "#E2B84A" }}>
                    {SLIDES[current].product?.category?.name}
                  </p>
                  <h3 className="font-display text-2xl mb-3 text-white">
                    {SLIDES[current].product?.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="font-body font-bold text-lg text-[#FFF4E6]">
                      PKR {SLIDES[current].product?.price?.toLocaleString()}
                    </p>
                    <Link
                      href={`/products/${SLIDES[current].product?.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-xs font-bold transition-all hover:scale-105"
                      style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                    >
                      <ShoppingBag size={12} /> View Product
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
            
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation Arrows ── */}
      <div className="absolute bottom-8 right-6 md:right-12 z-30 flex gap-3 pointer-events-auto">
        <button
          onClick={goPrev}
          aria-label="Previous slide"
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{ background: "rgba(25, 10, 5, 0.5)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFF4E6" }}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={goNext}
          aria-label="Next slide"
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{ background: "rgba(25, 10, 5, 0.5)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", color: "#FFF4E6" }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── Slide Indicators ── */}
      <div className="absolute bottom-10 left-6 md:left-12 z-30 flex gap-2.5 items-center pointer-events-auto">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (busy || i === current) return;
              setBusy(true);
              setCurrent(i);
              setTimeout(() => setBusy(false), 800);
            }}
            aria-label={`Go to slide ${i + 1}`}
            style={{ 
              width: i === current ? "36px" : "10px", 
              height: "10px", 
              borderRadius: "999px", 
              background: i === current ? "#E2B84A" : "rgba(255,255,255,0.3)", 
              transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)" 
            }}
          />
        ))}
      </div>
    </div>
  );
}
