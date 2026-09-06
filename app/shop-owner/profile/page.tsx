'use client';

import { Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Shop = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  role: string;
  booths: Array<{ id: string; name: string }>;
};

export default function ShopOwnerProfilePage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: '', address: '', slug: '' });
  const [createForm, setCreateForm] = useState({ name: '', address: '' });

  const loadShop = useCallback(async () => {
    try {
      const response = await fetch('/api/owner/shops');
      const payload = (await response.json()) as { shops?: Shop[] };
      const nextShop = payload.shops?.[0] ?? null;
      setShop(nextShop);
      if (nextShop) {
        setDraft({
          name: nextShop.name,
          address: nextShop.address ?? '',
          slug: nextShop.slug ?? '',
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
    try {
      const response = await fetch(`/api/owner/shops/${shop.id}`, {
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
      setDraft({
        name: payload.shop.name,
        address: payload.shop.address ?? '',
        slug: payload.shop.slug ?? '',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/owner/shops', {
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
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[760px]">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Shop information</h1>
          </div>
        </header>

        <section className="mt-6 rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
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
              Shop slug
              <input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
            </label>
            <label className="block text-sm font-medium">
              Address
              <input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none" />
            </label>
          </div>

          <button type="button" onClick={() => void handleSave()} disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white disabled:opacity-70">
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </section>
      </div>
    </main>
  );
}
