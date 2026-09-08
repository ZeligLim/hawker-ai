'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface ClientBottomNavProps {
  items: NavItem[];
  theme?: 'customer' | 'stall' | 'owner';
  ariaLabel: string;
}

export function ClientBottomNav({
  items,
  theme = 'customer',
  ariaLabel,
}: ClientBottomNavProps) {
  const pathname = usePathname();

  // Color schemes for each client experience
  const containerTheme = {
    customer: 'bg-[#f7f7f7]/95 md:bg-white/95 border border-black/5 shadow-[0_8px_24px_rgba(17,17,17,0.08)] text-[#6e6e73]',
    stall: 'bg-[#111827]/95 border border-white/10 shadow-[0_8px_28px_rgba(0,0,0,0.25)] text-white/70',
    owner: 'bg-white/95 border border-black/5 shadow-[0_8px_24px_rgba(17,17,17,0.08)] text-[#6e6e73]',
  }[theme];

  const activeTheme = {
    customer: 'bg-white text-[#1d1d1f] shadow-sm font-semibold',
    stall: 'bg-white text-[#111827] shadow-sm font-semibold',
    owner: 'bg-[#0071e3] text-white shadow-sm font-semibold',
  }[theme];

  const inactiveTheme = {
    customer: 'text-[#6e6e73] hover:text-[#1d1d1f]',
    stall: 'text-white/70 hover:text-white',
    owner: 'text-[#6e6e73] hover:text-[#1d1d1f]',
  }[theme];

  const gridColsClass = items.length === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <nav
      aria-label={ariaLabel}
      className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:max-w-[480px] md:max-w-[560px] lg:max-w-[680px]"
    >
      <div
        className={`grid ${gridColsClass} gap-1 rounded-full p-1.5 backdrop-blur-xl ${containerTheme}`}
      >
        {items.map(({ href, label, icon: Icon }) => {
          const isHome = href === '/home' || href === '/owner';
          const active = isHome
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={label}
              href={href as any}
              className={`flex min-h-[44px] flex-col items-center justify-center rounded-full py-1.5 px-1 transition-all ${
                active ? activeTheme : inactiveTheme
              }`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              <span className="mt-0.5 text-[10px] sm:text-[11px] font-medium tracking-tight truncate max-w-full text-center">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
