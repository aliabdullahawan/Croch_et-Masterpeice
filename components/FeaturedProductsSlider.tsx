"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import AnimateIn, { AnimateInGroup } from "@/components/ui/AnimateIn";
import { MOCK_PRODUCTS } from "@/data/products";

export default function FeaturedProductsSlider() {
  const products = MOCK_PRODUCTS.filter(p => p.is_featured);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toggle, isInList } = useWishlist();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  // Auto-scroll logic for circular-like feel
  useEffect(() => {
    if (isHovering || products.length <= 1) return;
    
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const reachedEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 20;
        
        if (reachedEnd) {
          // Wrap around seamlessly-ish by scrolling back to 0
          scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Use a fixed width or scroll by a percentage. 300px roughly matches item width + gap.
          scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovering, products.length]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div 
      className="relative w-full max-w-[1400px] mx-auto group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={() => setIsHovering(true)}
      onTouchEnd={() => setIsHovering(false)}
    >
      {/* ── Scroll Container ── */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-8 pt-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((p) => (
          <div key={p.id} className="min-w-[260px] md:min-w-[300px] snap-center shrink-0">
            <Link href={`/products/${p.slug}`} className="group/card block w-full relative">
              {/* Image Container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#FDF8F5] transition-all duration-500 group-hover/card:shadow-[0_20px_40px_-15px_rgba(201,160,40,0.15)] mb-4">
                <Image
                  src={p.images?.[0] ?? "/placeholder-product.jpg"}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover/card:bg-black/5" />
                
                {/* Heart Button */}
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(p); }}
                  className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-transform duration-300 hover:scale-110 active:scale-95"
                  aria-label="Toggle Wishlist"
                >
                  <Heart 
                    size={16} 
                    className={`transition-colors duration-300 ${isInList(p.id) ? "fill-[#D0707A] text-[#D0707A]" : "text-[#8A6A58] hover:text-[#D0707A]"}`} 
                  />
                </button>
              </div>

              {/* Details */}
              <div className="px-1 text-center flex flex-col items-center">
                <h3 className="font-display text-lg text-[#1A0A05] transition-colors duration-300 group-hover/card:text-[#C9A028]">
                  {p.name}
                </h3>
                <p className="font-body text-[13px] tracking-widest text-[#8A6A58] mt-1 uppercase" style={{ fontWeight: 500 }}>
                  {p.price ? `PKR ${p.price.toLocaleString()}` : "Price on request"}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* ── Navigation Buttons ── */}
      <button
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className={`absolute left-0 top-[40%] -translate-y-1/2 -translate-x-2 md:-translate-x-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1A0A05] shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-0 disabled:scale-90`}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className={`absolute right-0 top-[40%] -translate-y-1/2 translate-x-2 md:translate-x-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1A0A05] shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-0 disabled:scale-90`}
      >
        <ChevronRight size={20} />
      </button>

      {/* View All */}
      <AnimateIn delay={0.3} className="text-center mt-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-body text-[13px] font-bold uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-lg"
          style={{
            border: "1px solid rgba(201,160,40,0.3)",
            color: "#C9A028",
            background: "transparent",
          }}
        >
          View All Products
        </Link>
      </AnimateIn>
    </div>
  );
}
