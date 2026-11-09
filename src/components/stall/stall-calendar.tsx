'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
 ArrowDown,
 CalendarDays,
 Check,
 Clock3,
 RefreshCw,
 X,
} from 'lucide-react';
import { authenticatedFetch, supabase } from '@/lib/supabase/client';
import { CalendarPeriodToolbar } from '@/components/shared/calendar-period-toolbar';
import {
 DEFAULT_OPERATING_SCHEDULE,
 DEFAULT_WEEKLY_SCHEDULE,
 type OperatingSchedule,
 type OperatingScheduleException,
} from '@/lib/schedule/operating-hours';

type CalendarView = 'day' | 'month' | 'year';
type ScheduleMode = 'follow' | 'closed' | 'hours';

type CalendarOrder = {
 id: string;
 order_id: string;
 food_outlet_id: string;
 status: string;
 subtotal: number;
 merchant_payout_amount: number;
 created_at: string;
 order_items?: Array<{ id: string; dish_name: string; quantity: number }>;
};

type Props = {
 boothId: string;
 initialSchedule?: OperatingSchedule | null;
 refreshRoles: () => Promise<void>;
};

const TIME_ZONE = 'Asia/Kuala_Lumpur';
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = Array.from({ length: 12 }, (_, month) =>
 new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, month, 1))),
);
const EMPTY_ORDERS: CalendarOrder[] = [];

function getDateKey(date: Date, timeZone = TIME_ZONE): string {
 const parts = new Intl.DateTimeFormat('en-CA', {
 timeZone,
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
 }).formatToParts(date);
 const value = (type: Intl.DateTimeFormatPartTypes) =>
 parts.find((part) => part.type === type)?.value ?? '';
 return `${value('year')}-${value('month')}-${value('day')}`;
}

function dateForKey(dateKey: string): Date {
 return new Date(`${dateKey}T12:00:00.000Z`);
}

function shiftDate(dateKey: string, days: number): string {
 const date = dateForKey(dateKey);
 date.setUTCDate(date.getUTCDate() + days);
 return date.toISOString().slice(0, 10);
}

function shiftMonth(dateKey: string, months: number): string {
 const date = dateForKey(dateKey);
 date.setUTCDate(1);
 date.setUTCMonth(date.getUTCMonth() + months);
 return date.toISOString().slice(0, 10);
}

function monthDays(dateKey: string): string[] {
 const monthStart = dateForKey(dateKey);
 monthStart.setUTCDate(1);
 const firstWeekday = (monthStart.getUTCDay() + 6) % 7;
 const year = monthStart.getUTCFullYear();
 const month = monthStart.getUTCMonth();
 const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
 return [
 ...Array.from({ length: firstWeekday }, () => ''),
 ...Array.from({ length: daysInMonth }, (_, index) =>
 new Date(Date.UTC(year, month, index + 1)).toISOString().slice(0, 10),
 ),
 ];
}

function formatCurrency(amount: number): string {
 return new Intl.NumberFormat('en-MY', {
 style: 'currency',
 currency: 'MYR',
 minimumFractionDigits: 2,
 }).format(amount);
}

function formatCompactCurrency(amount: number): string {
 return new Intl.NumberFormat('en-MY', {
 style: 'currency',
 currency: 'MYR',
 notation: 'compact',
 maximumFractionDigits: 1,
 }).format(amount);
}

function formatLongDate(dateKey: string): string {
 return new Intl.DateTimeFormat('en-MY', {
 timeZone: 'UTC',
 weekday: 'long',
 day: 'numeric',
 month: 'long',
 year: 'numeric',
 }).format(dateForKey(dateKey));
}

function normalizeSchedule(schedule?: OperatingSchedule | null): OperatingSchedule {
 if (!schedule) return DEFAULT_OPERATING_SCHEDULE;
 return {
 enabled: Boolean(schedule.enabled),
 weekly: { ...DEFAULT_WEEKLY_SCHEDULE, ...schedule.weekly },
 timezone: schedule.timezone || TIME_ZONE,
 exceptions: Array.isArray(schedule.exceptions) ? schedule.exceptions : [],
 };
}

