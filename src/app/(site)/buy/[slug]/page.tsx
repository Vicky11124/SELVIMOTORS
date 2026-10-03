import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Sparkles, MapPin } from 'lucide-react';
import BikeCard from '@/components/BikeCard';
import ContactButtons from '@/components/ContactButtons';
import EnquiryForm from '@/components/EnquiryForm';
import ExpandableDescription from '@/components/ExpandableDescription';
import Gallery from '@/components/Gallery';
import { RecentlyViewedSection, RecentlyViewedTracker } from '@/components/RecentlyViewed';
import StatusBadge from '@/components/StatusBadge';
import { getBikeBySlug, getSimilarBikes } from '@/lib/queries';
import { bikeTitle, bikeUrl, coverImage, formatKm, formatPrice, sortedImages } from '@/lib/utils';

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bike = await getBikeBySlug(slug).catch(() => null);
  if (!bike) return { title: 'Bike not found' };
  const title = `${bikeTitle(bike)} ${bike.year} – ${formatPrice(bike.price)}`;
  const description = `${bike.year} ${bikeTitle(bike)}, ${formatKm(bike.km_driven)}, ${bike.fuel_type}, ${bike.transmission}. ${bike.description?.slice(0, 120) ?? 'Inspected and ready for the road.'}`;
  const img = coverImage(bike);
  return {
    title,
    description,
    alternates: { canonical: `/buy/${bike.slug}` },
    openGraph: { title, description, url: bikeUrl(bike.slug), type: 'website', images: img ? [{ url: img }] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: img ? [img] : undefined },
  };
}

