import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BadgeCheck, Clock, Flame, Handshake, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import AccordionGallery from '@/components/AccordionGallery';
import BikeCard from '@/components/BikeCard';
import SpecularButton from '@/components/ui/SpecularButton';
import { getFeaturedBikes, getNewArrivalBikes } from '@/lib/queries';
import { formatPrice } from '@/lib/utils';
import type { Bike } from '@/lib/types';

import HeroSection from '@/components/HeroSection';
import HowItWorksTimeline from '@/components/HowItWorksTimeline';

export const revalidate = 60;

const WHY = [
  {
    icon: BadgeCheck,
    title: 'Best price evaluation',
    tag: 'Accurate & Fair',
    text: 'Fair, transparent offers with zero hidden deductions.',
  },
  {
    icon: Clock,
    title: 'Quick and easy process',
    tag: 'Fast Turnaround',
    text: 'Swift inspection, paperwork and spot payment.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted dealership',
    tag: '100% Inspected',
    text: 'Rigorous multi-point inspection before listing.',
  },
  {
    icon: Zap,
    title: 'Instant response',
    tag: 'Direct Support',
    text: 'WhatsApp support & same-day test ride booking.',
  },
];

export default async function HomePage() {
  let newArrivals: Bike[] = [];
  let featured: Bike[] = [];
  try {
    [newArrivals, featured] = await Promise.all([
      getNewArrivalBikes(5),
      getFeaturedBikes(6),
    ]);
  } catch {
    /* Supabase query fallback */
  }

  // Map latest 5 new arrivals to AccordionGallery items or use curated defaults matching database records
  const galleryItems = (newArrivals.length > 0
    ? newArrivals.slice(0, 5)
    : [
      {
        id: '1',
        brand: 'Royal Enfield',
        model: 'Hunter 350',
        variant: 'Dapper Ash',
        price: 155000,
        slug: 'royal-enfield-hunter-350-dapper-ash-2023',
        bike_images: [{ id: '1', image_url: '/bikes/hunter-350.jpg', display_order: 0, bike_id: '1', storage_path: '', created_at: '' }],
      },
      {
        id: '2',
        brand: 'Yamaha',
        model: 'MT-15',
        variant: 'V2',
        price: 142000,
        slug: 'yamaha-mt-15-v2-metallic-cyan-2023',
        bike_images: [{ id: '2', image_url: '/bikes/yamaha-mt15.jpg', display_order: 0, bike_id: '2', storage_path: '', created_at: '' }],
      },
      {
        id: '3',
        brand: 'KTM',
        model: '390 Duke',
        variant: 'ABS',
        price: 235000,
        slug: 'ktm-390-duke-abs-2022',
        bike_images: [{ id: '3', image_url: '/bikes/ktm-duke-390.jpg', display_order: 0, bike_id: '3', storage_path: '', created_at: '' }],
      },
      {
        id: '4',
        brand: 'TVS',
        model: 'Apache RTR 200 4V',
        variant: 'Dual ABS',
        price: 118000,
        slug: 'tvs-apache-rtr-200-4v-2022',
        bike_images: [{ id: '4', image_url: '/bikes/hunter-350.jpg', display_order: 0, bike_id: '4', storage_path: '', created_at: '' }],
      },
      {
        id: '5',
        brand: 'Honda',
        model: "H'ness CB350",
        variant: 'DLX Pro',
        price: 185000,
        slug: 'honda-hness-cb350-dlx-pro-2023',
        bike_images: [{ id: '5', image_url: '/bikes/yamaha-mt15.jpg', display_order: 0, bike_id: '5', storage_path: '', created_at: '' }],
      },
    ]
  ).map((b) => {
    const imgUrl = b.bike_images?.[0]?.image_url || '/bikes/hunter-350.jpg';
    return {
      image: imgUrl,
      label: `${b.brand} ${b.model} · ${formatPrice(b.price)}`,
      link: b.slug ? `/buy/${b.slug}` : '/buy',
      alt: `${b.brand} ${b.model}`,
    };
  });

  return (
    <>
      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. ACCORDION GALLERY SHOWCASE (BELOW HERO) */}
      <section className="container-x pt-8 sm:pt-14">
        <div className="rounded-2xl border border-border bg-surface p-3.5 sm:p-6 shadow-md">
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary sm:px-3 sm:text-xs">
                <Flame size={12} className="text-primary" /> New Arrivals
              </span>
              <span className="hidden text-xs text-text/60 sm:inline">
                Hover or tap to explore
              </span>
            </div>
            <Link
              href="/buy"
              className="text-[11px] font-semibold text-primary hover:underline sm:text-xs"
            >
              View all ({newArrivals.length || 3}+) &rarr;
            </Link>
          </div>

          {/* React Bits AccordionGallery */}
          <AccordionGallery
            items={galleryItems}
            defaultIndex={0}
            expandRatio={0.55}
            height={380}
            gap={10}
            radius={14}
            accentColor="#0E3B2E"
            trigger="hover"
            grayscale={false}
            showLabels={true}
            autoPlay={true}
            autoPlayInterval={2200}
            duration={0.7}
          />
        </div>
      </section>

      {/* FEATURED BIKES INVENTORY GRID */}
      <section className="container-x pt-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold sm:text-4xl text-text-strong">Featured bikes</h2>
          <Link href="/buy" className="text-sm font-bold text-primary hover:underline">
            View all bikes &rarr;
          </Link>
        </div>
        {featured.length ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {featured.map((b) => (
                <BikeCard key={b.id} bike={b} />
              ))}
            </div>

            {/* Bottom View All Bikes CTA with Mascot */}
            <div className="mt-8 flex justify-center sm:mt-12">
              <Link
                href="/buy"
                aria-label="View all bikes inventory"
                className="group relative flex items-center gap-3 sm:gap-4 rounded-full border border-primary/25 bg-white/95 backdrop-blur-md pl-1 sm:pl-2 pr-2.5 sm:pr-3 py-1.5 sm:py-2 shadow-xl shadow-primary/10 transition-all duration-300 hover:scale-[1.03] active:scale-95 hover:border-primary/50 hover:bg-white"
              >
                {/* Mascot Character on Left Leaning & Pointing Right */}
                <div className="relative -my-3 sm:-my-4 -ml-2.5 sm:-ml-4 h-14 w-14 sm:h-16 sm:w-16 shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src="/mascot.png"
                    alt="Selvi Motors Helmeted Rider Mascot"
                    width={64}
                    height={64}
                    className="h-full w-full object-contain drop-shadow-md"
                    loading="eager"
                  />
                </div>

                {/* CTA Button Text */}
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-primary font-display group-hover:text-primary-dark transition-colors">
                  View All Bikes Inventory
                </span>

                {/* Red Circle Arrow Button Accent */}
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-accent text-white shadow-md shadow-accent/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-[#b83838]">
                  <ArrowRight size={16} strokeWidth={2.5} />
                </div>
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-text/70 bg-surface">
            New bikes are on the way. <Link href="/buy" className="text-primary font-bold hover:underline">Browse the full inventory</Link>.
          </div>
        )}
      </section>

      {/* WHY SELVI MOTORS (HIDDEN ON MOBILE, VISIBLE ON DESKTOP) */}
      <section className="hidden md:block relative container-x pt-16 pb-6 sm:pt-28">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" aria-hidden="true" />

        {/* Centered Heading and Subtitle */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm">
            <Sparkles size={13} className="text-primary" /> The SELVIMOTORS Edge
          </div>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl text-text-strong">
            Why <span className="text-primary">SELVIMOTORS</span>
          </h2>
          <p className="mt-3 text-sm text-text/80 sm:text-base font-medium">
            Chennai’s premier pre-owned two-wheeler dealership built on total transparency, inspected quality, and fair pricing.
          </p>
        </div>

        {/* Animated Feature Cards Grid - 2x2 on Mobile, 4-col on Desktop */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-4 lg:grid-cols-4">
          {WHY.map(({ icon: Icon, title, tag, text }) => (
            <div
              key={title}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#34d399]/35 bg-surface p-3 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-md"
              style={
                {
                  '--sb-radius': '12px',
                  '--sb-line-color': '#34d399',
                  '--sb-thickness': '1.5px',
                  '--sb-duration': '3.5s',
                } as React.CSSProperties
              }
            >
              {/* Outer Border Rim Green Beam */}
              <div className="specular-button__beam" aria-hidden="true" />

              <div>
                {/* Glowing Icon Container */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-white sm:h-10 sm:w-10">
                    <Icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-6 sm:h-5 sm:w-5" />
                  </div>
                  <span className="rounded-full bg-surface-muted border border-border px-2 py-0.5 text-[9px] font-bold text-text/70 sm:text-[10px]">
                    {tag}
                  </span>
                </div>

                {/* Content */}
                <h3 className="mt-3 text-xs font-bold text-text-strong sm:text-sm group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-text/80 sm:text-xs">
                  {text}
                </p>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS PROCESS TIMELINE */}
      <HowItWorksTimeline />

      {/* SELL YOUR BIKE CTA BANNER */}
      <section className="container-x pt-10 sm:pt-16 pb-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-8 lg:p-10 shadow-md">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Handshake size={16} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Hassle-Free Selling</span>
              </div>
              <h2 className="mt-2 text-xl font-extrabold text-text-strong sm:text-2xl lg:text-3xl">
                Sell your bike. Hassle free.
              </h2>
              <p className="mt-1 max-w-md text-xs sm:text-sm text-text/80 leading-relaxed font-medium">
                Send us a few photos and details. We evaluate your bike and handle the documentation.
              </p>
            </div>
            <div className="shrink-0">
              <SpecularButton href="/sell" variant="white" size="md">
                <span>Sell Your Bike</span> <ArrowRight size={15} />
              </SpecularButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
