'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, UtensilsCrossed, LayoutDashboard, CircleUserRound, Store } from 'lucide-react';
import { StallGuard } from './stall-guard';

const stallNavItems = [
  { href: '/owner/orders', label: 'Tickets (KDS)', icon: ClipboardList },
  { href: '/owner/menu', label: 'Stall Menu', icon: UtensilsCrossed },
  { href: '/owner', label: 'Overview', icon: LayoutDashboard },
  { href: '/owner/profile', label: 'Profile', icon: CircleUserRound },
];

export function StallShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <StallGuard>
      <div className="relative min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        {/* Stall Worker App Header */}
        <header className="sticky top-0 z-20 border-b border-black/5 bg-white/95 px-4 py-2.5 backdrop-blur-md">
          <div className="mx-auto flex max-w-[960px] items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                <Store className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Hawker Stall App</span>
                <span className="ml-2 text-xs text-[#6e6e73] hidden sm:inline">• Kitchen Operations</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live KDS
              </span>
            </div>
          </div>
        </header>

        <main className="pb-28">{children}</main>

        {/* Stall Worker Bottom Navigation */}
        <nav
          aria-label="Stall Worker Navigation"
          className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-3 pb-3 sm:max-w-[480px] lg:max-w-[720px]"
        >
          <div className="grid grid-cols-4 gap-1 rounded-full bg-[#111827]/95 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl border border-white/10 text-white">
            {stallNavItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/owner' && pathname.startsWith(`${href}/`));

              return (
                <Link
                  key={label}
                  href={href as any}
                  className={`flex flex-col items-center justify-center rounded-full py-2 transition ${
                    active ? 'bg-white text-[#111827] shadow-sm font-semibold' : 'text-white/70 hover:text-white'
                  }`}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                  <span className="mt-0.5 text-[10px] tracking-tight">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </StallGuard>
  );
}
