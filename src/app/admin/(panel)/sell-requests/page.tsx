import { requireAdmin } from '@/lib/auth';
import SellRequestsList from '@/components/admin/SellRequestsList';
import type { SellRequest } from '@/lib/types';

export default async function AdminSellRequests({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
  const pageSize = 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { supabase } = await requireAdmin();
  const { data, count } = await supabase
    .from('sell_requests')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const list = (data ?? []) as SellRequest[];

  // Collect photo paths strictly for the current page's 25 requests
  const pagePhotoPaths: string[] = [];
  list.forEach((r) => {
    if (Array.isArray(r.photos)) {
      r.photos.forEach((p) => {
        if (p && typeof p === 'string') pagePhotoPaths.push(p);
      });
    }
  });

  const urlMap = new Map<string, string>();
  if (pagePhotoPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from('sell-photos')
      .createSignedUrls(pagePhotoPaths, 3600);
    (signed ?? []).forEach((item) => {
      if (item.path && item.signedUrl) {
        urlMap.set(item.path, item.signedUrl);
      }
    });
  }

  const withPhotos = list.map((r) => ({
    r,
    urls: (r.photos ?? [])
      .map((p) => urlMap.get(p))
      .filter(Boolean) as string[],
  }));

  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <SellRequestsList
      initialList={withPhotos}
      page={page}
      totalPages={totalPages}
      totalCount={count ?? 0}
    />
  );
}
