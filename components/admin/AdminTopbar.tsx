/* ════════════════════════════════════════════════════════════════
   components/admin/AdminTopbar.tsx
   Admin page header — theme-aware (light + dark).
════════════════════════════════════════════════════════════════ */
"use client";

import { Menu } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface AdminTopbarProps {
  title:       string;
  subtitle?:   string;
  onMenuClick: () => void;
  actions?:    React.ReactNode;
}

export default function AdminTopbar({ title, subtitle, onMenuClick, actions }: AdminTopbarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const bg         = "var(--bg-base)";
  const border     = "var(--border)";
  const textMain   = "var(--cream)";
  const textMuted  = "var(--cream-dim)";
  const hoverBg    = "rgba(201,160,40,0.1)";
  const iconBg     = "rgba(201,160,40,0.15)";

  return (
    <header
      className="sticky top-0 z-20 px-4 md:px-6 py-3 flex items-center gap-4 backdrop-blur-sm transition-colors duration-300"
      style={{ background: bg, borderBottom: `1px solid ${border}` }}
    >
      {/* Mobile hamburger */}
      <button onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg transition-colors"
        style={{ color: textMuted }}
        onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = textMain; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textMuted; }}
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-lg md:text-xl font-semibold truncate" style={{ color: textMain }}>{title}</h1>
        {subtitle && <p className="text-xs font-body mt-0.5" style={{ color: textMuted }}>{subtitle}</p>}
      </div>

      {/* Right side */}
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
