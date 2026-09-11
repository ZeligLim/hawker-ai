'use client';

import React from 'react';
import { Store, BarChart3, CircleUserRound } from 'lucide-react';
import { OwnerGuard } from './owner-guard';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';

const ownerNavItems = [
  { href: '/shop-owner/booths', label: 'Booths', icon: Store },
  { href: '/shop-owner/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/shop-owner/profile', label: 'Profile', icon: CircleUserRound },
];

export function OwnerShell({ children }: { children: React.ReactNode }) {
  return (
    <OwnerGuard>
      <div className="relative min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
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
