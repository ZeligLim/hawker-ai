'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { authenticatedFetch } from '@/lib/supabase/client';

type RevenueEntry = {
  id: string;
  paid_at: string;
  platform_fee_amount: number | null;
  service_fee: number;
  refund_amount: number;
};

type CostEntry = {
  id: string;
  incurred_on: string;
  category: CostCategory;
  vendor: string;
  description: string;
  amount: number;
  currency: string;
};

type CostCategory = 'hosting' | 'infrastructure' | 'software' | 'other';
type DaySummary = { revenue: number; costs: number };

const COST_CATEGORIES: Array<{ value: CostCategory; label: string }> = [
  { value: 'hosting', label: 'Hosting' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'software', label: 'Software' },
  { value: 'other', label: 'Other' },
];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMalaysiaDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function getMonthKey(dateKey: string) { return dateKey.slice(0, 7); }

function monthDates(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const offset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return [...Array.from({ length: offset }, () => ''), ...Array.from({ length }, (_, index) => `${monthKey}-${String(index + 1).padStart(2, '0')}`)];
}

function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function currency(amount: number) {
  return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2 }).format(amount);
}

function compactCurrency(amount: number) {
  if (amount === 0) return '';
  return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', notation: 'compact', maximumFractionDigits: 1 }).format(amount);
}

function fullDate(dateKey: string) {
  return new Intl.DateTimeFormat('en-MY', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(`${dateKey}T12:00:00Z`));
}

