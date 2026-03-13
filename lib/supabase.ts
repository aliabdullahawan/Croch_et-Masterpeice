/**
 * ════════════════════════════════════════════════════════════════════════════
 *  SUPABASE CLIENT & DATABASE ARCHITECTURE
 *  File: lib/supabase.ts
 * ════════════════════════════════════════════════════════════════════════════
 *
 * HOW TO SET UP SUPABASE CONNECTION:
 * ──────────────────────────────────
 *  1. Go to https://supabase.com and create a free project.
 *  2. In your project dashboard → Settings → API
 *     Copy:  "Project URL"  →  NEXT_PUBLIC_SUPABASE_URL
 *            "anon / public key" → NEXT_PUBLIC_SUPABASE_ANON_KEY
 *  3. Create a file .env.local at the project root:
 *
 *       NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
 *       NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
 *
 *  4. In this file uncomment the createClient call below.
 *  5. Remove the mock `supabase` object at the bottom.
 *
 * ════════════════════════════════════════════════════════════════════════════
 *
 *  DATABASE SCHEMA  — Run ALL SQL below in Supabase SQL Editor
 * ════════════════════════════════════════════════════════════════════════════
 *
 * ──────────────────────────────────────────────────
 *  TABLE 1: profiles  (extends Supabase auth.users)
 * ──────────────────────────────────────────────────
 *  After a user signs up, Supabase automatically creates a row in auth.users.
 *  We create a `profiles` table linked to that for extra user info.
 *
 *  CREATE TABLE public.profiles (
 *    id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 *    full_name     TEXT,
 *    phone         TEXT,
 *    avatar_url    TEXT,
 *    role          TEXT        NOT NULL DEFAULT 'customer'
 *                              CHECK (role IN ('customer', 'admin')),
 *    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *  );
 *
 *  -- Trigger: auto-create profile when user registers
 *  CREATE OR REPLACE FUNCTION public.handle_new_user()
 *  RETURNS TRIGGER AS $$
 *  BEGIN
 *    INSERT INTO public.profiles (id, full_name)
 *    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
 *    RETURN NEW;
 *  END;
 *  $$ LANGUAGE plpgsql SECURITY DEFINER;
 *
 *  CREATE TRIGGER on_auth_user_created
 *    AFTER INSERT ON auth.users
 *    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
 *
 *  -- RLS: users can only read/update their own profile
 *  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
 *  CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
 *  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
 *  CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT
 *    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
 *
 * ──────────────────────────────────────────────────
 *  TABLE 2: categories
 * ──────────────────────────────────────────────────
 *  CREATE TABLE public.categories (
 *    id          SERIAL      PRIMARY KEY,
 *    name        TEXT        NOT NULL UNIQUE,  -- e.g. 'Bags', 'Amigurumi', 'Home Decor'
 *    slug        TEXT        NOT NULL UNIQUE,  -- e.g. 'bags', 'amigurumi'
 *    description TEXT,
 *    image_url   TEXT,
 *    sort_order  INT         NOT NULL DEFAULT 0,
 *    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *  );
 *
 * ──────────────────────────────────────────────────
 *  TABLE 3: products  (the main product catalogue)
 * ──────────────────────────────────────────────────
 *  CREATE TABLE public.products (
 *    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
 *    category_id    INT         REFERENCES public.categories(id),
 *    name           TEXT        NOT NULL,
 *    slug           TEXT        NOT NULL UNIQUE,
 *    description    TEXT,
 *    price          NUMERIC(10,2),           -- PKR price
 *    is_custom      BOOLEAN     NOT NULL DEFAULT FALSE,  -- true = custom-order only
 *    is_available   BOOLEAN     NOT NULL DEFAULT TRUE,
 *    is_featured    BOOLEAN     NOT NULL DEFAULT FALSE,  -- show on homepage
 *    images         TEXT[]      NOT NULL DEFAULT '{}',   -- array of image URLs (Supabase Storage)
 *    tags           TEXT[]      DEFAULT '{}',
 *    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *  );
 *
 *  -- RLS: public read for all products; admin write
 *  ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
 *  CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (TRUE);
 *  CREATE POLICY "Admins can manage products" ON public.products
 *    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
 *
 * ──────────────────────────────────────────────────
 *  TABLE 4: wishlists
 * ──────────────────────────────────────────────────
 *  Stores each user's saved/wishlist products.
 *
 *  CREATE TABLE public.wishlists (
 *    id          SERIAL      PRIMARY KEY,
 *    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *    product_id  UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
 *    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    UNIQUE (user_id, product_id)   -- prevent duplicates
 *  );
 *
 *  ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
 *  CREATE POLICY "Users manage own wishlist" ON public.wishlists
 *    USING (auth.uid() = user_id);
 *
 * ──────────────────────────────────────────────────
 *  TABLE 5: cart_items
 * ──────────────────────────────────────────────────
 *  Cart is mostly client-side (localStorage) but can sync to DB for logged-in users.
 *
 *  CREATE TABLE public.cart_items (
 *    id          SERIAL      PRIMARY KEY,
 *    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *    product_id  UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
 *    quantity    INT         NOT NULL DEFAULT 1 CHECK (quantity > 0),
 *    note        TEXT,        -- custom instructions for the item
 *    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    UNIQUE (user_id, product_id)
 *  );
 *
 *  ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
 *  CREATE POLICY "Users manage own cart" ON public.cart_items
 *    USING (auth.uid() = user_id);
 *
 * ──────────────────────────────────────────────────
 *  TABLE 6: custom_orders  (custom crochet requests)
 * ──────────────────────────────────────────────────
 *  CREATE TABLE public.custom_orders (
 *    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
 *    user_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
 *    -- Guest orders are allowed (user_id can be null)
 *    customer_name    TEXT        NOT NULL,
 *    customer_phone   TEXT        NOT NULL,
 *    customer_email   TEXT,
 *    description      TEXT        NOT NULL,   -- what they want made
 *    color_prefs      TEXT,
 *    size_prefs       TEXT,
 *    reference_images TEXT[],                 -- URLs to uploaded reference images
 *    budget           NUMERIC(10,2),
 *    deadline         DATE,
 *    status           TEXT        NOT NULL DEFAULT 'pending'
 *                                 CHECK (status IN ('pending','reviewing','in_progress','completed','cancelled')),
 *    admin_notes      TEXT,
 *    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *  );
 *
 *  ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;
 *  CREATE POLICY "Users see own orders" ON public.custom_orders
 *    FOR SELECT USING (auth.uid() = user_id);
 *  CREATE POLICY "Anyone can submit order" ON public.custom_orders
 *    FOR INSERT WITH CHECK (TRUE);
 *  CREATE POLICY "Admins see all orders" ON public.custom_orders
 *    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
 *
 * ──────────────────────────────────────────────────
 *  TABLE 7: reviews
 * ──────────────────────────────────────────────────
 *  CREATE TABLE public.reviews (
 *    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
 *    product_id  UUID        REFERENCES public.products(id) ON DELETE CASCADE,
 *    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *    rating      INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
 *    title       TEXT,
 *    body        TEXT,
 *    images      TEXT[]      DEFAULT '{}',
 *    is_approved BOOLEAN     NOT NULL DEFAULT FALSE,  -- admin must approve before showing
 *    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    UNIQUE (product_id, user_id)   -- one review per product per user
 *  );
 *
 *  ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
 *  CREATE POLICY "Anyone can read approved reviews" ON public.reviews
 *    FOR SELECT USING (is_approved = TRUE);
 *  CREATE POLICY "Users can write reviews" ON public.reviews
 *    FOR INSERT WITH CHECK (auth.uid() = user_id);
 *  CREATE POLICY "Users can edit own reviews" ON public.reviews
 *    FOR UPDATE USING (auth.uid() = user_id);
 *  CREATE POLICY "Admins manage all reviews" ON public.reviews
 *    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
 *
 * ──────────────────────────────────────────────────
 *  TABLE 8: contact_messages  (from contact form)
 * ──────────────────────────────────────────────────
 *  CREATE TABLE public.contact_messages (
 *    id          SERIAL      PRIMARY KEY,
 *    name        TEXT        NOT NULL,
 *    email       TEXT,
 *    phone       TEXT,
 *    subject     TEXT,
 *    message     TEXT        NOT NULL,
 *    is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
 *    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *  );
 *
 *  ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
 *  CREATE POLICY "Anyone can submit contact" ON public.contact_messages
 *    FOR INSERT WITH CHECK (TRUE);
 *  CREATE POLICY "Admins read all messages" ON public.contact_messages
 *    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
 *
 * ──────────────────────────────────────────────────
 *  TABLE 9: admin_settings  (site config for admin panel)
 * ──────────────────────────────────────────────────
 *  CREATE TABLE public.admin_settings (
 *    key         TEXT        PRIMARY KEY,
 *    value       JSONB,
 *    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *  );
 *  -- Example rows:
 *  -- INSERT INTO admin_settings (key, value) VALUES
 *  --   ('whatsapp_number',  '"03159202186"'),
 *  --   ('instagram_handle', '"croch_etmasterpiece"'),
 *  --   ('banner_text',      '"Free delivery on orders above PKR 2000"'),
 *  --   ('is_shop_open',     'true');
 *
 * ──────────────────────────────────────────────────
 *  STORAGE BUCKETS  (Supabase Storage)
 * ──────────────────────────────────────────────────
 *  In Supabase dashboard → Storage → New bucket:
 *
 *  1. "product-images"   (public)  — product photos uploaded by admin
 *  2. "review-images"    (public)  — photos uploaded with reviews
 *  3. "order-references" (private) — reference images in custom orders
 *  4. "avatars"          (public)  — user profile pictures
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/* ── TO ACTIVATE: uncomment these lines and delete the mock below ─────
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
──────────────────────────────────────────────────────────────────────── */

/* ── MOCK CLIENT (remove once real connection is configured) ───────── */
export const supabase = {
  auth:    { signUp: async () => ({}), signInWithPassword: async () => ({}), signOut: async () => ({}) },
  from:    (_table: string) => ({ select: () => ({ data: [], error: null }) }),
  storage: { from: (_bucket: string) => ({ upload: async () => ({}) }) },
} as unknown as ReturnType<typeof createClient<Database>>;
