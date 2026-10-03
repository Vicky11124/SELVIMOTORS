'use client';

import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { submitEnquiry } from '@/app/actions';
import SpecularButton from './ui/SpecularButton';

export default function EnquiryForm({ bikeId, bikeName }: { bikeId?: string; bikeName?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    const res = await submitEnquiry({
      bikeId,
      name: String(f.get('name')),
      phone: String(f.get('phone')),
      email: String(f.get('email') ?? ''),
      message: String(f.get('message') ?? ''),
      website: String(f.get('website') ?? ''),
    });
    setBusy(false);
    if (res.ok) setDone(true);
    else setError(res.error);
  }

  if (done) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 sm:p-5">
        <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={20} />
        <div>
          <p className="text-sm sm:text-base font-bold text-dark">Enquiry received!</p>
          <p className="mt-0.5 text-xs text-slate">Our team at Selvi Motors will call you back shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2.5 sm:space-y-3.5 rounded-xl border border-line bg-surface p-3.5 sm:p-5 shadow-sm text-dark">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-dark mb-1" htmlFor="eq-name">
            Your name *
          </label>
          <input
            id="eq-name"
            name="name"
            required
            maxLength={120}
            className="field !py-1.5 sm:!py-2 !text-xs sm:!text-sm"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-dark mb-1" htmlFor="eq-phone">
            Phone number *
          </label>
          <input
            id="eq-phone"
            name="phone"
            required
            type="tel"
            inputMode="tel"
            className="field !py-1.5 sm:!py-2 !text-xs sm:!text-sm"
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-dark mb-1" htmlFor="eq-email">
          Email (optional)
        </label>
        <input
          id="eq-email"
          name="email"
          type="email"
          maxLength={160}
          className="field !py-1.5 sm:!py-2 !text-xs sm:!text-sm"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-dark mb-1" htmlFor="eq-msg">
          Message
        </label>
        <textarea
          id="eq-msg"
          name="message"
          rows={2}
          maxLength={2000}
          className="field !py-1.5 sm:!py-2 !text-xs sm:!text-sm resize-none"
          defaultValue={bikeName ? `I'd like to know more about the ${bikeName}.` : ''}
        />
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error && <p role="alert" className="text-xs text-brand font-medium">{error}</p>}

      <div className="pt-1">
        <SpecularButton
          disabled={busy}
          variant="dark"
          size="sm"
          className="!w-full sm:!w-auto justify-center"
          onClick={() => {
            const form = document.querySelector('form');
            form?.requestSubmit();
          }}
        >
          <Send size={13} className="mr-1 inline" />
          {busy ? 'Sending Enquiry…' : 'Send enquiry'}
        </SpecularButton>
      </div>
    </form>
  );
}
