'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ExploreMascotWidget() {
  return (
    <aside
      aria-label="Explore Collections Mascot Widget"
      className="fixed bottom-[72px] right-3 sm:bottom-[84px] sm:right-6 z-30 select-none flex flex-col items-end gap-1.5 animate-in fade-in slide-in-from-bottom-3 duration-300 opacity-95 hover:opacity-100 transition-opacity"
    >
      <Link
        href="/buy"
        aria-label="Explore our bike collection"
        className="group relative flex items-center gap-2 sm:gap-2.5 rounded-full border border-primary/20 bg-surface/95 backdrop-blur-md p-1.5 pr-3.5 sm:p-2 sm:pr-4 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 hover:border-primary/40"
      >
        {/* Helmeted Rider Mascot Image Avatar */}
        <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center shrink-0 rounded-full bg-primary/10 overflow-hidden border border-primary/20 p-0.5">
          <Image
            src="/mascot.png"
            alt="Selvi Motors Helmeted Rider Mascot"
            width={40}
            height={40}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        </div>

        {/* Mascot Text CTA */}
        <div className="flex flex-col text-left">
          <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-accent leading-none">
            Selvi Motors
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-text-strong flex items-center gap-1 group-hover:text-primary transition-colors mt-0.5">
            Explore Bikes <ArrowRight size={12} className="transition-transform group-hover:translate-x-1 text-primary" />
          </span>
        </div>
      </Link>
    </aside>
  );
}
