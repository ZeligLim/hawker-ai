'use client';

import { Search } from 'lucide-react';
import type { FormEvent } from 'react';

type HawkerSearchBarProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  buttonLabel?: string;
  className?: string;
};

export function HawkerSearchBar({
  placeholder,
  value,
  onChange,
  onSubmit,
  buttonLabel = 'Search',
  className = '',
}: HawkerSearchBarProps) {
  return (
    <div className={`sticky top-0 z-10 bg-transparent pb-2 pt-1 ${className}`}>
      <form onSubmit={onSubmit} className="mt-2">
      <div className="flex items-center gap-3 rounded-[28px] bg-white px-4 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.03)]">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={placeholder}
          placeholder={placeholder}
          className="h-10 flex-1 border-0 bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#6e6e73] focus:outline-none"
        />
        <button
          type="submit"
          aria-label={buttonLabel}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d1d1f] text-white"
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </button>
      </div>
      </form>
    </div>
  );
}
