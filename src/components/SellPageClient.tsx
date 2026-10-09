'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  IndianRupee,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import HowItWorksTimeline from '@/components/HowItWorksTimeline';
import SellDocumentsRequired from '@/components/SellDocumentsRequired';
import SellForm from '@/components/SellForm';
import SpecularButton from '@/components/ui/SpecularButton';

interface SellPageClientProps {
  brands: string[];
}

export default function SellPageClient({ brands }: SellPageClientProps) {
  const [isFormActive, setIsFormActive] = useState(false);
  const [initialRegNumber, setInitialRegNumber] = useState('');
  const [heroInputError, setHeroInputError] = useState('');

  function handleStartFromHero(e: React.FormEvent) {
    e.preventDefault();
    setHeroInputError('');
    setIsFormActive(true);
  }

  function handleSelectManual() {
    setInitialRegNumber('');
    setIsFormActive(true);
  }

  // ──────────────────────────────────────────────────────────
  // 1. FULL-SCREEN FOCUSED VALUATION MODE (Image 2 Style)
  // When active, all other sections and distractions are hidden
  // ──────────────────────────────────────────────────────────
  if (isFormActive) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#0B1E17] text-white selection:bg-primary selection:text-white">
        {/* Immersive Blueprint Grid Background */}
        <div
          className="pointer-events-none fixed inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '36px 36px',
          }}
          aria-hidden="true"
        />

        {/* Ambient radial glow */}
        <div
          className="pointer-events-none fixed left-1/2 top-0 -translate-x-1/2 h-[600px] w-full max-w-5xl -z-10 rounded-full bg-emerald-500/10 blur-[140px]"
          aria-hidden="true"
        />

        {/* Top Sticky Navigation Bar */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B1E17]/90 backdrop-blur-md px-3 sm:px-8 py-2 sm:py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsFormActive(false)}
            className="group inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Sell your 2-wheeler</span>
          </button>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-white/60">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span className="hidden sm:inline">100% Free & Secure Valuation</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </header>

        {/* Centered Focused Form Card */}
        <main className="relative z-10 flex-1 flex flex-col justify-center items-center py-2 sm:py-8 px-2.5 sm:px-6 animate-modal-slide-up">
          <div className="w-full max-w-5xl">
            <SellForm
              brands={brands}
              initialRegNumber={initialRegNumber}
              onExit={() => setIsFormActive(false)}
            />
          </div>
        </main>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // 2. HERO LANDING PAGE VIEW (Image 1 Style)
  // ──────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-background overflow-x-clip">
      {/* Dark Automotive Hero Section */}
      <section className="relative overflow-hidden bg-[#0e1814] text-white py-5 sm:py-20 lg:py-24 border-b border-white/10">
        {/* Full-bleed Motorcycle Showroom Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/sell/hero-showroom.webp"
            alt="Selvi Motors Motorcycle Showroom"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-[30%_center] sm:object-center"
          />
          {/* Dark cinematic directional overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(4, 15, 12, 0.80) 0%, rgba(4, 15, 12, 0.65) 42%, rgba(4, 15, 12, 0.35) 72%, rgba(4, 15, 12, 0.25) 100%)',
            }}
          />
        </div>

        <div className="container-x relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading & Value Propositions (Smooth Slide In Left) */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-6 text-left animate-hero-left">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sell Bike in Chennai
              </div>

              <h1 className="font-display text-2xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white leading-[1.1]">
                Get the <span className="text-emerald-400">Best Resale Value</span> with Selvi Motors
              </h1>

              <p className="hidden sm:block text-sm md:text-base text-white/55 leading-relaxed font-medium max-w-xl">
                Sell your bike in Chennai with Selvi Motors, a trusted dealership for fair pricing, doorstep inspection, and end-to-end RC transfer support. Join thousands of bike owners who choose a simple, transparent way to sell without delays or confusion.
              </p>

              {/* Desktop Only: 3 Feature Icons & Stats */}
              <div className="hidden lg:grid grid-cols-3 gap-3.5 pt-2">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <IndianRupee size={18} />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-white">Instant Bike</h4>
                    <p className="text-[11px] text-white/60 font-medium">Valuation</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Search size={18} />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-white">Free Doorstep</h4>
                    <p className="text-[11px] text-white/60 font-medium">Evaluation</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <RefreshCw size={18} />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-white">RC Transfer</h4>
                    <p className="text-[11px] text-white/60 font-medium">Support</p>
                  </div>
                </div>
              </div>

              {/* Desktop Only: Social Proof Stats */}
              <div className="hidden lg:flex flex-wrap items-center gap-10 pt-4 border-t border-white/10 text-xs">
                <div>
                  <span className="font-display text-xl font-black text-white">15k+</span>
                  <p className="text-white/60 font-medium text-[11px]">Vehicles Evaluated</p>
                </div>
                <div className="h-7 w-px bg-white/10" />
                <div>
                  <span className="font-display text-xl font-black text-white">10k+</span>
                  <p className="text-white/60 font-medium text-[11px]">Happy Customers</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Registration Entry Card */}
            <div className="lg:col-span-5 animate-hero-right mt-4 sm:mt-6 lg:mt-0">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-surface p-5 sm:p-8 text-text-strong shadow-2xl ring-1 ring-white/10">
                <div className="text-left">
                  <label className="block text-xs sm:text-sm font-extrabold uppercase tracking-wider text-text-strong mb-2.5 sm:mb-3">
                    Enter your bike registration number
                  </label>

                  <form onSubmit={handleStartFromHero} className="space-y-3.5 sm:space-y-4">
                    <div className="relative flex items-center overflow-hidden rounded-xl border-2 border-text-strong bg-background shadow-inner focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      {/* IND Blue Stamp */}
                      <div className="flex flex-col items-center justify-center bg-[#003399] px-2.5 sm:px-3 py-2.5 sm:py-2.5 text-white shrink-0 select-none">
                        <span className="text-[9px] sm:text-[10px] font-black tracking-tighter">IND</span>
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full border border-white/60 mt-0.5" />
                      </div>

                      <input
                        type="text"
                        value={initialRegNumber}
                        onChange={(e) =>
                          setInitialRegNumber(
                            e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 14)
                          )
                        }
                        placeholder="eg. TN 01 AB 1234"
                        className="w-full bg-transparent px-3 py-2.5 sm:py-3 font-display text-base sm:text-lg font-black uppercase tracking-widest text-text-strong placeholder:text-text/30 focus:outline-none"
                      />
                    </div>

                    {heroInputError && (
                      <p className="text-xs font-bold text-selvi-red">{heroInputError}</p>
                    )}

                    {/* Primary Proceed CTA with Specular Border Beam */}
                    <SpecularButton
                      type="submit"
                      variant="custom"
                      tint="#0E3B2E"
                      tintOpacity={1}
                      textColor="#ffffff"
                      lineColor="#ffffff"
                      size="lg"
                      fullWidth
                      className="w-full uppercase tracking-wider text-xs sm:text-sm font-bold"
                    >
                      <span>Proceed</span>
                      <ArrowRight size={16} />
                    </SpecularButton>
                  </form>

                  {/* Secondary Start Link */}
                  <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-3.5 border-t border-border/80 flex items-center justify-between text-[11px] sm:text-xs">
                    <button
                      type="button"
                      onClick={handleSelectManual}
                      className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Don&apos;t have reg number? Select manually</span>
                      <ArrowRight size={12} className="sm:hidden" />
                      <ArrowRight size={13} className="hidden sm:block" />
                    </button>
                  </div>
                </div>

                {/* Card micro features */}
                <div className="mt-3.5 sm:mt-4 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-text/70 pt-2.5 border-t border-border/60">
                  <span className="inline-flex items-center gap-1 text-primary">
                    <CheckCircle2 size={12} /> Instant valuation
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-primary">
                    <CheckCircle2 size={12} /> Zero obligation
                  </span>
                </div>
              </div>

              {/* Mobile Only: 3 Features & Stats Below the Form Card with clear top spacing */}
              <div className="block lg:hidden space-y-3.5 mt-6 pt-2 text-left">
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2 text-center backdrop-blur-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <IndianRupee size={15} />
                    </div>
                    <div>
                      <h4 className="font-display text-[10px] font-bold text-white leading-tight">Instant Bike</h4>
                      <p className="text-[9px] text-white/60 font-medium">Valuation</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2 text-center backdrop-blur-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <Search size={15} />
                    </div>
                    <div>
                      <h4 className="font-display text-[10px] font-bold text-white leading-tight">Free Doorstep</h4>
                      <p className="text-[9px] text-white/60 font-medium">Evaluation</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2 text-center backdrop-blur-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <RefreshCw size={15} />
                    </div>
                    <div>
                      <h4 className="font-display text-[10px] font-bold text-white leading-tight">RC Transfer</h4>
                      <p className="text-[9px] text-white/60 font-medium">Support</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-around py-2 px-3 rounded-xl border border-white/10 bg-white/5 text-xs text-center">
                  <div>
                    <span className="font-display text-sm font-black text-white">15k+</span>
                    <p className="text-white/60 font-medium text-[10px]">Vehicles Evaluated</p>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div>
                    <span className="font-display text-sm font-black text-white">10k+</span>
                    <p className="text-white/60 font-medium text-[10px]">Happy Customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Process Timeline Section */}
      <HowItWorksTimeline />

      {/* Documents Required Section */}
      <SellDocumentsRequired />
    </div>
  );
}
