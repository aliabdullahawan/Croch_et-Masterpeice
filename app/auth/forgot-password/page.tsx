"use client";
/**
 * app/auth/forgot-password/page.tsx — User Forgot Password
 */
import { useState } from "react";
import Link         from "next/link";
import { Mail }     from "lucide-react";
import { motion }   from "framer-motion";
import { MorphingTextReveal } from "@/components/ui/morphing-text-reveal";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      /* TODO: Supabase → supabase.auth.resetPasswordForEmail(email) */
      await new Promise(r => setTimeout(r, 900));
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
    <div className="min-h-screen flex items-center justify-center px-6 bg-brand-base">
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

        {sent ? (
          <motion.div 
            className="glass-card p-10 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-16 h-16 rounded-full bg-brand-gold/20 flex items-center justify-center mx-auto mb-5">
              <Mail size={28} className="text-brand-gold" />
            </div>
            <h2 className="font-display text-2xl text-brand-cream mb-3">Check your inbox</h2>
            <p className="font-body text-sm text-brand-creamDim/60 mb-8">
              We sent a password reset link to <strong className="text-brand-gold">{email}</strong>.
              Check your spam folder if you don't see it.
            </p>
            <Link href="/auth/login" className="btn-gold inline-block px-8 py-3 text-sm transition-transform hover:scale-105 active:scale-95">
              Back to Sign In
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="glass-card p-8">
            <div className="mb-1">
              <MorphingTextReveal
                texts={["Reset Password", "Secure Your Account", "Recover Access"]}
                className="font-display text-2xl text-brand-cream"
                interval={2400}
              />
            </div>
            <p className="font-body text-sm text-brand-creamDim/50 mb-7">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-brand-rose/10 border border-brand-rose/30 text-brand-rose text-sm px-4 py-3 rounded-xl mb-5">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-body text-xs text-brand-creamDim/60 mb-1.5">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input-dark" autoComplete="email" />
              </div>
              <motion.button 
                type="submit" 
                disabled={loading}
                className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-70"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Mail size={15} /> Send Reset Link</>}
              </motion.button>
            </form>

            <div className="text-center mt-5">
              <Link href="/auth/login" className="font-body text-xs text-brand-creamDim/40 hover:text-brand-gold transition-colors">
                ← Back to Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
