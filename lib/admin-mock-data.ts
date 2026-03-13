/* ══════════════════════════════════════════════════════════════════
   lib/admin-mock-data.ts  —  Mock data for admin panel
   ──────────────────────────────────────────────────────────────────
   When ready to connect Supabase, replace each mock function body
   with the corresponding Supabase query (comment shows exact query).
   All returned shapes match the admin-types.ts interfaces.
══════════════════════════════════════════════════════════════════ */

import type {
  AdminProduct,
  AdminCategory,
  Order,
  AdminCustomer,
  SalesDataPoint,
  AnalyticsSummary,
  DashboardMetric,
  OrderStatus,
} from "./admin-types";

/* ────────────────────────────────────────────────────────────────
   CATEGORIES
──────────────────────────────────────────────────────────────── */

/** Fetch all categories with product counts.
 *
 * TODO: Supabase Integration
 * const { data } = await supabase
 *   .from('categories')
 *   .select('*, products(count)')
 *   .order('sort_order');
 * return data ?? [];
 */
export function getMockCategories(): AdminCategory[] {
  return [
    { id: 1, name: "Bags",        slug: "bags",        description: "Handcrafted crochet bags",      image_url: null, sort_order: 1, product_count: 8  },
    { id: 2, name: "Amigurumi",   slug: "amigurumi",   description: "Cute stuffed characters",       image_url: null, sort_order: 2, product_count: 12 },
    { id: 3, name: "Home Décor",  slug: "home-decor",  description: "Crochet home decorations",      image_url: null, sort_order: 3, product_count: 6  },
    { id: 4, name: "Accessories", slug: "accessories", description: "Wearable crochet accessories",  image_url: null, sort_order: 4, product_count: 9  },
    { id: 5, name: "Keychains",   slug: "keychains",   description: "Mini crochet keychains",        image_url: null, sort_order: 5, product_count: 15 },
    { id: 6, name: "Custom",      slug: "custom",      description: "Custom made-to-order items",    image_url: null, sort_order: 6, product_count: 3  },
  ];
}

/* ────────────────────────────────────────────────────────────────
   PRODUCTS
──────────────────────────────────────────────────────────────── */

/** Fetch all products for admin table.
 *
 * TODO: Supabase Integration
 * const { data } = await supabase
 *   .from('products')
 *   .select('*, category:categories(*)')
 *   .order('created_at', { ascending: false });
 * return data ?? [];
 */
