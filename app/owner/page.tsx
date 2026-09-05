'use client';

import Link from 'next/link';
import { ClipboardList, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

const stats = [
  { label: "Today's orders", value: '12', detail: '+3 from yesterday' },
  { label: "Today's sales", value: 'RM 248', detail: 'Average order RM 20.67' },
  { label: 'Menu items', value: '24', detail: '3 currently unavailable' },
];

export default function OwnerDashboardPage() {
  const { profile } = useAuth();

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-8 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[960px]">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em]">Good evening{profile?.displayName ? `, ${profile.displayName}` : ''}</h1>
          </div>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <p className="text-sm text-[#6e6e73]">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{stat.value}</p>
              <p className="mt-1 text-xs text-[#6e6e73]">{stat.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.04em]">Manage your stall</h2>
                <p className="mt-1 text-sm text-[#6e6e73]">Keep orders moving and your menu up to date.</p>
              </div>
              <UtensilsCrossed className="h-6 w-6 text-[#6e6e73]" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link href={'/owner/orders' as any} className="rounded-[18px] bg-[#111827] px-4 py-4 text-white">
                <ClipboardList className="h-5 w-5" />
                <p className="mt-3 text-sm font-semibold">View orders</p>
                <p className="mt-1 text-xs text-white/70">3 orders need attention</p>
              </Link>
              <Link href={'/owner/menu' as any} className="rounded-[18px] bg-[#f5f5f7] px-4 py-4 text-[#1d1d1f]">
                <UtensilsCrossed className="h-5 w-5" />
                <p className="mt-3 text-sm font-semibold">Manage menu</p>
                <p className="mt-1 text-xs text-[#6e6e73]">Edit dishes and availability</p>
              </Link>
            </div>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Order activity</h2>
            <div className="mt-4 space-y-3">
              {['Order #1042 · Preparing', 'Order #1041 · Ready', 'Order #1040 · Completed'].map((item, index) => (
                <div key={item} className="flex items-center justify-between gap-3 rounded-[16px] bg-[#f5f5f7] px-3 py-3">
                  <span className="text-sm font-medium">{item}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
