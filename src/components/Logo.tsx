export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col leading-none ${className}`} aria-label="Selvi Motors">
      <svg viewBox="0 0 120 22" className="h-3.5 w-[74px] text-accent" aria-hidden="true" fill="currentColor">
        <path d="M2 18C20 4 44 0 66 3c12 2 22 6 30 4-6 5-16 6-26 5-14-2-26-1-40 3-10 3-20 4-28 3Z" />
        <path d="M78 10c10 1 22 4 40 8-14 0-28-2-40-5Z" opacity=".7" />
      </svg>
      <span className="font-display text-[22px] font-extrabold italic tracking-tight text-white">
        SELVI <span className="text-accent">MOTORS</span>
      </span>
    </span>
  );
}
