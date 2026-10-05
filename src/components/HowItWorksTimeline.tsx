'use client';

import { useEffect, useRef, useState } from 'react';
import { Calculator, MapPin, CreditCard, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    eyebrow: 'ONLINE VALUATION',
    title: 'FREE BIKE VALUATION',
    description:
      'Tell us your bike’s make, model, year and kilometres and get a fair valuation based on its condition and current market demand.',
    icon: Calculator,
  },
  {
    number: '02',
    eyebrow: 'DOORSTEP INSPECTION',
    title: 'FREE DOORSTEP INSPECTION',
    description:
      'Our evaluator visits your preferred location to inspect the bike’s condition, documents and key components before preparing the final offer.',
    icon: MapPin,
  },
  {
    number: '03',
    eyebrow: 'FINANCE ASSISTANCE',
    title: 'LOAN & FINANCE SUPPORT',
    description:
      'If your bike is still financed, we’ll guide you through the loan closure and required documentation so you can complete the sale smoothly.',
    icon: CreditCard,
  },
  {
    number: '04',
    eyebrow: 'CLOSURE & PAYMENT',
    title: 'GET YOUR FINAL OFFER',
    description:
      'Review your offer, complete the paperwork and hand over your bike with confidence.',
    icon: ShieldCheck,
  },
];

