'use client';

import { useMemo, useState } from 'react';
import { ShopOwnerNav } from '@/components/shop-owner-nav';
import { booths } from '@/lib/shop-owner-data';

const periods = [
  { label: 'Last 7 days', multiplier: 0.24 },
  { label: 'Last 30 days', multiplier: 1 },
  { label: 'Last 90 days', multiplier: 2.72 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(periods[1].label);
  const selectedPeriod = periods.find((item) => item.label === period) ?? periods[1];
  const performance = useMemo(() => booths.map((booth) => ({
    ...booth,
    periodOrders: Math.round(booth.orders * selectedPeriod.multiplier),
    periodRevenue: booth.revenue * selectedPeriod.multiplier,
  })), [selectedPeriod]);
  const totalRevenue = performance.reduce((sum, booth) => sum + booth.periodRevenue, 0);
  const totalOrders = performance.reduce((sum, booth) => sum + booth.periodOrders, 0);
  const maxRevenue = Math.max(...performance.map((booth) => booth.periodRevenue));

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-6 text-[#1d1d1f]">
      <div className="mx-auto max-w-[960px]">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">Shop owner</p><h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em]">Analytics</h1><p className="mt-2 text-sm text-[#6e6e73]">Compare performance across all your booths.</p></div>
          <label className="text-sm font-medium">Time period<select value={period} onChange={(event) => setPeriod(event.target.value)} className="ml-2 rounded-full border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium outline-none"><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option></select></label>
        </header>
        <ShopOwnerNav active="analytics" />
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[20px] bg-[#111827] p-4 text-white"><p className="text-xs text-white/65">Total revenue</p><p className="mt-2 text-2xl font-semibold">RM {totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
          <div className="rounded-[20px] bg-white p-4"><p className="text-xs text-[#6e6e73]">Total orders</p><p className="mt-2 text-2xl font-semibold">{totalOrders.toLocaleString()}</p></div>
          <div className="rounded-[20px] bg-white p-4"><p className="text-xs text-[#6e6e73]">Best performing booth</p><p className="mt-2 text-lg font-semibold">{performance[0].name}</p></div>
        </section>
        <section className="mt-5 rounded-[22px] bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold">Booth performance</h2>
          <p className="mt-1 text-sm text-[#6e6e73]">Revenue and orders for every booth during {period.toLowerCase()}.</p>
          <div className="mt-5 space-y-5">{performance.map((booth) => <div key={booth.id}><div className="flex items-end justify-between gap-3"><div><p className="font-semibold">{booth.name}</p><p className="mt-1 text-xs text-[#6e6e73]">{booth.periodOrders} orders</p></div><p className="font-semibold">RM {booth.periodRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f1f5f9]"><div className="h-full rounded-full bg-[#111827]" style={{ width: `${(booth.periodRevenue / maxRevenue) * 100}%` }} /></div></div>)}</div>
        </section>
      </div>
    </main>
  );
}
