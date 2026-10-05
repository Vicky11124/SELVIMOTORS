'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { BIKE_STATUSES, FUEL_TYPES, LEAD_STATUSES, TRANSMISSIONS, type BikeStatus, type LeadStatus } from '@/lib/types';
import { slugify } from '@/lib/utils';

export type SaveResult = { ok: true; id: string } | { ok: false; error: string };
type Simple = { ok: true } | { ok: false; error: string };

export interface BikeInput {
  id: string;
  isNew: boolean;
  brand: string; model: string; variant: string;
  price: number; year: number; km_driven: number;
  fuel_type: string; transmission: string; owner_count: number;
  registration_number: string; condition: string; location: string; description: string;
  status: BikeStatus; featured: boolean; new_arrival?: boolean;
  keepImageIds: string[]; // existing images, in display order
  removedImages: { id: string; storage_path: string }[];
  newImagePaths: string[]; // already uploaded by the browser, in display order
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function refresh(slug?: string) {
  revalidatePath('/', 'page');
  revalidatePath('/buy', 'page');
  revalidatePath('/sell', 'page');
  revalidatePath('/buy/[slug]', 'page');
  if (slug) revalidatePath(`/buy/${slug}`, 'page');
  revalidatePath('/admin', 'layout');
}

export async function saveBike(input: BikeInput): Promise<SaveResult> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(input.id)) return { ok: false, error: 'Invalid bike id.' };

  const brand = clean(input.brand, 60), model = clean(input.model, 80);
  if (!brand || !model) return { ok: false, error: 'Brand and model are required.' };
  const price = Math.round(Number(input.price)), year = Math.round(Number(input.year));
  const km = Math.round(Number(input.km_driven)), owners = Math.round(Number(input.owner_count));
  if (!(price >= 0)) return { ok: false, error: 'Enter a valid price.' };
  if (!(year >= 1980 && year <= new Date().getFullYear() + 1)) return { ok: false, error: 'Enter a valid year.' };
  if (!(km >= 0)) return { ok: false, error: 'Enter valid kilometres driven.' };
  if (!(owners >= 1)) return { ok: false, error: 'Owner count must be at least 1.' };
  if (!(FUEL_TYPES as readonly string[]).includes(input.fuel_type)) return { ok: false, error: 'Invalid fuel type.' };
  if (!(TRANSMISSIONS as readonly string[]).includes(input.transmission)) return { ok: false, error: 'Invalid transmission.' };
  if (!BIKE_STATUSES.includes(input.status)) return { ok: false, error: 'Invalid status.' };
  if (input.newImagePaths.some((p) => !p.startsWith(`${input.id}/`) || p.includes('..'))) return { ok: false, error: 'Invalid image path.' };

  const fields = {
    brand, model, variant: clean(input.variant, 80) || null, price, year, km_driven: km,
    fuel_type: input.fuel_type, transmission: input.transmission, owner_count: owners,
    registration_number: clean(input.registration_number, 30) || null, condition: clean(input.condition, 60) || null,
    location: clean(input.location, 120) || null, description: clean(input.description, 5000) || null,
    status: input.status, featured: !!input.featured, new_arrival: !!input.new_arrival,
  };

  let slug: string;
  if (input.isNew) {
    const base = slugify([brand, model, fields.variant, year].filter(Boolean).join(' '));
    slug = base;
    for (let n = 2; ; n++) {
      const { data } = await supabase.from('bikes').select('id').eq('slug', slug).maybeSingle();
      if (!data) break;
      slug = `${base}-${n}`;
    }
    const insertFields: Record<string, unknown> = { id: input.id, slug, ...fields };
    let { error } = await supabase.from('bikes').insert(insertFields);
    if (error && error.message.includes('new_arrival')) {
      const { new_arrival: _new_arrival, ...fallbackFields } = fields;
      const res = await supabase.from('bikes').insert({ id: input.id, slug, ...fallbackFields });
      error = res.error;
    }
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: existing } = await supabase.from('bikes').select('slug').eq('id', input.id).single();
    if (!existing) return { ok: false, error: 'Bike not found.' };
    slug = existing.slug;
    let { error } = await supabase.from('bikes').update(fields).eq('id', input.id);
    if (error && error.message.includes('new_arrival')) {
      const { new_arrival: _new_arrival, ...fallbackFields } = fields;
      const res = await supabase.from('bikes').update(fallbackFields).eq('id', input.id);
      error = res.error;
    }
    if (error) return { ok: false, error: error.message };
  }

  // Removed images
  if (input.removedImages.length) {
    const ids = input.removedImages.map((i) => i.id).filter((i) => UUID.test(i));
    await supabase.from('bike_images').delete().eq('bike_id', input.id).in('id', ids);
    const paths = input.removedImages.map((i) => i.storage_path).filter((p) => p.startsWith(`${input.id}/`));
    if (paths.length) await supabase.storage.from('bike-images').remove(paths);
  }
  // Re-order kept images
  await Promise.all(input.keepImageIds.filter((i) => UUID.test(i)).map((imgId, idx) =>
    supabase.from('bike_images').update({ display_order: idx }).eq('id', imgId).eq('bike_id', input.id)));
  // New images
  if (input.newImagePaths.length) {
    const start = input.keepImageIds.length;
    const rows = input.newImagePaths.map((path, i) => ({
      bike_id: input.id, storage_path: path, display_order: start + i,
      image_url: supabase.storage.from('bike-images').getPublicUrl(path).data.publicUrl,
    }));
    const { error } = await supabase.from('bike_images').insert(rows);
    if (error) return { ok: false, error: `Bike saved, but images failed: ${error.message}` };
  }
  refresh(slug);
  return { ok: true, id: input.id };
}

