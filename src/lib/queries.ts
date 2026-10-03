import { cache } from 'react';
import { createPublicClient } from './supabase/server';
import type { Bike } from './types';

const LISTING_BIKE_SELECT = '*, bike_images(id, image_url, display_order)';
const DETAIL_BIKE_SELECT = '*, bike_images(*)';

export interface BikeFilters {
  q?: string;
  brand?: string;
  model?: string;
  price?: string; // "min-max"
  year?: string; // min year
  fuel?: string;
  transmission?: string;
  km?: string; // max km
  sort?: string;
  page?: number | string;
}

export interface GetBikesResult {
  bikes: Bike[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getBikes = cache(async (f: BikeFilters = {}): Promise<GetBikesResult> => {
  const pageSize = 12;
  const rawPage = parseInt(String(f.page ?? '1'), 10);
  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const supabase = createPublicClient();

  const buildQuery = (countExact = false) => {
    let query = supabase
      .from('bikes')
      .select(LISTING_BIKE_SELECT, countExact ? { count: 'exact' } : undefined)
      .neq('status', 'HIDDEN');

    const q = f.q?.replace(/[%,()*]/g, ' ').trim();
    if (q) query = query.or(`brand.ilike.%${q}%,model.ilike.%${q}%,variant.ilike.%${q}%`);
    if (f.brand) query = query.eq('brand', f.brand);
    if (f.model) query = query.eq('model', f.model);
    if (f.price) {
      const [min, max] = f.price.split('-').map(Number);
      if (Number.isFinite(min)) query = query.gte('price', min);
      if (Number.isFinite(max)) query = query.lte('price', max);
    }
    if (f.year && Number(f.year)) query = query.gte('year', Number(f.year));
    if (f.fuel) query = query.eq('fuel_type', f.fuel);
    if (f.transmission) query = query.eq('transmission', f.transmission);
    if (f.km && Number(f.km)) query = query.lte('km_driven', Number(f.km));

    switch (f.sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'year_desc':
        query = query.order('year', { ascending: false });
        break;
      case 'km_asc':
        query = query.order('km_driven', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }
    return query;
  };

  const from = (requestedPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const res = await buildQuery(true).range(from, to);
  const data = res.data;
  const count = res.count;
  const error = res.error;

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // If PostgREST returns Range Not Satisfiable (PGRST103) because requestedPage > totalPages
  if (error && (error.code === 'PGRST103' || error.message.includes('range'))) {
    const validPage = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;
    const validFrom = (validPage - 1) * pageSize;
    const validTo = validFrom + pageSize - 1;
    const fallbackRes = await buildQuery(true).range(validFrom, validTo);
    if (!fallbackRes.error) {
      const fbTotal = fallbackRes.count ?? total;
      const fbTotalPages = Math.ceil(fbTotal / pageSize);
      return {
        bikes: (fallbackRes.data ?? []) as Bike[],
        total: fbTotal,
        page: fbTotalPages > 0 ? validPage : 1,
        pageSize,
        totalPages: fbTotalPages,
      };
    }
  }

  if (error) throw new Error(error.message);

  let page = requestedPage;
  let bikesData = data;

  if (total > 0 && requestedPage > totalPages) {
    page = totalPages;
    const validFrom = (page - 1) * pageSize;
    const validTo = validFrom + pageSize - 1;
    const { data: reData, error: reError } = await buildQuery(false).range(validFrom, validTo);
    if (!reError && reData) {
      bikesData = reData;
    }
  }

  return {
    bikes: (bikesData ?? []) as Bike[],
    total,
    page: totalPages > 0 ? page : 1,
    pageSize,
    totalPages,
  };
});

export const getFeaturedBikes = cache(async (limit = 4): Promise<Bike[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('bikes')
    .select(LISTING_BIKE_SELECT)
    .eq('featured', true)
    .in('status', ['AVAILABLE', 'RESERVED'])
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Bike[];
});

export const getNewArrivalBikes = cache(async (limit = 6): Promise<Bike[]> => {
  const supabase = createPublicClient();
  // Try fetching bikes explicitly marked with new_arrival: true
  const { data: arrivals } = await supabase
    .from('bikes')
    .select(LISTING_BIKE_SELECT)
    .eq('new_arrival', true)
    .in('status', ['AVAILABLE', 'RESERVED'])
    .order('created_at', { ascending: false })
    .limit(limit);

  const list = (arrivals ?? []) as Bike[];

  if (list.length >= limit) {
    return list;
  }

  // Fill up with latest available bikes so real database bikes with valid slugs are returned
  const existingIds = new Set(list.map((b) => b.id));
  const { data: latest } = await supabase
    .from('bikes')
    .select(LISTING_BIKE_SELECT)
    .in('status', ['AVAILABLE', 'RESERVED'])
    .order('created_at', { ascending: false })
    .limit(limit * 2);

  if (latest) {
    for (const b of latest as Bike[]) {
      if (!existingIds.has(b.id)) {
        list.push(b);
        existingIds.add(b.id);
        if (list.length >= limit) break;
      }
    }
  }

  return list;
});

export const getBikeBySlug = cache(async (slug: string): Promise<Bike | null> => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('bikes')
    .select(DETAIL_BIKE_SELECT)
    .eq('slug', slug)
    .neq('status', 'HIDDEN')
    .maybeSingle();
  return (data as Bike | null) ?? null;
});

export const getBrands = cache(async (): Promise<string[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from('bikes').select('brand').neq('status', 'HIDDEN');
  return Array.from(new Set((data ?? []).map((r) => r.brand as string))).sort();
});

export const getSimilarBikes = cache(async (bike: Bike, limit = 4): Promise<Bike[]> => {
  const supabase = createPublicClient();
  const minPrice = Math.round(bike.price * 0.65);
  const maxPrice = Math.round(bike.price * 1.35);

  // 1. Fetch bikes of same brand OR similar price range
  const { data: primary } = await supabase
    .from('bikes')
    .select(LISTING_BIKE_SELECT)
    .neq('status', 'HIDDEN')
    .neq('id', bike.id)
    .or(`brand.eq."${bike.brand}",and(price.gte.${minPrice},price.lte.${maxPrice})`)
    .in('status', ['AVAILABLE', 'RESERVED'])
    .order('created_at', { ascending: false })
    .limit(limit);

  const matched = (primary ?? []) as Bike[];
  if (matched.length >= limit) {
    return matched.slice(0, limit);
  }

  // 2. If fewer than limit, backfill with latest available inventory
  const existingIds = new Set([bike.id, ...matched.map((b) => b.id)]);
  const { data: fallback } = await supabase
    .from('bikes')
    .select(LISTING_BIKE_SELECT)
    .neq('status', 'HIDDEN')
    .in('status', ['AVAILABLE', 'RESERVED'])
    .order('created_at', { ascending: false })
    .limit(limit + 2);

  const backfill = ((fallback ?? []) as Bike[]).filter((b) => !existingIds.has(b.id));
  return [...matched, ...backfill].slice(0, limit);
});

