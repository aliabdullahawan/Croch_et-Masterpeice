/* ════════════════════════════════════════════════════════════════
   components/ui/PageTransition.tsx
   Smooth page entrance animation using Framer Motion.
   Wrap each page's root div with this for consistent UX.
════════════════════════════════════════════════════════════════ */
"use client";

import { motion } from "framer-motion";

interface PageTransitionProps {
  children:  React.ReactNode;
  className?: string;
  /** "slide" (default) = fade + slide up | "fade" = fade only */
  mode?:     "slide" | "fade";
}

const VARIANTS = {
  slide: {
    initial:   { opacity: 0, y: 18 },
    animate:   { opacity: 1, y: 0 },
    exit:      { opacity: 0, y: -10 },
    transition:{ duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  fade: {
    initial:   { opacity: 0 },
    animate:   { opacity: 1 },
    exit:      { opacity: 0 },
    transition:{ duration: 0.28 },
  },
};

export default function PageTransition({ children, className = "", mode = "slide" }: PageTransitionProps) {
  const v = VARIANTS[mode];
  return (
    <motion.div
      className={className}
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={v.transition}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger child helper ─────────────────────────────────────
   Use <StaggerItem> inside a parent that has staggerChildren.
   <StaggerItem index={0}>, <StaggerItem index={1}>, etc.
────────────────────────────────────────────────────────────── */
export function StaggerItem({ children, index = 0, className = "" }: {
  children: React.ReactNode;
  index?:   number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
