"use client";
/**
 * components/ui/luma-spin.tsx
 * Animated loader — two rounded shapes animating inset positions.
 * Used in <LoadingScreen> on first page load.
 */

interface LumaSpinProps {
  size?:  number;  // px size of the container square
  color?: string;  // Tailwind shadow color class or raw CSS color
}

export function LumaSpin({ size = 65 }: LumaSpinProps) {
  return (
    <div
      className="relative aspect-square"
      style={{ width: size, height: size }}
      aria-label="Loading..."
      role="status"
    >
      {/* ── First arm ─────────────────────────────────────── */}
      <span
        className="absolute rounded-[50px]"
        style={{
          animation: "lumaA 2.5s infinite",
          boxShadow: "inset 0 0 0 3px #F7E7CE",
        }}
      />

      {/* ── Second arm (offset by half cycle) ────────────── */}
      <span
        className="absolute rounded-[50px]"
        style={{
          animation:      "lumaA 2.5s -1.25s infinite",
          boxShadow:      "inset 0 0 0 3px #c4843c",
        }}
      />
    </div>
  );
}
