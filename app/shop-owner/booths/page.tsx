'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  LoaderCircle,
  Mail,
  Pencil,
  Plus,
  Send,
  ShieldCheck,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import { authenticatedFetch } from '@/lib/supabase/client';

type BoothMember = {
  userId: string;
  email: string;
  role: string;
  createdAt?: string;
};

type BoothInvitation = {
  id: string;
  email: string;
  expiresAt: string;
  createdAt?: string;
};

type Booth = {
  id: string;
  name: string;
  status: 'Active' | 'Needs update';
  manager?: string;
  members?: BoothMember[];
  invitations?: BoothInvitation[];
};

type ShopMembership = {
  id: string;
  name: string;
  role: string;
  booths: Array<{
    id: string;
    name: string;
    members?: BoothMember[];
    invitations?: BoothInvitation[];
  }>;
};

export default function ShopOwnerBoothsPage() {
  const [shops, setShops] = useState<ShopMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Booth | null>(null);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ slotName: '', restaurantId: '', vendorEmail: '' });

  // Per-booth email input state
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});
  const [sendingState, setSendingState] = useState<Record<string, boolean>>({});
  const [removingState, setRemovingState] = useState<Record<string, boolean>>({});
  const [feedbacks, setFeedbacks] = useState<
    Record<string, { type: 'success' | 'error'; message: string; link?: string; delivered?: boolean }>
  >({});
  const [copiedLinks, setCopiedLinks] = useState<Record<string, boolean>>({});

  const loadShops = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/owner/shops');
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

  const boothList: Booth[] = shops.flatMap((shop) =>
    shop.booths.map((booth) => ({
      id: booth.id,
      name: booth.name,
      status: 'Active' as const,
      manager: shop.role,
      members: booth.members ?? [],
      invitations: booth.invitations ?? [],
    })),
  );

  const handleOpenAddSlot = () => {
    setNewSlot({
      slotName: `Slot #${String(boothList.length + 1).padStart(2, '0')}`,
      restaurantId: shops[0]?.id ?? '',
      vendorEmail: '',
    });
    setIsAddSlotOpen(true);
  };

  const handleSendSetupLink = async (boothId: string, directEmail?: string) => {
    const targetEmail = (directEmail ?? emailInputs[boothId] ?? '').trim().toLowerCase();

    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setFeedbacks((prev) => ({
        ...prev,
        [boothId]: { type: 'error', message: 'Please enter a valid email address.' },
      }));
      return;
    }

    setSendingState((prev) => ({ ...prev, [boothId]: true }));
    setFeedbacks((prev) => {
      const next = { ...prev };
      delete next[boothId];
      return next;
    });

    try {
      const response = await authenticatedFetch(`/api/owner/booths/${boothId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      const payload = (await response.json()) as {
        token?: string;
        setupLink?: string;
        error?: string;
        message?: string;
        delivered?: boolean;
        provider?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to send setup link.');
      }

      setEmailInputs((prev) => ({ ...prev, [boothId]: '' }));
      setFeedbacks((prev) => ({
        ...prev,
        [boothId]: {
          type: 'success',
          message: payload.message ?? `Setup link sent to ${targetEmail}`,
          link: payload.setupLink,
          delivered: payload.delivered,
        },
      }));

      await loadShops();
    } catch (error) {
      setFeedbacks((prev) => ({
        ...prev,
        [boothId]: {
          type: 'error',
          message: error instanceof Error ? error.message : 'Unable to send setup link.',
        },
      }));
    } finally {
      setSendingState((prev) => ({ ...prev, [boothId]: false }));
    }
  };

  const handleRemoveAccess = async (boothId: string, email: string) => {
    const key = `${boothId}-${email}`;
    setRemovingState((prev) => ({ ...prev, [key]: true }));

    try {
      const response = await authenticatedFetch(`/api/owner/booths/${boothId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to remove email.');
      }

      setFeedbacks((prev) => ({
        ...prev,
        [boothId]: {
          type: 'success',
          message: `Removed ${email}. They have lost control of the store.`,
        },
      }));

      await loadShops();
    } catch (error) {
      setFeedbacks((prev) => ({
        ...prev,
        [boothId]: {
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to remove access.',
        },
      }));
    } finally {
      setRemovingState((prev) => ({ ...prev, [key]: false }));
    }
  };

  const copyLink = (linkUrl: string, key: string) => {
    navigator.clipboard?.writeText(linkUrl);
    setCopiedLinks((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedLinks((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleCreateSlot = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newSlot.slotName.trim() || !newSlot.restaurantId) return;

    setIsCreatingSlot(true);
    try {
      // 1. Provision the booth slot
      const boothRes = await authenticatedFetch('/api/owner/booths', {
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

      const createdBoothId = boothData.booth.id;

      // 2. If vendor email was provided, send setup link immediately
      if (newSlot.vendorEmail.trim()) {
        await handleSendSetupLink(createdBoothId, newSlot.vendorEmail.trim());
      }

      setIsAddSlotOpen(false);
      await loadShops();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create slot');
    } finally {
      setIsCreatingSlot(false);
    }
  };

  const handleSaveBooth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;

    try {
      const response = await authenticatedFetch(`/api/owner/booths/${editing.id}`, {
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
      alert(error instanceof Error ? error.message : 'Failed to update booth');
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[980px]">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Booth Slots & Access</h1>
            <p className="mt-1 text-sm text-[#6e6e73]">
              Send setup links to vendor emails. Only authorized emails can edit the store; removing an email revokes control immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddSlot}
            className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0077ed] transition-all shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Add Booth Slot
          </button>
        </header>

        <section className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-[#6e6e73] text-sm">
              <LoaderCircle className="h-4 w-4 animate-spin mr-2 text-[#0071e3]" /> Loading booths…
            </div>
          ) : boothList.length === 0 ? (
            <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <Store className="h-10 w-10 text-[#86868b] mx-auto mb-3" />
              <p className="text-base font-semibold text-[#1d1d1f]">No booth slots created yet</p>
              <p className="mt-1 text-xs text-[#6e6e73] max-w-sm mx-auto">
                Add your first booth slot and send a setup link to a vendor email so they can name their stall and set up their menu.
              </p>
              <button
                type="button"
                onClick={handleOpenAddSlot}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#111827] px-5 py-2.5 text-xs font-semibold text-white hover:bg-black transition-all"
              >
                <Plus className="h-3.5 w-3.5" /> Add Booth Slot
              </button>
            </div>
          ) : (
            boothList.map((booth) => {
              const feedback = feedbacks[booth.id];
              const isSending = sendingState[booth.id];
              const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

              const activeMembers = booth.members ?? [];
              const pendingInvites = booth.invitations ?? [];
              const hasAuthorizedUsers = activeMembers.length > 0 || pendingInvites.length > 0;

              return (
                <article
                  key={booth.id}
                  className="rounded-[24px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)] border border-black/[0.04]"
                >
                  {/* Booth Slot Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0071e3]/10 text-[#0071e3]">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[#1d1d1f]">{booth.name}</p>
                        <p className="mt-0.5 text-xs text-[#6e6e73]">
                          Role: {booth.manager ?? 'Shop owner'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#30d158]/15 px-2.5 py-1 text-xs font-semibold text-[#166534]">
                        {booth.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditing(booth)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.03]"
                        aria-label="Edit Slot"
                      >
                        <Pencil className="h-3 w-3" />
                        <span className="hidden sm:inline">Edit Slot</span>
                      </button>
                    </div>
                  </div>

                  {/* Send Setup Link Section */}
                  <div className="mt-5 rounded-[20px] bg-[#f5f5f7] p-4 border border-black/[0.04]">
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-[#1d1d1f]">Send Setup Link</p>
                      <p className="text-[11px] text-[#6e6e73]">
                        Enter the vendor&apos;s email to send a setup link. Only the recipient can claim and edit this store.
                      </p>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
                        <input
                          type="email"
                          value={emailInputs[booth.id] ?? ''}
                          onChange={(e) =>
                            setEmailInputs((prev) => ({ ...prev, [booth.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              void handleSendSetupLink(booth.id);
                            }
                          }}
                          placeholder="vendor@stall.com"
                          className="w-full rounded-full border border-black/10 bg-white py-2 pl-9 pr-3 text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:border-[#0071e3] focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() => void handleSendSetupLink(booth.id)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#0071e3] px-3.5 sm:px-4 py-2 text-xs font-semibold text-white hover:bg-[#0077ed] disabled:opacity-50 transition-colors shrink-0 shadow-sm"
                        aria-label="Send setup link"
                      >
                        {isSending ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden xs:inline">Send Link</span>
                      </button>
                    </div>

                    {feedback && (
                      <div
                        className={`mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl p-3 text-xs ${
                          feedback.type === 'success'
                            ? 'bg-[#30d158]/10 text-[#166534] border border-[#30d158]/20'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {feedback.delivered ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#30d158]" />
                          ) : feedback.type === 'success' ? (
                            <Mail className="h-4 w-4 shrink-0 text-[#0071e3]" />
                          ) : null}
                          <span className="font-medium leading-snug">{feedback.message}</span>
                        </div>
                        {feedback.link && (
                          <button
                            type="button"
                            onClick={() => copyLink(feedback.link!, `feedback-${booth.id}`)}
                            className="inline-flex items-center gap-1 font-semibold text-[#0071e3] hover:underline shrink-0"
                          >
                            {copiedLinks[`feedback-${booth.id}`] ? (
                              <>
                                <Check className="h-3.5 w-3.5" /> Link Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" /> Copy Setup Link
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Authorized Emails List */}
                  <div className="mt-4 pt-3 border-t border-black/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#0071e3]" />
                        <span className="text-xs font-semibold text-[#1d1d1f]">
                          Authorized Store Access ({activeMembers.length + pendingInvites.length})
                        </span>
                      </div>
                      <span className="text-[11px] text-[#86868b]">
                        Only listed emails can edit
                      </span>
                    </div>

                    {!hasAuthorizedUsers ? (
                      <p className="text-xs text-[#86868b] italic py-1">
                        No vendor emails authorized yet. Enter an email above to send a setup link.
                      </p>
                    ) : (
                      <div className="space-y-1.5 mt-2">
                        {/* Active members */}
                        {activeMembers.map((member) => {
                          const removeKey = `${booth.id}-${member.email}`;
                          const isRemoving = removingState[removeKey];

                          return (
                            <div
                              key={member.userId || member.email}
                              className="flex items-center justify-between gap-2 rounded-xl bg-[#f5f5f7]/60 px-3 py-2 text-xs border border-black/[0.03]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="h-2 w-2 rounded-full bg-[#30d158] shrink-0" />
                                <span className="font-medium text-[#1d1d1f] truncate">
                                  {member.email || `User ID: ${member.userId.slice(0, 8)}…`}
                                </span>
                                <span className="rounded-full bg-[#30d158]/15 px-2 py-0.5 text-[10px] font-semibold text-[#166534] shrink-0">
                                  Active {member.role === 'owner' ? 'Manager' : member.role}
                                </span>
                              </div>

                              <button
                                type="button"
                                disabled={isRemoving}
                                onClick={() => void handleRemoveAccess(booth.id, member.email)}
                                title="Remove access to store"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-2 py-1 transition-colors shrink-0 disabled:opacity-50"
                                aria-label="Remove access"
                              >
                                {isRemoving ? (
                                  <LoaderCircle className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            </div>
                          );
                        })}

                        {/* Pending invitations */}
                        {pendingInvites.map((invite) => {
                          const removeKey = `${booth.id}-${invite.email}`;
                          const isRemoving = removingState[removeKey];
                          const linkKey = `invite-${invite.id}`;
                          const isCopied = copiedLinks[linkKey];

                          return (
                            <div
                              key={invite.id}
                              className="flex items-center justify-between gap-2 rounded-xl bg-[#f5f5f7]/60 px-3 py-2 text-xs border border-black/[0.03]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                <span className="font-medium text-[#1d1d1f] truncate">
                                  {invite.email}
                                </span>
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 shrink-0">
                                  Pending<span className="hidden sm:inline"> Setup</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyLink(
                                      `${origin}/booths/join?token=${encodeURIComponent(invite.id)}`,
                                      linkKey,
                                    )
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0071e3] hover:underline px-1.5 py-1"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="h-3 w-3" /> <span className="hidden sm:inline">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" /> <span className="hidden sm:inline">Copy Link</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  disabled={isRemoving}
                                  onClick={() => void handleRemoveAccess(booth.id, invite.email)}
                                  title="Cancel invitation"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-2 py-1 transition-colors disabled:opacity-50"
                                  aria-label="Revoke invite"
                                >
                                  {isRemoving ? (
                                    <LoaderCircle className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                  <span className="hidden sm:inline">Revoke</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>

      {/* ADD BOOTH SLOT MODAL */}
      {isAddSlotOpen ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4 sm:items-center backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-[#0071e3]" />
                <h2 className="text-xl font-semibold tracking-tight">Add Booth Slot</h2>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setIsAddSlotOpen(false)}
                className="p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="mt-4 space-y-4">
              {shops.length > 1 && (
                <label className="block text-xs font-semibold text-[#1d1d1f]">
                  Food Hall / Venue
                  <select
                    value={newSlot.restaurantId}
                    onChange={(event) =>
                      setNewSlot({ ...newSlot, restaurantId: event.target.value })
                    }
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

              <label className="block text-xs font-semibold text-[#1d1d1f]">
                Vendor Email (Optional)
                <input
                  type="email"
                  value={newSlot.vendorEmail}
                  onChange={(event) =>
                    setNewSlot({ ...newSlot, vendorEmail: event.target.value })
                  }
                  placeholder="vendor@stall.com"
                  className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#0071e3]"
                />
                <span className="mt-1 block text-[11px] text-[#86868b]">
                  If provided, a setup link will be automatically sent to this email upon creation.
                </span>
              </label>

              <button
                type="submit"
                disabled={isCreatingSlot}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#0071e3] px-4 py-3 text-xs font-semibold text-white hover:bg-[#0077ed] transition-all disabled:opacity-70"
              >
                {isCreatingSlot ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" /> Provisioning Slot...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Create Booth Slot
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* EDIT BOOTH SLOT MODAL */}
      {editing ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4 sm:items-center backdrop-blur-xs">
          <form
            onSubmit={handleSaveBooth}
            className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit Booth Slot</h2>
              <button
                type="button"
                aria-label="Close edit dialog"
                onClick={() => setEditing(null)}
              >
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
