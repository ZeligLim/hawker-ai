'use client';

import { Search, X } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

export type HawkerSearchBarProps = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onClear?: () => void;
  buttonLabel?: string;
  rightActions?: ReactNode;
  className?: string;
  autoFocus?: boolean;
};

export function HawkerSearchBar({
  placeholder = 'Search',
  value,
  onChange,
  onSubmit,
  onClear,
  buttonLabel = 'Search',
  rightActions,
  className = '',
  autoFocus,
}: HawkerSearchBarProps) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange('');
    }
  };

  const hasExtraRight = Boolean(value || rightActions);

  const content = (
    <div className="relative flex items-center h-11 w-full rounded-full bg-white/95 backdrop-blur-xl shadow-xs transition-all">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8e8e93] pointer-events-none shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full h-full pl-10 ${
          hasExtraRight ? 'pr-20' : 'pr-4'
        } bg-transparent text-sm text-[#1d1d1f] placeholder-[#8e8e93] outline-none font-normal`}
      />
      <div className="absolute right-2 flex items-center gap-1">
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="p-1.5 rounded-full text-[#8e8e93] hover:text-[#1d1d1f] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {rightActions}
      </div>
    </div>
  );

  if (onSubmit) {
    return (
      <form onSubmit={onSubmit} className={`w-full ${className}`}>
        {content}
      </form>
    );
  }

  return <div className={`w-full ${className}`}>{content}</div>;
}
