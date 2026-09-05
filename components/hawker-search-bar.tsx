'use client';

import type { FormEvent } from 'react';

type HawkerSearchBarProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  buttonLabel?: string;
};

export function HawkerSearchBar({
  placeholder,
  value,
  onChange,
  onSubmit,
  buttonLabel = 'Search',
}: HawkerSearchBarProps) {
  return (
    <form onSubmit={onSubmit} className="mt-6">
      <div className="flex items-center gap-3 rounded-[28px] border border-[#e5e7eb] bg-white px-3 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.03)]">
        <span className="flex h-8 w-8 items-center justify-center text-[#1d1d1f]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="M16 16L21 21" />
          </svg>
        </span>
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="M16 16L21 21" />
          </svg>
        </button>
      </div>
    </form>
  );
}
