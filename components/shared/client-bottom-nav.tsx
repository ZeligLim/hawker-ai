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

  // Unified modern Apple-inspired color scheme across all 3 apps
  const containerTheme = 'bg-white/90 backdrop-blur-2xl border border-black/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.08)] text-[#6e6e73]';

  const activeTheme = 'bg-[#111827] text-white shadow-sm font-semibold';

  const inactiveTheme = 'text-[#86868b] hover:text-[#1d1d1f]';

  const gridColsClass =
    items.length === 3
      ? 'grid-cols-3'
      : items.length === 5
        ? 'grid-cols-5'
        : 'grid-cols-4';

  return (
    <nav
      aria-label={ariaLabel}
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] px-2 sm:px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:max-w-[480px] md:max-w-[560px] lg:max-w-[680px]"
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
              className={`flex min-h-[44px] flex-col items-center justify-center rounded-full py-1.5 px-0.5 sm:px-1 transition-all ${
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
