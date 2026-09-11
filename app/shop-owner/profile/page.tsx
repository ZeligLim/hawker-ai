'use client';

import { LogOut, Save, Percent, DollarSign, Check, Info } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { RoleModeSwitcher } from '@/components/role-mode-switcher';
import { useAuth } from '@/components/auth-provider';
import { authenticatedFetch } from '@/lib/supabase/client';

type Shop = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  role: string;
  fee_payer?: 'CUSTOMER' | 'MERCHANT';
  platform_fee_fixed?: number;
  platform_fee_percent?: number;
  feePayer?: 'CUSTOMER' | 'MERCHANT';
  platformFeeFixed?: number;
  platformFeePercent?: number;
  booths: Array<{ id: string; name: string }>;
};

export default function ShopOwnerProfilePage() {
  const { signOut } = useAuth();
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    name: '',
    address: '',
    slug: '',
    feeMode: 'percentage' as 'percentage' | 'fixed' | 'mixed',
    feePayer: 'CUSTOMER' as 'CUSTOMER' | 'MERCHANT',
    platformFeePercent: 5.0, // in percent e.g. 5.0%
    platformFeeFixed: 0.00, // in RM e.g. 0.50
  });
  const [createForm, setCreateForm] = useState({ name: '', address: '' });

  const loadShop = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/owner/shops');
      const payload = (await response.json()) as { shops?: Shop[] };
      const nextShop = payload.shops?.[0] ?? null;
      setShop(nextShop);
      if (nextShop) {
        const feePercentRaw = Number(nextShop.platform_fee_percent ?? (nextShop as any).platformFeePercent ?? 0.0000);
        const feeFixedRaw = Number(nextShop.platform_fee_fixed ?? (nextShop as any).platformFeeFixed ?? 0.50);
        const feePayerRaw = ((nextShop.fee_payer ?? (nextShop as any).feePayer ?? 'CUSTOMER') as 'CUSTOMER' | 'MERCHANT');

        let mode: 'percentage' | 'fixed' | 'mixed' = 'percentage';
        if (feePercentRaw > 0 && feeFixedRaw > 0) mode = 'mixed';
        else if (feePercentRaw > 0) mode = 'percentage';
        else mode = 'fixed';

        setDraft({
          name: nextShop.name,
          address: nextShop.address ?? '',
          slug: nextShop.slug ?? '',
          feeMode: mode,
          feePayer: feePayerRaw,
          platformFeePercent: feePercentRaw > 0 ? Number((feePercentRaw * 100).toFixed(2)) : 5.0,
          platformFeeFixed: feeFixedRaw,
        });
      }
    } catch {
      setShop(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadShop();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadShop]);

  const handleSave = async () => {
    if (!shop) return;

    setSaving(true);
    setSaveSuccess(false);
    try {
      const feePercentDecimal = draft.feeMode === 'fixed'
        ? 0.0000
        : Number((draft.platformFeePercent / 100).toFixed(4));
      const feeFixedAmount = draft.feeMode === 'percentage'
        ? 0.00
        : Number(draft.platformFeeFixed.toFixed(2));

      const response = await authenticatedFetch(`/api/owner/shops/${shop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          address: draft.address,
          slug: draft.slug,
          fee_payer: draft.feePayer,
          platform_fee_fixed: feeFixedAmount,
          platform_fee_percent: feePercentDecimal,
        }),
      });

      const payload = (await response.json()) as { error?: string; shop?: Shop };
      if (!response.ok || !payload.shop) {
        throw new Error(payload.error ?? 'Unable to update shop information.');
      }

      setShop({ ...shop, ...payload.shop, role: shop.role, booths: shop.booths });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const response = await authenticatedFetch('/api/owner/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          address: createForm.address,
        }),
      });

      const payload = (await response.json()) as { error?: string; shop?: Shop };
      if (!response.ok || !payload.shop) {
        throw new Error(payload.error ?? 'Could not create your shop.');
      }

      setShop({ ...payload.shop, role: 'owner', booths: [] });
      setCreateForm({ name: '', address: '' });
      setCreating(false);
      void loadShop();
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]"><div className="mx-auto max-w-[760px]"><p className="text-sm text-[#6e6e73]">Loading shop information…</p></div></main>;
  }

  if (!shop) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
        <div className="mx-auto max-w-[760px]">
          <header><h1 className="text-3xl font-semibold tracking-[-0.06em]">Shop information</h1></header>
          <section className="mt-6 rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-[#6e6e73]">You have not created a shop yet.</p>
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium">
                Shop name
                <input value={createForm.name} onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
              </label>
              <label className="block text-sm font-medium">
                Address
                <input value={createForm.address} onChange={(event) => setCreateForm({ ...createForm, address: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
              </label>
            </div>
            <button type="button" onClick={() => void handleCreate()} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
              Create shop
            </button>
          </section>
        </div>
      </main>
    );
  }

  // Calculate live preview example based on RM 20 subtotal
  const sampleSubtotal = 20.00;
  const simulatedPercent = draft.feeMode === 'fixed' ? 0 : draft.platformFeePercent / 100;
  const simulatedFixed = draft.feeMode === 'percentage' ? 0 : draft.platformFeeFixed;
  const sampleFee = Number(((sampleSubtotal * simulatedPercent) + simulatedFixed).toFixed(2));
  const sampleCustomerTotal = draft.feePayer === 'CUSTOMER' ? sampleSubtotal + sampleFee : sampleSubtotal;
  const sampleStallPayout = draft.feePayer === 'MERCHANT' ? Math.max(0, sampleSubtotal - sampleFee) : sampleSubtotal;

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 sm:px-6 text-[#1d1d1f]">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">Shop information</h1>
          </div>
        </header>

        {/* General Shop Profile */}
        <section className="rounded-[26px] bg-white p-5 sm:p-6 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-lg font-semibold text-white">
              {shop.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{shop.name}</h2>
              <p className="mt-1 text-sm text-[#6e6e73]">{shop.booths.length} booths · {shop.role}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <label className="block text-sm font-medium">
              Shop name
              <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
            </label>
            <label className="block text-sm font-medium">
              Shop slug (URL identifier)
              <input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none font-mono text-sm" />
            </label>
            <label className="block text-sm font-medium">
              Address
              <input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
            </label>
          </div>
        </section>

        {/* Monetization & Percentage Fee Settings */}
        <section className="rounded-[26px] bg-white p-5 sm:p-6 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-[#1d1d1f]">Monetization & Charge Settings</h2>
          </div>
          <p className="mt-1 text-xs text-[#6e6e73]">
            Configure platform fees or commission charges applied to transactions in this food hall.
          </p>

          <div className="mt-5 space-y-4">
            {/* Charge Mode Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6e6e73] mb-2">
                Charge Model
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, feeMode: 'percentage' })}
                  className={`flex flex-col items-center justify-center rounded-[16px] p-3 text-xs font-semibold border transition-all ${
                    draft.feeMode === 'percentage'
                      ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                      : 'border-black/5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5'
                  }`}
                >
                  <Percent className="h-4 w-4 mb-1" />
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, feeMode: 'fixed' })}
                  className={`flex flex-col items-center justify-center rounded-[16px] p-3 text-xs font-semibold border transition-all ${
                    draft.feeMode === 'fixed'
                      ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                      : 'border-black/5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5'
                  }`}
                >
                  <DollarSign className="h-4 w-4 mb-1" />
                  Flat Fee
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, feeMode: 'mixed' })}
                  className={`flex flex-col items-center justify-center rounded-[16px] p-3 text-xs font-semibold border transition-all ${
                    draft.feeMode === 'mixed'
                      ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                      : 'border-black/5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5'
                  }`}
                >
                  <span className="text-[11px] font-bold mb-1">% + RM</span>
                  Mixed
                </button>
              </div>
            </div>

            {/* Percentage Input */}
            {draft.feeMode === 'percentage' || draft.feeMode === 'mixed' ? (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6e6e73]">
                    Percentage Charge (%)
                  </label>
                  <span className="text-xs font-semibold text-amber-700">
                    {draft.platformFeePercent}% per order
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={draft.platformFeePercent}
                    onChange={(e) => setDraft({ ...draft, platformFeePercent: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-full rounded-[14px] bg-[#f5f5f7] px-3.5 py-2.5 text-base font-semibold text-[#1d1d1f] outline-none"
                    placeholder="5.0"
                  />
                  <span className="text-sm font-bold text-[#6e6e73]">%</span>
                </div>

                {/* Quick Presets */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[2.5, 3.0, 5.0, 8.0, 10.0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDraft({ ...draft, platformFeePercent: pct })}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-colors ${
                        draft.platformFeePercent === pct
                          ? 'border-amber-600 bg-amber-50 text-amber-800'
                          : 'border-black/5 bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f]'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Flat Fee Input */}
            {draft.feeMode === 'fixed' || draft.feeMode === 'mixed' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6e6e73] mb-2">
                  Flat Fee Amount (RM)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#6e6e73]">RM</span>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    max="10"
                    value={draft.platformFeeFixed}
                    onChange={(e) => setDraft({ ...draft, platformFeeFixed: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-full rounded-[14px] bg-[#f5f5f7] px-3.5 py-2.5 text-base font-semibold text-[#1d1d1f] outline-none"
                    placeholder="0.50"
                  />
                </div>
              </div>
            ) : null}

            {/* Fee Payer */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6e6e73] mb-2">
                Fee Payer
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, feePayer: 'CUSTOMER' })}
                  className={`rounded-[16px] p-3 text-left border transition-all ${
                    draft.feePayer === 'CUSTOMER'
                      ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                      : 'border-black/5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5'
                  }`}
                >
                  <p className="text-xs font-bold">Diner Pays Fee</p>
                  <p className={`mt-0.5 text-[11px] ${draft.feePayer === 'CUSTOMER' ? 'text-white/80' : 'text-[#6e6e73]'}`}>
                    Added to diner bill as service charge
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, feePayer: 'MERCHANT' })}
                  className={`rounded-[16px] p-3 text-left border transition-all ${
                    draft.feePayer === 'MERCHANT'
                      ? 'border-[#111827] bg-[#111827] text-white shadow-sm'
                      : 'border-black/5 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5'
                  }`}
                >
                  <p className="text-xs font-bold">Stall Pays Commission</p>
                  <p className={`mt-0.5 text-[11px] ${draft.feePayer === 'MERCHANT' ? 'text-white/80' : 'text-[#6e6e73]'}`}>
                    Deducted from vendor payout
                  </p>
                </button>
              </div>
            </div>

            {/* Live Calculation Preview Box */}
            <div className="rounded-[18px] bg-[#f9fafb] border border-black/5 p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1d1d1f]">
                <Info className="h-3.5 w-3.5 text-blue-600" />
                Live Order Preview (RM 20.00 Order)
              </div>
              <div className="mt-2 space-y-1 text-xs text-[#6e6e73]">
                <div className="flex justify-between">
                  <span>Food Subtotal:</span>
                  <span className="font-medium text-[#1d1d1f]">RM 20.00</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>
                    Charge ({draft.feeMode === 'percentage' ? `${draft.platformFeePercent}%` : draft.feeMode === 'fixed' ? 'Fixed' : `${draft.platformFeePercent}% + RM${draft.platformFeeFixed}`}):
                  </span>
                  <span className="font-semibold">RM {sampleFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-black/5 font-semibold text-[#1d1d1f]">
                  <span>Customer Pays:</span>
                  <span>RM {sampleCustomerTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Stall Receives:</span>
                  <span className="font-semibold">RM {sampleStallPayout.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:opacity-70 transition-all"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving changes…' : 'Save all settings'}
            </button>
            {saveSuccess ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-fade-in">
                <Check className="h-4 w-4" /> Settings updated successfully
              </span>
            ) : null}
          </div>
        </section>

        <div className="mt-6">
          <RoleModeSwitcher currentMode="shop_owner" />
        </div>

        <button
          type="button"
          onClick={() => setIsSignOutDialogOpen(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white hover:bg-black transition-all"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>

        {isSignOutDialogOpen ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4" role="presentation">
            <div role="dialog" aria-modal="true" aria-labelledby="shop-owner-sign-out-title" className="w-full max-w-[360px] rounded-[24px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
              <h2 id="shop-owner-sign-out-title" className="text-xl font-semibold tracking-[-0.04em]">Sign out?</h2>
              <p className="mt-2 text-sm text-[#6e6e73]">You can sign in again anytime to manage your food hall.</p>
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => setIsSignOutDialogOpen(false)} className="flex-1 rounded-full bg-[#f5f5f7] px-4 py-3 text-sm font-semibold text-[#1d1d1f]">
                  Cancel
                </button>
                <button type="button" onClick={() => void signOut()} className="flex-1 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
