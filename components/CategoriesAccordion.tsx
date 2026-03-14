"use client";

import { useEffect, useState } from "react";
import { Pyramid, Castle, Mountain, TowerControl, Building, Landmark } from "lucide-react";
import AnimateIn from "@/components/ui/AnimateIn";
import { ExpandingCards, type CardItem } from "@/components/ui/expanding-cards";
import { fetchStoreCategories } from "@/lib/db-client";

interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

const categoryImageBySlug: Record<string, string> = {
  bags: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1200",
  amigurumi: "https://images.unsplash.com/photo-1577083552431-6e5fd01988f3?auto=format&fit=crop&w=1200",
  accessories: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200",
  "home-decor": "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200",
  custom: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200",
};

const icons = [
  <Pyramid key="pyramid" size={24} />,
  <Castle key="castle" size={24} />,
  <Mountain key="mountain" size={24} />,
  <TowerControl key="tower-control" size={24} />,
  <Building key="building" size={24} />,
  <Landmark key="landmark" size={24} />,
];

export default function CategoriesAccordion() {
  const [categories, setCategories] = useState<StoreCategory[]>([]);

  useEffect(() => {
    void (async () => {
      const rows = await fetchStoreCategories();
      setCategories(rows);
    })();
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-14 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
      <AnimateIn className="text-center mb-10 md:mb-14">
        <span className="font-body text-xs uppercase tracking-[0.3em] text-brand-gold">Browse by Type</span>
        <h2 className="section-heading mt-3">Explore Our Collection</h2>
        <div className="divider" />
      </AnimateIn>

      <ExpandingCards
        items={categories.map((cat, index): CardItem => ({
          id: cat.id,
          title: cat.name,
          description: cat.description ?? "Handcrafted crochet pieces in this category.",
          imgSrc: cat.image_url ?? categoryImageBySlug[cat.slug] ?? `https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1200&sig=${index}`,
          icon: icons[index % icons.length],
          linkHref: `/products?category=${cat.slug}`,
        }))}
        defaultActiveIndex={0}
      />
    </section>
  );
}
