'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Camera,
  ArrowRight,
  Store,
  Clock,
  Search,
  X,
  Sparkles,
  ChevronRight,
  Utensils,
  MapPin,
} from 'lucide-react';
import { useCartItems } from '@/lib/order/cart';
import type { HawkerCentreSummary } from '@/lib/hawker-centres/service';
import {
  clearTableSession,
  formatTableLabel,
  getStoredTableSession,
  type CurrentTableSession,
} from '@/lib/table-session';

export type StallDirectoryItem = {
  id: string;
  name: string;
  slug: string;
  restaurantName: string;
  description: string;
  eta: string;
  busy: 'Open' | 'Busy' | 'Moderate' | 'Closed' | 'Prep Shift';
  dishCount: number;
  isOpen: boolean;
};

function CustomerStallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCentreParam = searchParams.get('centre') || searchParams.get('slug') || '';

  const [centres, setCentres] = useState<HawkerCentreSummary[]>([]);
  const [activeCentre, setActiveCentre] = useState<HawkerCentreSummary | null>(null);
  const [tableSession, setTableSession] = useState<CurrentTableSession | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'open' | 'fast'>('all');
  const [stalls, setStalls] = useState<StallDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { cartItems } = useCartItems();

  // 1. Check stored table session on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = getStoredTableSession();
      if (stored && stored.tableNumber) {
        setTableSession(stored);
      }
      setHasCheckedSession(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 2. Fetch hawker centres to identify target centre
  useEffect(() => {
    let active = true;
    const loadCentres = async () => {
      try {
        const res = await fetch('/api/hawker-centres');
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !Array.isArray(data.hawkerCentres)) return;

        setCentres(data.hawkerCentres);

        const targetSlug = (rawCentreParam || tableSession?.centreSlug || '').toLowerCase();
        let matched = data.hawkerCentres.find(
          (c: HawkerCentreSummary) =>
            c.slug.toLowerCase() === targetSlug ||
            c.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(targetSlug.replace(/[^a-z0-9]/g, ''))
        );

        if (!matched && data.hawkerCentres.length > 0) {
          matched = data.hawkerCentres[0];
        }

        if (matched) {
          setActiveCentre(matched);
        }
      } catch (err) {
        console.error('Failed to load hawker centres:', err);
      }
    };

    void loadCentres();
    return () => {
      active = false;
    };
  }, [rawCentreParam, tableSession?.centreSlug]);

  // 3. Load stalls from /api/outlets
  useEffect(() => {
    let active = true;

    const fetchOutlets = async () => {
      try {
        setIsLoading(true);
        const centreQuery = activeCentre?.slug
          ? `?centre=${encodeURIComponent(activeCentre.slug)}`
          : tableSession?.centreSlug
            ? `?centre=${encodeURIComponent(tableSession.centreSlug)}`
            : '';

        const res = await fetch(`/api/outlets${centreQuery}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !Array.isArray(data.outlets)) return;

        const loadedStalls: StallDirectoryItem[] = [];

        for (const outlet of data.outlets) {
          const restaurantName = outlet.restaurants?.name || activeCentre?.name || 'Hawker Centre';
          const dishList = outlet.dishes ?? [];
          const isStallOpen = outlet.status !== 'inactive' && outlet.is_open !== false;

          const slug =
            outlet.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') || outlet.id;

          // Estimate ETA based on stall and dish count
          const eta = outlet.eta || (dishList.length > 10 ? '15 min' : '10 min');

          let busyStatus: StallDirectoryItem['busy'] = 'Open';
          if (!isStallOpen) {
            busyStatus = 'Closed';
          } else if (dishList.length === 0) {
            busyStatus = 'Prep Shift';
          } else if (dishList.length > 8) {
            busyStatus = 'Moderate';
          }

          loadedStalls.push({
            id: outlet.id,
            name: outlet.name,
            slug,
            restaurantName,
            description:
              dishList.length > 0
                ? dishList.map((d: any) => d.name).slice(0, 3).join(', ')
                : `${restaurantName} · ${outlet.name}`,
            eta,
            busy: busyStatus,
            dishCount: dishList.length,
            isOpen: isStallOpen,
          });
        }

        if (active) {
          setStalls(loadedStalls);
        }
      } catch (err) {
        console.error('Failed to load stall directory:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void fetchOutlets();
    return () => {
      active = false;
    };
  }, [activeCentre, tableSession?.centreSlug]);

  const handleClearTable = () => {
    clearTableSession();
    setTableSession(null);
  };

  const centreSlugForScan = activeCentre?.slug || rawCentreParam || tableSession?.centreSlug || '';

  // Filter stalls by search query and filter chips
  const filteredStalls = useMemo(() => {
    return stalls.filter((stall) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = stall.name.toLowerCase().includes(q);
        const matchesDesc = stall.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      if (filterMode === 'open') {
        if (stall.busy === 'Closed') return false;
      } else if (filterMode === 'fast') {
        if (stall.eta !== '10 min') return false;
      }

      return true;
    });
  }, [stalls, searchQuery, filterMode]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] pb-32">
      <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl px-4 pt-5 sm:px-6">
        {/* Table Session / QR Scanner Top Bar */}
        {tableSession?.tableNumber ? (
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-3 shadow-xs border border-black/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1d1d1f] truncate">
                  {formatTableLabel(tableSession.tableNumber)}
                  {activeCentre ? ` • ${activeCentre.name}` : ''}
                </p>
                <p className="text-[10px] text-[#6e6e73]">Table linked • Orders routed to your seat</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/scan${centreSlugForScan ? `?centre=${encodeURIComponent(centreSlugForScan)}` : ''}` as any}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5 transition-colors"
                title="Scan different table QR"
                aria-label="Scan different table QR"
              >
                <Camera className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleClearTable}
                className="text-[11px] font-semibold text-[#86868b] hover:text-[#e03e3e] transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-3 shadow-xs border border-black/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#111827] text-white shrink-0">
                <Camera className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1d1d1f]">At a table?</p>
                <p className="text-[10px] text-[#6e6e73]">Scan table QR code to order to your seat</p>
              </div>
            </div>

            <Link
              href={`/scan${centreSlugForScan ? `?centre=${encodeURIComponent(centreSlugForScan)}` : ''}` as any}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-black transition-colors shrink-0"
            >
              <span>Scan QR</span>
              <Camera className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* Header & Centre Title */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs text-[#6e6e73] mb-0.5">
            <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <span className="font-medium truncate">{activeCentre?.name || 'Hawker Centre'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Hawker Stalls
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stalls or cuisines..."
            className="w-full rounded-full bg-white border border-black/10 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#1d1d1f] shadow-xs outline-none focus:border-[#111827] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 border ${
              filterMode === 'all'
                ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                : 'bg-white text-[#1d1d1f] border-black/10 hover:border-black/30'
            }`}
          >
            All Stalls ({stalls.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('open')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 border ${
              filterMode === 'open'
                ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                : 'bg-white text-[#1d1d1f] border-black/10 hover:border-black/30'
            }`}
          >
            Open Now
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('fast')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 border ${
              filterMode === 'fast'
                ? 'bg-[#111827] text-white border-[#111827] shadow-xs'
                : 'bg-white text-[#1d1d1f] border-black/10 hover:border-black/30'
            }`}
          >
            Fast ETA (&le; 10 min)
          </button>
        </div>

        {/* Stalls Directory Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-xs sm:text-sm text-[#86868b]">
            Loading stalls near you...
          </div>
        ) : filteredStalls.length === 0 ? (
          <div className="rounded-[22px] bg-white p-8 text-center text-xs sm:text-sm text-[#86868b] border border-black/5 shadow-xs">
            No stalls found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
            {filteredStalls.map((stall) => {
              return (
                <Link
                  key={stall.id}
                  href={`/shop/${stall.slug}` as any}
                  className="block group"
                >
                  <article className="rounded-[22px] bg-white p-3.5 shadow-xs border border-black/5 hover:border-black/20 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#f5f5f7] text-sm font-bold text-[#1d1d1f] shadow-xs ring-1 ring-black/5 group-hover:scale-105 transition-transform">
                          {stall.name
                            .split(' ')
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-bold text-[#1d1d1f] truncate group-hover:text-blue-600 transition-colors">
                            {stall.name}
                          </p>
                          <p className="mt-0.5 text-xs text-[#6e6e73] truncate">
                            {stall.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-[84px] shrink-0 flex-col items-end gap-1 text-right">
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            stall.busy === 'Busy'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : stall.busy === 'Moderate'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : stall.busy === 'Closed'
                                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {stall.busy}
                        </span>
                        {stall.busy !== 'Closed' && (
                          <span className="whitespace-nowrap text-[10px] font-semibold text-[#6e6e73] flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 text-amber-600" />
                            ETA {stall.eta}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-black/5 text-xs text-[#6e6e73]">
                      <span className="flex items-center gap-1 font-medium">
                        <Utensils className="h-3 w-3 text-[#86868b]" />
                        {stall.dishCount} Menu Dishes
                      </span>

                      <span className="inline-flex items-center gap-1 font-bold text-[#1d1d1f] group-hover:translate-x-0.5 transition-transform">
                        <span>View Menu</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md animate-slide-up">
          <Link
            href="/orders"
            className="flex items-center justify-between rounded-full bg-[#111827] px-5 py-3 text-white shadow-xl hover:bg-black transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                {totalCartCount}
              </span>
              <span className="text-sm font-semibold">View Order</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">RM {cartSubtotal.toFixed(2)}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}
    </main>
  );
}

export function CustomerStallPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-xs text-[#86868b]">
          Loading stalls…
        </div>
      }
    >
      <CustomerStallContent />
    </Suspense>
  );
}
