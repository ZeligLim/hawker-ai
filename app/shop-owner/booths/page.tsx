'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, KeyRound, LoaderCircle, Pencil, RefreshCw, Sparkles, Store, X } from 'lucide-react';

type Booth = {
  id: string;
  name: string;
  status: 'Active' | 'Needs update';
  manager?: string;
};

type ShopMembership = {
  id: string;
  name: string;
  role: string;
  booths: Array<{ id: string; name: string }>;
};

export default function ShopOwnerBoothsPage() {
  const [shops, setShops] = useState<ShopMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Booth | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSlot, setNewSlot] = useState({ slotName: '', restaurantId: '' });
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<{ slotName: string; token: string } | null>(null);
  const [generatedTokens, setGeneratedTokens] = useState<Record<string, string>>({});
  const [copiedTokens, setCopiedTokens] = useState<Record<string, boolean>>({});

  const loadShops = useCallback(async () => {
    try {
      const response = await fetch('/api/owner/shops');
      const payload = (await response.json()) as { shops?: ShopMembership[] };
      setShops(payload.shops ?? []);
      const defaultRestaurantId = payload.shops?.[0]?.id ?? '';
      setNewSlot((current) => ({
        ...current,
        restaurantId: current.restaurantId || defaultRestaurantId,
      }));
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadShops();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadShops]);

  const boothList = shops.flatMap((shop) =>
    shop.booths.map((booth) => ({
      ...booth,
      status: 'Active' as const,
      manager: shop.role,
    })),
  );

  const handleOpenGenerate = () => {
    setNewSlot({
      slotName: `Slot #${String(boothList.length + 1).padStart(2, '0')}`,
      restaurantId: shops[0]?.id ?? '',
    });
    setNewlyCreatedToken(null);
    setIsGenerateOpen(true);
  };

  const handleCreateSlotAndToken = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newSlot.slotName.trim() || !newSlot.restaurantId) return;

    setIsGenerating(true);
    try {
      // 1. Provision the booth slot
      const boothRes = await fetch('/api/owner/booths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSlot.slotName.trim(),
          restaurantId: newSlot.restaurantId,
        }),
      });

      const boothData = await boothRes.json();
      if (!boothRes.ok || !boothData.booth?.id) {
        throw new Error(boothData.error ?? 'Unable to create booth slot.');
      }

      const boothId = boothData.booth.id;

      // 2. Generate invite token for the slot
      const inviteRes = await fetch(`/api/owner/booths/${boothId}/invite`, {
        method: 'POST',
      });
      const inviteData = await inviteRes.json();
      if (!inviteRes.ok || !inviteData.token) {
        throw new Error(inviteData.error ?? 'Unable to generate invitation token.');
      }

      setGeneratedTokens((prev) => ({ ...prev, [boothId]: inviteData.token }));
      setNewlyCreatedToken({ slotName: newSlot.slotName.trim(), token: inviteData.token });
      await loadShops();
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInvite = async (boothId: string) => {
    try {
      const response = await fetch(`/api/owner/booths/${boothId}/invite`, {
        method: 'POST',
      });

      const payload = (await response.json()) as { token?: string; error?: string };
      if (!response.ok || !payload.token) {
        throw new Error(payload.error ?? 'Unable to generate invite.');
      }

      setGeneratedTokens((current) => ({
        ...current,
        [boothId]: payload.token!,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const copyInviteLink = (token: string, key: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    navigator.clipboard?.writeText(`${origin}/booths/join?token=${token}`);
    setCopiedTokens((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedTokens((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleSaveBooth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;

    try {
      const response = await fetch(`/api/owner/booths/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editing.name }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to update booth.');
      }

      setEditing(null);
      await loadShops();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[980px]">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Booth Slots & Tokens</h1>
            <p className="mt-1 text-sm text-[#6e6e73]">
              Generate invitation tokens for your food stalls. Vendors redeem them to name their stall and set up their kitchen.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenGenerate}
            className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0077ed] transition-all shrink-0"
          >
            <KeyRound className="h-3.5 w-3.5" /> Generate Booth Token
          </button>
        </header>

        <section className="mt-6 space-y-3">
          {loading ? (
            <p className="text-sm text-[#6e6e73]">Loading booths…</p>
          ) : boothList.length === 0 ? (
            <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <Store className="h-10 w-10 text-[#86868b] mx-auto mb-3" />
              <p className="text-base font-semibold text-[#1d1d1f]">No booth slots generated yet</p>
              <p className="mt-1 text-xs text-[#6e6e73] max-w-sm mx-auto">
                Generate your first booth invitation token. Share the link with your stall vendor so they can activate their live kitchen.
              </p>
              <button
                type="button"
                onClick={handleOpenGenerate}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-2.5 text-xs font-semibold text-white hover:bg-black transition-all"
              >
                <KeyRound className="h-3.5 w-3.5" /> Generate Booth Token
              </button>
            </div>
          ) : (
            boothList.map((booth) => {
              const token = generatedTokens[booth.id];
              const isCopied = copiedTokens[booth.id];

              return (
                <article key={booth.id} className="rounded-[24px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)] border border-black/[0.04]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">{booth.name}</p>
                        <p className="mt-0.5 text-xs text-[#6e6e73]">Status: Active &bull; Role: {booth.manager ?? 'Shop owner'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#30d158]/15 px-2.5 py-1 text-xs font-semibold text-[#166534]">
                        {booth.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditing(booth)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.03]"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit Slot
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-[18px] bg-[#f5f5f7] p-3.5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73]">
                        Booth Invitation Token
                      </p>
                      {token ? (
                        <p className="mt-1 font-mono text-sm font-bold text-[#1d1d1f] tracking-wide">
                          {token}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-[#6e6e73]">
                          Generate an invitation link for a vendor to claim this booth slot.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {token ? (
                        <>
                          <button
                            type="button"
                            onClick={() => copyInviteLink(token, booth.id)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0077ed] transition-colors"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {isCopied ? 'Link Copied' : 'Copy Invite Link'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void generateInvite(booth.id)}
                            title="Regenerate token"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-black/10 bg-white text-[#6e6e73] hover:text-[#1d1d1f]"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void generateInvite(booth.id)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#111827] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-black transition-colors"
                        >
                          <KeyRound className="h-3.5 w-3.5" /> Generate Token
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {/* GENERATE BOOTH TOKEN MODAL */}
      {isGenerateOpen ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4 sm:items-center backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[#0071e3]" />
                <h2 className="text-xl font-semibold tracking-tight">Generate Booth Token</h2>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setIsGenerateOpen(false)}
                className="p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {newlyCreatedToken ? (
              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/20 text-[#166534]">
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Booth Token Created for {newlyCreatedToken.slotName}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] text-center space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
                    Cryptographic Invitation Code
                  </p>
                  <p className="font-mono text-2xl font-bold tracking-widest text-[#1d1d1f]">
                    {newlyCreatedToken.token}
                  </p>
                </div>

                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  Send this 1-click invitation link to your stall vendor. Upon clicking, they name their stall, configure menu items, and launch their kitchen display.
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => copyInviteLink(newlyCreatedToken.token, 'modal')}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0071e3] px-4 py-3 text-xs font-semibold text-white hover:bg-[#0077ed] transition-all shadow-sm"
                  >
                    {copiedTokens['modal'] ? (
                      <>
                        <Check className="h-4 w-4" /> Link Copied to Clipboard
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy Invitation Link
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsGenerateOpen(false)}
                    className="w-full rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.03]"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateSlotAndToken} className="mt-4 space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-[#0071e3] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#6e6e73] leading-relaxed">
                    Shop owners only manage slots and tokens. Your stall vendor will provide their own brand name and menu when redeeming this token.
                  </p>
                </div>

                {shops.length > 1 && (
                  <label className="block text-xs font-semibold text-[#1d1d1f]">
                    Food Hall / Venue
                    <select
                      value={newSlot.restaurantId}
                      onChange={(event) => setNewSlot({ ...newSlot, restaurantId: event.target.value })}
                      className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0071e3]"
                    >
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="block text-xs font-semibold text-[#1d1d1f]">
                  Booth Slot Identifier
                  <input
                    value={newSlot.slotName}
                    onChange={(event) => setNewSlot({ ...newSlot, slotName: event.target.value })}
                    placeholder="e.g. Slot #02, Counter 2"
                    className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0071e3]"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#0071e3] px-4 py-3 text-xs font-semibold text-white hover:bg-[#0077ed] transition-all disabled:opacity-70"
                >
                  {isGenerating ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" /> Generating Token...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" /> Generate Token & Provision Slot
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}

      {/* EDIT BOOTH SLOT MODAL */}
      {editing ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4 sm:items-center backdrop-blur-xs">
          <form onSubmit={handleSaveBooth} className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit Booth Slot</h2>
              <button type="button" aria-label="Close edit dialog" onClick={() => setEditing(null)}>
                <X className="h-5 w-5 text-[#6e6e73]" />
              </button>
            </div>

            <label className="block text-xs font-semibold text-[#1d1d1f]">
              Booth Slot Identifier
              <input
                value={editing.name}
                onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0071e3]"
              />
            </label>

            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-[#111827] px-4 py-3 text-xs font-semibold text-white hover:bg-black transition-all"
            >
              Save Slot Changes
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
