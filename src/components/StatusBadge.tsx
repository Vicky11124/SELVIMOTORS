import type { BikeStatus } from '@/lib/types';

const STYLES: Record<BikeStatus, string> = {
  AVAILABLE: 'bg-primary text-white shadow-sm',
  RESERVED: 'bg-accent text-white shadow-sm',
  SOLD: 'bg-slate text-white',
  HIDDEN: 'bg-surface-muted text-text border border-border',
};

export default function StatusBadge({ status, className = '' }: { status: BikeStatus; className?: string }) {
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-medium leading-tight sm:text-[10px] ${STYLES[status]} ${className}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
