'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import SpecularButton from '@/components/ui/SpecularButton';

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => {
      // Only track scroll within hero height
      if (window.scrollY < 800) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Subtle parallax offsets
  const imageTranslateY = scrollY * 0.12;
  const textTranslateY = -scrollY * 0.06;
  const textOpacity = Math.max(0.2, 1 - scrollY / 550);

  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-background">
      <div className="relative mx-auto max-w-[1672px] overflow-hidden">
        {/* HERO IMAGE LAYER */}
        <div
          className="absolute inset-0 -z-20 transform-gpu transition-transform duration-1000 ease-out will-change-transform"
          style={{
            transform: `translateY(${imageTranslateY}px) scale(${loaded ? 1 : 1.015})`,
          }}
        >
          <Image
            src="/hero.jpeg"
            alt="Selvi Motors Premium Pre-Owned Motorcycle"
            fill
            priority
            unoptimized
            className="object-cover object-[65%_center] sm:object-[60%_center]"
          />
        </div>

        {/* 1. DIRECTIONAL OVERLAY (LEFT TEXT CONTRAST, RIGHT VIVID SCENERY) */}
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#F7F2E8]/75 via-[#F7F2E8]/20 to-transparent max-md:from-[#F7F2E8]/85 max-md:to-transparent"
          aria-hidden="true"
        />

        {/* 2. REDUCED BOTTOM FADE (ROAD, WHEELS & STONE WALL REMAIN VISIBLE) */}
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-14 bg-gradient-to-t from-background/90 via-background/30 to-transparent"
          aria-hidden="true"
        />

        {/* HERO TEXT & CONTENT CONTAINER */}
        <div className="container-x py-8 sm:py-20 lg:py-28">
          <div
            className="max-w-2xl transform-gpu transition-all duration-300 ease-out will-change-transform"
            style={{
              transform: `translateY(${textTranslateY}px)`,
              opacity: textOpacity,
            }}
          >
            {/* 1. EYEBROW */}
            <div
              className="animate-hero-fade opacity-0"
              style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
            >
              <p className="text-[11px] font-bold tracking-[0.16em] text-primary sm:text-sm sm:tracking-[0.18em]">
                PRE-OWNED BIKES | TRUSTED DEALER
              </p>
            </div>

            {/* 2. MAIN HEADLINE */}
            <div
              className="animate-hero-fade opacity-0 mt-1.5 sm:mt-4"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            >
              <h1 className="text-3xl font-extrabold leading-[0.98] sm:text-5xl lg:text-6xl xl:text-7xl text-[#111816]">
                YOUR NEXT RIDE<br />
                <span className="text-[#0E3B2E]">STARTS HERE.</span>
              </h1>
            </div>

            {/* 3. DESCRIPTION */}
            <div
              className="animate-hero-fade opacity-0 mt-2 sm:mt-5"
              style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
            >
              <p className="max-w-md text-xs leading-relaxed text-text sm:text-base">
                Quality pre-owned motorcycles, thoroughly inspected and certified ready for the road.
              </p>
            </div>

            {/* 4. CTA BUTTONS & BADGES */}
            <div
              className="animate-hero-fade opacity-0 mt-3.5 sm:mt-7"
              style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
            >
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-4">
                <SpecularButton href="/buy" variant="white" size="lg" className="w-full sm:w-auto">
                  <span>Explore Bikes</span> <ArrowRight size={15} className="hidden sm:inline" />
                </SpecularButton>
                <SpecularButton href="/sell" variant="dark" size="lg" className="w-full sm:w-auto">
                  <span>Sell Your Bike</span>
                </SpecularButton>
              </div>

              <dl className="mt-5 grid max-w-md grid-cols-3 gap-2 border-t border-white/30 pt-3 text-xs sm:mt-10 sm:gap-6 sm:pt-5 sm:text-sm">
                <div>
                  <dt className="font-display text-base font-bold sm:text-2xl text-white drop-shadow-sm">100%</dt>
                  <dd className="text-[10px] text-white/90 sm:text-sm font-medium drop-shadow-sm">Verified bikes</dd>
                </div>
                <div>
                  <dt className="font-display text-base font-bold sm:text-2xl text-white drop-shadow-sm">Easy</dt>
                  <dd className="text-[10px] text-white/90 sm:text-sm font-medium drop-shadow-sm">Documentation</dd>
                </div>
                <div>
                  <dt className="font-display text-base font-bold sm:text-2xl text-white drop-shadow-sm">Trusted</dt>
                  <dd className="text-[10px] text-white/90 sm:text-sm font-medium drop-shadow-sm">By riders</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
