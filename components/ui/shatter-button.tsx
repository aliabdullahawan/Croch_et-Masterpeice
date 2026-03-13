"use client";
/**
 * components/ui/shatter-button.tsx
 * ─────────────────────────────────────────────────────
 * Click → button shatters into branded shards + explosion ring.
 * Variants:
 *   gold   → primary CTA  (#c4843c warm gold)
 *   green  → secondary    (#1a4a3a forest green)
 *   cream  → ghost/outline (#F7E7CE cream)
 *   rose   → wishlist/danger (#c97d7d)
 *   whatsapp → green WhatsApp
 */

import { useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence }               from "framer-motion";

type ShatterVariant = "gold" | "green" | "cream" | "rose" | "whatsapp";

const VARIANT_STYLES: Record<
  ShatterVariant,
  { color: string; bg: string; border: string; text: string; shadow: string }
> = {
  gold: {
    color:  "#c4843c",
    bg:     "linear-gradient(135deg, #c4843c 0%, #e0a85a 100%)",
    border: "transparent",
    text:   "#07100d",
    shadow: "0 0 24px rgba(196,132,60,0.35), 0 4px 20px rgba(196,132,60,0.2)",
  },
  green: {
    color:  "#1a4a3a",
    bg:     "linear-gradient(135deg, #102C26 0%, #1a4a3a 100%)",
    border: "rgba(247,231,206,0.15)",
    text:   "#F7E7CE",
    shadow: "0 0 24px rgba(16,44,38,0.5)",
  },
  cream: {
    color:  "#C9A028", // Gold for shards
    bg:     "rgba(61,43,31,0.03)",
    border: "var(--border)",
    text:   "var(--cream)",
    shadow: "none",
  },
  rose: {
    color:  "#c97d7d",
    bg:     "rgba(201,125,125,0.12)",
    border: "rgba(201,125,125,0.35)",
    text:   "#F7E7CE",
    shadow: "0 0 20px rgba(201,125,125,0.2)",
  },
  whatsapp: {
    color:  "#25d366",
    bg:     "linear-gradient(135deg, #128c3e 0%, #25d366 100%)",
    border: "transparent",
    text:   "#ffffff",
    shadow: "0 0 24px rgba(37,211,102,0.3)",
  },
};

interface Shard {
  id: number;
  rotation:  number;
  velocityX: number;
  velocityY: number;
  size:      number;
  clip:      string;
}

export interface ShatterButtonProps {
  children:      ReactNode;
  variant?:      ShatterVariant;
  className?:    string;
  shardCount?:   number;
  onClick?:      () => void;
  type?:         "button" | "submit" | "reset";
  disabled?:     boolean;
  href?:         string;       // if provided renders as <a>
  target?:       string;
}

