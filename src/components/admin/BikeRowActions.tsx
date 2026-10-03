'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { EyeOff, Flame, Pencil, Star } from 'lucide-react';
import { deleteBike, setBikeFeatured, setBikeNewArrival, setBikePrice, setBikeStatus } from '@/app/admin/actions';
import { BIKE_STATUSES, type Bike, type BikeStatus } from '@/lib/types';
import { NativeDelete } from '@/components/ui/delete-button';

export default function BikeRowActions({ bike }: { bike: Bike }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  const [price, setPrice] = useState(String(bike.price));

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => { const r = await fn(); setError(r.ok ? '' : r.error ?? 'Failed'); });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select aria-label={`Status of ${bike.model}`} disabled={pending} defaultValue={bike.status} key={bike.status} className="field !w-auto !py-1.5 text-xs"
        onChange={(e) => run(() => setBikeStatus(bike.id, e.target.value as BikeStatus))}>
        {BIKE_STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>
      <input aria-label={`Price of ${bike.model}`} type="number" min={0} value={price} disabled={pending} onChange={(e) => setPrice(e.target.value)}
        onBlur={() => Number(price) !== bike.price && run(() => setBikePrice(bike.id, Number(price)))} className="field !w-28 !py-1.5 text-xs" />
      <button aria-label={bike.featured ? 'Remove from featured' : 'Mark featured'} title={bike.featured ? 'Featured on home' : 'Mark featured'} aria-pressed={bike.featured} disabled={pending}
        onClick={() => run(() => setBikeFeatured(bike.id, !bike.featured))} className="rounded p-1.5 hover:bg-white/10">
        <Star size={16} className={bike.featured ? 'fill-amber-400 text-amber-400' : 'text-muted'} />
      </button>
      <button aria-label={bike.new_arrival ? 'Remove from New Arrivals' : 'Mark as New Arrival'} title={bike.new_arrival ? 'In New Arrivals hero slideshow' : 'Mark as New Arrival'} aria-pressed={bike.new_arrival} disabled={pending}
        onClick={() => run(() => setBikeNewArrival(bike.id, !bike.new_arrival))} className="rounded p-1.5 hover:bg-white/10">
        <Flame size={16} className={bike.new_arrival ? 'fill-brand text-brand' : 'text-muted'} />
      </button>
      <Link href={`/admin/bikes/${bike.id}/edit`} aria-label="Edit" className="rounded p-1.5 hover:bg-white/10"><Pencil size={16} /></Link>
      <button aria-label="Hide bike" disabled={pending || bike.status === 'HIDDEN'} onClick={() => run(() => setBikeStatus(bike.id, 'HIDDEN'))} className="rounded p-1.5 hover:bg-white/10 disabled:opacity-30"><EyeOff size={16} /></button>
      
      <NativeDelete
        size="sm"
        disabled={pending}
        buttonText="Delete"
        confirmText="Confirm"
        onDelete={() => run(() => deleteBike(bike.id))}
      />
      {error && <span role="alert" className="w-full text-xs text-brand">{error}</span>}
    </div>
  );
}
