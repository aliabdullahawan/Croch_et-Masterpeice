/* ════════════════════════════════════════════════════════════════
   app/admin/orders/custom/page.tsx
  WhatsApp Custom Orders — review incoming requests and create
  manual custom orders from admin with optional customer linking.
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useEffect }    from "react";
import Link                       from "next/link";
import { MessageCircle, ChevronLeft, Clock, Phone, Mail, Tag, DollarSign, XCircle, Eye, RefreshCw, UserPlus } from "lucide-react";
import PageTransition, { StaggerItem } from "@/components/ui/PageTransition";
import { fetchCustomOrders, updateCustomOrderStatus, createAdminCustomOrder, fetchAdminCustomerOptions, type AdminCustomerOption, type CustomOrderRow } from "@/lib/db-client";
import { useTheme } from "@/context/ThemeContext";

const STATUS_COLORS: Record<CustomOrderRow["status"], string> = {
  new:       "bg-amber-900/30 text-amber-400 border-amber-800/30",
  reviewing: "bg-blue-900/30 text-blue-400 border-blue-800/30",
  accepted:  "bg-green-900/30 text-green-400 border-green-800/30",
  rejected:  "bg-red-900/30 text-red-400 border-red-800/30",
  in_progress: "bg-purple-900/30 text-purple-400 border-purple-800/30",
  completed: "bg-teal-900/30 text-teal-400 border-teal-800/30",
  cancelled: "bg-gray-700/30 text-gray-300 border-gray-600/30",
};

interface ManualOrderForm {
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  category: string;
  description: string;
  budget_text: string;
  deadline_text: string;
  status: CustomOrderRow["status"];
}

const INITIAL_FORM: ManualOrderForm = {
  user_id: "",
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  category: "",
  description: "",
  budget_text: "",
  deadline_text: "",
  status: "new",
};

export default function CustomOrdersPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardBg = isDark ? "rgba(42,22,10,0.6)" : "rgba(255,248,243,0.92)";
  const panelBg = isDark ? "rgba(28,18,8,0.85)" : "rgba(255,255,255,0.96)";
  const borderColor = isDark ? "rgba(201,160,40,0.16)" : "rgba(61,43,31,0.16)";
  const headingColor = isDark ? "#F2E9DE" : "#2C1A0E";
  const textDim = isDark ? "#7A5A48" : "#6B4C3B";
  const textMain = isDark ? "#C8B89A" : "#4A3020";

  const [orders,  setOrders]  = useState<CustomOrderRow[]>([]);
  const [detail,  setDetail]  = useState<CustomOrderRow | null>(null);
  const [customers, setCustomers] = useState<AdminCustomerOption[]>([]);
  const [form, setForm] = useState<ManualOrderForm>(INITIAL_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  async function loadOrders() {
    const data = await fetchCustomOrders();
    setOrders(data);
  }

  async function loadCustomers() {
    const rows = await fetchAdminCustomerOptions();
    setCustomers(rows);
  }

  async function loadAll() {
    await Promise.all([loadOrders(), loadCustomers()]);
  }

  useEffect(() => {
    void Promise.all([loadOrders(), loadCustomers()]);
  }, []);

  async function updateStatus(id: string, status: CustomOrderRow["status"]) {
    await updateCustomOrderStatus(id, status);
    await loadOrders();
  }

  function onSelectCustomer(userId: string) {
    const match = customers.find((customer) => customer.id === userId);
    setForm((prev) => ({
      ...prev,
      user_id: userId,
      customer_name: match?.full_name ?? prev.customer_name,
      customer_phone: match?.phone ?? prev.customer_phone,
      customer_email: match?.email ?? prev.customer_email,
    }));
  }

  async function submitManualOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.description.trim()) {
      setCreateError("Name, phone, and description are required.");
      return;
    }

    setCreating(true);
    const result = await createAdminCustomOrder({
      user_id: form.user_id || null,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email,
      category: form.category,
      description: form.description,
      budget_text: form.budget_text,
      deadline_text: form.deadline_text,
      status: form.status,
    });
    setCreating(false);

    if (!result.ok) {
      setCreateError(result.message ?? "Could not create custom order.");
      return;
    }

    setCreateSuccess(`Custom order created${result.id ? ` (#${result.id.slice(0, 8)})` : ""}.`);
    setForm(INITIAL_FORM);
    await loadOrders();
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
            <h1 className="font-display text-2xl" style={{ color: headingColor }}>WhatsApp Custom Orders</h1>
            <p className="text-xs mt-0.5" style={{ color: textDim }}>Orders via custom order form → WhatsApp</p>
          </div>
        </div>
        <button onClick={loadAll} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(201,160,40,0.1)] text-[#C9A028] text-xs hover:bg-[rgba(201,160,40,0.2)] transition">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="mb-6 rounded-2xl p-4 md:p-5" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={16} className="text-[#C9A028]" />
          <h2 className="font-display text-lg" style={{ color: headingColor }}>Add Manual Custom Order</h2>
        </div>

        <form onSubmit={submitManualOrder} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className="text-xs" style={{ color: textMain }}>
              Link User (Optional)
              <select
                value={form.user_id}
                onChange={(e) => onSelectCustomer(e.target.value)}
                className="mt-1 w-full rounded-lg px-3 py-2"
                style={{ background: panelBg, border: `1px solid ${borderColor}`, color: headingColor }}
              >
                <option value="">Guest / Not linked</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name} {customer.phone ? `- ${customer.phone}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs" style={{ color: textMain }}>
              Customer Name *
              <input
                value={form.customer_name}
                onChange={(e) => setForm((prev) => ({ ...prev, customer_name: e.target.value }))}
                className="mt-1 w-full rounded-lg px-3 py-2"
                style={{ background: panelBg, border: `1px solid ${borderColor}`, color: headingColor }}
              />
            </label>

            <label className="text-xs" style={{ color: textMain }}>
              Phone *
              <input
                value={form.customer_phone}
                onChange={(e) => setForm((prev) => ({ ...prev, customer_phone: e.target.value }))}
                className="mt-1 w-full rounded-lg px-3 py-2"
                style={{ background: panelBg, border: `1px solid ${borderColor}`, color: headingColor }}
              />
            </label>

            <label className="text-xs" style={{ color: textMain }}>
              Email
              <input
                value={form.customer_email}
                onChange={(e) => setForm((prev) => ({ ...prev, customer_email: e.target.value }))}
                className="mt-1 w-full rounded-lg px-3 py-2"
                style={{ background: panelBg, border: `1px solid ${borderColor}`, color: headingColor }}
              />
            </label>

            <label className="text-xs" style={{ color: textMain }}>
              Category
              <input
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-1 w-full rounded-lg px-3 py-2"
                style={{ background: panelBg, border: `1px solid ${borderColor}`, color: headingColor }}
              />
            </label>

            <label className="text-xs" style={{ color: textMain }}>
              Budget
              <input
                value={form.budget_text}
                onChange={(e) => setForm((prev) => ({ ...prev, budget_text: e.target.value }))}
                className="mt-1 w-full rounded-lg px-3 py-2"
                style={{ background: panelBg, border: `1px solid ${borderColor}`, color: headingColor }}
              />
            </label>

            <label className="text-xs" style={{ color: textMain }}>
              Deadline
              <input
                value={form.deadline_text}
                onChange={(e) => setForm((prev) => ({ ...prev, deadline_text: e.target.value }))}
                className="mt-1 w-full rounded-lg px-3 py-2"
                style={{ background: panelBg, border: `1px solid ${borderColor}`, color: headingColor }}
              />
            </label>

            <label className="text-xs" style={{ color: textMain }}>
              Status
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as CustomOrderRow["status"] }))}
                className="mt-1 w-full rounded-lg px-3 py-2"
                style={{ background: panelBg, border: `1px solid ${borderColor}`, color: headingColor }}
              >
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>

          <label className="text-xs block" style={{ color: textMain }}>
            Description *
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-lg px-3 py-2"
              style={{ background: panelBg, border: `1px solid ${borderColor}`, color: headingColor }}
            />
          </label>

          {createError && <p className="text-xs text-red-400">{createError}</p>}
          {createSuccess && <p className="text-xs text-green-400">{createSuccess}</p>}

          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 rounded-xl border text-sm transition disabled:opacity-60"
            style={{ background: isDark ? "rgba(201,160,40,0.2)" : "rgba(201,160,40,0.15)", borderColor: "rgba(201,160,40,0.35)", color: isDark ? "#F2E9DE" : "#2C1A0E" }}
          >
            {creating ? "Creating..." : "Create Custom Order"}
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle size={40} className="text-[#4A3020] mx-auto mb-3" />
          <p className="font-display text-xl" style={{ color: textDim }}>No custom orders yet</p>
          <p className="text-xs mt-2" style={{ color: textMain }}>When customers submit the custom order form, they appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <StaggerItem key={order.id} index={i}>
              <div className="rounded-2xl p-4" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono" style={{ color: textDim }}>{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${STATUS_COLORS[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.user_id && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] border border-[rgba(201,160,40,0.2)] text-[#C9A028]">
                          Linked User
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-sm" style={{ color: headingColor }}>{order.customer_name}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs" style={{ color: textDim }}>
                      <span className="flex items-center gap-1"><Phone size={11} />{order.customer_phone}</span>
                      {order.customer_email && <span className="flex items-center gap-1"><Mail size={11} />{order.customer_email}</span>}
                      {order.category && <span className="flex items-center gap-1"><Tag size={11} />{order.category}</span>}
                      {order.budget_text && <span className="flex items-center gap-1"><DollarSign size={11} />{order.budget_text}</span>}
                      <span className="flex items-center gap-1"><Clock size={11} />{new Date(order.created_at).toLocaleDateString("en-PK")}</span>
                    </div>
                    <p className="text-xs mt-2 line-clamp-2" style={{ color: isDark ? "rgba(200,184,154,0.75)" : "rgba(74,48,32,0.75)" }}>{order.description}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => setDetail(order)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[rgba(201,160,40,0.1)] text-[#C9A028] text-xs hover:bg-[rgba(201,160,40,0.2)] transition">
                      <Eye size={11} /> View
                    </button>
                    <a href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-900/30 text-green-400 text-xs hover:bg-green-900/50 transition">
                      <MessageCircle size={11} /> WhatsApp
                    </a>
                  </div>
                </div>
                {/* Status buttons */}
                <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${isDark ? "rgba(201,160,40,0.08)" : "rgba(61,43,31,0.1)"}` }}>
                  {(["new","reviewing","accepted","rejected","in_progress","completed","cancelled"] as const).map(s => (
                    <button key={s} onClick={() => { void updateStatus(order.id, s); }}
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
          <div className="rounded-2xl shadow-2xl max-w-md w-full p-6" style={{ background: panelBg, border: `1px solid ${borderColor}` }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg" style={{ color: headingColor }}>Order Details</h3>
              <button onClick={() => setDetail(null)} className="hover:text-[#F2E9DE]" style={{ color: textDim }}><XCircle size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: "Name",        value: detail.customer_name },
                { label: "Phone",       value: detail.customer_phone },
                { label: "Email",       value: detail.customer_email || "—" },
                { label: "Category",    value: detail.category || "—" },
                { label: "Budget",      value: detail.budget_text || "—" },
                { label: "Deadline",    value: detail.deadline_text || "—" },
                { label: "Submitted",   value: new Date(detail.created_at).toLocaleString("en-PK") },
              ].map(row => (
                <div key={row.label} className="flex gap-3">
                  <span className="w-20 flex-shrink-0" style={{ color: textDim }}>{row.label}:</span>
                  <span style={{ color: textMain }}>{row.value}</span>
                </div>
              ))}
              <div>
                <span className="block mb-1" style={{ color: textDim }}>Description:</span>
                <p className="rounded-xl p-3 text-xs leading-relaxed" style={{ color: textMain, background: isDark ? "rgba(201,160,40,0.05)" : "rgba(61,43,31,0.05)" }}>{detail.description}</p>
              </div>
            </div>
            <a href={`https://wa.me/${detail.customer_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${detail.customer_name}! Regarding your custom crochet order for "${detail.category}"`)}`}
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
