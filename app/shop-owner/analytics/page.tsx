'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Award,
  BarChart3,
  Building2,
  ChevronRight,
  Coins,
  LoaderCircle,
  PieChart,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const periods = [
  { id: 'd', label: 'Day', description: 'Past 24 hours' },
  { id: 'w', label: 'Week', description: 'Past 7 days' },
  { id: 'm', label: 'Month', description: 'Past 30 days' },
  { id: 'y', label: 'Year', description: 'Past 365 days' },
] as const;

type BoothMetric = {
  id: string;
  name: string;
  periodOrders: number;
  periodRevenue: number;
};

type AnalyticsPayload = {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  maxRevenue: number;
  booths: BoothMetric[];
  activeBoothCount?: number;
  totalBooths?: number;
  platformFee?: number;
  merchantPayout?: number;
};

const rankMedalStyles = [
  'bg-amber-100 text-amber-900 border border-amber-200',
  'bg-slate-200 text-slate-800 border border-slate-300',
  'bg-orange-100 text-orange-900 border border-orange-200',
];

const colorPalette = [
  'bg-[#111827]',
  'bg-emerald-600',
  'bg-blue-600',
  'bg-amber-500',
  'bg-purple-600',
  'bg-rose-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export default function ShopOwnerAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<(typeof periods)[number]['id']>('w');
  const [showAllBooths, setShowAllBooths] = useState(false);
  const [data, setData] = useState<AnalyticsPayload>({
    totalRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
    maxRevenue: 1,
    booths: [],
    activeBoothCount: 0,
    totalBooths: 0,
    platformFee: 0,
    merchantPayout: 0,
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
          const payload = (await res.json()) as AnalyticsPayload;
          if (active) {
            setData(payload);
          }
        }
      } catch {
        // Handled silently
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadAnalytics();
    return () => {
      active = false;
    };
  }, [selectedPeriod]);

  const {
    totalRevenue,
    totalOrders,
    averageTicket,
    maxRevenue,
    booths,
    activeBoothCount = booths.filter((b) => b.periodOrders > 0).length,
    totalBooths = booths.length,
    platformFee = totalRevenue * 0.02 + totalOrders * 0.5,
    merchantPayout = Math.max(0, totalRevenue - platformFee),
  } = data;

  const averageBoothRevenue = totalBooths > 0 ? totalRevenue / totalBooths : 0;
  const topBooth = booths[0];
  const activePeriodMeta = periods.find((p) => p.id === selectedPeriod);
  const displayedBooths = showAllBooths ? booths : booths.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 sm:px-6 text-[#1d1d1f]">
      <div className="mx-auto max-w-7xl">
        {/* Top Header & Timeframe Switcher */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#1d1d1f] mb-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Real-Time Business Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
              Venue Analytics
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6e6e73]">
              {activePeriodMeta?.description} &bull; Cross-stall volume, order frequency, and settlement estimates.
            </p>
          </div>

          {/* Timeframe Segmented Switcher */}
          <div className="inline-flex items-center self-start sm:self-auto rounded-full bg-white p-1 border border-black/[0.06] shadow-xs">
            {periods.map((period) => {
              const active = selectedPeriod === period.id;
              return (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`min-h-[34px] min-w-[56px] rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                  aria-pressed={active}
                >
                  {period.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Widescreen KPI Ribbon: 2 cols on mobile, 3 on md, 5 on lg/xl */}
        <section className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="rounded-[22px] bg-white p-4 sm:p-5 border border-black/[0.04] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-medium">Gross Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                RM {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
              <p className="mt-0.5 text-[11px] text-[#86868b]">Non-cancelled orders</p>
            </div>
          </div>

          <div className="rounded-[22px] bg-white p-4 sm:p-5 border border-black/[0.04] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-medium">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-[#111827]" />
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                {totalOrders.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[11px] text-[#86868b]">Completed kitchen tickets</p>
            </div>
          </div>

          <div className="rounded-[22px] bg-white p-4 sm:p-5 border border-black/[0.04] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-medium">Average Ticket</span>
              <Receipt className="w-4 h-4 text-[#111827]" />
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                RM {averageTicket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="mt-0.5 text-[11px] text-[#86868b]">Average spend per customer</p>
            </div>
          </div>

          <div className="rounded-[22px] bg-white p-4 sm:p-5 border border-black/[0.04] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-medium">Active Stalls</span>
              <Store className="w-4 h-4 text-[#111827]" />
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                {activeBoothCount} <span className="text-xs font-normal text-[#86868b]">/ {totalBooths}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-[#86868b]">Operating with orders</p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 lg:col-span-1 rounded-[22px] bg-white p-4 sm:p-5 border border-black/[0.04] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-medium">Stall Avg. Sales</span>
              <Coins className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                RM {averageBoothRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <p className="mt-0.5 text-[11px] text-[#86868b]">Per provisioned stall</p>
            </div>
          </div>
        </section>

        {/* Widescreen Multi-Column Content Area */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Left Column (8 cols): Stall Leaderboard & Trading Breakdown */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-[26px] bg-white p-5 sm:p-6 border border-black/[0.04] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-[#1d1d1f]">
                    Stall Performance Leaderboard
                  </h2>
                  <p className="text-xs text-[#6e6e73] mt-0.5">
                    Individual stall sales, order volume, and venue revenue contribution.
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#86868b]">
                  {booths.length} configured stalls
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center p-12 text-xs text-[#86868b]">
                  <LoaderCircle className="w-4 h-4 animate-spin mr-2 text-[#111827]" />
                  Loading performance data…
                </div>
              ) : booths.length === 0 ? (
                <div className="rounded-2xl bg-[#f5f5f7] p-8 text-center text-xs text-[#6e6e73]">
                  <Store className="w-8 h-8 text-[#86868b] mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-sm text-[#1d1d1f]">No booth orders yet</p>
                  <p className="mt-1">
                    When customers place orders at your food hall stalls, live analytics will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {displayedBooths.map((booth, index) => {
                      const sharePct = totalRevenue > 0 ? (booth.periodRevenue / totalRevenue) * 100 : 0;
                      const relativeWidth = maxRevenue > 0 ? (booth.periodRevenue / maxRevenue) * 100 : 0;
                      const stallAvgTicket =
                        booth.periodOrders > 0 ? booth.periodRevenue / booth.periodOrders : 0;
                      const medalClass = rankMedalStyles[index] ?? 'bg-black/5 text-[#1d1d1f] border border-black/5';

                      return (
                        <div
                          key={booth.id || booth.name}
                          className="flex flex-col justify-between rounded-2xl bg-[#f5f5f7]/70 border border-black/[0.04] p-3.5 sm:p-4 transition-all hover:bg-[#f5f5f7] hover:shadow-2xs"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span
                                  className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-xl text-xs font-bold shrink-0 ${medalClass}`}
                                >
                                  {index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '3' : index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs sm:text-sm font-semibold text-[#1d1d1f] truncate" title={booth.name}>
                                    {booth.name}
                                  </p>
                                  <p className="text-[10px] sm:text-[11px] text-[#6e6e73] truncate">
                                    {booth.periodOrders.toLocaleString()} orders &bull; Avg. RM{' '}
                                    {stallAvgTicket.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-[#1d1d1f] shrink-0">
                                {sharePct.toFixed(1)}%
                              </span>
                            </div>

                            <div className="mt-3 flex items-baseline justify-between border-t border-black/[0.03] pt-2">
                              <span className="text-[10px] sm:text-[11px] font-medium text-[#86868b]">Period Revenue</span>
                              <span className="text-sm sm:text-base font-semibold text-[#1d1d1f]">
                                RM {booth.periodRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Relative Volume Progress Bar */}
                          <div className="mt-3 h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-black/5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                index === 0
                                  ? 'bg-[#111827]'
                                  : index === 1
                                  ? 'bg-emerald-600'
                                  : 'bg-[#6e6e73]'
                              }`}
                              style={{ width: `${Math.max(relativeWidth, 2)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {booths.length > 6 && (
                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShowAllBooths((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-black/5 hover:bg-black/10 px-4 py-2 text-xs font-semibold text-[#1d1d1f] transition-all"
                      >
                        {showAllBooths ? 'Collapse to Top 6 (2-3 Rows)' : `View All ${booths.length} Stalls`}
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showAllBooths ? '-rotate-90' : 'rotate-90'}`} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Trading Velocity & Benchmarks */}
            <div className="rounded-[26px] bg-white p-5 sm:p-6 border border-black/[0.04] shadow-xs">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#1d1d1f] mb-4">
                Operational Insights & Velocity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#f5f5f7] p-3.5 border border-black/[0.02]">
                  <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Top Earner</p>
                  <p className="mt-1 text-sm font-semibold text-[#1d1d1f] truncate">
                    {topBooth?.name ?? '—'}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    {topBooth && totalRevenue > 0
                      ? `${((topBooth.periodRevenue / totalRevenue) * 100).toFixed(1)}% venue volume`
                      : 'No trading activity'}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f5f5f7] p-3.5 border border-black/[0.02]">
                  <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Occupancy Rate</p>
                  <p className="mt-1 text-sm font-semibold text-[#1d1d1f]">
                    {totalBooths > 0 ? `${((activeBoothCount / totalBooths) * 100).toFixed(0)}%` : '0%'}
                  </p>
                  <p className="text-[11px] text-[#6e6e73] mt-0.5">
                    {activeBoothCount} of {totalBooths} stalls active
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f5f5f7] p-3.5 border border-black/[0.02]">
                  <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Avg. Stall Velocity</p>
                  <p className="mt-1 text-sm font-semibold text-[#1d1d1f]">
                    {activeBoothCount > 0 ? (totalOrders / activeBoothCount).toFixed(1) : 0} orders
                  </p>
                  <p className="text-[11px] text-[#6e6e73] mt-0.5">Per active stall</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Market Share, Settlements & Fast Actions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Visual Revenue Share Breakdown */}
            <div className="rounded-[26px] bg-white p-5 sm:p-6 border border-black/[0.04] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#1d1d1f]">
                  Revenue Share
                </h2>
                <PieChart className="w-4 h-4 text-[#86868b]" />
              </div>

              {totalRevenue === 0 ? (
                <p className="text-xs text-[#86868b] italic py-2">
                  No sales recorded for this timeframe.
                </p>
              ) : (
                <>
                  {/* Segmented Bar Chart */}
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-black/5 gap-0.5">
                    {booths.slice(0, 6).map((booth, idx) => {
                      const pct = (booth.periodRevenue / totalRevenue) * 100;
                      if (pct <= 0) return null;
                      return (
                        <div
                          key={booth.id || booth.name}
                          className={`h-full ${colorPalette[idx % colorPalette.length]} transition-all`}
                          style={{ width: `${pct}%` }}
                          title={`${booth.name}: ${pct.toFixed(1)}%`}
                        />
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 space-y-2">
                    {booths.slice(0, 5).map((booth, idx) => {
                      const pct = totalRevenue > 0 ? (booth.periodRevenue / totalRevenue) * 100 : 0;
                      return (
                        <div key={booth.id || booth.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                colorPalette[idx % colorPalette.length]
                              }`}
                            />
                            <span className="truncate font-medium text-[#1d1d1f]">{booth.name}</span>
                          </div>
                          <span className="font-semibold text-[#1d1d1f] shrink-0">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Platform Economics & Disbursements Card */}
            <div className="rounded-[26px] bg-white p-5 sm:p-6 border border-black/[0.04] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#1d1d1f]">
                  Disbursements & Fees
                </h2>
                <Coins className="w-4 h-4 text-[#86868b]" />
              </div>
              <p className="text-xs text-[#6e6e73]">
                Estimated breakdown for merchant payouts and platform cut.
              </p>

              <div className="mt-4 space-y-3 border-t border-black/[0.04] pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6e6e73]">Gross Transactions</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    RM {totalRevenue.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6e6e73]">Merchant Direct Payouts</span>
                  <span className="font-semibold text-emerald-700">
                    RM {merchantPayout.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6e6e73]">Platform Infrastructure Cut</span>
                  <span className="font-semibold text-[#1d1d1f]">
                    RM {platformFee.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-[#f5f5f7] p-3 text-[11px] text-[#6e6e73] leading-relaxed">
                Zero monthly subscriptions. The platform only takes a nominal fee per processed transaction.
              </div>
            </div>

            {/* Fast Management Actions */}
            <div className="rounded-[26px] bg-[#111827] text-white p-5 sm:p-6 shadow-xs">
              <h2 className="text-base font-semibold tracking-tight text-white">
                Food Hall Actions
              </h2>
              <p className="mt-1 text-xs text-white/70">
                Quick operational links to scale your venue.
              </p>

              <div className="mt-4 space-y-2">
                <Link
                  href={'/shop-owner/booths' as any}
                  className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all"
                >
                  <span className="inline-flex items-center gap-2">
                    <Store className="w-3.5 h-3.5" />
                    Manage Booth Slots
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                </Link>

                <Link
                  href={'/shop-owner' as any}
                  className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all"
                >
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    Venue Overview
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
