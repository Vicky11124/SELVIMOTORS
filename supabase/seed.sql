-- =============================================================================
-- SELVI MOTORS - SAMPLE BIKES SEED SCRIPT
-- Run this in Supabase SQL Editor to insert test bikes
-- =============================================================================

-- Ensure new_arrival column exists
alter table if exists public.bikes add column if not exists new_arrival boolean not null default false;
create index if not exists bikes_new_arrival_idx on public.bikes (new_arrival) where new_arrival;

-- 1. Royal Enfield Hunter 350
INSERT INTO public.bikes (
  id, brand, model, variant, slug, price, year, km_driven, fuel_type,
  transmission, owner_count, registration_number, condition, location,
  description, status, featured, new_arrival
) VALUES (
  '11111111-1111-4111-a111-111111111111',
  'Royal Enfield',
  'Hunter 350',
  'Dapper Ash',
  'royal-enfield-hunter-350-dapper-ash-2023',
  155000,
  2023,
  6400,
  'Petrol',
  'Manual',
  1,
  'TN 09 BX 4521',
  'Mint Condition',
  'Chennai, Tamil Nadu',
  'Single owner, doctor-driven Royal Enfield Hunter 350 in immaculate condition. Timely showroom serviced with complete service records. Includes genuine touring mirror accessories and crash guard.',
  'AVAILABLE',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  new_arrival = EXCLUDED.new_arrival;

INSERT INTO public.bike_images (id, bike_id, image_url, storage_path, display_order)
VALUES (
  '11111111-1111-4111-b111-111111111111',
  '11111111-1111-4111-a111-111111111111',
  '/bikes/hunter-350.jpg',
  '11111111-1111-4111-a111-111111111111/hunter-350.jpg',
  0
) ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url;


-- 2. Yamaha MT-15 V2
INSERT INTO public.bikes (
  id, brand, model, variant, slug, price, year, km_driven, fuel_type,
  transmission, owner_count, registration_number, condition, location,
  description, status, featured, new_arrival
) VALUES (
  '22222222-2222-4222-a222-222222222222',
  'Yamaha',
  'MT-15',
  'V2 Metallic Cyan',
  'yamaha-mt-15-v2-metallic-cyan-2023',
  142000,
  2023,
  8200,
  'Petrol',
  'Manual',
  1,
  'TN 07 CW 7819',
  'Excellent Condition',
  'Chennai, Tamil Nadu',
  'Yamaha MT-15 Version 2.0 with Bluetooth Y-Connect, USD Golden Forks, and dual-channel ABS. First owner, non-accidental, brand new rear tyre.',
  'AVAILABLE',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  new_arrival = EXCLUDED.new_arrival;

INSERT INTO public.bike_images (id, bike_id, image_url, storage_path, display_order)
VALUES (
  '22222222-2222-4222-b222-222222222222',
  '22222222-2222-4222-a222-222222222222',
  '/bikes/yamaha-mt15.jpg',
  '22222222-2222-4222-a222-222222222222/yamaha-mt15.jpg',
  0
) ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url;


-- 3. KTM 390 Duke
INSERT INTO public.bikes (
  id, brand, model, variant, slug, price, year, km_driven, fuel_type,
  transmission, owner_count, registration_number, condition, location,
  description, status, featured, new_arrival
) VALUES (
  '33333333-3333-4333-a333-333333333333',
  'KTM',
  '390 Duke',
  'ABS Quickshifter+',
  'ktm-390-duke-abs-2022',
  235000,
  2022,
  12500,
  'Petrol',
  'Manual',
  1,
  'TN 10 EF 9904',
  'Like New',
  'Chennai, Tamil Nadu',
  'Aggressive street naked KTM 390 Duke with bi-directional Quickshifter+, TFT color display, cornering ABS, and Supermoto mode. Full company service history, pristine mechanical condition.',
  'AVAILABLE',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  new_arrival = EXCLUDED.new_arrival;

INSERT INTO public.bike_images (id, bike_id, image_url, storage_path, display_order)
VALUES (
  '33333333-3333-4333-b333-333333333333',
  '33333333-3333-4333-a333-333333333333',
  '/bikes/ktm-duke-390.jpg',
  '33333333-3333-4333-a333-333333333333/ktm-duke-390.jpg',
  0
) ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url;
