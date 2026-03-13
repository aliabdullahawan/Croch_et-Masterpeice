/* ════════════════════════════════════════════════════════════════
   app/admin/orders/custom/page.tsx
   WhatsApp Custom Orders — orders submitted via the custom-order
   form on the user site. Saved in localStorage (order-store.ts).
   TODO: Replace with Supabase custom_orders table when connected.
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useEffect }    from "react";
import Link                       from "next/link";
import { MessageCircle, ChevronLeft, Clock, Phone, Mail, Tag, DollarSign, CheckCircle, XCircle, Eye, RefreshCw } from "lucide-react";
import PageTransition, { StaggerItem } from "@/components/ui/PageTransition";
import { getCustomOrders, updateCustomOrderStatus, type CustomOrder } from "@/lib/order-store";

const STATUS_COLORS: Record<CustomOrder["status"], string> = {
  new:       "bg-amber-900/30 text-amber-400 border-amber-800/30",
  reviewing: "bg-blue-900/30 text-blue-400 border-blue-800/30",
  accepted:  "bg-green-900/30 text-green-400 border-green-800/30",
  rejected:  "bg-red-900/30 text-red-400 border-red-800/30",
};

export default function CustomOrdersPage() {
  const [orders,  setOrders]  = useState<CustomOrder[]>([]);
  const [detail,  setDetail]  = useState<CustomOrder | null>(null);

  function load() { setOrders(getCustomOrders()); }

  useEffect(() => { load(); }, []);

  function updateStatus(id: string, status: CustomOrder["status"]) {
    updateCustomOrderStatus(id, status);
    load();
  }

  return (
    <PageTransition className="p-4 md:p-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="p-2 rounded-xl bg-[rgba(201,160,40,0.1)] text-[#C9A028] hover:bg-[rgba(201,160,40,0.2)] transition">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-2xl text-[#F2E9DE]">WhatsApp Custom Orders</h1>
            <p className="text-xs text-[#7A5A48] mt-0.5">Orders via custom order form → WhatsApp</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(201,160,40,0.1)] text-[#C9A028] text-xs hover:bg-[rgba(201,160,40,0.2)] transition">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle size={40} className="text-[#4A3020] mx-auto mb-3" />
          <p className="font-display text-xl text-[#7A5A48]">No custom orders yet</p>
          <p className="text-xs text-[#4A3020] mt-2">When customers submit the custom order form, they appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <StaggerItem key={order.id} index={i}>
              <div className="bg-[rgba(42,22,10,0.6)] border border-[rgba(201,160,40,0.1)] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-[#7A5A48]">{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${STATUS_COLORS[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="font-semibold text-[#F2E9DE] text-sm">{order.name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#7A5A48]">
                      <span className="flex items-center gap-1"><Phone size={11} />{order.phone}</span>
                      {order.email && <span className="flex items-center gap-1"><Mail size={11} />{order.email}</span>}
                      {order.category && <span className="flex items-center gap-1"><Tag size={11} />{order.category}</span>}
                      {order.budget && <span className="flex items-center gap-1"><DollarSign size={11} />{order.budget}</span>}
                      <span className="flex items-center gap-1"><Clock size={11} />{new Date(order.created_at).toLocaleDateString("en-PK")}</span>
                    </div>
                    <p className="text-xs text-[#C8B89A]/60 mt-2 line-clamp-2">{order.description}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => setDetail(order)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[rgba(201,160,40,0.1)] text-[#C9A028] text-xs hover:bg-[rgba(201,160,40,0.2)] transition">
                      <Eye size={11} /> View
                    </button>
                    <a href={`https://wa.me/${order.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-900/30 text-green-400 text-xs hover:bg-green-900/50 transition">
                      <MessageCircle size={11} /> WhatsApp
                    </a>
                  </div>
                </div>
                {/* Status buttons */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-[rgba(201,160,40,0.08)]">
                  {(["new","reviewing","accepted","rejected"] as const).map(s => (
                    <button key={s} onClick={() => updateStatus(order.id, s)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border transition ${order.status === s
                        ? STATUS_COLORS[s] : "border-[rgba(201,160,40,0.12)] text-[#4A3020] hover:border-[rgba(201,160,40,0.25)]"}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="bg-[#1C1208] border border-[rgba(201,160,40,0.2)] rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-[#F2E9DE]">Order Details</h3>
              <button onClick={() => setDetail(null)} className="text-[#7A5A48] hover:text-[#F2E9DE]"><XCircle size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: "Name",        value: detail.name },
                { label: "Phone",       value: detail.phone },
                { label: "Email",       value: detail.email || "—" },
                { label: "Category",    value: detail.category || "—" },
                { label: "Budget",      value: detail.budget || "—" },
                { label: "Deadline",    value: detail.deadline || "—" },
                { label: "Submitted",   value: new Date(detail.created_at).toLocaleString("en-PK") },
              ].map(row => (
                <div key={row.label} className="flex gap-3">
                  <span className="text-[#7A5A48] w-20 flex-shrink-0">{row.label}:</span>
                  <span className="text-[#C8B89A]">{row.value}</span>
                </div>
              ))}
              <div>
                <span className="text-[#7A5A48] block mb-1">Description:</span>
                <p className="text-[#C8B89A] bg-[rgba(201,160,40,0.05)] rounded-xl p-3 text-xs leading-relaxed">{detail.description}</p>
              </div>
            </div>
            <a href={`https://wa.me/${detail.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${detail.name}! Regarding your custom crochet order for "${detail.category}"`)}`}
              target="_blank" rel="noreferrer"
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-600 transition">
              <MessageCircle size={15} /> Reply on WhatsApp
            </a>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
