import Link from 'next/link';
import Image from 'next/image';
import { EyeOff, Flame, Pencil, Star } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import BikeRowActions from '@/components/admin/BikeRowActions';
import StatusBadge from '@/components/StatusBadge';
import { bikeTitle, coverImage, formatKm } from '@/lib/utils';
import type { Bike } from '@/lib/types';

export default async function AdminBikes() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from('bikes').select('*, bike_images(id, image_url, display_order)').order('created_at', { ascending: false });
  const bikes = (data ?? []) as Bike[];
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl font-bold text-text-strong">Manage bikes</h1>

        {/* Legend for action icons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 rounded-xl border border-border/80 bg-surface px-3.5 py-1.5 text-xs text-text-strong shadow-sm">
          <div className="flex items-center gap-1.5 font-medium">
            <Star size={14} className="fill-amber-400 text-amber-500 shrink-0" />
            <span><strong className="font-bold text-dark">Star</strong> - Featured Bike</span>
          </div>
          <span className="text-border/80 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Flame size={14} className="fill-emerald-600 text-emerald-600 shrink-0" />
            <span><strong className="font-bold text-dark">Fire</strong> - New Arrival</span>
          </div>
          <span className="text-border/80 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Pencil size={14} className="text-primary shrink-0" />
            <span><strong className="font-bold text-dark">Pencil</strong> - Edit Bike</span>
          </div>
          <span className="text-border/80 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <EyeOff size={14} className="text-slate-500 shrink-0" />
            <span><strong className="font-bold text-dark">Eye</strong> - Hide from listing</span>
          </div>
        </div>

        <Link href="/admin/bikes/new" className="btn-primary !py-2 shrink-0">Add New Bike</Link>
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-red-600">{error.message}</p>}
      <ul className="space-y-3">
        {bikes.map((b) => {
          const img = coverImage(b);
          return (
            <li key={b.id} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-3.5 sm:flex-row sm:items-center shadow-sm">
              <div className="flex flex-1 items-center gap-3">
                <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-muted border border-border">{img && <Image src={img} alt="" fill sizes="96px" className="object-cover" />}</span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-text-strong">{bikeTitle(b)} {b.year}</p>
                  <p className="text-xs font-medium text-text/70">{formatKm(b.km_driven)} · {b.fuel_type}</p>
                  <StatusBadge status={b.status} className="mt-1" />
                </div>
              </div>
              <BikeRowActions bike={b} />
            </li>
          );
        })}
        {!bikes.length && <li className="rounded-xl border border-dashed border-border p-10 text-center text-text/60">No bikes yet. <Link href="/admin/bikes/new" className="text-primary font-bold hover:underline">Add your first bike</Link>.</li>}
      </ul>
    </div>
  );
}
