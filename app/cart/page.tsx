"use client";
/**
 * app/cart/page.tsx  — Shopping Cart
 * ─────────────────────────────────────────────────────
 * No payment processed on this site.
 * "Checkout" = opens WhatsApp with full cart message.
 *
 * SUPABASE INTEGRATION:
 *   For logged-in users, sync cart to Supabase:
 *   - On mount: merge localStorage cart with supabase cart_items
 *   - On add/remove/qty change: upsert/delete from cart_items table
 *   - On signout: clear localStorage
 */

import Link             from "next/link";
import Image            from "next/image";
import { Trash2, Plus, Minus, MessageCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart }      from "@/context/CartContext";
import { MorphingTextReveal } from "@/components/ui/morphing-text-reveal";

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCart();

  /* Build WhatsApp order message from all cart items */
  const buildWhatsAppMessage = () => {
    const lines = items.map(
      i => `• *${i.product.name}* × ${i.quantity} = PKR ${((i.product.price ?? 0) * i.quantity).toLocaleString()}${i.note ? `\n  _Note: ${i.note}_` : ""}`
    );
    const msg = `Hi Amna! I'd like to order:\n\n${lines.join("\n")}\n\n*Total: PKR ${totalPrice.toLocaleString()}*\n\nPlease confirm availability and arrange delivery. Thank you! 🌸`;
    return encodeURIComponent(msg);
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <ShoppingBag size={30} className="text-brand-gold mx-auto mb-3" />
          <MorphingTextReveal
            texts={["My Cart", "Selected Pieces", "Ready To Order"]}
            className="font-display text-5xl text-brand-cream"
            interval={2600}
          />
          <div className="divider" />
          <p className="font-body text-sm text-brand-creamDim/60">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="glass-card p-20 text-center">
            <ShoppingBag size={48} className="text-brand-cream/10 mx-auto mb-4" />
            <p className="font-display text-2xl text-brand-creamDim/40 mb-2">Your cart is empty</p>
            <p className="font-body text-sm text-brand-creamDim/30 mb-8">
              Browse our collection and add something beautiful
            </p>
            <Link href="/products" className="btn-gold inline-flex items-center gap-2 text-sm">
              Shop Now <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity, note }) => (
                <div key={product.id} className="glass-card p-5 flex gap-5">
                  {/* Image */}
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
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
                    {note && (
                      <p className="font-body text-xs text-brand-creamDim/50 mt-0.5 italic">Note: {note}</p>
                    )}
                    <p className="font-body text-brand-gold font-semibold mt-1 text-sm">
                      PKR {((product.price ?? 0) * quantity).toLocaleString()}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1 glass-card px-1 py-1 rounded-xl">
                        <button
                          onClick={() => updateQty(product.id, quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-brand-creamDim hover:text-brand-gold transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-body text-sm text-brand-cream">{quantity}</span>
                        <button
                          onClick={() => updateQty(product.id, quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-brand-creamDim hover:text-brand-gold transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="flex items-center gap-1 text-xs text-brand-creamDim/40 hover:text-brand-rose transition-colors"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear cart */}
              <button
                onClick={clearCart}
                className="text-xs text-brand-creamDim/40 hover:text-brand-rose transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} /> Clear cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-24">
                <h2 className="font-display text-xl text-brand-cream mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-xs font-body">
                      <span className="text-brand-creamDim/60 truncate max-w-[140px]">
                        {product.name} × {quantity}
                      </span>
                      <span className="text-brand-creamDim shrink-0 ml-2">
                        PKR {((product.price ?? 0) * quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-brand-cream/10 pt-4 mb-6">
                  <div className="flex justify-between font-body">
                    <span className="text-brand-creamDim/60 text-sm">Total</span>
                    <span className="text-brand-gold font-bold text-lg">PKR {totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="font-body text-[10px] text-brand-creamDim/30 mt-1">
                    Delivery charges will be confirmed via WhatsApp
                  </p>
                </div>

                {/* WhatsApp Checkout */}
                <a
                  href={`https://wa.me/923159202186?text=${buildWhatsAppMessage()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-body font-semibold text-sm py-3.5 rounded-xl transition-all duration-300 mb-3"
                >
                  <MessageCircle size={18} />
                  Order via WhatsApp
                </a>

                <p className="font-body text-[10px] text-brand-creamDim/30 text-center">
                  You'll be redirected to WhatsApp to complete your order with Amna directly.
                </p>

                <Link
                  href="/products"
                  className="mt-4 w-full flex items-center justify-center gap-2 btn-outline text-xs"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
