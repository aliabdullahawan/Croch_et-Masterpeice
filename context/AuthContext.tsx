"use client";
/**
 * context/AuthContext.tsx
 * ─────────────────────────────────────────────────────
 * Auth state for user + admin sessions.
 * Uses localStorage (rememberMe) or sessionStorage (no rememberMe).
 *
 * TO ACTIVATE REAL AUTH (Supabase):
 *   import { supabase } from "@/lib/supabase";
 *   Replace mock blocks with:
 *     supabase.auth.signInWithPassword({ email, password })
 *     supabase.auth.signInWithOAuth({ provider: "google" })
 *     supabase.auth.signUp({ email, password })
 *     supabase.auth.signOut()
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const db = supabase as any;
const ADMIN_EMAIL_ALLOWLIST = ["aliabdullahawan.2003@gmail.com"];

export interface AuthUser {
  id:        string;
  email?:    string;
  name?:     string;
  avatar?:   string;
  provider?: "email" | "google";
}

interface AuthContextType {
  user:              AuthUser | null;
  adminUser:         AuthUser | null;
  loading:           boolean;
  signIn:            (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp:            (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle:  () => Promise<void>;
  signOut:           () => Promise<void>;
  adminSignIn:       (email: string, password: string) => Promise<void>;
  adminSignOut:      () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user:             null,
  adminUser:        null,
  loading:          true,
  signIn:           async () => {},
  signUp:           async () => {},
  signInWithGoogle: async () => {},
  signOut:          async () => {},
  adminSignIn:      async () => {},
  adminSignOut:     async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [loading,   setLoading]   = useState(true);

  const mapSupabaseUser = (authUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): AuthUser => {
    const fullName = typeof authUser.user_metadata?.full_name === "string"
      ? authUser.user_metadata.full_name
      : undefined;
    const avatar = typeof authUser.user_metadata?.avatar_url === "string"
      ? authUser.user_metadata.avatar_url
      : (typeof authUser.user_metadata?.picture === "string" ? authUser.user_metadata.picture : undefined);
    return {
      id: authUser.id,
      email: authUser.email ?? undefined,
      name: fullName,
      avatar,
      provider: "email",
    };
  };

  const ensureProfile = async (uid: string, fullName?: string) => {
    await db
      .from("profiles")
      .upsert({
        id: uid,
        full_name: fullName ?? null,
      }, { onConflict: "id" });
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const getProfileRole = async (uid: string): Promise<{ role: string | null; full_name: string | null } | null> => {
    // Retry because auth session propagation can lag immediately after password sign-in.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, full_name")
        .eq("id", uid)
        .maybeSingle();

      if (!error) {
        const row = data as { role?: string | null; full_name?: string | null } | null;
        return {
          role: row?.role ?? null,
          full_name: row?.full_name ?? null,
        };
      }

      await sleep(250);
    }

    return null;
  };

  const hasAdminRole = async (uid: string, email?: string | null): Promise<boolean> => {
    const { data: adminFlag, error: adminError } = await db.rpc("is_admin", { uid });
    if (!adminError && adminFlag === true) {
      return true;
    }

    // Fallback for projects where RPC execute privileges were not applied
    // or where RPC returned stale/false due policy/session timing.
    const profile = await getProfileRole(uid);
    if (!profile) {
      return Boolean(email && ADMIN_EMAIL_ALLOWLIST.includes(email.toLowerCase().trim()));
    }

    return profile.role === "admin" || Boolean(email && ADMIN_EMAIL_ALLOWLIST.includes(email.toLowerCase().trim()));
  };

  const loadAdminRole = async (uid: string, email?: string | null) => {
    await ensureProfile(uid);

    const isAdmin = await hasAdminRole(uid, email);
    if (!isAdmin) {
      setAdminUser(null);
      localStorage.removeItem("cm_admin");
      return;
    }

    const profile = await getProfileRole(uid);

    const admin: AuthUser = {
      id: uid,
      name: profile?.full_name ?? "Admin",
      provider: "email",
    };
    setAdminUser(admin);
    localStorage.setItem("cm_admin", JSON.stringify(admin));
  };

  /* ── Restore sessions on mount ─────────────────────────── */
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (!mounted) {
        return;
      }

      if (sessionUser) {
        const mapped = mapSupabaseUser(sessionUser);
        setUser(mapped);
        localStorage.setItem("cm_user", JSON.stringify(mapped));
        await loadAdminRole(sessionUser.id, sessionUser.email ?? null);
      } else {
        setUser(null);
        setAdminUser(null);
        localStorage.removeItem("cm_user");
        sessionStorage.removeItem("cm_user");
        localStorage.removeItem("cm_admin");
      }

      if (mounted) {
        setLoading(false);
      }
    };

    void bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user;
      if (!authUser) {
        setUser(null);
        setAdminUser(null);
        localStorage.removeItem("cm_user");
        sessionStorage.removeItem("cm_user");
        localStorage.removeItem("cm_admin");
        return;
      }

      const mapped = mapSupabaseUser(authUser);
      setUser(mapped);
      localStorage.setItem("cm_user", JSON.stringify(mapped));
      void loadAdminRole(authUser.id, authUser.email ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  /* ── User Sign In ──────────────────────────────────────── */
  const signIn = async (email: string, password: string, _rememberMe = false) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Login failed. Please try again.");

    await ensureProfile(data.user.id, typeof data.user.user_metadata?.full_name === "string" ? data.user.user_metadata.full_name : undefined);

    const mapped = mapSupabaseUser(data.user);
    setUser(mapped);
    localStorage.setItem("cm_user", JSON.stringify(mapped));
    await loadAdminRole(data.user.id, data.user.email ?? null);
  };

  /* ── User Sign Up ──────────────────────────────────────── */
  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name ?? "" },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("Sign up failed. Please try again.");

    await ensureProfile(data.user.id, name);

    if (data.session?.user) {
      const mapped = mapSupabaseUser(data.session.user);
      setUser(mapped);
      localStorage.setItem("cm_user", JSON.stringify(mapped));
      await loadAdminRole(data.session.user.id, data.session.user.email ?? null);
    }
  };

  /* ── Google Sign In (mock) ─────────────────────────────── */
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/login` },
    });
    if (error) throw error;
  };

  /* ── User Sign Out ─────────────────────────────────────── */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem("cm_user");
    sessionStorage.removeItem("cm_user");
    localStorage.removeItem("cm_admin");
    setUser(null);
    setAdminUser(null);
  };

  /* ── Admin Sign In ─────────────────────────────────────── */
  const adminSignIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Login failed. Please try again.");

    if (data.session) {
      await supabase.auth.setSession(data.session);
    }

    await ensureProfile(data.user.id, typeof data.user.user_metadata?.full_name === "string" ? data.user.user_metadata.full_name : undefined);

    const isAdmin = await hasAdminRole(data.user.id, data.user.email ?? null);
    if (!isAdmin) {
      await supabase.auth.signOut();
      throw new Error("Access denied. This account is not marked as admin in profiles.");
    }

    const profile = await getProfileRole(data.user.id);

    const mapped = mapSupabaseUser(data.user);
    setUser(mapped);
    localStorage.setItem("cm_user", JSON.stringify(mapped));

    const admin: AuthUser = {
      id: data.user.id,
      email: data.user.email ?? undefined,
      name: profile?.full_name ?? "Admin",
      provider: "email",
    };
    setAdminUser(admin);
    localStorage.setItem("cm_admin", JSON.stringify(admin));
  };

  /* ── Admin Sign Out ────────────────────────────────────── */
  const adminSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem("cm_admin");
    localStorage.removeItem("cm_user");
    sessionStorage.removeItem("cm_user");
    setAdminUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, adminUser, loading,
      signIn, signUp, signInWithGoogle,
      signOut, adminSignIn, adminSignOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
