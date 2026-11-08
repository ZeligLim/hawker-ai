'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ClipboardList, UserRound, UtensilsCrossed } from 'lucide-react';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';
import { ComponentLoader } from '@/components/page-loader';
import { getStoredTableSession, type CurrentTableSession } from '@/lib/table-session';


function CustomerShellContent({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const [session, setSession] = useState<CurrentTableSession | null>(null);

 useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
 setSession(getStoredTableSession()); const handleStorageChange = () => setSession(getStoredTableSession());
 window.addEventListener('storage', handleStorageChange);
 window.addEventListener('hawker-session-changed', handleStorageChange);
 return () => {
 window.removeEventListener('storage', handleStorageChange);
 window.removeEventListener('hawker-session-changed', handleStorageChange);
    };
  }, [pathname]);

 const customerNavItems = [
 ...(session?.tableId && session.centreSlug
 ? [
 {
 href: `/${encodeURIComponent(session.centreSlug)}/menu?table_id=${encodeURIComponent(session.tableId)}`,
 label: 'Menu',
 icon: UtensilsCrossed,
 },
 {
 href: `/${encodeURIComponent(session.centreSlug)}/orders?table_id=${encodeURIComponent(session.tableId)}`,
 label: 'Orders',
 icon: ClipboardList,
 },
 ]
 : []),
 { href: '/profile', label: 'Profile', icon: UserRound },
 ];

 return (
    <div className="relative min-h-screen bg-[#f5f5f7] text-black">
      <main className="pb-24">{children}</main>
      <ClientBottomNav
 items={customerNavItems}
 theme="customer"
 ariaLabel="Customer Navigation"
      />

    </div>
  );
}

export function CustomerShell({ children }: { children: React.ReactNode }) {
 return (
    <Suspense fallback={<ComponentLoader text="Loading" />}>
      <CustomerShellContent>{children}</CustomerShellContent>
    </Suspense>
  );
}
