'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Percent,
  ShieldCheck,
  Store,
  ArrowUpRight,
  RefreshCw,
  Coins,
  Layers,
  CheckCircle2,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { authenticatedFetch } from '@/lib/supabase/client';

type Shop = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  createdAt: string | null;
  isActive: boolean;
  status: string;
  feePayer?: 'CUSTOMER' | 'MERCHANT';
  platformFeeFixed?: number;
  platformFeePercent?: number;
  booths: Array<{ id: string; name: string; isOpen?: boolean; status?: string }>;
};

export default function AdminDashboardPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticatedFetch('/api/owner/shops?all=true');
      if (!res.ok) {
        throw new Error(`Failed to load venues (${res.status})`);
      }
      const data = (await res.json()) as { shops?: Shop[] };
      setShops(data.shops ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch platform data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    authenticatedFetch('/api/owner/shops?all=true')
      .then(async (res) => {
        if (!isMounted) return;
        if (!res.ok) {
          throw new Error(`Failed to load venues (${res.status})`);
        }
        const data = (await res.json()) as { shops?: Shop[] };
        setShops(data.shops ?? []);
        setLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err.message ?? 'Failed to fetch platform data');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Aggregate metrics
  const totalVenues = shops.length;
  const totalStalls = shops.reduce((sum, s) => sum + (s.booths?.length ?? 0), 0);
  const dinerFeeCount = shops.filter((s) => (s.feePayer ?? 'CUSTOMER') === 'CUSTOMER').length;
  const stallFeeCount = shops.filter((s) => s.feePayer === 'MERCHANT').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#86868b] bg-black/[0.04] border border-black/[0.06] px-2.5 py-0.5 rounded-full">
              Platform control plane
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-[-0.03em]">
            SaaS Platform Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6e6e73]">
            System-wide operational metrics, multi-tenant food halls, and platform fee policies.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.03] transition border border-black/10 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6e6e73] ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href={'/admin/monetization' as any}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black transition"
          >
            <Percent className="w-3.5 h-3.5" />
            Manage Monetization
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Venues */}
        <div className="rounded-2xl bg-white p-5 border border-black/[0.06] shadow-xs">
          <div className="flex items-center justify-between text-[#86868b]">
            <span className="text-xs font-semibold">Registered venues</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1d1d1f]">{loading ? '—' : totalVenues}</p>
          <p className="mt-1 text-xs text-[#86868b]">Multi-tenant food halls & centres</p>
        </div>

        {/* Operating Stalls */}
        <div className="rounded-2xl bg-white p-5 border border-black/[0.06] shadow-xs">
          <div className="flex items-center justify-between text-[#86868b]">
            <span className="text-xs font-semibold">Active stalls</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1d1d1f]">{loading ? '—' : totalStalls}</p>
          <p className="mt-1 text-xs text-[#86868b]">Kitchen Display System nodes</p>
        </div>

        {/* Monetization Model */}
        <div className="rounded-2xl bg-white p-5 border border-black/[0.06] shadow-xs">
          <div className="flex items-center justify-between text-[#86868b]">
            <span className="text-xs font-semibold">Fee distribution</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">{dinerFeeCount}</span>
            <span className="text-xs text-[#6e6e73]">Diner Surcharge / {stallFeeCount} Stall Comm.</span>
          </div>
          <p className="mt-1 text-xs text-amber-800 font-medium">Configurable per venue</p>
        </div>

        {/* Security & RBAC Status */}
        <div className="rounded-2xl bg-white p-5 border border-black/[0.06] shadow-xs">
          <div className="flex items-center justify-between text-[#86868b]">
            <span className="text-xs font-semibold">Security & RLS</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-sm font-semibold text-[#1d1d1f]">Database Triggers</span>
          </div>
          <p className="mt-1 text-xs text-[#86868b]">Engine-level 42501 fee protection active</p>
        </div>
      </div>

      {/* Quick Monetization Action Card */}
      <div className="rounded-3xl bg-white p-6 sm:p-7 border border-black/[0.08] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-[#0071e3] bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            <Sliders className="w-3.5 h-3.5" />
            <span>Dedicated Platform Fee Management</span>
          </div>
          <h2 className="mt-2.5 text-lg sm:text-xl font-semibold text-[#1d1d1f] tracking-tight">
            Configure Platform Commission & Fee Models
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
            Manage global and venue-specific fee structures (percentage, flat fixed, or mixed), toggle between Diner Service Charge and Stall Commission deduction, and inspect live order calculation simulations.
          </p>
        </div>
        <Link
          href={'/admin/monetization' as any}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0071e3] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0077ed] transition shrink-0"
        >
          <span>Open Fee Configurator</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Venues Table Section */}
      <div className="rounded-3xl bg-white border border-black/[0.08] shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#1d1d1f] tracking-tight">
              All Multi-Tenant Food Halls ({shops.length})
            </h2>
            <p className="text-xs text-[#86868b] mt-0.5">
              Review current pricing tiers and booth allocations across the entire platform.
            </p>
          </div>
          <Link
            href={'/admin/monetization' as any}
            className="text-xs font-semibold text-[#0071e3] hover:underline inline-flex items-center gap-1"
          >
            <span>Edit fee rules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {error && (
          <div className="p-4 text-xs font-medium text-red-700 bg-red-50 border-b border-red-200/60">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-[#86868b] flex flex-col items-center justify-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
            <p className="text-xs font-medium">Loading venues and fee policies…</p>
          </div>
        ) : shops.length === 0 ? (
          <div className="p-12 text-center text-[#86868b]">
            <p className="text-xs sm:text-sm">No food halls found on the platform.</p>
          </div>
        ) : (
          <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#fafafc] text-xs font-semibold text-[#86868b]">
                  <th className="py-3 px-5">Venue</th>
                  <th className="py-3 px-5">URL slug</th>
                  <th className="py-3 px-5">Stalls</th>
                  <th className="py-3 px-5">Fee payer</th>
                  <th className="py-3 px-5">Platform fee rate</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-xs sm:text-sm text-[#1d1d1f]">
                {shops.map((shop) => {
                  const feePercent = (shop.platformFeePercent ?? 0) * 100;
                  const feeFixed = shop.platformFeeFixed ?? 0;
                  const isDiner = (shop.feePayer ?? 'CUSTOMER') === 'CUSTOMER';

                  let feeRateLabel = 'Standard';
                  if (feePercent > 0 && feeFixed > 0) {
                    feeRateLabel = `${feePercent.toFixed(1)}% + RM ${feeFixed.toFixed(2)}`;
                  } else if (feePercent > 0) {
                    feeRateLabel = `${feePercent.toFixed(1)}%`;
                  } else if (feeFixed > 0) {
                    feeRateLabel = `RM ${feeFixed.toFixed(2)} Flat`;
                  }

                  return (
                    <tr key={shop.id} className="hover:bg-[#fafafc] transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-[#1d1d1f]">{shop.name}</div>
                        <div className="text-xs text-[#86868b] truncate max-w-xs">{shop.address ?? 'No address'}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-mono text-xs text-[#6e6e73] bg-black/[0.04] px-2 py-0.5 rounded-md border border-black/[0.06]">
                          /{shop.slug ?? 'unknown'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#6e6e73]">
                          <Store className="w-3.5 h-3.5 text-[#86868b]" />
                          {shop.booths?.length ?? 0} stalls
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            isDiner
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          }`}
                        >
                          {isDiner ? 'Diner Pays Surcharge' : 'Stall Pays Commission'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-[#1d1d1f]">
                          {feeRateLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href={`/admin/monetization?shopId=${shop.id}` as any}
                          className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-3 py-1 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.08] transition border border-black/[0.06]"
                        >
                          <Sliders className="w-3 h-3 text-[#6e6e73]" />
                          <span>Configure</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-black/[0.04]">
            {shops.map((shop) => {
              const feePercent = (shop.platformFeePercent ?? 0) * 100;
              const feeFixed = shop.platformFeeFixed ?? 0;
              const isDiner = (shop.feePayer ?? 'CUSTOMER') === 'CUSTOMER';

              let feeRateLabel = 'Standard';
              if (feePercent > 0 && feeFixed > 0) {
                feeRateLabel = `${feePercent.toFixed(1)}% + RM ${feeFixed.toFixed(2)}`;
              } else if (feePercent > 0) {
                feeRateLabel = `${feePercent.toFixed(1)}%`;
              } else if (feeFixed > 0) {
                feeRateLabel = `RM ${feeFixed.toFixed(2)} Flat`;
              }

              return (
                <div key={`mob-${shop.id}`} className="p-5 space-y-4 hover:bg-[#fafafc] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm text-[#1d1d1f]">{shop.name}</div>
                      <div className="text-xs text-[#86868b] mt-0.5">{shop.address ?? 'No address'}</div>
                    </div>
                    <span className="font-mono text-[10px] text-[#6e6e73] bg-black/[0.04] px-1.5 py-0.5 rounded border border-black/[0.06] shrink-0">
                      /{shop.slug ?? 'unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-[#6e6e73]">
                      <Store className="w-3.5 h-3.5 text-[#86868b]" />
                      {shop.booths?.length ?? 0}
                    </span>
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isDiner
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}
                    >
                      {isDiner ? 'Diner' : 'Stall'}
                    </span>
                    <span className="font-semibold text-[#1d1d1f] ml-auto">
                      {feeRateLabel}
                    </span>
                  </div>
                  <Link
                    href={`/admin/monetization?shopId=${shop.id}` as any}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-black/[0.04] px-3 py-2 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.08] transition border border-black/[0.06]"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#6e6e73]" />
                    <span>Configure</span>
                  </Link>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
