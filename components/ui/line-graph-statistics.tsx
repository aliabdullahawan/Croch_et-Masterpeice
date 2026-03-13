/* ════════════════════════════════════════════════════════════════
   components/ui/line-graph-statistics.tsx
   Animated SVG line chart for admin analytics dashboard.
   Shows Sales (units) vs Revenue (PKR) with period selection.
   Adapted for Croch_et Masterpiece — uses brand palette.
════════════════════════════════════════════════════════════════ */
"use client";

import React, { useState, useEffect } from "react";
import type { SalesDataPoint, AnalyticsSummary } from "@/lib/admin-types";

/* ── Prop types ─────────────────────────────────────────────── */
interface LineGraphProps {
  /** Data points for current period */
  data:    SalesDataPoint[];
  /** Summary totals for metric cards */
  summary: AnalyticsSummary;
  /** Called when user changes the period selector */
  onPeriodChange?: (period: "7d" | "30d" | "3m") => void;
  /** Initial selected period */
  initialPeriod?: "7d" | "30d" | "3m";
}

/* ── Period options ─────────────────────────────────────────── */
const PERIODS: { key: "7d" | "30d" | "3m"; label: string }[] = [
  { key: "7d",  label: "Last 7 days"    },
  { key: "30d", label: "Last 30 days"   },
  { key: "3m",  label: "Last 3 months"  },
];

/* ── Generate smooth SVG bezier curve path ──────────────────── */
function generateSmoothPath(
  values: number[],
  maxValue: number,
  height = 300,
  isArea = false
): string {
  const width      = 800;
  const padding    = 60;
  const chartWidth  = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = values.map((value, index) => ({
    x: padding + (index / (values.length - 1)) * chartWidth,
    y: padding + (1 - value / maxValue) * chartHeight,
  }));

  if (points.length < 2) return "";

  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = prev.x + (curr.x - prev.x) * 0.5;
    const cp1y = prev.y;
    const cp2x = curr.x - (next ? (next.x - curr.x) * 0.3 : 0);
    const cp2y = curr.y;
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
  }

  if (isArea) {
    path += ` L ${points[points.length - 1].x},${height - padding} L ${padding},${height - padding} Z`;
  }
  return path;
}

