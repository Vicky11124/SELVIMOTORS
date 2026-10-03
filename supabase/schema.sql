-- =============================================================================
-- SELVI MOTORS - SIMPLIFIED BACKEND SCHEMA & RLS POLICIES
-- Run in Supabase SQL Editor (or via Supabase CLI migration)
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. ADMIN ALLOW-LIST (Simple: user_id -> MATCH = ADMIN)
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users read own" on public.admin_users;
create policy "admin_users read own" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- Simple SECURITY DEFINER helper function: checks if auth.uid() is in admin_users
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Trigger function for updated_at timestamps
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2. BIKES (Inventory)
-- -----------------------------------------------------------------------------
create table if not exists public.bikes (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  variant text,
  slug text not null unique,
  price integer not null check (price >= 0),
  year integer not null check (year between 1980 and 2100),
  km_driven integer not null check (km_driven >= 0),
  fuel_type text not null default 'Petrol' check (fuel_type in ('Petrol','Diesel','Electric','Hybrid')),
  transmission text not null default 'Manual' check (transmission in ('Manual','Automatic')),
  owner_count integer not null default 1 check (owner_count >= 1),
  registration_number text,
  condition text,
  location text,
  description text,
  status text not null default 'AVAILABLE' check (status in ('AVAILABLE','RESERVED','SOLD','HIDDEN')),
  featured boolean not null default false,
  new_arrival boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bikes_status_idx on public.bikes (status);
create index if not exists bikes_featured_idx on public.bikes (featured) where featured;
create index if not exists bikes_new_arrival_idx on public.bikes (new_arrival) where new_arrival;
create index if not exists bikes_brand_idx on public.bikes (brand);
create index if not exists bikes_price_idx on public.bikes (price);
create index if not exists bikes_year_idx on public.bikes (year);
create index if not exists bikes_created_idx on public.bikes (created_at desc);

drop trigger if exists bikes_updated on public.bikes;
create trigger bikes_updated before update on public.bikes
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. BIKE IMAGES (Gallery)
-- -----------------------------------------------------------------------------
create table if not exists public.bike_images (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid not null references public.bikes(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists bike_images_bike_idx on public.bike_images (bike_id, display_order);

-- -----------------------------------------------------------------------------
-- 4. ENQUIRIES (Customer Leads)
-- -----------------------------------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  bike_id uuid references public.bikes(id) on delete set null,
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  phone text not null check (char_length(phone) between 6 and 20),
  email text check (email is null or char_length(email) <= 160),
  message text check (message is null or char_length(message) <= 2000),
  status text not null default 'NEW' check (status in ('NEW','CONTACTED','CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists enquiries_status_idx on public.enquiries (status, created_at desc);
create index if not exists enquiries_bike_idx on public.enquiries (bike_id);

drop trigger if exists enquiries_updated on public.enquiries;
create trigger enquiries_updated before update on public.enquiries
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 5. SELL REQUESTS (Customer Bike Sell Submissions)
-- -----------------------------------------------------------------------------
create table if not exists public.sell_requests (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  phone text not null check (char_length(phone) between 6 and 20),
  brand text not null,
  model text not null,
  year integer not null check (year between 1980 and 2100),
  km_driven integer not null check (km_driven >= 0),
  expected_price integer check (expected_price is null or expected_price >= 0),
  description text check (description is null or char_length(description) <= 2000),
  photos text[] not null default '{}' check (cardinality(photos) <= 10),
  status text not null default 'NEW' check (status in ('NEW','CONTACTED','CLOSED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sell_requests_status_idx on public.sell_requests (status, created_at desc);

drop trigger if exists sell_requests_updated on public.sell_requests;
create trigger sell_requests_updated before update on public.sell_requests
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
alter table public.bikes enable row level security;
alter table public.bike_images enable row level security;
alter table public.enquiries enable row level security;
alter table public.sell_requests enable row level security;

-- Bikes RLS: Public reads non-hidden bikes; admin has full CRUD
drop policy if exists "bikes public read" on public.bikes;
create policy "bikes public read" on public.bikes for select to anon, authenticated
  using (status <> 'HIDDEN' or public.is_admin());

drop policy if exists "bikes admin insert" on public.bikes;
create policy "bikes admin insert" on public.bikes for insert to authenticated
  with check (public.is_admin());

drop policy if exists "bikes admin update" on public.bikes;
create policy "bikes admin update" on public.bikes for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "bikes admin delete" on public.bikes;
create policy "bikes admin delete" on public.bikes for delete to authenticated
  using (public.is_admin());

-- Bike Images RLS: Public reads images of visible bikes; admin has full write
drop policy if exists "bike_images public read" on public.bike_images;
create policy "bike_images public read" on public.bike_images for select to anon, authenticated
  using (public.is_admin() or exists (select 1 from public.bikes b where b.id = bike_id and b.status <> 'HIDDEN'));

drop policy if exists "bike_images admin write" on public.bike_images;
create policy "bike_images admin write" on public.bike_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Enquiries RLS: Public inserts (status = 'NEW'); Admin reads and updates
drop policy if exists "enquiries public insert" on public.enquiries;
create policy "enquiries public insert" on public.enquiries for insert to anon, authenticated
  with check (status = 'NEW');

drop policy if exists "enquiries admin read" on public.enquiries;
create policy "enquiries admin read" on public.enquiries for select to authenticated
  using (public.is_admin());

drop policy if exists "enquiries admin update" on public.enquiries;
create policy "enquiries admin update" on public.enquiries for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "enquiries admin delete" on public.enquiries;
create policy "enquiries admin delete" on public.enquiries for delete to authenticated
  using (public.is_admin());

-- Sell Requests RLS: Public inserts (status = 'NEW'); Admin reads and updates
drop policy if exists "sell_requests public insert" on public.sell_requests;
create policy "sell_requests public insert" on public.sell_requests for insert to anon, authenticated
  with check (status = 'NEW');

drop policy if exists "sell_requests admin read" on public.sell_requests;
create policy "sell_requests admin read" on public.sell_requests for select to authenticated
  using (public.is_admin());

drop policy if exists "sell_requests admin update" on public.sell_requests;
create policy "sell_requests admin update" on public.sell_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "sell_requests admin delete" on public.sell_requests;
create policy "sell_requests admin delete" on public.sell_requests for delete to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. STORAGE BUCKETS & STORAGE RLS POLICIES
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bike-images', 'bike-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sell-photos', 'sell-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "bike-images admin insert" on storage.objects;
create policy "bike-images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'bike-images' and public.is_admin());

drop policy if exists "bike-images admin update" on storage.objects;
create policy "bike-images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'bike-images' and public.is_admin());

drop policy if exists "bike-images admin delete" on storage.objects;
create policy "bike-images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'bike-images' and public.is_admin());

drop policy if exists "sell-photos public upload" on storage.objects;
create policy "sell-photos public upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'sell-photos');

drop policy if exists "sell-photos admin read" on storage.objects;
create policy "sell-photos admin read" on storage.objects for select to authenticated
  using (bucket_id = 'sell-photos' and public.is_admin());

drop policy if exists "sell-photos admin delete" on storage.objects;
create policy "sell-photos admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'sell-photos' and public.is_admin());

-- -----------------------------------------------------------------------------
-- 8. PROMOTE USER TO ADMIN (Example)
-- -----------------------------------------------------------------------------
-- To grant admin access to a user created in Supabase Auth, run:
-- INSERT INTO public.admin_users (user_id)
-- SELECT id FROM auth.users WHERE email = 'your-admin@example.com'
-- ON CONFLICT (user_id) DO NOTHING;
