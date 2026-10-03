'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Flame, ImagePlus, Loader2, Sparkles, X } from 'lucide-react';
import { saveBike } from '@/app/admin/actions';
import { createClient } from '@/lib/supabase/client';
import { BIKE_STATUSES, FUEL_TYPES, TRANSMISSIONS, type Bike, type BikeImage, type BikeStatus } from '@/lib/types';
import {
  BIKE_BRANDS,
  COMMON_VARIANTS,
  CONDITION_OPTIONS,
  INDIAN_BIKE_CATALOG,
  LOCATION_OPTIONS,
  OWNER_OPTIONS,
  YEAR_OPTIONS,
} from '@/lib/bikeData';
import { formatFileSize, optimizeImageList } from '@/lib/imageOptimizer';
import { sortedImages } from '@/lib/utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic'];
const MAX_BYTES = 12 * 1024 * 1024; // Allow up to 12MB input since we convert to WebP

interface LocalPhoto {
  file: File;
  previewUrl: string;
  originalSize: number;
  optimizedSize: number;
  reductionPercentage: number;
}

export default function BikeForm({ bike }: { bike?: Bike }) {
  const router = useRouter();
  const isNew = !bike;
  const [id] = useState(() => bike?.id ?? crypto.randomUUID());
  const [existing, setExisting] = useState<BikeImage[]>(bike ? sortedImages(bike) : []);
  const [removed, setRemoved] = useState<BikeImage[]>([]);
  const [newPhotos, setNewPhotos] = useState<LocalPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState('');

  // Dropdown & Input states
  const [brand, setBrand] = useState(bike?.brand || 'Royal Enfield');
  const [model, setModel] = useState(bike?.model || 'Hunter 350');
  const [variant, setVariant] = useState(bike?.variant ?? '');
  const [price, setPrice] = useState<number | string>(bike?.price ?? '');
  const [kmDriven, setKmDriven] = useState<number | string>(bike?.km_driven ?? '');
  const [isCustomModel, setIsCustomModel] = useState(false);

  // Available models for chosen brand
  const availableModels = useMemo(() => {
    return INDIAN_BIKE_CATALOG[brand] || ['Other Model'];
  }, [brand]);

  function handleBrandChange(newBrand: string) {
    setBrand(newBrand);
    const models = INDIAN_BIKE_CATALOG[newBrand] || ['Other Model'];
    if (!models.includes(model)) {
      setModel(models[0] || '');
      setIsCustomModel(false);
    }
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [newPhotos]);

  async function handleFilesSelected(list: FileList | null) {
    if (!list || list.length === 0) return;
    setError('');
    setOptimizing(true);

    const validFiles: File[] = [];
    for (const f of Array.from(list)) {
      if (f.size > MAX_BYTES) {
        setError(`${f.name} is larger than 12 MB.`);
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) {
      setOptimizing(false);
      return;
    }

    try {
      // Convert and optimize images to WebP
      const optimizedResults = await optimizeImageList(validFiles, 1600, 1200, 0.82);

      const newItems: LocalPhoto[] = optimizedResults.map((r) => ({
        file: r.file,
        previewUrl: URL.createObjectURL(r.file),
        originalSize: r.originalSize,
        optimizedSize: r.optimizedSize,
        reductionPercentage: r.reductionPercentage,
      }));

      setNewPhotos((prev) => [...prev, ...newItems]);
    } catch {
      setError('Could not convert one or more photos to WebP.');
    } finally {
      setOptimizing(false);
    }
  }

  function removeNewPhoto(index: number) {
    setNewPhotos((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  const moveExisting = (i: number, d: -1 | 1) => setExisting((arr) => {
    const j = i + d; if (j < 0 || j >= arr.length) return arr;
    const n = [...arr]; [n[i], n[j]] = [n[j], n[i]]; return n;
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = (k: string) => String(f.get(k) ?? '');
    setBusy(true); setError('');
    const supabase = createClient();
    const uploaded: string[] = [];
    try {
      // Upload all WebP-optimized files to Supabase storage
      for (const item of newPhotos) {
        const path = `${id}/${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage.from('bike-images').upload(path, item.file, {
          contentType: 'image/webp',
          cacheControl: '31536000',
        });
        if (upErr) throw new Error(`Image upload failed: ${upErr.message}`);
        uploaded.push(path);
      }

      const res = await saveBike({
        id,
        isNew,
        brand: s('brand'),
        model: s('model'),
        variant: variant.trim(),
        price: Number(s('price')),
        year: Number(s('year')),
        km_driven: Number(s('km_driven')),
        fuel_type: s('fuel_type'),
        transmission: s('transmission'),
        owner_count: Number(s('owner_count')),
        registration_number: s('registration_number'),
        condition: s('condition'),
        location: s('location'),
        description: s('description'),
        status: s('status') as BikeStatus,
        featured: f.get('featured') === 'on',
        new_arrival: f.get('new_arrival') === 'on',
        keepImageIds: existing.map((i) => i.id),
        removedImages: removed.map((i) => ({ id: i.id, storage_path: i.storage_path })),
        newImagePaths: uploaded,
      });

      if (!res.ok) {
        if (uploaded.length) await supabase.storage.from('bike-images').remove(uploaded);
        throw new Error(res.error);
      }

      router.push('/admin/bikes');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the bike.');
      setBusy(false);
    }
  }

  const b = bike;

  return (
    <form onSubmit={onSubmit} className="max-w-4xl space-y-6">
      <div className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3 shadow-sm">
        
        {/* 1. Brand Dropdown */}
        <div>
          <label className="label" htmlFor="brand">Brand *</label>
          <select
            id="brand"
            name="brand"
            required
            value={brand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="field"
          >
            {BIKE_BRANDS.map((br) => (
              <option key={br} value={br}>{br}</option>
            ))}
          </select>
        </div>

        {/* 2. Model Dropdown & Custom Typing Toggle */}
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="model">Model *</label>
            <button
              type="button"
              onClick={() => setIsCustomModel(!isCustomModel)}
              className="text-[11px] text-brand hover:underline"
            >
              {isCustomModel ? 'Choose from list' : '+ Type custom model'}
            </button>
          </div>
          {isCustomModel ? (
            <input
              id="model"
              name="model"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="field"
              placeholder="Type model name (e.g. Ninja ZX-10R)"
            />
          ) : (
            <select
              id="model"
              name="model"
              required
              value={model}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setIsCustomModel(true);
                  setModel('');
                } else {
                  setModel(e.target.value);
                }
              }}
              className="field"
            >
              {availableModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="__custom__">+ Enter custom model...</option>
            </select>
          )}
        </div>

        {/* 3. Variant: Full Manual Typing + Quick Suggestions Dropdown & Badges */}
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="variant">Variant</label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) setVariant(e.target.value);
              }}
              className="rounded border border-line bg-raised px-1.5 py-0.5 text-[11px] text-muted hover:text-white"
            >
              <option value="" disabled>Select suggestion...</option>
              {COMMON_VARIANTS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <input
            id="variant"
            name="variant"
            type="text"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            className="field"
            placeholder="Type or select variant (e.g. V2, Dual ABS, KRT)"
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {['Standard', 'Dual ABS', 'Disc', 'Bluetooth', 'Dark Edition', 'V2', 'V4'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-muted hover:bg-brand/20 hover:text-white"
              >
                {v}
              </button>
            ))}
            {variant && (
              <button
                type="button"
                onClick={() => setVariant('')}
                className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-brand hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 4. Price (₹) with Quick Presets */}
        <div>
          <label className="label" htmlFor="price">Price (₹) *</label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="field"
            placeholder="e.g. 150000"
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {[100000, 150000, 200000, 250000].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrice(p)}
                className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-muted hover:bg-brand/20 hover:text-white"
              >
                ₹{(p / 100000).toFixed(1)}L
              </button>
            ))}
          </div>
        </div>

        {/* 5. Year Dropdown */}
        <div>
          <label className="label" htmlFor="year">Year *</label>
          <select
            id="year"
            name="year"
            required
            defaultValue={b?.year ?? YEAR_OPTIONS[1]}
            className="field"
          >
            {YEAR_OPTIONS.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>

        {/* 6. KM Driven with Quick Presets */}
        <div>
          <label className="label" htmlFor="km_driven">KM driven *</label>
          <input
            id="km_driven"
            name="km_driven"
            type="number"
            min={0}
            required
            value={kmDriven}
            onChange={(e) => setKmDriven(e.target.value)}
            className="field"
            placeholder="e.g. 12000"
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {[5000, 10000, 15000, 25000, 50000].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKmDriven(k)}
                className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-muted hover:bg-brand/20 hover:text-white"
              >
                {k >= 1000 ? `${k / 1000}k` : k} KM
              </button>
            ))}
          </div>
        </div>

        {/* 7. Fuel Type Dropdown */}
        <div>
          <label className="label" htmlFor="fuel_type">Fuel</label>
          <select id="fuel_type" name="fuel_type" defaultValue={b?.fuel_type ?? 'Petrol'} className="field">
            {FUEL_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>

        {/* 8. Transmission Dropdown */}
        <div>
          <label className="label" htmlFor="transmission">Transmission</label>
          <select id="transmission" name="transmission" defaultValue={b?.transmission ?? 'Manual'} className="field">
            {TRANSMISSIONS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>

        {/* 9. Owner Count Dropdown */}
        <div>
          <label className="label" htmlFor="owner_count">Owner count</label>
          <select id="owner_count" name="owner_count" defaultValue={b?.owner_count ?? 1} className="field">
            {OWNER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* 10. Registration Number */}
        <div>
          <label className="label" htmlFor="registration_number">Registration number</label>
          <input
            id="registration_number"
            name="registration_number"
            defaultValue={b?.registration_number ?? ''}
            className="field"
            placeholder="e.g. TN 07 XX 1234"
          />
        </div>

        {/* 11. Condition Dropdown */}
        <div>
          <label className="label" htmlFor="condition">Condition</label>
          <select id="condition" name="condition" defaultValue={b?.condition ?? 'Excellent'} className="field">
            {CONDITION_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* 12. Location Dropdown / Datalist */}
        <div>
          <label className="label" htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            list="location-list"
            defaultValue={b?.location ?? 'Chennai, Tamil Nadu'}
            className="field"
            placeholder="Select or enter city"
          />
          <datalist id="location-list">
            {LOCATION_OPTIONS.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>

        {/* 13. Description */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={b?.description ?? ''}
            className="field"
            placeholder="Key features, service history, condition highlights…"
          />
        </div>

        {/* 14. Status, Featured & New Arrivals */}
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={b?.status ?? 'AVAILABLE'} className="field">
            {BIKE_STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>

        <div className="flex flex-col justify-end gap-2.5 pb-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-text-strong cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={b?.featured}
              className="h-4 w-4 rounded border-border bg-surface accent-[#0E3B2E]"
            />
            <span>Featured on home page</span>
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-text-strong cursor-pointer">
            <input
              type="checkbox"
              name="new_arrival"
              defaultChecked={b?.new_arrival ?? true}
              className="h-4 w-4 rounded border-border bg-surface accent-[#0E3B2E]"
            />
            <span className="inline-flex items-center gap-1.5 text-primary font-bold">
              <Flame size={15} /> Show in New Arrivals (Hero Slideshow)
            </span>
          </label>
        </div>
      </div>

      {/* Photos Management with Automatic WebP Converter */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-text-strong">Photos</h2>
              <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                <Sparkles size={12} /> Auto WebP Converter Active
              </span>
            </div>
            <p className="mt-1 text-xs text-text/70">
              Upload any JPG or PNG. Photos are automatically converted to optimized <strong>WebP</strong> (70–90% smaller, ultra-fast loading). First photo is cover.
            </p>
          </div>
          {optimizing && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Loader2 size={14} className="animate-spin" />
              Converting & optimizing photos to WebP...
            </div>
          )}
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Existing Photos */}
          {existing.map((img, i) => (
            <li key={img.id} className="space-y-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
                <Image src={img.image_url} alt={`Photo ${i + 1}`} fill sizes="200px" className="object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 rounded bg-primary px-1.5 text-[10px] font-bold text-white">Cover</span>}
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => { setExisting(existing.filter((x) => x.id !== img.id)); setRemoved([...removed, img]); }}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 hover:bg-primary text-white"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex justify-center gap-1">
                <button
                  type="button"
                  aria-label="Move earlier"
                  disabled={i === 0}
                  onClick={() => moveExisting(i, -1)}
                  className="rounded p-1 hover:bg-surface-muted disabled:opacity-30 text-text"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Move later"
                  disabled={i === existing.length - 1}
                  onClick={() => moveExisting(i, 1)}
                  className="rounded p-1 hover:bg-surface-muted disabled:opacity-30 text-text"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </li>
          ))}

          {/* Newly Converted WebP Photos */}
          {newPhotos.map((photo, i) => (
            <li key={photo.previewUrl} className="space-y-1">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-dashed border-primary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.previewUrl} alt={`New WebP Photo ${i + 1}`} className="h-full w-full object-cover" />
                <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  <CheckCircle2 size={10} /> WebP
                </span>
                <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white">
                  {formatFileSize(photo.optimizedSize)}
                  {photo.reductionPercentage > 0 && ` (-${photo.reductionPercentage}%)`}
                </span>
                <button
                  type="button"
                  aria-label="Remove new photo"
                  onClick={() => removeNewPhoto(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/70 p-1 hover:bg-primary text-white"
                >
                  <X size={12} />
                </button>
              </div>
            </li>
          ))}

          {/* Add Photos Dropzone */}
          <li>
            <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-surface-muted p-2 text-center text-xs text-text/70 transition-colors hover:border-primary hover:text-primary">
              <ImagePlus size={22} className="text-primary" />
              <span className="font-semibold text-text-strong">Add photos</span>
              <span className="text-[10px] text-text/60">Auto-converted to WebP</span>
              <input
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(',')}
                hidden
                onChange={(e) => {
                  handleFilesSelected(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          </li>
        </ul>
      </div>

      {error && <p role="alert" className="text-sm text-brand">{error}</p>}
      <div className="flex gap-3">
        <button disabled={busy || optimizing} className="btn-red">
          {busy ? 'Saving…' : isNew ? 'Publish bike' : 'Save changes'}
        </button>
        <button type="button" onClick={() => router.push('/admin/bikes')} className="btn-outline">Cancel</button>
      </div>
    </form>
  );
}
