/* ════════════════════════════════════════════════════════════════
   app/admin/page.tsx  —  Admin Dashboard Hero
   Redesigned dashboard with:
   • Crochet-relevant copy (no globe boilerplate text)
   • Globe showing global customer map
   • 4 animated metric cards (stagger entrance)
   • Recent Orders table (no quick-action buttons)
   • WhatsApp custom orders snapshot card
   TODO: Replace mock data with Supabase queries
════════════════════════════════════════════════════════════════ */
"use client";

import { useMemo, useEffect, useState }  from "react";
import { motion }                         from "framer-motion";
import InteractiveGlobe                   from "@/components/ui/interactive-globe";
import PageTransition, { StaggerItem }    from "@/components/ui/PageTransition";
import {
  getMockOrders, getMockDashboardMetrics,
  getOrderStatusColor, formatPKR,
}                                         from "@/lib/admin-mock-data";
import type { Order }                     from "@/lib/admin-types";
import { useTheme }           from "@/context/ThemeContext";
import {
  ShoppingBag, TrendingUp, Users, Clock,
  Package, MessageCircle, ArrowRight,
  CheckCircle2, Truck, Loader2,
} from "lucide-react";
import { getCustomOrders, getCartOrders, type CustomOrder } from "@/lib/order-store";

/* ── Metric icon map ─────────────────────────────────────────── */
const METRIC_ICONS: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBag size={22} />,
  TrendingUp:  <TrendingUp  size={22} />,
  Users:       <Users       size={22} />,
  Clock:       <Clock       size={22} />,
};

const METRIC_GRADIENT: Record<string, string> = {
  gold:  "from-[#C9A028] to-[#E8C040]",
  teal:  "from-[#4AABAB] to-[#6BCFCF]",
  rose:  "from-[#E8A0A8] to-[#F0BCC2]",
  green: "from-[#7AB87A] to-[#98D098]",
};

