import React from 'react';

type SkeletonVariant = 'cards' | 'list' | 'form' | 'receipt' | 'table' | 'menu' | 'plans' | 'analytics' | 'booths';

function SkeletonBlock({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden="true" style={style} className={`animate-pulse motion-reduce:animate-none rounded-2xl bg-neutral-200/80 ${className}`} />;
}

export function PageLoader({
  text = 'Loading',
  fullHeight = true,
  variant = 'cards',
}: {
  text?: string;
  fullHeight?: boolean;
  variant?: SkeletonVariant;
}) {
  const content = {
    cards: (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-[24px] bg-white p-4 sm:p-5">
            <SkeletonBlock className="h-36 w-full rounded-[18px]" />
            <SkeletonBlock className="mt-4 h-5 w-3/4" />
            <SkeletonBlock className="mt-2 h-4 w-1/2" />
            <SkeletonBlock className="mt-4 h-10 w-full rounded-full" />
          </div>
        ))}
      </div>
    ),
    list: (
      <div className="space-y-3 rounded-[24px] bg-white p-4 sm:p-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-black/5 pb-3 last:border-0 last:pb-0">
            <SkeletonBlock className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
            <SkeletonBlock className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    ),
    booths: (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-4 rounded-[24px] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-5 w-2/3" />
                <SkeletonBlock className="h-3 w-1/2" />
              </div>
              <SkeletonBlock className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2 rounded-2xl bg-neutral-50 p-3">
              <SkeletonBlock className="h-3 w-1/2" />
              <SkeletonBlock className="h-3 w-3/4" />
              <SkeletonBlock className="h-3 w-2/5" />
            </div>
            <div className="flex gap-2">
              <SkeletonBlock className="h-9 flex-1 rounded-full" />
              <SkeletonBlock className="h-9 w-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    ),
    form: (
      <div className="max-w-2xl space-y-5 rounded-[24px] bg-white p-5 sm:p-8">
        <SkeletonBlock className="h-7 w-1/2" />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="space-y-2">
            <SkeletonBlock className="h-3 w-1/4" />
            <SkeletonBlock className="h-11 w-full rounded-xl" />
          </div>
        ))}
        <SkeletonBlock className="h-11 w-36 rounded-full" />
      </div>
    ),
    receipt: (
      <div className="mx-auto max-w-[480px] space-y-4 rounded-[24px] bg-white p-5 sm:p-7">
        <SkeletonBlock className="mx-auto h-8 w-1/2" />
        <SkeletonBlock className="h-24 w-full rounded-xl" />
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex justify-between gap-4 border-b border-black/5 pb-3">
            <SkeletonBlock className="h-4 w-1/2" />
            <SkeletonBlock className="h-4 w-16" />
          </div>
        ))}
        <SkeletonBlock className="h-10 w-full rounded-full" />
      </div>
    ),
    table: (
      <div className="space-y-3 rounded-[24px] bg-white p-4 sm:p-5">
        <SkeletonBlock className="mb-5 h-6 w-1/3" />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="grid grid-cols-4 gap-3 border-b border-black/5 pb-3">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-4/5" />
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    ),
    menu: (
      <div className="grid gap-3.5 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-[22px] bg-white p-3.5">
            <SkeletonBlock className="h-16 w-16 shrink-0 rounded-[14px]" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-3 w-1/2" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    ),
    plans: (
      <div className="space-y-3 rounded-[24px] bg-white p-4 sm:p-5">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-black/5 pb-4 last:border-0">
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-1/3" />
              <SkeletonBlock className="h-3 w-2/3" />
            </div>
            <SkeletonBlock className="h-10 w-28 rounded-xl" />
            <SkeletonBlock className="h-9 w-20 rounded-full" />
          </div>
        ))}
      </div>
    ),
    analytics: (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-3 rounded-[20px] bg-white p-4">
              <SkeletonBlock className="h-3 w-1/2" />
              <SkeletonBlock className="h-7 w-2/3" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5 rounded-[24px] bg-white p-5">
            <SkeletonBlock className="h-5 w-1/3" />
            <div className="flex h-52 items-end gap-3 border-b border-l border-black/5 px-3 pb-3">
              {[45, 70, 54, 88, 62, 76, 50].map((height, index) => (
                <SkeletonBlock key={index} style={{ height: `${height}%` }} className="flex-1 rounded-t-md rounded-b-none" />
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-[24px] bg-white p-5">
            <SkeletonBlock className="h-5 w-1/2" />
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-3">
                <SkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-3 w-2/3" />
                  <SkeletonBlock className="h-2 w-1/2" />
                </div>
                <SkeletonBlock className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  }[variant];

  return (
    <div
      role="status"
      aria-label={text || 'Loading'}
      className={fullHeight ? 'mx-auto min-h-[60vh] w-full max-w-6xl px-4 py-8 sm:px-6' : 'w-full py-2'}
    >
      <span className="sr-only">{text || 'Loading'}</span>
      <div className="space-y-5">{content}</div>
    </div>
  );
}

export function ComponentLoader({ text = 'Loading' }: { text?: string }) {
  return (
    <div role="status" aria-label={text} className="w-full space-y-3 py-4">
      <span className="sr-only">{text}</span>
      <SkeletonBlock className="h-5 w-1/3" />
      <SkeletonBlock className="h-20 w-full" />
      <SkeletonBlock className="h-20 w-full" />
    </div>
  );
}

export function ButtonLoader({ text = 'Loading' }: { text?: string }) {
  return (
    <span className="flex items-center justify-center gap-2" role="status">
      <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      <span>{text}</span>
    </span>
  );
}

export function SkeletonLoader({ className = '', lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div role="status" aria-label="Loading" className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className="h-4 w-full rounded-full"
        />
      ))}
    </div>
  );
}
