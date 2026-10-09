'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit3,
  ImagePlus,
  Info,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { submitSellRequest } from '@/app/actions';
import {
  BIKE_BRANDS,
  CURRENT_YEAR,
  INDIAN_BIKE_CATALOG,
} from '@/lib/bikeData';
import { optimizeImageList } from '@/lib/imageOptimizer';
import { formatKm, formatPrice, WHATSAPP_NUMBER } from '@/lib/utils';

const MAX_FILES = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic'];

// 4 Odometer range preset options
const RANGE_OPTIONS = [
  { label: '< 5,000', value: 3000, min: 0, max: 4999 },
  { label: '5,000 – 10,000', value: 8000, min: 5000, max: 10000 },
  { label: '10,000 – 20,000', value: 15000, min: 10001, max: 20000 },
  { label: '20,000+', value: 25000, min: 20001, max: 999999 },
];

// Primary 5 popular brands for progressive display
const POPULAR_BRANDS = [
  'Royal Enfield',
  'Yamaha',
  'KTM',
  'Honda',
  'TVS',
  'Bajaj',
];

const RECENT_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

const CONDITIONS = [
  {
    value: 'Excellent',
    title: 'Excellent Condition',
    desc: 'Like new, showroom condition, flawless engine & paint, zero mechanical issues.',
  },
  {
    value: 'Good',
    title: 'Good Condition',
    desc: 'Well maintained, normal usage wear, running smoothly without faults.',
  },
  {
    value: 'Fair',
    title: 'Fair Condition',
    desc: 'Minor cosmetic scratches or scheduled maintenance due.',
  },
];

const OWNER_OPTIONS = [
  { label: '1st Owner', value: '1st Owner' },
  { label: '2nd Owner', value: '2nd Owner' },
  { label: '3rd Owner', value: '3rd Owner' },
  { label: '4+ Owners', value: '4+ Owners' },
];

const SERVICE_HISTORY_OPTIONS = [
  { label: 'Brand Authorized Service', value: 'Brand Authorized Service' },
  { label: 'Regular Local Garage', value: 'Regular Local Garage' },
  { label: 'Mixed / Self Maintained', value: 'Mixed / Self Maintained' },
];

const RECOMMENDED_SLOTS = [
  { id: 'front', label: 'Front View', tip: 'Headlamp & wheel' },
  { id: 'rear', label: 'Rear View', tip: 'Tail lamp & plate' },
  { id: 'left', label: 'Left Side', tip: 'Chain & drive' },
  { id: 'right', label: 'Right Side', tip: 'Exhaust & engine' },
  { id: 'odometer', label: 'Odometer', tip: 'KM reading' },
];

const TOTAL_STEPS = 8;

interface SellPhoto {
  file: File;
  previewUrl: string;
  size: number;
  slot?: string;
}

interface SellFormProps {
  brands: string[];
  initialRegNumber?: string;
  onExit?: () => void;
}

