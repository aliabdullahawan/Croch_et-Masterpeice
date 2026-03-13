'use client'
/**
 * components/ui/floating-action-button.tsx
 * Animated expanding social icons — click + to reveal links.
 * Adapted to brand colors for Croch_et Masterpiece.
 */
import { motion }              from "framer-motion"
import { Plus, LucideIcon }    from "lucide-react"
import { useState }            from "react"

interface SocialIcon {
  Icon:       LucideIcon
  href?:      string
  label:      string
  color?:     string   // tailwind bg class on hover
}

interface AnimatedSocialIconsProps {
  icons:      SocialIcon[]
  className?: string
  iconSize?:  number
}

export function AnimatedSocialIcons({
  icons,
  className   = "",
  iconSize    = 18,
}: AnimatedSocialIconsProps) {
  const [active, setActive] = useState(false)

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="flex items-center relative gap-3">

        {/* ── Plus / Close button (slides right when active) ── */}
        <motion.div
          className="absolute left-0 z-10"
          animate={{ x: active ? `calc(100% + 12px)` : 0 }}
          transition={{ type: "easeIn", duration: 0.45 }}
        >
          <motion.button
            onClick={() => setActive(a => !a)}
            animate={{ rotate: active ? 45 : 0 }}
            transition={{ type: "easeIn", duration: 0.45 }}
            aria-label={active ? "Close social links" : "Open social links"}
            className="w-10 h-10 rounded-full flex items-center justify-center
              transition-colors duration-300"
            style={{
              background: active
                ? "linear-gradient(135deg,#c4843c,#e0a85a)"
                : "rgba(61,43,31,0.08)",
              border: "1px solid rgba(196,132,60,0.35)",
            }}
          >
            <Plus size={iconSize} strokeWidth={2.5} className="text-brand-cream" />
          </motion.button>
        </motion.div>

        {/* ── Social icon buttons ─────────────────────── */}
        {icons.map(({ Icon, href, label, color }, i) => (
          <motion.div
            key={label}
            animate={{
              filter: active ? "blur(0px)"  : "blur(3px)",
              scale:  active ? 1            : 0.85,
              rotate: active ? 0            : 45,
            }}
            transition={{ type: "easeIn", duration: 0.35, delay: active ? i * 0.05 : 0 }}
            title={label}
          >
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`w-10 h-10 rounded-full flex items-center justify-center
                border transition-all duration-300 group
                ${active ? "pointer-events-auto" : "pointer-events-none"}`}
              style={{
                background: "rgba(61,43,31,0.07)",
                border:     "1px solid rgba(61,43,31,0.14)",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,132,60,0.55)"
                ;(e.currentTarget as HTMLElement).style.background = "rgba(196,132,60,0.12)"
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(61,43,31,0.14)"
                ;(e.currentTarget as HTMLElement).style.background = "rgba(61,43,31,0.07)"
              }}
            >
              <Icon size={iconSize} className="text-brand-creamDim group-hover:text-brand-gold transition-colors" />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
