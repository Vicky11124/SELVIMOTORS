'use client';

import { createPortal } from 'react-dom';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import {
  Check,
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { FUEL_TYPES, TRANSMISSIONS } from '@/lib/types';
import { KM_OPTIONS, PRICE_RANGES, SORT_OPTIONS } from '@/lib/filter-options';
import { BIKE_BRANDS } from '@/lib/bikeData';

interface BikeFiltersProps {
  brands: string[];
  totalAvailable?: number;
}

const POPULAR_BRANDS = [
  'Royal Enfield',
  'Yamaha',
  'KTM',
  'Kawasaki',
  'Honda',
  'TVS',
  'Bajaj',
  'Suzuki',
  'Hero',
  'BMW Motorrad',
];

const YEAR_PILLS = [
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: '2020', label: '2020+' },
  { value: '2018', label: 'Older' },
];

export default function BikeFilters({ brands, totalAvailable = 0 }: BikeFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  // Search state with debouncing
  const [q, setQ] = useState(params.get('q') ?? '');

  // SSR / Portal mounted state
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Popover & Drawer states
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  // Custom price input draft state
  const currentPriceParam = params.get('price') ?? '';
  const [minPriceDraft, setMinPriceDraft] = useState('');
  const [maxPriceDraft, setMaxPriceDraft] = useState('');

  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync draft price inputs when popover opens or params change
  useEffect(() => {
    if (currentPriceParam) {
      const [min, max] = currentPriceParam.split('-');
      setMinPriceDraft(min && min !== '0' ? min : '');
      setMaxPriceDraft(max && max !== '99999999' ? max : '');
    } else {
      setMinPriceDraft('');
      setMaxPriceDraft('');
    }
  }, [currentPriceParam, activePopover]);

  // Combine DB brands with researched brand catalog
  const allBrands = Array.from(
    new Set([...brands, ...BIKE_BRANDS.filter((b) => b !== 'Other')])
  );

  const filteredBrandsList = allBrands.filter((b) =>
    b.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );

  // Active filters detection
  const selectedBrand = params.get('brand') ?? '';
  const selectedPrice = params.get('price') ?? '';
  const selectedYear = params.get('year') ?? '';
  const selectedFuel = params.get('fuel') ?? '';
  const selectedTransmission = params.get('transmission') ?? '';
  const selectedKm = params.get('km') ?? '';
  const selectedSort = params.get('sort') ?? 'latest';

  const filterKeys = ['q', 'brand', 'price', 'year', 'fuel', 'transmission', 'km'];
  const activeCount = filterKeys.filter((k) => params.get(k)).length;
  const hasActiveFilters = activeCount > 0;

  // Update URL search params
  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    if (!('page' in patch)) {
      next.delete('page');
    }
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === '' || v === undefined) {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    startTransition(() => {
      router.push(`${pathname}${next.toString() ? `?${next}` : ''}`, { scroll: false });
    });
  };

  // Debounced search input
  useEffect(() => {
    if (q === (params.get('q') ?? '')) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Close popovers on click outside or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setActivePopover(null);
        setIsDrawerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Reset all filters
  const resetAll = () => {
    setQ('');
    setMinPriceDraft('');
    setMaxPriceDraft('');
    setActivePopover(null);
    setIsDrawerOpen(false);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  // Apply custom price range draft
  const handleApplyPriceDraft = () => {
    const min = minPriceDraft.replace(/[^0-9]/g, '');
    const max = maxPriceDraft.replace(/[^0-9]/g, '');
    if (!min && !max) {
      update({ price: null });
    } else {
      const finalMin = min || '0';
      const finalMax = max || '99999999';
      update({ price: `${finalMin}-${finalMax}` });
    }
    setActivePopover(null);
  };

  // Helper for human-readable active chip labels
  const getActiveChips = () => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (q) {
      chips.push({
        key: 'q',
        label: `"${q}"`,
        onRemove: () => {
          setQ('');
          update({ q: null });
        },
      });
    }
    if (selectedBrand) {
      chips.push({
        key: 'brand',
        label: selectedBrand,
        onRemove: () => update({ brand: null }),
      });
    }
    if (selectedPrice) {
      const preset = PRICE_RANGES.find((p) => p.value === selectedPrice);
      let label = preset ? preset.label : selectedPrice;
      if (!preset) {
        const [min, max] = selectedPrice.split('-');
        if (min === '0') label = `Under ₹${(Number(max) / 100000).toFixed(1)}L`;
        else if (max === '99999999') label = `₹${(Number(min) / 100000).toFixed(1)}L+`;
        else label = `₹${(Number(min) / 100000).toFixed(1)}L – ₹${(Number(max) / 100000).toFixed(1)}L`;
      }
      chips.push({
        key: 'price',
        label,
        onRemove: () => update({ price: null }),
      });
    }
    if (selectedYear) {
      const pill = YEAR_PILLS.find((y) => y.value === selectedYear);
      chips.push({
        key: 'year',
        label: pill ? `${pill.label}` : `${selectedYear}+`,
        onRemove: () => update({ year: null }),
      });
    }
    if (selectedKm) {
      const opt = KM_OPTIONS.find((k) => k.value === selectedKm);
      chips.push({
        key: 'km',
        label: opt ? opt.label : `Under ${selectedKm} KM`,
        onRemove: () => update({ km: null }),
      });
    }
    if (selectedFuel) {
      chips.push({
        key: 'fuel',
        label: selectedFuel,
        onRemove: () => update({ fuel: null }),
      });
    }
    if (selectedTransmission) {
      chips.push({
        key: 'transmission',
        label: selectedTransmission,
        onRemove: () => update({ transmission: null }),
      });
    }

    return chips;
  };

  const activeChips = getActiveChips();

  return (
    <div className="space-y-4" ref={popoverRef}>
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. TOP ROW: Search Bar + Sort + All Filters Button        */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Search Bar */}
        <div className="relative min-w-[240px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text/50"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search brand, model or keyword..."
            className="field !py-2.5 !pl-10 !pr-10 text-xs sm:text-sm rounded-xl border border-border bg-surface shadow-sm focus:border-primary text-text-strong placeholder:text-text/50"
            aria-label="Search bikes"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                update({ q: null });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text/50 hover:text-text-strong"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Desktop / Tablet: Sort Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'sort' ? null : 'sort')}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all ${
              selectedSort && selectedSort !== 'latest'
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-border bg-surface text-text hover:border-primary/40'
            }`}
          >
            <span>
              Sort: {SORT_OPTIONS.find((s) => s.value === selectedSort)?.label || 'Latest'}
            </span>
            <ChevronDown size={14} className="text-text/60" />
          </button>

          {/* Sort Popover */}
          {activePopover === 'sort' && (
            <div className="absolute left-0 top-full z-[80] mt-2 w-48 rounded-xl border border-border bg-surface p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wider text-text/60 px-2 py-1">
                Sort Inventory
              </div>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    update({ sort: opt.value === 'latest' ? null : opt.value });
                    setActivePopover(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                    selectedSort === opt.value
                      ? 'bg-primary text-white font-semibold'
                      : 'text-text hover:bg-surface-muted hover:text-text-strong'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedSort === opt.value && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* All Filters Button */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeCount > 0
              ? 'border-primary bg-primary text-white shadow-md'
              : 'border-border bg-surface text-text hover:border-primary hover:bg-surface-muted'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. QUICK BRAND CHIPS (Horizontally Scrollable)             */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          type="button"
          onClick={() => update({ brand: null })}
          className={`flex-shrink-0 rounded-full px-3.5 py-1.5 font-semibold transition-all ${
            !selectedBrand
              ? 'bg-primary text-white shadow-sm ring-1 ring-primary'
              : 'border border-border bg-surface text-text hover:border-primary/50 hover:text-primary'
          }`}
        >
          All Brands
        </button>
        {POPULAR_BRANDS.map((b) => {
          const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
          return (
            <button
              key={b}
              type="button"
              onClick={() => update({ brand: isSelected ? null : b })}
              className={`flex-shrink-0 rounded-full px-3.5 py-1.5 font-semibold transition-all ${
                isSelected
                  ? 'bg-primary text-white shadow-sm ring-1 ring-primary'
                  : 'border border-border bg-surface text-text hover:border-primary/50 hover:text-primary'
              }`}
            >
              {b}
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. DESKTOP QUICK FILTER POPOVER BAR                       */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="hidden flex-wrap items-center gap-2 border-t border-line pt-3 sm:flex">
        {/* BRAND POPOVER BUTTON */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'brand' ? null : 'brand')}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedBrand
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
            }`}
          >
            <span>{selectedBrand || 'Brand'}</span>
            <ChevronDown size={13} className={selectedBrand ? 'text-white' : 'text-slate/70'} />
          </button>

          {activePopover === 'brand' && (
            <div className="absolute left-0 top-full z-[80] mt-2 w-64 rounded-xl border border-line bg-surface p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate/70">
                  Select Brand
                </span>
                {selectedBrand && (
                  <button
                    type="button"
                    onClick={() => update({ brand: null })}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Find brand..."
                className="mb-2 w-full rounded-lg border border-line bg-cream px-2.5 py-1.5 text-xs text-dark placeholder:text-slate/60 focus:border-primary focus:outline-none"
              />
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 text-xs">
                {filteredBrandsList.map((b) => {
                  const isChecked = selectedBrand.toLowerCase() === b.toLowerCase();
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        update({ brand: isChecked ? null : b });
                        setActivePopover(null);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 transition-colors ${
                        isChecked
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-slate hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <span>{b}</span>
                      {isChecked && <Check size={14} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* PRICE POPOVER BUTTON */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'price' ? null : 'price')}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedPrice
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
            }`}
          >
            <span>{selectedPrice ? 'Price: Active' : 'Price'}</span>
            <ChevronDown size={13} className={selectedPrice ? 'text-white' : 'text-slate/70'} />
          </button>

          {activePopover === 'price' && (
            <div className="absolute left-0 top-full z-[80] mt-2 w-72 rounded-xl border border-line bg-surface p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate/70">
                  Price Range (₹)
                </span>
                {selectedPrice && (
                  <button
                    type="button"
                    onClick={() => update({ price: null })}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div className="mb-3 grid grid-cols-2 gap-1.5">
                {PRICE_RANGES.map((pr) => {
                  const isCur = selectedPrice === pr.value;
                  return (
                    <button
                      key={pr.value}
                      type="button"
                      onClick={() => {
                        update({ price: isCur ? null : pr.value });
                        setActivePopover(null);
                      }}
                      className={`rounded-md border px-2 py-1.5 text-center text-[11px] font-semibold transition-colors ${
                        isCur
                          ? 'border-primary bg-primary text-white'
                          : 'border-line bg-cream text-slate hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {pr.label}
                    </button>
                  );
                })}
              </div>

              {/* Min & Max Inputs */}
              <div className="border-t border-line pt-2.5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="mb-1 block text-[10px] text-slate/70">Min Price (₹)</label>
                    <input
                      type="number"
                      value={minPriceDraft}
                      onChange={(e) => setMinPriceDraft(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full rounded-md border border-line bg-cream px-2 py-1.5 text-xs text-dark focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] text-slate/70">Max Price (₹)</label>
                    <input
                      type="number"
                      value={maxPriceDraft}
                      onChange={(e) => setMaxPriceDraft(e.target.value)}
                      placeholder="e.g. 250000"
                      className="w-full rounded-md border border-line bg-cream px-2 py-1.5 text-xs text-dark focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyPriceDraft}
                  className="mt-2.5 w-full rounded-lg bg-primary py-1.5 text-center text-xs font-bold text-white transition-colors hover:bg-primary/90"
                >
                  Apply Range
                </button>
              </div>
            </div>
          )}
        </div>

        {/* YEAR POPOVER BUTTON */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'year' ? null : 'year')}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedYear
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
            }`}
          >
            <span>{selectedYear ? `${selectedYear}+` : 'Year'}</span>
            <ChevronDown size={13} className={selectedYear ? 'text-white' : 'text-slate/70'} />
          </button>

          {activePopover === 'year' && (
            <div className="absolute left-0 top-full z-[80] mt-2 w-56 rounded-xl border border-line bg-surface p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate/70">
                  Registration Year
                </span>
                {selectedYear && (
                  <button
                    type="button"
                    onClick={() => update({ year: null })}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {YEAR_PILLS.map((y) => {
                  const isSel = selectedYear === y.value;
                  return (
                    <button
                      key={y.value}
                      type="button"
                      onClick={() => {
                        update({ year: isSel ? null : y.value });
                        setActivePopover(null);
                      }}
                      className={`rounded-lg border px-2 py-1.5 text-center text-xs font-semibold transition-colors ${
                        isSel
                          ? 'border-primary bg-primary text-white'
                          : 'border-line bg-cream text-slate hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {y.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* KM DRIVEN POPOVER BUTTON */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'km' ? null : 'km')}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedKm
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
            }`}
          >
            <span>{selectedKm ? `KM: <${Number(selectedKm) / 1000}k` : 'KM Driven'}</span>
            <ChevronDown size={13} className={selectedKm ? 'text-white' : 'text-slate/70'} />
          </button>

          {activePopover === 'km' && (
            <div className="absolute left-0 top-full z-[80] mt-2 w-60 rounded-xl border border-line bg-surface p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate/70">
                  Odometer KM
                </span>
                {selectedKm && (
                  <button
                    type="button"
                    onClick={() => update({ km: null })}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1 text-xs">
                {KM_OPTIONS.map((k) => {
                  const isSel = selectedKm === k.value;
                  return (
                    <button
                      key={k.value}
                      type="button"
                      onClick={() => {
                        update({ km: isSel ? null : k.value });
                        setActivePopover(null);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors ${
                        isSel
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-slate hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <span>{k.label}</span>
                      {isSel && <Check size={14} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* FUEL TYPE POPOVER BUTTON */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'fuel' ? null : 'fuel')}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedFuel
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
            }`}
          >
            <span>{selectedFuel || 'Fuel'}</span>
            <ChevronDown size={13} className={selectedFuel ? 'text-white' : 'text-slate/70'} />
          </button>

          {activePopover === 'fuel' && (
            <div className="absolute left-0 top-full z-[80] mt-2 w-44 rounded-xl border border-line bg-surface p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate/70">
                  Fuel Type
                </span>
                {selectedFuel && (
                  <button
                    type="button"
                    onClick={() => update({ fuel: null })}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1 text-xs">
                {FUEL_TYPES.map((f) => {
                  const isSel = selectedFuel === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        update({ fuel: isSel ? null : f });
                        setActivePopover(null);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors ${
                        isSel
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-slate hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <span>{f}</span>
                      {isSel && <Check size={14} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* TRANSMISSION POPOVER BUTTON */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setActivePopover(activePopover === 'transmission' ? null : 'transmission')
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedTransmission
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
            }`}
          >
            <span>{selectedTransmission || 'Transmission'}</span>
            <ChevronDown
              size={13}
              className={selectedTransmission ? 'text-white' : 'text-slate/70'}
            />
          </button>

          {activePopover === 'transmission' && (
            <div className="absolute left-0 top-full z-[80] mt-2 w-48 rounded-xl border border-line bg-surface p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate/70">
                  Transmission
                </span>
                {selectedTransmission && (
                  <button
                    type="button"
                    onClick={() => update({ transmission: null })}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1 text-xs">
                {TRANSMISSIONS.map((t) => {
                  const isSel = selectedTransmission === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        update({ transmission: isSel ? null : t });
                        setActivePopover(null);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors ${
                        isSel
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-slate hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      <span>{t}</span>
                      {isSel && <Check size={14} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Clear All Inline Link if filters active */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <RotateCcw size={12} /> Reset Filters
          </button>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. ACTIVE FILTER CHIPS ROW                                */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-xs text-slate/80">Active:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 py-1 pl-3 pr-2 text-xs font-semibold text-primary transition-colors shadow-sm"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-white"
                aria-label={`Remove filter ${chip.label}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={resetAll}
            className="ml-1 text-xs font-semibold text-primary hover:underline"
          >
            Clear All
          </button>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. ALL FILTERS DRAWER / BOTTOM SHEET MODAL                 */}
      {/* ────────────────────────────────────────────────────────── */}
      {mounted &&
        isDrawerOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex justify-end">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-dark/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Content Panel (Right on Desktop, Bottom Sheet on Mobile) */}
            <div className="relative z-[100000] flex h-screen w-full max-w-md flex-col border-l border-line bg-cream text-dark shadow-2xl max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:h-[90vh] max-sm:rounded-t-2xl max-sm:border-t animate-in slide-in-from-right max-sm:slide-in-from-bottom duration-200">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-line px-5 py-4 bg-surface">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-primary" />
                  <h2 className="font-display text-lg font-bold text-dark">Filter Bikes</h2>
                  {activeCount > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
                      {activeCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-slate hover:bg-cream hover:text-dark"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Scrollable Body (with min-h-0 to prevent flex collapse) */}
              <div className="flex-1 min-h-0 space-y-6 overflow-y-auto p-5 text-sm overscroll-contain">
                {/* BRAND SECTION */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate/70">
                      Brand
                    </h3>
                    {selectedBrand && (
                      <button
                        type="button"
                        onClick={() => update({ brand: null })}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allBrands.map((b) => {
                      const isSelected = selectedBrand.toLowerCase() === b.toLowerCase();
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => update({ brand: isSelected ? null : b })}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-primary bg-primary text-white shadow-sm'
                              : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PRICE RANGE SECTION */}
                <div className="border-t border-line pt-5">
                  <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate/70">
                      Price Range
                    </h3>
                    {selectedPrice && (
                      <button
                        type="button"
                        onClick={() => update({ price: null })}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {PRICE_RANGES.map((pr) => {
                      const isCur = selectedPrice === pr.value;
                      return (
                        <button
                          key={pr.value}
                          type="button"
                          onClick={() => update({ price: isCur ? null : pr.value })}
                          className={`rounded-lg border p-2 text-center text-xs font-semibold transition-colors ${
                            isCur
                              ? 'border-primary bg-primary text-white'
                              : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          {pr.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[11px] text-slate/70">Min Price (₹)</label>
                      <input
                        type="number"
                        value={minPriceDraft}
                        onChange={(e) => setMinPriceDraft(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-xs text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] text-slate/70">Max Price (₹)</label>
                      <input
                        type="number"
                        value={maxPriceDraft}
                        onChange={(e) => setMaxPriceDraft(e.target.value)}
                        placeholder="500000"
                        className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-xs text-dark focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPriceDraft}
                    className="mt-2.5 w-full rounded-lg bg-surface border border-line py-2 text-xs font-bold text-slate hover:bg-primary hover:text-white transition-colors"
                  >
                    Apply Custom Price
                  </button>
                </div>

                {/* REGISTRATION YEAR */}
                <div className="border-t border-line pt-5">
                  <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate/70">
                      Registration Year
                    </h3>
                    {selectedYear && (
                      <button
                        type="button"
                        onClick={() => update({ year: null })}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {YEAR_PILLS.map((y) => {
                      const isSel = selectedYear === y.value;
                      return (
                        <button
                          key={y.value}
                          type="button"
                          onClick={() => update({ year: isSel ? null : y.value })}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            isSel
                              ? 'border-primary bg-primary text-white'
                              : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          {y.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* KM DRIVEN */}
                <div className="border-t border-line pt-5">
                  <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate/70">
                      KM Driven
                    </h3>
                    {selectedKm && (
                      <button
                        type="button"
                        onClick={() => update({ km: null })}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {KM_OPTIONS.map((k) => {
                      const isSel = selectedKm === k.value;
                      return (
                        <button
                          key={k.value}
                          type="button"
                          onClick={() => update({ km: isSel ? null : k.value })}
                          className={`rounded-lg border p-2 text-center text-xs font-semibold transition-colors ${
                            isSel
                              ? 'border-primary bg-primary text-white'
                              : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          {k.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* FUEL & TRANSMISSION */}
                <div className="border-t border-line pt-5 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-slate/70">
                      Fuel
                    </h3>
                    <div className="space-y-1.5">
                      {FUEL_TYPES.map((f) => {
                        const isSel = selectedFuel === f;
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => update({ fuel: isSel ? null : f })}
                            className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors ${
                              isSel
                                ? 'border-primary bg-primary text-white'
                                : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
                            }`}
                          >
                            <span>{f}</span>
                            {isSel && <Check size={13} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-display text-xs font-bold uppercase tracking-wider text-slate/70">
                      Transmission
                    </h3>
                    <div className="space-y-1.5">
                      {TRANSMISSIONS.map((t) => {
                        const isSel = selectedTransmission === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => update({ transmission: isSel ? null : t })}
                            className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors ${
                              isSel
                                ? 'border-primary bg-primary text-white'
                                : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
                            }`}
                          >
                            <span>{t}</span>
                            {isSel && <Check size={13} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Footer */}
              <div className="border-t border-line bg-surface p-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-xs font-bold text-slate hover:text-primary px-3 py-2.5"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 rounded-xl bg-primary py-3 text-center text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-transform active:scale-95 hover:bg-primary/90"
                >
                  Show {totalAvailable > 0 ? `${totalAvailable} Bikes` : 'Results'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
