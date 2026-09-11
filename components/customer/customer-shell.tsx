'use client';

import React from 'react';
import { House, Store, UtensilsCrossed, ClipboardList, UserRound } from 'lucide-react';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';

const customerNavItems = [
  { href: '/home', label: 'Home', icon: House },
  { href: '/stall', label: 'Stall', icon: Store },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/profile', label: 'Profile', icon: UserRound },
];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#f5f5f7]">
      <main className="pb-24">{children}</main>

      <ClientBottomNav
        items={customerNavItems}
        theme="customer"
        ariaLabel="Customer Navigation"
      />
    </div>
  );
}