export default async function BikePage({ params }: Props) {
  const { slug } = await params;
  const bike = await getBikeBySlug(slug).catch(() => null);
  if (!bike) notFound();

  const similarBikes = await getSimilarBikes(bike, 4).catch(() => []);

  const name = bikeTitle(bike);
  const rows: [string, string | null][] = [
    ['Owner count', `${bike.owner_count}${['st', 'nd', 'rd'][bike.owner_count - 1] ?? 'th'} owner`],
    ['Registration', bike.registration_number],
    ['Condition', bike.condition],
    ['Location', bike.location],
  ];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${name} ${bike.year}`,
    image: sortedImages(bike).map((i) => i.image_url),
    description: bike.description ?? undefined,
    brand: { '@type': 'Brand', name: bike.brand },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: bike.price,
      url: bikeUrl(bike.slug),
      availability: bike.status === 'AVAILABLE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/UsedCondition',
    },
  };

  return (
    <div className="container-x py-3 sm:py-8">
      {/* Client-side history tracker */}
      <RecentlyViewedTracker bike={bike} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* Navigation & Status Header */}
      <div className="mb-2 sm:mb-6 flex items-center justify-between">
        <Link
          href="/buy"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} className="sm:size-4" /> Back to Bikes
        </Link>
        <StatusBadge status={bike.status} className="sm:hidden" />
      </div>

      {/* Main Single-Screen Fold Layout on Mobile / 2-Column on Desktop */}
      <div className="grid gap-3 sm:gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
        {/* Left Column: Gallery */}
        <div>
          <Gallery images={sortedImages(bike)} alt={name} />
        </div>

        {/* Right Column: Key Details & Actions */}
        <div className="flex flex-col">
          {/* Title & Desktop Status */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-dark leading-tight">
                {name}
              </h1>
              {bike.variant && (
                <p className="text-xs sm:text-sm text-primary font-semibold mt-0.5">{bike.variant}</p>
              )}
            </div>
            <StatusBadge status={bike.status} className="hidden sm:inline-flex shrink-0 mt-1" />
          </div>

          {/* Quick Badges / Chips */}
          <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
            <span className="rounded border border-line bg-surface px-2 py-0.5 font-medium text-dark">
              {bike.year}
            </span>
            <span className="rounded border border-line bg-surface px-2 py-0.5 font-medium text-dark">
              {formatKm(bike.km_driven)}
            </span>
            <span className="rounded border border-line bg-surface px-2 py-0.5 font-medium text-dark">
              {bike.fuel_type}
            </span>
            <span className="rounded border border-line bg-surface px-2 py-0.5 font-medium text-dark">
              {bike.transmission}
            </span>
          </div>

          {/* Price */}
          <div className="mt-2.5 sm:mt-5 flex items-baseline justify-between border-b border-line pb-2.5 sm:pb-4">
            <div>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate/70 block">
                Dealership Price
              </span>
              <p className="font-display text-2xl sm:text-4xl font-bold text-primary tracking-tight">
                {formatPrice(bike.price)}
              </p>
            </div>
            {bike.location && (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-slate">
                <MapPin size={12} className="text-primary" /> {bike.location}
              </span>
            )}
          </div>

          {/* Compact Specs Grid on Mobile (<sm) */}
          <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:hidden">
            <div className="rounded-lg border border-line bg-surface p-2">
              <span className="text-[10px] text-slate/70 block">Ownership</span>
              <span className="text-xs font-semibold text-dark">
                {bike.owner_count}
                {['st', 'nd', 'rd'][bike.owner_count - 1] ?? 'th'} owner
              </span>
            </div>
            {bike.registration_number && (
              <div className="rounded-lg border border-line bg-surface p-2">
                <span className="text-[10px] text-slate/70 block">Registration</span>
                <span className="text-xs font-semibold text-dark truncate block">
                  {bike.registration_number}
                </span>
              </div>
            )}
            {bike.condition && (
              <div className="rounded-lg border border-line bg-surface p-2">
                <span className="text-[10px] text-slate/70 block">Condition</span>
                <span className="text-xs font-semibold text-primary">
                  {bike.condition}
                </span>
              </div>
            )}
            {bike.location && (
              <div className="rounded-lg border border-line bg-surface p-2">
                <span className="text-[10px] text-slate/70 block">Location</span>
                <span className="text-xs font-semibold text-dark truncate block">
                  {bike.location}
                </span>
              </div>
            )}
          </div>

          {/* Full Table Specs on Desktop (sm+) */}
          <dl className="hidden sm:block mt-4 divide-y divide-line border-y border-line text-sm">
            {rows
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-slate">{k}</dt>
                  <dd className="text-right font-medium text-dark">{v}</dd>
                </div>
              ))}
          </dl>

          {/* Description Preview with Expand / Collapse */}
          {bike.description && <ExpandableDescription description={bike.description} />}

          {/* Contact Action Buttons */}
          <div className="mt-3.5 sm:mt-6">
            {bike.status === 'SOLD' ? (
              <p className="rounded-lg border border-line bg-surface p-3 text-center text-xs sm:text-sm text-slate">
                This bike has been sold.{' '}
                <Link href="/buy" className="text-primary font-medium hover:underline">
                  Browse available bikes
                </Link>
                .
              </p>
            ) : (
              <ContactButtons bike={bike} />
            )}
          </div>
        </div>
      </div>

      {/* Enquiry Form Section */}
      {bike.status !== 'SOLD' && (
        <section id="enquire" className="mx-auto mt-8 sm:mt-12 max-w-xl scroll-mt-24 border-t border-line/60 pt-6 sm:pt-8">
          <h2 className="mb-2.5 sm:mb-3.5 text-base sm:text-xl font-bold text-dark">Enquire about this bike</h2>
          <EnquiryForm bikeId={bike.id} bikeName={name} />
        </section>
      )}

      {/* SIMILAR BIKES / YOU MAY ALSO LIKE */}
      {similarBikes.length > 0 && (
        <section className="mt-12 sm:mt-20 border-t border-line/60 pt-8 sm:pt-10">
          <div className="mb-4 sm:mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary mb-1">
                <Sparkles size={12} /> Recommended For You
              </div>
              <h2 className="text-xl font-extrabold sm:text-3xl text-dark">You May Also Like</h2>
            </div>
            <Link href="/buy" className="text-xs sm:text-sm font-semibold text-primary hover:underline">
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
            {similarBikes.map((b) => (
              <BikeCard key={b.id} bike={b} />
            ))}
          </div>
        </section>
      )}

      {/* RECENTLY VIEWED BIKES */}
      <RecentlyViewedSection excludeSlug={bike.slug} />
    </div>
  );
}
