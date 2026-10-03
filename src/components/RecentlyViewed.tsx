'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { History, Trash2, ArrowRight } from 'lucide-react';
import type { Bike } from '@/lib/types';
import { coverImage, formatKm, formatPrice, bikeTitle } from '@/lib/utils';
import StatusBadge from './StatusBadge';

export interface StoredBike {
  id: string;
  slug: string;
  title: string;
  year: number;
  price: number;
  km_driven: number;
  fuel_type: string;
  status: Bike['status'];
  image: string | null;
  viewedAt: number;
}

const STORAGE_KEY = 'selvi_recently_viewed_bikes';
const MAX_RECENT = 8;

export function RecentlyViewedTracker({ bike }: { bike: Bike }) {
  useEffect(() => {
    if (!bike || !bike.slug) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: StoredBike[] = raw ? JSON.parse(raw) : [];
      
      const item: StoredBike = {
        id: bike.id,
        slug: bike.slug,
        title: bikeTitle(bike),
        year: bike.year,
        price: bike.price,
        km_driven: bike.km_driven,
        fuel_type: bike.fuel_type,
        status: bike.status,
        image: coverImage(bike) || null,
        viewedAt: Date.now(),
      };

      // Filter out current bike if already present, then prepend to top
      const updated = [item, ...existing.filter((b) => b.id !== bike.id)].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage may be disabled or quota exceeded
    }
  }, [bike]);

  return null;
}

export function RecentlyViewedSection({ excludeSlug }: { excludeSlug?: string }) {
  const [recentBikes, setRecentBikes] = useState<StoredBike[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list: StoredBike[] = JSON.parse(raw);
        setRecentBikes(list);
      }
    } catch {
      // Ignore parse error
    }
  }, []);

  const clearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentBikes([]);
    } catch {
      // Ignore error
    }
  };

  if (!mounted) return null;

  const filtered = excludeSlug
    ? recentBikes.filter((b) => b.slug !== excludeSlug)
    : recentBikes;

  if (filtered.length === 0) return null;

  return (
    <section className="mt-12 sm:mt-16 border-t border-border/60 pt-8 sm:pt-10">
      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <History size={16} />
          </div>
          <h2 className="text-base sm:text-xl font-bold uppercase tracking-wider text-text-strong">
            Recently Viewed
          </h2>
          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-bold text-text/70">
            {filtered.length}
          </span>
        </div>

        <button
          type="button"
          onClick={clearHistory}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text/70 hover:text-red-600 transition-colors"
          title="Clear browsing history"
        >
          <Trash2 size={13} />
          <span className="hidden sm:inline">Clear History</span>
        </button>
      </div>

      {/* Responsive Horizontal Scroll / Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((b) => {
          const sold = b.status === 'SOLD';
          return (
            <article
              key={b.id}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <Link href={`/buy/${b.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-surface-muted shrink-0">
                {b.image ? (
                  <Image
                    src={b.image}
                    alt={b.title}
                    fill
                    sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                      sold ? 'grayscale' : ''
                    }`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-text/50">
                    No photo
                  </div>
                )}
                <StatusBadge status={b.status} className="absolute left-2 top-2 shadow-sm scale-90 origin-top-left" />
              </Link>
              <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold truncate text-text-strong group-hover:text-primary transition-colors">
                    {b.title}
                  </h3>
                  <p className="mt-1 text-[11px] sm:text-xs font-medium text-text/70">
                    {b.year} • {formatKm(b.km_driven)}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between">
                  <p className="font-display text-sm sm:text-base font-extrabold text-primary">
                    {formatPrice(b.price)}
                  </p>
                  <Link
                    href={`/buy/${b.slug}`}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    View <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
