'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  ImagePlus,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SpecularButton from './ui/SpecularButton';
import { submitSellRequest } from '@/app/actions';
import {
  BIKE_BRANDS,
  CURRENT_YEAR,
  INDIAN_BIKE_CATALOG,
  YEAR_OPTIONS,
} from '@/lib/bikeData';
import { formatFileSize, optimizeImageList } from '@/lib/imageOptimizer';
import { formatKm, formatPrice, WHATSAPP_NUMBER } from '@/lib/utils';

const MAX_FILES = 10;
const MIN_FILES = 3;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic'];

// Primary popular brands for Step 1
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

const POPULAR_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

const KM_PRESETS = [
  { label: '< 5,000 KM', value: 4000 },
  { label: '5,000 – 10,000 KM', value: 8000 },
  { label: '10,000 – 20,000 KM', value: 15000 },
  { label: '20,000+ KM', value: 25000 },
];

const CONDITIONS = [
  {
    value: 'Excellent',
    title: 'Excellent Condition',
    desc: 'Like new, showroom condition, flawless engine & paint, zero issues.',
  },
  {
    value: 'Good',
    title: 'Good Condition',
    desc: 'Well maintained, normal usage wear, single owner, runs great.',
  },
  {
    value: 'Fair',
    title: 'Fair Condition',
    desc: 'Minor cosmetic scratches or upcoming scheduled service due.',
  },
];

const PRICE_PRESETS = [
  { label: '₹80K', value: 80000 },
  { label: '₹1.2L', value: 120000 },
  { label: '₹1.5L', value: 150000 },
  { label: '₹2L', value: 200000 },
  { label: '₹3L', value: 300000 },
  { label: '₹5L', value: 500000 },
];

const PHOTO_GUIDE_ITEMS = [
  { label: 'Front View', tip: 'Full bike headlamp & wheel' },
  { label: 'Right Side', tip: 'Exhaust & engine view' },
  { label: 'Left Side', tip: 'Chain & drive view' },
  { label: 'Odometer', tip: 'Clear KM reading' },
  { label: 'Rear View', tip: 'Tail lamp & tyre' },
];

const QUICK_CITIES = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy', 'Vellore'];

interface SellPhoto {
  file: File;
  previewUrl: string;
  size: number;
}

