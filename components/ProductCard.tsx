"use client";
import Link from "next/link";
import Image from "next/image";
import { Clock3, Heart, Package2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const { toggle, isInList } = useWishlist();
  const inWishlist = isInList(product.id);
  const imageUrl = product.images?.[0] ?? "/placeholder-product.jpg";
  const productUrl = `/products/${product.slug}`;
  const shortDescription = (product.description ?? "Handcrafted crochet piece made with premium care.").slice(0, 92);
  const uploadedText = new Date(product.created_at).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  const quantityText = typeof product.stock_qty === "number" ? `${product.stock_qty} in stock` : "Limited stock";

  return (
    <Link href={productUrl} className="group block w-full relative">
      <article className="rounded-3xl border border-[#E9DCCB] bg-[linear-gradient(180deg,#fffdfb_0%,#fff7ee_100%)] p-3 shadow-[0_10px_30px_-20px_rgba(61,43,31,0.5)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_44px_-20px_rgba(61,43,31,0.32)] group-hover:border-[#D7B98E]">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#FDF8F5] mb-3">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.18),transparent_45%)] opacity-60" />

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(product);
            }}
            className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-transform duration-300 hover:scale-110 active:scale-95"
            aria-label="Toggle Wishlist"
          >
            <Heart
              size={17}
              className={`transition-colors duration-300 ${inWishlist ? "fill-[#D0707A] text-[#D0707A]" : "text-[#8A6A58]"}`}
            />
          </button>
        </div>

        <div className="px-1 pb-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1D6] px-2 py-1 text-[10px] font-semibold text-[#8C6418]">
              <Clock3 size={11} /> {uploadedText}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F8F2] px-2 py-1 text-[10px] font-semibold text-[#2E6A3A]">
              <Package2 size={11} /> {quantityText}
            </span>
          </div>
          <h3 className="font-display text-lg text-[#1A0A05] transition-colors duration-300 group-hover:text-[#A5791C] line-clamp-1">
            {product.name}
          </h3>
          <p className="font-body text-[13px] text-[#6E4F3E] mt-1.5 line-clamp-2 min-h-[40px]">
            {shortDescription}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <p className="font-body text-sm tracking-wide text-[#8A6A58] uppercase" style={{ fontWeight: 600 }}>
              {product.price ? `PKR ${product.price.toLocaleString()}` : "Price on request"}
            </p>
            <span className="text-[11px] rounded-full border border-[#D8B778] px-2.5 py-1 text-[#8C6418] bg-[#FFF6E6]">
              View Product
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
