'use client';

import React from 'react';
import { UserRound, LayoutDashboard, Layers, Building2 } from 'lucide-react';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/monetization', label: 'Plans', icon: Layers },
  { href: '/admin/shops', label: 'Venues', icon: Building2 },
  { href: '/admin/profile', label: 'Profile', icon: UserRound },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-app relative min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased">
      <main className="pb-28">
        <div className="mx-auto min-h-screen w-full max-w-7xl p-4 pt-5 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
      <ClientBottomNav items={navItems} ariaLabel="Admin Navigation" />
    </div>
  );
}
