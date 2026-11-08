'use client';

import React from 'react';
import { ClipboardList, UtensilsCrossed, LayoutDashboard, CircleUserRound } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getStallRoute } from '@/lib/stall-route';
import { StallGuard } from './stall-guard';
import { ClientBottomNav } from '@/components/shared/client-bottom-nav';

export function StallShell({ children }: { children: React.ReactNode }) {
 const { roles } = useAuth();
 const stall = roles.booths[0];
 const stallNavItems = stall
 ? [
 { href: getStallRoute(stall), label: 'Overview', icon: LayoutDashboard },
 { href: getStallRoute(stall, 'orders'), label: 'Tickets', icon: ClipboardList },
 { href: getStallRoute(stall, 'menu'), label: 'Menu', icon: UtensilsCrossed },
 { href: getStallRoute(stall, 'profile'), label: 'Profile', icon: CircleUserRound },
 ]
 : [];

 return (
 <StallGuard>
 <div className="relative min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
 <main className="pb-28">{children}</main>

 <ClientBottomNav
 items={stallNavItems}
 theme="stall"
 ariaLabel="Stall Worker Navigation"
 showLabels
 />
 </div>
 </StallGuard>
 );
}
