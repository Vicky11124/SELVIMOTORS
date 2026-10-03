'use server';
import { createPublicClient } from '@/lib/supabase/server';

export type ActionResult = { ok: true } | { ok: false; error: string };

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const validPhone = (p: string) => /^[+\d][\d\s-]{5,18}$/.test(p);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function submitEnquiry(input: {
  bikeId?: string | null; name: string; phone: string; email?: string; message?: string; website?: string;
}): Promise<ActionResult> {
  if (input.website) return { ok: true }; // honeypot
  const name = str(input.name, 120);
  const phone = str(input.phone, 20);
  const email = str(input.email, 160);
  if (!name) return { ok: false, error: 'Enter your name.' };
  if (!validPhone(phone)) return { ok: false, error: 'Enter a valid phone number.' };
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Enter a valid email address.' };
  const bikeId = input.bikeId && UUID.test(input.bikeId) ? input.bikeId : null;

  const { error } = await createPublicClient().from('enquiries').insert({
    bike_id: bikeId, customer_name: name, phone, email: email || null, message: str(input.message, 2000) || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function submitSellRequest(input: {
  name: string; phone: string; brand: string; model: string; year: number; km: number;
  expectedPrice?: number | null; description?: string; photos: string[]; uploadId: string; website?: string;
}): Promise<ActionResult> {
  if (input.website) return { ok: true };
  const name = str(input.name, 120);
  const phone = str(input.phone, 20);
  const brand = str(input.brand, 60);
  const model = str(input.model, 80);
  const year = Number(input.year);
  const km = Number(input.km);
  const price = input.expectedPrice == null || Number.isNaN(Number(input.expectedPrice)) ? null : Number(input.expectedPrice);
  if (!name) return { ok: false, error: 'Enter your name.' };
  if (!validPhone(phone)) return { ok: false, error: 'Enter a valid phone number.' };
  if (!brand || !model) return { ok: false, error: 'Enter the brand and model.' };
  if (!Number.isInteger(year) || year < 1980 || year > new Date().getFullYear() + 1) return { ok: false, error: 'Enter a valid year.' };
  if (!Number.isFinite(km) || km < 0) return { ok: false, error: 'Enter the kilometres driven.' };
  if (price !== null && price < 0) return { ok: false, error: 'Enter a valid expected price.' };
  if (!UUID.test(input.uploadId)) return { ok: false, error: 'Invalid upload session. Refresh and try again.' };
  const photos = (Array.isArray(input.photos) ? input.photos : [])
    .filter((p) => typeof p === 'string' && p.startsWith(`${input.uploadId}/`) && !p.includes('..'))
    .slice(0, 10);

  const { error } = await createPublicClient().from('sell_requests').insert({
    customer_name: name, phone, brand, model, year, km_driven: Math.round(km),
    expected_price: price === null ? null : Math.round(price), description: str(input.description, 2000) || null, photos,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
