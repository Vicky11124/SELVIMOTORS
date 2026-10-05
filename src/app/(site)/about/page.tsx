import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bike as BikeIcon,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Flame,
  Handshake,
  MapPin,
  Phone,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import SpecularButton from '@/components/ui/SpecularButton';
import { getFeaturedBikes } from '@/lib/queries';
import { formatPrice, whatsappLink, WHATSAPP_NUMBER, PHONE_NUMBER, MAPS_PLACE_URL, MAPS_EMBED_URL } from '@/lib/utils';
import type { Bike } from '@/lib/types';

export const metadata: Metadata = {
  title: 'About Selvi Motors | Built Around Bikes. Driven By Trust.',
  description:
    'Selvi Motors is a pre-owned motorcycle dealership in Saidapet, Chennai. Explore our wide selection of quality used bikes, buy, sell, or exchange with transparent pricing and full RC transfer support.',
  alternates: { canonical: '/about' },
};

export const revalidate = 60;

const HIGHLIGHTS = [
  {
    icon: Flame,
    value: '100+',
    label: 'Curated Motorcycles',
    desc: 'Constantly refreshed stock across commuter, cruiser & sports segments.',
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Quality Inspected',
    desc: 'Rigorous mechanical, engine & document verification.',
  },
  {
    icon: FileCheck,
    value: 'Verified',
    label: 'RC Transfer Support',
    desc: 'Full documentation guidance and hassle-free ownership transfer.',
  },
  {
    icon: Scale,
    value: 'Fair Deals',
    label: 'Spot Valuation',
    desc: 'Zero hidden deductions and honest spot pricing for every rider.',
  },
];

const BRANDS = [
  'Royal Enfield',
  'KTM',
  'Yamaha',
  'Honda',
  'TVS',
  'Bajaj',
  'Suzuki',
  'Kawasaki',
  'Hero',
];

