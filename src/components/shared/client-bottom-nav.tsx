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
 ariaLabel: string;
}

export function ClientBottomNav({
 items,
 ariaLabel,
}: ClientBottomNavProps) {
 const pathname = usePathname();

 // Unified pure black and white scheme without borders
 const containerTheme =
 'bg-white/95 backdrop-blur-2xl ';

 const activeTheme = 'bg-black text-white ';

 const inactiveTheme = 'text-neutral-400 hover:text-black hover:bg-neutral-100';

 const gridColsClass =
 items.length === 1
 ? 'grid-cols-1'
 : items.length === 2
 ? 'grid-cols-2'
 : items.length === 3
 ? 'grid-cols-3'
 : items.length === 5
 ? 'grid-cols-5'
 : 'grid-cols-4';

 return (
 <nav
 aria-label={ariaLabel}
 className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[500px] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:max-w-[520px] md:max-w-[440px]"
 >
 <div
 className={`grid ${gridColsClass} gap-1 rounded-full p-1.5 backdrop-blur-xl ${containerTheme}`}
 >
 {items.map(({ href, label, icon: Icon }) => {
 const basePath = href.split('?')[0];
 const isHome = basePath.endsWith('/owner') || basePath === '/admin';
 const isAnalytics = basePath.includes('/analytics') && pathname.includes('/analytics');
 const isBooths = basePath.includes('/booths') && pathname.includes('/booths');
 const isProfile = basePath.includes('/profile') && pathname.includes('/profile');
 const active = isHome
            ? pathname === basePath
            : isAnalytics || isBooths || isProfile || pathname === basePath || pathname.startsWith(basePath + '/');

 return (
 <Link
 key={label}
 href={href as any}
 className={`flex h-11 items-center justify-center rounded-full ${ active ? activeTheme : inactiveTheme }`}
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
