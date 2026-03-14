"use client";
/**
 * components/ui/loading-screen.tsx
 * ─────────────────────────────────────────────────────
 * Full-screen loading overlay shown when the page first loads.
 * Fades out after 2.6 seconds and unmounts.
 */

import { useState, useEffect } from "react";
import { LumaSpin } from "@/components/ui/luma-spin";

interface LoadingScreenProps {
  persist?: boolean;
}

export default function LoadingScreen({ persist = false }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fading,  setFading]  = useState(false);

  useEffect(() => {
    if (persist) {
      setVisible(true);
      setFading(false);
      return;
    }

    // Start fade-out at 2.2 s, unmount at 2.8 s
    const fadeTimer   = setTimeout(() => setFading(true),  2200);
    const removeTimer = setTimeout(() => setVisible(false), 2800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [persist]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Loading Croch_et Masterpiece"
      style={{
        position:   "fixed",
        inset:      0,
        zIndex:     9999,
        background: "#07100d",
        display:    "flex",
        flexDirection: "column",
        alignItems:    "center",
        justifyContent:"center",
        gap:           "2rem",
        // Fade transition
        opacity:    fading ? 0 : 1,
        transition: "opacity 0.6s ease",
        pointerEvents: fading ? "none" : "all",
      }}
    >
      {/* ── Decorative rings ──────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          width:    280,
          height:   280,
          borderRadius: "50%",
          border:   "1px solid rgba(196,132,60,0.1)",
          animation:"lumaPulse 3s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width:    200,
          height:   200,
          borderRadius: "50%",
          border:   "1px solid rgba(247,231,206,0.06)",
        }}
      />

      {/* ── Luma Spin ─────────────────────────────────────── */}
      <LumaSpin size={65} />

      {/* ── Brand Name ───────────────────────────────────── */}
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize:   "1.75rem",
            fontWeight: 600,
            color:      "#F7E7CE",
            letterSpacing: "0.1em",
            marginBottom: "0.25rem",
          }}
        >
          Croch_et Masterpiece
        </p>
        <p
          style={{
            fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
            fontSize:   "0.75rem",
            color:      "rgba(247,231,206,0.45)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          Handcrafted with love
        </p>
      </div>

      {/* ── Subtle bottom dots progress ───────────────────── */}
      <div style={{ display: "flex", gap: "6px", marginTop: "1rem" }}>
        {[0, 0.3, 0.6].map((delay, i) => (
          <span
            key={i}
            style={{
              width:        6,
              height:       6,
              borderRadius: "50%",
              background:   "#c4843c",
              animation:    `lumaBlink 1.2s ${delay}s ease-in-out infinite`,        
              opacity:      0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}
