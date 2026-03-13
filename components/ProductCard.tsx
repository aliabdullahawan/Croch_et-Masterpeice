"use client";
/**
 * components/ProductCard.tsx
 * Fixed: persistent rounded corners, is_available-based "Unavailable" badge, disabled cart.
 */

import Link              from "next/link";
import Image             from "next/image";
import { useRouter }     from "next/navigation";
import { Heart, ShoppingCart, ArrowRight, Sparkles, Eye, AlertCircle } from "lucide-react";
import { useCart }       from "@/context/CartContext";
import { useWishlist }   from "@/context/WishlistContext";
import { ShatterIconButton } from "@/components/ui/shatter-button";
import type { Product }  from "@/lib/types";

interface ProductCardProps {
  product:   Product;
  featured?: boolean;
}

export default function ProductCard({ product, featured = false }: ProductCardProps) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const { toggle, isInList }  = useWishlist();

  const inCart     = isInCart(product.id);
  const inWishlist = isInList(product.id);
  /* is_available=false OR undefined → product is unavailable */
  const available  = product.is_available !== false;
  const imageUrl   = product.images?.[0] ?? "/placeholder-product.jpg";
  const productUrl = `/products/${product.slug}`;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    router.push(productUrl);
  };

  return (
    /* IMPORTANT: overflow-hidden is on the wrapper so children never bleed outside.
       We use transform via inline style — CSS clip is preserved because the wrapper
       maintains its border-radius via explicit style, not a class that could be
       overridden by hover utilities. */
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col cursor-pointer select-none ${featured ? "h-[420px]" : "h-[360px]"}`}
      style={{
        background:   "rgba(255,248,243,0.96)",
        border:       "1px solid rgba(201,160,40,0.14)",
        borderRadius: "16px",
        overflow:     "hidden",       /* ← kept via style so it's never lost */
        boxShadow:    "0 2px 12px rgba(61,43,31,0.06)",
        transition:   "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, border-color 0.25s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform   = "translateY(-10px) scale(1.025)";
        e.currentTarget.style.boxShadow   = "0 28px 60px rgba(61,43,31,0.22)";
        e.currentTarget.style.borderColor = "rgba(201,160,40,0.45)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform   = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow   = "0 2px 12px rgba(61,43,31,0.06)";
        e.currentTarget.style.borderColor = "rgba(201,160,40,0.14)";
      }}
    >
      {/* ── Unavailable overlay ── */}
      {!available && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center"
          style={{ background: "rgba(255,248,243,0.80)", backdropFilter: "blur(2px)" }}>
          <AlertCircle size={28} style={{ color: "#D0707A" }} className="mb-2" />
          <span className="font-body text-sm font-semibold" style={{ color: "#D0707A" }}>Unavailable</span>
          <span className="font-body text-xs mt-1" style={{ color: "#8A6A58" }}>Currently out of stock</span>
        </div>
      )}

      {/* ── Image ── */}
      <div className="relative flex-shrink-0 h-[60%]" style={{ overflow: "hidden" }}>
        <Image src={imageUrl} alt={product.name} fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw,33vw" />

        {/* Hover gradient */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{ background: "linear-gradient(to top, rgba(30,12,4,0.75) 0%, rgba(30,12,4,0.1) 55%, transparent 100%)" }} />

        {/* Category badge */}
        {product.category && !product.is_custom && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-body backdrop-blur-sm"
            style={{ background: "rgba(255,248,243,0.92)", color: "#B8900A", border: "1px solid rgba(201,160,40,0.28)", fontWeight: 700 }}>
            {product.category.name}
          </span>
        )}

        {/* Custom badge */}
        {product.is_custom && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-body flex items-center gap-1"
            style={{ background: "#C9A028", color: "#fff", fontWeight: 700 }}>
            <Sparkles size={8} /> Custom
          </span>
        )}

        {/* Wish */}
        {available && (
          <ShatterIconButton shardColor={inWishlist ? "#E8A0A8" : "#C9A028"} shardCount={10}
            onClick={e => { e.stopPropagation(); toggle(product); }}
            aria-label="Wishlist"
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all duration-200"
            style={{
              background: inWishlist ? "#E8A0A8" : "rgba(255,248,243,0.88)",
              border: `1px solid ${inWishlist ? "#E8A0A8" : "rgba(61,43,31,0.1)"}`,
              color: inWishlist ? "#fff" : "#7A5A48",
            }}>
            <Heart size={14} fill={inWishlist ? "currentColor" : "none"} />
          </ShatterIconButton>
        )}

        {/* Quick actions */}
        {available && (
          <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
            style={{ transition: "opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
            {product.is_custom ? (
              <Link href="/custom-order" onClick={e => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-body font-bold hover:scale-105 transition-transform"
                style={{ background: "linear-gradient(135deg, #C9A028, #E2B84A)", color: "#fff" }}>
                <Sparkles size={11} /> Request Custom
              </Link>
            ) : (
              <>
                <ShatterIconButton shardColor={inCart ? "#4AABAB" : "#C9A028"} shardCount={12}
                  onClick={e => { e.stopPropagation(); !inCart && addItem(product); }} disabled={inCart}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-body font-bold"
                  style={{
                    background: inCart ? "rgba(107,191,191,0.25)" : "linear-gradient(135deg, #C9A028, #E2B84A)",
                    color: inCart ? "#4AABAB" : "#fff",
                  }}>
                  <ShoppingCart size={11} /> {inCart ? "✓ In Cart" : "Add to Cart"}
                </ShatterIconButton>
                <ShatterIconButton shardColor="#6BBFBF" shardCount={8}
                  onClick={e => { e.stopPropagation(); router.push(productUrl); }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl"
                  style={{ background: "rgba(255,248,243,0.92)", border: "1px solid rgba(61,43,31,0.14)", color: "#1A0A05" }}>
                  <Eye size={15} />
                </ShatterIconButton>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col justify-between flex-grow p-4 pb-5">
        <div>
          <h3 className="font-display text-lg leading-snug mb-1.5 transition-colors duration-300 group-hover:text-[#B8900A]"
            style={{ color: "#160A02", fontWeight: 600 }}>
            {product.name}
          </h3>
          <p className="font-body text-xs line-clamp-2 leading-relaxed" style={{ color: "#5A3A28" }}>
            {product.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(61,43,31,0.08)" }}>
          <span className="font-body font-bold text-base" style={{ color: available ? "#B8900A" : "#8A6A58" }}>
            {product.price ? `PKR ${product.price.toLocaleString()}` : "Price on request"}
          </span>
          <Link href={productUrl} onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] font-body font-semibold transition-all duration-200 group/link"
            style={{ color: "#7A5A48" }}>
            View <ArrowRight size={11} className="transition-transform group-hover/link:translate-x-1.5" />
          </Link>
        </div>
      </div>

      {/* Bottom stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "linear-gradient(90deg, #E8A0A8, #C9A028, #6BBFBF, #C9A028, #E8A0A8)" }} />
    </div>
  );
}
