'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { House, Store, UtensilsCrossed, ClipboardList, UserRound } from 'lucide-react';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';
import { FloatingAiWidget } from '@/components/floating-ai-widget';
import { getStoredTableSession, type CurrentTableSession } from '@/lib/table-session';
import { useState, useEffect } from 'react';

const customerNavItems = [
  { href: '/home', label: 'Home', icon: House },
  { href: '/stall', label: 'Stall', icon: Store },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/profile', label: 'Profile', icon: UserRound },
];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/home';
  const [session, setSession] = useState<CurrentTableSession | null>(null);

  useEffect(() => {
    // Initial load
    setSession(getStoredTableSession());

    // Listen for cross-tab or programmatic updates
    const handleStorageChange = () => {
      setSession(getStoredTableSession());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hawker-session-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hawker-session-changed', handleStorageChange);
    };
  }, [pathname]); // also re-check on pathname change just in case

  return (
    <div className={`relative ${isHomePage ? 'h-screen w-screen overflow-hidden' : 'min-h-screen'} bg-white text-black`}>
      <main className={isHomePage ? 'h-full w-full overflow-hidden' : 'pb-24'}>{children}</main>

      <ClientBottomNav
        items={customerNavItems}
        theme="customer"
        ariaLabel="Customer Navigation"
      />
      {session?.aiEnabled !== false && <FloatingAiWidget />}
    </div>
  );
}
