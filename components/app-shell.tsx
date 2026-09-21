'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PermissionEngine } from '@/lib/shared/permissions';
import { CustomerShell } from '@/components/customer/customer-shell';
import { StallShell } from '@/components/stall/stall-shell';
import { OwnerShell } from '@/components/owner/owner-shell';

/**
 * AppShell: Multi-Client Root Shell Dispatcher
 *
 * Dispatches between the four dedicated frontend experiences:
 * 1. Website / Marketing: Public landing & onboarding (self-contained layout)
 * 2. Customer App: Food discovery, menus, cart, orders, profile
 * 3. Hawker Stall App: Kitchen Display System (KDS), orders, sold-out controls
 * 4. Hawker Shop Owner App: Venue overview, booth management, analytics, fee settings
 */
export function AppShell({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const client = PermissionEngine.getClientForPath(pathname);

 // 1. Marketing, Auth & SaaS Superadmin routes (Render their own self-contained layout)
 if (client === 'website' || client === 'admin') {
 return <>{children}</>;
 }

 // 2. Hawker Stall Worker App
 if (client === 'stall') {
 return <StallShell>{children}</StallShell>;
 }

 // 3. Hawker Shop Owner App
 if (client === 'owner') {
 return <OwnerShell>{children}</OwnerShell>;
 }

 // 4. Customer App (Default)
 return <CustomerShell>{children}</CustomerShell>;
}
