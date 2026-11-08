'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Download,
  LoaderCircle,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Store,
  Trash2,
  X,
  Building2,
  Check,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { authenticatedFetch, supabase } from '@/lib/supabase/client';
import { buildTableMenuUrl } from '@/lib/customer-table-link';

export type HawkerBooth = {
  id: string;
  name: string;
  isOpen?: boolean;
  isActive?: boolean;
};

export type HawkerShop = {
  id: string;
  name: string;
  slug: string | null;
  address?: string | null;
  role?: string;
  isActive?: boolean;
  booths: HawkerBooth[];
};

export type CalendarOrderItem = {
  id: string;
  dish_name: string;
  quantity: number;
  unit_price?: number;
};

export type CalendarOrder = {
  id: string;
  order_id: string;
  food_outlet_id: string;
  status: string;
  subtotal: number;
  merchant_payout_amount: number;
  created_at: string;
  orders?: {
    table_session_id?: string | null;
  } | null;
  order_items?: CalendarOrderItem[];
};

export type HawkerTable = {
  id: string;
  restaurant_id: string;
  table_number: string;
  created_at: string;
};

type CalendarView = 'day' | 'month' | 'year';

type Props = {
  shop: HawkerShop;
  availableShops?: HawkerShop[];
  initialOrders?: CalendarOrder[];
};

const TIME_ZONE = 'Asia/Kuala_Lumpur';
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, month, 1))),
);

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

