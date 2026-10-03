import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Bike } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918124555343').replace(/\D/g, '');
export const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || '8124555343';
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';
export const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS || 'No: 117/22, Bazaar Street, Saidapet, Chennai – 600015';
export const MAPS_PLACE_URL = 'https://www.google.com/maps/place/Selvi+Motors/@13.023081,80.2262827,19.5z/data=!4m6!3m5!1s0x3a526706101a8a85:0x2aba6a0da8aaef81!8m2!3d13.0232446!4d80.2265165';
export const MAPS_EMBED_URL = 'https://maps.google.com/maps?q=13.0232446,80.2265165&t=&z=18&ie=UTF8&iwloc=&output=embed';

export function formatPrice(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
export function formatKm(n: number) {
  return `${new Intl.NumberFormat('en-IN').format(n)} KM`;
}
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function bikeTitle(b: Pick<Bike, 'brand' | 'model' | 'variant'>) {
  return [b.brand, b.model, b.variant].filter(Boolean).join(' ');
}
export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
export function bikeUrl(slug: string) {
  return `${SITE_URL}/buy/${slug}`;
}
export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
export function bikeWhatsappMessage(b: Bike) {
  return `Hi Selvi Motors, I'm interested in the ${bikeTitle(b)} (${b.year}) listed at ${formatPrice(b.price)}.\n${bikeUrl(b.slug)}`;
}
export function sortedImages(b: Bike) {
  return [...(b.bike_images ?? [])].sort((a, c) => a.display_order - c.display_order);
}
export function coverImage(b: Bike) {
  return sortedImages(b)[0]?.image_url ?? null;
}
