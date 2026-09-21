'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
 href: string;
 label: string;
 icon: LucideIcon;
}

export interface ClientBottomNavProps {
 items: NavItem[];
 theme?: 'customer' | 'stall' | 'owner';
 ariaLabel: string;
}

export function ClientBottomNav({
 items,
 theme = 'customer',
 ariaLabel,
}: ClientBottomNavProps) {
 const pathname = usePathname();

 // Unified pure black and white scheme without borders
 const containerTheme =
 'bg-white/95 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)]';

 const activeTheme = 'bg-black text-white shadow-xs';

 const inactiveTheme = 'text-neutral-400 hover:text-black hover:bg-neutral-100';

 const gridColsClass =
 items.length === 3
 ? 'grid-cols-3'
 : items.length === 5
 ? 'grid-cols-5'
 : 'grid-cols-4';

 return (
 <nav
 aria-label={ariaLabel}
 className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[360px] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:max-w-[400px] md:max-w-[440px]"
 >
 <div
 className={`grid ${gridColsClass} gap-1 rounded-full p-1.5 backdrop-blur-xl ${containerTheme}`}
 >
 {items.map(({ href, label, icon: Icon }) => {
 const isHome = href === '/home' || href === '/owner' || href === '/admin';
 const active = isHome
 ? pathname === href
 : pathname === href || pathname.startsWith(`${href}/`);

 return (
 <Link
 key={label}
 href={href as any}
 className={`flex h-11 items-center justify-center rounded-full ${
 active ? activeTheme : inactiveTheme
 }`}
 aria-label={label}
 title={label}
 aria-current={active ? 'page' : undefined}
 >
 <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
 </Link>
 );
 })}
 </div>
 </nav>
 );
}
