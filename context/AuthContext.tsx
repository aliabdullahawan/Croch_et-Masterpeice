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

export interface AuthUser {
  id:        string;
  email?:    string;
  name?:     string;
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
  const [loading,   setLoading]   = useState(false);

  /* ── Restore sessions on mount ─────────────────────────── */
  useEffect(() => {
    // User session: check localStorage first, then sessionStorage
    const storedUser =
      localStorage.getItem("cm_user") ||
      sessionStorage.getItem("cm_user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch {}
    }
    // Admin session
    const storedAdmin = localStorage.getItem("cm_admin");
    if (storedAdmin) {
      try { setAdminUser(JSON.parse(storedAdmin)); } catch {}
    }
    setLoading(false);
  }, []);

  /* ── User Sign In ──────────────────────────────────────── */
  const signIn = async (email: string, _password: string, rememberMe = false) => {
    /* TODO: Supabase → const { error } = await supabase.auth.signInWithPassword({ email, password }); */
    await new Promise(r => setTimeout(r, 700));
    const u: AuthUser = { id: "mock-user-" + Date.now(), email, provider: "email" };
    const store = rememberMe ? localStorage : sessionStorage;
    store.setItem("cm_user", JSON.stringify(u));
    setUser(u);
  };

  /* ── User Sign Up ──────────────────────────────────────── */
  const signUp = async (email: string, _password: string, name?: string) => {
    /* TODO: Supabase → supabase.auth.signUp({ email, password, options: { data: { full_name: name } } }) */
    await new Promise(r => setTimeout(r, 700));
    const u: AuthUser = { id: "mock-user-" + Date.now(), email, name, provider: "email" };
    localStorage.setItem("cm_user", JSON.stringify(u));
    setUser(u);
  };

  /* ── Google Sign In (mock) ─────────────────────────────── */
  const signInWithGoogle = async () => {
    /* TODO: Supabase → supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } }) */
    await new Promise(r => setTimeout(r, 800));
    const u: AuthUser = {
      id:       "google-user-" + Date.now(),
      email:    "user@gmail.com",
      name:     "Google User",
      provider: "google",
    };
    localStorage.setItem("cm_user", JSON.stringify(u));
    setUser(u);
  };

  /* ── User Sign Out ─────────────────────────────────────── */
  const signOut = async () => {
    /* TODO: Supabase → supabase.auth.signOut() */
    localStorage.removeItem("cm_user");
    sessionStorage.removeItem("cm_user");
    setUser(null);
  };

  /* ── Admin Sign In ─────────────────────────────────────── */
  const adminSignIn = async (email: string, _password: string) => {
    /* TODO: Supabase → verify role === 'admin' after sign in */
    await new Promise(r => setTimeout(r, 700));
    const a: AuthUser = { id: "admin-001", email, name: "Admin", provider: "email" };
    localStorage.setItem("cm_admin", JSON.stringify(a));
    setAdminUser(a);
  };

  /* ── Admin Sign Out ────────────────────────────────────── */
  const adminSignOut = async () => {
    /* TODO: Supabase → supabase.auth.signOut() */
    localStorage.removeItem("cm_admin");
    setAdminUser(null);
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
