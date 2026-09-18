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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <span className="text-xs font-semibold text-[#86868b] bg-black/[0.04] border border-black/[0.06] px-2.5 py-0.5 rounded-full">
            Platform directory
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-[-0.03em]">
            Venues & Food Halls
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6e6e73]">
            View all multi-tenant food centres and configure per-venue fee policies.
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
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white p-16 text-center text-[#86868b] border border-black/[0.08] shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
          <p className="text-xs sm:text-sm font-medium">Loading venues…</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-700 border border-red-200/60">
          {error}
        </div>
      ) : shops.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center text-[#86868b] border border-black/[0.08] shadow-xs">
          <Building2 className="w-8 h-8 text-[#86868b] mx-auto mb-3" />
          <p className="text-base font-semibold text-[#1d1d1f]">No Venues Found</p>
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
                className="rounded-3xl bg-white p-6 shadow-sm flex flex-col justify-between gap-5 hover:bg-neutral-50 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-semibold text-[#1d1d1f] truncate">{shop.name}</h2>
                      <p className="text-xs text-[#86868b] font-mono mt-0.5">/{shop.slug ?? 'unknown'}</p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${
                        isDiner
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}
                    >
                      {isDiner ? 'Diner Surcharge' : 'Stall Commission'}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-[#86868b] line-clamp-2">
                    {shop.address ?? 'Address not specified'}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-[#6e6e73]">
                      <Store className="w-3.5 h-3.5 text-[#86868b]" />
                      <span>{shop.booths?.length ?? 0} stalls</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#1d1d1f] font-semibold">
                      <span className="text-[#86868b] font-normal">Fee:</span>
                      <span>{rate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/shops/${shop.id}` as any}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.03] transition border border-black/10 shadow-xs"
                  >
                    <span>Venue Details</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#6e6e73]" />
                  </Link>

                  <Link
                    href={`/admin/monetization?shopId=${shop.id}` as any}
                    className="inline-flex items-center gap-1 rounded-full bg-[#1d1d1f] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-black transition shadow-xs"
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
