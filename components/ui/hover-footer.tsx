"use client";
/**
 * components/ui/hover-footer.tsx
 * ─────────────────────────────────────────────────────
 * TextHoverEffect: SVG text with animated stroke draw-on
 * and radial gradient reveal on mouse hover.
 *
 * FooterBackgroundGradient: brand-toned radial gradient overlay.
 *
 * Adapted from hover-footer by Nurui — colours remapped to
 * Croch_et Masterpiece brand palette:
 *   #102C26 deep green  →  #c4843c gold  →  #F7E7CE cream
 */

import React, { useRef, useEffect, useState } from "react";
import { motion }                              from "framer-motion";

/* ── cn helper (inline, avoids needing shadcn utils) ── */
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ══════════════════════════════════════════════════════
   TextHoverEffect
   • Draws brand name with an animated SVG stroke
   • On hover: radial gold/cream gradient reveals under cursor
══════════════════════════════════════════════════════ */
export const TextHoverEffect = ({
  text,
  duration,
  className,
}: {
  text:       string;
  duration?:  number;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor,       setCursor]       = useState({ x: 0, y: 0 });
  const [hovered,      setHovered]      = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current) {
      const rect         = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - rect.left) / rect.width)  * 100;
      const cyPercentage = ((cursor.y - rect.top)  / rect.height) * 100;
      setMaskPosition({ cx: `${cxPercentage}%`, cy: `${cyPercentage}%` });
    }
  }, [cursor]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn("select-none uppercase cursor-pointer", className)}
    >
      <defs>
        {/* Hover reveal gradient — brand gold → cream palette */}
        <linearGradient
          id="cmTextGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%"   stopColor="#F7E7CE" />   {/* cream */}
              <stop offset="30%"  stopColor="#e0a85a" />   {/* gold light */}
              <stop offset="60%"  stopColor="#c4843c" />   {/* brand gold */}
              <stop offset="85%"  stopColor="#d9c8ae" />   {/* cream dim */}
              <stop offset="100%" stopColor="#F7E7CE" />   {/* cream */}
            </>
          )}
        </linearGradient>

        {/* Radial mask that follows the cursor */}
        <motion.radialGradient
          id="cmRevealMask"
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%"   stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id="cmTextMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#cmRevealMask)" />
        </mask>
      </defs>

      {/* Layer 1: faint outline (visible on hover) */}
      <text
        x="50%" y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        style={{
          fill:         "transparent",
          stroke:       "rgba(247,231,206,0.12)",
          fontFamily:   "var(--font-cormorant), Georgia, serif",
          fontSize:     "7rem",
          fontWeight:   700,
          opacity:      hovered ? 0.7 : 0,
          transition:   "opacity 0.3s ease",
        }}
      >
        {text}
      </text>

      {/* Layer 2: animated stroke draw-on — brand gold */}
      <motion.text
        x="50%" y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        style={{
          fill:       "transparent",
          stroke:     "rgba(196,132,60,0.55)",
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize:   "7rem",
          fontWeight: 700,
        }}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0,    strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>

      {/* Layer 3: hover-reveal colour layer */}
      <text
        x="50%" y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#cmTextGradient)"
        strokeWidth="0.3"
        mask="url(#cmTextMask)"
        style={{
          fill:       "transparent",
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize:   "7rem",
          fontWeight: 700,
        }}
      >
        {text}
      </text>
    </svg>
  );
};

/* ══════════════════════════════════════════════════════
   FooterBackgroundGradient
   Brand-toned: deep green base → warm gold glow
══════════════════════════════════════════════════════ */
export const FooterBackgroundGradient = () => (
  <div
    className="absolute inset-0 z-0 pointer-events-none"
    style={{
      background:
        "radial-gradient(125% 125% at 50% 10%, rgba(245,237,228,0.6) 40%, rgba(201,160,40,0.08) 100%)",
    }}
  />
);
