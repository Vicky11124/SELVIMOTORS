'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight } from 'lucide-react';
import SpecularButton from '@/components/ui/SpecularButton';

const NAV = [
  { href: '/', label: 'HOME', desktopLabel: 'Home' },
  { href: '/buy', label: 'BUY BIKES', desktopLabel: 'Buy Bikes' },
  { href: '/sell', label: 'SELL BIKE', desktopLabel: 'Sell Bike' },
  { href: '/about', label: 'ABOUT US', desktopLabel: 'About Us' },
  { href: '/contact', label: 'CONTACT', desktopLabel: 'Contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close menu automatically on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      {/* ────────────────────────────────────────────────────────── */}
      {/* NAVBAR: TRANSPARENT AT TOP → FROSTED GLASS SHRINK SCROLLED */}
      {/* ────────────────────────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 w-full pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'py-2 sm:py-2.5' : 'py-3.5 sm:py-5'
          }`}
      >
        <div
          className={`mx-auto w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'max-w-6xl px-4 sm:px-6' : 'max-w-7xl px-3 sm:px-6'
            }`}
        >
          <div
            className={`relative z-[60] flex w-full flex-row items-center justify-between rounded-full pointer-events-auto px-4 sm:px-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled
                ? 'bg-white/50 backdrop-blur-xl border border-primary/20 shadow-xl shadow-primary/10 py-2 sm:py-2.5'
                : 'bg-transparent border border-transparent shadow-none py-1 sm:py-1.5'
              }`}
          >
            {/* 1. BRAND LOGO (LEFT) */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="relative z-30 flex items-center gap-2 sm:gap-2.5 py-0.5 group pointer-events-auto cursor-pointer shrink-0"
              aria-label="Selvi Motors home"
            >
              {/* Logo Emblem Badge */}
              <div
                className={`rounded-xl overflow-hidden bg-primary p-1.5 shadow-md flex items-center justify-center border border-primary-dark group-hover:scale-105 transition-all duration-300 ${scrolled ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-9 w-9 sm:h-10 sm:w-10'
                  }`}
              >
                <svg viewBox="0 0 120 22" className="h-3 w-full text-white" aria-hidden="true" fill="currentColor">
                  <path d="M2 18C20 4 44 0 66 3c12 2 22 6 30 4-6 5-16 6-26 5-14-2-26-1-40 3-10 3-20 4-28 3Z" />
                  <path d="M78 10c10 1 22 4 40 8-14 0-28-2-40-5Z" opacity=".7" />
                </svg>
              </div>

              {/* Brand Text */}
              <div className="flex flex-col">
                <span
                  className={`font-extrabold font-display leading-none tracking-tight text-primary transition-all duration-300 ${scrolled ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
                    }`}
                >
                  SELVI <span className="text-accent">MOTORS</span>
                </span>
                <span className="text-[9px] text-text font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-primary animate-pulse" /> Pre-Owned Bikes
                </span>
              </div>
            </Link>

            {/* 2. CENTER PILL NAV LINKS (DESKTOP) */}
            <nav
              className={`relative hidden md:flex flex-1 flex-row items-center justify-center font-medium pointer-events-auto transition-all duration-300 ${scrolled ? 'space-x-1 lg:space-x-1.5' : 'space-x-1.5 lg:space-x-2'
                }`}
              aria-label="Main"
            >
              {NAV.filter((n) => n.href !== '/').map((n) => {
                const isActive = active(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`relative rounded-full transition-all duration-200 font-medium text-xs lg:text-sm z-20 whitespace-nowrap ${scrolled ? 'px-3 py-1 lg:px-3.5 lg:py-1.5' : 'px-3.5 py-1.5 lg:px-4 lg:py-2'
                      } ${isActive
                        ? 'bg-primary text-white font-semibold shadow-sm'
                        : 'text-text-strong hover:text-primary hover:bg-primary/10 border border-transparent'
                      }`}
                  >
                    <span className="relative z-20">{n.desktopLabel}</span>
                  </Link>
                );
              })}
            </nav>

            {/* 3. RIGHT ACTIONS (DESKTOP & MOBILE) */}
            <div className="flex items-center gap-2 relative z-30 pointer-events-auto shrink-0">
              {/* CTA Button */}
              <div className="hidden sm:block">
                <SpecularButton href="/sell" variant="white" size={scrolled ? 'sm' : 'md'}>
                  <span>Sell Your Bike</span>
                </SpecularButton>
              </div>

              {/* Mobile Hamburger Toggle Button */}
              <button
                aria-label="Open Navigation Menu"
                aria-expanded={open}
                type="button"
                onClick={() => setOpen(true)}
                className={`rounded-xl transition-all duration-200 text-primary border cursor-pointer pointer-events-auto z-30 flex items-center justify-center md:hidden active:scale-95 shadow-sm ${scrolled
                    ? 'p-2 bg-surface/80 backdrop-blur-md hover:bg-primary/10 border-white/60'
                    : 'p-2.5 bg-surface/90 backdrop-blur-md hover:bg-surface border-border/80'
                  }`}
              >
                <Menu size={19} className="text-primary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 4. RIDENSALE-STYLE SIDE DRAWER MOBILE MENU & BACKDROP */}
      {/* Backdrop overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[90] md:hidden transition-opacity duration-500 ease-in-out ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <aside
        aria-label="Mobile Navigation Menu"
        className={`fixed top-0 right-0 bottom-0 h-full w-[82vw] max-w-[320px] bg-[#F7F2E8] border-l border-border shadow-2xl flex flex-col justify-between z-[100] md:hidden transform-gpu will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-y-auto ${open ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
          }`}
      >
        {/* Subtle brand ambient glow in the drawer background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-52 h-52 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        {/* Top Section with Brand Header & Close Button */}
        <div className="relative z-10 p-5 pb-2">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary p-1 border border-primary-dark flex items-center justify-center">
                <svg viewBox="0 0 120 22" className="h-2.5 w-full text-white" aria-hidden="true" fill="currentColor">
                  <path d="M2 18C20 4 44 0 66 3c12 2 22 6 30 4-6 5-16 6-26 5-14-2-26-1-40 3-10 3-20 4-28 3Z" />
                </svg>
              </div>
              <span className="text-sm font-extrabold font-display tracking-tight text-primary">
                SELVI <span className="text-accent">MOTORS</span>
              </span>
            </div>

            {/* RideNSale style close [X] square button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="h-10 w-10 rounded-xl bg-surface hover:bg-primary/10 border border-border text-primary flex items-center justify-center transition-colors duration-200 active:scale-95 shadow-sm"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Menu Links with horizontal hairline dividers & Staggered Wave Transition */}
          <nav className="mt-4 flex flex-col divide-y divide-border" aria-label="Mobile Navigation">
            {NAV.map((n, idx) => {
              const isActive = active(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  style={{
                    transitionDelay: open ? `${80 + idx * 55}ms` : '0ms',
                  }}
                  className={`flex items-center justify-between py-4 font-extrabold tracking-wider text-base group transform-gpu transition-all duration-[450ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    } ${isActive ? 'text-primary font-bold' : 'text-text hover:text-primary'}`}
                >
                  <span className="transition-transform duration-200 group-hover:translate-x-1">{n.label}</span>
                  <ChevronRight
                    size={18}
                    className={`transition-transform duration-200 ${isActive ? 'text-primary translate-x-0.5' : 'text-text/40 group-hover:text-primary group-hover:translate-x-1'
                      }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom CTA Button with smooth delayed reveal */}
        <div
          style={{
            transitionDelay: open ? `${80 + NAV.length * 55}ms` : '0ms',
          }}
          className={`relative z-10 p-5 pt-3 pb-8 border-t border-border bg-[#F7F2E8]/95 transform-gpu transition-all duration-[450ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
        >
          <Link
            href="/sell"
            onClick={() => setOpen(false)}
            className="btn-red w-full text-center py-3 text-sm tracking-wider font-bold shadow-md"
          >
            SELL YOUR BIKE
          </Link>
        </div>
      </aside>

      {/* Spacer to offset floating navbar height */}
      <div className="h-16 sm:h-20" aria-hidden="true" />
    </>
  );
}
