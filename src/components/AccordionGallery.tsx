'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface AccordionGalleryItem {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
  badge?: string;
}

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
  showIndicators?: boolean;
}

const DEFAULT_ITEMS: AccordionGalleryItem[] = [
  { image: '/bikes/hunter-350.jpg', label: 'Royal Enfield Hunter 350', link: '/buy' },
  { image: '/bikes/yamaha-mt15.jpg', label: 'Yamaha MT-15 V2', link: '/buy' },
  { image: '/bikes/ktm-duke-390.jpg', label: 'KTM 390 Duke ABS', link: '/buy' },
];

export default function AccordionGallery({
  items = DEFAULT_ITEMS,
  defaultIndex = 0,
  height: _height = 380,
  autoPlay = true,
  autoPlayInterval = 3500,
  pauseOnHover = true,
  showIndicators = true,
  showLabels = true,
  className = '',
}: AccordionGalleryProps) {
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), items.length - 1));
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const count = items.length;
  const visibleCount = isMobile ? Math.min(3, count) : count;

  useEffect(() => {
    if (!autoPlay || visibleCount <= 1 || (pauseOnHover && isHovered)) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % visibleCount);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, visibleCount, isHovered, pauseOnHover]);

  return (
    <div
      className={`relative w-full flex flex-col gap-3 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="flex w-full gap-2 sm:gap-2.5 overflow-hidden rounded-xl h-[230px] sm:h-[380px]"
      >
        {items.map((item, i) => {
          const isActive = i === active;
          const isDesktopOnly = i >= 3;
          return (
            <Link
              key={i}
              href={item.link || '/buy'}
              onClick={(e) => {
                if (i !== active) {
                  e.preventDefault();
                  setActive(i);
                }
              }}
              onMouseEnter={() => setActive(i)}
              className={`relative h-full overflow-hidden rounded-xl border transition-all duration-500 ease-out cursor-pointer ${
                isDesktopOnly ? 'hidden sm:block' : 'block'
              } ${
                isActive
                  ? 'flex-[3.5] border-primary shadow-lg shadow-primary/20 ring-1 ring-primary'
                  : 'flex-1 border-border opacity-75 hover:opacity-100 hover:border-primary/40'
              }`}
            >
              {/* Full Image */}
              <Image
                src={item.image}
                alt={item.alt || item.label || ''}
                fill
                priority={i === 0}
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />

              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-[#0b0b0e]/30 to-transparent transition-opacity duration-300 ${
                  isActive ? 'opacity-80' : 'opacity-90'
                }`}
              />

              {/* Card Label */}
              {showLabels && item.label && (
                <div
                  className={`absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}
                >
                  <span className="h-3 sm:h-4 w-1 shrink-0 rounded-full bg-primary" />
                  <span className="font-display text-[11px] sm:text-sm font-bold text-white truncate">
                    {item.label}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Slide Indicators */}
      {showIndicators && count > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i >= 3 ? 'hidden sm:block' : 'block'
              } ${
                i === active ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-primary/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
