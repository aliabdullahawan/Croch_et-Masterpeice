"use client";
/**
 * components/ui/AnimateIn.tsx
 * ─────────────────────────────────────────────
 * Wraps any content and animates it into view when it enters the viewport.
 * Uses framer-motion's whileInView for smooth scroll-triggered animations.
 *
 * Usage:
 *   <AnimateIn>          ← default: fade + slide up
 *   <AnimateIn delay={0.2} direction="up">
 *   <AnimateIn direction="left" once={false}>   ← re-animates on re-enter
 */

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "fade";

interface Props {
  children:   ReactNode;
  className?: string;
  delay?:     number;      // seconds
  duration?:  number;      // seconds
  direction?: Direction;
  once?:      boolean;     // animate only once (default: true)
  amount?:    number;      // 0–1, how much of element must be visible
  as?: keyof JSX.IntrinsicElements;
}

const offsets: Record<Direction, { x?: number; y?: number }> = {
  up:    { y:  40 },
  down:  { y: -40 },
  left:  { x:  40 },
  right: { x: -40 },
  fade:  {},
};

export default function AnimateIn({
  children,
  className,
  delay    = 0,
  duration = 0.55,
  direction = "up",
  once  = true,
  amount = 0.18,
}: Props) {
  const offset = offsets[direction];

  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    show:   { opacity: 1, x: 0, y: 0 },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],   // smooth ease-out-expo
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimateInGroup — stagger multiple children automatically.
 * Usage:
 *   <AnimateInGroup stagger={0.1}>
 *     <AnimateIn>Child 1</AnimateIn>
 *     <AnimateIn>Child 2</AnimateIn>
 *   </AnimateInGroup>
 */
export function AnimateInGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}
