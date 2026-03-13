"use client";
/**
 * app/products/page.tsx — Shop / Products Catalogue
 * Mobile-first responsive layout.
 * Features: sort, availability filter, search, horizontal-scroll category tabs
 */

import { useState, useMemo } from "react";
import ProductCard            from "@/components/ProductCard";
import AnimateIn              from "@/components/ui/AnimateIn";
import GlowSearchBar          from "@/components/ui/animated-glowing-search-bar";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/data/products";
import { SortAsc, Package } from "lucide-react";

type SortOption = "default" | "az" | "za" | "price-asc" | "price-desc";

/* Category hero descriptions */
const CAT_DESCRIPTIONS: Record<string, string> = {
  all:        "Browse our full handcrafted collection — bags, amigurumi, home décor, accessories, and custom orders.",
  bags:       "Handcrafted crochet bags made from premium cotton yarn. Perfect for every occasion.",
  amigurumi:  "Adorable crocheted stuffed characters — perfect gifts for kids and collectors alike.",
  "home-decor": "Add warmth and texture to your space with our handmade wall hangings, plant hangers, and more.",
  accessories: "Stylish crocheted accessories — hats, headbands, and more to complete your look.",
  custom:     "Have a unique vision? We'll crochet it just for you. Every custom piece is made with love.",
};

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [sortBy,         setSortBy]         = useState<SortOption>("default");
  const [showUnavailable, setShowUnavailable] = useState(true);

  const filtered = useMemo(() => {
    let result = [...MOCK_PRODUCTS];

    if (activeCategory !== "all") {
      result = result.filter(p =>
        p.category?.slug === activeCategory ||
        (activeCategory === "custom" && p.is_custom)
      );
    }

    if (!showUnavailable) {
      result = result.filter(p => p.is_available);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }

    switch (sortBy) {
      case "az":         result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "za":         result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "price-asc":  result.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)); break;
      case "price-desc": result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break;
    }

    return result;
  }, [activeCategory, searchQuery, sortBy, showUnavailable]);

  const activeCat = MOCK_CATEGORIES.find(c => c.slug === activeCategory);
  const catDesc   = CAT_DESCRIPTIONS[activeCategory] ?? "";

  return (
    <div className="pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Page Header ── */}
        <AnimateIn className="text-center mb-8 sm:mb-12">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-brand-gold">Browse</span>
          <h1 className="font-display mt-3 mb-2 text-brand-cream"
            style={{ fontSize: "clamp(2.25rem, 7vw, 4rem)" }}>
            Our Collection
          </h1>
          <div className="divider" />
          <p className="font-body text-sm text-brand-creamDim/60 max-w-sm mx-auto">
            Every piece is handmade with love. Add to cart and we&apos;ll arrange delivery via WhatsApp.
          </p>
        </AnimateIn>

        {/* ── Search ── */}
        <div className="flex justify-center mb-5 sm:mb-6">
          <GlowSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search products..." />
        </div>

        {/* ── Category tabs (horizontal scroll on mobile) ── */}
        <div className="relative mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {MOCK_CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className="font-body text-xs uppercase tracking-wider px-4 py-2.5 rounded-full border transition-all duration-300 whitespace-nowrap flex-shrink-0"
                style={{
                  minHeight: "44px",
                  background:  activeCategory === cat.slug ? "var(--gold)" : "transparent",
                  color:       activeCategory === cat.slug ? "var(--bg-base)" : "var(--cream-dim)",
                  borderColor: activeCategory === cat.slug ? "var(--gold)" : "rgba(61,43,31,0.15)",
                  fontWeight:  activeCategory === cat.slug ? 600 : 400,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Category Hero Banner ── */}
        {catDesc && (
          <AnimateIn key={activeCategory} className="mb-5">
            <div className="rounded-2xl px-5 py-4 flex items-center gap-3"
              style={{ background: "rgba(201,160,40,0.07)", border: "1px solid rgba(201,160,40,0.18)" }}>
              <Package size={18} style={{ color: "#C9A028", flexShrink: 0 }} />
              <div>
                <p className="font-body font-semibold text-sm" style={{ color: "#3D2B1F" }}>
                  {activeCat?.name ?? "All Products"}
                  <span className="ml-2 font-normal text-xs" style={{ color: "#7A5A48" }}>
                    ({filtered.length} {filtered.length === 1 ? "item" : "items"})
                  </span>
                </p>
                <p className="font-body text-xs mt-0.5" style={{ color: "#7A5A48" }}>{catDesc}</p>
              </div>
            </div>
          </AnimateIn>
        )}

        {/* ── Sort + Availability (full row on desktop, stacked on mobile) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <p className="font-body text-xs text-brand-creamDim/40">
            {filtered.length} {filtered.length === 1 ? "product" : "products"} found
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <SortAsc size={14} className="text-brand-gold" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="font-body text-xs text-brand-creamDim bg-transparent border border-brand-cream/15 rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:border-brand-cream/35 transition-colors"
                style={{ background: "rgba(255,248,243,0.05)", minHeight: "44px" }}
              >
                <option value="default">Default</option>
                <option value="az">Name A → Z</option>
                <option value="za">Name Z → A</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>

            {/* Availability toggle */}
            <label className="flex items-center gap-2 cursor-pointer" style={{ minHeight: "44px" }}>
              <div className="relative" onClick={() => setShowUnavailable(s => !s)}>
                <div className="w-9 h-5 rounded-full transition-colors duration-300"
                  style={{ background: showUnavailable ? "var(--gold)" : "rgba(61,43,31,0.2)" }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300"
                    style={{ left: showUnavailable ? "calc(100% - 18px)" : "2px" }} />
                </div>
              </div>
              <span className="font-body text-xs text-brand-creamDim/50">
                {showUnavailable ? "All items" : "In stock only"}
              </span>
            </label>
          </div>
        </div>

        {/* ── Product Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <p className="font-display text-xl sm:text-2xl text-brand-creamDim/40 mb-2">No products found</p>
            <p className="font-body text-sm text-brand-creamDim/30">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
