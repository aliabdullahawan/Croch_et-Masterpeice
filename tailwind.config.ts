import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand Palette — Logo-Inspired (Warm Feminine) ────────────
        brand: {
          base:        "var(--bg-base)",       // mapped to CSS var
          deep:        "var(--bg-deep)",       // mapped to CSS var
          green:       "var(--bg-green)",      // mapped to CSS var
          greenLight:  "rgba(255, 255, 255, 0.1)", // fallback hover 
          cream:       "var(--cream)",         // primary text (CSS var)
          creamDim:    "var(--cream-dim)",     // secondary text (CSS var)
          gold:        "var(--gold)",          // gold accent (CSS var)
          goldLight:   "var(--gold-light)",    // lighter gold hover
          rose:        "var(--rose)",          // blush pink accent (CSS var)
          roseLight:   "#e2babd",              // static (less used)
          teal:        "var(--teal)",          // teal accent (CSS var)
          tealLight:   "#8ED0D0",              // static (less used)
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        // Subtle grain texture overlay (CSS only, no image needed)
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.07'/%3E%3C/svg%3E\")",
      },
      animation: {
        "loaderAnim":   "loaderAnim 2.5s infinite",
        "loaderDelay":  "loaderAnim 2.5s -1.25s infinite",
        "fadeIn":       "fadeIn 0.6s ease forwards",
        "fadeInUp":     "fadeInUp 0.7s ease forwards",
        "slideDown":    "slideDown 0.4s ease forwards",
        "shimmer":      "shimmer 2s infinite",
        "float":        "float 6s ease-in-out infinite",
        "pulse-slow":   "pulse 4s ease-in-out infinite",
        "spin-slow":    "spin 8s linear infinite",
      },
      keyframes: {
        loaderAnim: {
          "0%":    { inset: "0 35px 35px 0" },
          "12.5%": { inset: "0 35px 0 0" },
          "25%":   { inset: "35px 35px 0 0" },
          "37.5%": { inset: "35px 0 0 0" },
          "50%":   { inset: "35px 0 0 35px" },
          "62.5%": { inset: "0 0 0 35px" },
          "75%":   { inset: "0 0 35px 35px" },
          "87.5%": { inset: "0 0 35px 0" },
          "100%":  { inset: "0 35px 35px 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
      },
      boxShadow: {
        "gold":     "0 4px 20px rgba(211, 173, 59, 0.3)",
        "gold-lg":  "0 8px 40px rgba(212, 175, 64, 0.35)",
        "green":    "0 4px 20px rgba(107,191,191,0.25)",
        "card":     "0 4px 24px rgba(235, 176, 137, 0.08)",
        "card-lg":  "0 8px 48px rgba(247, 176, 128, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
