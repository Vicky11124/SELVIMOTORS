import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import BikeCard from '@/components/BikeCard';
import BikeFilters from '@/components/BikeFilters';
import Pagination from '@/components/Pagination';
import { RecentlyViewedSection } from '@/components/RecentlyViewed';
import { getBikes, getBrands, type BikeFilters as Filters } from '@/lib/queries';
import type { Bike } from '@/lib/types';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Buy Pre-Owned Motorcycles',
  description: 'Browse verified pre-owned motorcycles. Filter by brand, price, year, fuel type, transmission and kilometres driven.',
  alternates: { canonical: '/buy' },
  openGraph: { title: 'Buy Pre-Owned Motorcycles | Selvi Motors', url: '/buy' },
};

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BuyPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const filters: Filters = {
    q: one(sp.q),
    brand: one(sp.brand),
    model: one(sp.model),
    price: one(sp.price),
    year: one(sp.year),
    fuel: one(sp.fuel),
    transmission: one(sp.transmission),
    km: one(sp.km),
    sort: one(sp.sort),
    page: one(sp.page),
  };

  let bikes: Bike[] = [];
  let brands: string[] = [];
  let total = 0;
  let page = 1;
  let totalPages = 0;
  let failed = false;

  try {
    const [result, brandList] = await Promise.all([getBikes(filters), getBrands()]);
    bikes = result.bikes;
    total = result.total;
    page = result.page;
    totalPages = result.totalPages;
    brands = brandList;
  } catch {
    failed = true;
  }

  return (
    <div className="relative min-h-screen">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(14,59,46,0.12),rgba(247,242,232,0))]" />

      <div className="container-x py-8 sm:py-14">
        {/* Centered Hero Header */}
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
          <div className="animate-slide-left inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-4 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Verified Pre-Owned Inventory
          </div>

          <h1 className="animate-slide-left-delay-1 font-display text-4xl font-extrabold uppercase tracking-tight text-[#111816] sm:text-6xl sm:leading-[1.1]">
            BUY PRE-OWNED. <span className="block text-[#0E3B2E]">FIND YOUR RIDE.</span>
          </h1>

          <p className="animate-slide-left-delay-2 mx-auto mt-4 max-w-xl text-sm text-text/80 sm:text-base leading-relaxed">
            Explore our wide range of thoroughly inspected & verified motorcycles. Every ride is certified ready for the road.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="relative z-20 rounded-2xl border border-border bg-surface p-3.5 sm:p-5 shadow-md">
          <Suspense>
            <BikeFilters brands={brands} totalAvailable={total} />
          </Suspense>
        </div>

        {/* Results Counter */}
        <div id="inventory-grid" className="mb-4 mt-6 flex items-center justify-between sm:mb-6 sm:mt-8 scroll-mt-24">
          <p className="text-xs font-semibold text-text-strong sm:text-sm">
            <span className="text-primary font-bold">{total}</span> {total === 1 ? 'bike' : 'bikes'} available
          </p>
        </div>

        {/* Inventory Grid */}
        {failed ? (
          <p className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text/70">
            Inventory is unavailable right now. Please try again shortly.
          </p>
        ) : bikes.length > 0 ? (
          <>
            <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {bikes.map((b) => (
                <BikeCard key={b.id} bike={b} />
              ))}
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                searchParams={sp}
              />
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-text/70 flex flex-col items-center justify-center gap-3">
            <p className="text-base font-semibold text-text-strong">No bikes found</p>
            <p className="text-xs text-text/60 max-w-sm">
              We could not find any bikes matching your exact criteria. Try adjusting or clearing your filters.
            </p>
            <Link
              href="/buy"
              className="mt-2 rounded-xl border border-primary bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              Clear Filters
            </Link>
          </div>
        )}

        {/* RECENTLY VIEWED BIKES (CLIENT-SIDE LOCALSTORAGE) */}
        <RecentlyViewedSection />
      </div>
    </div>
  );
}
