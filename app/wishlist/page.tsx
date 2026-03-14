"use client";
/**
 * app/wishlist/page.tsx  — Saved / Wishlist Page
 */

import Link                from "next/link";
import Image               from "next/image";
import { Heart, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useWishlist }     from "@/context/WishlistContext";
import { useCart }         from "@/context/CartContext";
import { MorphingTextReveal } from "@/components/ui/morphing-text-reveal";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem, isInCart } = useCart();

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <Heart size={30} className="text-brand-rose mx-auto mb-3" fill="currentColor" />
          <MorphingTextReveal
            texts={["My Wishlist", "Saved Favorites", "Dream Picks"]}
            className="font-display text-5xl text-brand-cream"
            interval={2600}
          />
          <div className="divider" />
          <p className="font-body text-sm text-brand-creamDim/60">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {items.length === 0 ? (
          <div className="glass-card p-20 text-center">
            <Heart size={48} className="text-brand-cream/10 mx-auto mb-4" />
            <p className="font-display text-2xl text-brand-creamDim/40 mb-2">Your wishlist is empty</p>
            <p className="font-body text-sm text-brand-creamDim/30 mb-8">Save items you love while you browse</p>
            <Link href="/products" className="btn-gold inline-flex items-center gap-2 text-sm">
              Browse Shop <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(product => (
              <div key={product.id} className="glass-card p-4 flex items-center gap-5">
                {/* Image */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={product.images?.[0] ?? "/placeholder-product.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <Link href={`/products/${product.slug}`}>
                    <p className="font-display text-lg text-brand-cream hover:text-brand-gold transition-colors truncate">
                      {product.name}
                    </p>
                  </Link>
                  {product.category && (
                    <p className="font-body text-xs text-brand-creamDim/50 mt-0.5">{product.category.name}</p>
                  )}
                  <p className="font-body text-brand-gold font-semibold mt-1">
                    {product.price ? `PKR ${product.price.toLocaleString()}` : "Price on request"}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!product.is_custom && (
                    <button
                      onClick={() => addItem(product)}
                      disabled={isInCart(product.id)}
                      className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                        isInCart(product.id)
                          ? "bg-brand-green/40 text-brand-cream/50 cursor-default"
                          : "btn-gold"
                      }`}
                    >
                      <ShoppingBag size={13} />
                      {isInCart(product.id) ? "In Cart" : "Add to Cart"}
                    </button>
                  )}
                  <button
                    onClick={() => removeItem(product.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-brand-creamDim/40 hover:text-brand-rose hover:bg-brand-rose/10 transition-all"
                    aria-label="Remove from wishlist"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Move all to cart */}
            <div className="pt-6 flex justify-end">
              <Link href="/products" className="btn-outline text-sm inline-flex items-center gap-2">
                Continue Shopping <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
