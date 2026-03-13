"use client";
/**
 * components/ui/ThemeToggle.tsx
 * Floating sun/moon button to switch between light and dark mode.
 */

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 hover:scale-110"
      style={{
        background: isDark
          ? "rgba(201,160,40,0.15)"
          : "rgba(61,43,31,0.08)",
        border: isDark
          ? "1px solid rgba(201,160,40,0.4)"
          : "1px solid rgba(61,43,31,0.18)",
        color: isDark ? "#E2B84A" : "#3D2B1F",
        boxShadow: isDark
          ? "0 2px 12px rgba(201,160,40,0.2)"
          : "0 2px 8px rgba(61,43,31,0.08)",
      }}
    >
      {isDark ? (
        <Sun size={16} className="transition-transform duration-300 rotate-0" />
      ) : (
        <Moon size={16} className="transition-transform duration-300" />
      )}
    </button>
  );
}
