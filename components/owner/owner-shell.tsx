'use client';

import React from 'react';
import { Store, BarChart3, CircleUserRound, Building2 } from 'lucide-react';
import { OwnerGuard } from './owner-guard';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';

const ownerNavItems = [
  { href: '/shop-owner/booths', label: 'Booths & Invites', icon: Store },
  { href: '/shop-owner/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/shop-owner/profile', label: 'Venue Settings', icon: CircleUserRound },
];

export function OwnerShell({ children }: { children: React.ReactNode }) {
  return (
    <OwnerGuard>
      <div className="relative min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        {/* Shop Owner Header */}
        <header className="sticky top-0 z-20 border-b border-black/5 bg-white/95 px-4 py-2.5 backdrop-blur-md">
          <div className="mx-auto flex max-w-[960px] items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Hawker Business App</span>
                <span className="ml-2 text-xs text-[#6e6e73] hidden sm:inline">• Venue Management</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                Shop Owner Portal
              </span>
            </div>
          </div>
        </header>

        <main className="pb-28">{children}</main>

        <ClientBottomNav
          items={ownerNavItems}
          theme="owner"
          ariaLabel="Shop Owner Navigation"
        />
      </div>
    </OwnerGuard>
  );
}
