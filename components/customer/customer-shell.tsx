'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Menu, ClipboardList, UserRound } from 'lucide-react';

const customerNavItems = [
  { href: '/home', label: 'Home', icon: House },
  { href: '/menu', label: 'Menu', icon: Menu },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/profile', label: 'Profile', icon: UserRound },
];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen bg-[#f5f5f7]">
      <main className="pb-24">{children}</main>

      {/* Customer Client Bottom Navigation Bar */}
      <nav
        aria-label="Customer Navigation"
        className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-3 pb-3 sm:max-w-[480px] lg:max-w-[720px]"
      >
        <div className="grid grid-cols-4 gap-1 rounded-full bg-[#f7f7f7]/95 p-1.5 shadow-[0_8px_24px_rgba(17,17,17,0.08)] backdrop-blur-xl lg:bg-white/95 border border-black/5">
          {customerNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/home' && pathname.startsWith(`${href}/`));

            return (
              <Link
                key={label}
                href={href as any}
                className={`flex flex-col items-center justify-center rounded-full py-2 transition ${
                  active ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                <span className="mt-0.5 text-[10px] tracking-tight">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
