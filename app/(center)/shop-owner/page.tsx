'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Building2,
  CalendarRange,
  ChevronRight,
  LoaderCircle,
  Plus,
  Power,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react';
import { authenticatedFetch } from '@/lib/supabase/client';

type BoothMember = {
  userId: string;
  email: string;
  role: string;
};

type BoothInvitation = {
  id: string;
  email: string;
  expiresAt: string;
};

type ShopMembership = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  role: string;
  isActive?: boolean;
  status?: string;
  booths: Array<{
    id: string;
    name: string;
    status: string;
    isOpen?: boolean;
    members?: BoothMember[];
    invitations?: BoothInvitation[];
  }>;
};

export default function ShopOwnerDashboard() {
  const [shops, setShops] = useState<ShopMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingShopId, setTogglingShopId] = useState<string | null>(null);

  const loadShops = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/owner/shops');
      if (!response.ok) {
        setShops([]);
        return;
      }

      const payload = (await response.json()) as { shops?: ShopMembership[] };
      setShops(payload.shops ?? []);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadShops();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadShops]);

  const handleToggleShopActive = async (shopId: string, currentIsActive: boolean) => {
    const nextActive = !currentIsActive;
    setTogglingShopId(shopId);

    // Optimistic UI update
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isActive: nextActive } : s))
    );

    try {
      const res = await authenticatedFetch(`/api/owner/shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to update shop status');
      }
      await loadShops();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update shop status');
      setShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, isActive: currentIsActive } : s))
      );
    } finally {
      setTogglingShopId(null);
    }
  };

  const totalBooths = shops.reduce((sum, shop) => sum + shop.booths.length, 0);
  const activeVendorsCount = shops.reduce(
    (sum, shop) =>
      sum +
      shop.booths.reduce(
        (bSum, b) => bSum + ((b.members && b.members.length > 0) ? 1 : 0),
        0
      ),
    0
  );

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 sm:px-6 text-[#1d1d1f]">
      <div className="mx-auto max-w-7xl">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#1d1d1f] mb-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Food Hall Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f] truncate">
              {shops[0]?.name ? `${shops[0].name} Overview` : 'Venue Command Center'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6e6e73] truncate">
              Manage stall allocations, dispatch vendor invitation links, and inspect food hall performance.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={'/shop-owner/booths' as any}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#111827] px-4 text-xs font-semibold text-white hover:bg-black transition-all shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Booth Slot</span>
            </Link>
          </div>
        </header>

        {/* Responsive KPI Grid - 2x2 on mobile, 4 columns on desktop */}
        <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-[22px] bg-white p-4 sm:p-5 border border-black/[0.04] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-medium">Managed Venues</span>
              <Building2 className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                {shops.length}
              </p>
              <p className="mt-0.5 text-[11px] text-[#86868b]">Physical food centres</p>
            </div>
          </div>

          <div className="rounded-[22px] bg-white p-4 sm:p-5 border border-black/[0.04] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-medium">Stall Slots</span>
              <Store className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                {totalBooths}
              </p>
              <p className="mt-0.5 text-[11px] text-[#86868b]">Configured counters</p>
            </div>
          </div>

          <div className="rounded-[22px] bg-white p-4 sm:p-5 border border-black/[0.04] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-medium">Active Vendors</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
                {activeVendorsCount}
              </p>
              <p className="mt-0.5 text-[11px] text-[#86868b]">Claimed by merchants</p>
            </div>
          </div>

          <div className="rounded-[22px] bg-white p-4 sm:p-5 border border-black/[0.04] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-medium">Operator Access</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <p className="text-lg sm:text-xl font-semibold tracking-tight text-[#1d1d1f] capitalize">
                {shops[0]?.role ?? 'Owner'}
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-600 font-medium">Verified privileges</p>
            </div>
          </div>
        </section>

        {/* Widescreen Multi-Column Grid */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Left Column: Food Hall Stalls Directory */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-[26px] bg-white p-5 sm:p-6 border border-black/[0.04] shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-[#1d1d1f]">
                    Managed Food Halls & Stalls
                  </h2>
                  <p className="text-xs text-[#6e6e73] mt-0.5">
                    Your assigned venues and live stall slot allocations.
                  </p>
                </div>
                <Link
                  href={'/shop-owner/booths' as any}
                  className="text-xs font-semibold text-[#1d1d1f] hover:underline inline-flex items-center gap-1"
                >
                  Manage All
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center p-10 text-xs text-[#86868b]">
                  <LoaderCircle className="w-4 h-4 animate-spin mr-2 text-[#111827]" />
                  Loading venues…
                </div>
              ) : shops.length === 0 ? (
                <div className="rounded-2xl bg-[#f5f5f7] p-8 text-center text-xs text-[#6e6e73]">
                  <Store className="w-8 h-8 text-[#86868b] mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-sm text-[#1d1d1f]">No food hall registered yet</p>
                  <p className="mt-1 max-w-sm mx-auto">
                    Create your first venue or claim an invitation to start managing stalls.
                  </p>
                  <Link
                    href={'/subscribe' as any}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Launch Food Hall
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {shops.map((shop) => (
                    <div
                      key={shop.id}
                      className="rounded-2xl bg-[#f5f5f7]/80 border border-black/[0.04] p-4 sm:p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#111827] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            {shop.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-[#1d1d1f] truncate">
                              {shop.name}
                            </h3>
                            <p className="text-[11px] text-[#6e6e73] truncate">
                              {shop.address || 'Central Food Court'} &bull; {shop.booths.length} configured slots
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                              shop.isActive !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                shop.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                              }`}
                            />
                            {shop.isActive !== false ? 'Active' : 'Inactive'}
                          </span>

                          <button
                            type="button"
                            disabled={togglingShopId === shop.id}
                            onClick={() => handleToggleShopActive(shop.id, shop.isActive !== false)}
                            title={shop.isActive !== false ? 'Put shop as inactive' : 'Set shop as active'}
                            aria-label={shop.isActive !== false ? 'Put shop as inactive' : 'Set shop as active'}
                            className={`flex h-8 items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition-all shadow-xs disabled:opacity-50 shrink-0 ${
                              shop.isActive !== false
                                ? 'border-amber-200 bg-amber-50/80 text-amber-700 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{shop.isActive !== false ? 'Put Inactive' : 'Activate'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Stall Slots List */}
                      <div className="mt-3.5">
                        <p className="text-xs font-semibold text-[#86868b] mb-2 truncate">
                          Stall slots
                        </p>
                        {shop.booths.length === 0 ? (
                          <div className="rounded-xl bg-white p-3 text-center text-xs text-[#86868b] truncate">
                            No stall slots created yet. Click below to add your first stall counter.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {shop.booths.map((booth) => {
                              const hasMember = booth.members && booth.members.length > 0;
                              return (
                                <div
                                  key={booth.id}
                                  className="flex items-center justify-between gap-2 rounded-xl bg-white p-3 border border-black/[0.04] shadow-xs"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#1d1d1f] truncate">
                                      {booth.name}
                                    </p>
                                    <p className="text-[10px] text-[#86868b] truncate">
                                      {hasMember ? 'Vendor connected' : 'Ready for invite'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span
                                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        hasMember
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-black/5 text-[#1d1d1f] border border-black/5'
                                      }`}
                                    >
                                      {hasMember ? 'Claimed' : 'Available'}
                                    </span>
                                    <Link
                                      href={`/shop-owner/analytics?boothId=${booth.id}`}
                                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5 transition-all shrink-0 shadow-xs"
                                      title={`View analytics for ${booth.name}`}
                                      aria-label={`View analytics for ${booth.name}`}
                                    >
                                      <BarChart3 className="w-4 h-4 text-[#111827]" />
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Action Cards & Guidance */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-[26px] bg-white p-5 sm:p-6 border border-black/[0.04] shadow-xs">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#1d1d1f]">
                Quick Operations
              </h2>
              <p className="text-xs text-[#6e6e73] mt-0.5 truncate">
                Direct shortcuts for food hall operators.
              </p>

              <div className="mt-4 space-y-2.5">
                <Link
                  href={'/shop-owner/booths' as any}
                  className="group flex items-center justify-between rounded-2xl bg-[#f5f5f7] p-3.5 hover:bg-black/5 transition-all border border-black/[0.02]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#111827] text-white flex items-center justify-center shadow-xs shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1d1d1f] group-hover:text-black truncate">
                        Manage Booths & Invites
                      </p>
                      <p className="text-[11px] text-[#86868b] truncate">Send setup links to vendors</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86868b] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>

                <Link
                  href={'/shop-owner/analytics' as any}
                  className="group flex items-center justify-between rounded-2xl bg-[#f5f5f7] p-3.5 hover:bg-black/5 transition-all border border-black/[0.02]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#111827] text-white flex items-center justify-center shadow-xs shrink-0">
                      <CalendarRange className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1d1d1f] group-hover:text-black truncate">
                        Venue Analytics
                      </p>
                      <p className="text-[11px] text-[#86868b] truncate">Sales volume & ticket metrics</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86868b] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>

                <Link
                  href={'/shop-owner/profile' as any}
                  className="group flex items-center justify-between rounded-2xl bg-[#f5f5f7] p-3.5 hover:bg-black/5 transition-all border border-black/[0.02]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#111827] text-white flex items-center justify-center shadow-xs shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1d1d1f] group-hover:text-black truncate">
                        Food Hall Settings
                      </p>
                      <p className="text-[11px] text-[#86868b] truncate">Venue details and addresses</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#86868b] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              </div>
            </div>

            {/* Operator Safety Notice */}
            <div className="rounded-[24px] bg-[#111827] text-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Isolated Merchant Security</span>
              </div>
              <p className="mt-2 text-xs text-white/80 leading-relaxed truncate">
                Each stall vendor operates independently with isolated permissions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