export function StallCalendar({ boothId, initialSchedule, refreshRoles }: Props) {
 const [schedule, setSchedule] = useState(() => normalizeSchedule(initialSchedule));
 const [orders, setOrders] = useState<CalendarOrder[]>(EMPTY_ORDERS);
 const [isLoading, setIsLoading] = useState(true);
 const [isRefreshing, setIsRefreshing] = useState(false);
 const [isSaving, setIsSaving] = useState(false);
 const [error, setError] = useState('');
 const [view, setView] = useState<CalendarView>('month');
 const [selectedDate, setSelectedDate] = useState(() => getDateKey(new Date()));
 const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('follow');
 const [openTime, setOpenTime] = useState('08:00');
 const [closeTime, setCloseTime] = useState('22:00');

 const selectDate = (dateKey: string) => {
 setSelectedDate(dateKey);
 const exception = schedule.exceptions?.find((item) => item.date === dateKey);
 if (exception) {
 setScheduleMode(exception.isOpen ? 'hours' : 'closed');
 setOpenTime(exception.open || '08:00');
 setCloseTime(exception.close || '22:00');
 } else {
 setScheduleMode('follow');
 setOpenTime('08:00');
 setCloseTime('22:00');
 }
 };

 const fetchOrders = useCallback(async (): Promise<CalendarOrder[]> => {
 const response = await authenticatedFetch('/api/owner/orders');
 if (!response.ok) {
 const result = await response.json().catch(() => null);
 throw new Error(result?.error || 'Unable to load stall revenue.');
 }
 const result = await response.json();
 const boothOrders = Array.isArray(result.orders)
 ? result.orders.filter((order: CalendarOrder) => order.food_outlet_id === boothId)
 : [];
 return boothOrders;
 }, [boothId]);

 useEffect(() => {
 let active = true;
 const load = async () => {
 try {
 const boothOrders = await fetchOrders();
 if (active) {
 setOrders(boothOrders);
 setError('');
 }
 } catch (loadError) {
 if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load stall revenue.');
 } finally {
 if (active) setIsLoading(false);
 }
 };

 void load();
 const channel = supabase?.channel(`stall-calendar-${boothId}`)
 .on('postgres_changes', { event: '*', schema: 'public', table: 'merchant_orders' }, () => {
 void load();
 })
 .subscribe();

 return () => {
 active = false;
 if (channel && supabase) void supabase.removeChannel(channel);
 };
 }, [boothId, fetchOrders]);

 const revenueByDate = useMemo(() => {
 const totals = new Map<string, { revenue: number; orders: number }>();
 for (const order of orders) {
 if (order.status === 'cancelled' || !Number.isFinite(new Date(order.created_at).getTime())) continue;
 const key = getDateKey(new Date(order.created_at), schedule.timezone || TIME_ZONE);
 const total = totals.get(key) ?? { revenue: 0, orders: 0 };
 total.revenue += Number(order.subtotal ?? order.merchant_payout_amount ?? 0);
 total.orders += 1;
 totals.set(key, total);
 }
 return totals;
 }, [orders, schedule.timezone]);

 const selectedException = schedule.exceptions?.find((item) => item.date === selectedDate);

 const selectedRevenue = revenueByDate.get(selectedDate) ?? { revenue: 0, orders: 0 };
 const date = dateForKey(selectedDate);
 const year = date.getUTCFullYear();
 const month = date.getUTCMonth();
 const days = monthDays(selectedDate);
 let monthRevenue = 0;
 let yearRevenue = 0;
 const revenueByMonth = new Map<number, number>();
 for (const [key, values] of revenueByDate) {
 const day = dateForKey(key);
 if (day.getUTCFullYear() !== year) continue;
 yearRevenue += values.revenue;
 const monthIndex = day.getUTCMonth();
 revenueByMonth.set(monthIndex, (revenueByMonth.get(monthIndex) ?? 0) + values.revenue);
 if (monthIndex === month) monthRevenue += values.revenue;
 }

 const navigate = (direction: -1 | 1) => {
 if (view === 'day') {
 selectDate(shiftDate(selectedDate, direction));
 } else if (view === 'month') {
 selectDate(shiftMonth(selectedDate, direction));
 } else {
 selectDate(`${year + direction}-01-01`);
 }
 };

 const saveException = async () => {
 const exceptions = (schedule.exceptions ?? []).filter((item) => item.date !== selectedDate);
 if (scheduleMode !== 'follow') {
 const exception: OperatingScheduleException = scheduleMode === 'closed'
 ? { date: selectedDate, isOpen: false }
 : { date: selectedDate, isOpen: true, open: openTime, close: closeTime };
 exceptions.push(exception);
 }
 const nextSchedule = { ...schedule, exceptions };
 setIsSaving(true);
 setError('');
 try {
 const response = await authenticatedFetch(`/api/owner/booths/${boothId}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ schedule: nextSchedule }),
 });
 if (!response.ok) {
 const result = await response.json().catch(() => null);
 throw new Error(result?.error || 'Unable to save the date schedule.');
 }
 setSchedule(nextSchedule);
 await refreshRoles();
 } catch (saveError) {
 setError(saveError instanceof Error ? saveError.message : 'Unable to save the date schedule.');
 } finally {
 setIsSaving(false);
 }
 };

 const refreshRevenue = async () => {
 setIsRefreshing(true);
 try {
 setOrders(await fetchOrders());
 setError('');
 } catch (refreshError) {
 setError(refreshError instanceof Error ? refreshError.message : 'Unable to refresh revenue.');
 } finally {
 setIsRefreshing(false);
 }
 };

 const heading = view === 'year'
 ? String(year)
 : view === 'month'
 ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
 : formatLongDate(selectedDate);

 return (
 <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f] sm:px-6">
 <div className="mx-auto w-full max-w-5xl">
 {error && (
 <div role="alert" className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
 {error}
 </div>
 )}

 <section className="rounded-[24px] bg-white p-4 sm:p-6">
 <CalendarPeriodToolbar
 heading={heading}
 view={view}
 onViewChange={setView}
 onNavigate={navigate}
 onRefresh={() => void refreshRevenue()}
 isLoading={isLoading}
 isRefreshing={isRefreshing}
 refreshLabel="Refresh revenue"
 />

 <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
 <div className="rounded-2xl bg-[#f5f5f7] p-3">
 <p className="text-[11px] font-medium text-[#6e6e73]">Selected day revenue</p>
 <p className="mt-1 text-lg font-semibold">{isLoading ? '…' : formatCurrency(selectedRevenue.revenue)}</p>
 </div>
 <div className="rounded-2xl bg-[#f5f5f7] p-3">
 <p className="text-[11px] font-medium text-[#6e6e73]">{view === 'year' ? 'Year revenue' : 'Month revenue'}</p>
 <p className="mt-1 text-lg font-semibold">{isLoading ? '…' : formatCurrency(view === 'year' ? yearRevenue : monthRevenue)}</p>
 </div>
 <div className="col-span-2 rounded-2xl bg-[#f5f5f7] p-3 sm:col-span-1">
 <p className="text-[11px] font-medium text-[#6e6e73]">Selected day orders</p>
 <p className="mt-1 text-lg font-semibold">{isLoading ? '…' : selectedRevenue.orders}</p>
 </div>
 </div>

 {view === 'month' && (
 <div className="mt-5">
 <div className="grid grid-cols-7 border-b border-[#f0f0f2] pb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#86868b] sm:text-xs">
 {WEEKDAYS.map((day) => <div key={day}>{day}</div>)}
 </div>
 <div className="grid grid-cols-7">
 {days.map((dayKey, index) => {
 if (!dayKey) return <div key={`empty-${index}`} className="min-h-[76px] border-b border-[#f0f0f2] sm:min-h-24" />;
 const stats = revenueByDate.get(dayKey);
 const isSelected = selectedDate === dayKey;
 const isToday = getDateKey(new Date()) === dayKey;
 return (
 <button
 key={dayKey}
 type="button"
 onClick={() => selectDate(dayKey)}
 aria-label={`${formatLongDate(dayKey)}, revenue ${formatCurrency(stats?.revenue ?? 0)}`}
 aria-pressed={isSelected}
 className={`min-h-[76px] border-b border-[#f0f0f2] p-1.5 text-left transition-colors sm:min-h-24 sm:p-2 ${isSelected ? 'bg-amber-50' : 'hover:bg-[#fafafa]'}`}
 >
 <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold ${isSelected ? 'bg-amber-600 text-white' : isToday ? 'bg-[#1d1d1f] text-white' : 'text-[#1d1d1f]'}`}>
 {dateForKey(dayKey).getUTCDate()}
 </span>
 <span
 title={stats ? formatCurrency(stats.revenue) : undefined}
 className="mt-1 block truncate text-[9px] font-semibold text-emerald-700 sm:text-xs"
 >
 {stats ? formatCompactCurrency(stats.revenue) : '—'}
 </span>
 <span className="hidden text-[10px] text-[#86868b] sm:block">
 {stats ? `${stats.orders} ${stats.orders === 1 ? 'order' : 'orders'}` : ''}
 </span>
 </button>
 );
 })}
 </div>
 </div>
 )}

 {view === 'day' && (
 <div className="mt-5 rounded-2xl bg-[#f5f5f7] p-4">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs font-medium text-[#6e6e73]">Revenue on this date</p>
 <p className="mt-1 text-2xl font-semibold">{formatCurrency(selectedRevenue.revenue)}</p>
 </div>
 <div className="text-right">
 <p className="text-xs font-medium text-[#6e6e73]">Orders</p>
 <p className="mt-1 text-2xl font-semibold">{selectedRevenue.orders}</p>
 </div>
 </div>
 {selectedRevenue.orders > 0 && (
 <div className="mt-4 divide-y divide-black/5">
 {orders.filter((order) =>
 order.status !== 'cancelled' &&
 getDateKey(new Date(order.created_at), schedule.timezone || TIME_ZONE) === selectedDate,
 ).map((order) => (
 <div key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
 <div className="min-w-0">
 <p className="truncate font-semibold">#{(order.order_id || order.id).slice(0, 6).toUpperCase()}</p>
 <p className="text-xs text-[#6e6e73]">
 {new Date(order.created_at).toLocaleTimeString('en-MY', { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit' })}
 {' · '}{order.order_items?.reduce((sum, item) => sum + (item.quantity || 1), 0) ?? 0} items
 </p>
 </div>
 <p className="shrink-0 font-semibold">{formatCurrency(Number(order.subtotal ?? order.merchant_payout_amount ?? 0))}</p>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {view === 'year' && (
 <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
 {MONTH_NAMES.map((monthName, monthIndex) => {
 const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
 const total = revenueByMonth.get(monthIndex) ?? 0;
 return (
 <button
 key={monthName}
 type="button"
 onClick={() => {
 selectDate(monthKey);
 setView('month');
 }}
 className="rounded-2xl bg-[#f5f5f7] p-4 text-left hover:bg-amber-50"
 >
 <span className="text-sm font-semibold">{monthName}</span>
 <span className="mt-2 block text-xs text-[#6e6e73]">Revenue</span>
 <span className="mt-0.5 block text-base font-semibold text-emerald-700">{formatCurrency(total)}</span>
 </button>
 );
 })}
 </div>
 )}
 </section>

 <section className="mt-4 rounded-[24px] bg-white p-4 sm:p-6">
 <div className="flex items-start gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
 <CalendarDays className="h-5 w-5" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-medium text-[#6e6e73]">Selected date</p>
 <h3 className="mt-0.5 font-semibold">{formatLongDate(selectedDate)}</h3>
 <p className="mt-1 text-xs text-[#6e6e73]">
 {selectedException?.isOpen === false
 ? 'Scheduled closed all day'
 : selectedException?.isOpen
 ? `Special hours ${selectedException.open}–${selectedException.close}`
 : 'Following regular weekly hours'}
 </p>
 </div>
 </div>

 <div className="mt-4 grid gap-2 sm:grid-cols-3">
 <button
 type="button"
 onClick={() => setScheduleMode('follow')}
 aria-pressed={scheduleMode === 'follow'}
 className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold ${scheduleMode === 'follow' ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`}
 >
 <Clock3 className="h-4 w-4" />
 Regular hours
 </button>
 <button
 type="button"
 onClick={() => setScheduleMode('closed')}
 aria-pressed={scheduleMode === 'closed'}
 className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold ${scheduleMode === 'closed' ? 'bg-rose-600 text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`}
 >
 <X className="h-4 w-4" />
 Close all day
 </button>
 <button
 type="button"
 onClick={() => setScheduleMode('hours')}
 aria-pressed={scheduleMode === 'hours'}
 className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold ${scheduleMode === 'hours' ? 'bg-emerald-700 text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`}
 >
 <Check className="h-4 w-4" />
 Set special hours
 </button>
 </div>

 {scheduleMode === 'hours' && (
 <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-[#f5f5f7] p-3">
 <label className="flex items-center gap-2 text-xs font-medium">
 Opens
 <input
 type="time"
 value={openTime}
 onChange={(event) => setOpenTime(event.target.value)}
 className="rounded-lg bg-white px-3 py-2 font-mono"
 />
 </label>
 <label className="flex items-center gap-2 text-xs font-medium">
 Closes
 <input
 type="time"
 value={closeTime}
 onChange={(event) => setCloseTime(event.target.value)}
 className="rounded-lg bg-white px-3 py-2 font-mono"
 />
 </label>
 </div>
 )}

 <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
 <p className="text-[11px] text-[#86868b]">
 Date-specific hours override the weekly schedule for this date only.
 </p>
 <button
 type="button"
 onClick={() => void saveException()}
 disabled={isSaving}
 className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-5 text-xs font-semibold text-white disabled:opacity-50"
 >
 {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowDown className="h-4 w-4" />}
 {isSaving ? 'Saving…' : 'Save date hours'}
 </button>
 </div>
 </section>
 </div>
 </main>
 );
}
