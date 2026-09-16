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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={'/admin' as any}
              className="text-xs font-semibold text-slate-400 hover:text-white transition inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Admin Overview
            </Link>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
              Monetization Engine
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Monetization & Platform Fee Controls
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Configure transaction commissions, fee-payer routing, and test calculation simulations.
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

      {loading && shops.length === 0 ? (
        <div className="rounded-3xl bg-[#111827] p-16 text-center text-slate-400 border border-white/10 flex flex-col items-center justify-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="text-sm font-medium">Loading venues and platform fee models…</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="rounded-3xl bg-[#111827] p-12 text-center text-slate-400 border border-white/10">
          <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-white">No Food Halls Found</p>
          <p className="text-xs text-slate-400 mt-1">Register a food hall to configure platform fees.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Configurator Form (Left / 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl bg-[#111827] p-6 sm:p-7 border border-white/10 shadow-xl space-y-6">
              {/* Venue Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Target Venue / Food Hall
                </label>
                <div className="relative">
                  <select
                    value={selectedShopId}
                    onChange={(e) => handleSelectShop(e.target.value)}
                    className="w-full rounded-2xl bg-[#0e1424] px-4 py-3.5 text-sm font-semibold text-white border border-white/10 focus:border-amber-500 focus:outline-hidden transition"
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.slug ? `/${s.slug}` : 'no slug'}) &bull; {s.booths?.length ?? 0} stalls
                      </option>
                    ))}
                  </select>
                </div>
                {selectedShop && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Address: {selectedShop.address ?? 'Unassigned'} &bull; Status: {selectedShop.status}
                  </p>
                )}
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
                    <p className="mt-1 text-[11px] text-slate-400">e.g. 5% of order</p>
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
                    <p className="mt-1 text-[11px] text-slate-400">e.g. RM 0.50 per order</p>
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
                    <p className="mt-1 text-[11px] text-slate-400">% + Flat rate</p>
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

                    {/* Quick percentage presets */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {[2.5, 3.5, 5.0, 7.5, 10.0].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPlatformFeePercent(preset)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            platformFeePercent === preset
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10'
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
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {[0.30, 0.50, 0.80, 1.00].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPlatformFeeFixed(preset)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            platformFeeFixed === preset
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10'
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
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                      Added directly to the diner’s bill at checkout as a service charge.
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
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                      Deducted automatically from vendor payouts on order completion.
                    </p>
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 p-4 text-xs font-semibold text-red-400 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleSaveMonetization()}
                  disabled={saving || !selectedShopId}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 disabled:opacity-50 transition"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Applying rate changes…' : 'Save Platform Policy'}</span>
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

          {/* Live Simulation & Details (Right / 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Calculation Preview Card */}
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

              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time breakdown showing how this policy impacts customer checkout and stall merchant net payouts:
              </p>

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

              <div className="rounded-2xl bg-amber-500/5 p-4 border border-amber-500/15">
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  <strong>Policy Summary:</strong> Platform collects{' '}
                  <span className="font-bold underline">RM {sampleFee.toFixed(2)}</span> per RM 20.00 order. Charged to{' '}
                  <span className="font-bold">{feePayer === 'CUSTOMER' ? 'Diner (Surcharge)' : 'Stall (Commission)'}</span>.
                </p>
              </div>
            </div>

            {/* Platform Security Badge */}
            <div className="rounded-3xl bg-[#111827] p-6 border border-white/10 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Engine-Level Security Protection</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                PostgreSQL mutation trigger <code className="text-slate-300">trg_enforce_restaurant_monetization</code> validates every update against <code className="text-slate-300">is_platform_admin()</code>. Tenant food hall owners and stall staff cannot bypass or modify these fee structures.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Venues Overview Grid */}
      <div className="rounded-3xl bg-[#111827] p-6 border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Active Venue Pricing Directory</h2>
            <p className="text-xs text-slate-400">Click any venue to load its fee configuration.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{shops.length} Venues</span>
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
                    ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                    : 'border-white/5 bg-[#0e1424] hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">/{s.slug ?? 'unknown'}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isDiner
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isDiner ? 'Diner' : 'Stall'}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-white/5">
                  <span className="text-slate-400">Current Rate:</span>
                  <span className="font-bold text-amber-400">{rate}</span>
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
        <div className="rounded-3xl bg-[#111827] p-16 text-center text-slate-400 border border-white/10 flex flex-col items-center justify-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="text-sm font-medium">Loading monetization controls…</p>
        </div>
      }
    >
      <AdminMonetizationContent />
    </Suspense>
  );
}
