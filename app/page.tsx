/**
 * app/page.tsx — Home Page
 * Every section is wrapped in AnimateIn for smooth slide-up-on-scroll animations.
 */

import Link              from "next/link";
import Image             from "next/image";
import HeroSlider        from "@/components/ui/HeroSlider";
import AnimateIn         from "@/components/ui/AnimateIn";
import { ShatterButton } from "@/components/ui/shatter-button";
import ReviewsCarousel      from "@/components/ReviewsCarousel";
import FeaturedProductsSlider from "@/components/FeaturedProductsSlider";
import CategoriesAccordion  from "@/components/CategoriesAccordion";
import { MessageCircle, Instagram, ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* ══════════════════════ HERO ══════════════════════ */}
      <HeroSlider />

      {/* ══════════════════ FEATURED PRODUCTS ════════════════ */}
      <section className="py-14 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <AnimateIn className="text-center mb-10 md:mb-14">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-brand-gold">Our Collection</span>
          <h2 className="section-heading mt-3">Featured Products</h2>
          <div className="divider"/>
          <p className="font-body text-brand-creamDim/60 max-w-md mx-auto text-sm leading-relaxed">
            Swipe or click to explore. Visit the Products page to see everything.
          </p>
        </AnimateIn>
        <AnimateIn delay={0.15}>
          <FeaturedProductsSlider />
        </AnimateIn>
      </section>

      {/* ══════════════════════ ABOUT ════════════════════════ */}
      <section className="py-14 md:py-24 overflow-hidden" style={{ background: "#F5EDE4" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <AnimateIn direction="left" className="relative h-[280px] sm:h-[380px] lg:h-[480px] rounded-2xl overflow-hidden order-2 lg:order-1">
            <Image src="https://i.pinimg.com/736x/5d/f7/69/5df7696c4f24b7961c8c72748a355ff8.jpg" alt="Crafting" fill className="object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-deep/60 to-transparent"/>
            <div className="absolute bottom-4 right-4 glass-card p-4">
              <p className="font-display text-2xl md:text-3xl text-brand-gold">3+</p>
              <p className="font-body text-xs text-brand-creamDim mt-1">Years of crafting</p>
            </div>
          </AnimateIn>
          <AnimateIn direction="right" delay={0.1} className="order-1 lg:order-2">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-brand-gold">Our Story</span>
            <h2 className="section-heading mt-3 mb-4 md:mb-6">Made by Hand,<br/><span className="text-brand-gold italic">Given with Heart</span></h2>
            <p className="font-body text-brand-creamDim/70 leading-relaxed mb-3 text-sm md:text-base">Croch_et Masterpiece was born from a love of yarn, colour, and the meditative art of crochet. Every item is handcrafted — no machines, no shortcuts.</p>
            <p className="font-body text-brand-creamDim/70 leading-relaxed mb-6 text-sm md:text-base">Whether it&apos;s a gift or a treat for yourself, we pour care into every stitch. Custom orders are always welcome.</p>
            <div className="flex flex-wrap gap-3">
              <ShatterButton variant="gold" href="/custom-order" shardCount={18}><Sparkles size={14}/> Request Custom Order</ShatterButton>
              <ShatterButton variant="cream" href="https://www.instagram.com/croch_etmasterpiece" target="_blank" shardCount={14}><Instagram size={14}/> Follow on Instagram</ShatterButton>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ══════════════════ FEATURED CATEGORIES ══════════════ */}
      <section className="py-14 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <AnimateIn className="text-center mb-10 md:mb-14">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-brand-gold">Browse by Type</span>
          <h2 className="section-heading mt-3">Explore Our Collection</h2>
          <div className="divider"/>
          <p className="font-body text-brand-creamDim/60 max-w-lg mx-auto text-sm leading-relaxed">
            Browse through our handcrafted categories and find the perfect piece for yourself or a loved one.
          </p>
        </AnimateIn>
        <AnimateIn delay={0.15}>
          <CategoriesAccordion />
        </AnimateIn>
      </section>

      {/* ════════════════════ CUSTOM ORDER CTA ════════════════════ */}
      <section className="py-14 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <AnimateIn>
          <div className="relative rounded-3xl bg-brand-deep overflow-hidden p-8 sm:p-12 md:p-20 text-center grain-overlay">
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"/>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-rose/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"/>
            <div className="relative z-10">
              <AnimateIn delay={0.1}><Sparkles size={32} className="text-brand-gold mx-auto mb-4"/></AnimateIn>
              <AnimateIn delay={0.18}><h2 className="section-heading mb-4">Have Something in Mind?</h2></AnimateIn>
              <AnimateIn delay={0.25}><p className="font-body text-brand-creamDim/70 mb-6 max-w-lg mx-auto text-sm leading-relaxed">Describe your dream piece — colour, size, character, occasion — and we&apos;ll crochet it just for you. Every custom order is a collaboration.</p></AnimateIn>
              <AnimateIn delay={0.32}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <ShatterButton variant="gold" href="/custom-order" shardCount={22}>Start Custom Order <ArrowRight size={15}/></ShatterButton>
                  <ShatterButton variant="whatsapp" href="https://wa.me/923159202186?text=Hi!%20Custom%20order%20please." target="_blank" shardCount={16}><MessageCircle size={15}/> Chat on WhatsApp</ShatterButton>
                </div>
              </AnimateIn>
            </div>
          </div>
        </AnimateIn>
      </section>

      {/* ════════════════════ REVIEWS ════════════════════════ */}
      <section className="py-14 md:py-24 bg-brand-deep/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimateIn className="text-center mb-10 md:mb-16">
            <span className="font-body text-xs uppercase tracking-[0.3em] text-brand-gold">What They Say</span>
            <h2 className="section-heading mt-3">Customer Reviews</h2>
            <div className="divider"/>
          </AnimateIn>
          <AnimateIn delay={0.15}>
            <ReviewsCarousel />
          </AnimateIn>
        </div>
      </section>

      {/* ════════════════════ SOCIAL CTA ═════════════════════ */}
      <section className="py-14 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <AnimateIn>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-brand-gold mb-4">Follow the Journey</p>
          <h2 className="font-display text-brand-cream mb-3" style={{ fontSize: "clamp(1.75rem, 5vw, 2.5rem)" }}>Find Us on Social</h2>
          <p className="font-body text-sm text-brand-creamDim/60 mb-8 max-w-sm mx-auto">Behind-the-scenes, new drops, and customer creations — follow along.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 items-center">
            <ShatterButton variant="cream" href="https://www.instagram.com/croch_etmasterpiece" target="_blank" shardCount={16}><Instagram size={16}/> @croch_etmasterpiece</ShatterButton>
            <ShatterButton variant="whatsapp" href="https://wa.me/923159202186" target="_blank" shardCount={16}><MessageCircle size={16}/> 0315-9202186</ShatterButton>
          </div>
        </AnimateIn>
      </section>
    </>
  );
}
