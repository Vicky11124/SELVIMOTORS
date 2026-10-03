'use client';
import { useState, useTransition } from 'react';
import { setLeadStatus } from '@/app/admin/actions';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/types';

export default function LeadStatusSelect({ table, id, status }: { table: 'enquiries' | 'sell_requests'; id: string; status: LeadStatus }) {
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  return (
    <div>
      <select aria-label="Status" disabled={pending} value={value} className="field !w-auto !py-1.5 text-xs"
        onChange={(e) => {
          const next = e.target.value as LeadStatus;
          setValue(next);
          start(async () => { const r = await setLeadStatus(table, id, next); if (!r.ok) { setError(r.error); setValue(status); } else setError(''); });
        }}>
        {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>
      {error && <p role="alert" className="mt-1 text-xs text-brand">{error}</p>}
    </div>
  );
}
