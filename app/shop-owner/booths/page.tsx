'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  LoaderCircle,
  Mail,
  Pencil,
  Plus,
  Power,
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
  isOpen?: boolean;
  restaurantId?: string;
  manager?: string;
  members?: BoothMember[];
  invitations?: BoothInvitation[];
};

type ShopMembership = {
  id: string;
  name: string;
  role: string;
  isActive?: boolean;
  booths: Array<{
    id: string;
    name: string;
    isOpen?: boolean;
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

  // Booth deletion state
  const [boothToDelete, setBoothToDelete] = useState<Booth | null>(null);
  const [isDeletingBooth, setIsDeletingBooth] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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
      isOpen: booth.isOpen !== false,
      restaurantId: shop.id,
      manager: shop.role,
      members: booth.members ?? [],
      invitations: booth.invitations ?? [],
    })),
  );

  const handleToggleBoothOpen = async (boothId: string, currentIsOpen: boolean) => {
    const nextOpen = !currentIsOpen;
    setShops((prev) =>
      prev.map((s) => ({
        ...s,
        booths: s.booths.map((b) => (b.id === boothId ? { ...b, isOpen: nextOpen } : b)),
      }))
    );

    try {
      const res = await authenticatedFetch(`/api/owner/booths/${boothId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_open: nextOpen }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to update booth status');
      }
      await loadShops();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update booth status');
      setShops((prev) =>
        prev.map((s) => ({
          ...s,
          booths: s.booths.map((b) => (b.id === boothId ? { ...b, isOpen: currentIsOpen } : b)),
        }))
      );
    }
  };

  const handleToggleShopActive = async (shopId: string, currentIsActive: boolean) => {
    const nextActive = !currentIsActive;
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, isActive: nextActive } : s))
    );

    try {
      const res = await authenticatedFetch(`/api/owner/shops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to update shop status');
      }
      await loadShops();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update shop status');
      setShops((prev) =>
        prev.map((s) => (s.id === shopId ? { ...s, isActive: currentIsActive } : s))
      );
    }
  };

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

  const handleDeleteBooth = async (boothId: string) => {
    setIsDeletingBooth(true);
    setDeleteError('');
    try {
      const response = await authenticatedFetch(`/api/owner/booths/${boothId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to delete booth slot.');
      }
      setBoothToDelete(null);
      await loadShops();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Unable to delete booth.');
    } finally {
      setIsDeletingBooth(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 sm:px-6 text-[#1d1d1f]">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#1d1d1f] mb-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>Stall Allocation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f] truncate">
              Booth Slots & Access
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6e6e73] truncate">
              Send setup links to vendor emails. Only authorized emails can edit the store; removing an email revokes control immediately.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {shops[0] && (
              <button
                type="button"
                onClick={() => handleToggleShopActive(shops[0].id, shops[0].isActive !== false)}
                title={shops[0].isActive !== false ? 'Put shop as inactive' : 'Set shop as active'}
                aria-label={shops[0].isActive !== false ? 'Put shop as inactive' : 'Set shop as active'}
                className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all shadow-xs shrink-0 ${
                  shops[0].isActive !== false
                    ? 'border-amber-200 bg-amber-50/80 text-amber-700 hover:bg-amber-100'
                    : 'border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                <span>{shops[0].isActive !== false ? 'Shop Active' : 'Shop Inactive'}</span>
              </button>
            )}
            <Link
              href={'/shop-owner/analytics' as any}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 text-xs font-semibold text-[#1d1d1f] shadow-xs hover:bg-black/[0.03] transition-all shrink-0"
              title="Venue Analytics"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Venue Analytics</span>
            </Link>
            <button
              type="button"
              onClick={handleOpenAddSlot}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#111827] px-4 text-xs font-semibold text-white shadow-xs hover:bg-black transition-all shrink-0"
            >
              <Plus className="h-3.5 w-3.5" /> Add Booth Slot
            </button>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 items-start">
          {loading ? (
            <div className="col-span-full flex items-center justify-center p-12 text-[#6e6e73] text-sm">
              <LoaderCircle className="h-4 w-4 animate-spin mr-2 text-[#111827]" /> Loading booths…
            </div>
          ) : boothList.length === 0 ? (
            <div className="col-span-full rounded-[24px] bg-white p-8 text-center shadow-[0_12px_26px_rgba(15,23,42,0.04)] border border-black/[0.04]">
              <Store className="h-10 w-10 text-[#86868b] mx-auto mb-3" />
              <p className="text-base font-semibold text-[#1d1d1f] truncate">No booth slots created yet</p>
              <p className="mt-1 text-xs text-[#6e6e73] max-w-sm mx-auto truncate">
                Add your first booth slot and send a setup link to a vendor email.
              </p>
              <button
                type="button"
                onClick={handleOpenAddSlot}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-[#111827] px-4 text-xs font-semibold text-white hover:bg-black transition-all shadow-xs"
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
                  className="flex flex-col justify-between rounded-[24px] bg-white p-4 sm:p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)] border border-black/[0.04] transition-all hover:shadow-[0_16px_32px_rgba(15,23,42,0.06)]"
                >
                  {/* Booth Slot Header */}
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-[#1d1d1f] shrink-0">
                        <Store className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-[#1d1d1f] truncate">{booth.name}</p>
                        <p className="text-[11px] text-[#6e6e73] truncate">
                          Role: {booth.manager ?? 'Shop owner'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                          booth.isOpen !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            booth.isOpen !== false ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                          }`}
                        />
                        {booth.isOpen !== false ? 'Open' : 'Closed'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleBoothOpen(booth.id, booth.isOpen !== false)}
                        title={booth.isOpen !== false ? 'Close Stall' : 'Open Stall'}
                        aria-label={booth.isOpen !== false ? 'Close Stall' : 'Open Stall'}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white text-[#1d1d1f] hover:bg-black/5 transition-all shadow-xs shrink-0"
                      >
                        <Power
                          className={`h-3.5 w-3.5 ${
                            booth.isOpen !== false ? 'text-emerald-600' : 'text-zinc-400'
                          }`}
                        />
                      </button>

                      <Link
                        href={`/shop-owner/analytics?boothId=${booth.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white text-[#1d1d1f] hover:bg-black/5 transition-all shadow-xs shrink-0"
                        title={`Analytics for ${booth.name}`}
                        aria-label={`Analytics for ${booth.name}`}
                      >
                        <BarChart3 className="h-3.5 w-3.5 text-[#111827]" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setEditing(booth)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-white text-[#1d1d1f] hover:bg-black/5 transition-all shadow-xs shrink-0"
                        aria-label="Edit Slot"
                        title="Edit slot identifier"
                      >
                        <Pencil className="h-3.5 w-3.5 text-[#1d1d1f]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setBoothToDelete(booth);
                          setDeleteError('');
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 bg-red-50/80 text-red-600 hover:bg-red-100 transition-all shadow-xs shrink-0"
                        aria-label="Delete Booth Slot"
                        title={`Delete ${booth.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Send Setup Link Section */}
                  <div className="mt-4 rounded-[20px] bg-[#f5f5f7] p-3.5 border border-black/[0.04]">
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-[#1d1d1f]">Send Setup Link</p>
                      <p className="text-[11px] text-[#6e6e73] truncate">
                        Enter the vendor&apos;s email to send a setup link. Only the recipient can claim.
                      </p>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#86868b]" />
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
                          className="w-full rounded-full border border-black/10 bg-white py-1.5 pl-8 pr-3 text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:border-black/30 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() => void handleSendSetupLink(booth.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-white hover:bg-black disabled:opacity-50 transition-colors shrink-0 shadow-xs"
                        aria-label="Send setup link"
                        title="Send setup link"
                      >
                        {isSending ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {feedback && (
                      <div
                        className={`mt-2.5 flex flex-col gap-1.5 rounded-xl p-2.5 text-xs ${
                          feedback.type === 'success'
                            ? 'bg-[#30d158]/10 text-[#166534] border border-[#30d158]/20'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {feedback.delivered ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#30d158]" />
                          ) : feedback.type === 'success' ? (
                            <Mail className="h-4 w-4 shrink-0 text-[#111827]" />
                          ) : null}
                          <span className="font-medium leading-snug truncate">{feedback.message}</span>
                        </div>
                        {feedback.link && (
                          <button
                            type="button"
                            onClick={() => copyLink(feedback.link!, `feedback-${booth.id}`)}
                            className="inline-flex items-center gap-1 font-semibold text-[#1d1d1f] hover:underline shrink-0 text-xs"
                          >
                            {copiedLinks[`feedback-${booth.id}`] ? (
                              <>
                                <Check className="h-3 w-3" /> Link Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" /> Copy Setup Link
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Authorized Emails List */}
                  <div className="mt-3.5 pt-3 border-t border-black/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#111827]" />
                        <span className="text-xs font-semibold text-[#1d1d1f]">
                          Authorized Store Access ({activeMembers.length + pendingInvites.length})
                        </span>
                      </div>
                      <span className="text-[11px] text-[#86868b] truncate">
                        Only listed emails can edit
                      </span>
                    </div>

                    {!hasAuthorizedUsers ? (
                      <p className="text-xs text-[#86868b] italic py-1 truncate">
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
                              className="flex items-center justify-between gap-2 rounded-xl bg-[#f5f5f7]/60 px-3 py-1.5 text-xs border border-black/[0.03]"
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
                                title="Revoke access"
                                aria-label="Revoke access"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-red-50/80 text-red-600 hover:bg-red-100 transition-all shrink-0 disabled:opacity-50 shadow-xs"
                              >
                                {isRemoving ? (
                                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
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
                              className="flex items-center justify-between gap-2 rounded-xl bg-[#f5f5f7]/60 px-3 py-1.5 text-xs border border-black/[0.03]"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                <span className="font-medium text-[#1d1d1f] truncate">
                                  {invite.email}
                                </span>
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 shrink-0">
                                  Pending
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyLink(
                                      `${origin}/booths/join?token=${encodeURIComponent(invite.id)}`,
                                      linkKey,
                                    )
                                  }
                                  title="Copy invitation link"
                                  aria-label="Copy invitation link"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 bg-white text-[#1d1d1f] hover:bg-black/5 transition-all shadow-xs shrink-0"
                                >
                                  {isCopied ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  disabled={isRemoving}
                                  onClick={() => void handleRemoveAccess(booth.id, invite.email)}
                                  title="Cancel invitation"
                                  aria-label="Cancel invitation"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-red-50/80 text-red-600 hover:bg-red-100 transition-all shrink-0 disabled:opacity-50 shadow-xs"
                                >
                                  {isRemoving ? (
                                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <X className="h-3.5 w-3.5" />
                                  )}
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
                <Store className="h-5 w-5 text-[#111827]" />
                <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">Add Booth Slot</h2>
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
                    className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black/30"
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
                  className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black/30"
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
                  className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black/30"
                />
                <span className="mt-1 block text-[11px] text-[#86868b]">
                  If provided, a setup link will be automatically sent to this email upon creation.
                </span>
              </label>

              <button
                type="submit"
                disabled={isCreatingSlot}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-xs font-semibold text-white hover:bg-black transition-all disabled:opacity-70"
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
              <h2 className="text-xl font-semibold text-[#1d1d1f]">Edit Booth Slot</h2>
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
                className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black/30"
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

      {/* DELETE BOOTH SLOT CONFIRMATION MODAL */}
      {boothToDelete ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-4 sm:items-center backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#1d1d1f]">Delete Booth Slot</h2>
                  <p className="text-[11px] text-[#6e6e73]">Permanently remove stall allocation</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close delete dialog"
                onClick={() => {
                  setBoothToDelete(null);
                  setDeleteError('');
                }}
                className="p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#1d1d1f] font-semibold">{boothToDelete.name}</strong>?
              This will permanently revoke all vendor invitations, disconnect assigned staff, and remove all associated menu items and records for this slot.
            </p>

            {deleteError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingBooth}
                onClick={() => {
                  setBoothToDelete(null);
                  setDeleteError('');
                }}
                className="flex-1 rounded-full border border-black/10 py-2.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingBooth}
                onClick={() => void handleDeleteBooth(boothToDelete.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-red-600 hover:bg-red-700 py-2.5 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50"
              >
                {isDeletingBooth ? (
                  <>
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Slot</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
