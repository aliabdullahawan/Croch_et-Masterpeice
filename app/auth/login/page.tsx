"use client";
/**
 * app/auth/login/page.tsx — User Login
 * Features: Remember Me, Forgot Password, Google login, Signup link
 */

import { useState, useEffect, useRef } from "react";
import Link                             from "next/link";
import { useRouter }                    from "next/navigation";
import { Eye, EyeOff, LogIn }           from "lucide-react";
import { useAuth }                      from "@/context/AuthContext";
import { motion }                       from "framer-motion";

function useTypewriter(texts: string[], speed = 80, pause = 2000) {
  const [display,  setDisplay]  = useState("");
  const [idx,      setIdx]      = useState(0);
  const [charIdx,  setCharIdx]  = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const current = texts[idx % texts.length];
    timerRef.current = setTimeout(() => {
      if (!deleting) {
        if (charIdx < current.length) {
          setDisplay(current.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        } else {
          setTimeout(() => setDeleting(true), pause);
        }
      } else {
        if (charIdx > 0) {
          setDisplay(current.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        } else {
          setDeleting(false);
          setIdx(i => (i + 1) % texts.length);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timerRef.current);
  }, [charIdx, deleting, idx, texts, speed, pause]);

  return display;
}

const TAGLINES = [
  "Find your perfect piece ✦",
  "Handcrafted with love 🌿",
  "Custom orders welcome ✨",
  "Where yarn meets art 🧶",
];

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();

  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [error,      setError]      = useState("");

  const tagline = useTypewriter(TAGLINES);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password, rememberMe);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoad(true);
    try {
      await signInWithGoogle();
      router.push("/");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoad(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 bg-brand-deep relative overflow-hidden px-16">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-brand-rose/10 rounded-full blur-3xl" />
        <motion.div 
          className="relative z-10 text-center max-w-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="w-16 h-16 rounded-full border border-brand-gold/30 flex items-center justify-center mx-auto mb-8">
            <span className="text-2xl">🧶</span>
          </div>
          <p className="font-display text-4xl text-brand-cream mb-4 leading-tight">Welcome Back</p>
          <p className="font-body text-sm text-brand-gold min-h-[24px]">
            {tagline}<span className="animate-pulse">|</span>
          </p>
        </motion.div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-16 bg-brand-base">
        <motion.div 
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >

          <motion.div variants={itemVariants}>
            <Link href="/" className="block text-center mb-10">
              <p className="font-display text-2xl text-brand-cream">
                Croch_et <span className="text-brand-gold">Masterpiece</span>
              </p>
            </Link>
          </motion.div>

          <motion.h1 variants={itemVariants} className="font-display text-3xl text-brand-cream mb-1">Sign In</motion.h1>
          <motion.p variants={itemVariants} className="font-body text-sm text-brand-creamDim/60 mb-8">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-brand-gold hover:underline">Create one</Link>
          </motion.p>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-sm font-body px-4 py-3 rounded-xl mb-6">
              {error}
            </motion.div>
          )}

          {/* Google Login */}
          <motion.button
            variants={itemVariants}
            type="button"
            onClick={handleGoogle}
            disabled={googleLoad}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-brand-cream/15 bg-white/5 hover:bg-white/10 hover:border-brand-cream/30 text-brand-cream font-body text-sm transition-colors mb-4 disabled:opacity-60"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
          >
            {googleLoad ? (
              <span className="w-4 h-4 border-2 border-brand-cream/30 border-t-brand-cream rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.25-.164-1.84H9v3.48h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </motion.button>

          {/* Divider */}
          <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-brand-cream/10" />
            <span className="font-body text-xs text-brand-creamDim/40">or sign in with email</span>
            <div className="flex-1 h-px bg-brand-cream/10" />
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants}>
              <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="input-dark" autoComplete="email" />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password" className="input-dark pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-creamDim/40 hover:text-brand-cream transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </motion.div>

            {/* Remember Me + Forgot Password */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    className="sr-only" />
                  <div className={`w-4 h-4 rounded border transition-all ${rememberMe ? "bg-brand-gold border-brand-gold" : "border-brand-cream/20 bg-transparent"} flex items-center justify-center`}>
                    {rememberMe && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>}
                  </div>
                </div>
                <span className="font-body text-xs text-brand-creamDim/50">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="font-body text-xs text-brand-creamDim/40 hover:text-brand-gold transition-colors">
                Forgot password?
              </Link>
            </motion.div>

            <motion.button 
              variants={itemVariants}
              type="submit" 
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              {loading ? <span className="w-4 h-4 border-2 border-brand-base/40 border-t-brand-base rounded-full animate-spin" /> : <><LogIn size={16} /> Sign In</>}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="font-body text-[11px] text-brand-creamDim/30 text-center mt-8">
            By signing in you agree to our terms. Your data is handled securely.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
