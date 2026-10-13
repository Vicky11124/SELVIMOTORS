import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/utils';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/buy`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sell`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    const { data } = await createPublicClient()
      .from('bikes')
      .select('slug, updated_at')
      .neq('status', 'HIDDEN');

    const bikeRoutes: MetadataRoute.Sitemap = (data ?? []).map((b) => ({
      url: `${SITE_URL}/buy/${b.slug}`,
      lastModified: b.updated_at ? new Date(b.updated_at) : now,
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    return [...coreRoutes, ...bikeRoutes];
  } catch {
    return coreRoutes;
  }
}