export function ShatterButton({
  children,
  variant    = "gold",
  className  = "",
  shardCount = 18,
  onClick,
  type       = "button",
  disabled   = false,
  href,
  target,
}: ShatterButtonProps) {
  const [isShattered, setIsShattered] = useState(false);
  const [shards,      setShards]      = useState<Shard[]>([]);

  const v = VARIANT_STYLES[variant];

  const shatter = useCallback(() => {
    if (isShattered || disabled) return;

    const newShards: Shard[] = Array.from({ length: shardCount }, (_, i) => {
      const angle    = (Math.PI * 2 * i) / shardCount + Math.random() * 0.5;
      const speed    = 90 + Math.random() * 180;
      return {
        id:        i,
        rotation:  Math.random() * 720 - 360,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size:      4 + Math.random() * 10,
        clip: `polygon(
          ${Math.random() * 50}% 0%,
          100% ${Math.random() * 50}%,
          ${50 + Math.random() * 50}% 100%,
          0% ${50 + Math.random() * 50}%
        )`,
      };
    });

    setShards(newShards);
    setIsShattered(true);
    onClick?.();
    setTimeout(() => { setIsShattered(false); setShards([]); }, 900);
  }, [isShattered, disabled, shardCount, onClick]);

  const motionProps = {
    className: `relative inline-flex items-center justify-center gap-2
      px-6 py-3 font-body font-semibold rounded-xl overflow-hidden
      cursor-pointer select-none transition-shadow duration-300
      disabled:opacity-50 disabled:cursor-not-allowed ${className}`,
    onClick:   shatter,
    animate:   { scale: isShattered ? 0 : 1, opacity: isShattered ? 0 : 1 },
    transition:{ duration: 0.12 },
    whileHover:{ scale: disabled ? 1 : 1.04 },
    whileTap:  { scale: disabled ? 1 : 0.96 },
    style: {
      background:  v.bg,
      border:      `1px solid ${v.border}`,
      color:       v.text,
      boxShadow:   v.shadow,
      fontSize:    "0.875rem",
    },
  };

  return (
    <div className="relative inline-block">

      {/* ── Button or Anchor ────────────────────────── */}
      {href ? (
        <motion.a href={href} target={target} rel="noreferrer" {...motionProps}>
          {/* Hover glow */}
          <motion.div
            className="absolute inset-0 opacity-0 pointer-events-none"
            whileHover={{ opacity: 1 }}
            style={{ background: `radial-gradient(circle at center, ${v.color}33 0%, transparent 70%)` }}
          />
          <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.a>
      ) : (
        <motion.button type={type} disabled={disabled} {...motionProps}>
          <motion.div
            className="absolute inset-0 opacity-0 pointer-events-none"
            whileHover={{ opacity: 1 }}
            style={{ background: `radial-gradient(circle at center, ${v.color}33 0%, transparent 70%)` }}
          />
          <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.button>
      )}

      {/* ── Shards ──────────────────────────────────── */}
      <AnimatePresence>
        {shards.map(shard => (
          <motion.div
            key={shard.id}
            className="absolute pointer-events-none"
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
            animate={{ x: shard.velocityX, y: shard.velocityY, rotate: shard.rotation, opacity: 0, scale: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              left:      "50%",
              top:       "50%",
              width:     shard.size,
              height:    shard.size,
              background: v.color,
              boxShadow: `0 0 8px ${v.color}, 0 0 16px ${v.color}88`,
              clipPath:  shard.clip,
            }}
          />
        ))}
      </AnimatePresence>

      {/* ── Explosion ring ──────────────────────────── */}
      <AnimatePresence>
        {isShattered && (
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            initial={{ width: 0, height: 0, opacity: 0.9 }}
            animate={{ width: 260, height: 260, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            style={{ border: `2px solid ${v.color}`, boxShadow: `0 0 28px ${v.color}` }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
/**
 * ShatterIconButton
 * ─────────────────────────────────────────────────────
 * Thin wrapper that adds shatter-on-click to ANY small button/icon.
 * Does NOT apply its own background — just wraps children and fires shards.
 *
 * Usage:
 *   <ShatterIconButton shardColor="#E8A0A8" onClick={...}>
 *     <Heart size={16} />
 *   </ShatterIconButton>
 */

interface ShatterIconButtonProps {
  children:     ReactNode;
  shardColor?:  string;   // colour of the flying shards
  shardCount?:  number;
  onClick?:     (e: React.MouseEvent) => void;
  className?:   string;
  disabled?:    boolean;
  style?:       React.CSSProperties;
  "aria-label"?: string;
  type?: "button" | "submit" | "reset";
}

interface SmallShard {
  id: number;
  rotation:  number;
  velocityX: number;
  velocityY: number;
  size:      number;
  clip:      string;
}

export function ShatterIconButton({
  children,
  shardColor  = "#C9A028",
  shardCount  = 12,
  onClick,
  className   = "",
  disabled    = false,
  style,
  "aria-label": ariaLabel,
  type = "button",
}: ShatterIconButtonProps) {
  const [shattered, setShattered] = useState(false);
  const [shards,    setShards]    = useState<SmallShard[]>([]);

  const fire = useCallback((e: React.MouseEvent) => {
    if (shattered || disabled) return;

    const newShards: SmallShard[] = Array.from({ length: shardCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / shardCount + Math.random() * 0.6;
      const speed = 50 + Math.random() * 120;
      return {
        id: i,
        rotation:  Math.random() * 540 - 270,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size:      3 + Math.random() * 7,
        clip: `polygon(
          ${Math.random() * 50}% 0%,
          100% ${Math.random() * 50}%,
          ${50 + Math.random() * 50}% 100%,
          0% ${50 + Math.random() * 50}%
        )`,
      };
    });

    setShards(newShards);
    setShattered(true);
    onClick?.(e);
    setTimeout(() => { setShattered(false); setShards([]); }, 700);
  }, [shattered, disabled, shardCount, onClick]);

  return (
    <div className="relative inline-flex">
      <motion.button
        type={type}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={fire}
        className={className}
        style={style}
        whileHover={{ scale: disabled ? 1 : 1.12 }}
        whileTap={{   scale: disabled ? 1 : 0.88 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {children}
      </motion.button>

      {/* Shards */}
      <AnimatePresence>
        {shards.map(shard => (
          <motion.div
            key={shard.id}
            className="absolute pointer-events-none z-50"
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
            animate={{ x: shard.velocityX, y: shard.velocityY, rotate: shard.rotation, opacity: 0, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              left:      "50%",
              top:       "50%",
              width:     shard.size,
              height:    shard.size,
              background: shardColor,
              boxShadow: `0 0 6px ${shardColor}`,
              clipPath:  shard.clip,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Tiny ring */}
      <AnimatePresence>
        {shattered && (
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-40"
            initial={{ width: 0, height: 0, opacity: 0.85 }}
            animate={{ width: 100, height: 100, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{ border: `1.5px solid ${shardColor}`, boxShadow: `0 0 14px ${shardColor}` }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
