import Link from 'next/link';
import Image from 'next/image';
import type { Bike } from '@/lib/types';
import { bikeTitle, coverImage, formatKm, formatPrice } from '@/lib/utils';
import StatusBadge from './StatusBadge';

export default function BikeCard({ bike }: { bike: Bike }) {
  const img = coverImage(bike);
  const sold = bike.status === 'SOLD';
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md">
      <Link href={`/buy/${bike.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-surface-muted shrink-0">
        {img ? (
          <Image
            src={img}
            alt={bikeTitle(bike)}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${sold ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text/50">No photo yet</div>
        )}
        <StatusBadge status={bike.status} className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5 shadow-sm" />
      </Link>
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          {/* Locked 2-line title height */}
          <h3 className="text-xs sm:text-base font-bold leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem] text-text-strong group-hover:text-primary transition-colors">
            {bikeTitle(bike)}
          </h3>
          <p className="mt-1 text-[10.5px] text-text/70 sm:text-xs truncate font-medium">
            {bike.year} • {formatKm(bike.km_driven)} • {bike.fuel_type}
          </p>
        </div>

        {/* Locked bottom price & View Details button */}
        <div className="mt-auto pt-2.5 sm:pt-3 flex flex-col">
          <p className="font-display text-base font-extrabold text-primary sm:text-xl">
            {formatPrice(bike.price)}
          </p>
          <Link
            href={`/buy/${bike.slug}`}
            className="mt-2 rounded-lg border border-primary/30 bg-surface/80 py-1.5 text-center text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white sm:mt-3 sm:py-2 sm:text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