export default async function AboutPage() {
  let featuredBikes: Bike[] = [];
  try {
    featuredBikes = await getFeaturedBikes(3);
  } catch {
    /* Fallback handled below */
  }

  const sampleBikes = featuredBikes.length >= 3
    ? featuredBikes
    : [
        {
          id: '1',
          brand: 'Royal Enfield',
          model: 'Hunter 350',
          variant: 'Dapper Ash',
          price: 155000,
          year: 2023,
          km_driven: 8400,
          slug: 'royal-enfield-hunter-350-dapper-ash-2023',
          bike_images: [{ id: '1', image_url: '/bikes/hunter-350.jpg', display_order: 0, bike_id: '1', storage_path: '', created_at: '' }],
        },
        {
          id: '2',
          brand: 'Yamaha',
          model: 'MT-15',
          variant: 'V2 Metallic Black',
          price: 142000,
          year: 2022,
          km_driven: 12500,
          slug: 'yamaha-mt-15-v2-metallic-cyan-2023',
          bike_images: [{ id: '2', image_url: '/bikes/yamaha-mt15.jpg', display_order: 0, bike_id: '2', storage_path: '', created_at: '' }],
        },
        {
          id: '3',
          brand: 'KTM',
          model: '390 Duke',
          variant: 'ABS Orange',
          price: 235000,
          year: 2023,
          km_driven: 6200,
          slug: 'ktm-390-duke-abs-2022',
          bike_images: [{ id: '3', image_url: '/bikes/ktm-duke-390.jpg', display_order: 0, bike_id: '3', storage_path: '', created_at: '' }],
        },
      ];

  return (
    <div className="space-y-8 pb-16 sm:space-y-24 sm:pb-24">
      {/* 1. HERO SECTION - Forest Green editorial theme with ambient glow & specular buttons */}
      <section className="relative isolate overflow-hidden border-b border-line bg-[#0E3B2E] text-white pt-6 pb-8 sm:pt-20 sm:pb-24">
        {/* Ambient subtle glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[360px] w-[500px] -translate-x-1/2 rounded-full bg-white/10 blur-[100px] sm:h-[480px] sm:w-[700px] sm:blur-[120px]"
        />

        <div className="container-x">
          <div className="mx-auto max-w-4xl text-center">
            {/* Header Badge */}
            <div className="animate-slide-left inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-cream uppercase sm:px-4 sm:py-1.5 sm:text-xs">
              <Sparkles className="h-2.5 w-2.5 text-accent sm:h-3.5 sm:w-3.5" />
              <span className="sm:hidden">About Selvi Motors • Saidapet</span>
              <span className="hidden sm:inline">About Selvi Motors • Saidapet, Chennai</span>
            </div>

            {/* Main Headline */}
            <h1 className="animate-slide-left-delay-1 mt-2.5 text-2xl font-extrabold tracking-tight text-white xs:text-3xl sm:mt-6 sm:text-6xl sm:leading-[1.1]">
              BUILT AROUND BIKES.{' '}
              <span className="block text-cream">
                DRIVEN BY TRUST.
              </span>
            </h1>

            {/* Mobile summary */}
            <p className="animate-slide-left-delay-2 mt-2 text-xs leading-relaxed text-cream/90 sm:hidden">
              Selvi Motors is a pre-owned motorcycle dealership in Saidapet, Chennai. Wide selection of commuter, cruiser, and sports bikes with honest pricing & full RC transfer.
            </p>

            {/* Desktop detailed copy */}
            <p className="animate-slide-left-delay-2 mt-6 hidden text-base leading-relaxed text-cream/90 sm:block sm:text-xl">
              Selvi Motors is a pre-owned motorcycle dealership based in Saidapet, Chennai, bringing riders a wide selection of quality used motorcycles across commuter, cruiser, performance, and sports segments.
            </p>
            <p className="animate-slide-left-delay-3 mt-3 hidden text-sm leading-relaxed text-cream/80 sm:block sm:text-base">
              From your everyday ride to the bike you&apos;ve always wanted, we make the process of buying, selling, and exchanging a pre-owned motorcycle straightforward. With a strong presence in Chennai&apos;s used-bike market and a constantly changing collection, there&apos;s always something new to discover.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-2 max-w-sm mx-auto sm:max-w-none sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              {WHATSAPP_NUMBER && (
                <SpecularButton
                  href={whatsappLink('Hi Selvi Motors, I would like to know more about your showroom and available bikes.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="green"
                  size="lg"
                  fullWidth
                  className="order-1 col-span-1 sm:order-none sm:w-auto"
                >
                  <span>WhatsApp<span className="hidden sm:inline"> Showroom</span></span>
                </SpecularButton>
              )}

              <SpecularButton href="/buy" variant="white" size="lg" fullWidth className="order-2 col-span-1 sm:order-none sm:w-auto">
                <span>Explore Bikes</span>
              </SpecularButton>

              <SpecularButton href="/sell" variant="dark" size="lg" fullWidth className="order-3 col-span-2 sm:order-none sm:w-auto">
                <span>Sell / Exchange Bike</span>
              </SpecularButton>
            </div>

            {/* Quick Badges Pill Bar */}
            <div className="hidden sm:mt-10 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-3 text-xs font-medium text-cream">
              <div className="flex items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-center transition hover:border-white/40">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="truncate">Saidapet, Chennai</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-center transition hover:border-white/40">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="truncate">100% Inspected</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-center transition hover:border-white/40">
                <FileCheck className="h-3.5 w-3.5 shrink-0 text-blue-300" />
                <span className="truncate">RC Transfer Support</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-center transition hover:border-white/40">
                <Clock className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                <span className="truncate">Mon - Sun: 10am - 9pm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOWROOM BANNER */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-xl border border-line bg-surface shadow-xl sm:rounded-2xl">
          <div className="relative aspect-[16/9] max-h-[220px] w-full sm:max-h-[460px] sm:aspect-[21/9]">
            <Image
              src="/hero.jpg"
              alt="Selvi Motors Showroom Bikes Chennai"
              fill
              priority
              quality={90}
              sizes="(max-width: 1672px) 100vw, 1672px"
              className="object-cover object-[60%_center] brightness-95 transition-all duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-10">
              <div className="max-w-2xl">
                <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white sm:px-2.5 sm:py-1 sm:text-xs">
                  A Showroom For Riders
                </span>
                <h2 className="mt-1.5 text-base font-bold text-white xs:text-lg sm:mt-3 sm:text-4xl">
                  Good Bikes. Fair Deals. A Straightforward Experience.
                </h2>
                <p className="mt-1 hidden text-xs text-cream/90 sm:mt-2 sm:block sm:text-base">
                  You come in looking for a motorcycle. You see the bikes. You check the details. You find the one that feels right. And we help you take it from there.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. "MORE BIKES. MORE CHOICE." + 4 STATS/HIGHLIGHTS */}
      <section className="container-x">
        <div className="rounded-xl border border-line bg-surface p-4 sm:rounded-2xl sm:p-10 shadow-sm">
          <div className="text-center">
            <span className="text-[11px] font-bold tracking-widest text-primary uppercase sm:text-xs">
              Inventory & Selection
            </span>
            <h2 className="mt-1 text-xl font-extrabold text-dark sm:mt-2 sm:text-5xl">
              MORE BIKES. MORE CHOICE.
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-slate sm:mt-4 sm:text-base">
              We believe buying a pre-owned bike shouldn&apos;t mean settling for less. Our showroom features motorcycles across multiple brands, models, and price ranges.
            </p>

            {/* Popular Brands Grid */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:mt-6 sm:gap-3">
              {BRANDS.map((brand) => (
                <span
                  key={brand}
                  className="rounded-md border border-line bg-cream px-2.5 py-1 text-[11px] font-medium text-dark shadow-sm sm:rounded-lg sm:px-3.5 sm:py-1.5 sm:text-xs"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>

          {/* 4 Statistics Cards */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-4 lg:grid-cols-4">
            {HIGHLIGHTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-cream p-3.5 transition duration-300 hover:border-primary/50 hover:bg-surface sm:p-5"
                >
                  <div>
                    {/* Icon + Big Value */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white sm:h-9 sm:w-9 sm:rounded-lg">
                        <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                      </div>
                      <div className="text-base font-extrabold text-dark font-display sm:text-2xl">
                        {item.value}
                      </div>
                    </div>

                    {/* Label */}
                    <div className="mt-2 text-xs font-bold text-dark sm:text-sm">
                      {item.label}
                    </div>

                    {/* Description */}
                    <p className="mt-1 text-[11px] leading-relaxed text-slate sm:mt-2 sm:text-xs">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* VISIT US IN PERSON CTA */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-[#0E3B2E] p-5 shadow-lg sm:rounded-2xl sm:p-8 text-white">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <span className="inline-block rounded bg-white/10 border border-white/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-300 uppercase sm:text-xs">
                Visit Us In Person
              </span>
              <h2 className="mt-2 text-xl font-bold text-white sm:text-3xl">
                Test Ride Any Bike Today
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-emerald-100/90 sm:text-sm">
                Walk into our showroom at Saidapet, Chennai. Check out all available bikes, inspect them closely, and test ride your favorite one.
              </p>
            </div>
            <div className="w-full sm:w-auto shrink-0">
              <SpecularButton href="/contact" variant="white" size="md" className="w-full sm:w-auto">
                <span>Get Showroom Directions</span>
                <ArrowRight className="h-4 w-4" />
              </SpecularButton>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BUY | SELL | EXCHANGE (3 PILLARS) */}
      <section className="container-x">
        <div className="text-center">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase sm:text-xs">
            What We Do
          </span>
          <h2 className="mt-1 text-xl font-extrabold text-dark sm:mt-2 sm:text-4xl">
            BUY • SELL • EXCHANGE
          </h2>
          <p className="mx-auto mt-1 max-w-xl text-xs text-slate sm:mt-2 sm:text-sm">
            One trusted roof in Chennai for your next ride, seamless selling, or hassle-free trade-in.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:mt-8 sm:gap-6 md:grid-cols-3">
          {/* Card 1: BUY */}
          <div className="group relative flex flex-col justify-between rounded-xl border border-line bg-surface p-4 transition duration-300 hover:-translate-y-1 hover:border-primary sm:rounded-2xl sm:p-6 shadow-sm">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white sm:h-12 sm:w-12 sm:rounded-xl">
                <BikeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="mt-3 inline-block text-[10px] font-bold tracking-wider text-primary uppercase sm:mt-4 sm:text-xs">
                Step 01
              </span>
              <h3 className="mt-0.5 text-base font-bold text-dark sm:mt-1 sm:text-xl">BUY YOUR NEXT BIKE</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate sm:mt-3 sm:text-sm">
                Explore our collection of pre-owned motorcycles and find a bike that fits your style, requirements, and budget. Every bike is inspected before delivery.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-line sm:mt-6 sm:pt-4">
              <Link
                href="/buy"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition group-hover:text-primary-dark sm:text-sm"
              >
                <span>EXPLORE BIKES</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: SELL */}
          <div className="group relative flex flex-col justify-between rounded-xl border border-line bg-surface p-4 transition duration-300 hover:-translate-y-1 hover:border-primary sm:rounded-2xl sm:p-6 shadow-sm">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white sm:h-12 sm:w-12 sm:rounded-xl">
                <Handshake className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="mt-3 inline-block text-[10px] font-bold tracking-wider text-primary uppercase sm:mt-4 sm:text-xs">
                Step 02
              </span>
              <h3 className="mt-0.5 text-base font-bold text-dark sm:mt-1 sm:text-xl">SELL YOUR BIKE</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate sm:mt-3 sm:text-sm">
                Looking to move on from your current motorcycle? Share your bike details with us and our team will evaluate it and take the conversation forward with instant spot pricing.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-line sm:mt-6 sm:pt-4">
              <Link
                href="/sell"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition group-hover:text-primary-dark sm:text-sm"
              >
                <span>SELL YOUR BIKE</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: EXCHANGE */}
          <div className="group relative flex flex-col justify-between rounded-xl border border-line bg-surface p-4 transition duration-300 hover:-translate-y-1 hover:border-primary sm:rounded-2xl sm:p-6 shadow-sm">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white sm:h-12 sm:w-12 sm:rounded-xl">
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="mt-3 inline-block text-[10px] font-bold tracking-wider text-primary uppercase sm:mt-4 sm:text-xs">
                Step 03
              </span>
              <h3 className="mt-0.5 text-base font-bold text-dark sm:mt-1 sm:text-xl">EXCHANGE YOUR RIDE</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate sm:mt-3 sm:text-sm">
                Want to upgrade? Bring your current bike into the conversation and explore instant exchange options with best trade-in value for your next motorcycle.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-line sm:mt-6 sm:pt-4">
              <Link
                href="/sell"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition group-hover:text-primary-dark sm:text-sm"
              >
                <span>EXPLORE EXCHANGE</span>
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BIKE COLLECTION SHOWCASE */}
      <section className="container-x">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end sm:gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-primary uppercase sm:text-xs">
              Featured Machines
            </span>
            <h2 className="mt-0.5 text-xl font-extrabold text-dark sm:mt-1 sm:text-4xl">
              POPULAR IN OUR SHOWROOM
            </h2>
            <p className="text-xs text-slate sm:mt-1 sm:text-sm">
              Regularly updated inventory across commuter, retro, performance, and sport bikes.
            </p>
          </div>
          <Link
            href="/buy"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-dark transition hover:border-primary hover:text-primary sm:px-4 sm:py-2"
          >
            <span>View All Bikes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Bike Cards */}
        <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:mt-8 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible">
          {sampleBikes.map((bike) => {
            const img = bike.bike_images?.[0]?.image_url || '/bikes/hunter-350.jpg';
            const title = `${bike.brand} ${bike.model}`;
            return (
              <div
                key={bike.id}
                className="group min-w-[270px] max-w-[320px] shrink-0 snap-center overflow-hidden rounded-xl border border-line bg-surface transition duration-300 hover:border-primary/50 sm:min-w-0 sm:max-w-none sm:shrink sm:rounded-2xl shadow-sm"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream">
                  <Image
                    src={img}
                    alt={title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5 rounded bg-dark/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md sm:rounded-md sm:px-2.5 sm:py-1 sm:text-xs">
                    {bike.brand}
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white/90 sm:text-xs font-medium">
                    <span>{bike.year} Model</span>
                    {bike.km_driven && <span>{bike.km_driven.toLocaleString('en-IN')} KM</span>}
                  </div>
                </div>

                <div className="p-3.5 sm:p-5">
                  <h3 className="text-base font-bold text-dark group-hover:text-primary transition sm:text-lg">
                    {title}
                  </h3>
                  {bike.variant && (
                    <p className="text-[11px] text-slate sm:text-xs">{bike.variant}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 sm:mt-4 sm:pt-3">
                    <span className="text-base font-extrabold text-primary sm:text-lg">
                      {formatPrice(bike.price)}
                    </span>
                    <Link
                      href={bike.slug ? `/buy/${bike.slug}` : '/buy'}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition group-hover:bg-primary group-hover:text-white sm:rounded-lg sm:px-3 sm:py-1.5"
                    >
                      <span>View</span>
                      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. SHOWROOM / LOCATION SECTION */}
      <section className="container-x">
        <div className="grid gap-3 sm:gap-6 lg:grid-cols-12">
          {/* Location Details */}
          <div className="flex flex-col justify-between rounded-xl border border-line bg-surface p-4 sm:rounded-2xl sm:p-8 lg:col-span-5 shadow-sm">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-primary uppercase sm:text-xs">
                Showroom & Location
              </span>
              <h2 className="mt-1 text-lg font-bold text-dark sm:mt-2 sm:text-3xl">
                VISIT SELVI MOTORS
              </h2>
              <p className="mt-1 text-xs text-slate sm:text-sm">
                Centrally situated in Saidapet, Chennai, easily accessible from all parts of the city.
              </p>

              <div className="mt-4 space-y-3 text-xs sm:mt-6 sm:space-y-4 sm:text-sm">
                <div className="flex gap-2.5 sm:gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                  <div>
                    <strong className="block text-dark">Address:</strong>
                    <span className="text-slate">
                      No: 117/22, Bazaar Street, Saidapet, Chennai – 600015
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 sm:gap-3">
                  <Clock className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                  <div>
                    <strong className="block text-dark">Operating Hours:</strong>
                    <span className="text-slate">
                      Monday to Sunday: 10:00 AM – 9:00 PM
                    </span>
                  </div>
                </div>

                {PHONE_NUMBER && (
                  <div className="flex gap-2.5 sm:gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
                    <div>
                      <strong className="block text-dark">Phone Support:</strong>
                      <a href={`tel:${PHONE_NUMBER}`} className="text-slate hover:text-primary underline">
                        {PHONE_NUMBER}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
              <a
                href={MAPS_PLACE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-red text-xs py-2 px-3 sm:py-2.5 sm:px-4"
              >
                <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Open in Google Maps</span>
              </a>
              <Link href="/contact" className="btn btn-outline text-xs py-2 px-3 sm:py-2.5 sm:px-4">
                <span>Contact Details</span>
              </Link>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="relative overflow-hidden rounded-xl border border-line bg-surface sm:rounded-2xl lg:col-span-7 shadow-sm">
            <iframe
              title="Selvi Motors Location Map"
              src={MAPS_EMBED_URL}
              className="h-full min-h-[220px] w-full border-0 sm:min-h-[300px]"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary text-white p-5 text-center shadow-xl sm:rounded-3xl sm:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"
          />

          <span className="text-[11px] font-bold tracking-widest text-cream uppercase sm:text-xs">
            From Our Showroom To Your Road
          </span>

          <h2 className="mt-1 text-xl font-extrabold text-white sm:mt-3 sm:text-5xl">
            YOUR NEXT BIKE IS WAITING.
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-cream/90 sm:mt-4 sm:text-base">
            Every motorcycle has a previous chapter. We help you find the one that&apos;s ready for yours. Browse our inventory or walk into our Saidapet showroom today.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:mt-8">
            <SpecularButton href="/buy" variant="white" size="lg">
              <span>EXPLORE OUR BIKES</span>
              <ArrowRight className="h-4 w-4" />
            </SpecularButton>

            <SpecularButton href="/sell" variant="dark" size="lg">
              <span>Sell Your Current Bike</span>
            </SpecularButton>
          </div>
        </div>
      </section>
    </div>
  );
}