export async function setBikeStatus(id: string, status: BikeStatus): Promise<Simple> {
  const { supabase } = await requireAdmin();
  if (!BIKE_STATUSES.includes(status)) return { ok: false, error: 'Invalid status.' };
  const { data, error } = await supabase.from('bikes').update({ status }).eq('id', id).select('slug').single();
  if (error) return { ok: false, error: error.message };
  refresh(data?.slug);
  return { ok: true };
}

export async function setBikeFeatured(id: string, featured: boolean): Promise<Simple> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from('bikes').update({ featured }).eq('id', id).select('slug').single();
  if (error) return { ok: false, error: error.message };
  refresh(data?.slug);
  return { ok: true };
}

export async function setBikeNewArrival(id: string, new_arrival: boolean): Promise<Simple> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from('bikes').update({ new_arrival }).eq('id', id).select('slug').single();
  if (error) {
    if (error.message.includes('new_arrival')) {
      return {
        ok: false,
        error: "Please run in Supabase SQL Editor: ALTER TABLE public.bikes ADD COLUMN IF NOT EXISTS new_arrival BOOLEAN NOT NULL DEFAULT false;",
      };
    }
    return { ok: false, error: error.message };
  }
  refresh(data?.slug);
  return { ok: true };
}

export async function setBikePrice(id: string, price: number): Promise<Simple> {
  const { supabase } = await requireAdmin();
  const p = Math.round(Number(price));
  if (!(p >= 0)) return { ok: false, error: 'Enter a valid price.' };
  const { data, error } = await supabase.from('bikes').update({ price: p }).eq('id', id).select('slug').single();
  if (error) return { ok: false, error: error.message };
  refresh(data?.slug);
  return { ok: true };
}

export async function deleteBike(id: string): Promise<Simple> {
  const { supabase } = await requireAdmin();
  const { data: imgs } = await supabase.from('bike_images').select('storage_path').eq('bike_id', id);
  const { data: bike, error } = await supabase.from('bikes').delete().eq('id', id).select('slug').single();
  if (error) return { ok: false, error: error.message };
  const paths = (imgs ?? []).map((i) => i.storage_path);
  if (paths.length) await supabase.storage.from('bike-images').remove(paths);
  refresh(bike?.slug);
  return { ok: true };
}

export async function setLeadStatus(table: 'enquiries' | 'sell_requests', id: string, status: LeadStatus): Promise<Simple> {
  const { supabase } = await requireAdmin();
  if (table !== 'enquiries' && table !== 'sell_requests') return { ok: false, error: 'Invalid table.' };
  if (!LEAD_STATUSES.includes(status)) return { ok: false, error: 'Invalid status.' };
  const { error } = await supabase.from(table).update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function setBulkLeadStatus(
  table: 'enquiries' | 'sell_requests',
  ids: string[],
  status: LeadStatus
): Promise<Simple> {
  const { supabase } = await requireAdmin();
  if (table !== 'enquiries' && table !== 'sell_requests') return { ok: false, error: 'Invalid table.' };
  if (!LEAD_STATUSES.includes(status)) return { ok: false, error: 'Invalid status.' };
  const validIds = ids.filter((id) => UUID.test(id));
  if (!validIds.length) return { ok: false, error: 'No items selected.' };

  const { error } = await supabase.from(table).update({ status }).in('id', validIds);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function deleteLead(
  table: 'enquiries' | 'sell_requests',
  id: string
): Promise<Simple> {
  return deleteBulkLeads(table, [id]);
}

export async function deleteBulkLeads(
  table: 'enquiries' | 'sell_requests',
  ids: string[]
): Promise<Simple> {
  const { supabase } = await requireAdmin();
  if (table !== 'enquiries' && table !== 'sell_requests') return { ok: false, error: 'Invalid table.' };
  const validIds = ids.filter((id) => UUID.test(id));
  if (!validIds.length) return { ok: false, error: 'No items selected.' };

  if (table === 'sell_requests') {
    const { data: records } = await supabase.from('sell_requests').select('photos').in('id', validIds);
    const allPhotos = (records ?? []).flatMap((r) => (Array.isArray(r.photos) ? r.photos : []));
    if (allPhotos.length) {
      await supabase.storage.from('sell-photos').remove(allPhotos);
    }
  }

  const { error } = await supabase.from(table).delete().in('id', validIds);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

export async function signInAdmin(email: string, pass: string): Promise<Simple> {
  try {
    const supabase = await createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (err) return { ok: false, error: err.message || 'Incorrect email or password.' };

    const { data: isAdmin, error: rpcErr } = await supabase.rpc('is_admin');
    if (rpcErr) {
      await supabase.auth.signOut();
      return { ok: false, error: `RPC Error: ${rpcErr.message}` };
    }
    if (!isAdmin) {
      await supabase.auth.signOut();
      return { ok: false, error: 'This account does not have admin access.' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Login failed.' };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

