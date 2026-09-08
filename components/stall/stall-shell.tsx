'use client';

import React from 'react';
import { ClipboardList, UtensilsCrossed, LayoutDashboard, CircleUserRound, Store } from 'lucide-react';
import { StallGuard } from './stall-guard';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';

const stallNavItems = [
  { href: '/owner/orders', label: 'Tickets (KDS)', icon: ClipboardList },
  { href: '/owner/menu', label: 'Stall Menu', icon: UtensilsCrossed },
  { href: '/owner', label: 'Overview', icon: LayoutDashboard },
  { href: '/owner/profile', label: 'Profile', icon: CircleUserRound },
];

export function StallShell({ children }: { children: React.ReactNode }) {
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

        <ClientBottomNav
          items={stallNavItems}
          theme="stall"
          ariaLabel="Stall Worker Navigation"
        />
      </div>
    </StallGuard>
  );
}
