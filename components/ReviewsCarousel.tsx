"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const reviews = [
  {
    id: "r1",
    rating: 5,
    body: "The key chains are adorable! I bought them as gifts and everyone kept asking where I got them from!",
    name: "Zainab Raza",
    location: "Islamabad",
    avatar: "Z",
  },
  {
    id: "r2",
    rating: 4,
    body: "Custom earrings exceeded my expectations. The seller is super responsive through WhatsApp and the craftsmanship is top notch.",
    name: "Hina Bibi",
    location: "Rawalpindi",
    avatar: "H",
  },
  {
    id: "r3",
    rating: 5,
    body: '"Bought gloves for winter and they are warm, stylish and durable. Will definitely order again!"',
    name: "Maryam Noor",
    location: "Faisalabad",
    avatar: "M",
  },
  {
    id: "r4",
    rating: 5,
    body: "The Quran pak cover is so beautiful and thoughtful. Made with care and love. Highly recommended.",
    name: "Amina Khatoon",
    location: "Multan",
    avatar: "A",
  },
  {
    id: "r5",
    rating: 5,
    body: "I ordered a custom bag and it looks stunning! The process was easy — just messaged on WhatsApp!",
    name: "Sara Hussain",
    location: "Peshawar",
    avatar: "S",
  },
  {
    id: "r6",
    rating: 5,
    body: "Absolutely love the crochet scarf. So soft and the best gift for my daughter. Will order again!",
    name: "Fatima Zareen",
    location: "Sialkot",
    avatar: "F",
  },
];

export default function ReviewsCarousel() {
  const [active, setActive] = useState(2);

  const next = useCallback(() => setActive(i => (i + 1) % reviews.length), []);
  const prev = useCallback(() => setActive(i => (i - 1 + reviews.length) % reviews.length), []);

  useEffect(() => {
    const timer = setInterval(next, 3200);
    return () => clearInterval(timer);
  }, [next]);

  const getPos = (idx: number) => {
    const total = reviews.length;
    let diff = idx - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <div className="relative w-full">
      {/* Carousel stage */}
      <div className="relative h-[340px] flex items-center justify-center" style={{ perspective: "1200px" }}>
        {reviews.map((r, idx) => {
          const pos = getPos(idx);
          const absPos = Math.abs(pos);

          if (absPos > 2) return null; // only render ±2 around active

          const isCenter = pos === 0;
          const x = pos * 205;
          const rotateY = pos * -18;
          const scale = isCenter ? 1.12 : absPos === 1 ? 0.82 : 0.65;
          const z = isCenter ? 0 : absPos === 1 ? -80 : -160;
          const opacity = isCenter ? 1 : absPos === 1 ? 0.72 : 0.42;

          return (
            <div
              key={r.id}
              onClick={() => setActive(idx)}
              className="absolute cursor-pointer select-none"
              style={{
                transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                transition: "all 0.55s cubic-bezier(0.4,0,0.2,1)",
                zIndex: isCenter ? 10 : absPos === 1 ? 5 : 1,
                width: "300px",
              }}
            >
              <div
                className="rounded-2xl p-7 flex flex-col gap-4 h-[260px]"
                style={{
                  background: isCenter
                    ? "linear-gradient(135deg, #1a2e22 0%, #0f1f15 100%)"
                    : "linear-gradient(135deg, #141a14 0%, #0c130c 100%)",
                  border: isCenter
                    ? "1.5px solid rgba(195,152,72,0.4)"
                    : "1px solid rgba(255,255,255,0.05)",
                  boxShadow: isCenter
                    ? "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(195,152,72,0.1)"
                    : "0 8px 24px rgba(0,0,0,0.3)",
                }}
              >
                {/* Avatar + stars */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #c3944822, #c39448)",
                      color: "#F7E7CE",
                    }}
                  >
                    {r.avatar}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={12} className="text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                </div>

                {/* Review text */}
                <p className="font-body text-sm leading-relaxed flex-grow" style={{ color: "#d9c8ae" }}>
                  "{r.body}"
                </p>

                {/* Author */}
                <div className="pt-3 border-t border-white/8">
                  <p className="font-body text-xs" style={{ color: "#c39448" }}>
                    — {r.name}, {r.location}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            border: "1px solid rgba(195,152,72,0.35)",
            background: "rgba(195,152,72,0.08)",
            color: "#c39448",
          }}
          aria-label="Previous review"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="transition-all duration-300"
              style={{
                width: i === active ? "24px" : "8px",
                height: "8px",
                borderRadius: "999px",
                background: i === active ? "#c39448" : "rgba(195,152,72,0.25)",
              }}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{
            border: "1px solid rgba(195,152,72,0.35)",
            background: "rgba(195,152,72,0.08)",
            color: "#c39448",
          }}
          aria-label="Next review"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
