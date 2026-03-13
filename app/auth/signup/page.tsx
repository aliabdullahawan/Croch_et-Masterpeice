"use client";
/**
 * app/auth/signup/page.tsx  — Sign Up Page
 * ─────────────────────────────────────────────────────
 * SUPABASE AUTH:
 *   const { error } = await supabase.auth.signUp({
 *     email,
 *     password,
 *     options: { data: { full_name: name } },
 *   });
 *   // Supabase trigger auto-creates a profile row (see lib/supabase.ts)
 */

import { useState }    from "react";
import Link             from "next/link";
import { useRouter }   from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      /* ── REPLACE with Supabase auth ─────────────────
         const { error } = await supabase.auth.signUp({
           email,
           password,
           options: { data: { full_name: name } },
         });
         if (error) throw error;
         setSuccess(true);
      ─────────────────────────────────────────────── */

      // Mock signup (remove when Supabase is connected)
      await new Promise(r => setTimeout(r, 800));
      localStorage.setItem("cm_user", JSON.stringify({ id: "mock-id", email, name }));
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="font-display text-3xl text-brand-cream mb-3">Account Created!</h2>
          <p className="font-body text-sm text-brand-creamDim/60 mb-8">
            Welcome to Croch_et Masterpiece, {name}! You're all set to start shopping.
          </p>
          <button onClick={() => router.push("/")} className="btn-gold w-full py-3">
            Start Exploring
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 bg-brand-deep relative overflow-hidden px-16">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="font-display text-6xl mb-6">🌿</div>
          <p className="font-display text-3xl text-brand-cream mb-3 leading-tight">
            Join the Masterpiece Community
          </p>
          <p className="font-body text-sm text-brand-creamDim/60 leading-relaxed">
            Save your favourites, track custom orders, and get first access to new collections.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-16 bg-brand-base">
        <div className="w-full max-w-md">

          <Link href="/" className="block text-center mb-10">
            <p className="font-display text-2xl text-brand-cream">
              Croch_et <span className="text-brand-gold">Masterpiece</span>
            </p>
          </Link>

          <h1 className="font-display text-3xl text-brand-cream mb-1">Create Account</h1>
          <p className="font-body text-sm text-brand-creamDim/50 mb-8">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-gold hover:underline">Sign in</Link>
          </p>

          {error && (
            <div className="bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-sm font-body px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name" className="input-dark" />
            </div>
            <div>
              <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="input-dark" autoComplete="email" />
            </div>
            <div>
              <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters" className="input-dark pr-10"
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-creamDim/40 hover:text-brand-creamDim">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Confirm Password</label>
              <input type={showPw ? "text" : "password"} required value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password" className="input-dark" autoComplete="new-password" />
            </div>

            <button type="submit" disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-70">
              {loading
                ? <span className="w-4 h-4 border-2 border-brand-base/40 border-t-brand-base rounded-full animate-spin" />
                : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
