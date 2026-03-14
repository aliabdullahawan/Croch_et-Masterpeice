"use client";

import { useEffect, useState } from "react";
import AnimateIn from "@/components/ui/AnimateIn";
import { StaggerTestimonials, type StaggerTestimonialItem } from "@/components/ui/stagger-testimonials";
import { fetchHomeReviews, fetchProducts } from "@/lib/db-client";

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<StaggerTestimonialItem[]>([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    void (async () => {
      const [rows, products] = await Promise.all([
        fetchHomeReviews(8),
        fetchProducts(),
      ]);

      const bySlug = new Map(products.map((product) => [product.slug, product]));
      const mapped = rows.map((review, index): StaggerTestimonialItem => {
        const product = bySlug.get(review.product_slug);
        return {
          tempId: index,
          testimonial: review.body,
          by: review.customer_name,
          rating: review.rating,
          createdAt: review.created_at,
          productName: review.product_name,
          productSlug: review.product_slug,
          productImage: product?.images?.[0] ?? null,
          productDescription: product?.description ?? null,
          productPrice: product?.price ?? null,
        };
      });

      setReviews(mapped);
      if (mapped.length > 0) {
        const total = mapped.reduce((sum, item) => sum + item.rating, 0);
        setAvgRating(total / mapped.length);
      } else {
        setAvgRating(0);
      }
    })();
  }, []);

  return (
    <section
      className="relative py-14 md:py-24 overflow-hidden textured-surface"
      style={{
        background: "radial-gradient(circle at 12% 22%, rgba(201,160,40,0.18) 0%, transparent 35%), linear-gradient(135deg, #0B0908 0%, #15110E 55%, #21170F 100%)",
      }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
        <AnimateIn className="text-center mb-10 md:mb-16">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-brand-gold">What They Say</span>
          <h2 className="section-heading mt-3 text-write-slow" style={{ color: "#F4EADD" }}>Customer Reviews</h2>
          <p className="mt-2 text-sm" style={{ color: "#D9B471" }}>
            Average Rating: {avgRating > 0 ? avgRating.toFixed(1) : "0.0"} / 5 {reviews.length > 0 ? `(${reviews.length} reviews)` : ""}
          </p>
          <div className="divider" />
        </AnimateIn>

        <StaggerTestimonials items={reviews} />
      </div>
    </section>
  );
}
