/* ════════════════════════════════════════════════════════════════
   app/admin/customers/page.tsx  —  Customer Management
   ──────────────────────────────────────────────────────────────
   Features:
   - Customer table with aggregated order history
   - Search by name / email / phone
   - Click row to view customer details + order history
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useMemo }         from "react";
import AdminTopbar                    from "@/components/admin/AdminTopbar";
import { useAdmin }                   from "@/context/AdminContext";
import { getMockCustomers, getMockOrders, formatPKR } from "@/lib/admin-mock-data";
import type { AdminCustomer }        from "@/lib/admin-types";
import { Search, X, Users, User }    from "lucide-react";

/* ══════════════════════════════════════════════════════════════ */
export default function CustomersPage() {
  const { toggleSidebar } = useAdmin();

  /* ── Data
   * TODO: Supabase — const { data } = await supabase
   *   .from('profiles')
   *   .select('*, orders:orders(total_amount, created_at, status)')
   *   .eq('role', 'customer')
   *   .order('created_at', { ascending: false })
   */
  const customers = useMemo(() => getMockCustomers(), []);
  const allOrders = useMemo(() => getMockOrders(), []);

  /* ── UI state ─────────────────────────────────────────────── */
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<AdminCustomer | null>(null);

  /* ── Filter customers ────────────────────────────────────── */
  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter((c) =>
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  }, [customers, search]);

  /* ── Get orders for selected customer ───────────────────── */
  const customerOrders = useMemo(() => {
    if (!selected) return [];
    return allOrders.filter((o) => o.customer_id === selected.id);
  }, [selected, allOrders]);

  return (
    <div className="min-h-screen">
      <AdminTopbar
        title="Customers"
        subtitle={`${customers.length} registered customers`}
        onMenuClick={toggleSidebar}
      />

      <div className="p-4 md:p-6 space-y-4">

        {/* ── Search ─────────────────────────────────────────── */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A5A48]" />
          <input
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border border-brand-cream/15 bg-brand-base/50 text-sm font-body text-brand-cream w-full outline-none focus:border-brand-gold transition"
          />
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        <div className="bg-brand-base/40 backdrop-blur-sm rounded-2xl border border-brand-gold/15 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="bg-brand-gold/10 text-brand-creamDim font-medium text-xs border-b border-brand-gold/15">
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Contact</th>
                  <th className="px-5 py-3 text-right">Orders</th>
                  <th className="px-5 py-3 text-right">Total Spent</th>
                  <th className="px-5 py-3 text-left">Last Order</th>
                  <th className="px-5 py-3 text-left">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(61,43,31,0.05)]">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-brand-gold/5 transition-colors cursor-pointer"
                    onClick={() => setSelected(c)}
                  >
                    {/* Avatar + name */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                          {c.avatar_url
                            ? <img src={c.avatar_url} alt={c.full_name ?? ""} className="w-full h-full rounded-full object-cover" />
                            : <User size={14} className="text-brand-gold" />
                          }
                        </div>
                        <div>
                          <div className="font-medium text-brand-cream">{c.full_name ?? "Anonymous"}</div>
                          <div className="text-[10px] text-brand-creamDim">{c.email ?? "No email"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#7A5A48] text-xs">{c.phone ?? "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-bold">
                        {c.order_count}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-brand-cream">
                      {c.total_spent > 0 ? formatPKR(c.total_spent) : <span className="text-brand-creamDim font-normal">₨0</span>}
                    </td>
                    <td className="px-5 py-3 text-[#7A5A48] text-xs">
                      {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3 text-[#7A5A48] text-xs">
                      {new Date(c.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-[#7A5A48]">
                      <Users size={32} className="mx-auto mb-2 opacity-30" />
                      <div className="text-sm">No customers found.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[rgba(61,43,31,0.06)] text-xs text-[#7A5A48]">
            {filtered.length} of {customers.length} customers
          </div>
        </div>

      </div>

      {/* ══ Customer Detail Modal ════════════════════════════════ */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-brand-base rounded-2xl shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-brand-gold/20">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center">
                  <User size={20} className="text-brand-gold" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-brand-cream">{selected.full_name ?? "Anonymous"}</h3>
                  <p className="text-xs text-brand-creamDim">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-brand-creamDim hover:text-brand-cream">
                <X size={18} />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Orders",     value: selected.order_count.toString() },
                { label: "Total Spent",value: formatPKR(selected.total_spent) },
                { label: "Member",     value: new Date(selected.created_at).toLocaleDateString("en-PK", { month: "short", year: "numeric" }) },
              ].map((s) => (
                <div key={s.label} className="bg-brand-gold/10 rounded-xl p-3 text-center border border-brand-gold/10">
                  <div className="font-bold text-brand-cream text-sm">{s.value}</div>
                  <div className="text-[10px] text-brand-creamDim mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Contact info */}
            <div className="text-sm font-body space-y-2 mb-5">
              {selected.phone && <div className="flex justify-between"><span className="text-[#7A5A48]">Phone</span><span>{selected.phone}</span></div>}
            </div>

            {/* Order history */}
            <div>
              <h4 className="font-display text-sm font-semibold text-[#3D2B1F] mb-3">Order History</h4>
              {customerOrders.length === 0 ? (
                <p className="text-xs text-[#7A5A48] italic">No orders found.</p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between bg-brand-gold/5 rounded-xl px-4 py-2.5 text-sm border border-brand-gold/5">
                      <div>
                        <div className="font-mono text-[10px] text-brand-creamDim/50">{o.id}</div>
                        <div className="text-xs text-brand-cream mt-0.5">{new Date(o.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#3D2B1F] text-xs">{formatPKR(o.total_amount)}</div>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          o.status === "delivered" ? "bg-green-100 text-green-700" :
                          o.status === "cancelled" ? "bg-red-100 text-red-600" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {o.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
