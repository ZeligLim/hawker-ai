'use client';

import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';

export type CalendarPeriodView = 'day' | 'month' | 'year';

type CalendarPeriodToolbarProps = {
  heading: string;
  view: CalendarPeriodView;
  onViewChange: (view: CalendarPeriodView) => void;
  onNavigate: (direction: -1 | 1) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshLabel?: string;
};

export function CalendarPeriodToolbar({
  heading,
  view,
  onViewChange,
  onNavigate,
  onRefresh,
  isLoading,
  isRefreshing,
  refreshLabel = 'Refresh calendar',
}: CalendarPeriodToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate(-1)}
          aria-label="Previous period"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#ededf0]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="min-w-[155px] text-base font-semibold">{heading}</h2>
        <button
          type="button"
          onClick={() => onNavigate(1)}
          aria-label="Next period"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#ededf0]"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-full bg-[#f5f5f7] p-1" role="group" aria-label="Calendar view">
          {(['day', 'month', 'year'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onViewChange(option)}
              aria-pressed={view === option}
              className={`min-h-9 rounded-full px-2.5 text-[11px] font-semibold capitalize sm:px-3 sm:text-xs ${view === option ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6e6e73]'}`}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          aria-label={refreshLabel}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
