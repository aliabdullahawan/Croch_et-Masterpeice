/* ════════════════════════════════════════════════════════════════
   lib/order-store.ts
   LocalStorage-based order persistence.
   Stores both WhatsApp custom orders and cart-based orders.
   
   TODO: When Supabase is connected, replace each function body with:
     - saveCustomOrder → INSERT into custom_orders table
     - saveCartOrder   → INSERT into orders + order_items tables
     - get*Orders      → SELECT from respective tables
     - Real-time admin notifications via supabase.channel()
════════════════════════════════════════════════════════════════ */

/* ── Types ───────────────────────────────────────────────────── */
export interface CustomOrder {
  id:          string;
  type:        "custom";
  name:        string;
  phone:       string;
  email?:      string;
  category:    string;
  description: string;
  budget?:     string;
  deadline?:   string;
  imageNames?: string[];
  created_at:  string;
  status:      "new" | "reviewing" | "accepted" | "rejected";
}

export interface CartOrderItem {
  product_id:   string;
  product_name: string;
  quantity:     number;
  price:        number;
  image?:       string;
}

export interface CartOrder {
  id:           string;
  type:         "cart";
  customer_name:string;
  phone:        string;
  address:      string;
  email?:       string;
  items:        CartOrderItem[];
  total_amount: number;
  created_at:   string;
  status:       "pending" | "confirmed" | "in_progress" | "shipped" | "delivered" | "cancelled";
  notes?:       string;
}

/* ── Keys ────────────────────────────────────────────────────── */
const CUSTOM_KEY = "croch_custom_orders";
const CART_KEY   = "croch_cart_orders";

/* ── Custom Order (from WhatsApp form) ───────────────────────── */
export function saveCustomOrder(data: Omit<CustomOrder, "id" | "created_at" | "status">): CustomOrder {
  const order: CustomOrder = {
    ...data,
    id:         `cus-${Date.now()}`,
    created_at: new Date().toISOString(),
    status:     "new",
  };
  const existing = getCustomOrders();
  localStorage.setItem(CUSTOM_KEY, JSON.stringify([order, ...existing]));
  // Trigger notification for admin
  triggerAdminNotification(`New custom order from ${data.name}`, "order");
  return order;
}

export function getCustomOrders(): CustomOrder[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? "[]");
  } catch { return []; }
}

export function updateCustomOrderStatus(id: string, status: CustomOrder["status"]): void {
  const orders = getCustomOrders().map(o => o.id === id ? { ...o, status } : o);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(orders));
}

/* ── Cart Order (from cart checkout) ────────────────────────── */
export function saveCartOrder(data: Omit<CartOrder, "id" | "created_at" | "status">): CartOrder {
  const order: CartOrder = {
    ...data,
    id:         `ord-${Date.now()}`,
    created_at: new Date().toISOString(),
    status:     "pending",
  };
  const existing = getCartOrders();
  localStorage.setItem(CART_KEY, JSON.stringify([order, ...existing]));
  triggerAdminNotification(`New cart order from ${data.customer_name}`, "order");
  return order;
}

export function getCartOrders(): CartOrder[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch { return []; }
}

export function updateCartOrderStatus(id: string, status: CartOrder["status"]): void {
  const orders = getCartOrders().map(o => o.id === id ? { ...o, status } : o);
  localStorage.setItem(CART_KEY, JSON.stringify(orders));
}

/* ── Admin Notification trigger (localStorage queue) ─────────
   TODO: Replace with supabase.from('notifications').insert()
   and supabase.channel() realtime subscription in admin.
────────────────────────────────────────────────────────────── */
export function triggerAdminNotification(message: string, type: "order" | "info" | "warning"): void {
  try {
    const notifications = JSON.parse(localStorage.getItem("croch_admin_notifs") ?? "[]");
    notifications.unshift({ id: `n-${Date.now()}`, message, type, read: false, created_at: new Date().toISOString() });
    // Keep max 50 notifications
    localStorage.setItem("croch_admin_notifs", JSON.stringify(notifications.slice(0, 50)));
  } catch { /* noop */ }
}

export function getAdminNotifications(): Array<{ id: string; message: string; type: string; read: boolean; created_at: string }> {
  try {
    return JSON.parse(localStorage.getItem("croch_admin_notifs") ?? "[]");
  } catch { return []; }
}

export function markAllAdminNotificationsRead(): void {
  const n = getAdminNotifications().map(n => ({ ...n, read: true }));
  localStorage.setItem("croch_admin_notifs", JSON.stringify(n));
}

/* ── User-facing order status notifications ──────────────────
   When admin updates a cart order status, user sees a notification.
   TODO: Replace with Supabase Realtime channel subscription.
────────────────────────────────────────────────────────────── */
export function getUserNotifications(userId?: string): Array<{ id: string; message: string; type: string; read: boolean; created_at: string }> {
  try {
    const key = `croch_user_notifs_${userId ?? "guest"}`;
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch { return []; }
}

export function addUserNotification(message: string, type: "success" | "info" | "warning", userId?: string): void {
  const key = `croch_user_notifs_${userId ?? "guest"}`;
  const existing = getUserNotifications(userId);
  existing.unshift({ id: `un-${Date.now()}`, message, type, read: false, created_at: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(existing.slice(0, 30)));
}

export function markAllUserNotificationsRead(userId?: string): void {
  const key = `croch_user_notifs_${userId ?? "guest"}`;
  const n = getUserNotifications(userId).map(n => ({ ...n, read: true }));
  localStorage.setItem(key, JSON.stringify(n));
}
