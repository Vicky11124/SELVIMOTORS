'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  description: string;
  className?: string;
}

export default function ExpandableDescription({ description, className = '' }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > 110;

  if (!description) return null;

  return (
    <div className={`mt-2.5 sm:mt-5 ${className}`}>
      <p
        className={`text-xs sm:text-sm leading-relaxed text-black whitespace-pre-line transition-all duration-200 ${
          expanded ? '' : 'line-clamp-2 sm:line-clamp-none'
        }`}
      >
        {description}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 inline-flex items-center gap-1 text-[11px] sm:hidden font-semibold text-brand hover:underline"
        >
          {expanded ? (
            <>
              Show less <ChevronUp size={12} />
            </>
          ) : (
            <>
              Read more <ChevronDown size={12} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
