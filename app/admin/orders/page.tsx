/* ════════════════════════════════════════════════════════════════
   app/admin/orders/page.tsx  —  Active Orders Management
   Added: inline Cancel button on each card row.
   Cancel → moves to "cancelled" list.
   Theme-aware via ThemeContext.
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useMemo }    from "react";
import Link                     from "next/link";
import { getMockOrders, getOrderStatusColor, formatPKR } from "@/lib/admin-mock-data";
import type { Order, OrderStatus } from "@/lib/admin-types";
import PageTransition, { StaggerItem } from "@/components/ui/PageTransition";
import { useNotifications } from "@/context/NotificationContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Search, X, ClipboardList, MessageCircle, XCircle,
  Phone, Package, CalendarDays,
} from "lucide-react";

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "confirmed", "in_progress", "shipped"];
const EDITABLE: OrderStatus[]        = ["pending", "confirmed", "in_progress", "shipped", "delivered"];

export default function OrdersPage() {
  const { addToast } = useNotifications();
  const { theme }    = useTheme();
  const isDark       = theme === "dark";

  const [allOrders,    setAllOrders]    = useState<Order[]>(() => getMockOrders());
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [selected,     setSelected]     = useState<Order | null>(null);

  /* Adaptive colours */
  const cardBg    = isDark ? "rgba(28,18,8,0.85)"    : "rgba(255,248,243,0.9)";
  const cardBorder = isDark ? "rgba(201,160,40,0.1)" : "rgba(61,43,31,0.10)";
  const textMain  = isDark ? "#F2E9DE"               : "#2C1A0E";
  const textMuted = isDark ? "#C8B89A"               : "#5C3D2C";
  const textFaint = isDark ? "#7A5A48"               : "#8A6A58";
  const inputBg   = isDark ? "rgba(42,22,10,0.8)"    : "rgba(255,255,255,0.9)";
  const inputBorder = isDark ? "rgba(201,160,40,0.15)" : "rgba(61,43,31,0.15)";
  const headText  = isDark ? "#F2E9DE"               : "#2C1A0E";

  const STATUS_COLORS: Record<OrderStatus, string> = {
    pending:     "bg-amber-100 text-amber-700 border-amber-300",
    confirmed:   "bg-blue-100 text-blue-700 border-blue-300",
    in_progress: "bg-purple-100 text-purple-700 border-purple-300",
    shipped:     "bg-teal-100 text-teal-700 border-teal-300",
    delivered:   "bg-green-100 text-green-700 border-green-300",
    cancelled:   "bg-red-100 text-red-600 border-red-300",
  };
  const STATUS_COLORS_DARK: Record<OrderStatus, string> = {
    pending:     "bg-amber-900/30 text-amber-300 border-amber-700/30",
    confirmed:   "bg-blue-900/30 text-blue-300 border-blue-700/30",
    in_progress: "bg-purple-900/30 text-purple-300 border-purple-700/30",
    shipped:     "bg-teal-900/30 text-teal-300 border-teal-700/30",
    delivered:   "bg-green-900/30 text-green-300 border-green-700/30",
    cancelled:   "bg-red-900/30 text-red-400 border-red-700/30",
  };
  const scMap = isDark ? STATUS_COLORS_DARK : STATUS_COLORS;

  const active = useMemo(() =>
    allOrders.filter(o =>
      ACTIVE_STATUSES.includes(o.status) &&
      (statusFilter === "all" || o.status === statusFilter) &&
      (search === "" ||
        o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase()))
    ),
    [allOrders, search, statusFilter]
  );

  function updateStatus(id: string, status: OrderStatus) {
    /* TODO: Supabase → supabase.from('orders').update({ status }).eq('id', id) */
    setAllOrders(prev => prev.map(o => o.id === id ? { ...o, status, updated_at: new Date().toISOString() } : o));
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s);
    addToast(`Order ${id} → ${status.replace("_", " ")}`, "success");
  }

  function cancelOrder(id: string) {
    /* TODO: Supabase → supabase.from('orders').update({ status: 'cancelled' }).eq('id', id) */
    setAllOrders(prev => prev.map(o => o.id === id ? { ...o, status: "cancelled" as OrderStatus } : o));
    setSelected(null);
    addToast("Order cancelled and moved to Cancelled Orders", "warning");
  }

  return (
    <PageTransition className="p-4 md:p-6 pb-16 space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl" style={{ color: headText }}>Active Orders</h1>
          <p className="text-xs mt-0.5" style={{ color: textFaint }}>
            {active.length} active · {allOrders.filter(o => o.status === "pending").length} pending attention
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders/custom"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition"
            style={{ background: isDark ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.08)", color: "#16a34a", borderColor: "rgba(34,197,94,0.2)" }}>
            <MessageCircle size={13} /> Custom Orders
          </Link>
          <Link href="/admin/orders/cancelled"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition"
            style={{ background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.06)", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}>
            <XCircle size={13} /> Cancelled
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: textFaint }} />
          <input type="text" placeholder="Search customer or order ID…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full rounded-xl text-sm outline-none transition-colors"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }}>
          <option value="all">All Active</option>
          {ACTIVE_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
        </select>
      </div>

      {/* Orders list */}
      {active.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList size={36} className="mx-auto mb-3" style={{ color: textFaint }} />
          <p className="font-display text-xl" style={{ color: textMuted }}>No active orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map((order, i) => (
            <StaggerItem key={order.id} index={i}>
              <div className="rounded-2xl p-4 transition-all cursor-pointer group"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(201,160,40,0.3)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = cardBorder)}
                onClick={() => setSelected(order)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono" style={{ color: textFaint }}>{order.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${scMap[order.status]}`}>
                        {order.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <p className="font-semibold text-sm" style={{ color: textMain }}>{order.customer_name}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs" style={{ color: textFaint }}>
                      {order.customer_phone && <span className="flex items-center gap-1"><Phone size={10}/>{order.customer_phone}</span>}
                      <span className="flex items-center gap-1"><Package size={10}/>{order.item_count} item{order.item_count !== 1 ? "s" : ""}</span>
                      <span className="flex items-center gap-1"><CalendarDays size={10}/>{new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}</span>
                    </div>
                    {order.notes && <p className="text-xs italic mt-1" style={{ color: textMuted, opacity: 0.6 }}>"{order.notes}"</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="font-bold text-[#C9A028]">{formatPKR(order.total_amount)}</p>
                    <div className="flex items-center gap-1.5">
                      {/* Quick status */}
                      <select value={order.status}
                        onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value as OrderStatus); }}
                        onClick={e => e.stopPropagation()}
                        className="text-[10px] px-2 py-1 rounded-lg outline-none cursor-pointer"
                        style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMuted }}>
                        {EDITABLE.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                      </select>
                      {/* Inline cancel button */}
                      <button
                        onClick={e => { e.stopPropagation(); cancelOrder(order.id); }}
                        className="text-[10px] px-2 py-1 rounded-lg border flex items-center gap-1 transition-all"
                        style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.18)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                        title="Cancel Order"
                      >
                        <XCircle size={11} /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{ background: isDark ? "#1C1208" : "#FDF8F3", border: `1px solid ${isDark ? "rgba(201,160,40,0.2)" : "rgba(61,43,31,0.12)"}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg" style={{ color: textMain }}>Order Detail</h3>
              <button onClick={() => setSelected(null)} style={{ color: textFaint }}><X size={18}/></button>
            </div>
            <div className="space-y-2.5 text-sm">
              {[
                { label: "Order ID",  val: selected.id },
                { label: "Customer",  val: selected.customer_name },
                { label: "Phone",     val: selected.customer_phone ?? "—" },
                { label: "Email",     val: selected.customer_email ?? "—" },
                { label: "Amount",    val: formatPKR(selected.total_amount) },
                { label: "Items",     val: String(selected.item_count) },
                { label: "Ordered",   val: new Date(selected.created_at).toLocaleString("en-PK") },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span style={{ color: textFaint }}>{row.label}</span>
                  <span style={{ color: textMuted }}>{row.val}</span>
                </div>
              ))}
              {selected.notes && <p className="text-xs italic p-3 rounded-xl" style={{ color: textMuted, background: "rgba(201,160,40,0.05)" }}>"{selected.notes}"</p>}
            </div>

            {/* Status update */}
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${cardBorder}` }}>
              <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: textFaint }}>Update Status</p>
              <div className="flex flex-wrap gap-2">
                {EDITABLE.map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition ${selected.status === s ? scMap[s] + " border-current" : ""}`}
                    style={selected.status !== s ? { borderColor: cardBorder, color: textFaint } : {}}
                    onMouseEnter={e => { if (selected.status !== s) e.currentTarget.style.borderColor = "rgba(201,160,40,0.3)"; }}
                    onMouseLeave={e => { if (selected.status !== s) e.currentTarget.style.borderColor = cardBorder; }}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Cancel */}
            <button onClick={() => cancelOrder(selected.id)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm transition"
              style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <XCircle size={15}/> Cancel Order
            </button>

            {/* WhatsApp */}
            {selected.customer_phone && (
              <a href={`https://wa.me/${selected.customer_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm transition hover:opacity-90"
                style={{ background: "#25d366" }}>
                <MessageCircle size={15}/> Contact on WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
