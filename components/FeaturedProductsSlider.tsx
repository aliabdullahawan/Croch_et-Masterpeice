"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart, ShoppingCart } from "lucide-react";

const products = [
  {
    id: "prod-001",
    name: "Handcrafted Sweater",
    category: "Sweaters",
    description: "Beautiful ladies sweater in rich cream yarn, fully customisable.",
    price: 2500,
    image: "https://i.pinimg.com/736x/e7/cf/cb/e7cfcbd7a8af10b8839c8d9a3d8eb4ce.jpg",
    badge: null,
  },
  {
    id: "prod-002",
    name: "Crochet Tote Bag",
    category: "Bags",
    description: "Spacious handwoven bag perfect for everyday use.",
    price: 1800,
    image: "https://i.pinimg.com/736x/9c/f2/8b/9cf28b4df4e06e0ca34fbe87f25734b6.jpg",
    badge: null,
  },
  {
    id: "prod-003",
    name: "Baby Blanket Set",
    category: "Baby",
    description: "Soft pastel crochet blankets with matching accessories for newborns.",
    price: 1500,
    image: "https://i.pinimg.com/736x/f4/b0/00/f4b000a6880f7e8d0c677812d789e001.jpg",
    badge: "Baby",
  },
  {
    id: "prod-004",
    name: "Crochet Earrings",
    category: "Accessories",
    description: "Delicate handcrafted earrings in various vibrant colors.",
    price: 450,
    image: "https://i.pinimg.com/1200x/ae/cf/d7/aecfd72b2439914647ec06d19cb182b5.jpg",
    badge: null,
  },
  {
    id: "prod-005",
    name: "Quran Pak Cover",
    category: "Special",
    description: "Beautifully crafted cover for Quran Pak made with respect and care.",
    price: 1200,
    image: "https://i.pinimg.com/736x/5d/f7/69/5df7696c4f24b7961c8c72748a355ff8.jpg",
    badge: "Special",
  },
  {
    id: "prod-006",
    name: "Crochet Bouquet",
    category: "Decor",
    description: "Everlasting handcrafted flower bouquet. The best gift that never wilts.",
    price: 2000,
    image: "https://i.pinimg.com/736x/e7/cf/cb/e7cfcbd7a8af10b8839c8d9a3d8eb4ce.jpg",
    badge: "Decor",
  },
];

export default function FeaturedProductsSlider() {
  const [active, setActive] = useState(2);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setActive(i => (i + 1) % products.length), []);
  const prev = useCallback(() => setActive(i => (i - 1 + products.length) % products.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [next, paused]);

  const getPos = (idx: number) => {
    const total = products.length;
    let diff = idx - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slider stage */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden" style={{ perspective: "1400px" }}>
        {products.map((p, idx) => {
          const pos = getPos(idx);
          const absPos = Math.abs(pos);

          if (absPos > 2) return null;

          const isCenter = pos === 0;
          const x = pos * 260;
          const scale = isCenter ? 1 : absPos === 1 ? 0.78 : 0.62;
          const z = isCenter ? 0 : absPos === 1 ? -60 : -140;
          const opacity = isCenter ? 1 : absPos === 1 ? 0.7 : 0.4;

          return (
            <div
              key={p.id}
              onClick={() => !isCenter && setActive(idx)}
              className="absolute cursor-pointer select-none"
              style={{
                transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
                opacity,
                transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                zIndex: isCenter ? 10 : absPos === 1 ? 5 : 1,
                width: "220px",
              }}
            >
              <div
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "linear-gradient(180deg, #181c15 0%, #0f1208 100%)",
                  border: isCenter
                    ? "1.5px solid rgba(195,152,72,0.35)"
                    : "1px solid rgba(255,255,255,0.05)",
                  boxShadow: isCenter
                    ? "0 30px 70px rgba(0,0,0,0.55)"
                    : "0 10px 28px rgba(0,0,0,0.3)",
                }}
              >
                {/* Image */}
                <div className="relative h-[200px] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover"
                    style={{ transition: "transform 0.5s ease" }}
                  />
                  {isCenter && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  )}
                  {p.badge && isCenter && (
                    <div
                      className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: "rgba(195,152,72,0.9)", color: "#0f1208" }}
                    >
                      {p.badge}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2">
                  <p className="font-body text-[10px] uppercase tracking-widest" style={{ color: "#c39448" }}>
                    {p.category}
                  </p>
                  <p className="font-display text-sm leading-tight" style={{ color: "#F7E7CE" }}>
                    {p.name}
                  </p>
                  {isCenter && (
                    <p className="font-body text-xs leading-relaxed" style={{ color: "#b8a888", opacity: 0.8 }}>
                      {p.description}
                    </p>
                  )}
                  <p className="font-display text-base" style={{ color: "#c39448" }}>
                    Rs. {p.price.toLocaleString()}
                  </p>
                  {isCenter && (
                    <div className="flex gap-2 mt-1">
                      <button
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-body transition-all duration-200 hover:scale-105"
                        style={{
                          border: "1px solid rgba(195,152,72,0.4)",
                          color: "#c39448",
                          background: "rgba(195,152,72,0.08)",
                        }}
                      >
                        <Heart size={13} /> Wishlist
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-body transition-all duration-200 hover:scale-105"
                        style={{
                          background: "linear-gradient(135deg, #c39448, #a87835)",
                          color: "#0f1208",
                          fontWeight: 600,
                        }}
                      >
                        <ShoppingCart size={13} /> Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 mt-6">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            border: "1px solid rgba(195,152,72,0.3)",
            background: "rgba(195,152,72,0.07)",
            color: "#c39448",
          }}
          aria-label="Previous product"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex gap-2">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: i === active ? "24px" : "8px",
                height: "8px",
                borderRadius: "999px",
                background: i === active ? "#c39448" : "rgba(195,152,72,0.22)",
                transition: "all 0.3s ease",
              }}
              aria-label={`Go to product ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            border: "1px solid rgba(195,152,72,0.3)",
            background: "rgba(195,152,72,0.07)",
            color: "#c39448",
          }}
          aria-label="Next product"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* View all */}
      <div className="text-center mt-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-body text-sm font-medium transition-all duration-200 hover:scale-105"
          style={{
            border: "1.5px solid rgba(195,152,72,0.5)",
            color: "#c39448",
            background: "rgba(195,152,72,0.06)",
          }}
        >
          View All Products →
        </Link>
      </div>
    </div>
  );
}
