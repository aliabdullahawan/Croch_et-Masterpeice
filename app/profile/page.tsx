/* ════════════════════════════════════════════════════════════════
   app/profile/page.tsx  —  User Profile Page
   Shows the signed-in user's profile, notifications, and recent orders.
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useRef, useEffect } from "react";
import Link                            from "next/link";
import { useNotifications }            from "@/context/NotificationContext";
import { useAuth }                     from "@/context/AuthContext";
import { useTheme }                    from "@/context/ThemeContext";
import { supabase }                    from "@/lib/supabase";
import { uploadAvatarToStorage }       from "@/lib/avatar-storage";
import { fetchUserNotifications, fetchUserOrders, type AdminNotificationItem, type UserOrderSummary } from "@/lib/db-client";
import {
  User, Mail, MapPin, Camera, ShoppingBag,
  Heart, Bell, BellOff, LogIn, Package, Clock, Lock, Save, CheckCircle,
} from "lucide-react";

export default function UserProfilePage() {
  const db = supabase as any;
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const isLoggedIn = Boolean(user);
  const { addToast } = useNotifications();
  const fileRef = useRef<HTMLInputElement>(null);
  const [notifs, setNotifs] = useState<AdminNotificationItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<UserOrderSummary[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const unread = notifs.filter(n => !n.read).length;

  const isDark = theme === "dark";
  const sectionBg = isDark ? "rgba(28,18,8,0.8)" : "rgba(255,248,243,0.96)";
  const inputBg = isDark ? "rgba(42,22,10,0.8)" : "rgba(255,255,255,0.96)";
  const headingColor = isDark ? "#F2E9DE" : "#2C1A0E";
  const labelColor = isDark ? "#7A5A48" : "#6B4C3B";
  const textColor = isDark ? "#C8B89A" : "#3D2B1F";
  const borderColor = isDark ? "rgba(201,160,40,0.15)" : "rgba(61,43,31,0.15)";
  const INPUT = "w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#C9A028] transition";
  const LABEL = "block text-[10px] uppercase tracking-widest mb-1.5 font-semibold";

  useEffect(() => {
    setProfileForm({
      name: user?.name ?? "",
      email: user?.email ?? "",
    });
  }, [user?.name, user?.email]);

  useEffect(() => {
    setAvatarPreview(user?.avatar ?? null);
    setAvatarFile(null);
  }, [user?.avatar]);

  useEffect(() => {
    if (!user?.id) {
      setNotifs([]);
      setRecentOrders([]);
      return;
    }

    void (async () => {
      const [notificationRows, orderRows] = await Promise.all([
        fetchUserNotifications(user.id),
        fetchUserOrders(user.id),
      ]);
      setNotifs(notificationRows);
      setRecentOrders(orderRows.slice(0, 5));
    })();
  }, [user?.id]);

  function markRead() {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  }

  function formatPKR(value: number): string {
    return `Rs ${Math.round(value).toLocaleString("en-PK")}`;
  }

  async function saveProfile() {
    if (!user?.id) {
      addToast("Sign in again to update profile.", "warning");
      return;
    }

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      addToast("Name and email are required.", "warning");
      return;
    }

    setSavingProfile(true);
    try {
      let avatarUrl = user?.avatar ?? null;
      if (avatarFile) {
        const uploaded = await uploadAvatarToStorage(user.id, avatarFile);
        avatarUrl = uploaded.publicUrl;
      }

      const { error: authError } = await supabase.auth.updateUser({
        email: profileForm.email.trim(),
        data: {
          full_name: profileForm.name.trim(),
          avatar_url: avatarUrl,
        },
      });
      if (authError) throw authError;

      const { error: profileError } = await db
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: profileForm.name.trim(),
          avatar_url: avatarUrl,
        }, { onConflict: "id" });
      if (profileError) throw profileError;

      const saved = {
        ...user,
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        avatar: avatarUrl,
      };
      localStorage.setItem("cm_user", JSON.stringify(saved));
      setAvatarPreview(avatarUrl);
      setAvatarFile(null);

      addToast("Profile updated successfully.", "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile.";
      addToast(message, "error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function updatePassword() {
    if (!passwordForm.current) {
      addToast("Enter your current password.", "warning");
      return;
    }
    if (passwordForm.next.length < 8) {
      addToast("New password must be at least 8 characters.", "warning");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      addToast("Passwords do not match.", "error");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.next });
      if (error) throw error;

      setPasswordForm({ current: "", next: "", confirm: "" });
      addToast("Password updated successfully.", "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password.";
      addToast(message, "error");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen" />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-32">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-[rgba(201,160,40,0.1)] border-2 border-[rgba(201,160,40,0.2)] flex items-center justify-center mx-auto mb-5">
            <User size={32} className="text-brand-gold" />
          </div>
          <h1 className="font-display text-3xl text-brand-cream mb-3">Your Profile</h1>
          <p className="font-body text-sm text-brand-creamDim/60 mb-7">
            Sign in to view your orders, wishlist, and account details.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/auth/login" className="btn-gold flex items-center justify-center gap-2">
              <LogIn size={16} /> Sign In
            </Link>
            <Link href="/auth/signup" className="btn-outline text-sm">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Logged-in view ────────────────────────────────────────── */
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Profile Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-brand-gold/10 border-2 border-brand-gold/20 flex items-center justify-center">
                {avatarPreview
                  ? (
                    // Avatar source may be a Supabase public URL.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  )
                  : <User size={28} className="text-brand-gold" />
                }
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-gold flex items-center justify-center hover:bg-brand-goldLight transition shadow">
                <Camera size={13} className="text-brand-base" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (!file) return;
                  if (!file.type.startsWith("image/")) {
                    addToast("Please select an image file.", "warning");
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    addToast("Avatar image must be under 5 MB.", "warning");
                    return;
                  }

                  setAvatarFile(file);
                  const reader = new FileReader();
                  reader.onload = () => setAvatarPreview(typeof reader.result === "string" ? reader.result : null);
                  reader.readAsDataURL(file);
                  addToast("Avatar selected. Click Save Profile to upload.", "info");
                }}
              />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-xl text-brand-cream">{profileForm.name || user?.name || "Guest"}</h1>
              <p className="font-body text-sm text-brand-creamDim/60">{profileForm.email || user?.email}</p>
              <span className="inline-flex items-center gap-1 text-[10px] bg-brand-gold/10 text-brand-gold px-2.5 py-1 rounded-full mt-2 border border-brand-gold/20">
                <Package size={10} /> Croch_et Customer
              </span>
            </div>

            {/* Notification bell */}
            <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markRead(); }}
              className="relative p-2 rounded-xl border border-brand-cream/10 text-brand-creamDim hover:border-brand-gold/30 hover:text-brand-gold transition">
              {unread > 0 ? <Bell size={18} /> : <BellOff size={18} />}
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold rounded-full text-[9px] font-bold text-brand-base flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
          </div>

          {/* Notifications panel */}
          {showNotifs && (
            <div className="mt-4 border-t border-brand-cream/8 pt-4">
              <h3 className="text-xs font-semibold text-brand-gold uppercase tracking-wide mb-3">Notifications</h3>
              {notifs.length === 0 ? (
                <p className="text-xs text-brand-creamDim/40">No notifications yet</p>
              ) : (
                <div className="space-y-2">
                  {notifs.slice(0, 8).map(n => (
                    <div key={n.id} className={`flex items-start gap-2 text-xs ${n.read ? "opacity-50" : ""}`}>
                      <Bell size={11} className="text-brand-gold flex-shrink-0 mt-0.5" />
                      <p className="text-brand-creamDim">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <ShoppingBag size={20} />, label: "My Orders",     href: "#",          desc: "Track your orders"      },
            { icon: <Heart       size={20} />, label: "My Wishlist",   href: "/wishlist",  desc: "Saved for later"        },
            { icon: <MapPin      size={20} />, label: "Saved Address", href: "#",          desc: "Delivery addresses"     },
          ].map(item => (
            <Link key={item.label} href={item.href}
              className="glass-card p-4 hover:border-brand-gold/30 transition-all group">
              <div className="w-9 h-9 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-3 group-hover:bg-brand-gold/20 transition">
                {item.icon}
              </div>
              <div className="font-semibold text-sm text-brand-cream">{item.label}</div>
              <div className="text-[10px] text-brand-creamDim/50 mt-0.5">{item.desc}</div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-5">
          <h2 className="font-display text-base text-brand-cream mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-brand-creamDim/40">
              <Clock size={24} className="mx-auto mb-2" />
              <p className="text-sm">No orders yet</p>
              <p className="text-xs mt-1">When you place orders, they will appear here</p>
              <Link href="/products" className="inline-block mt-4 text-xs text-brand-gold hover:underline">
                Browse our handcrafted collection →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-brand-cream/10 p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-brand-cream font-semibold">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-brand-creamDim/60">{new Date(order.created_at).toLocaleDateString("en-PK")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-brand-creamDim/70">{order.status.replace("_", " ")}</p>
                    <p className="text-sm text-brand-gold font-semibold">{formatPKR(order.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Identity Settings */}
        <div className="rounded-2xl p-6" style={{ background: sectionBg, border: `1px solid ${borderColor}` }}>
          <h2
            className="font-display text-base mb-5 pb-2"
            style={{ color: headingColor, borderBottom: `1px solid ${isDark ? "rgba(201,160,40,0.1)" : "rgba(61,43,31,0.1)"}` }}
          >
            Identity
          </h2>

          <div className="space-y-4">
            <div>
              <label className={LABEL} style={{ color: labelColor }}>Display Name</label>
              <input
                type="text"
                className={INPUT}
                style={{ background: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className={LABEL} style={{ color: labelColor }}>Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: labelColor }} />
                <input
                  type="email"
                  className={INPUT + " pl-9"}
                  style={{ background: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A028] text-[#1C1208] text-sm font-semibold hover:bg-[#E2B84A] disabled:opacity-60 transition"
          >
            <Save size={15} />
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* Password Settings */}
        <div className="rounded-2xl p-6" style={{ background: sectionBg, border: `1px solid ${borderColor}` }}>
          <h2
            className="font-display text-base mb-5 pb-2"
            style={{ color: headingColor, borderBottom: `1px solid ${isDark ? "rgba(201,160,40,0.1)" : "rgba(61,43,31,0.1)"}` }}
          >
            Change Password
          </h2>

          <div className="space-y-4">
            {[
              { label: "Current Password", key: "current" },
              { label: "New Password", key: "next" },
              { label: "Confirm Password", key: "confirm" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className={LABEL} style={{ color: labelColor }}>{label}</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: labelColor }} />
                  <input
                    type="password"
                    className={INPUT + " pl-9"}
                    style={{ background: inputBg, border: `1px solid ${borderColor}`, color: textColor }}
                    value={passwordForm[key as keyof typeof passwordForm]}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={updatePassword}
            disabled={savingPassword}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(201,160,40,0.3)] text-[#C9A028] text-sm font-semibold hover:bg-[rgba(201,160,40,0.1)] disabled:opacity-60 transition"
          >
            <CheckCircle size={15} />
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
          <p className="mt-3 text-[10px]" style={{ color: isDark ? "#4A3020" : "#8D6A54" }}>
            Password updates are applied through Supabase Auth.
          </p>
        </div>

      </div>
    </div>
  );
}
