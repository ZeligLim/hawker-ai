'use client';

import React, { useCallback, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Percent,
  DollarSign,
  Building2,
  Save,
  Check,
  ShieldCheck,
  AlertCircle,
  Info,
  RefreshCw,
  Store,
  ChevronRight,
  Sliders,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { authenticatedFetch } from '@/lib/supabase/client';

type Shop = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  isActive: boolean;
  status: string;
  feePayer?: 'CUSTOMER' | 'MERCHANT';
  platformFeeFixed?: number;
  platformFeePercent?: number;
  aiEnabled?: boolean;
  booths: Array<{ id: string; name: string }>;
};

function AdminMonetizationContent() {
  const searchParams = useSearchParams();
  const initialShopIdParam = searchParams.get('shopId');

  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [feeMode, setFeeMode] = useState<'percentage' | 'fixed' | 'mixed'>('percentage');
  const [feePayer, setFeePayer] = useState<'CUSTOMER' | 'MERCHANT'>('CUSTOMER');
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(5.0);
  const [platformFeeFixed, setPlatformFeeFixed] = useState<number>(0.50);
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);

  const populateShopForm = (shop: Shop) => {
    const rawPercent = shop.platformFeePercent ?? 0.0000;
    const rawFixed = shop.platformFeeFixed ?? 0.50;
    const rawPayer = (shop.feePayer ?? 'CUSTOMER') as 'CUSTOMER' | 'MERCHANT';

    let mode: 'percentage' | 'fixed' | 'mixed' = 'percentage';
    if (rawPercent > 0 && rawFixed > 0) mode = 'mixed';
    else if (rawPercent > 0) mode = 'percentage';
    else mode = 'fixed';

    setFeeMode(mode);
    setFeePayer(rawPayer);
    setPlatformFeePercent(rawPercent > 0 ? Number((rawPercent * 100).toFixed(2)) : 5.0);
    setPlatformFeeFixed(rawFixed);
    setAiEnabled(shop.aiEnabled ?? true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authenticatedFetch('/api/owner/shops?all=true');
      if (!res.ok) throw new Error(`Failed to load venues (${res.status})`);
      const data = (await res.json()) as { shops?: Shop[] };
      const loadedShops = data.shops ?? [];
      setShops(loadedShops);

      if (loadedShops.length > 0) {
        const found = selectedShopId
          ? loadedShops.find((s) => s.id === selectedShopId)
          : null;
        const target = found ?? loadedShops[0];
        setSelectedShopId(target.id);
        populateShopForm(target);
      }
    } catch (err: any) {
      setErrorMessage(err.message ?? 'Failed to load shops');
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
        const loadedShops = data.shops ?? [];
        setShops(loadedShops);

        if (loadedShops.length > 0) {
          const found = initialShopIdParam
            ? loadedShops.find((s) => s.id === initialShopIdParam)
            : null;
          const target = found ?? loadedShops[0];
          setSelectedShopId(target.id);
          populateShopForm(target);
        }
        setLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setErrorMessage(err.message ?? 'Failed to load shops');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialShopIdParam]);

  const handleSelectShop = (shopId: string) => {
    setSelectedShopId(shopId);
    setSaveSuccess(false);
    setErrorMessage(null);
    const target = shops.find((s) => s.id === shopId);
    if (target) {
      populateShopForm(target);
    }
  };

  const selectedShop = shops.find((s) => s.id === selectedShopId) ?? null;

  // Live calculation preview values for RM 20.00 sample order
  const simulatedPercent = feeMode === 'fixed' ? 0 : platformFeePercent / 100;
  const simulatedFixed = feeMode === 'percentage' ? 0 : platformFeeFixed;
  const sampleFee = 20.0 * simulatedPercent + simulatedFixed;
  const sampleCustomerTotal = feePayer === 'CUSTOMER' ? 20.0 + sampleFee : 20.0;
  const sampleStallPayout = feePayer === 'MERCHANT' ? Math.max(0, 20.0 - sampleFee) : 20.0;

  const handleSaveMonetization = async () => {
    if (!selectedShopId) return;

    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const feePercentDecimal =
        feeMode === 'fixed' ? 0.0 : Number((platformFeePercent / 100).toFixed(4));
      const feeFixedAmount =
        feeMode === 'percentage' ? 0.0 : Number(platformFeeFixed.toFixed(2));

      const response = await authenticatedFetch(`/api/owner/shops/${selectedShopId}`, {
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

      // Refresh list in background to sync state
      const res = await authenticatedFetch('/api/owner/shops?all=true');
      if (res.ok) {
        const data = (await res.json()) as { shops?: Shop[] };
        setShops(data.shops ?? []);
      }
    } catch (err: any) {
      setErrorMessage(err.message ?? 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={'/admin' as any}
              className="text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Admin Overview
            </Link>
            <span className="text-[#86868b]">&bull;</span>
            <span className="text-xs font-semibold text-[#86868b] bg-black/[0.04] border border-black/[0.06] px-2.5 py-0.5 rounded-full">
              Monetization engine
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-[#1d1d1f] tracking-[-0.03em]">
            Monetization & Platform Fees
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6e6e73]">
            Configure transaction commissions, fee-payer routing, and test calculation simulations.
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

      {loading && shops.length === 0 ? (
        <div className="rounded-3xl bg-white p-16 text-center text-[#86868b] border border-black/[0.08] shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
          <p className="text-xs sm:text-sm font-medium">Loading venues and platform fee models…</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center text-[#86868b] border border-black/[0.08] shadow-xs">
          <Building2 className="w-8 h-8 text-[#86868b] mx-auto mb-3" />
          <p className="text-base font-semibold text-[#1d1d1f]">No Food Halls Found</p>
          <p className="text-xs text-[#86868b] mt-1">Register a food hall to configure platform fees.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Main Configurator Form (Left / 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl bg-white p-6 sm:p-7 border border-black/[0.08] shadow-xs space-y-6">
              {/* Venue Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#86868b] mb-2">
                  Target venue
                </label>
                <div className="relative">
                  <select
                    value={selectedShopId}
                    onChange={(e) => handleSelectShop(e.target.value)}
                    className="w-full rounded-xl bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1d1d1f] border border-black/15 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 shadow-xs outline-none transition cursor-pointer"
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.slug ? `/${s.slug}` : 'no slug'}) &bull; {s.booths?.length ?? 0} stalls
                      </option>
                    ))}
                  </select>
                </div>
                {selectedShop && (
                  <p className="mt-1.5 text-xs text-[#86868b]">
                    Address: {selectedShop.address ?? 'Unassigned'} &bull; Status: {selectedShop.status}
                  </p>
                )}
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
                    <p className="mt-0.5 text-[11px] text-[#86868b]">e.g. 5% of order</p>
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
                    <p className="mt-0.5 text-[11px] text-[#86868b]">e.g. RM 0.50</p>
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
                    <p className="mt-0.5 text-[11px] text-[#86868b]">% + Flat rate</p>
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

                    {/* Quick percentage presets */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {[2.5, 3.5, 5.0, 7.5, 10.0].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPlatformFeePercent(preset)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition border ${
                            platformFeePercent === preset
                              ? 'bg-[#1d1d1f] text-white border-transparent shadow-xs'
                              : 'bg-white border-black/10 text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.02]'
                          }`}
                        >
                          {preset}%
                        </button>
                      ))}
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
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {[0.30, 0.50, 0.80, 1.00].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPlatformFeeFixed(preset)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition border ${
                            platformFeeFixed === preset
                              ? 'bg-[#1d1d1f] text-white border-transparent shadow-xs'
                              : 'bg-white border-black/10 text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/[0.02]'
                          }`}
                        >
                          RM {preset.toFixed(2)}
                        </button>
                      ))}
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

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-200/60">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleSaveMonetization()}
                  disabled={saving || !selectedShopId}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-black disabled:opacity-50 transition"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? 'Saving…' : 'Save'}</span>
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

          {/* Live Simulation & Details (Right / 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Calculation Preview Card */}
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

              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Real-time breakdown showing how this policy impacts customer checkout and stall merchant net payouts:
              </p>

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

              <div className="rounded-2xl bg-blue-50/50 p-4 border border-blue-200/50">
                <p className="text-xs text-[#1d1d1f] leading-relaxed">
                  <strong>Policy Summary:</strong> Platform collects{' '}
                  <span className="font-bold underline">RM {sampleFee.toFixed(2)}</span> per RM 20.00 order. Charged to{' '}
                  <span className="font-bold">{feePayer === 'CUSTOMER' ? 'Diner (Surcharge)' : 'Stall (Commission)'}</span>.
                </p>
              </div>
            </div>

            {/* Platform Security Badge */}
            <div className="rounded-3xl bg-white p-6 border border-black/[0.08] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-purple-700">
                <ShieldCheck className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-[#1d1d1f]">Engine-Level Security Protection</h3>
              </div>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                PostgreSQL mutation trigger <code className="text-[#1d1d1f] font-mono">trg_enforce_restaurant_monetization</code> validates every update against <code className="text-[#1d1d1f] font-mono">is_platform_admin()</code>. Tenant food hall owners and stall staff cannot bypass or modify these fee structures.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Venues Overview Grid */}
      <div className="rounded-3xl bg-white p-6 border border-black/[0.08] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
          <div>
            <h2 className="text-base font-semibold text-[#1d1d1f]">Active Venue Pricing Directory</h2>
            <p className="text-xs text-[#86868b]">Click any venue to load its fee configuration.</p>
          </div>
          <span className="text-xs text-[#86868b] font-mono">{shops.length} Venues</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {shops.map((s) => {
            const isSelected = s.id === selectedShopId;
            const feePercent = (s.platformFeePercent ?? 0) * 100;
            const feeFixed = s.platformFeeFixed ?? 0;
            const isDiner = (s.feePayer ?? 'CUSTOMER') === 'CUSTOMER';

            let rate = 'RM 0.50 Flat';
            if (feePercent > 0 && feeFixed > 0) rate = `${feePercent.toFixed(1)}% + RM ${feeFixed.toFixed(2)}`;
            else if (feePercent > 0) rate = `${feePercent.toFixed(1)}%`;
            else if (feeFixed > 0) rate = `RM ${feeFixed.toFixed(2)}`;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectShop(s.id)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'border-[#1d1d1f] bg-black/[0.02] shadow-xs'
                    : 'border-black/[0.06] bg-white hover:bg-black/[0.01]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#1d1d1f] truncate">{s.name}</p>
                    <p className="text-xs text-[#86868b] font-mono mt-0.5">/{s.slug ?? 'unknown'}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isDiner
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}
                  >
                    {isDiner ? 'Diner' : 'Stall'}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-black/[0.06]">
                  <span className="text-[#86868b]">Current Rate:</span>
                  <span className="font-semibold text-[#1d1d1f]">{rate}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminMonetizationPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl bg-white p-16 text-center text-[#86868b] border border-black/[0.08] shadow-xs flex flex-col items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
          <p className="text-xs sm:text-sm font-medium">Loading monetization controls…</p>
        </div>
      }
    >
      <AdminMonetizationContent />
    </Suspense>
  );
}
