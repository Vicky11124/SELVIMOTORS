import type { Metadata } from 'next';
import SellForm from '@/components/SellForm';
import HowItWorksTimeline from '@/components/HowItWorksTimeline';
import { getBrands } from '@/lib/queries';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Sell Your Bike | Get The Right Value | Selvi Motors',
  description: 'Sell your pre-owned motorcycle with Selvi Motors. Free evaluation, trusted dealership, instant response, and best market value.',
  alternates: { canonical: '/sell' },
};

export default async function SellPage() {
  const brands = await getBrands().catch(() => []);

  return (
    <div className="relative min-h-screen">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(14,59,46,0.15),rgba(255,255,255,0))]" />

      <div className="container-x py-4 sm:py-16">
        {/* Automotive Hero Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-slide-left inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary mb-2 sm:mb-4 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Sell Your Motorcycle
          </div>

          <h1 className="animate-slide-left-delay-1 font-display text-2xl font-extrabold uppercase tracking-tight text-text-strong sm:text-6xl sm:leading-[1.1]">
            Sell Your Bike.<br />
            <span className="text-primary">Get The Right Value.</span>
          </h1>

          <p className="animate-slide-left-delay-2 mx-auto mt-2 max-w-xl text-xs text-text/80 sm:text-base leading-relaxed font-medium hidden sm:block">
            Get an instant, transparent market valuation from Selvi Motors. Transparent inspection, fair market pricing, and fast payment.
          </p>
        </div>

        {/* 6-Step Selling Journey Container */}
        <div id="sell-flow" className="mx-auto mt-4 sm:mt-12 max-w-3xl scroll-mt-24">
          <SellForm brands={brands} />
        </div>
      </div>

      {/* How It Works Redesigned Process Timeline Section */}
      <HowItWorksTimeline />
    </div>
  );
}
