"use client";
/**
 * app/products/[id]/page.tsx  — Product Detail Page
 * Mobile-first. Enhanced WhatsApp Buy Now flow.
 */

import { useState }        from "react";
import Image               from "next/image";
import Link                from "next/link";
import { notFound }        from "next/navigation";
import {
  ShoppingBag, Heart, MessageCircle, Star, ArrowLeft,
  Sparkles, Check, Send, User, ShoppingCart, Zap,
} from "lucide-react";
import { useCart }         from "@/context/CartContext";
import { useWishlist }     from "@/context/WishlistContext";
import { useTheme }        from "@/context/ThemeContext";
import ProductCard         from "@/components/ProductCard";
import { MOCK_PRODUCTS, MOCK_REVIEWS } from "@/data/products";

interface Props { params: { id: string } }

interface LocalReview {
  id: string; name: string; rating: number; body: string; date: string;
}

const STAR_LABELS = ["Poor", "Fair", "Good", "Great", "Excellent"];

export default function ProductDetailPage({ params }: Props) {
  const product = MOCK_PRODUCTS.find(p => p.slug === params.id);
  if (!product) notFound();

  const related     = MOCK_PRODUCTS.filter(p => p.id !== product.id && p.category_id === product.category_id).slice(0, 3);
  const seedReviews = MOCK_REVIEWS.filter(r => r.product_id === product.id);
  const avgRating   = seedReviews.length > 0
    ? Math.round(seedReviews.reduce((s, r) => s + r.rating, 0) / seedReviews.length)
    : 5;

  const { addItem, isInCart } = useCart();
  const { toggle, isInList }  = useWishlist();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tBaseBg     = isDark ? "#1A0D06" : "#FDF8F3";
  const tCardBg     = isDark ? "rgba(42,22,10,0.9)" : "rgba(255,248,243,0.9)";
  const tTextMain   = isDark ? "#F2E9DE" : "#3D2B1F";
  const tTextDim    = isDark ? "#C8B89A" : "#7A5A48";
  const tTextMuted  = isDark ? "rgba(200,184,154,0.7)" : "rgba(122,90,72,0.6)";
  const tBorder     = isDark ? "rgba(201,160,40,0.15)" : "rgba(61,43,31,0.12)";
  const tInputBg    = isDark ? "rgba(42,22,10,0.8)" : "rgba(255,248,243,0.9)";

  const [activeImage,  setActiveImage]  = useState(0);
  const [qty,          setQty]          = useState(1);
  const [note,         setNote]         = useState("");
  const [addedToCart,  setAddedToCart]  = useState(false);

  // Review form state
  const [localReviews, setLocalReviews] = useState<LocalReview[]>([]);
  const [reviewName,   setReviewName]   = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody,   setReviewBody]   = useState("");
  const [hoverRating,  setHoverRating]  = useState(0);
  const [reviewSent,   setReviewSent]   = useState(false);

  const inCart     = isInCart(product.id);
  const inWishlist = isInList(product.id);

  const handleAddToCart = () => {
    addItem(product, qty, note);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewBody.trim()) return;
    setLocalReviews(prev => [{
      id: `lr-${Date.now()}`, name: reviewName.trim(), rating: reviewRating,
      body: reviewBody.trim(),
      date: new Date().toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }),
    }, ...prev]);
    setReviewName(""); setReviewBody(""); setReviewRating(5);
    setReviewSent(true);
    setTimeout(() => setReviewSent(false), 3000);
  };

  const allReviews = [...localReviews, ...seedReviews.map(r => ({
    id: r.id, name: r.profile?.full_name ?? "Anonymous",
    rating: r.rating, body: r.body, date: "Verified Purchase",
  }))];

  /* ── WhatsApp messages ── */
  // Standard order enquiry
  const whatsappOrderMsg = encodeURIComponent(
    `Hi Amna! 🌸 I'd like to order:\n\n` +
    `*Product:* ${product.name}\n` +
    (product.category ? `*Category:* ${product.category.name}\n` : "") +
    (product.price ? `*Price:* PKR ${product.price.toLocaleString()}\n` : "") +
    `*Quantity:* ${qty}\n` +
    (note ? `*Notes:* ${note}\n` : "") +
    `\nPlease confirm availability and delivery details. Thank you! 🧶`
  );

  // "Buy Now" — urgent direct purchase
  const whatsappBuyNowMsg = encodeURIComponent(
    `🛒 *BUY NOW REQUEST*\n\n` +
    `Product: ${product.name}\n` +
    (product.category ? `Category: ${product.category.name}\n` : "") +
    (product.price ? `Price: PKR ${product.price.toLocaleString()} × ${qty} = PKR ${((product.price ?? 0) * qty).toLocaleString()}\n` : "") +
    (note ? `Special instructions: ${note}\n` : "") +
    `\nI'm ready to place this order. Please confirm payment details.`
  );

  const cardStyle: React.CSSProperties = {
    background: tCardBg,
    border: `1px solid ${tBorder}`,
    borderRadius: "16px",
    boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(61,43,31,0.07)",
  };

  return (
    <div className="pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen" style={{ background: tBaseBg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-body mb-4 sm:mb-8 flex-wrap" style={{ color: tTextMuted }}>
          <Link href="/" className="hover:text-brand-cream transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-cream transition-colors">Shop</Link>
          <span>/</span>
          <span className="truncate max-w-[160px] sm:max-w-none" style={{ color: tTextMain }}>{product.name}</span>
        </div>

        {/* Back */}
        <Link href="/products" className="inline-flex items-center gap-2 text-xs font-body mb-6 group transition-colors" style={{ color: tTextMuted, minHeight: "44px" }}>
          <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
          Back to Shop
        </Link>

        {/* ── Main product section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mb-14 sm:mb-20">

          {/* Images */}
          <div>
            <div className="relative rounded-2xl overflow-hidden mb-3 sm:mb-4"
              style={{
                height: "clamp(260px, 50vw, 480px)",
                boxShadow: isDark ? "0 8px 40px rgba(0,0,0,0.5)" : "0 8px 40px rgba(61,43,31,0.14)",
                border: "2px solid rgba(232,160,168,0.2)",
              }}>
              <Image
                src={product.images?.[activeImage] ?? "/placeholder-product.jpg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.is_custom && (
                <div className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1" style={{ background: "#C9A028", color: "#fff" }}>
                  <Sparkles size={10} /> Custom Order
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0"
                    style={{ borderColor: activeImage === i ? "#C9A028" : "transparent", opacity: activeImage === i ? 1 : 0.6 }}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <span className="font-body text-xs uppercase tracking-widest" style={{ color: "#C9A028" }}>
                {product.category.name}
              </span>
            )}

            <h1 className="font-display mt-2 mb-3 leading-tight" style={{ color: tTextMain, fontSize: "clamp(1.75rem, 5vw, 3rem)" }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < avgRating ? "currentColor" : "none"} style={{ color: "#C9A028" }} />
                ))}
              </div>
              <span className="font-body text-xs" style={{ color: tTextMuted }}>({allReviews.length} reviews)</span>
            </div>

            <p className="font-body font-semibold mb-5" style={{ color: "#C9A028", fontSize: "clamp(1.4rem, 4vw, 2rem)" }}>
              {product.price ? `PKR ${product.price.toLocaleString()}` : "Price on request"}
            </p>

            <p className="font-body text-sm leading-relaxed mb-6" style={{ color: tTextDim }}>
              {product.description}
            </p>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map(tag => (
                  <span key={tag} className="font-body text-[10px] uppercase tracking-wider px-2 py-1 rounded-full"
                    style={{ color: tTextDim, border: `1px solid ${tBorder}`, background: "rgba(232,160,168,0.1)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {!product.is_custom ? (
              <>
                {/* Quantity */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-body text-xs uppercase tracking-wider" style={{ color: tTextMuted }}>Qty</span>
                  <div className="flex items-center gap-0 rounded-xl overflow-hidden" style={{ border: `1px solid ${tBorder}`, background: tCardBg }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-lg" style={{ color: tTextMain }}>−</button>
                    <span className="w-10 text-center font-body text-sm font-semibold" style={{ color: tTextMain }}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} className="w-11 h-11 flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5 text-lg" style={{ color: tTextMain }}>+</button>
                  </div>
                </div>

                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Any special notes? (colour preference, size, etc.)"
                  rows={2}
                  className="w-full rounded-xl px-4 py-3 font-body transition-all duration-300 outline-none bg-white/90 border border-[#3D2B1F]/15 text-[#3D2B1F] focus:border-[#C9A028]/60 focus:bg-white focus:shadow-[0_0_0_3px_rgba(201,160,40,0.12)] placeholder:text-[#7A5A48]/60 resize-none mb-4"
                />

                {/* Total price preview */}
                {product.price && qty > 1 && (
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-4"
                    style={{ background: "rgba(201,160,40,0.07)", border: "1px solid rgba(201,160,40,0.18)" }}>
                    <span className="font-body text-xs" style={{ color: tTextDim }}>Total ({qty} items)</span>
                    <span className="font-body font-bold text-sm" style={{ color: "#B8900A" }}>
                      PKR {(product.price * qty).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-body font-semibold text-sm transition-all duration-300"
                    style={{
                      minHeight: "48px",
                      background: addedToCart
                        ? "linear-gradient(135deg, #6BBFBF, #4AAAA0)"
                        : inCart
                          ? "rgba(107,191,191,0.3)"
                          : "linear-gradient(135deg, #C9A028, #E2B84A)",
                      color: inCart && !addedToCart ? "#6BBFBF" : "#fff",
                      boxShadow: addedToCart || inCart ? "none" : "0 6px 20px rgba(201,160,40,0.3)",
                    }}
                    disabled={inCart && !addedToCart}
                  >
                    {addedToCart ? <><Check size={16} /> Added!</> : <><ShoppingBag size={16} /> Add to Cart</>}
                  </button>

                  {/* Buy Now via WhatsApp */}
                  <a
                    href={`https://wa.me/923159202186?text=${whatsappBuyNowMsg}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-body font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, #128c7e, #075e54)", color: "#fff", boxShadow: "0 6px 20px rgba(18,140,126,0.3)", minHeight: "48px" }}
                  >
                    <Zap size={16} /> Buy Now via WhatsApp
                  </a>
                </div>

                {/* Order via WhatsApp (softer, secondary) */}
                <a
                  href={`https://wa.me/923159202186?text=${whatsappOrderMsg}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-body font-semibold text-sm transition-all duration-300 hover:scale-[1.01] mb-3"
                  style={{ background: "linear-gradient(135deg, #25d366, #128c7e)", color: "#fff", boxShadow: "0 4px 16px rgba(37,211,102,0.2)", minHeight: "48px" }}
                >
                  <MessageCircle size={16} /> Order Enquiry via WhatsApp
                </a>

                <button
                  onClick={() => toggle(product)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-body text-sm transition-all duration-300"
                  style={{
                    minHeight: "44px",
                    border: `1px solid ${inWishlist ? "#E8A0A8" : "rgba(61,43,31,0.15)"}`,
                    color: inWishlist ? "#E8A0A8" : tTextDim,
                    background: inWishlist ? "rgba(232,160,168,0.08)" : "transparent",
                  }}
                >
                  <Heart size={15} fill={inWishlist ? "currentColor" : "none"} />
                  {inWishlist ? "Saved to Wishlist" : "Save to Wishlist"}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <Link href="/custom-order" className="btn-gold w-full flex items-center justify-center gap-2 py-3" style={{ minHeight: "48px" }}>
                  <Sparkles size={16} /> Request Custom Order
                </Link>
                <a
                  href={`https://wa.me/923159202186?text=${encodeURIComponent(`Hi Amna! 🌸 I'd like to discuss a *custom crochet order* for: ${product.name}\n\nPlease let me know how we can get started!`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-body font-semibold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #25d366, #128c7e)", color: "#fff", boxShadow: "0 6px 20px rgba(37,211,102,0.25)", minHeight: "48px" }}
                >
                  <MessageCircle size={16} /> Discuss on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <section className="mb-14 sm:mb-20">
          <h2 className="font-display text-2xl sm:text-3xl mb-2" style={{ color: tTextMain }}>Customer Reviews</h2>
          <div className="divider" style={{ marginLeft: 0 }} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mt-6 sm:mt-8">

            {/* Add a Review Form */}
            <div className="p-5 sm:p-7 rounded-2xl" style={cardStyle}>
              <h3 className="font-display text-lg sm:text-xl mb-1" style={{ color: tTextMain }}>Share Your Experience</h3>
              <p className="font-body text-xs mb-5" style={{ color: tTextMuted }}>Help others by leaving a review for this product.</p>

              {reviewSent && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 font-body text-sm" style={{ background: "rgba(107,191,191,0.15)", border: "1px solid rgba(107,191,191,0.3)", color: "#4AAAA0" }}>
                  <Check size={15} /> Thank you! Your review has been added.
                </div>
              )}

              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block font-body text-xs mb-1.5" style={{ color: tTextMuted }}>Your Name <span style={{ color: "#E8A0A8" }}>*</span></label>
                  <input type="text" required value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder="e.g. Ayesha R." className="w-full rounded-xl px-4 py-3 font-body transition-all duration-300 outline-none bg-white/90 border border-[#3D2B1F]/15 text-[#3D2B1F] focus:border-[#C9A028]/60 focus:bg-white focus:shadow-[0_0_0_3px_rgba(201,160,40,0.12)] placeholder:text-[#7A5A48]/60" />
                </div>
                <div>
                  <label className="block font-body text-xs mb-2" style={{ color: tTextMuted }}>Your Rating <span style={{ color: "#E8A0A8" }}>*</span></label>
                  <div className="flex items-center gap-1 flex-wrap">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-all duration-150 hover:scale-125"
                        style={{ minWidth: "44px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        aria-label={`${star} star`}
                      >
                        <Star size={28} fill={(hoverRating || reviewRating) >= star ? "currentColor" : "none"} style={{ color: "#C9A028", strokeWidth: 1.5 }} />
                      </button>
                    ))}
                    {(hoverRating || reviewRating) > 0 && (
                      <span className="font-body text-xs ml-1" style={{ color: "#C9A028" }}>{STAR_LABELS[(hoverRating || reviewRating) - 1]}</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block font-body text-xs mb-1.5" style={{ color: tTextMuted }}>Your Review <span style={{ color: "#E8A0A8" }}>*</span></label>
                  <textarea required rows={4} value={reviewBody} onChange={e => setReviewBody(e.target.value)} placeholder="Tell others what you think about this product..." className="w-full rounded-xl px-4 py-3 font-body transition-all duration-300 outline-none bg-white/90 border border-[#3D2B1F]/15 text-[#3D2B1F] focus:border-[#C9A028]/60 focus:bg-white focus:shadow-[0_0_0_3px_rgba(201,160,40,0.12)] placeholder:text-[#7A5A48]/60 resize-none" />
                </div>
                <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-body font-semibold text-sm transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #C9A028, #E2B84A)", color: "#fff", boxShadow: "0 6px 20px rgba(201,160,40,0.3)", minHeight: "48px" }}>
                  <Send size={15} /> Post Review
                </button>
              </form>
            </div>

            {/* Existing Reviews */}
            <div className="space-y-4">
              {allReviews.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={cardStyle}>
                  <p className="font-display text-xl mb-2" style={{ color: tTextMain }}>No reviews yet</p>
                  <p className="font-body text-sm" style={{ color: tTextMuted }}>Be the first to review this product!</p>
                </div>
              ) : (
                allReviews.map(r => (
                  <div key={r.id} className="p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5" style={{ ...cardStyle, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 20px rgba(61,43,31,0.06)" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #F0C4C8, #E8A0A8)", color: "#fff" }}>
                        <User size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <p className="font-body text-sm font-semibold truncate" style={{ color: tTextMain }}>{r.name}</p>
                          <span className="font-body text-[10px] flex-shrink-0" style={{ color: tTextMuted }}>{r.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} fill={i < r.rating ? "currentColor" : "none"} style={{ color: "#C9A028" }} />
                          ))}
                        </div>
                        <p className="font-body text-sm leading-relaxed" style={{ color: tTextDim }}>"{r.body}"</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display text-2xl sm:text-3xl mb-6 sm:mb-8" style={{ color: tTextMain }}>You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
