'use client';

import { useMemo, useState } from 'react';

const periods = [
  { id: 'd', label: 'Day', multiplier: 0.28 },
  { id: 'w', label: 'Week', multiplier: 1 },
  { id: 'm', label: 'Month', multiplier: 4.4 },
  { id: 'y', label: 'Year', multiplier: 52.8 },
] as const;

const boothData = [
  { name: 'Ah Seng Chicken Rice', orders: 384, revenue: 4280 },
  { name: 'Penang Corner', orders: 296, revenue: 3510 },
  { name: 'Curry House', orders: 218, revenue: 2740 },
  { name: 'Green Garden Vegetarian', orders: 257, revenue: 2980 },
];

export default function ShopOwnerAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<(typeof periods)[number]['id']>('w');

  const performance = useMemo(() => {
    const multiplier = periods.find((period) => period.id === selectedPeriod)?.multiplier ?? 1;

    return boothData.map((booth) => ({
      ...booth,
      periodOrders: Math.round(booth.orders * multiplier),
      periodRevenue: booth.revenue * multiplier,
    }));
  }, [selectedPeriod]);

  const totalRevenue = performance.reduce((sum, booth) => sum + booth.periodRevenue, 0);
  const totalOrders = performance.reduce((sum, booth) => sum + booth.periodOrders, 0);
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const maxRevenue = Math.max(...performance.map((booth) => booth.periodRevenue), 1);

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[980px]">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Analytics</h1>
          </div>
        </header>

        <section className="mt-6 rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex self-start rounded-full bg-[#f5f5f7] p-1">
              {periods.map((period) => (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`min-w-[44px] rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${selectedPeriod === period.id ? 'bg-[#111827] text-white' : 'text-[#6e6e73]'}`}
                >
                  {period.id}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[20px] bg-[#111827] p-4 text-white">
              <p className="text-xs uppercase tracking-[0.12em] text-white/65">Total revenue</p>
              <p className="mt-2 text-2xl font-semibold">RM {totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="rounded-[20px] bg-[#f5f5f7] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#6e6e73]">Orders</p>
              <p className="mt-2 text-2xl font-semibold">{totalOrders.toLocaleString()}</p>
            </div>
            <div className="rounded-[20px] bg-[#f5f5f7] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-[#6e6e73]">Avg. ticket</p>
              <p className="mt-2 text-2xl font-semibold">RM {averageTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[20px] bg-[#f5f5f7] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Booth performance</h2>
                <p className="mt-1 text-sm text-[#6e6e73]">Performance across all booths during the selected period.</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {performance.map((booth) => (
                <div key={booth.name}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{booth.name}</p>
                      <p className="mt-1 text-xs text-[#6e6e73]">{booth.periodOrders} orders</p>
                    </div>
                    <p className="font-semibold">RM {booth.periodRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-[#111827]"
                      style={{ width: `${(booth.periodRevenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
