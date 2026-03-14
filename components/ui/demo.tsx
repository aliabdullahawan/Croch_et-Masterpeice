import React from "react";
import ParallaxCardCarousel from "@/components/ui/3d-cards-slider";

const DemoOne = () => {
  const cards = [
    {
      id: 1,
      title: "Cosmic Exploration",
      subtitle: "Journey Through Deep Space",
      description: "Discover the mysteries of distant galaxies and nebulae in this immersive visual experience.",
      imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564",
      actionLabel: "Explore Space",
    },
    {
      id: 2,
      title: "Ocean Depths",
      subtitle: "Underwater Discoveries",
      description: "Dive into the fascinating world beneath the waves and encounter extraordinary marine life.",
      imageUrl: "https://images.unsplash.com/photo-1551244072-5d12893278ab",
      actionLabel: "Dive In",
    },
    {
      id: 3,
      title: "Mountain Vistas",
      subtitle: "Epic Landscapes",
      description: "Experience breathtaking panoramic views from the highest peaks around the world.",
      imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
      actionLabel: "Begin Ascent",
    },
  ];

  return (
    <div className="app">
      <ParallaxCardCarousel
        cards={cards}
        autoplaySpeed={3000}
        perspective={1500}
        backgroundClassName="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      />
    </div>
  );
};

export default DemoOne;
