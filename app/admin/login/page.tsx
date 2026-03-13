"use client";
/**
 * app/admin/login/page.tsx — Admin Login
 * Only email + password + Forgot Password. No Google.
 */

import { useState } from "react";
import Link         from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Scissors } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminSignIn } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminSignIn(email, password);
      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #120A04 0%, #1C1208 60%, #140D06 100%)" }}>
      {/* bg blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A028]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#4AABAB]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm px-6 py-10">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[#C9A028] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#C9A028]/20">
            <Scissors size={22} className="text-[#1C1208]" />
          </div>
          <p className="font-display text-xl text-[#F2E9DE]">Croch_et Masterpiece</p>
          <p className="font-body text-xs text-[#C9A028] tracking-widest uppercase mt-0.5">Admin Panel</p>
        </div>

        <div className="bg-[rgba(42,22,10,0.8)] border border-[rgba(201,160,40,0.15)] rounded-2xl p-7 backdrop-blur-sm">
          <h1 className="font-display text-xl text-[#F2E9DE] mb-0.5">Admin Sign In</h1>
          <p className="font-body text-xs text-[#7A5A48] mb-6">Restricted access — admin credentials only</p>

          {error && (
            <div className="bg-red-900/20 border border-red-800/30 text-red-400 text-xs px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-body text-xs text-[#C8B89A]/60 mb-1.5">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@croch_et.com" autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl bg-[rgba(28,18,8,0.8)] border border-[rgba(201,160,40,0.15)] text-sm text-[#F2E9DE] placeholder-[#4A3020] outline-none focus:border-[#C9A028] transition-colors" />
            </div>

            <div>
              <label className="block font-body text-xs text-[#C8B89A]/60 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your admin password" autoComplete="current-password"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[rgba(28,18,8,0.8)] border border-[rgba(201,160,40,0.15)] text-sm text-[#F2E9DE] placeholder-[#4A3020] outline-none focus:border-[#C9A028] transition-colors" />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A5A48] hover:text-[#C8B89A] transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/admin/forgot-password" className="font-body text-xs text-[#7A5A48] hover:text-[#C9A028] transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-body font-semibold text-sm text-[#1C1208] transition-all duration-300 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #C9A028, #E2B84A)",
                boxShadow: "0 4px 16px rgba(201,160,40,0.3)",
                transform: "scale(1)",
                transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.02) translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(201,160,40,0.45)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1) translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(201,160,40,0.3)";
              }}
              onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={e => (e.currentTarget.style.transform = "scale(1.02)")}
            >
              {loading ? <span className="w-4 h-4 border-2 border-[#1C1208]/30 border-t-[#1C1208] rounded-full animate-spin" /> : <><ShieldCheck size={15} /> Sign In to Admin</>}
            </button>
          </form>
        </div>

        <p className="text-center font-body text-[11px] text-[#4A3020] mt-6">
          User? <Link href="/auth/login" className="text-[#7A5A48] hover:text-[#C9A028] transition-colors">Visit the shop →</Link>
        </p>
      </div>
    </div>
  );
}
