"use client";
/**
 * components/CategoriesAccordion.tsx
 * All 6 categories displayed + accordion expand on hover/click
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const categories = [
  {
    id: 1,
    label: "Handmade Sweaters",
    slug: "sweaters",
    description: "Cosy, custom-fitted sweaters knitted with premium yarn.",
    image: "https://i.pinimg.com/736x/e7/cf/cb/e7cfcbd7a8af10b8839c8d9a3d8eb4ce.jpg",
    color: "#E8A0A8",
  },
  {
    id: 2,
    label: "Crochet Blankets",
    slug: "blankets",
    description: "Warm, textured blankets in every size and palette.",
    image: "https://i.pinimg.com/736x/f4/b0/00/f4b000a6880f7e8d0c677812d789e001.jpg",
    color: "#6BBFBF",
  },
  {
    id: 3,
    label: "Custom Orders",
    slug: "custom",
    description: "Your vision brought to life — tell us what you dream of.",
    image: "https://i.pinimg.com/736x/5d/f7/69/5df7696c4f24b7961c8c72748a355ff8.jpg",
    color: "#C9A028",
  },
  {
    id: 4,
    label: "Accessories",
    slug: "accessories",
    description: "Earrings, bracelets, bags, and more. Unique handmade accessories for every occasion.",
    image: "https://i.pinimg.com/1200x/ae/cf/d7/aecfd72b2439914647ec06d19cb182b5.jpg",
    color: "#E8A0A8",
  },
  {
    id: 5,
    label: "Gift Items",
    slug: "gifts",
    description: "Heartfelt, handcrafted gifts for every special moment.",
    image: "https://i.pinimg.com/736x/9c/f2/8b/9cf28b4df4e06e0ca34fbe87f25734b6.jpg",
    color: "#6BBFBF",
  },
  {
    id: 6,
    label: "Baby Items",
    slug: "baby",
    description: "Sweet, soft items for your little ones — bibs, blankets, toys & more.",
    image: "https://i.pinimg.com/736x/f4/b0/00/f4b000a6880f7e8d0c677812d789e001.jpg",
    color: "#C9A028",
  },
];

export default function CategoriesAccordion() {
  const [active, setActive] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % categories.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-[480px] gap-2 w-full">
      {categories.map((cat, i) => {
        const isOpen = active === i;
        return (
          <div
            key={cat.id}
            onClick={() => setActive(i)}
            className="relative overflow-hidden cursor-pointer flex-shrink-0 rounded-2xl"
            style={{
              width: isOpen ? "36%" : `${64 / (categories.length - 1)}%`,
              transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
              minWidth: isOpen ? "200px" : "48px",
            }}
          >
            {/* Background Image */}
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              className="object-cover"
              style={{
                filter: isOpen ? "grayscale(0%) brightness(0.72)" : "grayscale(70%) brightness(0.5)",
                transition: "filter 0.6s ease",
              }}
            />

            {/* Paint wash overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: isOpen
                  ? `linear-gradient(to top, rgba(0,0,0,0.75) 0%, ${cat.color}22 60%, transparent 100%)`
                  : "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 100%)",
                transition: "background 0.5s ease",
              }}
            />

            {/* Collapsed: vertical label */}
            {!isOpen && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p
                  className="font-body text-[10px] uppercase tracking-[0.3em] whitespace-nowrap"
                  style={{
                    color: "rgba(255,248,243,0.8)",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  {cat.label}
                </p>
              </div>
            )}

            {/* Open: bottom content */}
            {isOpen && (
              <div
                className="absolute bottom-0 left-0 right-0 p-6"
                style={{
                  opacity: isOpen ? 1 : 0,
                  transform: `translateY(${isOpen ? 0 : 16}px)`,
                  transition: "opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${cat.color}33`, border: `1px solid ${cat.color}66` }}
                >
                  <ShoppingBag size={15} style={{ color: cat.color }} />
                </div>
                <h3 className="font-display text-xl mb-1" style={{ color: "#FDF8F3" }}>
                  {cat.label}
                </h3>
                <p className="font-body text-xs leading-relaxed mb-4" style={{ color: "rgba(253,248,243,0.7)" }}>
                  {cat.description}
                </p>
                <Link
                  href={`/products?category=${cat.slug}`}
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-xs font-body font-semibold transition-all duration-200 hover:gap-3"
                  style={{ color: cat.color }}
                >
                  Explore →
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
