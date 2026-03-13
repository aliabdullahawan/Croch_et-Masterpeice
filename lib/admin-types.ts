/* ══════════════════════════════════════════════════════════════════
   lib/admin-types.ts  —  Admin Panel specific TypeScript types
   These extend the base types in lib/types.ts for admin use-cases.
   When Supabase is connected, these will map to database row types.
══════════════════════════════════════════════════════════════════ */

import type { Category, Product, Profile } from "./types";

/* ── Re-export base types used in admin ─────────────────────────── */
export type { Category, Product, Profile };

/* ── Admin-specific Product (includes cost/margin tracking) ──────── */
export interface AdminProduct extends Product {
  cost:        number | null;   // purchase/production cost
  sku:         string | null;   // stock keeping unit code
  stock_qty:   number;          // inventory count
  // Derived client-side: (price - cost) / price * 100
  margin_pct?: number;
}

/* ── Order item line ──────────────────────────────────────────────── */
export interface OrderItem {
  id:         number;
  order_id:   string;
  product_id: string;
  quantity:   number;
  unit_price: number;           // price at time of order
  // Joined
  product?:   Pick<Product, "name" | "images" | "slug">;
}

/* ── Order ────────────────────────────────────────────────────────── */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id:            string;
  customer_id:   string | null;
  customer_name: string;        // denormalized for quick display
  customer_email:string | null;
  customer_phone:string | null;
  status:        OrderStatus;
  total_amount:  number;        // PKR
  item_count:    number;
  notes:         string | null;
  created_at:    string;
  updated_at:    string;
  // Joined
  items?:        OrderItem[];
  customer?:     Pick<Profile, "full_name" | "avatar_url">;
}

/* ── Extended Customer (admin view with aggregates) ──────────────── */
export interface AdminCustomer {
  id:            string;
  full_name:     string | null;
  email:         string | null;
  phone:         string | null;
  avatar_url:    string | null;
  order_count:   number;        // total orders placed
  total_spent:   number;        // total PKR spent
  last_order_at: string | null; // ISO date of last order
  created_at:    string;
}

/* ── Sales stat data point (for analytics charts) ────────────────── */
export interface SalesDataPoint {
  date:     string;   // display label e.g. "Jun 01"
  sales:    number;   // number of units sold
  revenue:  number;   // PKR revenue
}

/* ── Analytics summary card ──────────────────────────────────────── */
export interface AnalyticsSummary {
  total_sold:      number;
  total_revenue:   number;
  avg_order_value: number;
  growth_pct:      number;    // vs previous period
}

/* ── Category with product count (admin list view) ───────────────── */
export interface AdminCategory extends Category {
  product_count: number;
}

/* ── CSV export row type for analytics ───────────────────────────── */
export interface AnalyticsCsvRow {
  date:           string;
  sales:          number;
  revenue_pkr:    number;
  category?:      string;
  product_name?:  string;
}

/* ── Dashboard metric card ────────────────────────────────────────── */
export interface DashboardMetric {
  label:    string;
  value:    string;
  subtext?: string;
  icon:     string;    // lucide icon name (string ref)
  color:    "gold" | "teal" | "rose" | "green";
}
