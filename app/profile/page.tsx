/* ════════════════════════════════════════════════════════════════
   app/profile/page.tsx  —  User Profile Page
   Shows the signed-in user's profile, notifications, and recent orders.
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useRef, useEffect } from "react";
import Link                            from "next/link";
import { useNotifications }            from "@/context/NotificationContext";
import { useAuth }                     from "@/context/AuthContext";
import { fetchUserNotifications, fetchUserOrders, type AdminNotificationItem, type UserOrderSummary } from "@/lib/db-client";
import {
  User, Mail, Phone, MapPin, Camera, ShoppingBag,
  Heart, Bell, BellOff, LogIn, Package, Clock,
} from "lucide-react";

export default function UserProfilePage() {
  const { user, loading } = useAuth();
  const isLoggedIn = Boolean(user);
  const { addToast } = useNotifications();
  const fileRef = useRef<HTMLInputElement>(null);
  const [notifs, setNotifs] = useState<AdminNotificationItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<UserOrderSummary[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifs.filter(n => !n.read).length;

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
                {user?.avatar
                  ? (
                    // Avatar source can be data URL or arbitrary remote URL from auth metadata.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  )
                  : <User size={28} className="text-brand-gold" />
                }
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-gold flex items-center justify-center hover:bg-brand-goldLight transition shadow">
                <Camera size={13} className="text-brand-base" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={() => addToast("Profile picture saved! (Requires Supabase for persistence)", "info")} />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-xl text-brand-cream">{user?.name ?? "Guest"}</h1>
              <p className="font-body text-sm text-brand-creamDim/60">{user?.email}</p>
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

      </div>
    </div>
  );
}