export function HawkerCalendar({ shop, availableShops = [], initialOrders = [] }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<CalendarOrder[]>(initialOrders);
  const [isLoading, setIsLoading] = useState(initialOrders.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState(() => getDateKey(new Date()));
  const [selectedBoothId, setSelectedBoothId] = useState<string>('');

  // Table Management & QR State
  const [tables, setTables] = useState<HawkerTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [creatingTable, setCreatingTable] = useState(false);
  const [tableError, setTableError] = useState('');
  const [tableSuccess, setTableSuccess] = useState('');
  const [selectedTableIdForPreview, setSelectedTableIdForPreview] = useState<string>('');
  const printContainerRef = useRef<HTMLDivElement>(null);

  const booths = useMemo(() => shop.booths || [], [shop.booths]);
  const boothMap = useMemo(() => new Map(booths.map((b) => [b.id, b.name])), [booths]);
  const boothIdsSet = useMemo(() => new Set(booths.map((b) => b.id)), [booths]);

  // Fetch orders for this hawker centre
  const fetchOrders = useCallback(async (): Promise<CalendarOrder[]> => {
    const params = new URLSearchParams();
    if (shop.id) params.set('restaurantId', shop.id);
    if (selectedBoothId) params.set('boothId', selectedBoothId);

    const response = await authenticatedFetch(`/api/owner/orders?${params.toString()}`);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      throw new Error(result?.error || 'Unable to load food centre revenue.');
    }
    const result = await response.json();
    const fetchedOrders = Array.isArray(result.orders) ? result.orders : [];

    // Filter to ensure outlet belongs to this shop
    return fetchedOrders.filter((order: CalendarOrder) => {
      if (selectedBoothId) return order.food_outlet_id === selectedBoothId;
      return boothIdsSet.has(order.food_outlet_id);
    });
  }, [shop.id, selectedBoothId, boothIdsSet]);

  // Fetch tables for this hawker centre
  const fetchTables = useCallback(async () => {
    if (!shop.id) return;
    try {
      setTablesLoading(true);
      const res = await authenticatedFetch(`/api/owner/tables?restaurantId=${shop.id}`);
      if (res.ok) {
        const payload = await res.json();
        const loadedTables = Array.isArray(payload.tables) ? payload.tables : [];
        setTables(loadedTables);
        if (loadedTables.length > 0 && !selectedTableIdForPreview) {
          setSelectedTableIdForPreview(loadedTables[0].id);
        }
      }
    } catch {
      // Handled silently
    } finally {
      setTablesLoading(false);
    }
  }, [shop.id, selectedTableIdForPreview]);

  // Initial loads and Realtime subscription
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const orderData = await fetchOrders();
        if (active) {
          setOrders(orderData);
          setError('');
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load food centre revenue.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const timeoutId = window.setTimeout(() => {
      if (active) {
        void load();
        void fetchTables();
      }
    }, 0);

    // Subscribe to realtime merchant_orders changes
    const channel = supabase
      ?.channel(`hawker-calendar-${shop.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'merchant_orders' }, () => {
        void load();
      })
      .subscribe();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, [shop.id, fetchOrders, fetchTables]);

  const refreshRevenue = async () => {
    setIsRefreshing(true);
    try {
      const orderData = await fetchOrders();
      setOrders(orderData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh revenue.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Group revenue by date
  const revenueByDate = useMemo(() => {
    const totals = new Map<string, { revenue: number; orders: number }>();
    for (const order of orders) {
      if (order.status === 'cancelled' || !Number.isFinite(new Date(order.created_at).getTime())) continue;
      const key = getDateKey(new Date(order.created_at), TIME_ZONE);
      const total = totals.get(key) ?? { revenue: 0, orders: 0 };
      total.revenue += Number(order.subtotal ?? order.merchant_payout_amount ?? 0);
      total.orders += 1;
      totals.set(key, total);
    }
    return totals;
  }, [orders]);

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
      setSelectedDate(shiftDate(selectedDate, direction));
    } else if (view === 'month') {
      setSelectedDate(shiftMonth(selectedDate, direction));
    } else {
      setSelectedDate(`${year + direction}-01-01`);
    }
  };

  const heading =
    view === 'year'
      ? String(year)
      : view === 'month'
      ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
      : formatLongDate(selectedDate);

  // Filter orders for the selected date
  const selectedDateOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status !== 'cancelled' &&
        getDateKey(new Date(order.created_at), TIME_ZONE) === selectedDate,
    );
  }, [orders, selectedDate]);

  // Calculate stall breakdown for selected date
  const selectedDateBoothBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; orders: number }>();
    for (const order of selectedDateOrders) {
      const boothName = boothMap.get(order.food_outlet_id) || 'Stall';
      const existing = map.get(order.food_outlet_id) ?? {
        name: boothName,
        revenue: 0,
        orders: 0,
      };
      existing.revenue += Number(order.subtotal ?? order.merchant_payout_amount ?? 0);
      existing.orders += 1;
      map.set(order.food_outlet_id, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [selectedDateOrders, boothMap]);

  // Table Management Handlers
  const handleCreateTable = async (tableNumToCreate?: string) => {
    const tableNum = (tableNumToCreate || newTableNumber).trim();
    if (!tableNum || !shop.id) return;

    setCreatingTable(true);
    setTableError('');
    setTableSuccess('');

    try {
      const res = await authenticatedFetch('/api/owner/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: shop.id,
          tableNumber: tableNum,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to create table');
      }

      const createdTable: HawkerTable = payload.table;
      setTables((prev) => [...prev, createdTable].sort((a, b) => a.table_number.localeCompare(b.table_number, undefined, { numeric: true })));
      setSelectedTableIdForPreview(createdTable.id);
      setNewTableNumber('');
      setTableSuccess(`Table ${createdTable.table_number} created successfully.`);
      setTimeout(() => setTableSuccess(''), 3000);
    } catch (err: any) {
      setTableError(err.message || 'Failed to create table.');
    } finally {
      setCreatingTable(false);
    }
  };

  const handleDeleteTable = async (tableId: string, tableNumber: string) => {
    if (!confirm(`Are you sure you want to delete Table ${tableNumber}?`)) return;

    try {
      const res = await authenticatedFetch(`/api/owner/tables?id=${tableId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete table');

      setTables((prev) => prev.filter((t) => t.id !== tableId));
      if (selectedTableIdForPreview === tableId) {
        setSelectedTableIdForPreview(tables.find((t) => t.id !== tableId)?.id || '');
      }
    } catch {
      alert('Could not delete table. Please try again.');
    }
  };

  // High-Resolution Physical Table Sticker Download
  const downloadTableSticker = (table: HawkerTable) => {
    const svg = document.getElementById(`table-qr-${table.id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 600x780 high density sticker layout for table pasting
    canvas.width = 600;
    canvas.height = 780;

    const img = new Image();
    img.onload = () => {
      // 1. White Background with rounded card border
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Outer decorative rounded stroke
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 6;
      ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

      // 3. Header: Food Hall / Venue Name
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      const venueTitle = (shop.name || 'HAWKER CENTRE').toUpperCase();
      ctx.fillText(venueTitle, canvas.width / 2, 70);

      // 4. Sub-label
      ctx.fillStyle = '#6b7280';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('TABLE ORDERING & PAYMENT', canvas.width / 2, 95);

      // 5. Draw QR code in the center (360x360)
      const qrSize = 360;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 125;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // 6. Pill Badge for Table Number
      const badgeY = 525;
      ctx.fillStyle = '#111827';
      const badgeWidth = 260;
      const badgeHeight = 56;
      const badgeX = (canvas.width - badgeWidth) / 2;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 28);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`TABLE ${table.table_number}`, canvas.width / 2, badgeY + 38);

      // 7. Instructions for Diners
      ctx.fillStyle = '#1f2937';
      ctx.font = '600 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Scan with phone camera to view menu & order', canvas.width / 2, 630);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('No app download required • Pay directly from your seat', canvas.width / 2, 660);

      // 8. Download PNG
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeSlug = (shop.slug || 'hawker').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${safeSlug}-table-${table.table_number}-qr.png`;
      link.href = pngUrl;
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintAll = () => {
    if (!printContainerRef.current) return;
    const printContent = printContainerRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
      <div style="padding: 24px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <h1 style="text-align: center; margin-bottom: 24px; font-size: 24px; font-weight: bold;">
          ${shop.name} - Table QR Stickers
        </h1>
        ${printContent}
      </div>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const previewTable = tables.find((t) => t.id === selectedTableIdForPreview) || tables[0];
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const previewMenuUrl = previewTable && shop.slug
    ? buildTableMenuUrl(origin, shop.slug, previewTable.id)
    : '';

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f] sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Error notification banner */}
        {error && (
          <div role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Main Calendar Section (Identical UI style as Stall App View) */}
        <section className="rounded-[24px] bg-white p-4 sm:p-6 shadow-sm">
          {/* Header Toolbar: Date Navigator + View Mode Selector + Booth Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Period Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Previous period"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#ededf0] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h2 className="min-w-[155px] text-base font-semibold">{heading}</h2>
              <button
                type="button"
                onClick={() => navigate(1)}
                aria-label="Next period"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#ededf0] transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Controls: Stall Filter, Day/Month/Year Switcher, Refresh */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Hawker Centre Switcher if owner manages multiple venues */}
              {availableShops.length > 1 && (
                <div className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-[#6e6e73]" />
                  <select
                    value={shop.slug || shop.id}
                    onChange={(e) => {
                      const targetShop = availableShops.find((s) => (s.slug || s.id) === e.target.value);
                      if (targetShop) {
                        router.push(`/hawker/${encodeURIComponent(targetShop.slug || targetShop.id)}/analytics` as any);
                      }
                    }}
                    className="bg-transparent font-semibold text-[#1d1d1f] cursor-pointer pr-1"
                    aria-label="Switch hawker centre"
                  >
                    {availableShops.map((s) => (
                      <option key={s.id} value={s.slug || s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Stall Focus Filter */}
              <div className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 text-xs">
                <Store className="w-3.5 h-3.5 text-[#6e6e73]" />
                <select
                  value={selectedBoothId}
                  onChange={(e) => setSelectedBoothId(e.target.value)}
                  className="bg-transparent font-semibold text-[#1d1d1f] cursor-pointer pr-1"
                  aria-label="Filter by stall"
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
                    title="Clear stall filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* View Mode Switcher */}
              <div className="flex rounded-full bg-[#f5f5f7] p-1" role="group" aria-label="Calendar view">
                {(['day', 'month', 'year'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setView(option)}
                    aria-pressed={view === option}
                    className={`min-h-9 rounded-full px-2.5 text-[11px] font-semibold capitalize sm:px-3 sm:text-xs transition-all ${
                      view === option ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6e6e73]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => void refreshRevenue()}
                disabled={isLoading || isRefreshing}
                aria-label="Refresh revenue"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ededf0] disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick KPI Stat Ribbon (Same 3 stat cards as Stall App View) */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#f5f5f7] p-3">
              <p className="text-[11px] font-medium text-[#6e6e73]">Selected day revenue</p>
              <p className="mt-1 text-lg font-semibold">{isLoading ? '…' : formatCurrency(selectedRevenue.revenue)}</p>
            </div>
            <div className="rounded-2xl bg-[#f5f5f7] p-3">
              <p className="text-[11px] font-medium text-[#6e6e73]">
                {view === 'year' ? 'Year revenue' : 'Month revenue'}
              </p>
              <p className="mt-1 text-lg font-semibold">
                {isLoading ? '…' : formatCurrency(view === 'year' ? yearRevenue : monthRevenue)}
              </p>
            </div>
            <div className="col-span-2 rounded-2xl bg-[#f5f5f7] p-3 sm:col-span-1">
              <p className="text-[11px] font-medium text-[#6e6e73]">Selected day orders</p>
              <p className="mt-1 text-lg font-semibold">{isLoading ? '…' : selectedRevenue.orders}</p>
            </div>
          </div>

          {/* Month View Grid */}
          {view === 'month' && (
            <div className="mt-5">
              <div className="grid grid-cols-7 border-b border-[#f0f0f2] pb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#86868b] sm:text-xs">
                {WEEKDAYS.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {days.map((dayKey, index) => {
                  if (!dayKey) {
                    return <div key={`empty-${index}`} className="min-h-[76px] border-b border-[#f0f0f2] sm:min-h-24" />;
                  }
                  const stats = revenueByDate.get(dayKey);
                  const isSelected = selectedDate === dayKey;
                  const isToday = getDateKey(new Date()) === dayKey;
                  return (
                    <button
                      key={dayKey}
                      type="button"
                      onClick={() => setSelectedDate(dayKey)}
                      aria-label={`${formatLongDate(dayKey)}, revenue ${formatCurrency(stats?.revenue ?? 0)}`}
                      aria-pressed={isSelected}
                      className={`min-h-[76px] border-b border-[#f0f0f2] p-1.5 text-left transition-colors sm:min-h-24 sm:p-2 ${
                        isSelected ? 'bg-amber-50' : 'hover:bg-[#fafafa]'
                      }`}
                    >
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold ${
                          isSelected
                            ? 'bg-amber-600 text-white'
                            : isToday
                            ? 'bg-[#1d1d1f] text-white'
                            : 'text-[#1d1d1f]'
                        }`}
                      >
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

          {/* Day View Details & Orders Timeline */}
          {view === 'day' && (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-[#f5f5f7] p-4">
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

                {/* Stall Breakdown on this Date */}
                {selectedDateBoothBreakdown.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-black/5">
                    <p className="text-xs font-semibold text-[#86868b] mb-2">Stall Sales on this Date</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedDateBoothBreakdown.map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs">
                          <span className="font-semibold text-[#1d1d1f] truncate pr-2">{item.name}</span>
                          <span className="text-emerald-700 font-semibold shrink-0">
                            {formatCurrency(item.revenue)} ({item.orders})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orders List for this date */}
                {selectedRevenue.orders > 0 && (
                  <div className="mt-4 divide-y divide-black/5 pt-2 border-t border-black/5">
                    <p className="text-xs font-semibold text-[#86868b] mb-2">Order Line Items</p>
                    {selectedDateOrders.map((order) => {
                      const boothName = boothMap.get(order.food_outlet_id) || 'Stall';
                      return (
                        <div key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="truncate font-semibold">
                                #{(order.order_id || order.id).slice(0, 6).toUpperCase()}
                              </p>
                              <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-[#1d1d1f]">
                                {boothName}
                              </span>
                            </div>
                            <p className="text-xs text-[#6e6e73] mt-0.5">
                              {new Date(order.created_at).toLocaleTimeString('en-MY', {
                                timeZone: TIME_ZONE,
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                              {' · '}
                              {order.order_items?.reduce((sum, item) => sum + (item.quantity || 1), 0) ?? 0} items
                            </p>
                          </div>
                          <p className="shrink-0 font-semibold">
                            {formatCurrency(Number(order.subtotal ?? order.merchant_payout_amount ?? 0))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Year View Months Grid */}
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
                      setSelectedDate(monthKey);
                      setView('month');
                    }}
                    className="rounded-2xl bg-[#f5f5f7] p-4 text-left hover:bg-amber-50 transition-colors"
                  >
                    <span className="text-sm font-semibold">{monthName}</span>
                    <span className="mt-2 block text-xs text-[#6e6e73]">Revenue</span>
                    <span className="mt-0.5 block text-base font-semibold text-emerald-700">
                      {formatCurrency(total)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. Table QR Generation & Physical Sticker Download Section */}
        <section className="rounded-[24px] bg-white p-4 sm:p-6 shadow-sm">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#f0f0f2]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-white">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-[#1d1d1f]">
                  Table QR Codes & Physical Stickers
                </h3>
                <p className="text-xs text-[#6e6e73] mt-0.5">
                  Generate table QR codes and download ready-to-paste physical stickers for your dining tables.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {tables.length > 0 && (
                <button
                  type="button"
                  onClick={handlePrintAll}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#f5f5f7] px-4 text-xs font-semibold text-[#1d1d1f] hover:bg-[#ededf0] transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print All QRs</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Add Table Form & Status Messages */}
          <div className="mt-5 space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleCreateTable();
              }}
              className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
            >
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#6e6e73] mb-1">
                  Add Table Number / Label
                </label>
                <input
                  type="text"
                  required
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g. 1, 12, or VIP-1"
                  className="w-full h-10 rounded-xl bg-[#f5f5f7] px-3.5 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={creatingTable || !newTableNumber.trim()}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#111827] px-5 text-xs font-semibold text-white hover:bg-black disabled:opacity-50 transition-colors shrink-0"
              >
                {creatingTable ? (
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate Table QR</span>
                  </>
                )}
              </button>
            </form>

            {tableError && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> {tableError}
              </p>
            )}
            {tableSuccess && (
              <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> {tableSuccess}
              </p>
            )}
          </div>

          {/* Interactive QR Generator & Physical Sticker Preview Card */}
          {tables.length > 0 && previewTable && (
            <div className="mt-6 rounded-2xl bg-[#f5f5f7] p-4 sm:p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Visual Sticker Card (Simulates physical sticker pasted on table) */}
                <div className="w-full max-w-[280px] rounded-2xl bg-white p-5 shadow-md border border-[#e5e7eb] flex flex-col items-center text-center">
                  <p className="text-[11px] font-bold tracking-wider text-[#1d1d1f] uppercase truncate max-w-[240px]">
                    {shop.name}
                  </p>
                  <p className="text-[9px] font-semibold text-[#86868b] tracking-wider uppercase mt-0.5">
                    TABLE ORDERING
                  </p>

                  {/* QR SVG */}
                  <div className="my-3 bg-white p-2 rounded-xl">
                    <QRCodeSVG
                      id={`table-qr-${previewTable.id}`}
                      value={previewMenuUrl}
                      size={150}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Table Badge */}
                  <div className="rounded-full bg-[#111827] px-4 py-1 text-white text-sm font-bold tracking-wide">
                    TABLE {previewTable.table_number}
                  </div>

                  <p className="mt-2 text-[10px] font-medium text-[#6e6e73]">
                    Scan with phone camera to order
                  </p>
                </div>

                {/* Sticker Info & Download Controls */}
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 mb-1">
                      <Check className="w-3 h-3" /> Ready to Paste on Table
                    </div>
                    <h4 className="text-base font-bold text-[#1d1d1f]">
                      Table {previewTable.table_number} Sticker
                    </h4>
                    <p className="text-xs text-[#6e6e73] mt-1">
                      Download this high-resolution QR sticker to print on physical sticker paper. Diners will scan it with their camera to immediately order from all stalls at this table.
                    </p>
                  </div>

                  {/* Table Quick Switcher */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-[#86868b]">Select Table:</span>
                    <select
                      value={selectedTableIdForPreview}
                      onChange={(e) => setSelectedTableIdForPreview(e.target.value)}
                      className="h-8 rounded-lg bg-white px-2.5 text-xs font-semibold text-[#1d1d1f] shadow-sm cursor-pointer"
                    >
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          Table {t.table_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Download Action */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => downloadTableSticker(previewTable)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#111827] px-6 text-xs font-semibold text-white hover:bg-black transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Table QR (PNG)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const win = window.open('', '_blank');
                        if (win) {
                          win.document.write(`
                            <html>
                              <head><title>Print Table ${previewTable.table_number}</title></head>
                              <body style="display:flex; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif;">
                                <div style="text-align:center; padding:30px; border:2px dashed #ccc; border-radius:24px;">
                                  <h2 style="margin:0 0 10px 0;">${shop.name}</h2>
                                  <h1 style="font-size:32px; margin:0 0 15px 0;">TABLE ${previewTable.table_number}</h1>
                                  <div id="print-qr"></div>
                                  <p style="margin-top:15px; font-size:14px; color:#555;">Scan with camera to view menu & order</p>
                                </div>
                                <script>
                                  window.onload = function() {
                                    window.print();
                                    window.close();
                                  };
                                </script>
                              </body>
                            </html>
                          `);
                        }
                      }}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-xs font-semibold text-[#1d1d1f] shadow-sm hover:bg-[#fafafa] transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Single Sticker</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tables Grid List */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
              All Configured Tables ({tables.length})
            </h4>

            {tablesLoading ? (
              <div className="py-8 text-center text-xs text-[#86868b]">Loading tables...</div>
            ) : tables.length === 0 ? (
              <div className="rounded-2xl bg-[#f5f5f7] p-6 text-center text-xs text-[#6e6e73]">
                <QrCode className="w-8 h-8 text-[#86868b] mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-sm text-[#1d1d1f]">No tables registered yet</p>
                <p className="mt-1">Add your dining tables above or click below to generate your initial tables.</p>
                <div className="mt-3 flex justify-center gap-2">
                  {['1', '2', '3', '4', '5'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => void handleCreateTable(num)}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1d1d1f] shadow-sm hover:bg-[#ededf0]"
                    >
                      + Table {num}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {tables.map((table) => {
                  const isSelected = selectedTableIdForPreview === table.id;
                  const menuUrl = shop.slug
                    ? buildTableMenuUrl(origin, shop.slug, table.id)
                    : '';

                  return (
                    <div
                      key={table.id}
                      className={`rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                        isSelected ? 'bg-amber-50 ring-2 ring-amber-500/50' : 'bg-[#f5f5f7] hover:bg-[#ededf0]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-sm text-[#1d1d1f]">Table {table.table_number}</span>
                        <button
                          type="button"
                          onClick={() => void handleDeleteTable(table.id, table.table_number)}
                          className="text-[#86868b] hover:text-rose-600 p-1 rounded-full transition-colors"
                          title="Delete Table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Mini QR code display */}
                      <div
                        onClick={() => setSelectedTableIdForPreview(table.id)}
                        className="my-2 bg-white p-2 rounded-xl flex items-center justify-center cursor-pointer shadow-sm"
                        title="Click to preview & download"
                      >
                        {menuUrl ? (
                          <QRCodeSVG
                            id={`table-qr-${table.id}`}
                            value={menuUrl}
                            size={100}
                            level="H"
                          />
                        ) : (
                          <span className="text-[10px] text-rose-600">Missing slug</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => downloadTableSticker(table)}
                        className="mt-2 w-full h-8 flex items-center justify-center gap-1.5 rounded-full bg-white text-[#1d1d1f] text-[11px] font-semibold shadow-sm hover:bg-neutral-100 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download QR</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Hidden Print Container for Batch Printing */}
        <div className="hidden">
          <div ref={printContainerRef} className="print-grid">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
              {tables.map((table) => {
                const menuUrl = shop.slug ? buildTableMenuUrl(origin, shop.slug, table.id) : '';
                return (
                  <div
                    key={`print-${table.id}`}
                    style={{
                      border: '2px solid #ddd',
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'center',
                      pageBreakInside: 'avoid',
                    }}
                  >
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold' }}>{shop.name}</h3>
                    <div
                      style={{
                        display: 'inline-block',
                        background: '#111827',
                        color: '#fff',
                        padding: '4px 16px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        marginBottom: '16px',
                      }}
                    >
                      TABLE {table.table_number}
                    </div>
                    <div style={{ margin: '10px 0' }}>
                      {menuUrl ? <QRCodeSVG value={menuUrl} size={180} level="H" /> : null}
                    </div>
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#555' }}>
                      Scan with camera to view menu & order
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
