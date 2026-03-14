"use client";
/**
 * app/products/page.tsx — Shop / Products Catalogue
 * Mobile-first responsive layout.
 * Features: sort, availability filter, search, horizontal-scroll category tabs
 */

"use client";
import { useState, useMemo, Suspense, useEffect } from "react";
import Image                  from "next/image";
import ProductCard            from "@/components/ProductCard";
import GlowSearchBar          from "@/components/ui/animated-glowing-search-bar";
import { fetchProducts, fetchStoreCategories } from "@/lib/db-client";
import type { Product } from "@/lib/types";
import { SortAsc, Package } from "lucide-react";
import { useSearchParams } from "next/navigation";
import AnimateIn, { AnimateInGroup } from "@/components/ui/AnimateIn";

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

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [sortBy,         setSortBy]         = useState<SortOption>("default");
  const [showUnavailable, setShowUnavailable] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeCategories, setStoreCategories] = useState<Array<{ id: number; slug: string; name: string }>>([]);

  useEffect(() => {
    void (async () => {
      const [rows, categoryRows] = await Promise.all([
        fetchProducts(),
        fetchStoreCategories(),
      ]);
      setProducts(rows);
      setStoreCategories(categoryRows);
    })();
  }, []);

  const categories = useMemo(() => {
    return [{ id: 0, slug: "all", name: "All" }, ...storeCategories];
  }, [storeCategories]);

  const filtered = useMemo(() => {
    let result = [...products];

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

    if (sortBy !== "default") {
      switch (sortBy) {
        case "az":         result.sort((a, b) => a.name.localeCompare(b.name)); break;
        case "za":         result.sort((a, b) => b.name.localeCompare(a.name)); break;
        case "price-asc":  result.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)); break;
        case "price-desc": result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break;
      }
    }

    return result;
  }, [products, activeCategory, searchQuery, sortBy, showUnavailable]);

  const activeCat = categories.find(c => c.slug === activeCategory);
  const catDesc   = CAT_DESCRIPTIONS[activeCategory] ?? "";

  return (
    <div className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen bg-brand-base transition-colors duration-700">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
        <AnimateIn className="text-center mb-8 sm:mb-12">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-brand-gold">Browse</span>
          <h1 className="font-display mt-3 mb-2 text-brand-cream"
            style={{ fontSize: "clamp(2.25rem, 7vw, 4rem)" }}>
            Our Collection
          </h1>
          <div className="divider" />
          <p className="font-body text-sm text-brand-creamDim max-w-sm mx-auto">
            Every piece is handmade with love. Add to cart and we&apos;ll arrange delivery via WhatsApp.
          </p>
        </AnimateIn>

        {/* ── Search ── */}
        <AnimateIn delay={0.2} className="flex justify-center mb-5 sm:mb-6">
          <GlowSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search products..." />
        </AnimateIn>

        {/* ── Category tabs (horizontal scroll on mobile) ── */}
        <AnimateIn delay={0.25} className="relative mb-4">
          <AnimateInGroup stagger={0.05} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {categories.map(cat => (
              <AnimateIn key={cat.slug}>
                <button
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
              </AnimateIn>
            ))}
          </AnimateInGroup>
        </AnimateIn>

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
          <AnimateIn className="text-center py-16 sm:py-20">
            <p className="font-display text-xl sm:text-2xl text-brand-creamDim/40 mb-2">No products found</p>
            <p className="font-body text-sm text-brand-creamDim/30">Try a different category or search term</p>
          </AnimateIn>
        ) : (
          <AnimateInGroup stagger={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map(product => (
              <AnimateIn key={product.id}>
                <ProductCard product={product} />
              </AnimateIn>
            ))}
          </AnimateInGroup>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-base" />}>
      <ProductsPageContent />
    </Suspense>
  );
}
