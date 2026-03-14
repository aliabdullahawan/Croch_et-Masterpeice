"use client";

import { useState, useEffect, useMemo } from "react";
import { useWishlist } from "@/context/WishlistContext";
import ParallaxCardCarousel, { type ParallaxCardItem } from "@/components/ui/3d-cards-slider";
import { fetchProducts } from "@/lib/db-client";
import type { Product } from "@/lib/types";

export default function FeaturedProductsSlider() {
  const [products, setProducts] = useState<Product[]>([]);
  const { toggle, isInList } = useWishlist();

  useEffect(() => {
    void (async () => {
      const rows = await fetchProducts({ featuredOnly: true });
      setProducts(rows);
    })();
  }, []);

  const cards = useMemo<ParallaxCardItem[]>(() => {
    return products.slice(0, 8).map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: p.category?.name ?? "Featured Collection",
      description: (p.description ?? "Handcrafted crochet piece with premium finishing.").slice(0, 120),
      imageUrl: p.images?.[0] ?? "/placeholder-product.jpg",
      href: `/products/${p.slug}`,
      actionLabel: "View Product",
      priceLabel: p.price ? `PKR ${Math.round(p.price).toLocaleString("en-PK")}` : "Price on request",
      inWishlist: isInList(p.id),
      onWishlistToggle: () => toggle(p),
    }));
  }, [isInList, products, toggle]);

  if (cards.length === 0) {
    return null;
  }

  return (
    <ParallaxCardCarousel
      cards={cards}
      autoplaySpeed={3200}
      perspective={1450}
      cardWidth={330}
      cardHeight={470}
      backgroundClassName="bg-transparent border-0"
    />
  );
}