export default function SellForm({
  brands: _brands,
  initialRegNumber = '',
  onExit,
}: SellFormProps) {
  // 8-step progressive journey:
  // 1: Brand | 2: Model | 3: Year | 4: Kilometres | 5: Condition & Price | 6: Photos | 7: Contact | 8: Review
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Form values
  const [regNumber, setRegNumber] = useState(initialRegNumber);

  // Step 1: Brand
  const [brand, setBrand] = useState('Royal Enfield');
  const [brandSearch, setBrandSearch] = useState('');
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Step 2: Model
  const [model, setModel] = useState('Hunter 350');
  const [modelSearch, setModelSearch] = useState('');
  const [showAllModels, setShowAllModels] = useState(false);
  const [customModel, setCustomModel] = useState('');
  const [isTypingCustomModel, setIsTypingCustomModel] = useState(false);

  // Step 3: Year
  const [year, setYear] = useState<number>(2023);
  const [isOlderYearSelect, setIsOlderYearSelect] = useState(false);

  // Step 4: Kilometres
  const [km, setKm] = useState<number | string>(0);

  // Step 5: Condition & Price
  const [condition, setCondition] = useState('Excellent');
  const [owners, setOwners] = useState('1st Owner');
  const [serviceHistory, setServiceHistory] = useState('Brand Authorized Service');
  const [expectedPrice, setExpectedPrice] = useState<number | string>(150000);
  const [openToOffer, setOpenToOffer] = useState(false);
  const [notes, setNotes] = useState('');

  // Step 6: Photos
  const [photos, setPhotos] = useState<SellPhoto[]>([]);
  const [activeSlotUpload, setActiveSlotUpload] = useState<string | null>(null);

  // Step 7: Contact
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sameWhatsapp, setSameWhatsapp] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [pincode, setPincode] = useState('');

  // Async & UI states
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
    pincode: string;
    photosCount: number;
    regNumber?: string;
  } | null>(null);

  const formCardRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Sync initialRegNumber
  useEffect(() => {
    if (initialRegNumber) {
      setRegNumber(initialRegNumber);
    }
  }, [initialRegNumber]);

  // Filtered brands list
  const filteredBrands = useMemo(() => {
    if (brandSearch.trim()) {
      const q = brandSearch.toLowerCase();
      return BIKE_BRANDS.filter((b) => b.toLowerCase().includes(q));
    }
    return showAllBrands ? BIKE_BRANDS : POPULAR_BRANDS;
  }, [brandSearch, showAllBrands]);

  // Available models for selected brand
  const allBrandModels = useMemo(() => {
    return INDIAN_BIKE_CATALOG[brand] || ['Other Model'];
  }, [brand]);

  const filteredModels = useMemo(() => {
    if (modelSearch.trim()) {
      const q = modelSearch.toLowerCase();
      return allBrandModels.filter((m) => m.toLowerCase().includes(q));
    }
    return showAllModels ? allBrandModels : allBrandModels.slice(0, 6);
  }, [allBrandModels, modelSearch, showAllModels]);

  // Smooth step transition handler
  function changeStep(nextStep: number, dir?: number) {
    if (nextStep === step || nextStep < 1 || nextStep > TOTAL_STEPS) return;
    const newDir = dir ?? (nextStep > step ? 1 : -1);
    setDirection(newDir);
    setIsTransitioning(true);
    setError('');

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

    setStep(nextStep);

    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  }

  // Scroll smoothly when changing step
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (formCardRef.current) {
      const rect = formCardRef.current.getBoundingClientRect();
      if (rect.top < -20) {
        const y = window.pageYOffset + rect.top - 20;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  }, [step]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [photos]);

  // Brand selection handler
  function handleSelectBrand(newBrand: string) {
    setBrand(newBrand);
    setIsTypingCustomModel(false);
    setCustomModel('');
    setModelSearch('');
    setShowAllModels(false);
    const models = INDIAN_BIKE_CATALOG[newBrand] || ['Other Model'];
    setModel(models[0] || 'Other Model');
    setError('');
  }

  // Photo handlers
  async function handleAddFiles(list: FileList | null, slotId?: string) {
    if (!list || list.length === 0) return;
    setError('');
    setOptimizing(true);

    const slotsAvailable = MAX_FILES - photos.length;
    if (slotsAvailable <= 0) {
      setError(`Maximum ${MAX_FILES} photos allowed.`);
      setOptimizing(false);
      return;
    }

    const filesToConvert = Array.from(list).slice(0, slotsAvailable);

    try {
      const results = await optimizeImageList(filesToConvert, 1600, 1200, 0.82);
      const newItems: SellPhoto[] = results.map((r, i) => ({
        file: r.file,
        previewUrl: URL.createObjectURL(r.file),
        size: r.optimizedSize,
        slot: i === 0 && slotId ? slotId : undefined,
      }));

      setPhotos((prev) => [...prev, ...newItems]);
    } catch {
      setError('Could not optimize some photos. Please try another image.');
    } finally {
      setOptimizing(false);
      setActiveSlotUpload(null);
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  // Step validation
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
    }

    if (targetStep === 4) {
      const kmNum = Number(km);
      if (isNaN(kmNum) || kmNum < 0 || km === '') {
        setError('Please enter the total kilometres driven.');
        return false;
      }
    }

    if (targetStep === 5) {
      if (!condition) {
        setError('Please select the overall condition of your bike.');
        return false;
      }
      if (!owners) {
        setError('Please select the number of owners.');
        return false;
      }
      if (!serviceHistory) {
        setError('Please select the service history.');
        return false;
      }
      if (!openToOffer) {
        const p = Number(expectedPrice);
        if (!expectedPrice || isNaN(p) || p <= 0) {
          setError('Please enter your expected selling price or select open to valuation.');
          return false;
        }
      }
    }

    if (targetStep === 6) {
      if (photos.length === 0) {
        setError('Please upload at least 1 photo of your motorcycle to proceed.');
        return false;
      }
    }

    if (targetStep === 7) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return false;
      }
      const cleanPhone = phone.trim().replace(/[\s-]/g, '');
      if (!/^[+\d][\d]{7,14}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit mobile number.');
        return false;
      }
      if (!sameWhatsapp && whatsappNumber.trim()) {
        const cleanWa = whatsappNumber.trim().replace(/[\s-]/g, '');
        if (!/^[+\d][\d]{7,14}$/.test(cleanWa)) {
          setError('Please enter a valid WhatsApp number or keep same as mobile.');
          return false;
        }
      }
      if (!sameWhatsapp && !whatsappNumber.trim()) {
        setError('Please enter your WhatsApp number.');
        return false;
      }
      const cleanPin = pincode.trim();
      if (!cleanPin || !/^\d{6}$/.test(cleanPin)) {
        setError('Please enter a valid 6-digit Pincode (e.g. 600001).');
        return false;
      }
      if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
        setError('Please enter a valid email address.');
        return false;
      }
    }

    return true;
  }

  function goNext() {
    if (validateStep(step)) {
      if (step < TOTAL_STEPS) {
        changeStep(step + 1, 1);
      }
    }
  }

  function goBack() {
    setError('');
    if (step > 1) {
      changeStep(step - 1, -1);
    } else if (onExit) {
      onExit();
    }
  }

  // Final submission to Supabase
  async function handleSubmit() {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5) || !validateStep(6) || !validateStep(7)) {
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

      // Upload photos to Supabase Storage if present
      for (const item of photos) {
        const path = `${uploadId}/${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage.from('sell-photos').upload(path, item.file, {
          contentType: 'image/webp',
        });
        if (upErr) throw new Error(`Photo upload failed: ${upErr.message}`);
        paths.push(path);
      }

      // Format descriptive summary
      const descParts = [
        regNumber.trim() ? `Reg Number: ${regNumber.trim()}` : '',
        `Pincode: ${pincode.trim()}`,
        `Condition: ${condition}`,
        `Owners: ${owners}`,
        `Service: ${serviceHistory}`,
        !sameWhatsapp && whatsappNumber.trim() ? `WhatsApp: ${whatsappNumber.trim()}` : '',
        email.trim() ? `Email: ${email.trim()}` : '',
        openToOffer ? 'Expected Price: Open to Selvi Motors evaluation' : '',
        notes.trim() ? `Notes: ${notes.trim()}` : '',
      ].filter(Boolean);

      const res = await submitSellRequest({
        name: name.trim(),
        phone: phone.trim(),
        brand: brand.trim(),
        model: finalModel,
        year: Number(year),
        km: Math.round(finalKm),
        expectedPrice: finalPrice,
        description: descParts.join(' | '),
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
        pincode: pincode.trim(),
        photosCount: photos.length,
        regNumber: regNumber.trim() || undefined,
      });

      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while submitting. Please try again or reach out on WhatsApp.'
      );
    } finally {
      setBusy(false);
    }
  }

  const currentModelName = isTypingCustomModel ? customModel || 'Custom Model' : model;

  // ──────────────────────────────────────────────────────────
  // SUCCESS / CONFIRMATION RECEIPT
  // ──────────────────────────────────────────────────────────
  if (done && submittedData) {
    const waText = `Hi Selvi Motors, I just requested a valuation for my ${submittedData.brand} ${submittedData.model} (${submittedData.year}, ${submittedData.km.toLocaleString('en-IN')} KM)${submittedData.regNumber ? ` [${submittedData.regNumber}]` : ''} from Pincode ${submittedData.pincode}. My name is ${submittedData.name}.`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER || '918124555343'}?text=${encodeURIComponent(waText)}`;

    return (
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface p-6 sm:p-10 shadow-2xl text-center">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-lg">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-primary shadow-xl shadow-primary/10 animate-in zoom-in-75 duration-300">
            <Check size={40} strokeWidth={3} />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            VALUATION REQUEST RECEIVED
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-text-strong">
            Thanks, {submittedData.name}.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-text/80 leading-relaxed font-medium">
            Our Selvi Motors team will review your bike details and contact you shortly with a verified valuation.
          </p>

          {/* 3 Reassurance bullets */}
          <div className="mt-5 inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-text-strong bg-background/80 border border-border/80 rounded-xl py-2.5 px-4">
            <span className="inline-flex items-center gap-1 text-primary">
              <CheckCircle2 size={14} /> Request received
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="inline-flex items-center gap-1 text-primary">
              <CheckCircle2 size={14} /> Details securely submitted
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="inline-flex items-center gap-1 text-primary">
              <CheckCircle2 size={14} /> Our team will contact you
            </span>
          </div>

          {/* Summary receipt card */}
          <div className="mt-6 rounded-2xl border border-border/90 bg-background p-4 sm:p-5 text-left shadow-sm">
            <div className="flex items-center justify-between border-b border-border/80 pb-2.5 text-xs">
              <span className="font-display font-bold uppercase tracking-wide text-text-strong">
                Valuation Summary
              </span>
              <span className="font-bold text-primary">PIN: {submittedData.pincode}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-text/60 font-medium">Motorcycle</span>
                <p className="font-display font-bold text-text-strong text-sm mt-0.5">
                  {submittedData.brand} {submittedData.model}
                </p>
                {submittedData.regNumber && (
                  <span className="inline-block mt-0.5 font-mono text-[10px] font-bold bg-surface px-1.5 py-0.5 rounded border border-border text-text-strong">
                    {submittedData.regNumber}
                  </span>
                )}
              </div>
              <div>
                <span className="text-text/60 font-medium">Registration Year</span>
                <p className="font-display font-bold text-text-strong text-sm mt-0.5">
                  {submittedData.year}
                </p>
              </div>
              <div>
                <span className="text-text/60 font-medium">KM Driven</span>
                <p className="font-display font-bold text-text-strong text-sm mt-0.5">
                  {formatKm(submittedData.km)}
                </p>
              </div>
              <div>
                <span className="text-text/60 font-medium">Expected Price</span>
                <p className="font-display font-bold text-primary text-sm mt-0.5">
                  {submittedData.expectedPrice ? formatPrice(submittedData.expectedPrice) : 'Open to evaluation'}
                </p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#25D366]/20 transition-all hover:bg-[#20bd5a] active:scale-95"
            >
              <MessageSquare size={16} />
              Chat on WhatsApp
            </a>
            <Link
              href="/buy"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-text-strong transition-all hover:bg-background active:scale-95"
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
              setRegNumber('');
              setKm(0);
              setNotes('');
            }}
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-text/70 hover:text-primary transition-colors underline"
          >
            <RotateCcw size={13} />
            Submit another motorcycle valuation
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // STEP 4: CINEMATIC MOTORCYCLE ODOMETER VIEW (1:1 Reference Match)
  // ──────────────────────────────────────────────────────────
  if (step === 4) {
    const kmNumber = typeof km === 'number' ? km : Number(km) || 0;
    const kmString = String(Math.max(0, Math.min(999999, Math.round(kmNumber))))
      .padStart(6, '0')
      .slice(-6);
    const kmDigits = kmString.split('');
    const firstNonZero = kmDigits.findIndex((d) => d !== '0');
    const activeHighlightIndex = firstNonZero === -1 ? 5 : firstNonZero;

    const activeRangeIndex = RANGE_OPTIONS.findIndex(
      (r) => kmNumber >= r.min && kmNumber <= r.max
    );

    const handleStepUp = () => {
      const current = typeof km === 'number' ? km : Number(km) || 0;
      setKm(Math.min(999999, current + 1000));
    };

    const handleStepDown = () => {
      const current = typeof km === 'number' ? km : Number(km) || 0;
      setKm(Math.max(0, current - 1000));
    };

    return (
      <div className="space-y-2 sm:space-y-4 overflow-x-clip" ref={formCardRef}>
        {/* ── Main Form Container for Step 4 ── */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#1e2e28] bg-[#07130F] shadow-2xl text-white">
          {/* Subtle top rim beam in mint */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8FE3C1]/10 via-[#8FE3C1]/40 to-[#8FE3C1]/10 z-20" />

          <div className="relative min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] flex flex-col lg:flex-row items-stretch justify-between">
            {/* RIGHT MOTORCYCLE INSTRUMENT CLUSTER (Group 2 - Animate Right) */}
            <div className="lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[45%] w-full h-48 sm:h-64 lg:h-full pointer-events-none overflow-hidden animate-hero-right z-0">
              <div className="relative w-full h-full">
                <img
                  src="/images/sell/odometer-cockpit.jpg"
                  alt="Motorcycle Cockpit Instrument Cluster"
                  className="w-full h-full object-cover object-center lg:object-left-center"
                />
                {/* Seamless dark vignette gradient blending into left content */}
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#07130F] via-[#07130F]/40 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#07130F_90%)] opacity-50" />
              </div>
            </div>

            {/* LEFT INTERACTIVE CONTENT GROUP (Group 1 - Animate Left) */}
            <div className="relative z-10 w-full lg:w-[58%] p-4 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4 sm:space-y-6 animate-hero-left">
              {/* TOP LEFT: STEP 4 OF 5 & THIN PROGRESS BAR */}
              <div>
                <div className="font-display font-extrabold uppercase tracking-widest text-[11px] sm:text-xs text-[#AEB8B3]">
                  STEP 4 OF 5
                </div>
                <div className="mt-1.5 h-1 w-32 sm:w-44 overflow-hidden rounded-full bg-[#182621]">
                  <div className="h-full rounded-full bg-[#8FE3C1]" style={{ width: '65%' }} />
                </div>
              </div>

              {/* MAIN EDITORIAL HEADLINE */}
              <div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-[1.08]">
                  HOW FAR HAS IT<br />
                  <span className="text-[#8FE3C1]">TRAVELLED?</span>
                </h2>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#AEB8B3] font-medium leading-relaxed">
                  Enter the current odometer reading of your bike.
                </p>
              </div>

              {/* MECHANICAL 6-DIGIT ODOMETER HOUSING */}
              <div className="relative inline-flex max-w-full items-center justify-between gap-2 sm:gap-3 rounded-2xl border border-[#3e4644]/80 bg-gradient-to-b from-[#242b28] via-[#151b19] to-[#0d1210] p-2 sm:p-3 shadow-[0_12px_28px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)]">
                {/* 6 Mechanical Digit Windows */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {kmDigits.map((digit, idx) => {
                    const isHighlighted = idx >= activeHighlightIndex;
                    const isKeyLead = idx === activeHighlightIndex;
                    return (
                      <div
                        key={idx}
                        className={`relative flex h-11 w-8 sm:h-14 sm:w-11 md:h-16 md:w-12 items-center justify-center overflow-hidden rounded-lg border bg-gradient-to-b from-[#0a0f0d] via-[#1a221f] to-[#0a0f0d] shadow-[inset_0_3px_6px_rgba(0,0,0,0.9),inset_0_-3px_6px_rgba(0,0,0,0.9)] select-none transition-colors ${
                          isKeyLead
                            ? 'border-[#C8A878]/70 shadow-[0_0_12px_rgba(200,168,120,0.25),inset_0_3px_6px_rgba(0,0,0,0.9)]'
                            : 'border-[#2e3734]'
                        }`}
                      >
                        {/* Mechanical tumbler horizontal seam line */}
                        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-black/60 shadow-[0_1px_1px_rgba(255,255,255,0.08)]" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-b from-black/60 to-transparent" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Digit Character */}
                        <span
                          className={`relative z-10 font-mono text-xl sm:text-2xl md:text-3xl font-black tracking-tight ${
                            isKeyLead
                              ? 'text-[#F7E5C8] drop-shadow-[0_0_8px_rgba(247,229,200,0.4)]'
                              : isHighlighted
                              ? 'text-[#F7F2E8]'
                              : 'text-[#4e5854]'
                          }`}
                        >
                          {digit}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* KM Label */}
                <div className="px-1 sm:px-2 font-display text-sm sm:text-base md:text-lg font-black tracking-widest text-[#AEB8B3] select-none">
                  KM
                </div>

                {/* Stepper Buttons (Increment / Decrement by 1,000) */}
                <div className="flex flex-col items-center justify-center rounded-lg border border-[#2e3734] bg-[#0c1210] p-0.5 sm:p-1 gap-0.5 z-20">
                  <button
                    type="button"
                    onClick={handleStepUp}
                    aria-label="Increase by 1,000 KM"
                    className="flex h-5 w-6 sm:h-6 sm:w-7 items-center justify-center rounded text-[#AEB8B3] hover:text-white hover:bg-white/10 transition-all active:scale-90"
                  >
                    <ChevronUp size={16} strokeWidth={2.5} />
                  </button>
                  <div className="h-[1px] w-full bg-[#2e3734]" />
                  <button
                    type="button"
                    onClick={handleStepDown}
                    aria-label="Decrease by 1,000 KM"
                    className="flex h-5 w-6 sm:h-6 sm:w-7 items-center justify-center rounded text-[#AEB8B3] hover:text-white hover:bg-white/10 transition-all active:scale-90"
                  >
                    <ChevronDown size={16} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Hidden accessible number input for typing exact value */}
                <input
                  type="number"
                  value={km === '' ? '' : km}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setKm('');
                    } else {
                      const num = Number(val);
                      if (!isNaN(num) && num >= 0 && num <= 999999) {
                        setKm(num);
                      }
                    }
                  }}
                  className="absolute inset-0 z-10 h-full w-full opacity-0 cursor-pointer"
                  title="Click to enter exact kilometres"
                />
              </div>

              {/* MANUAL EXACT INPUT FIELD */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#273530] bg-[#0c1512]/90 px-3.5 py-2.5 shadow-inner focus-within:border-[#8FE3C1] focus-within:ring-1 focus-within:ring-[#8FE3C1]/30 transition-all">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#AEB8B3] shrink-0">
                    Exact KM:
                  </span>
                  <input
                    type="number"
                    value={km === '' ? '' : km}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setKm('');
                      } else {
                        const num = Number(val);
                        if (!isNaN(num) && num >= 0 && num <= 999999) {
                          setKm(num);
                        }
                      }
                    }}
                    placeholder="Type reading (e.g. 8000)"
                    className="w-full bg-transparent font-mono text-sm sm:text-base font-extrabold text-white placeholder:text-[#AEB8B3]/35 focus:outline-none"
                  />
                </div>
                <span className="font-display font-black text-xs text-[#8FE3C1] shrink-0">
                  KM
                </span>
              </div>

              {/* 4 RANGE PRESET BUTTONS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RANGE_OPTIONS.map((opt, idx) => {
                  const isSelected = activeRangeIndex === idx;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setKm(opt.value)}
                      className={`rounded-xl border px-3 py-2 text-center text-xs font-bold transition-all active:scale-95 ${
                        isSelected
                          ? 'border-[#8FE3C1]/50 bg-[#0E3B2E] text-white ring-1 ring-[#8FE3C1]/30 shadow-sm'
                          : 'border-[#273530] bg-[#0c1512]/60 text-[#AEB8B3] hover:border-[#3d504a] hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* HELP NOTE */}
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#AEB8B3]">
                <Info size={13} className="text-[#8FE3C1] shrink-0" />
                <span>You can enter the exact reading or choose a range above.</span>
              </div>

              {/* ERROR BANNER */}
              {error && (
                <div className="rounded-xl border border-selvi-red/30 bg-selvi-red/10 p-2.5 text-xs font-bold text-selvi-red flex items-center gap-2">
                  <X size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* BOTTOM BUTTONS (← Back & Continue →) */}
              <div className="pt-2 sm:pt-4 border-t border-[#1e2e28] flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-gray-100 border border-border text-[#111816] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E3B2E] hover:bg-[#134d3d] border border-[#8FE3C1]/30 text-white px-7 sm:px-9 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-black/40 transition-all active:scale-95"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Understated Reassurance Beneath Form */}
        <div className="text-center pt-1 sm:pt-2">
          <p className="text-[11px] sm:text-xs font-medium text-text/60">
            Free valuation • No obligation • Your details are secure
          </p>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // MAIN PROGRESSIVE DISCLOSURE FORM (One Decision Per Screen)
  // ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-2 sm:space-y-4" ref={formCardRef}>
      {/* ── Main Form Container ── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-surface p-3.5 sm:p-9 md:p-11 shadow-2xl text-text-strong">
        {/* Subtle top rim beam */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10" />

        {/* ── Understated Progress Header (STEP X OF 8) ── */}
        <div className="mb-2 sm:mb-8 pb-1.5 sm:pb-3 border-b border-border/60 flex items-center justify-between">
          <span className="font-display font-extrabold uppercase tracking-widest text-[10px] sm:text-xs text-primary">
            STEP {step} OF {TOTAL_STEPS}
          </span>

          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-text/60">
            <Lock size={11} className="text-primary" />
            <span>Secure Valuation</span>
          </div>
        </div>

        {/* Thin Understated Progress Line */}
        <div className="-mt-1.5 sm:-mt-3 mb-3 sm:mb-8 h-1 w-full overflow-hidden rounded-full bg-border/50">
          <div
            className="h-full rounded-full bg-primary transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* ── Step Content with Smooth Editorial Transitions ── */}
        <div
          ref={stepContentRef}
          className={`min-h-[260px] sm:min-h-[360px] flex flex-col justify-between transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isTransitioning
              ? direction > 0
                ? 'opacity-0 translate-x-4'
                : 'opacity-0 -translate-x-4'
              : 'opacity-100 translate-x-0'
          }`}
        >
          {/* ═════════════════════════════════════════════════════════
              STEP 1: BIKE BRAND
          ═════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-2.5 sm:space-y-6">
              <div className="text-left">
                <h2 className="font-display text-lg sm:text-3xl font-extrabold uppercase tracking-tight text-text-strong leading-tight">
                  TELL US ABOUT YOUR BIKE
                </h2>
                <p className="mt-0.5 sm:mt-1.5 text-[11px] sm:text-sm text-text/75 font-medium leading-snug sm:leading-relaxed">
                  We&apos;ll use these details to prepare a fair, verified valuation.
                </p>
              </div>

              {/* Search brand input */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/45" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Search brand (e.g. Royal Enfield, Yamaha)..."
                  className="w-full rounded-xl border border-border bg-background py-2 sm:py-3 pl-9 pr-3 text-xs sm:text-sm text-text-strong placeholder:text-text/40 focus:border-primary focus:outline-none font-medium transition-colors"
                />
                {brandSearch && (
                  <button
                    type="button"
                    onClick={() => setBrandSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text/40 hover:text-text-strong"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Curated Brand Selection Grid on Mobile, List on Desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 sm:gap-2">
                {filteredBrands.map((b) => {
                  const isSelected = brand.toLowerCase() === b.toLowerCase();
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleSelectBrand(b)}
                      className={`w-full flex items-center justify-between rounded-xl sm:rounded-2xl border px-3 sm:px-5 py-2 sm:py-3.5 text-left transition-all active:scale-[0.99] ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1.5 ring-primary shadow-sm text-primary'
                          : 'border-border/80 bg-surface text-text-strong hover:border-primary/40 hover:bg-background'
                      }`}
                    >
                      <span className="font-display text-xs sm:text-base font-bold tracking-tight truncate">
                        {b}
                      </span>
                      {isSelected ? (
                        <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <ChevronRight size={14} className="text-text/30 shrink-0 hidden sm:block" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View all brands toggle */}
              {!brandSearch && (
                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    className="text-[11px] sm:text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>{showAllBrands ? 'Show popular brands only' : `Other brands (${BIKE_BRANDS.length - POPULAR_BRANDS.length} more)`}</span>
                    <ChevronDown size={12} className={showAllBrands ? 'rotate-180 transition-transform' : ''} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 2: BIKE MODEL
          ═════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-2.5 sm:space-y-6">
              <div className="text-left">
                <div className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/25 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-primary uppercase mb-1">
                  {brand}
                </div>
                <h2 className="font-display text-lg sm:text-3xl font-extrabold uppercase tracking-tight text-text-strong leading-tight">
                  WHICH MODEL DO YOU RIDE?
                </h2>
                <p className="mt-0.5 sm:mt-1.5 text-[11px] sm:text-sm text-text/75 font-medium leading-snug sm:leading-relaxed">
                  Select your {brand} model from our verified catalog.
                </p>
              </div>

              {/* Search input & Custom model toggle */}
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/45" />
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    placeholder={`Search ${brand} model...`}
                    className="w-full rounded-xl border border-border bg-background py-2 sm:py-3 pl-9 pr-3 text-xs sm:text-sm text-text-strong placeholder:text-text/40 focus:border-primary focus:outline-none font-medium transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsTypingCustomModel(!isTypingCustomModel);
                    if (!isTypingCustomModel) setCustomModel('');
                  }}
                  className="text-[11px] sm:text-xs font-bold text-primary hover:underline shrink-0"
                >
                  {isTypingCustomModel ? 'From catalog' : '+ Custom edition'}
                </button>
              </div>

              {/* Custom Model Input vs Selection List */}
              {isTypingCustomModel ? (
                <div className="rounded-xl sm:rounded-2xl border border-primary/30 bg-primary/5 p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                  <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-text-strong">
                    Enter Exact {brand} Model Name
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder={`e.g. ${brand} Scrambler Special Edition`}
                    className="w-full rounded-xl border border-border bg-surface px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text-strong focus:border-primary focus:outline-none font-medium"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 sm:gap-2">
                  {filteredModels.map((m) => {
                    const isSelected = model === m && !isTypingCustomModel;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setModel(m);
                          setIsTypingCustomModel(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl sm:rounded-2xl border px-3 sm:px-5 py-2 sm:py-3.5 text-left transition-all active:scale-[0.99] ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1.5 ring-primary shadow-sm text-primary'
                            : 'border-border/80 bg-surface text-text-strong hover:border-primary/40 hover:bg-background'
                        }`}
                      >
                        <span className="font-display text-xs sm:text-base font-bold tracking-tight truncate">
                          {m}
                        </span>
                        {isSelected ? (
                          <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <ChevronRight size={14} className="text-text/30 shrink-0 hidden sm:block" />
                        )}
                      </button>
                    );
                  })}

                  {!modelSearch && allBrandModels.length > 6 && (
                    <div className="col-span-2 sm:col-span-1 text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAllModels(!showAllModels)}
                        className="text-[11px] sm:text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <span>{showAllModels ? 'Show fewer models' : `View all ${allBrandModels.length} models`}</span>
                        <ChevronDown size={12} className={showAllModels ? 'rotate-180 transition-transform' : ''} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 3: REGISTRATION YEAR
          ═════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-2.5 sm:space-y-6">
              <div className="text-left">
                <h2 className="font-display text-lg sm:text-3xl font-extrabold uppercase tracking-tight text-text-strong leading-tight">
                  WHEN WAS YOUR BIKE REGISTERED?
                </h2>
                <p className="mt-0.5 sm:mt-1.5 text-[11px] sm:text-sm text-text/75 font-medium leading-snug sm:leading-relaxed">
                  Select the registration year as recorded in your RC book.
                </p>
              </div>

              {/* Clean selection grid for recent years */}
              <div className="grid grid-cols-3 sm:grid-cols-1 gap-1.5 sm:gap-2">
                {RECENT_YEARS.map((y) => {
                  const isSelected = year === y && !isOlderYearSelect;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setYear(y);
                        setIsOlderYearSelect(false);
                      }}
                      className={`w-full flex items-center justify-center sm:justify-between rounded-xl sm:rounded-2xl border px-2.5 sm:px-5 py-2 sm:py-3.5 text-center sm:text-left transition-all active:scale-[0.99] ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-1.5 ring-primary shadow-sm text-primary'
                          : 'border-border/80 bg-surface text-text-strong hover:border-primary/40 hover:bg-background'
                      }`}
                    >
                      <span className="font-display text-xs sm:text-lg font-bold tracking-tight">
                        {y}
                      </span>
                      {isSelected ? (
                        <div className="hidden sm:flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <ChevronRight size={16} className="text-text/30 hidden sm:block" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Clean Earlier Years Dropdown Selector */}
              <div className="pt-1.5 sm:pt-2 border-t border-border/60">
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text/70 mb-1 sm:mb-2">
                  Or Earlier Registration Year (1995 – 2019)
                </label>
                <select
                  value={!RECENT_YEARS.includes(year) ? year : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setYear(Number(e.target.value));
                      setIsOlderYearSelect(true);
                    }
                  }}
                  className="w-full rounded-xl border border-border bg-background px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-text-strong focus:border-primary focus:outline-none"
                >
                  <option value="">Select earlier year...</option>
                  {Array.from({ length: 25 }, (_, i) => 2019 - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}


          {/* ═════════════════════════════════════════════════════════
              STEP 5: BIKE CONDITION & PRICING
          ═════════════════════════════════════════════════════════ */}
          {step === 5 && (
            <div className="space-y-3 sm:space-y-6">
              <div className="text-left">
                <h2 className="font-display text-lg sm:text-3xl font-extrabold uppercase tracking-tight text-text-strong leading-tight">
                  TELL US ABOUT ITS CONDITION
                </h2>
                <p className="mt-0.5 sm:mt-1.5 text-[11px] sm:text-sm text-text/75 font-medium leading-snug sm:leading-relaxed">
                  This helps us provide an accurate market estimate.
                </p>
              </div>

              {/* Condition Cards */}
              <div className="space-y-1.5 sm:space-y-2.5">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong">
                  Overall Condition
                </label>
                <div className="space-y-1.5 sm:space-y-2">
                  {CONDITIONS.map((c) => {
                    const isSelected = condition === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCondition(c.value)}
                        className={`w-full flex items-center justify-between rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 text-left transition-all active:scale-[0.99] ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1.5 ring-primary shadow-sm'
                            : 'border-border/80 bg-surface text-text-strong hover:border-primary/40 hover:bg-background'
                        }`}
                      >
                        <div>
                          <span
                            className={`font-display text-xs sm:text-base font-bold uppercase tracking-tight ${
                              isSelected ? 'text-primary' : 'text-text-strong'
                            }`}
                          >
                            {c.title}
                          </span>
                          <p className="mt-0.5 text-[10px] sm:text-xs text-text/75 font-medium line-clamp-1 sm:line-clamp-none">
                            {c.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="ml-2 flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ownership & Service History */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-1.5 sm:pt-2 border-t border-border/60">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong">
                    Owners
                  </label>
                  <select
                    value={owners}
                    onChange={(e) => setOwners(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-2.5 sm:px-3.5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-text-strong focus:border-primary focus:outline-none"
                  >
                    {OWNER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong">
                    Service History
                  </label>
                  <select
                    value={serviceHistory}
                    onChange={(e) => setServiceHistory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-2.5 sm:px-3.5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-text-strong focus:border-primary focus:outline-none"
                  >
                    {SERVICE_HISTORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expected Price */}
              <div className="space-y-1.5 sm:space-y-2 pt-1.5 sm:pt-2 border-t border-border/60">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong">
                  Expected Selling Price *
                </label>
                {!openToOffer && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-text/60">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={expectedPrice}
                      onChange={(e) =>
                        setExpectedPrice(e.target.value ? Number(e.target.value) : '')
                      }
                      placeholder="Enter expected amount..."
                      className="w-full rounded-xl border border-border bg-background py-2 sm:py-3 pl-7 pr-3 text-xs sm:text-sm text-text-strong placeholder:text-text/40 focus:border-primary focus:outline-none font-medium"
                    />
                  </div>
                )}

                <label className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-text-strong cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={openToOffer}
                    onChange={(e) => setOpenToOffer(e.target.checked)}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                  />
                  <span>Open to Selvi Motors expert market evaluation</span>
                </label>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 6: PHOTOS
          ═════════════════════════════════════════════════════════ */}
          {step === 6 && (
            <div className="space-y-3 sm:space-y-6">
              <div className="text-left">
                <h2 className="font-display text-lg sm:text-3xl font-extrabold uppercase tracking-tight text-text-strong leading-tight">
                  ADD PHOTOS OF YOUR BIKE *
                </h2>
                <p className="mt-0.5 sm:mt-1.5 text-[11px] sm:text-sm text-text/75 font-medium leading-snug sm:leading-relaxed">
                  Clear photos are required to evaluate your motorcycle accurately.
                </p>
              </div>

              {/* 5 Recommended angle slots */}
              <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong mb-1.5 sm:mb-2.5">
                  Recommended Angles
                </label>
                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                  {RECOMMENDED_SLOTS.map((slot) => {
                    const slotPhoto = photos.find((p) => p.slot === slot.id);
                    return (
                      <div
                        key={slot.id}
                        onClick={() => {
                          setActiveSlotUpload(slot.id);
                          fileInputRef.current?.click();
                        }}
                        className={`group relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 border-dashed p-1.5 sm:p-3 text-center cursor-pointer transition-all ${
                          slotPhoto
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-primary/50 hover:bg-surface'
                        }`}
                      >
                        {slotPhoto ? (
                          <div className="relative h-12 sm:h-20 w-full overflow-hidden rounded-lg">
                            <img
                              src={slotPhoto.previewUrl}
                              alt={slot.label}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[8px] sm:text-[10px] font-bold text-white uppercase">Replace</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-1 sm:py-2 flex flex-col items-center">
                            <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-surface border border-border text-primary shadow-xs group-hover:scale-110 transition-transform">
                              <Camera size={12} />
                            </div>
                            <span className="mt-1 font-display text-[9px] sm:text-xs font-bold text-text-strong truncate max-w-full">
                              {slot.label}
                            </span>
                            <span className="hidden sm:block text-[10px] text-text/60">{slot.tip}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Multi-file dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 border-dashed border-border bg-background p-3 sm:p-5 text-center cursor-pointer hover:border-primary hover:bg-surface transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES.join(',')}
                  className="hidden"
                  onChange={(e) => handleAddFiles(e.target.files, activeSlotUpload || undefined)}
                />
                <ImagePlus size={18} className="text-primary mb-1" />
                <p className="font-display text-xs sm:text-sm font-bold text-text-strong">
                  Upload multiple photos from gallery
                </p>
                <p className="text-[10px] sm:text-[11px] text-text/60">
                  JPEG, PNG, WebP • Max {MAX_FILES} photos
                </p>

                {optimizing && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Loader2 size={12} className="animate-spin" />
                    Optimizing photos for instant upload...
                  </div>
                )}
              </div>

              {/* Uploaded Gallery */}
              {photos.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-strong text-[11px] sm:text-xs">
                      Uploaded ({photos.length}/{MAX_FILES})
                    </span>
                    <button
                      type="button"
                      onClick={() => setPhotos([])}
                      className="text-text/60 hover:text-selvi-red text-[10px] sm:text-[11px] font-semibold"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2">
                    {photos.map((p, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square overflow-hidden rounded-lg sm:rounded-xl border border-border bg-surface shadow-xs"
                      >
                        <img
                          src={p.previewUrl}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(idx);
                          }}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-selvi-red transition-colors"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 7: YOUR DETAILS
          ═════════════════════════════════════════════════════════ */}
          {step === 7 && (
            <div className="space-y-2.5 sm:space-y-6">
              <div className="text-left">
                <h2 className="font-display text-lg sm:text-3xl font-extrabold uppercase tracking-tight text-text-strong leading-tight">
                  WHERE SHOULD WE SEND YOUR VALUATION?
                </h2>
                <p className="mt-0.5 sm:mt-1.5 text-[11px] sm:text-sm text-text/75 font-medium leading-snug sm:leading-relaxed">
                  Your details are used only to contact you about your bike valuation.
                </p>
              </div>

              <div className="space-y-2 sm:space-y-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong flex items-center gap-1.5">
                    <User size={12} className="text-primary" /> Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-border bg-background px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-text-strong placeholder:text-text/40 focus:border-primary focus:outline-none font-medium"
                    autoFocus
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong flex items-center gap-1.5">
                    <Phone size={12} className="text-primary" /> Mobile Number *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-text/60">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={14}
                      className="w-full rounded-xl border border-border bg-background py-2 sm:py-3 pl-10 sm:pl-12 pr-3 text-xs sm:text-sm text-text-strong placeholder:text-text/40 focus:border-primary focus:outline-none font-medium"
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="space-y-1">
                  <label className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-text-strong cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sameWhatsapp}
                      onChange={(e) => setSameWhatsapp(e.target.checked)}
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-border text-primary focus:ring-primary accent-primary"
                    />
                    <span>WhatsApp number is same as mobile</span>
                  </label>

                  {!sameWhatsapp && (
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+91 Dedicated WhatsApp Number"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-text-strong focus:border-primary focus:outline-none mt-1"
                    />
                  )}
                </div>

                {/* Pincode & Email side by side on mobile for compact height */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Pincode */}
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong flex items-center gap-1">
                      <MapPin size={11} className="text-primary" /> Pincode *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit pincode"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 sm:py-3 text-xs sm:text-sm text-text-strong placeholder:text-text/40 focus:border-primary focus:outline-none font-medium"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong truncate">
                      Email <span className="text-[9px] font-medium text-text/50 lowercase">(opt)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 sm:py-3 text-xs sm:text-sm text-text-strong placeholder:text-text/40 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy statement */}
              <div className="rounded-xl border border-border/80 bg-background/80 p-2 sm:p-3.5 text-[10px] sm:text-xs text-text/75 font-medium flex items-center gap-2">
                <ShieldCheck size={15} className="text-primary shrink-0" />
                <span>
                  <strong>100% Confidential.</strong> Your details are used only to communicate your motorcycle valuation.
                </span>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════
              STEP 8: REVIEW & SUBMIT
          ═════════════════════════════════════════════════════════ */}
          {step === 8 && (
            <div className="space-y-2.5 sm:space-y-6">
              <div className="text-left">
                <h2 className="font-display text-lg sm:text-3xl font-extrabold uppercase tracking-tight text-text-strong leading-tight">
                  REVIEW YOUR VALUATION REQUEST
                </h2>
                <p className="mt-0.5 sm:mt-1.5 text-[11px] sm:text-sm text-text/75 font-medium leading-snug sm:leading-relaxed">
                  Verify your motorcycle and contact details before requesting valuation.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
                {/* Motorcycle Card */}
                <div className="rounded-xl sm:rounded-2xl border border-border/90 bg-background p-2.5 sm:p-4 text-left relative">
                  <div className="flex items-center justify-between border-b border-border pb-1.5 mb-1.5">
                    <span className="font-display text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong truncate">
                      Bike Details
                    </span>
                    <button
                      type="button"
                      onClick={() => changeStep(1)}
                      className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-primary hover:underline shrink-0"
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                  </div>
                  <div className="space-y-1 text-[11px] sm:text-xs">
                    <p className="font-display font-bold text-text-strong text-xs sm:text-sm truncate">
                      {brand} {currentModelName}
                    </p>
                    <p className="text-text/70 truncate">
                      Yr: <strong className="text-text-strong">{year}</strong> • KM: <strong className="text-text-strong">{typeof km === 'number' ? formatKm(km) : `${km} KM`}</strong>
                    </p>
                    {regNumber && (
                      <span className="inline-block font-mono text-[9px] font-bold bg-surface px-1 py-0.5 rounded border border-border text-text-strong">
                        {regNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Condition & Price Card */}
                <div className="rounded-xl sm:rounded-2xl border border-border/90 bg-background p-2.5 sm:p-4 text-left relative">
                  <div className="flex items-center justify-between border-b border-border pb-1.5 mb-1.5">
                    <span className="font-display text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong truncate">
                      Condition & Price
                    </span>
                    <button
                      type="button"
                      onClick={() => changeStep(5)}
                      className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-primary hover:underline shrink-0"
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                  </div>
                  <div className="space-y-0.5 text-[11px] sm:text-xs">
                    <p className="text-text/80 truncate">
                      Cond: <strong className="text-text-strong">{condition}</strong>
                    </p>
                    <p className="text-text/80 truncate">
                      Owner: <strong className="text-text-strong">{owners}</strong>
                    </p>
                    <p className="text-text/80 truncate">
                      Price:{' '}
                      <strong className="text-primary font-bold">
                        {openToOffer ? 'Open' : expectedPrice ? formatPrice(Number(expectedPrice)) : 'N/A'}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Photos Card */}
                <div className="rounded-xl sm:rounded-2xl border border-border/90 bg-background p-2.5 sm:p-4 text-left relative">
                  <div className="flex items-center justify-between border-b border-border pb-1.5 mb-1.5">
                    <span className="font-display text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong truncate">
                      Photos ({photos.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => changeStep(6)}
                      className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-primary hover:underline shrink-0"
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                  </div>
                  {photos.length > 0 ? (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                      {photos.slice(0, 3).map((p, idx) => (
                        <div
                          key={idx}
                          className="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-md sm:rounded-lg overflow-hidden border border-border bg-surface"
                        >
                          <img
                            src={p.previewUrl}
                            alt="thumb"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                      {photos.length > 3 && (
                        <div className="h-8 w-8 sm:h-12 sm:w-12 shrink-0 rounded-md sm:rounded-lg bg-surface border border-border flex items-center justify-center font-display font-bold text-[10px] sm:text-xs text-text-strong">
                          +{photos.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] sm:text-xs text-text/60 font-medium">
                      No photos attached
                    </p>
                  )}
                </div>

                {/* Contact Card */}
                <div className="rounded-xl sm:rounded-2xl border border-border/90 bg-background p-2.5 sm:p-4 text-left relative">
                  <div className="flex items-center justify-between border-b border-border pb-1.5 mb-1.5">
                    <span className="font-display text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-strong truncate">
                      Contact
                    </span>
                    <button
                      type="button"
                      onClick={() => changeStep(7)}
                      className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-primary hover:underline shrink-0"
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                  </div>
                  <div className="space-y-0.5 text-[11px] sm:text-xs">
                    <p className="font-display font-bold text-text-strong truncate">{name}</p>
                    <p className="text-text/80 font-medium truncate">+91 {phone}</p>
                    <p className="text-text/70 truncate">PIN: <strong className="text-text-strong">{pincode}</strong></p>
                  </div>
                </div>
              </div>

              {/* Primary Conversion Button (Selvi Red CTA) */}
              <div className="pt-1 sm:pt-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary-dark px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-extrabold uppercase tracking-wider text-white shadow-xl shadow-primary/25 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {busy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting Valuation Request...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>GET MY VALUATION</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="mt-2.5 sm:mt-4 rounded-xl border border-selvi-red/30 bg-selvi-red/10 p-2.5 sm:p-3 text-xs font-bold text-selvi-red flex items-center gap-2 animate-in fade-in">
            <X size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Clean Consistent Bottom Navigation ── */}
        {step < TOTAL_STEPS && (
          <div className="mt-3 sm:mt-8 pt-2.5 sm:pt-5 border-t border-border/70 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-border bg-background hover:bg-surface px-3.5 sm:px-5 py-2 sm:py-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-text-strong transition-all active:scale-95"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-primary hover:bg-primary-dark px-5 sm:px-7 py-2 sm:py-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-primary/20 transition-all active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {step === TOTAL_STEPS && (
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-border/60 flex items-center justify-start">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-text/70 hover:text-primary transition-colors"
            >
              <ArrowLeft size={12} />
              <span>Back to Contact Info</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Subtle Understated Reassurance Beneath Form ── */}
      <div className="text-center pt-1 sm:pt-2">
        <p className="text-[11px] sm:text-xs font-medium text-text/60">
          Free valuation • No obligation • Your details are secure
        </p>
      </div>
    </div>
  );
}
