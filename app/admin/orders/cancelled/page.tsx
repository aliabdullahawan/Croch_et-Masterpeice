/* ════════════════════════════════════════════════════════════════
   app/admin/orders/cancelled/page.tsx
   Cancelled Orders — dedicated page for all cancelled orders.
   Accessible only from the admin sidebar.
   "Restore" button moves an order back to active status.
   TODO: Supabase — .from('orders').select('*').eq('status','cancelled')
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useMemo, useEffect }    from "react";
import Link                     from "next/link";
import { XCircle, RotateCcw, Search, ChevronLeft, CalendarDays, Package } from "lucide-react";
import PageTransition, { StaggerItem } from "@/components/ui/PageTransition";
import { fetchAdminOrders, updateOrderStatus } from "@/lib/db-client";
import type { Order } from "@/lib/admin-types";

export default function CancelledOrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    void (async () => {
      const orders = await fetchAdminOrders();
      setAllOrders(orders);
    })();
  }, []);

  function formatPKR(value: number): string {
    return `Rs ${Math.round(value).toLocaleString("en-PK")}`;
  }

  const cancelled = useMemo(() =>
    allOrders.filter(o => o.status === "cancelled" &&
      (o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
       o.id.toLowerCase().includes(search.toLowerCase()))),
    [allOrders, search]
  );

  async function restore(id: string) {
    await updateOrderStatus(id, "pending");
    const orders = await fetchAdminOrders();
    setAllOrders(orders);
  }

  return (
    <PageTransition className="p-4 md:p-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="p-2 rounded-xl bg-[rgba(201,160,40,0.1)] text-[#C9A028] hover:bg-[rgba(201,160,40,0.2)] transition">
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="font-display text-2xl text-[#F2E9DE]">Cancelled Orders</h1>
          <p className="text-xs text-[#7A5A48] mt-0.5">{cancelled.length} cancelled order{cancelled.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A5A48]" />
        <input
          type="text" placeholder="Search by customer or order ID..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[rgba(201,160,40,0.06)] border border-[rgba(201,160,40,0.15)] rounded-xl text-sm text-[#C8B89A] placeholder-[#4A3020] outline-none focus:border-[#C9A028]"
        />
      </div>

      {cancelled.length === 0 ? (
        <div className="text-center py-20">
          <XCircle size={40} className="text-[#4A3020] mx-auto mb-3" />
          <p className="font-display text-xl text-[#7A5A48]">
            {search ? "No matching cancelled orders" : "No cancelled orders"}
          </p>
          <p className="text-xs text-[#4A3020] mt-2">Cancelled orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cancelled.map((order, i) => (
            <StaggerItem key={order.id} index={i}>
              <div className="bg-[rgba(42,22,10,0.6)] border border-[rgba(201,160,40,0.1)] rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-[#7A5A48]">{order.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-900/30 text-red-400 border border-red-800/30">
                        Cancelled
                      </span>
                    </div>
                    <p className="font-semibold text-[#F2E9DE] text-sm">{order.customer_name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#7A5A48]">
                      <span className="flex items-center gap-1"><Package size={11} />{order.item_count} item{order.item_count !== 1 ? "s" : ""}</span>
                      <span className="flex items-center gap-1"><CalendarDays size={11} />{new Date(order.created_at).toLocaleDateString("en-PK")}</span>
                    </div>
                    {order.notes && (
                      <p className="text-xs text-[#C8B89A]/60 mt-1 italic">"{order.notes}"</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-[#C9A028] text-sm">{formatPKR(order.total_amount)}</p>
                    <button
                      onClick={() => { void restore(order.id); }}
                      className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(201,160,40,0.1)] text-[#C9A028] text-xs hover:bg-[rgba(201,160,40,0.2)] transition"
                    >
                      <RotateCcw size={11} /> Restore
                    </button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
