"use client";
/**
 * app/custom-order/page.tsx  — Custom Order Form
 * Two-column layout with image upload + WhatsApp integration.
 * On submit: saves to localStorage (admin sees it) THEN opens WhatsApp.
 */

import { useState, useRef, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { saveCustomOrder } from "@/lib/order-store";
import {
  Sparkles,
  MessageCircle,
  ArrowRight,
  Check,
  Upload,
  X,
  Clock,
  Tag,
  Truck,
  CreditCard,
} from "lucide-react";

interface FormState {
  name:        string;
  phone:       string;
  email:       string;
  category:    string;
  description: string;
  budget:      string;
  deadline:    string;
}

const INITIAL: FormState = {
  name: "", phone: "", email: "", category: "",
  description: "", budget: "", deadline: "",
};

const CATEGORIES = [
  "Bags & Totes",
  "Amigurumi / Stuffed Toys",
  "Home Décor",
  "Accessories",
  "Baby Items",
  "Gift Items",
  "Clothing / Sweaters",
  "Other",
];

const WHAT_TO_EXPECT = [
  { icon: Clock,      text: "We'll review your request within 24 hours" },
  { icon: Tag,        text: "You'll receive a price estimate and timeline" },
  { icon: Sparkles,   text: "Once approved, we'll start creating your custom piece" },
  { icon: CreditCard, text: "Payment and delivery details will be shared via WhatsApp" },
];

export default function CustomOrderPage() {
  const [form,      setForm]      = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [images,    setImages]    = useState<string[]>([]);   // base64 previews
  const [imageNames, setImageNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setImages(prev => [...prev, ev.target?.result as string]);
        setImageNames(prev => [...prev, file.name]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImageNames(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setImages(prev => [...prev, ev.target?.result as string]);
        setImageNames(prev => [...prev, file.name]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    /* ── Save to localStorage → visible in /admin/orders/custom ── */
    saveCustomOrder({
      type:        "custom",
      name:        form.name,
      phone:       form.phone,
      email:       form.email || undefined,
      category:    form.category,
      description: form.description,
      budget:      form.budget || undefined,
      deadline:    form.deadline || undefined,
      imageNames:  imageNames.length > 0 ? imageNames : undefined,
    });

    /* ── Open WhatsApp with pre-filled message ── */
    const imageLine = imageNames.length > 0
      ? `\n*Reference Images:* ${imageNames.length} image(s) — I'll send them right after this message.\n`
      : "";

    const msg = `Hi Amna! I'd like to place a custom crochet order \uD83C\uDF38

*Name:* ${form.name}
*Phone:* ${form.phone}
${form.email ? `*Email:* ${form.email}\n` : ""}*Category:* ${form.category || "Not specified"}
*Description:* ${form.description}
${form.budget   ? `*Budget:* ${form.budget}\n`    : ""}${form.deadline ? `*Timeline:* ${form.deadline}\n` : ""}${imageLine}
Looking forward to hearing from you!`;

    window.open(`https://wa.me/923159202186?text=${encodeURIComponent(msg)}`, "_blank");
    setSubmitted(true);
  };

  /* ─── shared card style ─── */
  const cardStyle: React.CSSProperties = {
    background: "var(--bg-card, rgba(255,255,255,0.92))",
    border: "1px solid var(--border, rgba(61,43,31,0.14))",
    borderRadius: "18px",
    boxShadow: "0 4px 24px rgba(61,43,31,0.07)",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--input-bg, rgba(255,255,255,0.95))",
    border: "1px solid var(--input-border, rgba(61,43,31,0.18))",
    borderRadius: "10px",
    padding: "12px 14px",
    color: "var(--cream, #2C1A0E)",
    fontFamily: "inherit",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--cream-dim, #5C3D2C)",
    marginBottom: "6px",
    fontFamily: "inherit",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  };

  return (
    <div className="pt-28 pb-20 min-h-screen" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-6xl mx-auto px-6">

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex w-14 h-14 rounded-full items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, rgba(201,160,40,0.15), rgba(232,160,168,0.15))", border: "2px solid rgba(201,160,40,0.3)" }}>
            <Sparkles size={26} style={{ color: "var(--gold, #B8900A)" }} />
          </div>
          <h1 className="font-display text-5xl mb-3" style={{ color: "var(--cream)" }}>Custom Order</h1>
          <div className="divider" />
          <p className="font-body text-base max-w-md mx-auto leading-relaxed" style={{ color: "var(--cream-dim, #5C3D2C)" }}>
            Fill in the details below and we&apos;ll open WhatsApp so you can finalise your order directly with us.
          </p>
        </div>

        {submitted ? (
          /* ── Success State ── */
          <div className="glass-card p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto mb-5">
              <Check size={28} className="text-brand-gold" />
            </div>
            <h2 className="font-display text-3xl text-brand-cream mb-3">WhatsApp Opened!</h2>
            <p className="font-body text-sm text-brand-creamDim/60 mb-2 max-w-sm mx-auto">
              Your order details have been pre-filled in WhatsApp. Send the message to Amna to get started!
            </p>
            {imageNames.length > 0 && (
              <p className="font-body text-sm text-brand-gold/80 mb-6 max-w-sm mx-auto">
                📎 Don&apos;t forget to attach your {imageNames.length} reference image{imageNames.length > 1 ? "s" : ""} in the WhatsApp chat!
              </p>
            )}
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => { setSubmitted(false); setImages([]); setImageNames([]); setForm(INITIAL); }} className="btn-outline text-sm">
                Submit Another Order
              </button>
              <Link href="/products" className="btn-gold text-sm inline-flex items-center gap-2">
                Browse Shop <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          /* ── Two-Column Form Layout ── */
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ── LEFT: Form (2/3 width) ── */}
              <div className="lg:col-span-2 space-y-6">

                {/* Contact Information */}
                <div className="p-7 rounded-2xl space-y-5" style={cardStyle}>
                  <h2 className="font-display text-xl" style={{ color: "var(--cream)" }}>Contact Information</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Name <span style={{ color: "#e57373" }}>*</span></label>
                      <input type="text" required value={form.name} onChange={update("name")} placeholder="Your name" style={inputStyle} className="focus:border-brand-gold/50" />
                    </div>
                    <div>
                      <label style={labelStyle}>Email <span style={{ color: "rgba(247,231,206,0.3)" }}>(optional)</span></label>
                      <input type="email" value={form.email} onChange={update("email")} placeholder="your@email.com" style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Phone / WhatsApp <span style={{ color: "#E8A0A8" }}>*</span></label>
                    <input type="tel" required value={form.phone} onChange={update("phone")} placeholder="03XX-XXXXXXX" style={inputStyle} />
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-7 rounded-2xl space-y-5" style={cardStyle}>
                  <h2 className="font-display text-xl" style={{ color: "var(--cream)" }}>Order Details</h2>

                  <div>
                    <label style={labelStyle}>Category <span style={{ color: "#e57373" }}>*</span></label>
                    <select
                      required
                      value={form.category}
                      onChange={update("category")}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Describe what you want <span style={{ color: "#E8A0A8" }}>*</span></label>
                    <textarea
                      required
                      rows={5}
                      value={form.description}
                      onChange={update("description")}
                      placeholder="Describe the design, size, colors, materials, and any other details..."
                      style={{ ...inputStyle, resize: "none" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Budget Range <span style={{ color: "rgba(247,231,206,0.3)" }}>(Optional)</span></label>
                      <input type="text" value={form.budget} onChange={update("budget")} placeholder="e.g., Rs. 2000–3000" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>When do you need it? <span style={{ color: "rgba(247,231,206,0.3)" }}>(Optional)</span></label>
                      <input type="text" value={form.deadline} onChange={update("deadline")} placeholder="e.g., Within 2 weeks" style={inputStyle} />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label style={labelStyle}>Reference Images <span style={{ color: "rgba(247,231,206,0.3)" }}>(Optional)</span></label>

                    {/* Drop zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={e => e.preventDefault()}
                      className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl transition-all duration-200 hover:border-brand-gold/40 hover:bg-brand-gold/5"
                      style={{
                        border: "1.5px dashed rgba(255,255,255,0.15)",
                        padding: "28px 20px",
                        minHeight: "100px",
                      }}
                    >
                      <Upload size={22} style={{ color: "rgba(247,231,206,0.4)" }} />
                      <p className="font-body text-sm" style={{ color: "rgba(247,231,206,0.5)" }}>
                        Upload images
                      </p>
                      <p className="font-body text-xs" style={{ color: "rgba(247,231,206,0.3)" }}>
                        Click or drag & drop your inspiration photos
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={onFiles}
                      className="hidden"
                    />

                    {/* Image previews */}
                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {images.map((src, i) => (
                          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                            <Image src={src} alt={imageNames[i]} fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: "rgba(0,0,0,0.8)" }}
                            >
                              <X size={11} style={{ color: "#F7E7CE" }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-body font-semibold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
                    color: "#fff",
                    boxShadow: "0 8px 24px rgba(37,211,102,0.25)",
                  }}
                >
                  <MessageCircle size={20} />
                  Send Request on WhatsApp
                </button>

                <p className="font-body text-[11px] text-brand-creamDim/40 text-center">
                  Clicking will open WhatsApp with your order details pre-filled. No payment is processed on this site.
                </p>
              </div>

              {/* ── RIGHT: Sidebar (1/3 width) ── */}
              <div className="space-y-5">

                {/* Prefer to chat */}
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <h3 className="font-display text-base text-brand-cream mb-2">Prefer to chat?</h3>
                  <p className="font-body text-xs leading-relaxed mb-5" style={{ color: "rgba(247,231,206,0.55)" }}>
                    Share your ideas directly with us on WhatsApp for a faster response.
                  </p>
                  <a
                    href="https://wa.me/923159202186"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-body font-semibold text-sm transition-all duration-200 hover:scale-[1.03]"
                    style={{
                      background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
                      color: "#fff",
                      boxShadow: "0 6px 20px rgba(37,211,102,0.2)",
                    }}
                  >
                    <MessageCircle size={16} />
                    Chat on WhatsApp
                  </a>
                </div>

                {/* What to Expect */}
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <h3 className="font-display text-base text-brand-cream mb-5">What to Expect</h3>
                  <ul className="space-y-4">
                    {WHAT_TO_EXPECT.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-start gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: "rgba(195,152,72,0.12)" }}
                        >
                          <Icon size={13} style={{ color: "#c39448" }} />
                        </div>
                        <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(247,231,206,0.6)" }}>
                          {text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
