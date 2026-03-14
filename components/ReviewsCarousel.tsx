"use client";

import { useEffect, useState } from "react";
import AnimateIn from "@/components/ui/AnimateIn";
import { StaggerTestimonials, type StaggerTestimonialItem } from "@/components/ui/stagger-testimonials";
import { fetchHomeReviews, type HomeReviewItem } from "@/lib/db-client";

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<HomeReviewItem[]>([]);

  useEffect(() => {
    void (async () => {
      const rows = await fetchHomeReviews(8);
      setReviews(rows);
    })();
  }, []);

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="relative py-14 md:py-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
        <AnimateIn className="text-center mb-10 md:mb-16">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-brand-gold">What They Say</span>
          <h2 className="section-heading mt-3">Customer Reviews</h2>
          <div className="divider" />
        </AnimateIn>

        <StaggerTestimonials
          items={reviews.map((r, index): StaggerTestimonialItem => ({
            tempId: index,
            testimonial: r.body,
            by: `${r.customer_name}, on ${r.product_name}`,
            imgSrc: `https://i.pravatar.cc/150?img=${(index % 20) + 1}`,
          }))}
        />
      </div>
    </section>
  );
}
