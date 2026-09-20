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
  ai_enabled?: boolean;
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
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);

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
    setAiEnabled(loaded.ai_enabled ?? true);
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
          ai_enabled: aiEnabled,
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
      <div className="rounded-3xl bg-white p-16 text-center text-[#86868b] border border-black/[0.08] shadow-xs flex flex-col items-center justify-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
        <p className="text-xs sm:text-sm font-medium">Loading venue details and fee configuration…</p>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="space-y-4">
        <Link
          href={'/admin/shops' as any}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Venues
        </Link>
        <div className="rounded-3xl bg-red-50 p-8 text-center text-red-700 border border-red-200/60 shadow-xs">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
          <h2 className="text-base sm:text-lg font-semibold text-[#1d1d1f]">Venue Not Found</h2>
          <p className="text-xs mt-1 text-[#6e6e73]">{error ?? 'The requested shop does not exist or has been deleted.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <Link
            href={'/admin/shops' as any}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Venues
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-[-0.03em]">
            {shop.name}
          </h1>
          <p className="mt-1 text-xs text-[#86868b] font-mono">
            ID: {shop.id} &bull; Slug: /{shop.slug ?? 'unknown'} &bull; Status: {shop.status}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: Monetization Configurator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-7 border border-black/[0.08] shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-black/[0.06] pb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0071e3] flex items-center justify-center">
                <Percent className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-[#1d1d1f]">Monetization & Commission Overrides</h2>
            </div>

            {/* Fee Model Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#86868b] mb-2">
                Commission model
              </label>
              <div className="p-1 bg-black/[0.04] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-1 border border-black/5">
                <button
                  type="button"
                  onClick={() => setFeeMode('percentage')}
                  className={`rounded-xl p-3 text-left transition-all ${
                    feeMode === 'percentage'
                      ? 'bg-white text-[#1d1d1f] shadow-xs font-semibold'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Percent className="h-3.5 w-3.5 text-[#0071e3]" />
                    Percentage
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#86868b]">% of order</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFeeMode('fixed')}
                  className={`rounded-xl p-3 text-left transition-all ${
                    feeMode === 'fixed'
                      ? 'bg-white text-[#1d1d1f] shadow-xs font-semibold'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    Flat Fee
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#86868b]">Fixed RM</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFeeMode('mixed')}
                  className={`rounded-xl p-3 text-left transition-all ${
                    feeMode === 'mixed'
                      ? 'bg-white text-[#1d1d1f] shadow-xs font-semibold'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Sliders className="h-3.5 w-3.5 text-amber-700" />
                    Mixed
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#86868b]">% + Flat</p>
                </button>
              </div>
            </div>

            {/* Rate Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feeMode === 'percentage' || feeMode === 'mixed' ? (
                <div>
                  <label className="block text-xs font-semibold text-[#86868b] mb-2">
                    Platform fee (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={platformFeePercent}
                      onChange={(e) => setPlatformFeePercent(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-[#1d1d1f] border border-black/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 shadow-xs outline-none transition"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-[#86868b]">%</span>
                  </div>
                </div>
              ) : null}

              {feeMode === 'fixed' || feeMode === 'mixed' ? (
                <div>
                  <label className="block text-xs font-semibold text-[#86868b] mb-2">
                    Flat platform fee (RM)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-[#86868b]">RM</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={platformFeeFixed}
                      onChange={(e) => setPlatformFeeFixed(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-[#1d1d1f] border border-black/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 shadow-xs outline-none transition"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Fee Payer Toggle */}
            <div>
              <label className="block text-xs font-semibold text-[#86868b] mb-2">
                Fee payer routing
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFeePayer('CUSTOMER')}
                  className={`rounded-2xl p-4 text-left border transition-all ${
                    feePayer === 'CUSTOMER'
                      ? 'border-[#0071e3] bg-blue-50/50 shadow-xs'
                      : 'border-black/[0.08] bg-black/[0.01] hover:bg-black/[0.03] text-[#6e6e73]'
                  }`}
                >
                  <p className={`text-xs font-semibold ${feePayer === 'CUSTOMER' ? 'text-[#0071e3]' : 'text-[#1d1d1f]'}`}>
                    Diner Pays Surcharge
                  </p>
                  <p className="mt-1 text-xs text-[#6e6e73]">
                    Added to diner bill as service charge.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFeePayer('MERCHANT')}
                  className={`rounded-2xl p-4 text-left border transition-all ${
                    feePayer === 'MERCHANT'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-black/[0.08] bg-black/[0.01] hover:bg-black/[0.03] text-[#6e6e73]'
                  }`}
                >
                  <p className={`text-xs font-semibold ${feePayer === 'MERCHANT' ? 'text-emerald-700' : 'text-[#1d1d1f]'}`}>
                    Stall Pays Commission
                  </p>
                  <p className="mt-1 text-xs text-[#6e6e73]">
                    Deducted from vendor sales payout.
                  </p>
                </button>
              </div>
            </div>

            {/* AI Capability Toggle */}
            <div className="space-y-3 pt-3 border-t border-black/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#1d1d1f]">AI Copilot Features</h3>
                  <p className="mt-1 text-xs text-[#6e6e73]">
                    Toggle AI smart scanning and search for this venue.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={aiEnabled}
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    aiEnabled ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      aiEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {saveError && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-200/60">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => void handleSaveMonetization()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-black disabled:opacity-50 transition"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? 'Applying rate changes…' : 'Save Venue Policy'}</span>
              </button>

              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
                  <Check className="h-3.5 w-3.5" />
                  <span>Monetization settings updated</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Preview & Venue Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white p-6 border border-black/[0.08] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[#0071e3]" />
                <h3 className="text-sm font-semibold text-[#1d1d1f]">Live Order Simulation</h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.04] text-[#86868b] border border-black/[0.06]">
                RM 20.00 order
              </span>
            </div>

            <div className="space-y-2.5 rounded-2xl bg-[#fafafc] p-4 border border-black/[0.06] text-xs">
              <div className="flex justify-between text-[#6e6e73]">
                <span>Food Cart Subtotal:</span>
                <span className="font-semibold text-[#1d1d1f]">RM 20.00</span>
              </div>

              <div className="flex justify-between text-[#0071e3]">
                <span>
                  Platform Charge ({feeMode === 'percentage' ? `${platformFeePercent}%` : feeMode === 'fixed' ? 'Fixed' : `${platformFeePercent}% + RM${platformFeeFixed}`}):
                </span>
                <span className="font-semibold">RM {sampleFee.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-black/[0.06] flex justify-between font-semibold text-[#1d1d1f]">
                <span>Diner Total Bill:</span>
                <span className="text-sm font-bold">RM {sampleCustomerTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Stall Net Payout:</span>
                <span className="text-sm font-bold">RM {sampleStallPayout.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 border border-black/[0.08] shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-[#1d1d1f]">Venue Details</h3>
            <div className="space-y-2 text-xs text-[#6e6e73]">
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="text-[#1d1d1f] text-right max-w-[200px] truncate">{shop.address ?? 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span>URL Slug:</span>
                <span className="font-mono text-[#1d1d1f]">/{shop.slug ?? 'unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
