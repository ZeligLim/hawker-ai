'use client';

import { LogOut, Save, Check } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { RoleModeSwitcher } from '@/components/role-mode-switcher';
import { useAuth } from '@/components/auth-provider';
import { authenticatedFetch } from '@/lib/supabase/client';
import { MonetizationSettingsCard } from '@/components/monetization-settings-card';

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
  const { signOut, roles } = useAuth();
  const isAuthorizedAdmin = roles.isSuperAdmin || roles.isSaasOwner;
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
      const response = await authenticatedFetch(`/api/owner/shops/${shop.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          address: draft.address,
          slug: draft.slug,
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

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:opacity-70 transition-all"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving changes…' : 'Save shop details'}
            </button>
            {saveSuccess ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-fade-in">
                <Check className="h-4 w-4" /> Shop details updated
              </span>
            ) : null}
          </div>
        </section>

        {/* Sensitive Platform Monetization Configuration: strictly visible only to SaaS superadmins / platform owners */}
        {isAuthorizedAdmin && (
          <MonetizationSettingsCard
            shopId={shop.id}
            initialFeeMode={draft.feeMode}
            initialFeePayer={draft.feePayer}
            initialPlatformFeePercent={draft.platformFeePercent}
            initialPlatformFeeFixed={draft.platformFeeFixed}
            onUpdated={loadShop}
          />
        )}

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
