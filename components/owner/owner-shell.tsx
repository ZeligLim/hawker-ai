'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, BarChart3, CircleUserRound, Building2 } from 'lucide-react';
import { OwnerGuard } from './owner-guard';

const ownerNavItems = [
  { href: '/shop-owner/booths', label: 'Booths & Invites', icon: Store },
  { href: '/shop-owner/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/shop-owner/profile', label: 'Venue Settings', icon: CircleUserRound },
];

export function OwnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <OwnerGuard>
      <div className="relative min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        {/* Shop Owner Header */}
        <header className="sticky top-0 z-20 border-b border-black/5 bg-white/95 px-4 py-2.5 backdrop-blur-md">
          <div className="mx-auto flex max-w-[960px] items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                <Building2 className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Hawker Business App</span>
                <span className="ml-2 text-xs text-[#6e6e73] hidden sm:inline">• Venue Management</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                Shop Owner Portal
              </span>
            </div>
          </div>
        </header>

        <main className="pb-28">{children}</main>

        {/* Shop Owner Bottom Navigation */}
        <nav
          aria-label="Shop Owner Navigation"
          className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-3 pb-3 sm:max-w-[480px] lg:max-w-[720px]"
        >
          <div className="grid grid-cols-3 gap-1 rounded-full bg-white/95 p-1.5 shadow-[0_8px_24px_rgba(17,17,17,0.08)] backdrop-blur-xl border border-black/5">
            {ownerNavItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={label}
                  href={href as any}
                  className={`flex flex-col items-center justify-center rounded-full py-2 transition ${
                    active ? 'bg-blue-600 text-white shadow-sm font-semibold' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
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
    </OwnerGuard>
  );
}
