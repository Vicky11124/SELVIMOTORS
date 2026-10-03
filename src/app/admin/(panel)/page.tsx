import Link from 'next/link';
import Image from 'next/image';
import { requireAdmin } from '@/lib/auth';
import StatusBadge from '@/components/StatusBadge';
import { bikeTitle, coverImage, formatDate, formatPrice } from '@/lib/utils';
import type { Bike, Enquiry } from '@/lib/types';

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const head = { count: 'exact' as const, head: true };
  const [active, sold, enquiries, sells, recentBikes, recentEnq] = await Promise.all([
    count(supabase.from('bikes').select('id', head).in('status', ['AVAILABLE', 'RESERVED'])),
    count(supabase.from('bikes').select('id', head).eq('status', 'SOLD')),
    count(supabase.from('enquiries').select('id', head)),
    count(supabase.from('sell_requests').select('id', head)),
    supabase.from('bikes').select('*, bike_images(*)').order('created_at', { ascending: false }).limit(5),
    supabase.from('enquiries').select('*, bikes(brand, model, slug)').order('created_at', { ascending: false }).limit(5),
  ]);
  const stats = [
    { n: active, l: 'Active Bikes', href: '/admin/bikes' }, { n: sold, l: 'Sold Bikes', href: '/admin/bikes' },
    { n: enquiries, l: 'Enquiries', href: '/admin/enquiries' }, { n: sells, l: 'Sell Requests', href: '/admin/sell-requests' },
  ];
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-strong">Dashboard</h1>
        <Link href="/admin/bikes/new" className="btn-primary !py-2">Add New Bike</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.l} href={s.href} className="rounded-xl border border-border bg-surface p-5 hover:border-primary/50 shadow-sm transition-all">
            <p className="font-display text-3xl font-bold text-primary">{s.n}</p>
            <p className="mt-1 text-xs font-medium text-text/70">{s.l}</p>
          </Link>
        ))}
      </div>
      <section>
        <h2 className="mb-3 text-lg font-bold text-text-strong">Recent bikes</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-surface-muted text-xs font-semibold text-text border-b border-border">
              <tr>
                <th className="p-3">Bike</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-text-strong">
              {((recentBikes.data ?? []) as Bike[]).map((b) => {
                const img = coverImage(b);
                return (
                  <tr key={b.id} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="p-3">
                      <Link href={`/admin/bikes/${b.id}/edit`} className="flex items-center gap-3 font-semibold text-text-strong hover:text-primary">
                        <span className="relative h-10 w-12 shrink-0 overflow-hidden rounded-md bg-surface-muted border border-border">{img && <Image src={img} alt="" fill sizes="48px" className="object-cover" />}</span>
                        {bikeTitle(b)} {b.year}
                      </Link>
                    </td>
                    <td className="p-3 font-bold text-primary">{formatPrice(b.price)}</td>
                    <td className="p-3"><StatusBadge status={b.status} /></td>
                    <td className="p-3 text-xs text-text/70">{formatDate(b.created_at)}</td>
                  </tr>
                );
              })}
              {!recentBikes.data?.length && <tr><td colSpan={4} className="p-6 text-center text-text/60">No bikes yet. Add your first bike.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold text-text-strong">Recent enquiries</h2>
        <ul className="divide-y divide-border rounded-xl border border-border bg-surface shadow-sm">
          {((recentEnq.data ?? []) as Enquiry[]).map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 p-3.5 text-sm text-text-strong">
              <span><strong className="text-text-strong">{e.customer_name}</strong> <a href={`tel:${e.phone}`} className="text-text/70 hover:text-primary transition-colors">{e.phone}</a>{e.bikes && <span className="text-text/60"> · {e.bikes.brand} {e.bikes.model}</span>}</span>
              <span className="text-xs text-text/60">{formatDate(e.created_at)}</span>
            </li>
          ))}
          {!recentEnq.data?.length && <li className="p-6 text-center text-sm text-text/60">No enquiries yet.</li>}
        </ul>
      </section>
    </div>
  );
}