/* ── Order status label ──────────────────────────────────────── */
function StatusBadge({ status }: { status: Order["status"] }) {
  const colorMap: Record<Order["status"], string> = {
    pending:     "bg-amber-900/30 text-amber-300 border-amber-800/30",
    confirmed:   "bg-blue-900/30 text-blue-300 border-blue-800/30",
    in_progress: "bg-purple-900/30 text-purple-300 border-purple-800/30",
    shipped:     "bg-teal-900/30 text-teal-300 border-teal-800/30",
    delivered:   "bg-green-900/30 text-green-300 border-green-800/30",
    cancelled:   "bg-red-900/30 text-red-400 border-red-800/30",
  };
  const label = status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${colorMap[status]}`}>
      {label}
    </span>
  );
}

export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const metrics     = useMemo(() => getMockDashboardMetrics(), []);
  const allOrders   = useMemo(() => getMockOrders(), []);
  const recentOrders= useMemo(
    () => [...allOrders].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6),
    [allOrders]
  );
  const pendingCount = allOrders.filter(o => o.status === "pending").length;

  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [cartOrderCount, setCartOrderCount] = useState(0);
  useEffect(() => {
    setCustomOrders(getCustomOrders().slice(0, 3));
    setCartOrderCount(getCartOrders().length);
  }, []);

  return (
    <PageTransition className="p-4 md:p-6 space-y-6 pb-16">

      {/* ── Hero Section ──────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden border border-[rgba(201,160,40,0.2)] min-h-[340px] flex flex-col lg:flex-row">
        {/* Background */}
        <div className="absolute inset-0" style={{ 
          background: isDark 
            ? "radial-gradient(ellipse at 20% 50%, rgba(201,160,40,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(74,171,171,0.08) 0%, transparent 60%), linear-gradient(135deg, var(--bg-deep) 0%, var(--bg-base) 100%)"
            : "radial-gradient(ellipse at 20% 50%, rgba(201,160,40,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(74,171,171,0.06) 0%, transparent 60%), linear-gradient(135deg, var(--bg-base) 0%, var(--bg-deep) 100%)"
        }} />

        {/* Left: Copy */}
        <div className="relative z-10 flex flex-col justify-center px-8 py-10 lg:w-1/2">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#C9A028] bg-[rgba(201,160,40,0.1)] px-3 py-1.5 rounded-full border border-[rgba(201,160,40,0.2)] mb-4">
              <Package size={11} /> Croch_et Masterpiece Studio
            </span>
            <h1 className="font-display text-3xl lg:text-4xl text-brand-cream leading-tight mb-3">
              Your Crochet Business,<br />
              <span className="text-brand-gold">All in One Place</span>
            </h1>
            <p className="font-body text-sm text-brand-creamDim/70 leading-relaxed max-w-sm mb-5">
              Manage your handcrafted products, track customer orders from Karachi to Lahore,
              and grow your crochet masterpiece — one stitch at a time.
            </p>
          </motion.div>

          {/* Quick stats row */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-amber-400" />
              <span className="text-[#C8B89A]"><strong className="text-amber-400">{pendingCount}</strong> orders need attention</span>
            </div>
            {cartOrderCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <ShoppingBag size={14} className="text-teal-400" />
                <span className="text-[#C8B89A]"><strong className="text-teal-400">{cartOrderCount}</strong> cart orders received</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Globe */}
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.5 }}
          className="relative z-10 lg:w-1/2 flex items-center justify-center min-h-[220px]">
          <InteractiveGlobe className="w-full h-[280px]" />
        </motion.div>
      </div>

      {/* ── Metric Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <StaggerItem key={m.label} index={i}>
            <div className="relative overflow-hidden rounded-2xl border border-brand-gold/15 bg-brand-base/40 backdrop-blur-sm p-5 group hover:border-brand-gold/40 transition-all duration-300 shadow-sm">
              {/* Gradient accent blob */}
              <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-15 blur-xl bg-gradient-to-br ${METRIC_GRADIENT[m.color]}`} />
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${METRIC_GRADIENT[m.color]} text-brand-deep`}>
                {METRIC_ICONS[m.icon]}
              </div>
              <div className="font-display text-2xl lg:text-3xl font-bold text-brand-cream mb-0.5">{m.value}</div>
              <div className="text-xs font-semibold text-brand-creamDim">{m.label}</div>
              <div className="text-[10px] text-brand-creamDim/50 mt-0.5">{m.subtext}</div>
            </div>
          </StaggerItem>
        ))}
      </div>

      {/* ── Two-column: Recent Orders + WhatsApp Custom Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Orders table (2/3) */}
        <StaggerItem index={4} className="lg:col-span-2">
          <div className="bg-brand-base/40 backdrop-blur-sm border border-brand-gold/15 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gold/10">
              <h3 className="font-display text-base font-semibold text-brand-cream">Recent Orders</h3>
              <a href="/admin/orders" className="flex items-center gap-1 text-xs text-brand-gold hover:underline">
                View all <ArrowRight size={11} />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-gold/5">
                    {["Customer", "Amount", "Status", "Date"].map(h => (
                      <th key={h} className="text-left text-[10px] uppercase tracking-widest text-brand-creamDim/40 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={order.id} className={`border-b border-brand-gold/5 hover:bg-brand-gold/5 transition-colors ${i === recentOrders.length - 1 ? "border-0" : ""}`}>
                      <td className="px-5 py-3">
                        <div className="font-medium text-brand-cream text-xs">{order.customer_name}</div>
                        <div className="text-[10px] text-brand-creamDim/40 font-mono">{order.id}</div>
                      </td>
                      <td className="px-5 py-3 text-brand-gold font-semibold text-xs">{formatPKR(order.total_amount)}</td>
                      <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-5 py-3 text-[10px] text-brand-creamDim/50">
                        {new Date(order.created_at).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </StaggerItem>

        {/* WhatsApp Custom Orders (1/3) */}
        <StaggerItem index={5}>
          <div className="bg-brand-base/40 backdrop-blur-sm border border-brand-gold/15 rounded-2xl overflow-hidden h-full shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gold/10">
              <div className="flex items-center gap-2">
                <MessageCircle size={15} className="text-teal-400" />
                <h3 className="font-display text-base font-semibold text-brand-cream">Custom Orders</h3>
              </div>
              <a href="/admin/orders/custom" className="text-xs text-brand-gold hover:underline flex items-center gap-1">View all <ArrowRight size={11} /></a>
            </div>
            {customOrders.length === 0 ? (
              <div className="p-5 text-center">
                <MessageCircle size={24} className="text-brand-creamDim/20 mx-auto mb-2" />
                <p className="text-xs text-brand-creamDim/40">No WhatsApp custom orders yet</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-gold/5">
                {customOrders.map(order => (
                  <div key={order.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-brand-cream">{order.name}</p>
                    <p className="text-[10px] text-brand-creamDim/50">{order.category} · {order.phone}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${order.status === "new" ? "bg-amber-900/10 text-amber-500 border border-amber-500/20" : "bg-blue-900/10 text-blue-500 border border-blue-500/20"}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            ) }
          </div>
        </StaggerItem>

      </div>
    </PageTransition>
  );
}
