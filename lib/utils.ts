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

export function getInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) {
    return "?";
  }

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  const hue2 = (hue + 38) % 360;
  return `linear-gradient(135deg, hsl(${hue} 70% 60%), hsl(${hue2} 65% 48%))`;
}
