"use client";
/**
 * context/ThemeContext.tsx
 * Light / Dark mode toggle — persisted to localStorage.
 * Applies `data-theme="dark"` on <html> for CSS variable switching.
 */

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // Initialise from localStorage
  useEffect(() => {
    const saved = (localStorage.getItem("cm-theme") as Theme) ?? "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    setTheme(prev => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("cm-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
