'use client';

import React from 'react';
import { ClipboardList, UtensilsCrossed, LayoutDashboard, CircleUserRound } from 'lucide-react';
import { StallGuard } from './stall-guard';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';

const stallNavItems = [
 { href: '/owner', label: 'Overview', icon: LayoutDashboard },
 { href: '/owner/orders', label: 'Tickets', icon: ClipboardList },
 { href: '/owner/menu', label: 'Menu', icon: UtensilsCrossed },
 { href: '/owner/profile', label: 'Profile', icon: CircleUserRound },
];

export function StallShell({ children }: { children: React.ReactNode }) {
 return (
 <StallGuard>
 <div className="relative min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
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
