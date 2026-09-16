'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Store,
  ChevronRight,
  RefreshCw,
  Sliders,
  ExternalLink,
  ShieldCheck,
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

export default function AdminShopsListPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticatedFetch('/api/owner/shops?all=true');
      if (!res.ok) throw new Error(`Failed to load venues (${res.status})`);
      const data = (await res.json()) as { shops?: Shop[] };
      setShops(data.shops ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    authenticatedFetch('/api/owner/shops?all=true')
      .then(async (res) => {
        if (!isMounted) return;
        if (!res.ok) throw new Error(`Failed to load venues (${res.status})`);
        const data = (await res.json()) as { shops?: Shop[] };
        setShops(data.shops ?? []);
        setLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err.message ?? 'Failed to fetch venues');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
            Platform Directory
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Venues & Food Halls
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View all multi-tenant food centres and configure per-venue fee policies.
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
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-[#111827] p-16 text-center text-slate-400 border border-white/10 flex flex-col items-center justify-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="text-sm font-medium">Loading venues…</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-500/10 p-5 text-sm text-red-400 border border-red-500/20">
          {error}
        </div>
      ) : shops.length === 0 ? (
        <div className="rounded-3xl bg-[#111827] p-12 text-center text-slate-400 border border-white/10">
          <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-white">No Venues Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shops.map((shop) => {
            const feePercent = (shop.platformFeePercent ?? 0) * 100;
            const feeFixed = shop.platformFeeFixed ?? 0;
            const isDiner = (shop.feePayer ?? 'CUSTOMER') === 'CUSTOMER';

            let rate = 'RM 0.50 Flat';
            if (feePercent > 0 && feeFixed > 0) rate = `${feePercent.toFixed(1)}% + RM ${feeFixed.toFixed(2)}`;
            else if (feePercent > 0) rate = `${feePercent.toFixed(1)}%`;
            else if (feeFixed > 0) rate = `RM ${feeFixed.toFixed(2)}`;

            return (
              <div
                key={shop.id}
                className="rounded-3xl bg-[#111827] p-6 border border-white/10 shadow-xl flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-white truncate">{shop.name}</h2>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">/{shop.slug ?? 'unknown'}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                        isDiner
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isDiner ? 'Diner Surcharge' : 'Stall Commission'}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                    {shop.address ?? 'Address not specified'}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Store className="w-4 h-4 text-slate-400" />
                      <span>{shop.booths?.length ?? 0} stalls</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-semibold">
                      <span>Fee:</span>
                      <span>{rate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/shops/${shop.id}` as any}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition border border-white/10"
                  >
                    <span>Venue Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/admin/monetization?shopId=${shop.id}` as any}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow-md shadow-amber-500/20"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Configure Monetization</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
