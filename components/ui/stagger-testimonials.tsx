"use client"

import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvatarGradient, getInitials } from "@/lib/utils";

const SQRT_5000 = Math.sqrt(5000);

export interface StaggerTestimonialItem {
  tempId: number;
  testimonial: string;
  by: string;
  rating: number;
  createdAt: string;
  productName: string;
  productSlug: string;
  productImage?: string | null;
  productDescription?: string | null;
  productPrice?: number | null;
}

const defaultTestimonials: StaggerTestimonialItem[] = [
  {
    tempId: 0,
    testimonial: "My favorite piece in the collection. Premium stitching and perfect texture.",
    by: "Ayesha",
    rating: 5,
    createdAt: new Date().toISOString(),
    productName: "Handmade Tote",
    productSlug: "products",
    productImage: null,
    productDescription: "Premium handcrafted tote with smooth finishing.",
    productPrice: 2800,
  },
  {
    tempId: 1,
    testimonial: "Color combination is exactly what I requested and delivery was smooth.",
    by: "Noor",
    rating: 5,
    createdAt: new Date().toISOString(),
    productName: "Custom Sweater",
    productSlug: "products",
    productImage: null,
    productDescription: "Custom colorwork and soft texture.",
    productPrice: 4500,
  },
  {
    tempId: 2,
    testimonial: "The product quality feels luxurious and the design is exactly like the photo.",
    by: "Maham",
    rating: 4,
    createdAt: new Date().toISOString(),
    productName: "Crochet Flower Bag",
    productSlug: "products",
    productImage: null,
    productDescription: "Stylish daily-use bag with floral crochet details.",
    productPrice: 3200,
  },
];

interface TestimonialCardProps {
  position: number;
  testimonial: StaggerTestimonialItem;
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  testimonial,
  handleMove,
  cardSize,
}) => {
  const isCenter = position === 0;
  const cardBackground = isCenter
    ? "linear-gradient(145deg, rgba(12,12,12,0.96), rgba(26,16,10,0.96))"
    : "linear-gradient(145deg, rgba(10,10,10,0.94), rgba(18,18,18,0.92))";
  const cardShadow = isCenter
    ? "0 22px 55px rgba(0,0,0,0.48), 0px 8px 0px 2px rgba(201,160,40,0.45)"
    : "0 14px 36px rgba(0,0,0,0.34)";

  const formattedDate = new Date(testimonial.createdAt).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const shortProductInfo = testimonial.productDescription
    ? testimonial.productDescription.slice(0, 88) + (testimonial.productDescription.length > 88 ? "..." : "")
    : "Handcrafted with premium finishing.";

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "group absolute left-1/2 top-1/2 cursor-pointer border-2 p-6 transition-all duration-700 ease-in-out",
        isCenter
          ? "z-10 text-[#F7EEE4] border-[#C9A028]/60"
          : "z-0 text-[#E6D8C7] border-white/10 hover:border-[#C9A028]/45 hover:-translate-y-1"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        background: cardBackground,
        clipPath: "polygon(42px 0%, calc(100% - 42px) 0%, 100% 42px, 100% 100%, calc(100% - 42px) 100%, 42px 100%, 0 100%, 0 0)",
        transform: `
          translate(-50%, -50%)
          translateX(${(cardSize / 1.55) * position}px)
          translateY(${isCenter ? -55 : position % 2 ? 16 : -16}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.3 : -2.3}deg)
        `,
        boxShadow: cardShadow,
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
        }}
      />
      <div className="mb-4 flex items-center justify-between gap-3">
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center text-base font-semibold"
          style={{
            background: getAvatarGradient(testimonial.by),
            color: "#fff",
            boxShadow: "3px 3px 0px hsl(var(--background))",
          }}
        >
          {getInitials(testimonial.by)}
        </div>
        <Link
          href={`/products/${testimonial.productSlug}`}
          className={cn(
            "h-24 w-24 rounded-2xl overflow-hidden border border-border transition-transform duration-300",
            "group-hover:scale-105"
          )}
        >
          {testimonial.productImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={testimonial.productImage} alt={testimonial.productName} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-muted/40 flex items-center justify-center text-[10px] px-1 text-center">Product</div>
          )}
        </Link>
      </div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={`${testimonial.tempId}-star-${index}`}
              size={13}
              className={index < testimonial.rating ? "text-[#E2B84A] fill-[#E2B84A]" : "text-white/25"}
            />
          ))}
        </div>
        <span className="text-[11px] text-[#C9A47A]">{formattedDate}</span>
      </div>
      <h3 className={cn(
        "text-base sm:text-lg font-medium leading-snug",
        isCenter ? "text-[#F9F2E9]" : "text-[#EBDCCB]"
      )}>
        "{testimonial.testimonial}"
      </h3>
      <p className="mt-3 text-[13px] text-[#D4BE9D] leading-relaxed line-clamp-2">{shortProductInfo}</p>
      <p className={cn(
        "mt-4 text-xs uppercase tracking-wider",
        isCenter ? "text-[#D9B471]" : "text-[#C7A879]"
      )}>
        {testimonial.productName} {testimonial.productPrice ? `• Rs ${Math.round(testimonial.productPrice).toLocaleString("en-PK")}` : ""}
      </p>
      <p className={cn(
        "mt-2 text-sm italic",
        isCenter ? "text-[#F3E6D8]" : "text-[#D6C4AE]"
      )}>
        - {testimonial.by}
      </p>
    </div>
  );
};

interface StaggerTestimonialsProps {
  items?: StaggerTestimonialItem[];
}

export const StaggerTestimonials: React.FC<StaggerTestimonialsProps> = ({ items }) => {
  const [cardSize, setCardSize] = useState(420);
  const [testimonialsList, setTestimonialsList] = useState<StaggerTestimonialItem[]>(items && items.length > 0 ? items : defaultTestimonials);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (items && items.length > 0) {
      setTestimonialsList(items);
    }
  }, [items]);

  const handleMove = useCallback((steps: number) => {
    setTestimonialsList((current) => {
      const newList = [...current];
      if (steps > 0) {
        for (let i = steps; i > 0; i -= 1) {
          const item = newList.shift();
          if (!item) return current;
          newList.push({ ...item, tempId: Math.random() });
        }
      } else {
        for (let i = steps; i < 0; i += 1) {
          const item = newList.pop();
          if (!item) return current;
          newList.unshift({ ...item, tempId: Math.random() });
        }
      }
      return newList;
    });
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 420 : 320);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => setReduceMotion(mediaQuery.matches);
    applyPreference();

    mediaQuery.addEventListener("change", applyPreference);
    return () => mediaQuery.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    if (isPaused || reduceMotion || testimonialsList.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      handleMove(1);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isPaused, reduceMotion, testimonialsList.length, handleMove]);

  if (!testimonialsList.length) {
    return null;
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl border border-white/10"
      style={{ height: 600 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {testimonialsList.map((testimonial, index) => {
        const midpoint = Math.floor(testimonialsList.length / 2);
        const position = index - midpoint;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors duration-700",
            "bg-black/85 text-[#F3E6D8] border-2 border-white/15 hover:bg-[#C9A028] hover:text-[#1A0A05]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors duration-700",
            "bg-black/85 text-[#F3E6D8] border-2 border-white/15 hover:bg-[#C9A028] hover:text-[#1A0A05]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
