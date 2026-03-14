"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export interface ParallaxCardItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl?: string;
  actionLabel?: string;
  href?: string;
  priceLabel?: string;
  inWishlist?: boolean;
  onWishlistToggle?: () => void;
}

interface ParallaxCardCarouselProps {
  cards?: ParallaxCardItem[];
  autoplaySpeed?: number;
  enableAutoplay?: boolean;
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  perspective?: number;
  maxRotation?: number;
  backgroundClassName?: string;
}

export default function ParallaxCardCarousel({
  cards = [],
  autoplaySpeed = 5000,
  enableAutoplay = true,
  cardWidth = 320,
  cardHeight = 450,
  gap = 30,
  perspective = 1200,
  maxRotation = 20,
  backgroundClassName = "",
}: ParallaxCardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(enableAutoplay);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef(0);

  const totalCards = cards.length;

  const goToNext = useCallback(() => {
    if (!totalCards) return;
    setActiveIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const goToPrev = useCallback(() => {
    if (!totalCards) return;
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  const goToIndex = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (!isAutoPlaying || isHovered || totalCards <= 1) {
      return;
    }

    autoplayTimerRef.current = setTimeout(() => {
      goToNext();
    }, autoplaySpeed);

    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [activeIndex, autoplaySpeed, goToNext, isAutoPlaying, isHovered, totalCards]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, totalCards]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;

    const rect = carouselRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    setMousePosition({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
  };

  const getCardStyle = (index: number) => {
    const isActive = index === activeIndex;
    const distance = (index - activeIndex + totalCards) % totalCards;
    let adjustedDistance = distance;
    if (distance > totalCards / 2) adjustedDistance = distance - totalCards;

    const x = adjustedDistance * (cardWidth + gap);
    const scale = isActive ? 1 : 0.88 - Math.min(Math.abs(adjustedDistance), 2) * 0.06;
    const zIndex = totalCards - Math.abs(adjustedDistance);
    const opacity = 1 - Math.min(Math.abs(adjustedDistance) * 0.2, 0.6);

    let rotateY = 0;
    let rotateX = 0;
    let translateZ = 0;

    if (isActive && isHovered) {
      rotateY = -mousePosition.x * maxRotation;
      rotateX = mousePosition.y * (maxRotation * 0.45);
      translateZ = 38;
    }

    return {
      x,
      scale,
      zIndex,
      opacity,
      rotateY,
      rotateX,
      translateZ,
    };
  };

  if (!totalCards) {
    return null;
  }

  return (
    <div className={`relative w-full rounded-3xl p-4 sm:p-6 overflow-hidden ${backgroundClassName}`}>
      <div
        ref={carouselRef}
        className="relative w-full max-w-6xl mx-auto z-10"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label="Product card carousel"
        style={{
          perspective: `${perspective}px`,
          height: `${cardHeight + 130}px`,
        }}
      >
        <div className="relative h-full flex items-center justify-center overflow-hidden">
          {cards.map((card, index) => {
            const isActive = index === activeIndex;
            const style = getCardStyle(index);

            const content = (
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/15 bg-[linear-gradient(165deg,rgba(14,14,14,0.95),rgba(22,22,22,0.96)_45%,rgba(18,18,18,0.96))] shadow-[0_26px_54px_rgba(0,0,0,0.45)]">
                {card.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.imageUrl} alt={card.title} className="h-52 w-full object-cover" />
                ) : (
                  <div className="h-52 w-full bg-black/25" />
                )}

                <div className="absolute top-3 right-3 z-20">
                  <button
                    type="button"
                    className="h-9 w-9 rounded-full bg-black/45 border border-white/25 flex items-center justify-center hover:scale-105 transition"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      card.onWishlistToggle?.();
                    }}
                    aria-label="Toggle wishlist"
                  >
                    <Heart size={16} className={card.inWishlist ? "text-[#D0707A] fill-[#D0707A]" : "text-[#F4EADD]"} />
                  </button>
                </div>

                <div className="p-4 flex flex-col h-[calc(100%-13rem)]">
                  <div className="mb-2">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A47A]">{card.subtitle ?? "Featured"}</p>
                    <h3 className="text-[1.7rem] font-display text-[#F7EEE4] leading-tight mt-1">{card.title}</h3>
                  </div>

                  <p className="text-[15px] text-[#D8C8B2] leading-relaxed line-clamp-4">{card.description}</p>

                  <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#F2CE72]">{card.priceLabel ?? "Price on request"}</p>
                    <span className="px-3 py-1.5 rounded-full border border-[#C9A028]/40 text-[11px] text-[#F7EEE4] bg-white/5">
                      {card.actionLabel ?? "View"}
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(201,160,40,0.14),transparent_45%)]" />
              </div>
            );

            return (
              <motion.div
                key={card.id}
                className="absolute cursor-pointer"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={style}
                transition={{ type: "spring", stiffness: 280, damping: 28, mass: 1 }}
                onClick={() => goToIndex(index)}
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  transformStyle: "preserve-3d",
                }}
                whileHover={{ scale: isActive ? 1.02 : undefined }}
                role="button"
                tabIndex={isActive ? 0 : -1}
                aria-label={`Card ${index + 1}: ${card.title}`}
                aria-current={isActive ? "true" : "false"}
              >
                {card.href ? <Link href={card.href} className="block h-full w-full">{content}</Link> : content}
              </motion.div>
            );
          })}
        </div>

        <div className="absolute bottom-[-12px] left-0 right-0 flex justify-center items-center gap-4 py-5">
          <button
            className="p-3 rounded-full bg-black/45 border border-white/20 hover:bg-black/65 transition-colors text-white"
            onClick={goToPrev}
            aria-label="Previous card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {cards.map((_, index) => (
              <button
                key={`dot-${index}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index ? "bg-[#E2B84A] w-6" : "bg-white/40 hover:bg-white/60 w-2.5"
                }`}
                onClick={() => goToIndex(index)}
                aria-label={`Go to card ${index + 1}`}
                aria-current={activeIndex === index ? "true" : "false"}
              />
            ))}
          </div>

          <button
            className="p-3 rounded-full bg-black/45 border border-white/20 hover:bg-black/65 transition-colors text-white"
            onClick={goToNext}
            aria-label="Next card"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            className={`p-3 rounded-full border border-white/20 transition-colors text-white ${
              isAutoPlaying ? "bg-[#C9A028]/50" : "bg-black/45 hover:bg-black/65"
            }`}
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            aria-label={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
            title={isAutoPlaying ? "Pause" : "Play"}
          >
            {isAutoPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
