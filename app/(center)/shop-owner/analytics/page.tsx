'use client';

import { FocusedStallBanner } from '@/components/analytics/focused-stall-banner';
import { KpiRibbon } from '@/components/analytics/kpi-ribbon';
import { StallLeaderboard } from '@/components/analytics/stall-leaderboard';
import { RevenueShare } from '@/components/analytics/revenue-share';
import { OperationalInsights } from '@/components/analytics/operational-insights';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
 X,
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
 'bg-amber-100 text-amber-900 ',
 'bg-slate-200 text-slate-800 ',
 'bg-orange-100 text-orange-900 ',
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

function ShopOwnerAnalyticsContent() {
 const searchParams = useSearchParams();
 const paramBoothId = searchParams.get('boothId') || '';
 const [selectedPeriod, setSelectedPeriod] = useState<(typeof periods)[number]['id']>('w');
 const [userSelectedBoothId, setUserSelectedBoothId] = useState<string | null>(null);
 const selectedBoothId = userSelectedBoothId !== null ? userSelectedBoothId : paramBoothId;
 const setSelectedBoothId = (id: string) => setUserSelectedBoothId(id);
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
 const selectedBooth = booths.find((b) => b.id === selectedBoothId);
 const selectedBoothIndex = booths.findIndex((b) => b.id === selectedBoothId);
 const displayedBooths = showAllBooths ? booths : booths.slice(0, 6);

 return (
 <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 sm:px-6 text-[#1d1d1f]">
 <div className="mx-auto max-w-7xl">
 {/* Top Header & Timeframe Switcher */}
 <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
 <div>
 
 
 
 </div>

 <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
 {/* Stall Focus Filter */}
 <div className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-3.5 shadow-xs text-xs">
 <Store className="w-3.5 h-3.5 text-[#6e6e73]" />
 <select
 value={selectedBoothId}
 onChange={(e) => setSelectedBoothId(e.target.value)}
 className="bg-transparent font-semibold text-[#1d1d1f] outline-none cursor-pointer pr-1"
 aria-label="Filter by booth"
 >
 <option value="">All Stalls ({booths.length})</option>
 {booths.map((b) => (
 <option key={b.id} value={b.id}>
 {b.name}
 </option>
 ))}
 </select>
 {selectedBoothId && (
 <button
 type="button"
 onClick={() => setSelectedBoothId('')}
 className="text-[#86868b] hover:text-[#1d1d1f] ml-0.5 p-0.5 rounded-full"
 title="Clear booth filter"
 >
 <X className="w-3 h-3" />
 </button>
 )}
 </div>

 {/* Timeframe Segmented Switcher */}
 <div className="inline-flex items-center rounded-full bg-white p-1 shadow-xs">
 {periods.map((period) => {
 const active = selectedPeriod === period.id;
 return (
 <button
 key={period.id}
 type="button"
 onClick={() => setSelectedPeriod(period.id)}
 className={`min-h-[34px] min-w-[56px] rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
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
 </div>
 </header>

 
 <FocusedStallBanner
 selectedBooth={selectedBooth}
 selectedBoothIndex={selectedBoothIndex}
 totalBooths={booths.length}
 activePeriodDescription={activePeriodMeta?.description ?? ''}
 totalRevenue={totalRevenue}
 totalOrders={totalOrders}
 onClear={() => setSelectedBoothId('')}
 />

 <KpiRibbon
 totalRevenue={totalRevenue}
 totalOrders={totalOrders}
 averageTicket={averageTicket}
 activeBoothCount={activeBoothCount}
 averageStallRevenue={averageBoothRevenue}
 />
<section className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* Main Left Column */}
 <div className="lg:col-span-8 space-y-6">
 <StallLeaderboard
 booths={booths}
 loading={loading}
 selectedBoothId={selectedBoothId}
 setSelectedBoothId={setSelectedBoothId}
 totalRevenue={totalRevenue}
 />
 <OperationalInsights
 topBooth={topBooth}
 totalRevenue={totalRevenue}
 activeBoothCount={activeBoothCount}
 totalBooths={totalBooths}
 totalOrders={totalOrders}
 />
 </div>

 {/* Right Column */}
 <div className="lg:col-span-4 space-y-6">
 <RevenueShare totalRevenue={totalRevenue} booths={booths} />
 </div>
</section>
 </div>
 </main>
 );
}

export default function ShopOwnerAnalyticsPage() {
 return (
 <Suspense
 fallback={
 <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 sm:px-6 text-[#1d1d1f]">
 <div className="mx-auto max-w-7xl flex items-center justify-center min-h-[50vh] text-xs text-[#6e6e73]">
 <LoaderCircle className="h-5 w-5 mr-2 text-[#111827]" />
 Loading analytics...
 </div>
 </main>
 }
 >
 <ShopOwnerAnalyticsContent />
 </Suspense>
 );
}
