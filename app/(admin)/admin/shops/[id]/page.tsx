'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Store,
  Percent,
  Sliders,
  DollarSign,
  Save,
  Check,
  AlertCircle,
  Info,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { authenticatedFetch } from '@/lib/supabase/client';

type ShopDetail = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  isActive: boolean;
  status: string;
  fee_payer?: 'CUSTOMER' | 'MERCHANT';
  platform_fee_fixed?: number;
  platform_fee_percent?: number;
  booths?: Array<{ id: string; name: string }>;
};

export default function AdminShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const shopId = resolvedParams.id;

  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fee Form State
  const [feeMode, setFeeMode] = useState<'percentage' | 'fixed' | 'mixed'>('percentage');
  const [feePayer, setFeePayer] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(5.0);
  const [platformFeeFixed, setPlatformFeeFixed] = useState<number>(0.50);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const applyShopData = (loaded: any) => {
    setShop(loaded as ShopDetail);

    const rawPercent = loaded.platform_fee_percent ?? 0.0000;
    const rawFixed = loaded.platform_fee_fixed ?? 0.50;
    const rawPayer = (loaded.fee_payer ?? 'CUSTOMER') as 'CUSTOMER' | 'MERCHANT';

    let mode: 'percentage' | 'fixed' | 'mixed' = 'percentage';
    if (rawPercent > 0 && rawFixed > 0) mode = 'mixed';
    else if (rawPercent > 0) mode = 'percentage';
    else mode = 'fixed';

    setFeeMode(mode);
    setFeePayer(rawPayer);
    setPlatformFeePercent(rawPercent > 0 ? Number((rawPercent * 100).toFixed(2)) : 5.0);
    setPlatformFeeFixed(rawFixed);
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticatedFetch(`/api/owner/shops/${shopId}`);
      if (!res.ok) throw new Error(`Shop not found (${res.status})`);
      const data = (await res.json()) as { shop?: ShopDetail; [key: string]: any };
      const loaded = data.shop ?? data;
      applyShopData(loaded);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load shop details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    authenticatedFetch(`/api/owner/shops/${shopId}`)
      .then(async (res) => {
        if (!isMounted) return;
        if (!res.ok) throw new Error(`Shop not found (${res.status})`);
        const data = (await res.json()) as { shop?: ShopDetail; [key: string]: any };
        const loaded = data.shop ?? data;
        applyShopData(loaded);
        setLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setError(err.message ?? 'Failed to load shop details.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shopId]);

  // Live preview values
  const simulatedPercent = feeMode === 'fixed' ? 0 : platformFeePercent / 100;
  const simulatedFixed = feeMode === 'percentage' ? 0 : platformFeeFixed;
  const sampleFee = 20.0 * simulatedPercent + simulatedFixed;
  const sampleCustomerTotal = feePayer === 'CUSTOMER' ? 20.0 + sampleFee : 20.0;
  const sampleStallPayout = feePayer === 'MERCHANT' ? Math.max(0, 20.0 - sampleFee) : 20.0;

  const handleSaveMonetization = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const feePercentDecimal =
        feeMode === 'fixed' ? 0.0 : Number((platformFeePercent / 100).toFixed(4));
      const feeFixedAmount =
        feeMode === 'percentage' ? 0.0 : Number(platformFeeFixed.toFixed(2));

      const response = await authenticatedFetch(`/api/owner/shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fee_payer: feePayer,
          platform_fee_fixed: feeFixedAmount,
          platform_fee_percent: feePercentDecimal,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to update monetization settings.');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      void handleRefresh();
    } catch (err: any) {
      setSaveError(err.message ?? 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl bg-[#111827] p-16 text-center text-slate-400 border border-white/10 flex flex-col items-center justify-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        <p className="text-sm font-medium">Loading venue details and fee configuration…</p>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="space-y-4">
        <Link
          href={'/admin/shops' as any}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Venues
        </Link>
        <div className="rounded-3xl bg-red-500/10 p-8 text-center text-red-400 border border-red-500/20">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <h2 className="text-lg font-bold">Venue Not Found</h2>
          <p className="text-xs mt-1">{error ?? 'The requested shop does not exist or has been deleted.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href={'/admin/shops' as any}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Venues
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {shop.name}
          </h1>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            ID: {shop.id} &bull; Slug: /{shop.slug ?? 'unknown'} &bull; Status: {shop.status}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition border border-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Monetization Configurator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-[#111827] p-6 sm:p-7 border border-white/10 shadow-xl space-y-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <Percent className="h-5 w-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Monetization & Commission Overrides</h2>
            </div>

            {/* Fee Model Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Commission Model
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFeeMode('percentage')}
                  className={`rounded-2xl p-3.5 text-left border transition-all ${
                    feeMode === 'percentage'
                      ? 'border-amber-500/50 bg-amber-500/10 text-white shadow-sm'
                      : 'border-white/5 bg-[#0e1424] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Percent className="h-3.5 w-3.5 text-amber-400" />
                    Percentage
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">% of order</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFeeMode('fixed')}
                  className={`rounded-2xl p-3.5 text-left border transition-all ${
                    feeMode === 'fixed'
                      ? 'border-amber-500/50 bg-amber-500/10 text-white shadow-sm'
                      : 'border-white/5 bg-[#0e1424] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                    Flat Fee
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">Fixed RM</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFeeMode('mixed')}
                  className={`rounded-2xl p-3.5 text-left border transition-all ${
                    feeMode === 'mixed'
                      ? 'border-amber-500/50 bg-amber-500/10 text-white shadow-sm'
                      : 'border-white/5 bg-[#0e1424] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Sliders className="h-3.5 w-3.5 text-amber-400" />
                    Mixed
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">% + Flat</p>
                </button>
              </div>
            </div>

            {/* Rate Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feeMode === 'percentage' || feeMode === 'mixed' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Platform Fee (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={platformFeePercent}
                      onChange={(e) => setPlatformFeePercent(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-2xl bg-[#0e1424] px-4 py-3 text-sm font-semibold text-white border border-white/10 focus:border-amber-500 focus:outline-hidden"
                    />
                    <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              ) : null}

              {feeMode === 'fixed' || feeMode === 'mixed' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Flat Platform Fee (RM)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-xs font-bold text-slate-400">RM</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={platformFeeFixed}
                      onChange={(e) => setPlatformFeeFixed(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-2xl bg-[#0e1424] pl-11 pr-4 py-3 text-sm font-semibold text-white border border-white/10 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Fee Payer Toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Fee Payer Routing
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFeePayer('CUSTOMER')}
                  className={`rounded-2xl p-4 text-left border transition-all ${
                    feePayer === 'CUSTOMER'
                      ? 'border-blue-500/50 bg-blue-500/10 text-white shadow-sm'
                      : 'border-white/5 bg-[#0e1424] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <p className="text-xs font-bold text-blue-400">Diner Pays Surcharge</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Added to diner bill as service charge.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFeePayer('MERCHANT')}
                  className={`rounded-2xl p-4 text-left border transition-all ${
                    feePayer === 'MERCHANT'
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-white shadow-sm'
                      : 'border-white/5 bg-[#0e1424] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <p className="text-xs font-bold text-emerald-400">Stall Pays Commission</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Deducted from vendor sales payout.
                  </p>
                </button>
              </div>
            </div>

            {saveError && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 p-4 text-xs font-semibold text-red-400 border border-red-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => void handleSaveMonetization()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-50 transition"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Applying rate changes…' : 'Save Venue Policy'}</span>
              </button>

              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span>Monetization settings updated</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Preview & Venue Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-[#111827] p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Live Order Simulation</h3>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                RM 20.00 Order
              </span>
            </div>

            <div className="space-y-2.5 rounded-2xl bg-[#0e1424] p-4 border border-white/5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Food Cart Subtotal:</span>
                <span className="font-semibold text-white">RM 20.00</span>
              </div>

              <div className="flex justify-between text-amber-400">
                <span>
                  Platform Charge ({feeMode === 'percentage' ? `${platformFeePercent}%` : feeMode === 'fixed' ? 'Fixed' : `${platformFeePercent}% + RM${platformFeeFixed}`}):
                </span>
                <span className="font-bold">RM {sampleFee.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between font-bold text-white">
                <span>Diner Total Bill:</span>
                <span className="text-sm">RM {sampleCustomerTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Stall Net Payout:</span>
                <span className="text-sm font-bold">RM {sampleStallPayout.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-[#111827] p-6 border border-white/10 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white">Venue Details</h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="text-white text-right max-w-[200px] truncate">{shop.address ?? 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span>URL Slug:</span>
                <span className="font-mono text-amber-400">/{shop.slug ?? 'unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