export function getMockProducts(): AdminProduct[] {
  return [
    { id: "p1",  category_id: 1, name: "Boho Tote Bag",            slug: "boho-tote-bag",            description: "Large handwoven tote in natural beige with tassel details.", price: 2800, cost: 900,  sku: "BAG-001", stock_qty: 5,  is_custom: false, is_available: true,  is_featured: true,  images: ["https://picsum.photos/seed/boho-bag/800/800","https://picsum.photos/seed/boho-bag-2/800/800","https://picsum.photos/seed/boho-bag-3/800/800"], tags: ["bag","boho","tote"],         created_at: "2026-02-10T09:00:00Z" },
    { id: "p2",  category_id: 1, name: "Mini Crossbody Bag",        slug: "mini-crossbody-bag",        description: "Cute mini bag with adjustable strap.",                        price: 1800, cost: 600,  sku: "BAG-002", stock_qty: 8,  is_custom: false, is_available: true,  is_featured: false, images: ["https://picsum.photos/seed/crossbody/800/800","https://picsum.photos/seed/crossbody-2/800/800"], tags: ["bag","mini","crossbody"],     created_at: "2026-02-12T10:00:00Z" },
    { id: "p3",  category_id: 2, name: "Bunny Amigurumi",           slug: "bunny-amigurumi",           description: "Adorable handmade crochet bunny rabbit.",                     price: 1200, cost: 350,  sku: "AMI-001", stock_qty: 12, is_custom: false, is_available: true,  is_featured: true,  images: ["https://picsum.photos/seed/bunny-ami/600/600","https://picsum.photos/seed/bunny-ami-2/600/600"], tags: ["amigurumi","bunny","toy"],    created_at: "2026-02-14T11:00:00Z" },
    { id: "p4",  category_id: 2, name: "Bear Amigurumi",            slug: "bear-amigurumi",            description: "Soft crocheted teddy bear with bow tie.",                     price: 1400, cost: 400,  sku: "AMI-002", stock_qty: 7,  is_custom: false, is_available: true,  is_featured: false, images: ["https://picsum.photos/seed/bear-ami/600/600","https://picsum.photos/seed/bear-ami-2/600/600"], tags: ["amigurumi","bear","toy"],     created_at: "2026-02-15T12:00:00Z" },
    { id: "p5",  category_id: 3, name: "Macramé Wall Hanging",      slug: "macrame-wall-hanging",      description: "Boho-style wall art in cream and gold tones.",                price: 3500, cost: 1100, sku: "DEC-001", stock_qty: 3,  is_custom: false, is_available: true,  is_featured: true,  images: ["https://picsum.photos/seed/wall-hang/800/600","https://picsum.photos/seed/wall-hang-2/800/600"], tags: ["home","decor","wall"],        created_at: "2026-02-16T13:00:00Z" },
    { id: "p6",  category_id: 3, name: "Crochet Plant Pot Cover",   slug: "plant-pot-cover",           description: "Stretchy cover for standard terracotta pots.",                price: 850,  cost: 200,  sku: "DEC-002", stock_qty: 20, is_custom: false, is_available: true,  is_featured: false, images: ["https://picsum.photos/seed/plant-pot/600/600"], tags: ["home","plant","cover"],       created_at: "2026-02-17T14:00:00Z" },
    { id: "p7",  category_id: 4, name: "Flower Hair Clip Set",      slug: "flower-hair-clip-set",      description: "Set of 3 crochet flower hair clips.",                         price: 650,  cost: 180,  sku: "ACC-001", stock_qty: 25, is_custom: false, is_available: true,  is_featured: false, images: ["https://picsum.photos/seed/hair-clips/600/600","https://picsum.photos/seed/hair-clips-2/600/600"], tags: ["accessory","hair","flowers"], created_at: "2026-02-18T09:00:00Z" },
    { id: "p8",  category_id: 4, name: "Crochet Headband",          slug: "crochet-headband",          description: "Wide ribbed headband in various colors.",                     price: 750,  cost: 200,  sku: "ACC-002", stock_qty: 18, is_custom: false, is_available: true,  is_featured: false, images: ["https://picsum.photos/seed/headband/600/600"], tags: ["accessory","headband"],        created_at: "2026-02-19T10:00:00Z" },
    { id: "p9",  category_id: 5, name: "Strawberry Keychain",       slug: "strawberry-keychain",       description: "Mini crocheted strawberry keychain, very popular!",          price: 300,  cost: 70,   sku: "KEY-001", stock_qty: 50, is_custom: false, is_available: true,  is_featured: true,  images: ["https://picsum.photos/seed/strawberry-kc/600/600","https://picsum.photos/seed/strawberry-kc-2/600/600"], tags: ["keychain","strawberry","mini"], created_at: "2026-02-20T11:00:00Z" },
    { id: "p10", category_id: 5, name: "Ghost Keychain",            slug: "ghost-keychain",            description: "Spooky but cute ghost keychain.",                            price: 300,  cost: 70,   sku: "KEY-002", stock_qty: 40, is_custom: false, is_available: true,  is_featured: false, images: ["https://picsum.photos/seed/ghost-kc/600/600"], tags: ["keychain","ghost","halloween"], created_at: "2026-02-21T12:00:00Z" },
    { id: "p11", category_id: 6, name: "Custom Baby Set",           slug: "custom-baby-set",           description: "Made-to-order baby hat and booties set.",                    price: 2200, cost: 700,  sku: "CUS-001", stock_qty: 0,  is_custom: true,  is_available: true,  is_featured: false, images: ["https://picsum.photos/seed/baby-set/600/600"], tags: ["custom","baby","set"],          created_at: "2026-02-22T13:00:00Z" },
    { id: "p12", category_id: 1, name: "Market Bag",                slug: "market-bag",                description: "Open-weave reusable shopping market bag.",                   price: 1500, cost: 450,  sku: "BAG-003", stock_qty: 10, is_custom: false, is_available: true,  is_featured: false, images: ["https://picsum.photos/seed/market-bag/800/800","https://picsum.photos/seed/market-bag-2/800/800"], tags: ["bag","market","reusable"],     created_at: "2026-02-23T14:00:00Z" },
  ];
}

