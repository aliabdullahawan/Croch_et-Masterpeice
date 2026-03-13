"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const { toggle, isInList } = useWishlist();
  const inWishlist = isInList(product.id);
  const imageUrl = product.images?.[0] ?? "/placeholder-product.jpg";
  const productUrl = `/products/${product.slug}`;

  return (
    <Link href={productUrl} className="group block w-full relative">
      {/* ── Image Container ── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#FDF8F5] transition-all duration-500 group-hover:shadow-[0_20px_40px_-15px_rgba(201,160,40,0.15)] mb-4">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Soft overlay on hover */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />

        {/* ── Heart Button (Wishlist) ── */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product);
          }}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-transform duration-300 hover:scale-110 active:scale-95"
          aria-label="Toggle Wishlist"
        >
          <Heart
            size={16}
            className={`transition-colors duration-300 ${inWishlist ? "fill-[#D0707A] text-[#D0707A]" : "text-[#8A6A58]"}`}
          />
        </button>
      </div>

      {/* ── Details ── */}
      <div className="px-1 text-center flex flex-col items-center">
        <h3 className="font-display text-lg text-[#1A0A05] transition-colors duration-300 group-hover:text-[#C9A028]">
          {product.name}
        </h3>
        <p className="font-body text-[13px] tracking-widest text-[#8A6A58] mt-1 uppercase" style={{ fontWeight: 500 }}>
          {product.price ? `PKR ${product.price.toLocaleString()}` : "Price on request"}
        </p>
      </div>
    </Link>
  );
}