export default function HowItWorksTimeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeSteps, setActiveSteps] = useState<number[]>([]);
  const [lineHeight, setLineHeight] = useState<number>(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // IntersectionObserver to reveal steps as they scroll into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-step-index'));
            if (!isNaN(index)) {
              setActiveSteps((prev) => (prev.includes(index) ? prev : [...prev, index]));
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -20px 0px' }
    );

    const stepElements = section.querySelectorAll('[data-step-index]');
    stepElements.forEach((el) => observer.observe(el));

    // Scroll listener for smooth green timeline progress fill
    const handleScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const totalHeight = rect.height;
        const currentScroll = windowHeight - rect.top;
        const progress = Math.min(1, Math.max(0, currentScroll / (totalHeight + windowHeight * 0.2)));
        setLineHeight(progress * 100);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-8 md:py-12 lg:py-14 bg-background border-b border-border/60 overflow-hidden"
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]"
        aria-hidden="true"
      />

      <div className="container-x">
        {/* 1. SECTION INTRO */}
        <div className="mx-auto max-w-2xl text-center mb-6 md:mb-8 lg:mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary shadow-sm mb-2 sm:mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            WANT TO SELL YOUR BIKE?
          </div>

          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-text-strong md:text-3xl lg:text-4xl leading-[1.05]">
            A SIMPLE WAY TO<br />
            <span className="text-primary">SELL YOUR BIKE.</span>
          </h2>

          <p className="mt-1.5 sm:mt-2.5 text-[11px] sm:text-sm md:text-base text-text/80 font-medium leading-relaxed max-w-lg mx-auto">
            From valuation to final offer, we handle the process clearly and professionally.
          </p>
        </div>

        {/* 2. TIMELINE CONTAINER */}
        <div className="relative mx-auto max-w-3xl lg:max-w-4xl">
          {/* DESKTOP CENTRAL TIMELINE LINE */}
          <div className="hidden md:block absolute left-1/2 top-5 bottom-5 -translate-x-1/2 w-0.5 bg-border/80 rounded-full overflow-hidden">
            <div
              className="w-full bg-primary transition-all duration-200 ease-out shadow-[0_0_8px_rgba(14,59,46,0.4)]"
              style={{ height: `${lineHeight}%` }}
            />
          </div>

          {/* MOBILE LEFT TIMELINE LINE */}
          <div className="md:hidden absolute left-4 top-4 bottom-4 w-0.5 bg-border/80 rounded-full overflow-hidden">
            <div
              className="w-full bg-primary transition-all duration-200 ease-out shadow-[0_0_8px_rgba(14,59,46,0.4)]"
              style={{ height: `${lineHeight}%` }}
            />
          </div>

          {/* STEP ITEMS */}
          <div className="space-y-4 md:space-y-6 lg:space-y-8">
            {STEPS.map((s, idx) => {
              const isEven = idx % 2 === 0; // 0 & 2 -> Left on desktop, 1 & 3 -> Right on desktop
              const isActive = activeSteps.includes(idx);
              const Icon = s.icon;

              return (
                <div
                  key={s.number}
                  data-step-index={idx}
                  className="relative flex flex-col md:flex-row items-center"
                >
                  {/* ─── DESKTOP LAYOUT (Alternating Left / Right) ─── */}

                  {/* Left Column (Desktop) */}
                  <div
                    className={`hidden md:block w-1/2 pr-6 lg:pr-8 text-right transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isEven
                        ? isActive
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-8'
                        : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    {isEven && <StepCard step={s} Icon={Icon} isRight={false} />}
                  </div>

                  {/* Center Milestone Node (Desktop) */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-20 items-center justify-center">
                    <div
                      className={`h-9 w-9 lg:h-10 lg:w-10 rounded-full font-display font-extrabold text-xs flex items-center justify-center transition-all duration-500 shadow-md ${
                        isActive
                          ? 'bg-primary text-white border-2 border-primary ring-4 ring-primary/15 scale-105'
                          : 'bg-surface text-text/60 border-2 border-border'
                      }`}
                    >
                      {s.number}
                    </div>
                  </div>

                  {/* Right Column (Desktop) */}
                  <div
                    className={`hidden md:block w-1/2 pl-6 lg:pl-8 text-left transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      !isEven
                        ? isActive
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 translate-x-8'
                        : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    {!isEven && <StepCard step={s} Icon={Icon} isRight={true} />}
                  </div>

                  {/* ─── MOBILE LAYOUT (Left Timeline + Right Cards) ─── */}
                  <div className="flex md:hidden w-full items-start pl-9 sm:pl-12 relative">
                    {/* Mobile Left Milestone Node */}
                    <div className="absolute left-4 -translate-x-1/2 top-1.5 z-20">
                      <div
                        className={`h-7 w-7 rounded-full font-display font-extrabold text-[10px] flex items-center justify-center transition-all duration-500 shadow-sm ${
                          isActive
                            ? 'bg-primary text-white border-2 border-primary ring-2 ring-primary/15 scale-105'
                            : 'bg-surface text-text/60 border-2 border-border'
                        }`}
                      >
                        {s.number}
                      </div>
                    </div>

                    {/* Mobile Card */}
                    <div
                      className={`w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isActive
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4'
                      }`}
                    >
                      <StepCard step={s} Icon={Icon} isRight={true} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  Icon,
  isRight,
}: {
  step: (typeof STEPS)[0];
  Icon: React.ElementType;
  isRight: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl md:rounded-2xl border border-border/90 bg-surface p-3.5 md:p-4 lg:p-5 shadow-md transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 ${
        isRight ? 'text-left' : 'md:text-right text-left'
      }`}
    >
      {/* Top subtle rim highlight */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Card Header: Icon & Eyebrow Badge */}
      <div
        className={`flex items-center gap-2.5 md:gap-3 mb-2 md:mb-2.5 ${
          isRight ? 'flex-row' : 'md:flex-row-reverse flex-row'
        }`}
      >
        <div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
          <Icon className="h-4 w-4 md:h-4.5 md:w-4.5" />
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest text-accent">
            {step.eyebrow}
          </span>
          <span className="font-display text-[10px] md:text-xs font-bold text-text-strong">
            STEP {step.number}
          </span>
        </div>
      </div>

      {/* Card Title */}
      <h3 className="font-display text-xs md:text-sm lg:text-base font-extrabold uppercase tracking-tight text-primary group-hover:text-primary-dark transition-colors">
        {step.title}
      </h3>

      {/* Card Description */}
      <p className="mt-1 md:mt-1.5 text-[11px] md:text-xs leading-relaxed text-slate font-medium">
        {step.description}
      </p>

      {/* Subtle indicator bar */}
      <div
        className={`mt-2 md:mt-3 h-0.5 w-4 md:w-5 rounded-full bg-primary/30 transition-all duration-300 group-hover:w-8 group-hover:bg-primary ${
          isRight ? 'mr-auto' : 'md:ml-auto md:mr-0 mr-auto'
        }`}
      />
    </div>
  );
}
