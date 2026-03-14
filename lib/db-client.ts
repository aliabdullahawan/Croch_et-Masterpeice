import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Product, Review } from "@/lib/types";
import type { AdminProduct, Order, OrderStatus, DashboardMetric } from "@/lib/admin-types";

const db = supabase as any;
let lastAdminDbError: string | null = null;

function setLastAdminDbError(error: unknown, context: string): void {
  const message = typeof error === "object" && error && "message" in (error as Record<string, unknown>)
    ? String((error as { message?: unknown }).message)
    : "Unknown database error.";
  lastAdminDbError = `${context}: ${message}`;
}

export function getLastAdminDbError(): string | null {
  return lastAdminDbError;
}

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

interface ProductImageRow {
  file_name?: string | null;
  mime_type?: string | null;
  image_bytes?: string | null;
  sort_order: number;
}

interface ProductRow {
  id: string;
  category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  cost: number | null;
  sku: string | null;
  stock_qty: number;
  is_custom: boolean;
  is_available: boolean;
  is_featured: boolean;
  created_at: string;
  category?: CategoryRow | null;
  product_images?: ProductImageRow[] | null;
}

interface OrderItemRow {
  quantity: number;
}

interface OrderRow {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItemRow[] | null;
}

export interface AdminNotificationItem {
  id: string;
  message: string;
  type: "order" | "info" | "warning";
  read: boolean;
  created_at: string;
}

export interface SiteNotificationItem {
  id: string;
  event_type: "product_new" | "order_high_value" | "review_5star";
  title: string;
  message: string;
  created_at: string;
}

export interface UserOrderSummary {
  id: string;
  status: OrderStatus;
  total_amount: number;
  item_count: number;
  created_at: string;
}

export interface CustomOrderRow {
  id: string;
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  category: string | null;
  description: string;
  budget_text: string | null;
  deadline_text: string | null;
  status: "new" | "reviewing" | "accepted" | "rejected" | "in_progress" | "completed" | "cancelled";
  created_at: string;
}

export interface AdminCustomerRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  order_count: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
}

export interface AdminCustomerOption {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
}

export interface AnalyticsPoint {
  date: string;
  sales: number;
  revenue: number;
}

export interface AnalyticsSummaryData {
  total_sold: number;
  total_revenue: number;
  avg_order_value: number;
  growth_pct: number;
}

export interface HomeReviewItem {
  id: string;
  rating: number;
  body: string;
  customer_name: string;
  product_name: string;
  product_slug: string;
  created_at: string;
}

interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  created_at: string;
  profile?: { full_name?: string | null; avatar_url?: string | null } | null;
}

interface CategoryImageRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_mime_type: string | null;
  image_bytes: string | null;
}

function byteaHexToDataUrl(value: string, mimeType: string): string {
  const hex = value.startsWith("\\x") ? value.slice(2) : value;
  if (hex.length === 0) {
    return "";
  }

  let binary = "";
  for (let i = 0; i < hex.length; i += 2) {
    const byte = Number.parseInt(hex.slice(i, i + 2), 16);
    binary += String.fromCharCode(byte);
  }

  const base64 = btoa(binary);
  return `data:${mimeType};base64,${base64}`;
}

const PRODUCT_IMAGE_BUCKET = process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BUCKET || "crochet-art";

function resolveProductImageUrl(img: ProductImageRow): string {
  const fileName = String(img.file_name ?? "").trim();
  if (fileName) {
    if (/^(https?:)?\/\//i.test(fileName) || fileName.startsWith("data:")) {
      return fileName;
    }

    // Accept both "path/to/file" and "bucket/path/to/file" persisted variants.
    let objectPath = fileName.replace(/^\/+/, "");
    if (objectPath.toLowerCase().startsWith(`${PRODUCT_IMAGE_BUCKET.toLowerCase()}/`)) {
      objectPath = objectPath.slice(PRODUCT_IMAGE_BUCKET.length + 1);
    }

    const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(objectPath);
    if (data?.publicUrl) {
      return data.publicUrl;
    }
  }

  if (img.image_bytes && img.mime_type) {
    return byteaHexToDataUrl(img.image_bytes, img.mime_type);
  }

  return "";
}

function base64DataUrlToByteaHex(dataUrl: string): { mimeType: string; byteaHex: string; sizeBytes: number } {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image format.");
  }

  const mimeType = match[1];
  const base64 = match[2];
  const binary = atob(base64);
  let hex = "";
  for (let i = 0; i < binary.length; i += 1) {
    hex += binary.charCodeAt(i).toString(16).padStart(2, "0");
  }

  return {
    mimeType,
    byteaHex: `\\x${hex}`,
    sizeBytes: binary.length,
  };
}

function getFileExtensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
    "image/svg+xml": "svg",
  };
  return map[mimeType.toLowerCase()] ?? "bin";
}

async function uploadProductImageToStorage(productId: string, imageDataUrl: string, index: number): Promise<string> {
  const parsed = base64DataUrlToByteaHex(imageDataUrl);
  const extension = getFileExtensionFromMime(parsed.mimeType);
  const fileName = `products/${productId}/${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const blob = await fetch(imageDataUrl).then((response) => response.blob());

  const uploadResult = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(fileName, blob, {
    contentType: parsed.mimeType,
    upsert: false,
  });

  if (uploadResult.error) {
    throw new Error(uploadResult.error.message ?? "Storage upload failed.");
  }

  return fileName;
}

function mapProduct(row: ProductRow): Product {
  const images = (row.product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => resolveProductImageUrl(img))
    .filter(Boolean);

  return {
    id: row.id,
    category_id: row.category_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    stock_qty: row.stock_qty,
    is_custom: row.is_custom,
    is_available: row.is_available,
    is_featured: row.is_featured,
    images,
    tags: [],
    created_at: row.created_at,
    category: row.category
      ? {
          id: row.category.id,
          name: row.category.name,
          slug: row.category.slug,
          description: row.category.description,
          sort_order: row.category.sort_order,
        }
      : undefined,
  };
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    customer_id: row.customer_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    status: row.status,
    total_amount: Number(row.total_amount ?? 0),
    item_count: (row.order_items ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function fetchProducts(options?: { featuredOnly?: boolean }): Promise<Product[]> {
  lastAdminDbError = null;
  if (!isSupabaseConfigured) {
    lastAdminDbError = "Supabase is not configured.";
    return [];
  }

  let query = db
    .from("products")
    .select("id, category_id, name, slug, description, price, cost, sku, stock_qty, is_custom, is_available, is_featured, created_at, category:categories(id,name,slug,description,sort_order), product_images(file_name,mime_type,image_bytes,sort_order)")
    .order("created_at", { ascending: false });

  if (options?.featuredOnly) {
    query = query.eq("is_featured", true).eq("is_available", true);
  }

  const { data, error } = await query;
  if (!error && data) {
    return (data as unknown as ProductRow[]).map(mapProduct);
  }

  setLastAdminDbError(error, "Could not load products with related category/images");

  // Fallback: load products without joins so storefront still works.
  let baseQuery = db
    .from("products")
    .select("id, category_id, name, slug, description, price, cost, sku, stock_qty, is_custom, is_available, is_featured, created_at")
    .order("created_at", { ascending: false });

  if (options?.featuredOnly) {
    baseQuery = baseQuery.eq("is_featured", true).eq("is_available", true);
  }

  const { data: baseData, error: baseError } = await baseQuery;
  if (baseError || !baseData) {
    if (baseError) {
      setLastAdminDbError(baseError, "Could not load products");
    }
    return [];
  }

  const { data: categoryRows } = await db.from("categories").select("id,name,slug,description,sort_order");
  const categoryMap = new Map<number, CategoryRow>();
  for (const category of (categoryRows ?? []) as CategoryRow[]) {
    categoryMap.set(category.id, category);
  }

  return (baseData as unknown as ProductRow[]).map((row) =>
    mapProduct({
      ...row,
      category: row.category_id ? (categoryMap.get(row.category_id) ?? null) : null,
      product_images: [],
    })
  );
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await db
    .from("products")
    .select("id, category_id, name, slug, description, price, cost, sku, stock_qty, is_custom, is_available, is_featured, created_at, category:categories(id,name,slug,description,sort_order), product_images(file_name,mime_type,image_bytes,sort_order)")
    .eq("slug", slug)
    .maybeSingle();

  if (!error && data) {
    return mapProduct(data as unknown as ProductRow);
  }

  const { data: baseData, error: baseError } = await db
    .from("products")
    .select("id, category_id, name, slug, description, price, cost, sku, stock_qty, is_custom, is_available, is_featured, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!baseError && baseData) {
    return mapProduct({ ...(baseData as ProductRow), category: null, product_images: [] });
  }

  const { data: byIdData, error: byIdError } = await db
    .from("products")
    .select("id, category_id, name, slug, description, price, cost, sku, stock_qty, is_custom, is_available, is_featured, created_at, category:categories(id,name,slug,description,sort_order), product_images(file_name,mime_type,image_bytes,sort_order)")
    .eq("id", slug)
    .maybeSingle();

  if (!byIdError && byIdData) {
    return mapProduct(byIdData as unknown as ProductRow);
  }

  return null;
}

export async function fetchHomeReviews(limit = 8): Promise<HomeReviewItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await db
    .from("reviews")
    .select("id, rating, body, created_at, user_id, product_id")
    .eq("is_approved", true)
    .not("body", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  const reviewRows = data as Array<Record<string, unknown>>;
  const userIds = Array.from(new Set(reviewRows.map((row) => String(row.user_id ?? "")).filter(Boolean)));
  const productIds = Array.from(new Set(reviewRows.map((row) => String(row.product_id ?? "")).filter(Boolean)));

  const [profilesResult, productsResult] = await Promise.all([
    userIds.length > 0
      ? db.from("profiles").select("id,full_name").in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
    productIds.length > 0
      ? db.from("products").select("id,name,slug").in("id", productIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const profileMap = new Map<string, string>();
  if (profilesResult.data) {
    for (const row of profilesResult.data as Array<Record<string, unknown>>) {
      profileMap.set(String(row.id), String(row.full_name ?? "").trim() || "Customer");
    }
  }

  const productMap = new Map<string, { name: string; slug: string }>();
  if (productsResult.data) {
    for (const row of productsResult.data as Array<Record<string, unknown>>) {
      const id = String(row.id ?? "");
      const name = String(row.name ?? "").trim();
      const slug = String(row.slug ?? "").trim();
      if (id && name && slug) {
        productMap.set(id, { name, slug });
      }
    }
  }

  return reviewRows
    .map((row) => {
      const body = typeof row.body === "string" ? row.body.trim() : "";
      const product = productMap.get(String(row.product_id ?? ""));
      const productName = product?.name ?? "";
      const productSlug = product?.slug ?? "";
      if (!body || !productName || !productSlug) {
        return null;
      }

      return {
        id: String(row.id),
        rating: Number(row.rating ?? 0),
        body,
        customer_name: profileMap.get(String(row.user_id ?? "")) ?? "Customer",
        product_name: productName,
        product_slug: productSlug,
        created_at: String(row.created_at ?? ""),
      } satisfies HomeReviewItem;
    })
    .filter((item): item is HomeReviewItem => Boolean(item));
}

export async function fetchApprovedReviews(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await db
    .from("reviews")
    .select("id, product_id, user_id, rating, title, body, is_approved, created_at")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  const rows = data as Array<Record<string, unknown>>;
  const userIds = Array.from(new Set(rows.map((row) => String(row.user_id ?? "")).filter(Boolean)));
  const profilesResult = userIds.length > 0
    ? await db.from("profiles").select("id,full_name,avatar_url").in("id", userIds)
    : { data: [], error: null };

  const profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
  if (profilesResult.data) {
    for (const row of profilesResult.data as Array<Record<string, unknown>>) {
      profileMap.set(String(row.id), {
        full_name: (row.full_name as string | null) ?? null,
        avatar_url: (row.avatar_url as string | null) ?? null,
      });
    }
  }

  return rows.map((row) => ({
    id: String(row.id ?? ""),
    product_id: String(row.product_id ?? ""),
    user_id: String(row.user_id ?? ""),
    rating: Number(row.rating ?? 0),
    title: typeof row.title === "string" ? row.title : null,
    body: typeof row.body === "string" ? row.body : null,
    is_approved: Boolean(row.is_approved),
    created_at: String(row.created_at ?? ""),
    images: [],
    profile: profileMap.get(String(row.user_id ?? ""))
      ? {
          full_name: profileMap.get(String(row.user_id ?? ""))?.full_name ?? null,
          avatar_url: profileMap.get(String(row.user_id ?? ""))?.avatar_url ?? null,
        }
      : undefined,
  }));
}

export async function submitReview(input: { productId: string; userId: string; rating: number; body: string }): Promise<{ ok: boolean; message?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const payload = {
    product_id: input.productId,
    user_id: input.userId,
    rating: input.rating,
    body: input.body,
    is_approved: true,
  };

  const insertResult = await db.from("reviews").insert(payload).select("id").maybeSingle();
  if (!insertResult.error) {
    return { ok: true };
  }

  const insertMessage = String(insertResult.error.message ?? "").toLowerCase();
  const isDuplicate = insertMessage.includes("duplicate key") || insertMessage.includes("unique") || insertMessage.includes("reviews_product_id_user_id_key");
  if (!isDuplicate) {
    return { ok: false, message: insertResult.error.message };
  }

  const updateResult = await db
    .from("reviews")
    .update({
      rating: input.rating,
      body: input.body,
      is_approved: true,
      updated_at: new Date().toISOString(),
    })
    .eq("product_id", input.productId)
    .eq("user_id", input.userId);

  if (updateResult.error) {
    return { ok: false, message: updateResult.error.message };
  }

  return { ok: true };
}

export async function fetchAdminOrders(status?: OrderStatus): Promise<Order[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  let query = db
    .from("orders")
    .select("id, customer_id, customer_name, customer_email, customer_phone, status, total_amount, notes, created_at, updated_at, order_items(quantity)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error || !data) {
    return [];
  }

  return (data as unknown as OrderRow[]).map(mapOrder);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  const { error } = await db.from("orders").update({ status }).eq("id", orderId);
  return !error;
}

export async function fetchCustomOrders(): Promise<CustomOrderRow[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await db
    .from("custom_orders")
    .select("id, user_id, customer_name, customer_phone, customer_email, category, description, budget_text, deadline_text, status, created_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as unknown as CustomOrderRow[];
}

export async function updateCustomOrderStatus(orderId: string, status: CustomOrderRow["status"]): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  const { error } = await db.from("custom_orders").update({ status }).eq("id", orderId);
  return !error;
}

export async function createCustomOrder(input: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  category: string;
  description: string;
  budget_text?: string;
  deadline_text?: string;
  images?: string[];
}): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  const { data: inserted, error } = await db
    .from("custom_orders")
    .insert({
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_email: input.customer_email ?? null,
      category: input.category,
      description: input.description,
      budget_text: input.budget_text ?? null,
      deadline_text: input.deadline_text ?? null,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return false;
  }

  if (input.images && input.images.length > 0) {
    const imageRows = input.images.map((img, index) => {
      const parsed = base64DataUrlToByteaHex(img);
      return {
        custom_order_id: inserted.id,
        mime_type: parsed.mimeType,
        image_bytes: parsed.byteaHex,
        size_bytes: parsed.sizeBytes,
        sort_order: index,
      };
    });

    const imageInsert = await db.from("custom_order_images").insert(imageRows);
    if (imageInsert.error) {
      return false;
    }
  }

  return true;
}

export async function fetchAdminCustomerOptions(): Promise<AdminCustomerOption[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const [profilesResult, ordersResult] = await Promise.all([
    db.from("profiles").select("id,full_name,phone,role"),
    db.from("orders").select("customer_id,customer_name,customer_phone,customer_email").order("created_at", { ascending: false }).limit(300),
  ]);

  const byId = new Map<string, AdminCustomerOption>();

  if (profilesResult.data) {
    for (const row of profilesResult.data as Array<Record<string, unknown>>) {
      const role = String(row.role ?? "customer");
      if (role !== "customer") {
        continue;
      }

      const id = String(row.id ?? "");
      if (!id) {
        continue;
      }

      byId.set(id, {
        id,
        full_name: String(row.full_name ?? "").trim() || "Customer",
        phone: String(row.phone ?? "").trim(),
        email: null,
      });
    }
  }

  if (ordersResult.data) {
    for (const row of ordersResult.data as Array<Record<string, unknown>>) {
      const customerId = String(row.customer_id ?? "").trim();
      if (!customerId) {
        continue;
      }

      const existing = byId.get(customerId) ?? {
        id: customerId,
        full_name: "Customer",
        phone: "",
        email: null,
      };

      const orderName = String(row.customer_name ?? "").trim();
      const orderPhone = String(row.customer_phone ?? "").trim();
      const orderEmail = String(row.customer_email ?? "").trim();

      byId.set(customerId, {
        id: customerId,
        full_name: orderName || existing.full_name,
        phone: orderPhone || existing.phone,
        email: orderEmail || existing.email,
      });
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export async function createAdminCustomOrder(input: {
  user_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  category?: string | null;
  description: string;
  budget_text?: string | null;
  deadline_text?: string | null;
  status?: CustomOrderRow["status"];
}): Promise<{ ok: boolean; id?: string; message?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const payload = {
    user_id: input.user_id ?? null,
    customer_name: input.customer_name.trim(),
    customer_phone: input.customer_phone.trim(),
    customer_email: (input.customer_email ?? "").trim() || null,
    category: (input.category ?? "").trim() || null,
    description: input.description.trim(),
    budget_text: (input.budget_text ?? "").trim() || null,
    deadline_text: (input.deadline_text ?? "").trim() || null,
    status: input.status ?? "new",
  };

  const { data, error } = await db
    .from("custom_orders")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Could not create custom order." };
  }

  return { ok: true, id: String(data.id) };
}

export async function fetchAdminNotifications(): Promise<AdminNotificationItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const [ordersResult, customResult] = await Promise.all([
    db
      .from("orders")
      .select("id, customer_name, status, created_at")
      .in("status", ["pending", "confirmed", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(10),
    db
      .from("custom_orders")
      .select("id, customer_name, status, created_at")
      .in("status", ["new", "reviewing"])
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const items: AdminNotificationItem[] = [];

  if (ordersResult.data) {
    for (const order of ordersResult.data as Array<Record<string, unknown>>) {
      items.push({
        id: `order-${String(order.id)}`,
        message: `Order from ${String(order.customer_name)} is ${String(order.status).replace("_", " ")}`,
        type: "order",
        read: false,
        created_at: String(order.created_at),
      });
    }
  }

  if (customResult.data) {
    for (const order of customResult.data as Array<Record<string, unknown>>) {
      items.push({
        id: `custom-${String(order.id)}`,
        message: `Custom order from ${String(order.customer_name)} is ${String(order.status)}`,
        type: "info",
        read: false,
        created_at: String(order.created_at),
      });
    }
  }

  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function fetchSiteNotifications(limit = 8): Promise<SiteNotificationItem[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await db
    .from("site_notifications")
    .select("id, event_type, title, message, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    event_type: String(row.event_type) as SiteNotificationItem["event_type"],
    title: String(row.title ?? "Update"),
    message: String(row.message ?? ""),
    created_at: String(row.created_at),
  }));
}

export async function fetchUserOrders(userId: string): Promise<UserOrderSummary[]> {
  if (!isSupabaseConfigured || !userId) {
    return [];
  }

  const { data, error } = await db
    .from("orders")
    .select("id, status, total_amount, created_at, order_items(quantity)")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as unknown as Array<Record<string, unknown>>).map((row) => {
    const items = Array.isArray(row.order_items)
      ? (row.order_items as Array<{ quantity?: number }>).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)
      : 0;

    return {
      id: String(row.id),
      status: String(row.status) as OrderStatus,
      total_amount: Number(row.total_amount ?? 0),
      item_count: items,
      created_at: String(row.created_at),
    };
  });
}

export async function fetchUserNotifications(userId: string): Promise<AdminNotificationItem[]> {
  if (!isSupabaseConfigured || !userId) {
    return [];
  }

  const [ordersResult, customResult] = await Promise.all([
    db
      .from("orders")
      .select("id, status, created_at")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
    db
      .from("custom_orders")
      .select("id, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const items: AdminNotificationItem[] = [];

  if (ordersResult.data) {
    for (const order of ordersResult.data as Array<Record<string, unknown>>) {
      items.push({
        id: `order-${String(order.id)}`,
        message: `Order ${String(order.id).slice(0, 8)} is ${String(order.status).replace("_", " ")}.`,
        type: "order",
        read: false,
        created_at: String(order.created_at),
      });
    }
  }

  if (customResult.data) {
    for (const order of customResult.data as Array<Record<string, unknown>>) {
      items.push({
        id: `custom-${String(order.id)}`,
        message: `Custom order ${String(order.id).slice(0, 8)} is ${String(order.status).replace("_", " ")}.`,
        type: "info",
        read: false,
        created_at: String(order.created_at),
      });
    }
  }

  return items
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 12);
}

export async function fetchAdminDashboardData(): Promise<{ metrics: DashboardMetric[]; recentOrders: Order[]; customOrders: CustomOrderRow[] }> {
  const [orders, customOrders] = await Promise.all([fetchAdminOrders(), fetchCustomOrders()]);

  const productsSold = orders.reduce((sum, order) => sum + order.item_count, 0);
  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const pendingOrders = orders.filter((order) => order.status === "pending").length;

  const customerIds = new Set<string>();
  for (const order of orders) {
    if (order.customer_id) {
      customerIds.add(order.customer_id);
    }
  }

  const metrics: DashboardMetric[] = [
    { label: "Products Sold", value: String(productsSold), subtext: "From database", icon: "ShoppingBag", color: "gold" },
    { label: "Total Revenue", value: `Rs ${Math.round(totalRevenue).toLocaleString("en-PK")}`, subtext: "From database", icon: "TrendingUp", color: "teal" },
    { label: "Active Customers", value: String(customerIds.size), subtext: "From orders", icon: "Users", color: "rose" },
    { label: "Pending Orders", value: String(pendingOrders), subtext: "Need attention", icon: "Clock", color: "green" },
  ];

  return {
    metrics,
    recentOrders: orders.slice(0, 6),
    customOrders: customOrders.slice(0, 3),
  };
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  lastAdminDbError = null;
  if (!isSupabaseConfigured) {
    lastAdminDbError = "Supabase is not configured.";
    return [];
  }

  const { data, error } = await db
    .from("products")
    .select("id, category_id, name, slug, description, price, cost, sku, stock_qty, is_custom, is_available, is_featured, created_at, category:categories(id,name,slug,description,sort_order), product_images(file_name,mime_type,image_bytes,sort_order)")
    .order("created_at", { ascending: false });

  if (!error && data) {
    return (data as unknown as ProductRow[]).map((row) => {
      const mapped = mapProduct(row);
      return {
        ...mapped,
        cost: row.cost,
        sku: row.sku,
        stock_qty: row.stock_qty,
      };
    });
  }

  setLastAdminDbError(error, "Could not load admin products with related category/images");

  // Fallback: load products only to keep admin list visible.
  const { data: baseData, error: baseError } = await db
    .from("products")
    .select("id, category_id, name, slug, description, price, cost, sku, stock_qty, is_custom, is_available, is_featured, created_at")
    .order("created_at", { ascending: false });

  if (baseError || !baseData) {
    if (baseError) {
      setLastAdminDbError(baseError, "Could not load admin products");
    }
    return [];
  }

  return (baseData as unknown as ProductRow[]).map((row) => {
    const mapped = mapProduct({ ...row, category: null, product_images: [] });
    return {
      ...mapped,
      cost: row.cost,
      sku: row.sku,
      stock_qty: row.stock_qty,
    };
  });
}

export async function fetchStoreCategories(): Promise<Array<{ id: number; name: string; slug: string; description: string | null; image_url: string | null }>> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const richQuery = await db
    .from("categories")
    .select("id,name,slug,description,image_mime_type,image_bytes")
    .order("sort_order", { ascending: true });

  if (!richQuery.error && richQuery.data) {
    return (richQuery.data as CategoryImageRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      image_url: row.image_bytes && row.image_mime_type ? byteaHexToDataUrl(row.image_bytes, row.image_mime_type) : null,
    }));
  }

  const { data, error } = await db
    .from("categories")
    .select("id,name,slug,description")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as Array<{ id: number; name: string; slug: string; description: string | null }>).map((row) => ({
    ...row,
    image_url: null,
  }));
}

export async function fetchAdminCategories(): Promise<Array<{ id: number; name: string; slug: string; description: string | null; image_url: string | null; product_count: number }>> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const [categoriesResult, productsResult] = await Promise.all([
    db.from("categories").select("id,name,slug,description,image_mime_type,image_bytes").order("sort_order", { ascending: true }),
    db.from("products").select("category_id"),
  ]);

  let categoryData: Array<{ id: number; name: string; slug: string; description: string | null; image_url: string | null }> = [];

  if (!categoriesResult.error && categoriesResult.data) {
    categoryData = (categoriesResult.data as CategoryImageRow[]).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image_url: category.image_bytes && category.image_mime_type
        ? byteaHexToDataUrl(category.image_bytes, category.image_mime_type)
        : null,
    }));
  } else {
    const fallbackCategories = await db.from("categories").select("id,name,slug,description").order("sort_order", { ascending: true });
    if (!fallbackCategories.data || fallbackCategories.error) {
      return [];
    }
    categoryData = (fallbackCategories.data as Array<{ id: number; name: string; slug: string; description: string | null }>).map((category) => ({
      ...category,
      image_url: null,
    }));
  }

  const counts = new Map<number, number>();
  for (const row of (productsResult.data ?? []) as Array<{ category_id: number | null }>) {
    if (row.category_id === null) {
      continue;
    }
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }

  return categoryData.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image_url: category.image_url,
    product_count: counts.get(category.id) ?? 0,
  }));
}

export async function deleteAdminProduct(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  const { error } = await db.from("products").delete().eq("id", productId);
  return !error;
}

export async function createAdminCategory(input: { name: string; description?: string | null; imageDataUrl?: string | null }): Promise<boolean> {
  lastAdminDbError = null;
  if (!isSupabaseConfigured) {
    lastAdminDbError = "Supabase is not configured.";
    return false;
  }

  const slug = input.name.trim().toLowerCase().replace(/\s+/g, "-");
  const parsed = input.imageDataUrl ? base64DataUrlToByteaHex(input.imageDataUrl) : null;
  const richPayload = {
    name: input.name.trim(),
    slug,
    description: input.description ?? null,
    image_mime_type: parsed?.mimeType ?? null,
    image_bytes: parsed?.byteaHex ?? null,
    image_size_bytes: parsed?.sizeBytes ?? null,
  };

  let { error } = await db.from("categories").insert(richPayload);
  if (error && String(error.message ?? "").toLowerCase().includes("column") && String(error.message ?? "").toLowerCase().includes("image_")) {
    const fallback = await db.from("categories").insert({
      name: input.name.trim(),
      slug,
      description: input.description ?? null,
    });
    error = fallback.error;
  }
  if (error) {
    setLastAdminDbError(error, "Could not create category");
    return false;
  }
  return true;
}

export async function updateAdminCategory(id: number, input: { name: string; description?: string | null; imageDataUrl?: string | null }): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  const slug = input.name.trim().toLowerCase().replace(/\s+/g, "-");
  const parsed = input.imageDataUrl ? base64DataUrlToByteaHex(input.imageDataUrl) : null;
  const richPayload = {
    name: input.name.trim(),
    slug,
    description: input.description ?? null,
    image_mime_type: parsed?.mimeType ?? null,
    image_bytes: parsed?.byteaHex ?? null,
    image_size_bytes: parsed?.sizeBytes ?? null,
  };

  let { error } = await db.from("categories").update(richPayload).eq("id", id);
  if (error && String(error.message ?? "").toLowerCase().includes("column") && String(error.message ?? "").toLowerCase().includes("image_")) {
    const fallback = await db.from("categories").update({
      name: input.name.trim(),
      slug,
      description: input.description ?? null,
    }).eq("id", id);
    error = fallback.error;
  }
  return !error;
}

export async function deleteAdminCategory(id: number): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }
  const { error } = await db.from("categories").delete().eq("id", id);
  return !error;
}

export async function fetchAdminCustomers(): Promise<AdminCustomerRow[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const [profilesResult, orders] = await Promise.all([
    db.from("profiles").select("id,full_name,phone,avatar_url,created_at").eq("role", "customer"),
    fetchAdminOrders(),
  ]);

  if (!profilesResult.data || profilesResult.error) {
    return [];
  }

  const orderMap = new Map<string, { count: number; spent: number; last: string | null }>();
  for (const order of orders) {
    if (!order.customer_id) {
      continue;
    }
    const current = orderMap.get(order.customer_id) ?? { count: 0, spent: 0, last: null };
    current.count += 1;
    current.spent += Number(order.total_amount ?? 0);
    if (!current.last || new Date(order.created_at).getTime() > new Date(current.last).getTime()) {
      current.last = order.created_at;
    }
    orderMap.set(order.customer_id, current);
  }

  return (profilesResult.data as Array<Record<string, unknown>>).map((profile) => {
    const stats = orderMap.get(String(profile.id)) ?? { count: 0, spent: 0, last: null };
    return {
      id: String(profile.id),
      full_name: (profile.full_name as string | null) ?? null,
      email: null,
      phone: (profile.phone as string | null) ?? null,
      avatar_url: (profile.avatar_url as string | null) ?? null,
      order_count: stats.count,
      total_spent: stats.spent,
      last_order_at: stats.last,
      created_at: String(profile.created_at),
    };
  });
}

export async function fetchAnalytics(period: "7d" | "30d" | "3m"): Promise<{ rawData: AnalyticsPoint[]; summary: AnalyticsSummaryData }> {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const previousCutoff = new Date(cutoff);
  previousCutoff.setDate(previousCutoff.getDate() - days);

  const allOrders = (await fetchAdminOrders())
    .filter((order) => order.status !== "cancelled");

  const orders = allOrders
    .filter((order) => order.status !== "cancelled")
    .filter((order) => new Date(order.created_at).getTime() >= cutoff.getTime());

  const previousOrders = allOrders
    .filter((order) => {
      const ts = new Date(order.created_at).getTime();
      return ts >= previousCutoff.getTime() && ts < cutoff.getTime();
    });

  const byDate = new Map<string, { sales: number; revenue: number }>();
  for (const order of orders) {
    const label = new Date(order.created_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short" });
    const current = byDate.get(label) ?? { sales: 0, revenue: 0 };
    current.sales += order.item_count;
    current.revenue += Number(order.total_amount ?? 0);
    byDate.set(label, current);
  }

  const rawData: AnalyticsPoint[] = Array.from(byDate.entries()).map(([date, values]) => ({
    date,
    sales: values.sales,
    revenue: values.revenue,
  }));

  rawData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const totalSold = orders.reduce((sum, order) => sum + order.item_count, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const previousRevenue = previousOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);

  const growthPct = previousRevenue <= 0
    ? (totalRevenue > 0 ? 100 : 0)
    : ((totalRevenue - previousRevenue) / previousRevenue) * 100;

  return {
    rawData,
    summary: {
      total_sold: totalSold,
      total_revenue: totalRevenue,
      avg_order_value: avgOrderValue,
      growth_pct: Number(growthPct.toFixed(1)),
    },
  };
}

export async function fetchAdminProductById(productId: string): Promise<AdminProduct | null> {
  const products = await fetchAdminProducts();
  return products.find((product) => product.id === productId) ?? null;
}

export async function createAdminProduct(input: {
  category_id: number | null;
  name: string;
  description: string;
  sku: string;
  price: number | null;
  cost: number | null;
  stock_qty: number;
  is_custom: boolean;
  is_available: boolean;
  is_featured: boolean;
  images: string[];
}): Promise<boolean> {
  lastAdminDbError = null;
  if (!isSupabaseConfigured) {
    lastAdminDbError = "Supabase is not configured.";
    return false;
  }

  const slug = input.name.trim().toLowerCase().replace(/\s+/g, "-");
  const { data, error } = await db.from("products").insert({
    category_id: input.category_id,
    name: input.name,
    slug,
    description: input.description,
    sku: input.sku || null,
    price: input.price,
    cost: input.cost,
    stock_qty: input.stock_qty,
    is_custom: input.is_custom,
    is_available: input.is_available,
    is_featured: input.is_featured,
  }).select("id").single();

  if (error || !data) {
    if (error) {
      setLastAdminDbError(error, "Could not create product");
    } else {
      lastAdminDbError = "Could not create product: no row returned.";
    }
    return false;
  }

  if (input.images.length > 0) {
    const imageRows = await Promise.all(input.images.map(async (image, index) => {
      const parsed = base64DataUrlToByteaHex(image);
      let fileName: string | null = null;

      try {
        fileName = await uploadProductImageToStorage(data.id, image, index);
      } catch {
        // Keep insert flow compatible with environments where Storage policies are not ready yet.
        fileName = null;
      }

      return {
        product_id: data.id,
        file_name: fileName,
        mime_type: parsed.mimeType,
        image_bytes: parsed.byteaHex,
        size_bytes: parsed.sizeBytes,
        sort_order: index,
      };
    }));

    const minimalRows = imageRows.map((row) => ({
      product_id: row.product_id,
      file_name: row.file_name,
      mime_type: row.mime_type,
      size_bytes: row.size_bytes,
      sort_order: row.sort_order,
    }));

    let imageResult = await db.from("product_images").insert(minimalRows);
    const needsLegacyFallback = Boolean(imageResult.error)
      && /null value|not-null|image_bytes/i.test(String(imageResult.error?.message ?? ""));
    if (needsLegacyFallback) {
      imageResult = await db.from("product_images").insert(imageRows);
    }

    if (imageResult.error) {
      setLastAdminDbError(imageResult.error, "Product created but image upload failed");
      return false;
    }
  }

  return true;
}

export async function updateAdminProduct(productId: string, input: {
  category_id: number | null;
  name: string;
  description: string;
  sku: string;
  price: number | null;
  cost: number | null;
  stock_qty: number;
  is_custom: boolean;
  is_available: boolean;
  is_featured: boolean;
  images: string[];
}): Promise<boolean> {
  lastAdminDbError = null;
  if (!isSupabaseConfigured) {
    lastAdminDbError = "Supabase is not configured.";
    return false;
  }

  const slug = input.name.trim().toLowerCase().replace(/\s+/g, "-");
  const updateResult = await db.from("products").update({
    category_id: input.category_id,
    name: input.name,
    slug,
    description: input.description,
    sku: input.sku || null,
    price: input.price,
    cost: input.cost,
    stock_qty: input.stock_qty,
    is_custom: input.is_custom,
    is_available: input.is_available,
    is_featured: input.is_featured,
  }).eq("id", productId);

  if (updateResult.error) {
    setLastAdminDbError(updateResult.error, "Could not update product");
    return false;
  }

  const deleteImages = await db.from("product_images").delete().eq("product_id", productId);
  if (deleteImages.error) {
    setLastAdminDbError(deleteImages.error, "Product updated but existing images could not be replaced");
    return false;
  }

  if (input.images.length > 0) {
    const imageRows = await Promise.all(input.images.map(async (image, index) => {
      const parsed = base64DataUrlToByteaHex(image);
      let fileName: string | null = null;

      try {
        fileName = await uploadProductImageToStorage(productId, image, index);
      } catch {
        fileName = null;
      }

      return {
        product_id: productId,
        file_name: fileName,
        mime_type: parsed.mimeType,
        image_bytes: parsed.byteaHex,
        size_bytes: parsed.sizeBytes,
        sort_order: index,
      };
    }));

    const minimalRows = imageRows.map((row) => ({
      product_id: row.product_id,
      file_name: row.file_name,
      mime_type: row.mime_type,
      size_bytes: row.size_bytes,
      sort_order: row.sort_order,
    }));

    let imageResult = await db.from("product_images").insert(minimalRows);
    const needsLegacyFallback = Boolean(imageResult.error)
      && /null value|not-null|image_bytes/i.test(String(imageResult.error?.message ?? ""));
    if (needsLegacyFallback) {
      imageResult = await db.from("product_images").insert(imageRows);
    }

    if (imageResult.error) {
      setLastAdminDbError(imageResult.error, "Product updated but new images failed to upload");
      return false;
    }
  }

  return true;
}
