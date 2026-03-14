-- Crochet Masterpiece - Supabase Production Schema
-- Run this script in Supabase SQL editor.

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();
	return new;
end;
$$;

create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	full_name text,
	phone text,
	avatar_url text,
	role text not null default 'customer' check (role in ('customer', 'admin')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists (
		select 1
		from public.profiles p
		where p.id = uid and p.role = 'admin'
	);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	insert into public.profiles (id, full_name)
	values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
	on conflict (id) do nothing;
	return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create table if not exists public.categories (
	id bigserial primary key,
	name text not null unique,
	slug text not null unique,
	description text,
	image_mime_type text,
	image_bytes bytea,
	image_size_bytes int,
	sort_order int not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table public.categories add column if not exists image_mime_type text;
alter table public.categories add column if not exists image_bytes bytea;
alter table public.categories add column if not exists image_size_bytes int;

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row execute procedure public.set_updated_at();

create table if not exists public.products (
	id uuid primary key default gen_random_uuid(),
	category_id bigint references public.categories(id) on delete set null,
	name text not null,
	slug text not null unique,
	description text,
	price numeric(10, 2),
	cost numeric(10, 2),
	sku text unique,
	stock_qty int not null default 0 check (stock_qty >= 0),
	is_custom boolean not null default false,
	is_available boolean not null default true,
	is_featured boolean not null default false,
	created_by uuid references auth.users(id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint products_price_non_negative check (price is null or price >= 0),
	constraint products_cost_non_negative check (cost is null or cost >= 0)
);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

create table if not exists public.product_images (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products(id) on delete cascade,
	file_name text,
	mime_type text not null,
	image_bytes bytea not null,
	size_bytes int not null check (size_bytes > 0),
	sha256_hex text,
	sort_order int not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_product_images_product_sort on public.product_images(product_id, sort_order);
create index if not exists idx_product_images_sha256 on public.product_images(sha256_hex);

drop trigger if exists trg_product_images_updated_at on public.product_images;
create trigger trg_product_images_updated_at
before update on public.product_images
for each row execute procedure public.set_updated_at();

create table if not exists public.wishlists (
	id bigserial primary key,
	user_id uuid not null references auth.users(id) on delete cascade,
	product_id uuid not null references public.products(id) on delete cascade,
	created_at timestamptz not null default now(),
	unique (user_id, product_id)
);

create table if not exists public.cart_items (
	id bigserial primary key,
	user_id uuid not null references auth.users(id) on delete cascade,
	product_id uuid not null references public.products(id) on delete cascade,
	quantity int not null default 1 check (quantity > 0),
	note text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (user_id, product_id)
);

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at
before update on public.cart_items
for each row execute procedure public.set_updated_at();

create table if not exists public.orders (
	id uuid primary key default gen_random_uuid(),
	customer_id uuid references auth.users(id) on delete set null,
	customer_name text not null,
	customer_email text,
	customer_phone text,
	status text not null default 'pending' check (
		status in ('pending', 'confirmed', 'in_progress', 'shipped', 'delivered', 'cancelled')
	),
	total_amount numeric(10, 2) not null check (total_amount >= 0),
	notes text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

create table if not exists public.order_items (
	id bigserial primary key,
	order_id uuid not null references public.orders(id) on delete cascade,
	product_id uuid not null references public.products(id) on delete restrict,
	quantity int not null check (quantity > 0),
	unit_price numeric(10, 2) not null check (unit_price >= 0),
	created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);

create table if not exists public.custom_orders (
	id uuid primary key default gen_random_uuid(),
	user_id uuid references auth.users(id) on delete set null,
	customer_name text not null,
	customer_phone text not null,
	customer_email text,
	category text,
	description text not null,
	budget_text text,
	budget numeric(10, 2),
	deadline_text text,
	deadline date,
	status text not null default 'new' check (
		status in ('new', 'reviewing', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')
	),
	admin_notes text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint custom_orders_budget_non_negative check (budget is null or budget >= 0)
);

create index if not exists idx_custom_orders_status on public.custom_orders(status);
create index if not exists idx_custom_orders_created_at on public.custom_orders(created_at desc);

drop trigger if exists trg_custom_orders_updated_at on public.custom_orders;
create trigger trg_custom_orders_updated_at
before update on public.custom_orders
for each row execute procedure public.set_updated_at();

create table if not exists public.custom_order_images (
	id uuid primary key default gen_random_uuid(),
	custom_order_id uuid not null references public.custom_orders(id) on delete cascade,
	file_name text,
	mime_type text not null,
	image_bytes bytea not null,
	size_bytes int not null check (size_bytes > 0),
	sha256_hex text,
	sort_order int not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_custom_order_images_order_sort on public.custom_order_images(custom_order_id, sort_order);
create index if not exists idx_custom_order_images_sha256 on public.custom_order_images(sha256_hex);

drop trigger if exists trg_custom_order_images_updated_at on public.custom_order_images;
create trigger trg_custom_order_images_updated_at
before update on public.custom_order_images
for each row execute procedure public.set_updated_at();

create table if not exists public.reviews (
	id uuid primary key default gen_random_uuid(),
	product_id uuid not null references public.products(id) on delete cascade,
	user_id uuid not null references auth.users(id) on delete cascade,
	rating int not null check (rating between 1 and 5),
	title text,
	body text,
	is_approved boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (product_id, user_id)
);

create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_reviews_is_approved on public.reviews(is_approved);

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
before update on public.reviews
for each row execute procedure public.set_updated_at();

create table if not exists public.review_images (
	id uuid primary key default gen_random_uuid(),
	review_id uuid not null references public.reviews(id) on delete cascade,
	file_name text,
	mime_type text not null,
	image_bytes bytea not null,
	size_bytes int not null check (size_bytes > 0),
	sha256_hex text,
	sort_order int not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_review_images_review_sort on public.review_images(review_id, sort_order);

drop trigger if exists trg_review_images_updated_at on public.review_images;
create trigger trg_review_images_updated_at
before update on public.review_images
for each row execute procedure public.set_updated_at();

create table if not exists public.contact_messages (
	id bigserial primary key,
	name text not null,
	email text,
	phone text,
	subject text,
	message text not null,
	is_read boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

drop trigger if exists trg_contact_messages_updated_at on public.contact_messages;
create trigger trg_contact_messages_updated_at
before update on public.contact_messages
for each row execute procedure public.set_updated_at();

create table if not exists public.admin_settings (
	key text primary key,
	value jsonb,
	updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.wishlists enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.custom_orders enable row level security;
alter table public.custom_order_images enable row level security;
alter table public.reviews enable row level security;
alter table public.review_images enable row level security;
alter table public.contact_messages enable row level security;
alter table public.admin_settings enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update
using (auth.uid() = id or public.is_admin(auth.uid()))
with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
on public.categories for select
using (true);

drop policy if exists "categories_admin_manage" on public.categories;
create policy "categories_admin_manage"
on public.categories for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
on public.products for select
using (true);

drop policy if exists "products_admin_manage" on public.products;
create policy "products_admin_manage"
on public.products for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read"
on public.product_images for select
using (true);

drop policy if exists "product_images_admin_manage" on public.product_images;
create policy "product_images_admin_manage"
on public.product_images for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "wishlists_own" on public.wishlists;
create policy "wishlists_own"
on public.wishlists for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "cart_items_own" on public.cart_items;
create policy "cart_items_own"
on public.cart_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
on public.orders for select
using (auth.uid() = customer_id or public.is_admin(auth.uid()));

drop policy if exists "orders_insert_owner_or_admin" on public.orders;
create policy "orders_insert_owner_or_admin"
on public.orders for insert
with check (
	public.is_admin(auth.uid())
	or auth.uid() = customer_id
	or customer_id is null
);

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
on public.orders for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "orders_delete_admin" on public.orders;
create policy "orders_delete_admin"
on public.orders for delete
using (public.is_admin(auth.uid()));

drop policy if exists "order_items_select_related_order" on public.order_items;
create policy "order_items_select_related_order"
on public.order_items for select
using (
	exists (
		select 1
		from public.orders o
		where o.id = order_id
			and (o.customer_id = auth.uid() or public.is_admin(auth.uid()))
	)
);

drop policy if exists "order_items_admin_manage" on public.order_items;
create policy "order_items_admin_manage"
on public.order_items for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "custom_orders_insert_any" on public.custom_orders;
create policy "custom_orders_insert_any"
on public.custom_orders for insert
with check (
	user_id is null
	or user_id = auth.uid()
	or public.is_admin(auth.uid())
);

drop policy if exists "custom_orders_select_own_or_admin" on public.custom_orders;
create policy "custom_orders_select_own_or_admin"
on public.custom_orders for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "custom_orders_update_admin" on public.custom_orders;
create policy "custom_orders_update_admin"
on public.custom_orders for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "custom_order_images_select_related" on public.custom_order_images;
create policy "custom_order_images_select_related"
on public.custom_order_images for select
using (
	exists (
		select 1
		from public.custom_orders co
		where co.id = custom_order_id
			and (co.user_id = auth.uid() or public.is_admin(auth.uid()))
	)
);

drop policy if exists "custom_order_images_insert_related" on public.custom_order_images;
create policy "custom_order_images_insert_related"
on public.custom_order_images for insert
with check (
	exists (
		select 1
		from public.custom_orders co
		where co.id = custom_order_id
			and (
				co.user_id = auth.uid()
				or co.user_id is null
				or public.is_admin(auth.uid())
			)
	)
);

drop policy if exists "custom_order_images_admin_manage" on public.custom_order_images;
create policy "custom_order_images_admin_manage"
on public.custom_order_images for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "custom_order_images_admin_delete" on public.custom_order_images;
create policy "custom_order_images_admin_delete"
on public.custom_order_images for delete
using (public.is_admin(auth.uid()));

drop policy if exists "reviews_public_approved_or_admin" on public.reviews;
create policy "reviews_public_approved_or_admin"
on public.reviews for select
using (is_approved or public.is_admin(auth.uid()));

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
on public.reviews for insert
with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own_or_admin" on public.reviews;
create policy "reviews_update_own_or_admin"
on public.reviews for update
using (auth.uid() = user_id or public.is_admin(auth.uid()))
with check (auth.uid() = user_id or public.is_admin(auth.uid()));

drop policy if exists "reviews_delete_admin" on public.reviews;
create policy "reviews_delete_admin"
on public.reviews for delete
using (public.is_admin(auth.uid()));

drop policy if exists "review_images_select_public" on public.review_images;
create policy "review_images_select_public"
on public.review_images for select
using (
	exists (
		select 1
		from public.reviews r
		where r.id = review_id
			and (r.is_approved or public.is_admin(auth.uid()))
	)
);

drop policy if exists "review_images_insert_owner" on public.review_images;
create policy "review_images_insert_owner"
on public.review_images for insert
with check (
	exists (
		select 1
		from public.reviews r
		where r.id = review_id and r.user_id = auth.uid()
	)
);

drop policy if exists "review_images_update_owner_or_admin" on public.review_images;
create policy "review_images_update_owner_or_admin"
on public.review_images for update
using (
	exists (
		select 1
		from public.reviews r
		where r.id = review_id and (r.user_id = auth.uid() or public.is_admin(auth.uid()))
	)
)
with check (
	exists (
		select 1
		from public.reviews r
		where r.id = review_id and (r.user_id = auth.uid() or public.is_admin(auth.uid()))
	)
);

drop policy if exists "review_images_delete_owner_or_admin" on public.review_images;
create policy "review_images_delete_owner_or_admin"
on public.review_images for delete
using (
	exists (
		select 1
		from public.reviews r
		where r.id = review_id and (r.user_id = auth.uid() or public.is_admin(auth.uid()))
	)
);

drop policy if exists "contact_insert_any" on public.contact_messages;
create policy "contact_insert_any"
on public.contact_messages for insert
with check (true);

drop policy if exists "contact_admin_read_update" on public.contact_messages;
create policy "contact_admin_read_update"
on public.contact_messages for select
using (public.is_admin(auth.uid()));

drop policy if exists "contact_admin_manage" on public.contact_messages;
create policy "contact_admin_manage"
on public.contact_messages for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "admin_settings_admin_only" on public.admin_settings;
create policy "admin_settings_admin_only"
on public.admin_settings for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create or replace view public.order_stats as
select
	count(*)::bigint as total_orders,
	coalesce(sum(total_amount), 0)::numeric(12,2) as total_revenue,
	count(*) filter (where status = 'pending')::bigint as pending_orders,
	count(*) filter (where status = 'cancelled')::bigint as cancelled_orders
from public.orders;

create or replace view public.custom_order_stats as
select
	count(*)::bigint as total_custom_orders,
	count(*) filter (where status = 'new')::bigint as new_custom_orders,
	count(*) filter (where status = 'reviewing')::bigint as reviewing_custom_orders
from public.custom_orders;

create or replace function public.promote_admin_by_email(admin_email text, admin_name text default 'Chrochet MasterPeice')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
	v_uid uuid;
begin
	select u.id into v_uid
	from auth.users u
	where lower(u.email) = lower(admin_email)
	limit 1;

	if v_uid is null then
		raise exception 'No auth user found for email: %', admin_email;
	end if;

	update public.profiles
	set role = 'admin',
			full_name = coalesce(nullif(admin_name, ''), full_name),
			updated_at = now()
	where id = v_uid;
end;
$$;

comment on function public.promote_admin_by_email(text, text)
is 'Run after creating the admin user in Supabase Auth dashboard to grant admin role in profiles.';

-- Required grants for Supabase client roles.
-- RLS policies still enforce row-level permissions.
grant usage on schema public to anon, authenticated, service_role;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;

grant execute on function public.is_admin(uuid) to anon, authenticated, service_role;

-- Admin bootstrap (profile role only).
-- Password is NOT stored in public.profiles.
-- Set the password in Supabase Authentication -> Users to: Crochet123*
do $$
declare
	v_admin_email text := 'aliabdullahawan.2003@gmail.com';
	v_admin_name text := 'Crochet Masterpeice';
	v_uid uuid;
begin
	select u.id into v_uid
	from auth.users u
	where lower(u.email) = lower(v_admin_email)
	limit 1;

	if v_uid is null then
		raise notice 'Admin auth user not found for %, create it in Supabase Auth first and set password to Crochet123*.', v_admin_email;
	else
		insert into public.profiles (id, full_name, role)
		values (v_uid, v_admin_name, 'admin')
		on conflict (id) do update
		set role = 'admin',
				full_name = excluded.full_name,
				updated_at = now();
	end if;
end;
$$;

commit;