/* ── Main component ─────────────────────────────────────────── */
const LineGraphStatistics: React.FC<LineGraphProps> = ({
  data,
  summary,
  onPeriodChange,
  initialPeriod = "30d",
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "3m">(initialPeriod);
  const [hoveredPoint,   setHoveredPoint]   = useState<number | null>(null);
  const [animPhase,      setAnimPhase]      = useState(0);
  const [chartVisible,   setChartVisible]   = useState(false);

  // Data for the two lines
  const salesValues   = data.map((d) => d.sales);
  const revenueValues = data.map((d) => d.revenue / 1000); // show in thousands
  const dates         = data.map((d) => d.date);
  const maxValue      = Math.max(...salesValues, ...revenueValues) * 1.15;

  /* Re-animate chart when period changes */
  useEffect(() => {
    setChartVisible(false);
    setAnimPhase(0);
    const timers = [
      setTimeout(() => setAnimPhase(1), 100),
      setTimeout(() => setAnimPhase(2), 400),
      setTimeout(() => setAnimPhase(3), 800),
      setTimeout(() => setChartVisible(true), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [selectedPeriod]);

  /* Handle period button click */
  function handlePeriodChange(p: "7d" | "30d" | "3m") {
    setSelectedPeriod(p);
    onPeriodChange?.(p);
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-[rgba(61,43,31,0.08)] overflow-hidden">

      {/* ── Header row ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-0">
        {/* Legend */}
        <div
          className={`flex gap-6 transition-all duration-700 ${
            animPhase >= 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`}
        >
          {/* Sales line legend */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-amber-500 bg-amber-50 inline-block" />
            <span className="text-sm font-medium text-[#3D2B1F]">Sales (units)</span>
            <span className="text-sm font-bold text-[#3D2B1F]">{salesValues[salesValues.length - 1]}</span>
          </div>
          {/* Revenue line legend */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-teal-500 bg-teal-50 inline-block" />
            <span className="text-sm font-medium text-[#3D2B1F]">Revenue (₨k)</span>
            <span className="text-sm font-bold text-[#3D2B1F]">{revenueValues[revenueValues.length - 1].toFixed(1)}k</span>
          </div>
        </div>

        {/* Period selector buttons */}
        <div className="flex gap-2">
          {PERIODS.map((p, i) => (
            <button
              key={p.key}
              onClick={() => handlePeriodChange(p.key)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300
                ${selectedPeriod === p.key
                  ? "bg-[#3D2B1F] text-white shadow"
                  : "bg-[#F5EDE4] text-[#7A5A48] hover:bg-[#EDE0D8]"}
                ${animPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
              `}
              style={{ transitionDelay: `${400 + i * 100}ms` }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SVG Chart ─────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <div className="h-72 relative">
          <svg className="w-full h-full" viewBox="0 0 800 380">
            {/* Grid lines */}
            <defs>
              <pattern id="admin-grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#F5EDE4" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="800" height="380" fill="url(#admin-grid)"/>

            {/* Revenue area fill */}
            <path
              d={generateSmoothPath(revenueValues, maxValue, 340, true)}
              fill="rgba(107,191,191,0.08)"
              className={`transition-all duration-1000 ${chartVisible ? "opacity-100" : "opacity-0"}`}
            />
            {/* Sales area fill */}
            <path
              d={generateSmoothPath(salesValues, maxValue, 340, true)}
              fill="rgba(201,160,40,0.08)"
              className={`transition-all duration-1000 ${chartVisible ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: "200ms" }}
            />

            {/* Revenue line */}
            <path
              d={generateSmoothPath(revenueValues, maxValue, 340)}
              fill="none" stroke="#6BBFBF" strokeWidth="2.5" strokeLinecap="round"
              className={`transition-all duration-1000 ${chartVisible ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: "400ms" }}
            />
            {/* Sales line */}
            <path
              d={generateSmoothPath(salesValues, maxValue, 340)}
              fill="none" stroke="#C9A028" strokeWidth="2.5" strokeLinecap="round"
              className={`transition-all duration-1000 ${chartVisible ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: "600ms" }}
            />

            {/* Data points + x-axis labels */}
            {dates.map((date, i) => {
              const padding    = 60;
              const chartWidth  = 800 - padding * 2;
              const chartHeight = 340 - padding * 2;
              const x = padding + (i / (dates.length - 1)) * chartWidth;
              const salesY   = padding + (1 - salesValues[i]   / maxValue) * chartHeight;
              const revenueY = padding + (1 - revenueValues[i] / maxValue) * chartHeight;

              return (
                <g key={i}>
                  {/* Revenue dot */}
                  <circle
                    cx={x} cy={revenueY} r={hoveredPoint === i ? 5 : 3}
                    fill="#6BBFBF"
                    className={`transition-all duration-300 cursor-pointer ${chartVisible ? "opacity-100" : "opacity-0"}`}
                    style={{ transitionDelay: `${800 + i * 60}ms` }}
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Sales dot */}
                  <circle
                    cx={x} cy={salesY} r={hoveredPoint === i ? 5 : 3}
                    fill="#C9A028"
                    className={`transition-all duration-300 cursor-pointer ${chartVisible ? "opacity-100" : "opacity-0"}`}
                    style={{ transitionDelay: `${900 + i * 60}ms` }}
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* X-axis date label */}
                  <text
                    x={x} y={365}
                    textAnchor="middle" fill="#7A5A48" fontSize="11"
                    className={`transition-all duration-300 ${chartVisible ? "opacity-100" : "opacity-0"}`}
                    style={{ transitionDelay: `${1000 + i * 40}ms` }}
                  >
                    {date}
                  </text>
                </g>
              );
            })}

            {/* Tooltip on hover */}
            {hoveredPoint !== null && (() => {
              const padding    = 60;
              const chartWidth  = 800 - padding * 2;
              const x = padding + (hoveredPoint / (dates.length - 1)) * chartWidth;
              const tooltipX = Math.min(Math.max(x - 55, 10), 690);
              return (
                <g>
                  <line x1={x} y1={60} x2={x} y2={340} stroke="rgba(61,43,31,0.2)" strokeWidth="1" strokeDasharray="4,3"/>
                  <rect x={tooltipX} y={15} width="110" height="72" fill="white" stroke="rgba(201,160,40,0.3)" strokeWidth="1" rx="6" className="drop-shadow-lg"/>
                  <text x={tooltipX + 55} y={32}  textAnchor="middle" fill="#3D2B1F"  fontSize="11" fontWeight="600">{dates[hoveredPoint]}</text>
                  <text x={tooltipX + 55} y={48}  textAnchor="middle" fill="#C9A028"  fontSize="11">Sales: {salesValues[hoveredPoint]} units</text>
                  <text x={tooltipX + 55} y={64}  textAnchor="middle" fill="#6BBFBF"  fontSize="11">₨{(revenueValues[hoveredPoint] * 1000).toLocaleString()}</text>
                  <text x={tooltipX + 55} y={80}  textAnchor="middle" fill="#7A5A48"  fontSize="10">Revenue</text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* ── Metric cards ──────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 px-6 pb-6">
        {[
          { label: "Total Sold",       value: `${summary.total_sold} units`,          color: "border-amber-400"  },
          { label: "Revenue",          value: `₨${summary.total_revenue.toLocaleString()}`, color: "border-teal-400"   },
          { label: "Avg Order Value",  value: `₨${summary.avg_order_value.toLocaleString()}`, color: "border-rose-400" },
          { label: "Growth",           value: `+${summary.growth_pct}%`,              color: "border-green-400"  },
        ].map((card, i) => (
          <div
            key={card.label}
            className={`
              flex-1 min-w-[110px] bg-white rounded-xl shadow-sm border-l-4 ${card.color} p-3
              hover:shadow-md transition-all duration-300 hover:-translate-y-0.5
              ${animPhase >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
            `}
            style={{ transitionDelay: `${1400 + i * 150}ms` }}
          >
            <div className="text-xl font-bold text-[#3D2B1F]">{card.value}</div>
            <div className="text-xs text-[#7A5A48] mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineGraphStatistics;
