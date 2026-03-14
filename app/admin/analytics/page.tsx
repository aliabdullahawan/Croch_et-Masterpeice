/* ════════════════════════════════════════════════════════════════
   app/admin/analytics/page.tsx — Analytics with Line/Bar/Pie chart toggle
   Theme-aware.
════════════════════════════════════════════════════════════════ */
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import LineGraphStatistics from "@/components/ui/line-graph-statistics";
import PageTransition      from "@/components/ui/PageTransition";
import { useTheme }        from "@/context/ThemeContext";
import { fetchAnalytics, fetchAdminCategories, fetchAdminOrders } from "@/lib/db-client";
import type { SalesDataPoint } from "@/lib/admin-types";
import {
  Download, BarChart2, Table2, TrendingUp, PieChart as PieIcon,
  LineChart as LineIcon, ShoppingBag, Users, DollarSign, ChevronDown,
} from "lucide-react";

type ViewMode   = "chart" | "table";
type Period     = "7d" | "30d" | "3m";
type ChartType  = "line" | "bar" | "pie";

const PAGE_SIZE = 50;

const PIE_COLORS = ["#C9A028", "#4AABAB", "#E8A0A8", "#7AB87A", "#9B7FD4", "#E8C040"];

export default function AnalyticsPage() {
  const { theme }  = useTheme();
  const isDark     = theme === "dark";
  const [period,       setPeriod]       = useState<Period>("30d");
  const [viewMode,     setViewMode]     = useState<ViewMode>("chart");
  const [chartType,    setChartType]    = useState<ChartType>("line");
  const [catFilter,    setCatFilter]    = useState<"all" | string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const [rawData, setRawData] = useState<SalesDataPoint[]>([]);
  const [summary, setSummary] = useState({ total_sold: 0, total_revenue: 0, avg_order_value: 0, growth_pct: 0 });
  const [categories, setCategories] = useState<Array<{ id: number; name: string; product_count: number }>>([]);
  const [allOrders, setAllOrders] = useState<Array<{ id: string; customer_name: string; customer_phone: string | null; total_amount: number; status: string; created_at: string }>>([]);

  useEffect(() => {
    void (async () => {
      const [analyticsData, categoryRows, orderRows] = await Promise.all([
        fetchAnalytics(period),
        fetchAdminCategories(),
        fetchAdminOrders(),
      ]);

      setRawData(analyticsData.rawData);
      setSummary(analyticsData.summary);
      setCategories(categoryRows);
      setAllOrders(orderRows);
    })();
  }, [period]);

  function formatPKR(amount: number): string {
    return `Rs ${Math.round(amount).toLocaleString("en-PK")}`;
  }

  function getOrderStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      shipped: "bg-teal-100 text-teal-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return map[status] ?? "bg-gray-100 text-gray-700";
  }

  function downloadCSV(data: object[], filename: string): void {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((h) => JSON.stringify((row as Record<string, unknown>)[h] ?? "")).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* Pie data: category breakdown */
  const pieData = useMemo(() =>
    categories.map((c, i) => ({
      name:  c.name,
      value: c.product_count,
      color: PIE_COLORS[i % PIE_COLORS.length],
    })),
    [categories]
  );

  const handleDownloadCSV = useCallback(() => {
    const rows = rawData.map((d: SalesDataPoint) => ({
      date: d.date, sales_units: d.sales, revenue_pkr: d.revenue,
    }));
    downloadCSV(rows, `analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`);
  }, [rawData, period]);

  /* Theme colours */
  const cardBg     = isDark ? "rgba(28,18,8,0.8)"    : "rgba(255,248,243,0.9)";
  const cardBorder = isDark ? "rgba(201,160,40,0.1)" : "rgba(61,43,31,0.10)";
  const textMain   = isDark ? "#F2E9DE"              : "#2C1A0E";
  const textFaint  = isDark ? "#7A5A48"              : "#8A6A58";
  const inputBg    = isDark ? "rgba(42,22,10,0.8)"   : "rgba(255,255,255,0.9)";
  const inputBorder = isDark ? "rgba(201,160,40,0.15)": "rgba(61,43,31,0.12)";
  const axisColor  = isDark ? "#4A3020"  : "#B8A090";
  const gridColor  = isDark ? "rgba(201,160,40,0.06)" : "rgba(61,43,31,0.06)";

  const summaryCards = [
    { label: "Units Sold",      value: summary.total_sold.toString(),      icon: <ShoppingBag size={18} />, bg: isDark ? "bg-amber-900/30" : "bg-amber-50", text: isDark ? "text-amber-300" : "text-amber-700" },
    { label: "Total Revenue",   value: formatPKR(summary.total_revenue),   icon: <DollarSign  size={18} />, bg: isDark ? "bg-teal-900/30"  : "bg-teal-50",  text: isDark ? "text-teal-300"  : "text-teal-700"  },
    { label: "Avg Order Value", value: formatPKR(summary.avg_order_value), icon: <TrendingUp  size={18} />, bg: isDark ? "bg-rose-900/30"  : "bg-rose-50",  text: isDark ? "text-rose-300"  : "text-rose-600"  },
    { label: "Growth",          value: `${summary.growth_pct}%`,           icon: <Users       size={18} />, bg: isDark ? "bg-green-900/30" : "bg-green-50", text: isDark ? "text-green-300" : "text-green-700" },
  ];

  return (
    <PageTransition className="min-h-screen">
      {/* Top bar */}
      <div className="px-4 md:px-6 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3"
        style={{ borderBottom: `1px solid ${cardBorder}` }}>
        <div>
          <h1 className="font-display text-xl" style={{ color: textMain }}>Analytics</h1>
          <p className="text-xs" style={{ color: textFaint }}>Sales & revenue insights for your crochet business</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode */}
          <div className="flex rounded-lg p-0.5" style={{ background: "rgba(201,160,40,0.1)" }}>
            {[
              { mode: "chart" as ViewMode, icon: <BarChart2 size={13} />, label: "Chart" },
              { mode: "table" as ViewMode, icon: <Table2    size={13} />, label: "Table" },
            ].map(v => (
              <button key={v.mode} onClick={() => setViewMode(v.mode)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition"
                style={{
                  background: viewMode === v.mode ? "rgba(201,160,40,0.3)" : "transparent",
                  color:      viewMode === v.mode ? textMain : textFaint,
                }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          {/* Chart type (only when in chart mode) */}
          {viewMode === "chart" && (
            <div className="flex rounded-lg p-0.5 gap-0.5" style={{ background: "rgba(201,160,40,0.1)" }}>
              {([
                { type: "line" as ChartType, icon: <LineIcon size={13} />,  label: "Line" },
                { type: "bar"  as ChartType, icon: <BarChart2 size={13} />, label: "Bar"  },
                { type: "pie"  as ChartType, icon: <PieIcon  size={13} />,  label: "Pie"  },
              ] as const).map(c => (
                <button key={c.type} onClick={() => setChartType(c.type)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition"
                  style={{
                    background: chartType === c.type ? "#C9A028" : "transparent",
                    color:      chartType === c.type ? "#1C1208" : textFaint,
                  }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          )}

          <button onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
            style={{ background: "#C9A028", color: "#1C1208", boxShadow: "0 2px 8px rgba(201,160,40,0.3)" }}>
            <Download size={13} /> CSV
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryCards.map(card => (
            <div key={card.label} className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <div className={`p-2 rounded-xl ${card.bg} ${card.text}`}>{card.icon}</div>
              <div>
                <div className="font-display text-xl font-bold" style={{ color: textMain }}>{card.value}</div>
                <div className="text-xs" style={{ color: textFaint }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: textFaint }}>Filter by:</span>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs outline-none transition"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textFaint }}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
        </div>

        {/* Chart area */}
        {viewMode === "chart" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${cardBorder}` }}>
              <h3 className="font-display text-base font-semibold" style={{ color: textMain }}>
                {chartType === "line" ? "Sales Trend" : chartType === "bar" ? "Revenue by Period" : "Category Breakdown"}
              </h3>
            </div>
            <div className="p-4">
              {/* Period selector (line & bar only) */}
              {chartType !== "pie" && (
                <div className="flex gap-2 mb-4">
                  {(["7d", "30d", "3m"] as Period[]).map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition"
                      style={{
                        background: period === p ? "#C9A028" : "rgba(201,160,40,0.1)",
                        color:      period === p ? "#1C1208" : textFaint,
                      }}>
                      {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "3 Months"}
                    </button>
                  ))}
                </div>
              )}

              {chartType === "line" && (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={rawData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 10 }} />
                    <YAxis tick={{ fill: axisColor, fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: isDark ? "#1C1208" : "#FDF8F3", border: `1px solid ${cardBorder}`, borderRadius: 12, color: textMain, fontSize: 12 }} />
                    <Line type="monotone" dataKey="sales"   stroke="#C9A028" strokeWidth={2} dot={false} name="Units Sold" />
                    <Line type="monotone" dataKey="revenue" stroke="#4AABAB" strokeWidth={2} dot={false} name="Revenue ₨" />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {chartType === "bar" && (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={rawData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 10 }} />
                    <YAxis tick={{ fill: axisColor, fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: isDark ? "#1C1208" : "#FDF8F3", border: `1px solid ${cardBorder}`, borderRadius: 12, color: textMain, fontSize: 12 }} />
                    <Bar dataKey="revenue" fill="#C9A028" radius={[4, 4, 0, 0]} name="Revenue ₨" />
                    <Bar dataKey="sales"   fill="#4AABAB" radius={[4, 4, 0, 0]} name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {chartType === "pie" && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={120}
                      dataKey="value" nameKey="name" paddingAngle={3}>
                      {pieData.map((entry, i) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <PieTooltip contentStyle={{ background: isDark ? "#1C1208" : "#FDF8F3", border: `1px solid ${cardBorder}`, borderRadius: 12, color: textMain, fontSize: 12 }} />
                    <PieLegend iconType="circle" wrapperStyle={{ fontSize: 11, color: textFaint }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Table view */}
        {viewMode === "table" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${cardBorder}` }}>
              <h3 className="font-display text-base font-semibold" style={{ color: textMain }}>Data Table</h3>
              <span className="text-xs" style={{ color: textFaint }}>{rawData.length} data points</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                    {["Date", "Units Sold", "Revenue (₨)", "Avg/Unit"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs" style={{ color: textFaint }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawData.map(row => (
                    <tr key={row.date} style={{ borderBottom: `1px solid ${cardBorder}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,160,40,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-6 py-3 font-medium" style={{ color: textFaint }}>{row.date}</td>
                      <td className="px-6 py-3 text-right" style={{ color: textFaint }}>{row.sales}</td>
                      <td className="px-6 py-3 text-right font-semibold" style={{ color: "#C9A028" }}>{formatPKR(row.revenue)}</td>
                      <td className="px-6 py-3 text-right" style={{ color: textFaint }}>
                        {row.sales > 0 ? formatPKR(Math.round(row.revenue / row.sales)) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 flex justify-end" style={{ borderTop: `1px solid ${cardBorder}` }}>
              <button onClick={handleDownloadCSV} className="flex items-center gap-1 text-xs font-medium hover:underline" style={{ color: "#C9A028" }}>
                <Download size={12} /> Download CSV
              </button>
            </div>
          </div>
        )}

        {/* Order history */}
        <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${cardBorder}` }}>
            <div>
              <h3 className="font-display text-base font-semibold" style={{ color: textMain }}>Order History</h3>
              <p className="text-xs mt-0.5" style={{ color: textFaint }}>All orders sorted by most recent</p>
            </div>
            <span className="text-xs" style={{ color: textFaint }}>{allOrders.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                  {["Order ID", "Customer", "Phone", "Amount", "Status", "Date"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs" style={{ color: textFaint }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allOrders.slice(0, visibleCount).map(order => (
                  <tr key={order.id} style={{ borderBottom: `1px solid ${cardBorder}` }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,160,40,0.04)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-5 py-3 font-mono text-xs" style={{ color: textFaint }}>{order.id}</td>
                    <td className="px-5 py-3 font-medium text-xs" style={{ color: textFaint }}>{order.customer_name}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: textFaint }}>{order.customer_phone ?? "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold text-xs" style={{ color: "#C9A028" }}>{formatPKR(order.total_amount)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getOrderStatusColor(order.status)}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: textFaint }}>
                      {new Date(order.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleCount < allOrders.length && (
            <div className="px-6 py-4 text-center" style={{ borderTop: `1px solid ${cardBorder}` }}>
              <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                className="flex items-center gap-2 mx-auto text-sm font-medium hover:underline" style={{ color: "#C9A028" }}>
                <ChevronDown size={15} /> Show More ({allOrders.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
