import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['', '/buy', '/sell', '/about', '/contact'].map((p) => ({
    url: `${SITE_URL}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7,
  }));
  try {
    const { data } = await createPublicClient().from('bikes').select('slug, updated_at').neq('status', 'HIDDEN');
    return [...pages, ...(data ?? []).map((b) => ({ url: `${SITE_URL}/buy/${b.slug}`, lastModified: b.updated_at, changeFrequency: 'weekly' as const, priority: 0.8 }))];
  } catch {
    return pages;
  }
}
