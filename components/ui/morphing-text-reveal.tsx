"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MorphingTextRevealProps {
  texts: string[];
  className?: string;
  interval?: number;
  glitchOnHover?: boolean;
}

export function MorphingTextReveal({
  texts,
  className,
  interval = 3000,
  glitchOnHover = true,
}: MorphingTextRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getRandomChar = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return chars[Math.floor(Math.random() * chars.length)];
  };

  const morphToNext = useCallback(() => {
    if (isAnimating || texts.length <= 1) return;

    setIsAnimating(true);
    const currentText = texts[currentIndex] ?? "";
    const nextIndex = (currentIndex + 1) % texts.length;
    const nextText = texts[nextIndex] ?? "";
    const maxLength = Math.max(currentText.length, nextText.length);

    let step = 0;
    const animateStep = () => {
      if (step <= maxLength) {
        let newText = "";

        for (let i = 0; i < maxLength; i += 1) {
          if (i < step) {
            newText += nextText[i] || "";
          } else if (i < currentText.length) {
            const shouldGlitch = Math.random() > 0.7;
            newText += shouldGlitch ? getRandomChar() : currentText[i];
          }
        }

        setDisplayText(newText);
        step += 1;
        setTimeout(animateStep, 80);
      } else {
        setDisplayText(nextText);
        setCurrentIndex(nextIndex);
        setIsAnimating(false);
      }
    };

    animateStep();
  }, [currentIndex, texts, isAnimating]);

  useEffect(() => {
    if (texts.length === 0) return;
    setDisplayText(texts[0]);
  }, [texts]);

  useEffect(() => {
    if (texts.length <= 1) return;
    const timer = window.setInterval(morphToNext, interval);
    return () => window.clearInterval(timer);
  }, [morphToNext, interval, texts.length]);

  const handleMouseEnter = () => {
    if (glitchOnHover) {
      setIsHovered(true);
      window.setTimeout(() => setIsHovered(false), 300);
    }
  };

  if (texts.length === 0) return null;

  return (
    <div className={cn("relative inline-block cursor-pointer select-none", className)} onMouseEnter={handleMouseEnter}>
      <span
        className={cn(
          "font-mono text-foreground transition-all duration-300",
          isHovered && glitchOnHover && "glitch-effect",
          "hover:text-primary"
        )}
        style={{
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.05em",
        }}
      >
        {displayText.split("").map((char, index) => (
          <span
            key={`${currentIndex}-${index}`}
            className={cn("inline-block", isAnimating && "morph-char")}
            style={{
              animationDelay: `${index * 35}ms`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>

      <span
        className={cn(
          "inline-block w-0.5 h-[1em] bg-primary ml-1 transition-opacity duration-500",
          isAnimating ? "opacity-100" : "opacity-30"
        )}
        style={{
          animation: "pulseSoft 2s ease-in-out infinite",
        }}
      />
    </div>
  );
}
