"use client";
/**
 * components/ui/animated-glowing-search-bar.tsx
 * ─────────────────────────────────────────────────────
 * Animated conic-gradient border search bar.
 * Colors remapped to Croch_et Masterpiece brand:
 *   Gold (#c4843c) and deep green (#102C26) glow arcs.
 *
 * Usage:
 *   <GlowSearchBar value={q} onChange={setQ} placeholder="Search..." />
 */

import React from "react";
import { Search } from "lucide-react";

interface GlowSearchBarProps {
  value:        string;
  onChange:     (val: string) => void;
  placeholder?: string;
  className?:   string;
}

export default function GlowSearchBar({
  value,
  onChange,
  placeholder = "Search products...",
  className   = "",
}: GlowSearchBarProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* ── Glow wrapper ──────────────────────────────── */}
      <div id="glow-poda" className="relative flex items-center justify-center group">

        {/* Layer 1: primary gold/green conic arc */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[70px] max-w-[400px] rounded-xl blur-[3px]
          before:absolute before:content-[''] before:z-[-2] before:w-[999px] before:h-[999px]
          before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-60
          before:transition-all before:duration-[2000ms]
          group-hover:before:rotate-[-120deg]
          group-focus-within:before:rotate-[420deg] group-focus-within:before:duration-[4000ms]"
          style={{
            ["--tw-before-bg" as string]: "none",
          }}
        >
          <div
            className="absolute z-[-2] w-[999px] h-[999px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-60
              transition-all duration-[2000ms] group-hover:-rotate-[120deg]
              group-focus-within:rotate-[420deg] group-focus-within:duration-[4000ms]"
            style={{
              background: "conic-gradient(#07100d, #c4843c 5%, #07100d 38%, #07100d 50%, #102C26 60%, #07100d 87%)",
            }}
          />
        </div>

        {/* Layer 2: inner green haze arc */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[65px] max-w-[398px] rounded-xl blur-[3px]">
          <div
            className="absolute z-[-2] w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[82deg]
              transition-all duration-[2000ms] group-hover:-rotate-[98deg]
              group-focus-within:rotate-[442deg] group-focus-within:duration-[4000ms]"
            style={{
              background: "conic-gradient(rgba(0,0,0,0), #0d2b22, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 50%, #c4843c55, rgba(0,0,0,0) 60%)",
            }}
          />
        </div>

        {/* Layer 3: soft cream/gold highlight arc */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[63px] max-w-[394px] rounded-lg blur-[2px]">
          <div
            className="absolute z-[-2] w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[83deg]
              transition-all duration-[2000ms] group-hover:-rotate-[97deg]
              group-focus-within:rotate-[443deg] group-focus-within:duration-[4000ms]"
            style={{
              background: "conic-gradient(rgba(0,0,0,0) 0%, #d9c8ae55, rgba(0,0,0,0) 8%, rgba(0,0,0,0) 50%, #c4843c88, rgba(0,0,0,0) 58%)",
              filter: "brightness(1.4)",
            }}
          />
        </div>

        {/* Layer 4: dark base arc (depth) */}
        <div className="absolute z-[-1] overflow-hidden h-full w-full max-h-[59px] max-w-[390px] rounded-xl blur-[0.5px]">
          <div
            className="absolute z-[-2] w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[70deg]
              transition-all duration-[2000ms] group-hover:-rotate-[110deg]
              group-focus-within:rotate-[430deg] group-focus-within:duration-[4000ms]"
            style={{
              background: "conic-gradient(#07100d, #c4843c 5%, #07100d 14%, #07100d 50%, #102C26 60%, #07100d 64%)",
              filter: "brightness(1.3)",
            }}
          />
        </div>

        {/* ── Input ───────────────────────────────────── */}
        <div className="relative group/inner">
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="
              w-[388px] h-[56px] rounded-xl
              bg-brand-base
              border-none
              text-brand-cream
              placeholder-brand-creamDim/30
              font-body text-sm
              pl-12 pr-6
              focus:outline-none
              focus:ring-0
            "
            style={{ background: "#07100d" }}
          />

          {/* Gold mask fade */}
          <div
            className="pointer-events-none w-[80px] h-[20px] absolute top-[18px] left-[52px]
              group-focus-within/inner:hidden"
            style={{
              background: "linear-gradient(to right, transparent, #07100d)",
            }}
          />

          {/* Warm gold glow behind search icon */}
          <div
            className="pointer-events-none absolute w-[28px] h-[20px] top-[10px] left-[8px]
              blur-xl opacity-70 transition-all duration-[2000ms] group-hover:opacity-0"
            style={{ background: "#c4843c" }}
          />

          {/* Search icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
              strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none">
              <defs>
                <linearGradient id="searchGold" gradientTransform="rotate(50)">
                  <stop stopColor="#F7E7CE" offset="0%" />
                  <stop stopColor="#c4843c"  offset="100%" />
                </linearGradient>
                <linearGradient id="searchLine">
                  <stop stopColor="#c4843c" offset="0%" />
                  <stop stopColor="#102C26" offset="100%" />
                </linearGradient>
              </defs>
              <circle stroke="url(#searchGold)" r="8" cy="11" cx="11" />
              <line  stroke="url(#searchLine)" y1="16.65" y2="22" x1="16.65" x2="22" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Tailwind @keyframes for spin-slow (if not in config) ── */}
      <style>{`
        #glow-poda .spin-slow { animation: spin 8s linear infinite; }
      `}</style>
    </div>
  );
}
