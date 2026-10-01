'use client';

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { House, Store, UtensilsCrossed, ClipboardList, UserRound } from 'lucide-react';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';
import { FloatingAiWidget } from '@/components/floating-ai-widget';
import { getStoredTableSession, type CurrentTableSession } from '@/lib/table-session';
import { useState, useEffect } from 'react';


function CustomerShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const centreParam = searchParams.get('centre') || searchParams.get('slug');
  const isHomePage = pathname === '/home';
  const [session, setSession] = useState<CurrentTableSession | null>(null);

  useEffect(() => {
    setSession(getStoredTableSession());
    const handleStorageChange = () => setSession(getStoredTableSession());
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hawker-session-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hawker-session-changed', handleStorageChange);
    };
  }, [pathname]);

  const activeCentreSlug = centreParam || session?.centreSlug;
  const suffix = activeCentreSlug ? `?centre=${encodeURIComponent(activeCentreSlug)}` : '';

  const customerNavItems = [
    { href: '/home', label: 'Home', icon: House },
    { href: `/stall${suffix}`, label: 'Stall', icon: Store },
    { href: `/menu${suffix}`, label: 'Menu', icon: UtensilsCrossed },
    { href: '/orders', label: 'Orders', icon: ClipboardList },
    { href: '/profile', label: 'Profile', icon: UserRound },
  ];

  return (
    <div className={`relative ${isHomePage ? 'h-screen w-screen overflow-hidden' : 'min-h-screen'} bg-[#f5f5f7] text-black`}>
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

export function CustomerShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerShellContent>{children}</CustomerShellContent>
    </Suspense>
  );
}