/* ────────────────────────────────────────────────────────────────
   ORDERS
──────────────────────────────────────────────────────────────── */

/** Fetch all orders.
 *
 * TODO: Supabase Integration
 * const { data } = await supabase
 *   .from('orders')
 *   .select('*, items:order_items(*, product:products(name,images,slug))')
 *   .order('created_at', { ascending: false });
 * return data ?? [];
 */
export function getMockOrders(): Order[] {
  return [
    { id: "ord-001", customer_id: "cust-1", customer_name: "Aisha Khan",    customer_email: "aisha@example.pk",   customer_phone: "+92-300-1234567", status: "delivered",   total_amount: 4600, item_count: 2, notes: null,                  created_at: "2026-02-20T10:00:00Z", updated_at: "2026-02-22T14:00:00Z" },
    { id: "ord-002", customer_id: "cust-2", customer_name: "Sara Ali",      customer_email: "sara@example.pk",    customer_phone: "+92-321-7654321", status: "in_progress", total_amount: 3500, item_count: 1, notes: "Gift wrap please",      created_at: "2026-02-25T11:00:00Z", updated_at: "2026-02-25T11:00:00Z" },
    { id: "ord-003", customer_id: "cust-3", customer_name: "Maryam Riaz",   customer_email: null,                 customer_phone: "+92-333-9876543", status: "pending",     total_amount: 1800, item_count: 3, notes: null,                  created_at: "2026-03-01T09:30:00Z", updated_at: "2026-03-01T09:30:00Z" },
    { id: "ord-004", customer_id: "cust-4", customer_name: "Fatima Noor",   customer_email: "fatima@example.com", customer_phone: "+92-311-1112222", status: "confirmed",   total_amount: 2800, item_count: 1, notes: null,                  created_at: "2026-03-02T14:00:00Z", updated_at: "2026-03-02T15:00:00Z" },
    { id: "ord-005", customer_id: "cust-5", customer_name: "Zara Sheikh",   customer_email: "zara@example.com",   customer_phone: "+92-300-5556666", status: "cancelled",   total_amount: 1200, item_count: 1, notes: "Customer requested cancel", created_at: "2026-03-03T16:00:00Z", updated_at: "2026-03-04T10:00:00Z" },
    { id: "ord-006", customer_id: "cust-1", customer_name: "Aisha Khan",    customer_email: "aisha@example.pk",   customer_phone: "+92-300-1234567", status: "pending",     total_amount: 600,  item_count: 2, notes: null,                  created_at: "2026-03-05T08:00:00Z", updated_at: "2026-03-05T08:00:00Z" },
    { id: "ord-007", customer_id: "cust-6", customer_name: "Hina Baig",     customer_email: "hina@example.com",   customer_phone: "+92-322-4445555", status: "shipped",     total_amount: 5600, item_count: 3, notes: "Express delivery",      created_at: "2026-03-06T12:00:00Z", updated_at: "2026-03-07T08:00:00Z" },
    { id: "ord-008", customer_id: "cust-7", customer_name: "Nadia Ahmed",   customer_email: "nadia@example.com",  customer_phone: "+92-345-7778888", status: "pending",     total_amount: 1500, item_count: 1, notes: null,                  created_at: "2026-03-07T02:00:00Z", updated_at: "2026-03-07T02:00:00Z" },
  ];
}

/* ────────────────────────────────────────────────────────────────
   CUSTOMERS
──────────────────────────────────────────────────────────────── */

