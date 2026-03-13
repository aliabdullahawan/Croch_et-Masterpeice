"use client";
/**
 * components/CategoriesAccordion.tsx
 * All 6 categories displayed + accordion expand on hover.
 * Now using framer-motion for buttery smooth layout transitions.
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [active, setActive] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Auto-scroll through categories every 4 seconds, pausing when hovered
    if (isHovering) return;
    
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % categories.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [isHovering]);

  return (
    <div 
      className="flex h-[480px] md:h-[560px] gap-2 md:gap-3 w-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {categories.map((cat, i) => {
        const isOpen = active === i;
        
        return (
          <motion.div
            key={cat.id}
            layout
            initial={false}
            animate={{
              width: isOpen ? "40%" : `${60 / (categories.length - 1)}%`,
              minWidth: isOpen ? "220px" : "50px",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className="relative overflow-hidden cursor-pointer flex-shrink-0 rounded-[2rem] group"
            style={{
              boxShadow: isOpen ? "0 20px 40px rgba(0,0,0,0.2)" : "none",
            }}
          >
            {/* Background Image */}
            <motion.div
              animate={{
                filter: isOpen ? "grayscale(0%) brightness(0.85)" : "grayscale(80%) brightness(0.4)",
                scale: isOpen ? 1.05 : 1,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>

            {/* Premium Gradient Overlay */}
            <motion.div
              animate={{
                background: isOpen
                  ? `linear-gradient(to top, rgba(15,5,0,0.95) 0%, rgba(15,5,0,0.5) 50%, transparent 100%)`
                  : "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)",
              }}
              transition={{ duration: 0.5 }}
              className="absolute inset-x-0 bottom-0 h-full pointer-events-none"
            />

            <AnimatePresence initial={false} mode="wait">
              {/* Collapsed: vertical label */}
              {!isOpen && (
                <motion.div 
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <p
                    className="font-body text-[11px] md:text-xs uppercase tracking-[0.3em] whitespace-nowrap opacity-70 group-hover:opacity-100 transition-opacity"
                    style={{
                      color: "#FFF4E6",
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                    }}
                  >
                    {cat.label}
                  </p>
                </motion.div>
              )}

              {/* Open: bottom content */}
              {isOpen && (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col items-start pointer-events-none"
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md"
                    style={{ background: `rgba(255,255,255,0.15)`, border: `1px solid rgba(255,255,255,0.2)` }}
                  >
                    <ShoppingBag size={18} style={{ color: "#FFF4E6" }} />
                  </div>
                  
                  <h3 className="font-display text-2xl md:text-3xl mb-2" style={{ color: "#FFF4E6", fontWeight: 500 }}>
                    {cat.label}
                  </h3>
                  
                  <p 
                    className="font-body text-[13px] md:text-sm leading-relaxed mb-6 max-w-[280px]" 
                    style={{ color: "rgba(255,244,230,0.7)" }}
                  >
                    {cat.description}
                  </p>
                  
                  <Link
                    href={`/products?category=${cat.slug}`}
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs uppercase tracking-wider font-body font-bold transition-transform duration-300 pointer-events-auto hover:scale-105 active:scale-95"
                    style={{ background: "#FFF4E6", color: "#1A0A05", boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}
                  >
                    Explore Collection
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
