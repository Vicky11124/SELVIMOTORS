'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}

function buildPageUrl(page: number, searchParams: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      params.set(k, Array.isArray(v) ? v[0] : v);
    }
  });

  if (page <= 1) {
    params.delete('page');
  } else {
    params.set('page', String(page));
  }

  const query = params.toString();
  return `/buy${query ? `?${query}` : ''}#inventory-grid`;
}

export function getPaginationRange(
  currentPage: number,
  totalPages: number
): (number | 'ellipsis-left' | 'ellipsis-right')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const showLeftEllipsis = currentPage > 3;
  const showRightEllipsis = currentPage < totalPages - 2;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [1, 2, 3, 'ellipsis-right', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, 'ellipsis-left', totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis-left', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-right', totalPages];
}

export default function Pagination({ currentPage, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPaginationRange(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const prevUrl = buildPageUrl(currentPage - 1, searchParams);
  const nextUrl = buildPageUrl(currentPage + 1, searchParams);

  return (
    <nav
      aria-label="Inventory Pagination"
      className="mt-8 sm:mt-12 flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-6 sm:pt-8"
    >
      {/* MOBILE COMPACT PAGINATION */}
      <div className="flex w-full items-center justify-between gap-3 sm:hidden">
        {isFirstPage ? (
          <span
            aria-disabled="true"
            className="inline-flex items-center gap-1 rounded-xl border border-line/40 bg-surface/40 px-3.5 py-2 text-xs font-semibold text-muted/40 opacity-50 cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Previous
          </span>
        ) : (
          <Link
            href={prevUrl}
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-text-strong transition-all hover:border-primary hover:text-primary"
          >
            <ChevronLeft size={16} /> Previous
          </Link>
        )}

        <div className="text-xs font-semibold text-text-strong">
          <span className="text-primary font-bold text-sm">{currentPage}</span>
          <span className="mx-1 text-muted">/</span>
          <span className="text-muted font-normal">{totalPages}</span>
        </div>

        {isLastPage ? (
          <span
            aria-disabled="true"
            className="inline-flex items-center gap-1 rounded-xl border border-line/40 bg-surface/40 px-3.5 py-2 text-xs font-semibold text-muted/40 opacity-50 cursor-not-allowed"
          >
            Next <ChevronRight size={16} />
          </span>
        ) : (
          <Link
            href={nextUrl}
            className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-text-strong transition-all hover:border-primary hover:text-primary"
          >
            Next <ChevronRight size={16} />
          </Link>
        )}
      </div>

      {/* DESKTOP PAGINATION */}
      <div className="hidden sm:flex items-center justify-center gap-2">
        {/* Previous Button */}
        {isFirstPage ? (
          <span
            aria-disabled="true"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line/40 bg-surface/40 px-4 py-2 text-xs font-semibold text-muted/40 opacity-50 cursor-not-allowed mr-2"
          >
            <ChevronLeft size={15} /> Previous
          </span>
        ) : (
          <Link
            href={prevUrl}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-text-strong transition-all hover:border-primary hover:text-primary shadow-sm mr-2"
          >
            <ChevronLeft size={15} /> Previous
          </Link>
        )}

        {/* Page Numbers */}
        {pages.map((p, idx) => {
          if (typeof p === 'string') {
            return (
              <span
                key={`${p}-${idx}`}
                className="flex h-9 w-9 items-center justify-center text-xs font-semibold text-muted/70 select-none"
              >
                …
              </span>
            );
          }

          const isCurrent = p === currentPage;
          const url = buildPageUrl(p, searchParams);

          if (isCurrent) {
            return (
              <span
                key={p}
                aria-current="page"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary bg-primary text-xs font-bold text-white shadow-md shadow-primary/20 select-none"
              >
                {p}
              </span>
            );
          }

          return (
            <Link
              key={p}
              href={url}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-xs font-semibold text-text-strong transition-all hover:border-primary hover:text-primary hover:bg-primary/10"
            >
              {p}
            </Link>
          );
        })}

        {/* Next Button */}
        {isLastPage ? (
          <span
            aria-disabled="true"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line/40 bg-surface/40 px-4 py-2 text-xs font-semibold text-muted/40 opacity-50 cursor-not-allowed ml-2"
          >
            Next <ChevronRight size={15} />
          </span>
        ) : (
          <Link
            href={nextUrl}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-text-strong transition-all hover:border-primary hover:text-primary shadow-sm ml-2"
          >
            Next <ChevronRight size={15} />
          </Link>
        )}
      </div>
    </nav>
  );
}
