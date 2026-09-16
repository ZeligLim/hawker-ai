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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              Platform Control Plane
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SaaS Superadmin Overview
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            System-wide operational metrics, multi-tenant food halls, and platform fee policies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition border border-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href={'/admin/monetization' as any}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition"
          >
            <Percent className="w-3.5 h-3.5" />
            Manage Monetization
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Venues */}
        <div className="rounded-2xl bg-[#111827] p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Venues</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{loading ? '—' : totalVenues}</p>
          <p className="mt-1 text-xs text-slate-400">Multi-tenant food halls & centres</p>
        </div>

        {/* Operating Stalls */}
        <div className="rounded-2xl bg-[#111827] p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Stalls / Booths</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{loading ? '—' : totalStalls}</p>
          <p className="mt-1 text-xs text-slate-400">Kitchen Display System nodes</p>
        </div>

        {/* Monetization Model */}
        <div className="rounded-2xl bg-[#111827] p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Fee Distribution</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{dinerFeeCount}</span>
            <span className="text-xs text-slate-400">Diner Surcharge / {stallFeeCount} Stall Comm.</span>
          </div>
          <p className="mt-1 text-xs text-amber-400/90 font-medium">Configurable per venue</p>
        </div>

        {/* Security & RBAC Status */}
        <div className="rounded-2xl bg-[#111827] p-5 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Security & RLS</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-base font-bold text-white">Database Triggers</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Engine-level 42501 fee protection active</p>
        </div>
      </div>

      {/* Quick Monetization Action Card */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-orange-500/10 p-6 sm:p-7 border border-amber-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Dedicated Platform Fee Management</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-white tracking-tight">
            Configure Platform Commission & Fee Models
          </h2>
          <p className="mt-1 text-sm text-slate-300 leading-relaxed">
            Manage global and venue-specific fee structures (percentage, flat fixed, or mixed), toggle between Diner Service Charge and Stall Commission deduction, and inspect live order calculation simulations.
          </p>
        </div>
        <Link
          href={'/admin/monetization' as any}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition shrink-0"
        >
          <span>Open Fee Configurator</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Venues Table Section */}
      <div className="rounded-3xl bg-[#111827] border border-white/10 shadow-xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              All Multi-Tenant Food Halls ({shops.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review current pricing tiers and booth allocations across the entire platform.
            </p>
          </div>
          <Link
            href={'/admin/monetization' as any}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
          >
            <span>Edit fee rules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {error && (
          <div className="p-6 text-sm text-red-400 bg-red-500/10 border-b border-red-500/20">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <p className="text-xs font-medium">Loading venues and fee policies…</p>
          </div>
        ) : shops.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No food halls found on the platform.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Venue Name</th>
                  <th className="py-3.5 px-5">URL Slug</th>
                  <th className="py-3.5 px-5">Stalls</th>
                  <th className="py-3.5 px-5">Fee Payer</th>
                  <th className="py-3.5 px-5">Platform Fee Rate</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-200">
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
                    <tr key={shop.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-white">{shop.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">{shop.address ?? 'No address'}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          /{shop.slug ?? 'unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          {shop.booths?.length ?? 0} stalls
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isDiner
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isDiner ? 'Diner Pays Surcharge' : 'Stall Pays Commission'}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-semibold text-amber-400">
                          {feeRateLabel}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/admin/monetization?shopId=${shop.id}` as any}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition border border-white/10"
                        >
                          <Sliders className="w-3 h-3 text-amber-400" />
                          <span>Configure</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
