'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BikeImage } from '@/lib/types';

export default function Gallery({ images, alt }: { images: BikeImage[]; alt: string }) {
  const [i, setI] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-[16/10] sm:aspect-[4/3] items-center justify-center rounded-xl border border-line bg-card text-xs sm:text-sm text-muted">
        No photos yet
      </div>
    );
  }

  const prev = () => setI((curr) => (curr > 0 ? curr - 1 : images.length - 1));
  const next = () => setI((curr) => (curr < images.length - 1 ? curr + 1 : 0));

  return (
    <div>
      {/* Main Image Container */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden rounded-xl border border-line bg-card group">
        <Image
          key={images[i].id}
          src={images[i].image_url}
          alt={`${alt} photo ${i + 1}`}
          fill
          priority
          sizes="(min-width:1024px) 55vw, 100vw"
          className="object-cover"
        />

        {/* Counter Badge */}
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:text-xs">
            {i + 1} / {images.length}
          </span>
        )}

        {/* Navigation Arrows on Image (Mobile & Desktop) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-opacity opacity-80 group-hover:opacity-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-opacity opacity-80 group-hover:opacity-100"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="mt-2 sm:mt-3 flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setI(idx)}
              aria-label={`Show photo ${idx + 1}`}
              aria-current={idx === i}
              className={`relative h-10 w-14 sm:h-16 sm:w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                idx === i ? 'border-brand scale-95 ring-1 ring-brand' : 'border-line opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img.image_url} alt="" fill sizes="100px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
