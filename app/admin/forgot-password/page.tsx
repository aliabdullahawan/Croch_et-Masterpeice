"use client";
/**
 * app/admin/forgot-password/page.tsx — Admin Forgot Password
 */
import { useState } from "react";
import Link         from "next/link";
import { supabase } from "@/lib/supabase";
import { Mail, Scissors } from "lucide-react";
import { MorphingTextReveal } from "@/components/ui/morphing-text-reveal";

export default function AdminForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/login`,
      });

      if (resetError) {
        throw resetError;
      }

      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to send reset link right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "linear-gradient(135deg, #120A04 0%, #1C1208 60%, #140D06 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#C9A028] flex items-center justify-center mx-auto mb-4">
            <Scissors size={18} className="text-[#1C1208]" />
          </div>
          <p className="font-display text-lg text-[#F2E9DE]">Croch_et Admin</p>
        </div>

        <div className="bg-[rgba(42,22,10,0.8)] border border-[rgba(201,160,40,0.15)] rounded-2xl p-7">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[rgba(201,160,40,0.15)] flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-[#C9A028]" />
              </div>
              <h2 className="font-display text-lg text-[#F2E9DE] mb-2">Check your inbox</h2>
              <p className="font-body text-xs text-[#7A5A48] mb-6">
                Reset link sent to <strong className="text-[#C9A028]">{email}</strong>
              </p>
              <Link href="/admin/login"
                className="inline-block px-6 py-2.5 rounded-xl font-body text-sm font-semibold text-[#1C1208] transition-transform hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #C9A028, #E2B84A)" }}>
                Back to Admin Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-1">
                <MorphingTextReveal
                  texts={["Reset Password", "Admin Recovery", "Restore Access"]}
                  className="font-display text-xl text-[#F2E9DE]"
                  interval={2400}
                />
              </div>
              <p className="font-body text-xs text-[#7A5A48] mb-6">Admin password reset via email</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error ? (
                  <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    {error}
                  </div>
                ) : null}
                <div>
                  <label className="block font-body text-xs text-[#C8B89A]/60 mb-1.5">Admin Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@croch_et.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[rgba(28,18,8,0.8)] border border-[rgba(201,160,40,0.15)] text-sm text-[#F2E9DE] placeholder-[#4A3020] outline-none focus:border-[#C9A028] transition-colors" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-body font-semibold text-sm text-[#1C1208] disabled:opacity-60 transition-transform hover:scale-102 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #C9A028, #E2B84A)" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                  onMouseUp={e => (e.currentTarget.style.transform = "scale(1.02)")}
                >
                  {loading ? <span className="w-4 h-4 border-2 border-[#1C1208]/30 border-t-[#1C1208] rounded-full animate-spin" /> : <><Mail size={14} /> Send Reset Link</>}
                </button>
              </form>
              <p className="text-center mt-5">
                <Link href="/admin/login" className="font-body text-xs text-[#7A5A48] hover:text-[#C9A028] transition-colors">
                  ← Back to Admin Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
