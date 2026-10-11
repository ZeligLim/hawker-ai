import { LoaderCircle } from 'lucide-react';
import React from 'react';

export function PageLoader({ text = 'Loading', fullHeight = true }: { text?: string; fullHeight?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 text-[#86868b] w-full ${fullHeight ? 'min-h-[60vh] flex-1 h-full' : 'py-12 min-h-[40vh]'}`}>
      <LoaderCircle className="h-8 w-8 animate-spin text-black" />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
}

export function ComponentLoader({ text }: { text?: string }) {
  return (
    <div className="flex w-full h-full min-h-[120px] flex-col items-center justify-center py-6 text-[#86868b]">
      <LoaderCircle className="h-6 w-6 animate-spin text-black mb-3" />
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}

export function ButtonLoader({ text = 'Loading' }: { text?: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <LoaderCircle className="h-4 w-4 animate-spin" />
      <span>{text}</span>
    </span>
  );
}

export function SkeletonLoader({ className = '', lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={`animate-pulse motion-reduce:animate-none ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-neutral-200 rounded-full w-full mb-2 last:mb-0" 
          style={{ width: i === lines - 1 && lines > 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  );
}