export default function SellForm({ brands: _brands }: { brands: string[] }) {
  // 6-step progressive journey
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [exitingStep, setExitingStep] = useState<number | null>(null);
  const [direction, setDirection] = useState<number>(1);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  // Form states
  const [brand, setBrand] = useState('Royal Enfield');
  const [brandSearch, setBrandSearch] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(false);

  const [model, setModel] = useState('Hunter 350');
  const [modelSearch, setModelSearch] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [isTypingCustomModel, setIsTypingCustomModel] = useState(false);

  const [year, setYear] = useState<number>(2023);
  const [km, setKm] = useState<number | string>(8000);

  const [condition, setCondition] = useState('Excellent');
  const [expectedPrice, setExpectedPrice] = useState<number | string>(150000);
  const [openToOffer, setOpenToOffer] = useState(false);
  const [description, setDescription] = useState('');

  const [photos, setPhotos] = useState<SellPhoto[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Chennai');
  const [isOlderYearOpen, setIsOlderYearOpen] = useState(false);
  
  const olderYearRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Smooth step transition handler
  function changeStep(nextStep: 1 | 2 | 3 | 4 | 5 | 6, dir?: number) {
    if (nextStep === step) return;
    const newDir = dir ?? (nextStep > step ? 1 : -1);
    setDirection(newDir);
    setExitingStep(step);
    setStep(nextStep);

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = setTimeout(() => {
      setExitingStep(null);
    }, 400);
  }

  // Close older year popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (olderYearRef.current && !olderYearRef.current.contains(e.target as Node)) {
        setIsOlderYearOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup transition timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // Measured height container observation
  useEffect(() => {
    const el = activeStepRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) {
        setContainerHeight(Math.round(h));
      }
    };

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [step, brandSearch, showAllBrands, modelSearch, isTypingCustomModel, photos, isOlderYearOpen]);

  // Adjust scroll position gently if form top has scrolled off above screen
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (formRef.current) {
      const rect = formRef.current.getBoundingClientRect();
      if (rect.top < -40) {
        const yOffset = -20;
        const y = window.pageYOffset + rect.top + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  }, [step]);

  // Async states
  const [optimizing, setOptimizing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    brand: string;
    model: string;
    year: number;
    km: number;
    expectedPrice: number | null;
    location: string;
    photosCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered brand list
  const filteredBrands = useMemo(() => {
    if (brandSearch.trim()) {
      const q = brandSearch.toLowerCase();
      return BIKE_BRANDS.filter((b) => b.toLowerCase().includes(q));
    }
    return showAllBrands ? BIKE_BRANDS : POPULAR_BRANDS;
  }, [brandSearch, showAllBrands]);

  // Available models for current brand
  const allBrandModels = useMemo(() => {
    return INDIAN_BIKE_CATALOG[brand] || ['Other Model'];
  }, [brand]);

  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return allBrandModels;
    const q = modelSearch.toLowerCase();
    return allBrandModels.filter((m) => m.toLowerCase().includes(q));
  }, [allBrandModels, modelSearch]);

  // Brand selection handler (auto-advances immediately to model selection)
  function handleSelectBrand(newBrand: string) {
    setBrand(newBrand);
    setIsTypingCustomModel(false);
    setCustomModel('');
    setModelSearch('');
    const models = INDIAN_BIKE_CATALOG[newBrand] || ['Other Model'];
    setModel(models[0] || 'Other Model');
    setError('');
    changeStep(2, 1);
  }

  // Model selection handler (auto-advances immediately to year & km)
  function handleSelectModel(newModel: string) {
    if (newModel === '__custom__') {
      setIsTypingCustomModel(true);
      setModel('');
    } else {
      setIsTypingCustomModel(false);
      setModel(newModel);
      setError('');
      changeStep(3, 1);
    }
  }

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [photos]);

  // Photo handlers
  async function handleAddFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setError('');
    setOptimizing(true);

    const slots = MAX_FILES - photos.length;
    if (slots <= 0) {
      setError(`Maximum ${MAX_FILES} photos allowed.`);
      setOptimizing(false);
      return;
    }

    const filesToConvert = Array.from(list).slice(0, slots);

    try {
      const results = await optimizeImageList(filesToConvert, 1600, 1200, 0.82);
      const newItems: SellPhoto[] = results.map((r) => ({
        file: r.file,
        previewUrl: URL.createObjectURL(r.file),
        size: r.optimizedSize,
      }));

      setPhotos((prev) => [...prev, ...newItems]);
    } catch {
      setError('Could not process some photos. Please try another image.');
    } finally {
      setOptimizing(false);
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function makeCover(index: number) {
    if (index === 0) return;
    setPhotos((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      if (chosen) copy.unshift(chosen);
      return copy;
    });
  }

  // Validation per step
  function validateStep(targetStep: number): boolean {
    setError('');

    if (targetStep === 1) {
      if (!brand) {
        setError('Please select a bike brand.');
        return false;
      }
    }

    if (targetStep === 2) {
      const finalModel = isTypingCustomModel ? customModel.trim() : model;
      if (!finalModel) {
        setError('Please select or enter your bike model.');
        return false;
      }
    }

    if (targetStep === 3) {
      if (!year || year < 1980 || year > CURRENT_YEAR + 1) {
        setError('Please select a valid registration year.');
        return false;
      }
      const kmNum = Number(km);
      if (isNaN(kmNum) || kmNum < 0) {
        setError('Please enter the distance covered in KM.');
        return false;
      }
    }

    if (targetStep === 4) {
      if (!condition) {
        setError('Please select the overall condition of your bike.');
        return false;
      }
      if (!openToOffer && expectedPrice !== '') {
        const p = Number(expectedPrice);
        if (isNaN(p) || p < 0) {
          setError('Please enter a valid expected price.');
          return false;
        }
      }
    }

    if (targetStep === 5) {
      if (photos.length < MIN_FILES) {
        setError(`Please upload at least ${MIN_FILES} photos (${photos.length}/${MIN_FILES} added). Clear photos get higher valuation!`);
        return false;
      }
    }

    if (targetStep === 6) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return false;
      }
      const cleanPhone = phone.trim().replace(/[\s-]/g, '');
      if (!/^[+\d][\d]{7,14}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit mobile number.');
        return false;
      }
      if (!location.trim()) {
        setError('Please select or enter your city.');
        return false;
      }
    }

    return true;
  }

  function goNext() {
    if (validateStep(step)) {
      if (step < 6) {
        changeStep((step + 1) as 1 | 2 | 3 | 4 | 5 | 6, 1);
      }
    }
  }

  function goBack() {
    setError('');
    if (step > 1) {
      changeStep((step - 1) as 1 | 2 | 3 | 4 | 5 | 6, -1);
    }
  }

  // Final submission to Supabase
  async function handleSubmit() {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5) || !validateStep(6)) {
      return;
    }

    setBusy(true);
    setError('');

    const finalModel = isTypingCustomModel ? customModel.trim() : model;
    const finalPrice = openToOffer ? null : expectedPrice ? Number(expectedPrice) : null;
    const finalKm = Number(km);

    try {
      const uploadId = crypto.randomUUID();
      const supabase = createClient();
      const paths: string[] = [];

      // Upload WebP photos to existing Supabase Storage
      for (const item of photos) {
        const path = `${uploadId}/${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage.from('sell-photos').upload(path, item.file, {
          contentType: 'image/webp',
        });
        if (upErr) throw new Error(`Photo upload failed: ${upErr.message}`);
        paths.push(path);
      }

      // Format clean description
      const fullDesc = [
        `City: ${location.trim()}`,
        `Condition: ${condition}`,
        openToOffer ? 'Expected Price: Open to Selvi Motors evaluation' : '',
        description.trim() ? `Notes: ${description.trim()}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const res = await submitSellRequest({
        name: name.trim(),
        phone: phone.trim(),
        brand: brand.trim(),
        model: finalModel,
        year: Number(year),
        km: Math.round(finalKm),
        expectedPrice: finalPrice,
        description: fullDesc,
        photos: paths,
        uploadId,
      });

      if (!res.ok) throw new Error(res.error);

      setSubmittedData({
        name: name.trim(),
        brand: brand.trim(),
        model: finalModel,
        year: Number(year),
        km: Math.round(finalKm),
        expectedPrice: finalPrice,
        location: location.trim(),
        photosCount: photos.length,
      });

      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while submitting. Please try again or WhatsApp us.'
      );
    } finally {
      setBusy(false);
    }
  }

  const currentModelName = isTypingCustomModel ? customModel || 'Custom Model' : model;

  // ──────────────────────────────────────────────────────────
  // SUCCESS SCREEN
  // ──────────────────────────────────────────────────────────
  if (done && submittedData) {
    const waText = `Hi Selvi Motors, I just submitted my ${submittedData.brand} ${submittedData.model} (${submittedData.year}, ${submittedData.km.toLocaleString('en-IN')} KM) from ${submittedData.location} for evaluation. My name is ${submittedData.name}.`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER || '918124555343'}?text=${encodeURIComponent(waText)}`;

    return (
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 text-center shadow-xl sm:p-10">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-lg">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-primary shadow-lg shadow-primary/10 animate-in zoom-in-75 duration-300">
            <Check size={38} strokeWidth={3} />
          </div>

          <span className="inline-block rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            Request Received
          </span>

          <h2 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-tight text-dark sm:text-3xl">
            Thanks, {submittedData.name}.
          </h2>
          <p className="mt-2 text-sm text-slate">
            Our team will review your bike details and contact you shortly with a verified valuation.
          </p>

          {/* Submitted summary card */}
          <div className="mt-6 rounded-xl border border-line bg-cream p-4 text-left sm:p-5">
            <div className="flex items-center justify-between border-b border-line pb-2.5 text-xs">
              <span className="font-bold text-dark">Valuation Summary</span>
              <span className="text-primary font-semibold">{submittedData.location}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate/70">Motorcycle</span>
                <p className="font-bold text-dark text-sm mt-0.5">
                  {submittedData.brand} {submittedData.model}
                </p>
              </div>
              <div>
                <span className="text-slate/70">Registration Year</span>
                <p className="font-bold text-dark text-sm mt-0.5">{submittedData.year}</p>
              </div>
              <div>
                <span className="text-slate/70">KM Driven</span>
                <p className="font-bold text-dark text-sm mt-0.5">{formatKm(submittedData.km)}</p>
              </div>
              <div>
                <span className="text-slate/70">Expected Price</span>
                <p className="font-bold text-primary text-sm mt-0.5">
                  {submittedData.expectedPrice ? formatPrice(submittedData.expectedPrice) : 'Open to offer'}
                </p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#25D366]/20 transition-all hover:bg-[#20bd5a] active:scale-95"
            >
              <MessageSquare size={16} />
              WhatsApp Selvi Motors
            </a>
            <Link
              href="/buy"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-dark transition-all hover:bg-cream active:scale-95"
            >
              Browse Inventory
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setDone(false);
              changeStep(1);
              setPhotos([]);
              setName('');
              setPhone('');
            }}
            className="mt-6 text-xs text-slate hover:text-primary underline"
          >
            Submit another motorcycle valuation
          </button>
        </div>
      </div>
    );
  }

  // Step Content Renderer
  function renderStepContent(stepNum: number) {
    switch (stepNum) {
      case 1:
        return (
          <div className="space-y-3 sm:space-y-6">
            <div>
              <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-dark sm:text-3xl">
                What bike are you selling?
              </h2>
              <p className="mt-0.5 text-[11px] sm:text-sm text-slate">
                Select your motorcycle brand to get started with your free valuation.
              </p>
            </div>

            {/* Searchable Brand Selector */}
            <div className="relative max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/60" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brand (e.g. Royal Enfield, Yamaha)..."
                className="w-full rounded-xl border border-line bg-cream py-2 pl-8 pr-3 text-xs text-dark placeholder:text-slate/60 focus:border-primary focus:outline-none"
              />
              {brandSearch && (
                <button
                  type="button"
                  onClick={() => setBrandSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-dark"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Automotive Brand Cards */}
            <div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 max-h-[240px] sm:max-h-none overflow-y-auto pr-1">
                {filteredBrands.map((b) => {
                  const isSelected = brand.toLowerCase() === b.toLowerCase();
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleSelectBrand(b)}
                      className={`group relative flex flex-col items-center justify-center rounded-xl border p-2 sm:p-2.5 text-center transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-primary bg-primary text-white shadow-md'
                          : 'border-line bg-surface text-slate hover:border-primary/40 hover:bg-cream hover:text-primary'
                      }`}
                    >
                      <span className="font-display text-xs sm:text-sm font-bold tracking-wide truncate max-w-full">
                        {b}
                      </span>
                      {isSelected && (
                        <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-primary">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View All Brands toggle (when not actively searching) */}
              {!brandSearch && (
                <div className="mt-2.5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    {showAllBrands ? 'Show popular brands only' : `View all ${BIKE_BRANDS.length} brands`}
                    <ChevronDown
                      size={13}
                      className={`transition-transform ${showAllBrands ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Selected Brand Pill & Continue Button */}
            <div className="border-t border-line pt-3 sm:pt-5 flex items-center justify-between">
              <span className="text-xs text-slate">
                Selected: <strong className="text-dark">{brand}</strong>
              </span>
              <SpecularButton type="button" onClick={goNext} variant="white" size="sm">
                <span>Continue to Model</span>
                <ArrowRight size={15} />
              </SpecularButton>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3 sm:space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 border border-primary/30 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                  {brand}
                </span>
              </div>
              <h2 className="mt-1 font-display text-lg font-extrabold uppercase tracking-tight text-dark sm:text-3xl">
                Which model?
              </h2>
              <p className="mt-0.5 text-xs text-slate">
                Select your {brand} model from our catalog.
              </p>
            </div>

            {/* Search input & Custom toggle */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/60" />
                <input
                  type="text"
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  placeholder={`Search ${brand} model...`}
                  className="w-full rounded-xl border border-line bg-cream py-2 pl-8 pr-3 text-xs text-dark placeholder:text-slate/60 focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsTypingCustomModel(!isTypingCustomModel);
                  if (!isTypingCustomModel) setCustomModel('');
                }}
                className="text-xs font-bold text-primary hover:underline shrink-0"
              >
                {isTypingCustomModel ? 'From list' : '+ Custom model'}
              </button>
            </div>

            {/* Custom Model Input vs Popular Models List */}
            {isTypingCustomModel ? (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 max-w-md">
                <label className="block text-xs font-bold uppercase tracking-wider text-dark mb-1">
                  Enter Custom {brand} Model
                </label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder={`e.g. ${brand} Custom Edition`}
                  className="w-full rounded-xl border border-line bg-cream px-3 py-2 text-xs text-dark focus:border-primary focus:outline-none"
                  autoFocus
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 max-h-[220px] sm:max-h-72 overflow-y-auto pr-1">
                {filteredModels.map((m) => {
                  const isSelected = model === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectModel(m)}
                      className={`flex items-center justify-between rounded-xl border p-2 sm:p-2.5 text-left transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-primary bg-primary text-white shadow-md'
                          : 'border-line bg-surface text-slate hover:border-primary/40 hover:bg-cream hover:text-primary'
                      }`}
                    >
                      <span className="font-display text-xs font-bold leading-tight">{m}</span>
                      {isSelected && (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-primary ml-1">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="border-t border-line pt-3 sm:pt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-slate transition-all hover:bg-surface hover:text-dark active:scale-[0.98] shrink-0"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="btn-red inline-flex items-center gap-1.5 rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold uppercase tracking-wider shadow-md active:scale-[0.98]"
              >
                Continue to Year & KM
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 border border-primary/30 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-primary uppercase">
                  {brand} {currentModelName}
                </span>
              </div>
              <h2 className="mt-1 font-display text-xl font-extrabold uppercase tracking-tight text-dark sm:text-3xl">
                Tell us about your bike.
              </h2>
              <p className="text-xs text-slate">
                Registration year and distance covered.
              </p>
            </div>

            {/* Registration Year */}
            <div className="rounded-xl border border-line bg-cream p-3.5 sm:p-5">
              <label className="mb-2 block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-dark">
                Registration Year *
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2.5">
                {POPULAR_YEARS.map((y) => {
                  const isSel = year === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`w-full rounded-lg border py-1.5 sm:py-2 text-center text-xs font-bold transition-all active:scale-[0.98] ${
                        isSel
                          ? 'border-primary bg-primary text-white shadow-md'
                          : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}

                {/* Custom Older Year Dropdown Popover */}
                <div ref={olderYearRef} className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setIsOlderYearOpen(!isOlderYearOpen)}
                    className={`flex h-full w-full items-center justify-center gap-1 rounded-lg border py-1.5 sm:py-2 text-center text-xs font-bold transition-all active:scale-[0.98] ${
                      !POPULAR_YEARS.includes(year)
                        ? 'border-primary bg-primary text-white shadow-md'
                        : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    <span>{!POPULAR_YEARS.includes(year) ? year : 'Older'}</span>
                    <ChevronDown
                      size={11}
                      className={`text-slate transition-transform ${isOlderYearOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOlderYearOpen && (
                    <div className="absolute right-0 top-full z-50 mt-1.5 w-36 max-h-56 overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-2xl backdrop-blur-md">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate/70">
                        Select Year
                      </div>
                      {YEAR_OPTIONS.filter((y) => !POPULAR_YEARS.includes(y)).map((y) => {
                        const isCur = year === y;
                        return (
                          <button
                            key={y}
                            type="button"
                            onClick={() => {
                              setYear(y);
                              setIsOlderYearOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                              isCur
                                ? 'bg-primary text-white'
                                : 'text-slate hover:bg-cream hover:text-dark'
                            }`}
                          >
                            <span>{y}</span>
                            {isCur && <Check size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* KM Driven */}
            <div className="rounded-xl border border-line bg-cream p-3.5 sm:p-5">
              <label className="mb-2 block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-dark">
                Distance Covered (KM Driven) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5">
                {KM_PRESETS.map((p) => {
                  const isSel = Number(km) === p.value;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setKm(p.value)}
                      className={`rounded-lg border py-1.5 text-center text-[11px] sm:text-xs font-semibold transition-all active:scale-[0.98] ${
                        isSel
                          ? 'border-primary bg-primary text-white shadow-md'
                          : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative max-w-sm">
                <input
                  type="number"
                  min={0}
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  placeholder="Or enter exact KM (e.g. 12500)"
                  className="w-full rounded-lg border border-line bg-surface py-2.5 pl-3.5 pr-10 text-xs font-bold text-dark focus:border-primary focus:outline-none"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate">
                  KM
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-line pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-slate transition-all hover:bg-surface hover:text-dark active:scale-[0.98] shrink-0"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={goNext}
                className="btn-red inline-flex items-center gap-1.5 rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold uppercase tracking-wider shadow-md active:scale-[0.98]"
              >
                Continue to Valuation
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-dark sm:text-3xl">
                What&apos;s your bike worth?
              </h2>
              <p className="text-xs text-slate">
                Your expected price and general motorcycle condition.
              </p>
            </div>

            {/* Condition Cards */}
            <div>
              <label className="mb-2 block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-dark">
                Condition Assessment *
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                {CONDITIONS.map((c) => {
                  const isSel = condition === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCondition(c.value)}
                      className={`flex flex-col justify-between rounded-xl border p-2.5 sm:p-3 text-left transition-all active:scale-[0.98] ${
                        isSel
                          ? 'border-primary bg-primary/10 ring-2 ring-primary shadow-md'
                          : 'border-line bg-cream hover:border-primary/40 hover:bg-surface'
                      }`}
                    >
                      <div>
                        <span className="font-display text-xs sm:text-sm font-bold text-dark block">
                          {c.title}
                        </span>
                        <p className="mt-1 text-[11px] sm:text-xs text-slate leading-relaxed">{c.desc}</p>
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-slate">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            isSel
                              ? 'border-primary bg-primary text-white'
                              : 'border-line bg-surface'
                          }`}
                        >
                          {isSel && <Check size={10} strokeWidth={3} />}
                        </div>
                        <span>{isSel ? 'Selected' : 'Select'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expected Price */}
            <div className="rounded-xl border border-line bg-cream p-3.5 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-dark">
                  Expected Price (₹)
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openToOffer}
                    onChange={(e) => setOpenToOffer(e.target.checked)}
                    className="rounded border-line bg-surface accent-primary"
                  />
                  <span>Open to evaluation</span>
                </label>
              </div>

              {!openToOffer && (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2.5 mb-2.5">
                    {PRICE_PRESETS.map((p) => {
                      const isCur = Number(expectedPrice) === p.value;
                      return (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setExpectedPrice(p.value)}
                          className={`w-full rounded-lg border py-1.5 sm:py-2 px-1.5 text-center text-xs font-semibold transition-all active:scale-[0.98] ${
                            isCur
                              ? 'border-primary bg-primary text-white shadow-sm'
                              : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative max-w-sm">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-dark text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={expectedPrice}
                      onChange={(e) => setExpectedPrice(e.target.value)}
                      placeholder="e.g. 150000"
                      className="w-full rounded-lg border border-line bg-surface py-2.5 pl-8 pr-4 text-xs sm:text-sm font-bold text-dark focus:border-primary focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Optional Short Description */}
            <div>
              <label className="mb-1.5 block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-dark">
                Additional Highlights <span className="text-slate/70 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                placeholder="Service history, accessories, insurance validity, modifications, single owner…"
                className="w-full rounded-xl border border-line bg-cream p-3 text-xs text-dark placeholder:text-slate/60 focus:border-primary focus:outline-none"
              />
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-line pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-slate transition-all hover:bg-surface hover:text-dark active:scale-[0.98] shrink-0"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={goNext}
                className="btn-red inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold uppercase tracking-wider shadow-md active:scale-[0.98]"
              >
                Continue to Photos
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-dark sm:text-3xl">
                  Show us your bike.
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    photos.length >= MIN_FILES
                      ? 'bg-primary/15 text-primary'
                      : 'bg-brand/15 text-brand'
                  }`}
                >
                  {photos.length} / {MAX_FILES} Photos
                </span>
              </div>
              <p className="text-xs text-slate">
                Good photos help our evaluators give you the best market offer.
              </p>
            </div>

            {/* Photo Guide Badges */}
            <div className="rounded-xl border border-line bg-cream p-3">
              <div className="flex flex-wrap gap-1.5">
                {PHOTO_GUIDE_ITEMS.map((g) => (
                  <span
                    key={g.label}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-0.5 text-[11px] text-slate font-medium"
                  >
                    <Camera size={11} className="text-primary" />
                    <span>{g.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleAddFiles(e.dataTransfer.files);
                }}
                className="group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-cream px-4 py-6 sm:py-9 text-center transition-all hover:border-primary hover:bg-surface"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  {optimizing ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <ImagePlus size={20} />
                  )}
                </div>
                <div>
                  <p className="font-display text-xs sm:text-sm font-bold text-dark">
                    {optimizing
                      ? 'Optimizing photos...'
                      : 'Click to upload or drag & drop photos'}
                  </p>
                  <p className="text-[11px] text-slate">
                    JPG, PNG, WebP · Min 3 photos
                  </p>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                multiple
                hidden
                onChange={(e) => {
                  handleAddFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Uploaded Photos Grid */}
            {photos.length > 0 && (
              <div>
                <div className="mb-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-dark">
                    Uploaded Photos ({photos.length})
                  </span>
                  <span className="text-slate/70">First photo is cover image</span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {photos.map((p, i) => (
                    <div
                      key={p.previewUrl}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-cream shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.previewUrl}
                        alt={`Photo ${i + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {i === 0 ? (
                        <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                          Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => makeCover(i)}
                          className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 rounded-md bg-dark/80 px-2 py-0.5 text-[10px] font-medium text-white transition-opacity hover:bg-primary"
                        >
                          Make Cover
                        </button>
                      )}

                      <span className="absolute bottom-1.5 left-2 rounded bg-dark/80 px-1.5 py-0.5 text-[9px] font-medium text-white/90">
                        {formatFileSize(p.size)}
                      </span>

                      <button
                        type="button"
                        aria-label={`Remove photo ${i + 1}`}
                        onClick={() => removePhoto(i)}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-dark/80 text-white transition-colors hover:bg-red-600"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="border-t border-line pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-slate transition-all hover:bg-surface hover:text-dark active:scale-[0.98] shrink-0"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={goNext}
                className="btn-red inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold uppercase tracking-wider shadow-md active:scale-[0.98]"
              >
                Continue to Contact
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-dark sm:text-3xl">
                How can we reach you?
              </h2>
              <p className="text-xs text-slate">
                Our evaluators will inspect your details and share the best valuation.
              </p>
            </div>

            {/* Inputs Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-dark">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/60" />
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-line bg-cream py-2.5 pl-10 pr-4 text-xs text-dark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-dark">
                  Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate/70">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-line bg-cream py-2.5 pl-12 pr-4 text-xs text-dark focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-dark">
                  Your City / Location *
                </label>
                <div className="relative mb-1.5">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/60" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Chennai, Tamil Nadu"
                    className="w-full rounded-xl border border-line bg-cream py-2.5 pl-10 pr-4 text-xs text-dark focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Quick City Pills */}
                <div className="flex flex-wrap gap-1">
                  {QUICK_CITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setLocation(city)}
                      className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold transition-all active:scale-[0.98] ${
                        location === city
                          ? 'border-primary bg-primary text-white'
                          : 'border-line bg-surface text-slate hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy Guarantee */}
            <div className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3.5 py-2 text-[11px] text-slate">
              <ShieldCheck size={16} className="shrink-0 text-primary" />
              <span>
                Your details are confidential and used solely to contact you regarding your bike.
              </span>
            </div>

            {/* Submission Summary Card */}
            <div className="rounded-xl border border-line bg-cream p-3.5 sm:p-4">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="font-display text-[11px] font-bold uppercase tracking-wider text-primary">
                  Summary
                </span>
                <span className="text-[11px] text-slate/70">
                  {photos.length} photos
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate/70 uppercase text-[9px]">Bike</span>
                  <p className="font-bold text-dark text-xs mt-0.5 truncate">
                    {brand} {currentModelName}
                  </p>
                </div>
                <div>
                  <span className="text-slate/70 uppercase text-[9px]">Year & KM</span>
                  <p className="font-bold text-dark text-xs mt-0.5">
                    {year} • {formatKm(Number(km))}
                  </p>
                </div>
                <div>
                  <span className="text-slate/70 uppercase text-[9px]">Condition</span>
                  <p className="font-bold text-dark text-xs mt-0.5">{condition}</p>
                </div>
                <div>
                  <span className="text-slate/70 uppercase text-[9px]">Expected Price</span>
                  <p className="font-bold text-primary text-xs mt-0.5">
                    {openToOffer ? 'Open to offer' : expectedPrice ? formatPrice(Number(expectedPrice)) : 'Open to offer'}
                  </p>
                </div>
              </div>
            </div>

            {/* Final CTA Submit Button */}
            <div className="border-t border-line pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-slate transition-all hover:bg-surface hover:text-dark active:scale-[0.98] shrink-0"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={handleSubmit}
                className="btn-red inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs font-bold uppercase tracking-wider shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Get My Bike Valuation
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  const progressPercent = ((step / 6) * 100).toFixed(2);

  return (
    <div ref={formRef} className="relative overflow-hidden rounded-2xl border border-line bg-surface text-dark shadow-xl">
      {/* ────────────────────────────────────────────────────────── */}
      {/* STABLE HEADER: PROGRESS BAR & STEP INDICATOR               */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="border-b border-line bg-cream">
        {/* Animated thin green line */}
        <div className="h-1 w-full bg-line overflow-hidden">
          <div
            className="h-full bg-primary transition-[width] duration-[400ms] ease-out shadow-[0_0_12px_rgba(14,59,46,0.3)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-3.5 py-2 sm:px-8 sm:py-3.5">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">
            Step {step} of 6
          </span>

          {/* Step Category Badge */}
          <span className="text-[11px] sm:text-xs font-semibold text-slate">
            {step === 1 && 'Brand Selection'}
            {step === 2 && 'Model Selection'}
            {step === 3 && 'Year & KM'}
            {step === 4 && 'Price & Condition'}
            {step === 5 && 'Bike Photos'}
            {step === 6 && 'Contact & Valuation'}
          </span>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* STEP CONTAINER BODY (HEIGHT-ANIMATED & SMOOTH SLIDING)     */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        style={{
          height: containerHeight ? `${containerHeight}px` : 'auto',
        }}
        className="relative overflow-hidden transition-[height] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        <div className="relative w-full">
          {/* Exiting Step overlay during 400ms transition */}
          {exitingStep !== null && (
            <div
              key={`exit-${exitingStep}`}
              className={`absolute top-0 left-0 w-full pointer-events-none z-0 p-3.5 sm:p-8 ${
                direction > 0 ? 'step-exit-left' : 'step-exit-right'
              }`}
            >
              {renderStepContent(exitingStep)}
            </div>
          )}

          {/* Active / Entering Step */}
          <div
            key={`active-${step}`}
            ref={activeStepRef}
            className={`w-full z-10 p-3.5 sm:p-8 ${
              exitingStep !== null
                ? direction > 0
                  ? 'step-enter-right'
                  : 'step-enter-left'
                : ''
            }`}
          >
            {/* Error Alert */}
            {error && (
              <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-700 animate-in fade-in">
                <Info size={15} className="shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {renderStepContent(step)}
          </div>
        </div>
      </div>
    </div>
  );
}

