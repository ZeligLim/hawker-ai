'use client';

import React from 'react';
import { Store, BarChart3, CircleUserRound, QrCode } from 'lucide-react';
import { OwnerGuard } from './owner-guard';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';
import { useAuth } from '@/components/auth-provider';

export function OwnerShell({ children }: { children: React.ReactNode }) {
  const { roles } = useAuth();
  const primaryShop = roles.shops[0];
  const slug = primaryShop?.slug || primaryShop?.id;

  const boothsHref = slug
    ? `/hawker/${encodeURIComponent(slug)}/booths`
    : '/shop-owner/booths';

  const analyticsHref = slug
    ? `/hawker/${encodeURIComponent(slug)}/analytics`
    : '/shop-owner/analytics';

  const profileHref = '/shop-owner/profile';

  const ownerNavItems = [
    { href: analyticsHref, label: 'Analytics', icon: BarChart3 },
    { href: boothsHref, label: 'Booths', icon: Store },
    { href: '/shop-owner/tables', label: 'Table QR', icon: QrCode },
    { href: profileHref, label: 'Profile', icon: CircleUserRound },
  ];

  return (
    <OwnerGuard>
      <div className="relative min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        <main className="pb-28">{children}</main>

        <ClientBottomNav
          items={ownerNavItems}
          ariaLabel="Shop Owner Navigation"
        />
      </div>
    </OwnerGuard>
  );
}
