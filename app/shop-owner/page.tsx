'use client';

import Link from 'next/link';
import { BarChart3, Building2, CalendarRange, Store, Users } from 'lucide-react';

const stats = [
  { label: 'Total sales', value: 'RM 4,280', detail: '+12.4% vs last month' },
  { label: 'Total orders', value: '312', detail: '48 today' },
  { label: 'Sales by booth', value: '8 booths', detail: 'Top: Nasi Lemak' },
];

const booths = [
  { name: 'Ah Seng Chicken Rice', sales: 'RM 1,240', orders: '86 orders' },
  { name: 'Penang Corner', sales: 'RM 980', orders: '74 orders' },
  { name: 'Curry House', sales: 'RM 760', orders: '58 orders' },
];

const quickLinks = [
  { label: 'Dashboard', href: '/shop-owner', icon: BarChart3 },
  { label: 'Booths', href: '/shop-owner/booths', icon: Store },
  { label:'Analytics', href:'/shop-owner/analytics', icon: CalendarRange },
  { label: 'Profile', href: '/shop-owner/profile', icon: Building2 },
];

export default function ShopOwnerPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[980px]">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Operations dashboard</h1>
          </div>
        </header>

        <nav className="mt-6 grid gap-3 sm:grid-cols-4">
          {quickLinks.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href as any} className="rounded-[18px] bg-white p-3 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <Icon className="h-5 w-5 text-[#6e6e73]" />
              <p className="mt-3 text-sm font-semibold">{label}</p>
            </Link>
          ))}
        </nav>

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <p className="text-sm text-[#6e6e73]">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{stat.value}</p>
              <p className="mt-1 text-xs text-[#6e6e73]">{stat.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.04em]">Booth performance</h2>
                <p className="mt-1 text-sm text-[#6e6e73]">View sales and order volume across all booths.</p>
              </div>
              <Users className="h-6 w-6 text-[#6e6e73]" />
            </div>
            <div className="mt-5 space-y-3">
              {booths.map((booth) => (
                <div key={booth.name} className="flex items-center justify-between gap-3 rounded-[18px] bg-[#f5f5f7] px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold">{booth.name}</p>
                    <p className="mt-1 text-xs text-[#6e6e73]">{booth.orders}</p>
                  </div>
                  <span className="text-sm font-semibold">{booth.sales}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Next actions</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-[18px] bg-[#f5f5f7] px-3 py-3 text-sm font-medium">View booths</div>
              <div className="rounded-[18px] bg-[#f5f5f7] px-3 py-3 text-sm font-medium">Add booth</div>
              <div className="rounded-[18px] bg-[#f5f5f7] px-3 py-3 text-sm font-medium">Manage booth owners</div>
              <div className="rounded-[18px] bg-[#f5f5f7] px-3 py-3 text-sm font-medium">Sales calendar</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
