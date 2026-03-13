"use client";
/**
 * components/ui/spotlight-card.tsx
 * ─────────────────────────────────────────────────────
 * Pointer-tracking spotlight glow effect on card borders.
 * Adapted to Croch_et Masterpiece brand — gold/green glow palette.
 */

import React, { useEffect, useRef, ReactNode } from "react";

interface GlowCardProps {
  children:    ReactNode;
  className?:  string;
  glowColor?:  "gold" | "green" | "rose" | "cream";
  customSize?: boolean;
}

/* ── Brand-mapped glow hues ──────────────────────────── */
const glowColorMap = {
  gold:  { base: 35,  spread: 20  },   // warm amber/gold
  green: { base: 155, spread: 30  },   // forest green
  rose:  { base: 345, spread: 20  },   // muted rose
  cream: { base: 40,  spread: 15  },   // warm cream
};

export function GlowCard({
  children,
  className    = "",
  glowColor    = "gold",
  customSize   = true,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  /* Track pointer position as CSS vars on the card */
  useEffect(() => {
    const sync = (e: PointerEvent) => {
      if (!cardRef.current) return;
      cardRef.current.style.setProperty("--x",  e.clientX.toFixed(2));
      cardRef.current.style.setProperty("--xp", (e.clientX / window.innerWidth).toFixed(2));
      cardRef.current.style.setProperty("--y",  e.clientY.toFixed(2));
      cardRef.current.style.setProperty("--yp", (e.clientY / window.innerHeight).toFixed(2));
    };
    document.addEventListener("pointermove", sync);
    return () => document.removeEventListener("pointermove", sync);
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  const cardStyles: React.CSSProperties & Record<string, string | number> = {
    "--base":               base,
    "--spread":             spread,
    "--radius":             "16",
    "--border":             "1.5",
    "--saturation":         "70",
    "--lightness":          "60",
    "--backdrop":           "rgba(16,44,38,0.35)",
    "--backup-border":      "rgba(247,231,206,0.07)",
    "--size":               "220",
    "--outer":              "1",
    "--border-size":        "calc(var(--border,2) * 1px)",
    "--spotlight-size":     "calc(var(--size,200) * 1px)",
    "--hue":                "calc(var(--base) + (var(--xp,0) * var(--spread,0)))",
    "--bg-spot-opacity":    "0.12",
    "--border-spot-opacity":"0.8",
    "--border-light-opacity":"0.3",
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x,0) * 1px) calc(var(--y,0) * 1px),
      hsl(var(--hue) calc(var(--saturation)*1%) calc(var(--lightness)*1%) / var(--bg-spot-opacity)),
      transparent
    )`,
    backgroundColor:    "var(--backdrop, transparent)",
    backgroundSize:     "calc(100% + 2*var(--border-size)) calc(100% + 2*var(--border-size))",
    backgroundPosition: "50% 50%",
    backgroundAttachment: "fixed",
    border:             "var(--border-size) solid var(--backup-border)",
    position:           "relative",
    touchAction:        "none",
  };

  const css = `
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + 2*var(--border-size)) calc(100% + 2*var(--border-size));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent,transparent), linear-gradient(white,white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size)*0.75) calc(var(--spotlight-size)*0.75) at
        calc(var(--x,0)*1px) calc(var(--y,0)*1px),
        hsl(var(--hue) calc(var(--saturation)*1%) calc(var(--lightness)*1%) / var(--border-spot-opacity,1)),
        transparent 100%
      );
      filter: brightness(2);
    }
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size)*0.5) calc(var(--spotlight-size)*0.5) at
        calc(var(--x,0)*1px) calc(var(--y,0)*1px),
        hsl(0 100% 100% / var(--border-light-opacity,1)),
        transparent 100%
      );
    }
    [data-glow] [data-glow] {
      position: absolute; inset: 0;
      will-change: filter;
      opacity: var(--outer,1);
      border-radius: calc(var(--radius)*1px);
      border-width: calc(var(--border-size)*20);
      filter: blur(calc(var(--border-size)*10));
      background: none;
      pointer-events: none;
      border: none;
    }
    [data-glow] > [data-glow]::before {
      inset: -10px;
      border-width: 10px;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        ref={cardRef}
        data-glow
        style={cardStyles}
        className={`rounded-2xl relative shadow-card backdrop-blur-sm ${className}`}
      >
        <div data-glow />
        {children}
      </div>
    </>
  );
}
