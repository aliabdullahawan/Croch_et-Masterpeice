/* ════════════════════════════════════════════════════════════════
   lib/utils.ts
   Shared utility — cn() merges Tailwind classes with conflict
   resolution. Required by shadcn/ui components and our custom
   UI components (e.g., interactive-globe.tsx).
════════════════════════════════════════════════════════════════ */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes safely.
 * Resolves conflicts (e.g., "p-4 p-2" → "p-2").
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-gold", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