/** Fetch all customers with aggregated order stats.
 *
 * TODO: Supabase Integration
 * const { data } = await supabase
 *   .from('profiles')
 *   .select('*, orders(total_amount, created_at)')
 *   .eq('role', 'customer')
 *   .order('created_at', { ascending: false });
 * // Then aggregate order_count and total_spent client-side or via DB function
 */
export function getMockCustomers(): AdminCustomer[] {
  return [
    { id: "cust-1", full_name: "Aisha Khan",   email: "aisha@example.pk",    phone: "+92-300-1234567", avatar_url: null, order_count: 2,  total_spent: 5200,  last_order_at: "2026-03-05T08:00:00Z", created_at: "2026-02-10T09:00:00Z" },
    { id: "cust-2", full_name: "Sara Ali",      email: "sara@example.pk",     phone: "+92-321-7654321", avatar_url: null, order_count: 1,  total_spent: 3500,  last_order_at: "2026-02-25T11:00:00Z", created_at: "2026-02-15T10:00:00Z" },
    { id: "cust-3", full_name: "Maryam Riaz",   email: null,                  phone: "+92-333-9876543", avatar_url: null, order_count: 1,  total_spent: 1800,  last_order_at: "2026-03-01T09:30:00Z", created_at: "2026-02-20T11:00:00Z" },
    { id: "cust-4", full_name: "Fatima Noor",   email: "fatima@example.com",  phone: "+92-311-1112222", avatar_url: null, order_count: 1,  total_spent: 2800,  last_order_at: "2026-03-02T14:00:00Z", created_at: "2026-02-22T12:00:00Z" },
    { id: "cust-5", full_name: "Zara Sheikh",   email: "zara@example.com",    phone: "+92-300-5556666", avatar_url: null, order_count: 1,  total_spent: 0,     last_order_at: "2026-03-03T16:00:00Z", created_at: "2026-02-24T13:00:00Z" },
    { id: "cust-6", full_name: "Hina Baig",     email: "hina@example.com",    phone: "+92-322-4445555", avatar_url: null, order_count: 1,  total_spent: 5600,  last_order_at: "2026-03-06T12:00:00Z", created_at: "2026-03-01T14:00:00Z" },
    { id: "cust-7", full_name: "Nadia Ahmed",   email: "nadia@example.com",   phone: "+92-345-7778888", avatar_url: null, order_count: 1,  total_spent: 1500,  last_order_at: "2026-03-07T02:00:00Z", created_at: "2026-03-05T15:00:00Z" },
  ];
}

/* ────────────────────────────────────────────────────────────────
   ANALYTICS — SALES DATA POINTS
──────────────────────────────────────────────────────────────── */

/** Fetch daily sales data for a given period.
 *
 * TODO: Supabase Integration
 * const { data } = await supabase
 *   .from('orders')
 *   .select('created_at, total_amount, item_count')
 *   .gte('created_at', periodStart.toISOString())
 *   .eq('status', 'delivered')  // or include other settled statuses
 *   .order('created_at');
 * // Then group by date client-side
 */
