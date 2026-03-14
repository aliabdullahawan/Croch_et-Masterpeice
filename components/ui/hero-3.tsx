"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShatterButton } from "@/components/ui/shatter-button";
import { ArrowRight } from "lucide-react";

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  ctaText: string;
  images: string[];
  className?: string;
}

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  images,
  className,
}) => {
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  const duplicatedImages = [...images, ...images, ...images]; // Tripled for extra safety on wide screens

  return (
    <section
      className={cn(
        "relative w-full min-h-[90vh] pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4",
        className
      )}
    >
      <div className="z-10 flex flex-col items-center pt-24 pb-12">
        {/* Tagline */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-6 inline-block rounded-full border border-brand-gold/30 bg-brand-deep/50 px-5 py-2 text-sm font-medium text-brand-gold backdrop-blur-md shadow-lg"
        >
          {tagline}
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-medium text-brand-cream drop-shadow-xl"
        >
          {typeof title === 'string' ? (
            title.split(" ").map((word, i) => (
              <motion.span
                key={i}
                variants={FADE_IN_ANIMATION_VARIANTS}
                className="inline-block"
              >
                {word}&nbsp;
              </motion.span>
            ))
          ) : (
            title
          )}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.5 }}
          className="mt-8 max-w-2xl text-lg md:text-xl text-brand-creamDim/90 font-body drop-shadow-md pb-6"
        >
          {description}
        </motion.p>

        {/* Call to Action Button */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.6 }}
        >
          <ShatterButton variant="gold" href="/products" shardCount={20}>
            {ctaText} <ArrowRight size={18} />
          </ShatterButton>
        </motion.div>
      </div>

      {/* Animated Image Marquee */}
      <div className="absolute bottom-0 left-0 w-full h-[35vh] md:h-[45vh] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] z-0">
        <motion.div
          className="flex gap-4 md:gap-6 pt-10 px-4"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            ease: "linear",
            duration: 60,
            repeat: Infinity,
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-[25vh] md:h-[35vh] flex-shrink-0"
              style={{
                rotate: `${(index % 2 === 0 ? -3 : 4)}deg`,
              }}
            >
              {/* Source list is dynamic and can include arbitrary remote URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Showcase image ${index + 1}`}
                className="w-full h-full object-cover rounded-2xl shadow-2xl border-2 border-brand-cream/10"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
