"use client";
/**
 * app/contact/page.tsx  — Contact Page
 * ─────────────────────────────────────────────────────
 * SUPABASE INTEGRATION:
 *   On form submit, save to contact_messages table:
 *
 *   const { error } = await supabase.from("contact_messages").insert({
 *     name:    form.name,
 *     email:   form.email || null,
 *     phone:   form.phone || null,
 *     subject: form.subject || null,
 *     message: form.message,
 *   });
 */

import { useState, FormEvent } from "react";
import AnimateIn from "@/components/ui/AnimateIn";
import { supabase } from "@/lib/supabase";
import { Instagram, Facebook, MessageCircle, Mail, Phone, Send, Check } from "lucide-react";

const SOCIALS = [
  {
    label: "WhatsApp",
    value: "0315-9202186",
    href:  "https://wa.me/923159202186?text=Hi%20Amna!%20I'd%20like%20to%20get%20in%20touch.",
    icon:  <MessageCircle size={20} className="text-green-400" />,
    hint:  "Chat directly for orders & questions",
  },
  {
    label: "Instagram",
    value: "@croch_etmasterpiece",
    href:  "https://www.instagram.com/croch_etmasterpiece?igsh=bzN4ZzEzYXZiZ2py",
    icon:  <Instagram size={20} className="text-pink-400" />,
    hint:  "Browse photos & reels of our work",
  },
  {
    label: "Facebook",
    value: "Croch_et Masterpiece",
    href:  "https://www.facebook.com/profile.php?id=61579353555271&mibextid=ZbWKwL",
    icon:  <Facebook size={20} className="text-blue-400" />,
    hint:  "Follow us for updates",
  },
  {
    label: "TikTok",
    value: "@croch_et.masterpiece",
    href:  "https://www.tiktok.com/@croch_et.masterpiece",
    icon:  (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="white" className="opacity-80">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.83a8.21 8.21 0 004.81 1.54V6.93a4.85 4.85 0 01-1.04-.24z"/>
      </svg>
    ),
    hint:  "See behind-the-scenes videos",
  },
  {
    label: "Email",
    value: "amnamubeen516@gmail.com",
    href:  "mailto:amnamubeen516@gmail.com",
    icon:  <Mail size={20} className="text-brand-gold" />,
    hint:  "For detailed inquiries",
  },
];

export default function ContactPage() {
  const [form,      setForm]      = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (f: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    try {
      const db = supabase as any;
      const { error } = await db.from("contact_messages").insert({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        subject: form.subject.trim() || null,
        message: form.message.trim(),
      });

      if (error) {
        throw new Error(error.message || "Unable to send message right now.");
      }

      // Open WhatsApp as fallback
      const msg = `Hi Amna!\n\n*From:* ${form.name}\n${form.subject ? `*Subject:* ${form.subject}\n` : ""}*Message:* ${form.message}`;
      window.open(`https://wa.me/923159202186?text=${encodeURIComponent(msg)}`, "_blank");

      await new Promise(r => setTimeout(r, 600));
      setSubmitted(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to send message right now.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <AnimateIn className="text-center mb-16">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-brand-gold">Say Hello</span>
          <h1 className="font-display text-5xl md:text-6xl text-brand-cream mt-3">Get in Touch</h1>
          <div className="divider" />
          <p className="font-body text-sm text-brand-creamDim/60 max-w-sm mx-auto">
            For orders, custom requests, or just to chat about crochet — we&apos;d love to hear from you.
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Social / Contact Info */}
          <AnimateIn direction="left">
            <h2 className="font-display text-2xl text-brand-cream mb-6">Find Us Here</h2>

            <div className="space-y-3">
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.label !== "Email" ? "_blank" : undefined}
                  rel="noreferrer"
                  className="glass-card flex items-center gap-4 p-4 hover:border-brand-cream/20 transition-all duration-300 group block"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-green/50 flex items-center justify-center shrink-0 group-hover:bg-brand-green transition-colors">
                    {s.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-xs uppercase tracking-wider text-brand-creamDim/50">{s.label}</p>
                    <p className="font-body text-sm text-brand-cream truncate">{s.value}</p>
                    <p className="font-body text-[11px] text-brand-creamDim/40">{s.hint}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Hours */}
            <div className="glass-card p-5 mt-4">
              <p className="font-body text-xs uppercase tracking-widest text-brand-gold mb-3">Response Times</p>
              <p className="font-body text-sm text-brand-creamDim/70 leading-relaxed">
                We typically reply within <strong className="text-brand-cream">a few hours</strong> during the day. WhatsApp is the fastest way to reach us for order-related queries.
              </p>
            </div>
          </AnimateIn>

          {/* Contact Form */}
          <AnimateIn direction="right" delay={0.1}>
            <h2 className="font-display text-2xl text-brand-cream mb-6">Send a Message</h2>

            {submitted ? (
              <div className="glass-card p-12 text-center">
                <Check size={36} className="text-brand-gold mx-auto mb-4" />
                <p className="font-display text-2xl text-brand-cream mb-2">Message Sent!</p>
                <p className="font-body text-sm text-brand-creamDim/60">
                  Your message has been opened in WhatsApp. We'll get back to you soon!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card p-7 space-y-5">
                {submitError ? (
                  <div className="rounded-xl border border-red-300/30 bg-red-100/30 px-3 py-2 text-xs text-red-700">
                    {submitError}
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Name *</label>
                    <input type="text" required value={form.name} onChange={update("name")} placeholder="Your name" className="input-dark" />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Phone</label>
                    <input type="tel" value={form.phone} onChange={update("phone")} placeholder="0315-xxxxxxx" className="input-dark" />
                  </div>
                </div>

                <div>
                  <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" className="input-dark" />
                </div>

                <div>
                  <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Subject</label>
                  <input type="text" value={form.subject} onChange={update("subject")} placeholder="Order inquiry, custom request..." className="input-dark" />
                </div>

                <div>
                  <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={update("message")}
                    placeholder="Tell us what's on your mind..." className="input-dark resize-none" />
                </div>

                <button type="submit" disabled={loading}
                  className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-70">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-brand-base/40 border-t-brand-base rounded-full animate-spin" />
                    : <><Send size={15} /> Send via WhatsApp</>}
                </button>
              </form>
            )}
          </AnimateIn>
        </div>
      </div>
    </div>
  );
}