function displayMonth(monthKey: string) {
  return new Intl.DateTimeFormat('en-MY', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${monthKey}-01T12:00:00Z`));
}

export function AdminFinancialCalendar() {
  const today = useMemo(() => getMalaysiaDateKey(new Date()), []);
  const [month, setMonth] = useState(() => getMonthKey(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState<CostCategory>('hosting');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const loadMonth = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`/api/admin/financials?month=${month}`);
      const payload = (await response.json()) as { revenueEntries?: RevenueEntry[]; costs?: CostEntry[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'Unable to load financial activity.');
      setRevenueEntries(payload.revenueEntries ?? []);
      setCosts(payload.costs ?? []);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load financial activity.');
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => { void loadMonth(); }, [loadMonth]);

  const daily = useMemo(() => {
    const result = new Map<string, DaySummary>();
    for (const entry of revenueEntries) {
      const dateKey = getMalaysiaDateKey(new Date(entry.paid_at));
      const summary = result.get(dateKey) ?? { revenue: 0, costs: 0 };
      summary.revenue += Math.max(0, Number(entry.platform_fee_amount ?? entry.service_fee ?? 0) - Number(entry.refund_amount ?? 0));
      result.set(dateKey, summary);
    }
    for (const cost of costs) {
      const summary = result.get(cost.incurred_on) ?? { revenue: 0, costs: 0 };
      summary.costs += Number(cost.amount);
      result.set(cost.incurred_on, summary);
    }
    return result;
  }, [revenueEntries, costs]);

  const monthSummary = useMemo(() => Array.from(daily.values()).reduce((total, day) => ({
    revenue: total.revenue + day.revenue,
    costs: total.costs + day.costs,
  }), { revenue: 0, costs: 0 }), [daily]);

  const dates = useMemo(() => monthDates(month), [month]);
  const selectedCosts = costs.filter((cost) => cost.incurred_on === selectedDate);
  const selectedRevenue = revenueEntries
    .filter((entry) => getMalaysiaDateKey(new Date(entry.paid_at)) === selectedDate)
    .reduce((total, entry) => total + Math.max(0, Number(entry.platform_fee_amount ?? entry.service_fee ?? 0) - Number(entry.refund_amount ?? 0)), 0);

  const changeMonth = (delta: number) => {
    const nextMonth = shiftMonth(month, delta);
    setMonth(nextMonth);
    setSelectedDate(`${nextMonth}-01`);
  };

  const addCost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return;
    setIsSaving(true);
    setError('');
    try {
      const response = await authenticatedFetch('/api/admin/financials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incurredOn: selectedDate, category, vendor, description, amount: Number(amount) }),
      });
      const payload = (await response.json()) as { cost?: CostEntry; error?: string };
      if (!response.ok || !payload.cost) throw new Error(payload.error ?? 'Unable to save this cost.');
      setCosts((current) => [...current, payload.cost!]);
      setVendor('');
      setDescription('');
      setAmount('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this cost.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCost = async (costId: string) => {
    try {
      const response = await authenticatedFetch(`/api/admin/financials/${costId}`, { method: 'DELETE' });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? 'Unable to remove this cost.');
        return;
      }
      setCosts((current) => current.filter((cost) => cost.id !== costId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to remove this cost.');
    }
  };

  if (isLoading && revenueEntries.length === 0 && costs.length === 0) {
    return <div className="mx-auto max-w-6xl rounded-[26px] bg-white p-8 text-sm text-[#86868b]">Loading financial calendar…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {error && <div role="alert" className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-[22px] bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-[#6e6e73]">Paid platform revenue</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#1d1d1f]">{currency(monthSummary.revenue)}</p>
          <p className="mt-1 text-[11px] text-[#86868b]">Fees from completed orders with a recorded payment</p>
        </section>
        <section className="rounded-[22px] bg-white p-4 sm:p-5">
          <p className="text-xs font-medium text-[#6e6e73]">Operating costs</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#1d1d1f]">{currency(monthSummary.costs)}</p>
          <p className="mt-1 text-[11px] text-[#86868b]">Hosting, infrastructure, software, and other costs</p>
        </section>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
        <section aria-label="Financial calendar" className="rounded-[26px] bg-white p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#0071e3]" />
              <h1 className="text-base font-semibold tracking-tight text-[#1d1d1f]">{displayMonth(month)}</h1>
              {isLoading && <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[#86868b]" />}
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/[0.07]"><ArrowLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/[0.07]"><ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-semibold text-[#86868b]">
            {WEEKDAYS.map((weekday) => <span key={weekday} className="py-2">{weekday}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {dates.map((dateKey, index) => {
              if (!dateKey) return <div key={`empty-${index}`} className="min-h-[72px] sm:min-h-[88px]" />;
              const summary = daily.get(dateKey) ?? { revenue: 0, costs: 0 };
              const selected = dateKey === selectedDate;
              return (
                <button
                  key={dateKey}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${fullDate(dateKey)}, revenue ${currency(summary.revenue)}, costs ${currency(summary.costs)}`}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`min-h-[72px] min-w-0 rounded-xl p-1.5 text-left transition-colors sm:min-h-[88px] sm:p-2 ${selected ? 'bg-[#1d1d1f] text-white' : 'bg-[#f8f8fa] text-[#1d1d1f] hover:bg-[#f0f0f2]'}`}
                >
                  <span className={`block text-[11px] font-semibold ${selected ? 'text-white' : 'text-[#6e6e73]'}`}>{Number(dateKey.slice(-2))}</span>
                  <span className="mt-1 block truncate text-[9px] font-semibold text-emerald-600 sm:text-[10px]">{compactCurrency(summary.revenue)}</span>
                  <span className={`block truncate text-[9px] font-medium sm:text-[10px] ${selected ? 'text-white/65' : 'text-[#86868b]'}`}>{compactCurrency(summary.costs)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#6e6e73]">
            <span><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />Revenue</span>
            <span><span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#86868b]" />Costs</span>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-[#86868b]">Revenue includes paid platform fees only. Counter-payment orders without a recorded platform payment are excluded.</p>
        </section>

        <aside className="space-y-4">
          <section className="rounded-[26px] bg-white p-5">
            <p className="text-xs font-medium text-[#86868b]">Selected date</p>
            <h2 className="mt-1 text-base font-semibold text-[#1d1d1f]">{fullDate(selectedDate)}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-[#f5f5f7] p-3">
                <p className="text-[10px] text-[#6e6e73]">Revenue</p>
                <p className="mt-1 text-sm font-semibold text-[#1d1d1f]">{currency(selectedRevenue)}</p>
              </div>
              <div className="rounded-2xl bg-[#f5f5f7] p-3">
                <p className="text-[10px] text-[#6e6e73]">Costs</p>
                <p className="mt-1 text-sm font-semibold text-[#1d1d1f]">{currency(selectedCosts.reduce((total, cost) => total + Number(cost.amount), 0))}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {selectedCosts.length === 0 ? <p className="text-xs text-[#86868b]">No costs recorded for this day.</p> : selectedCosts.map((cost) => (
                <div key={cost.id} className="flex items-start justify-between gap-3 rounded-2xl bg-[#f8f8fa] p-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#1d1d1f]">{cost.vendor || COST_CATEGORIES.find((item) => item.value === cost.category)?.label}</p>
                    <p className="mt-0.5 truncate text-[10px] text-[#86868b]">{cost.description || COST_CATEGORIES.find((item) => item.value === cost.category)?.label}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-semibold text-[#1d1d1f]">{currency(Number(cost.amount))}</span>
                    <button type="button" aria-label={`Delete cost ${cost.vendor || cost.category}`} onClick={() => void deleteCost(cost.id)} className="flex h-7 w-7 items-center justify-center rounded-full text-[#86868b] hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <form onSubmit={(event) => void addCost(event)} className="space-y-3 rounded-[26px] bg-white p-5">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#0071e3]" />
              <h2 className="text-sm font-semibold text-[#1d1d1f]">Add a cost</h2>
            </div>
            <label className="block text-xs font-medium text-[#6e6e73]">
              Cost type
              <select value={category} onChange={(event) => setCategory(event.target.value as CostCategory)} className="mt-1.5 w-full px-3 py-2.5 text-sm text-[#1d1d1f]">
                {COST_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-[#6e6e73]">
              Vendor
              <input value={vendor} onChange={(event) => setVendor(event.target.value)} maxLength={120} placeholder="e.g. Vercel" className="mt-1.5 w-full px-3 py-2.5 text-sm text-[#1d1d1f] placeholder:text-[#a1a1a6]" />
            </label>
            <label className="block text-xs font-medium text-[#6e6e73]">
              Description
              <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={300} placeholder="e.g. Monthly hosting" className="mt-1.5 w-full px-3 py-2.5 text-sm text-[#1d1d1f] placeholder:text-[#a1a1a6]" />
            </label>
            <label className="block text-xs font-medium text-[#6e6e73]">
              Amount (MYR)
              <div className="mt-1.5 flex items-center rounded-[14px] bg-[#f5f5f7] px-3">
                <span className="text-sm text-[#86868b]">RM</span>
                <input type="number" required min="0.01" max="100000000" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full bg-transparent px-2 py-2.5 text-sm text-[#1d1d1f]" />
              </div>
            </label>
            <button type="submit" disabled={isSaving} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-4 text-xs font-semibold text-white hover:bg-black disabled:opacity-60">
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Record cost for this day
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
