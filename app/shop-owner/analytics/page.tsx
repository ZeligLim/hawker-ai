'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const periods = [
  { id: 'd', label: 'Day' },
  { id: 'w', label: 'Week' },
  { id: 'm', label: 'Month' },
  { id: 'y', label: 'Year' },
] as const;

export default function ShopOwnerAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<(typeof periods)[number]['id']>('w');
  const [data, setData] = useState<{
    totalRevenue: number;
    totalOrders: number;
    averageTicket: number;
    maxRevenue: number;
    booths: Array<{ id: string; name: string; periodOrders: number; periodRevenue: number }>;
  }>({
    totalRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
    maxRevenue: 1,
    booths: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const token = (await supabase?.auth.getSession())?.data.session?.access_token;
        const res = await fetch(`/api/owner/analytics?period=${selectedPeriod}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const payload = await res.json();
          if (active) {
            setData(payload);
          }
        }
      } catch {
        // error handling
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadAnalytics();
    return () => {
      active = false;
    };
  }, [selectedPeriod]);

  const { totalRevenue, totalOrders, averageTicket, maxRevenue, booths } = data;

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
              {booths.length === 0 ? (
                <p className="text-xs text-[#6e6e73]">No orders recorded during this period.</p>
              ) : booths.map((booth) => (
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
