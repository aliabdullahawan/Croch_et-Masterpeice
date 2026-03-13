/* ══════════════════════════════════════════════════════════
   lib/types.ts  — Shared TypeScript types for Croch_et Masterpiece
   These match the Supabase database schema defined in lib/supabase.ts
═══════════════════════════════════════════════════════════ */

/* ── Database table row types ─────────────────────────── */

export type UserRole = "customer" | "admin";

export interface Profile {
  id:         string;
  full_name:  string | null;
  phone:      string | null;
  avatar_url: string | null;
  role:       UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id:          number;
  name:        string;   // e.g. "Bags"
  slug:        string;   // e.g. "bags"
  description: string | null;
  image_url:   string | null;
  sort_order:  number;
}

export interface Product {
  id:           string;
  category_id:  number | null;
  name:         string;
  slug:         string;
  description:  string | null;
  price:        number | null;
  is_custom:    boolean;
  is_available: boolean;
  is_featured:  boolean;
  images:       string[];   // array of public image URLs
  tags:         string[];
  created_at:   string;
  // Joined fields (when querying with category)
  category?:    Category;
  reviews?:     Review[];
}

export interface Review {
  id:          string;
  product_id:  string | null;
  user_id:     string;
  rating:      number;   // 1–5
  title:       string | null;
  body:        string | null;
  images:      string[];
  is_approved: boolean;
  created_at:  string;
  // Joined
  profile?:    Pick<Profile, "full_name" | "avatar_url">;
}

export interface WishlistItem {
  id:         number;
  user_id:    string;
  product_id: string;
  created_at: string;
  // Joined
  product?:   Product;
}

export interface CartItem {
  id:         number;
  user_id:    string;
  product_id: string;
  quantity:   number;
  note:       string | null;
  // Joined
  product?:   Product;
}

export interface CustomOrder {
  id:               string;
  user_id:          string | null;
  customer_name:    string;
  customer_phone:   string;
  customer_email:   string | null;
  description:      string;
  color_prefs:      string | null;
  size_prefs:       string | null;
  reference_images: string[];
  budget:           number | null;
  deadline:         string | null;
  status:           "pending" | "reviewing" | "in_progress" | "completed" | "cancelled";
  admin_notes:      string | null;
  created_at:       string;
}

export interface ContactMessage {
  id:         number;
  name:       string;
  email:      string | null;
  phone:      string | null;
  subject:    string | null;
  message:    string;
  is_read:    boolean;
  created_at: string;
}

/* ── Client-side Cart type (localStorage) ──────────────── */
export interface LocalCartItem {
  product:  Product;
  quantity: number;
  note?:    string;
}

/* ── Supabase Database type scaffold ───────────────────── */
/* NOTE: Generate the full version by running:
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
*/
export interface Database {
  public: {
    Tables: {
      profiles:         { Row: Profile };
      categories:       { Row: Category };
      products:         { Row: Product };
      reviews:          { Row: Review };
      wishlists:        { Row: WishlistItem };
      cart_items:       { Row: CartItem };
      custom_orders:    { Row: CustomOrder };
      contact_messages: { Row: ContactMessage };
    };
  };
}