export function getMockSalesData(period: "7d" | "30d" | "3m"): SalesDataPoint[] {
  // 7-day data
  if (period === "7d") {
    return [
      { date: "Mar 01", sales: 3,  revenue: 7200  },
      { date: "Mar 02", sales: 5,  revenue: 12400 },
      { date: "Mar 03", sales: 2,  revenue: 4600  },
      { date: "Mar 04", sales: 7,  revenue: 18500 },
      { date: "Mar 05", sales: 4,  revenue: 9800  },
      { date: "Mar 06", sales: 9,  revenue: 22000 },
      { date: "Mar 07", sales: 6,  revenue: 14400 },
    ];
  }

  // 30-day data
  if (period === "30d") {
    return [
      { date: "Feb 06", sales: 2,  revenue: 5100  },
      { date: "Feb 08", sales: 4,  revenue: 9200  },
      { date: "Feb 10", sales: 3,  revenue: 7500  },
      { date: "Feb 12", sales: 6,  revenue: 16400 },
      { date: "Feb 14", sales: 8,  revenue: 19800 },
      { date: "Feb 16", sales: 5,  revenue: 12200 },
      { date: "Feb 18", sales: 7,  revenue: 17600 },
      { date: "Feb 20", sales: 4,  revenue: 10400 },
      { date: "Feb 22", sales: 9,  revenue: 23100 },
      { date: "Feb 24", sales: 6,  revenue: 14800 },
      { date: "Feb 26", sales: 11, revenue: 28700 },
      { date: "Feb 28", sales: 8,  revenue: 19200 },
      { date: "Mar 01", sales: 3,  revenue: 7200  },
      { date: "Mar 03", sales: 5,  revenue: 12400 },
      { date: "Mar 05", sales: 9,  revenue: 22000 },
      { date: "Mar 07", sales: 6,  revenue: 14400 },
    ];
  }

  // 3-month data
  return [
    { date: "Jan 01", sales: 3,  revenue: 6500  },
    { date: "Jan 05", sales: 5,  revenue: 11200 },
    { date: "Jan 10", sales: 4,  revenue: 8900  },
    { date: "Jan 15", sales: 7,  revenue: 16400 },
    { date: "Jan 20", sales: 6,  revenue: 14200 },
    { date: "Jan 25", sales: 9,  revenue: 21800 },
    { date: "Jan 31", sales: 8,  revenue: 19600 },
    { date: "Feb 05", sales: 5,  revenue: 12100 },
    { date: "Feb 10", sales: 10, revenue: 24800 },
    { date: "Feb 15", sales: 12, revenue: 29400 },
    { date: "Feb 20", sales: 9,  revenue: 22000 },
    { date: "Feb 25", sales: 14, revenue: 35200 },
    { date: "Mar 01", sales: 11, revenue: 27600 },
    { date: "Mar 05", sales: 15, revenue: 38400 },
    { date: "Mar 07", sales: 6,  revenue: 14400 },
  ];
}

/** Fetch analytics summary totals.
 *
 * TODO: Supabase Integration
 * Use Supabase .rpc('get_analytics_summary', { period }) for aggregated stats,
 * or compute via multiple .select('total_amount.sum()') queries.
 */
export function getMockAnalyticsSummary(period: "7d" | "30d" | "3m"): AnalyticsSummary {
  const map: Record<string, AnalyticsSummary> = {
    "7d":  { total_sold: 36,  total_revenue: 88900,  avg_order_value: 2469, growth_pct: 18  },
    "30d": { total_sold: 116, total_revenue: 278300, avg_order_value: 2399, growth_pct: 12  },
    "3m":  { total_sold: 254, total_revenue: 591800, avg_order_value: 2330, growth_pct: 42  },
  };
  return map[period];
}

/* ────────────────────────────────────────────────────────────────
   DASHBOARD METRICS
──────────────────────────────────────────────────────────────── */

/** Get top-level dashboard metrics.
 *
 * TODO: Supabase Integration
 * Aggregate from orders table: SUM(total_amount), COUNT(*), etc.
 */
export function getMockDashboardMetrics(): DashboardMetric[] {
  return [
    { label: "Products Sold",   value: "254",        subtext: "All time",           icon: "ShoppingBag",  color: "gold"  },
    { label: "Total Revenue",   value: "₨5,91,800",  subtext: "All time",           icon: "TrendingUp",   color: "teal"  },
    { label: "Active Customers",value: "7",          subtext: "Registered buyers",  icon: "Users",        color: "rose"  },
    { label: "Pending Orders",  value: "3",          subtext: "Need attention",     icon: "Clock",        color: "green" },
  ];
}

/* ────────────────────────────────────────────────────────────────
   HELPER — Order status color mapping
──────────────────────────────────────────────────────────────── */
export function getOrderStatusColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending:     "bg-amber-100 text-amber-800",
    confirmed:   "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    shipped:     "bg-teal-100 text-teal-800",
    delivered:   "bg-green-100 text-green-800",
    cancelled:   "bg-red-100 text-red-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

/** Format PKR currency */
export function formatPKR(amount: number): string {
  return `₨${amount.toLocaleString("en-PK")}`;
}

/** Download data as CSV file */
export function downloadCSV(data: object[], filename: string): void {
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
