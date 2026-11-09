'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  LoaderCircle,
  Mail,
  Pencil,
  Plus,
  Receipt,
  Send,
  ShieldAlert,
  ShieldCheck,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import { PageLoader } from '@/components/page-loader';
import { authenticatedFetch } from '@/lib/supabase/client';
import { OperatingScheduleModal } from '@/components/operating-schedule-modal';
import type { OperatingSchedule } from '@/lib/schedule/operating-hours';
import { useAuth } from '@/components/auth-provider';

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
  isActive?: boolean;
  schedule?: OperatingSchedule | null;
  restaurantId?: string;
  manager?: string;
  members?: BoothMember[];
  invitations?: BoothInvitation[];
};

type ShopMembership = {
  id: string;
  name: string;
  slug?: string | null;
  role: string;
  isActive?: boolean;
  schedule?: OperatingSchedule | null;
  booths: Array<{
    id: string;
    name: string;
    isOpen?: boolean;
    isActive?: boolean;
    schedule?: OperatingSchedule | null;
    members?: BoothMember[];
    invitations?: BoothInvitation[];
  }>;
};

export default function HawkerBoothsPage() {
  const params = useParams<{ 'hawker-slug': string; hawkerSlug?: string }>();
  const router = useRouter();
  const rawSlug = params['hawker-slug'] || params.hawkerSlug || '';
  const hawkerSlug = decodeURIComponent(rawSlug).trim().toLowerCase();

  const { status } = useAuth();
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

  // Rent Billing state
  const [rentModalBooth, setRentModalBooth] = useState<Booth | null>(null);
  const [rentAmount, setRentAmount] = useState('');
  const [rentDescription, setRentDescription] = useState('Monthly Rent');
  const [isBillingRent, setIsBillingRent] = useState(false);
  const [rentFeedback, setRentFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    targetType: 'shop' | 'booth';
    targetId: string;
    title: string;
    description: string;
    initialSchedule?: OperatingSchedule | null;
  }>({
    isOpen: false,
    targetType: 'shop',
    targetId: '',
    title: '',
    description: '',
  });

  const loadShops = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/owner/shops');
      const payload = (await response.json()) as { shops?: ShopMembership[] };
      const loadedShops = payload.shops ?? [];
      setShops(loadedShops);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (active) {
        if (status === 'authenticated') {
          void loadShops();
        } else if (status === 'unauthenticated') {
          setLoading(false);
        }
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [status, loadShops]);

  // Find matching shop by slug or ID
  const currentShop = shops.find((s) => {
    const sSlug = (s.slug || '').toLowerCase();
    const sId = (s.id || '').toLowerCase();
    return sSlug === hawkerSlug || sId === hawkerSlug;
  }) || shops[0];

  const boothList: Booth[] = (currentShop?.booths ?? []).map((booth) => ({
    id: booth.id,
    name: booth.name,
    status: 'Active' as const,
    isOpen: booth.isOpen !== false,
    isActive: booth.isActive !== false,
    schedule: booth.schedule,
    restaurantId: currentShop?.id,
    members: booth.members,
    invitations: booth.invitations,
  }));

  const handleOpenAddSlot = () => {
    if (currentShop) {
      setNewSlot({ slotName: '', restaurantId: currentShop.id, vendorEmail: '' });
      setIsAddSlotOpen(true);
    }
  };

  const handleToggleBoothActive = async (boothId: string, nextActive: boolean) => {
    setShops((prev) =>
      prev.map((s) => ({
        ...s,
        booths: s.booths.map((b) => (b.id === boothId ? { ...b, isActive: nextActive } : b)),
      }))
    );

    try {
      const response = await authenticatedFetch(`/api/owner/booths/${boothId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      });
      if (!response.ok) {
        throw new Error('Failed to update stall state');
      }
      await loadShops();
    } catch {
      await loadShops();
    }
  };

  const handleSaveSchedule = async (schedule: OperatingSchedule) => {
    if (!scheduleModal.targetId) return;

    if (scheduleModal.targetType === 'booth') {
      const response = await authenticatedFetch(`/api/owner/booths/${scheduleModal.targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? 'Failed to update schedule');
      }
    }
    await loadShops();
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
      if (!response.ok) throw new Error('Failed to update slot');
      setEditing(null);
      await loadShops();
    } catch {
      // Ignored
    }
  };

  const handleSendLink = async (boothId: string) => {
    const email = emailInputs[boothId]?.trim();
    if (!email) return;

    setSendingState((prev) => ({ ...prev, [boothId]: true }));
    setFeedbacks((prev) => ({ ...prev, [boothId]: undefined as any }));

    try {
      const response = await authenticatedFetch(`/api/owner/booths/${boothId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to dispatch setup link.');
      }

      setFeedbacks((prev) => ({
        ...prev,
        [boothId]: {
          type: 'success',
          message: payload.delivered
            ? `Setup link emailed to ${email}.`
            : `Setup link generated for ${email}.`,
          link: payload.setupLink,
          delivered: payload.delivered,
        },
      }));
      setEmailInputs((prev) => ({ ...prev, [boothId]: '' }));
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

      const payload = await response.json();
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

      if (newSlot.vendorEmail.trim()) {
        await authenticatedFetch(`/api/owner/booths/${createdBoothId}/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newSlot.vendorEmail.trim() }),
        });
      }

      setIsAddSlotOpen(false);
      setNewSlot({ slotName: '', restaurantId: currentShop?.id ?? '', vendorEmail: '' });
      await loadShops();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create slot');
    } finally {
      setIsCreatingSlot(false);
    }
  };

  const handleBillRent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentModalBooth || !rentAmount) return;

    setIsBillingRent(true);
    setRentFeedback(null);
    try {
      const response = await authenticatedFetch('/api/owner/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boothId: rentModalBooth.id,
          amount: parseFloat(rentAmount),
          description: rentDescription,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to issue rent bill.');
      }

      setRentFeedback({ type: 'success', message: 'Rent bill issued successfully.' });
      setTimeout(() => {
        setRentModalBooth(null);
        setRentFeedback(null);
        setRentAmount('');
        setRentDescription('Monthly Rent');
      }, 1500);
    } catch (error) {
      setRentFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to bill rent.' });
    } finally {
      setIsBillingRent(false);
    }
  };

  const handleDeleteBooth = async (boothId: string) => {
    setIsDeletingBooth(true);
    setDeleteError('');
    try {
      const response = await authenticatedFetch(`/api/owner/booths/${boothId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? 'Unable to delete booth.');
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
        {/* Inline Controls Toolbar - No Page Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {shops.length > 1 && (
              <div className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs shadow-sm">
                <Building2 className="w-3.5 h-3.5 text-[#6e6e73]" />
                <select
                  value={currentShop?.slug || currentShop?.id}
                  onChange={(e) => {
                    const targetShop = shops.find((s) => (s.slug || s.id) === e.target.value);
                    if (targetShop) {
                      router.push(`/hawker/${encodeURIComponent(targetShop.slug || targetShop.id)}/booths` as any);
                    }
                  }}
                  className="bg-transparent font-semibold text-[#1d1d1f] cursor-pointer pr-1"
                  aria-label="Switch hawker centre"
                >
                  {shops.map((s) => (
                    <option key={s.id} value={s.slug || s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <span className="text-xs font-semibold text-[#6e6e73]">
              {boothList.length} stall slot(s)
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenAddSlot}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#111827] px-4 text-xs font-semibold text-white hover:bg-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Booth Slot</span>
          </button>
        </div>

        {/* Booth Slots Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 items-start">
          {loading ? (
            <div className="col-span-full">
              <PageLoader text="Loading booths" fullHeight={false} />
            </div>
          ) : boothList.length === 0 ? (
            <div className="col-span-full rounded-[24px] bg-white p-8 text-center shadow-sm">
              <Store className="h-10 w-10 text-[#86868b] mx-auto mb-3" />
              <p className="text-base font-semibold text-[#1d1d1f]">No booth slots created yet</p>
              <p className="mt-1 text-xs text-[#6e6e73] max-w-sm mx-auto">
                Add your first booth slot and send a setup link to a vendor email.
              </p>
              <button
                type="button"
                onClick={handleOpenAddSlot}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-[#111827] px-4 text-xs font-semibold text-white hover:bg-black"
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
                  className="flex flex-col justify-between rounded-[24px] bg-white p-4 sm:p-5 shadow-sm"
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
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (booth.isActive !== false) {
                            if (window.confirm('Setting the stall to inactive will take effect at 3:00 AM the next morning. Continue?')) {
                              handleToggleBoothActive(booth.id, false);
                            }
                          } else {
                            handleToggleBoothActive(booth.id, true);
                          }
                        }}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          booth.isActive !== false ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200' : 'bg-black text-white'
                        }`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>{booth.isActive !== false ? 'Active' : 'Inactive'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRentModalBooth(booth)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5 shrink-0"
                        title="Issue Rent Bill"
                      >
                        <Receipt className="h-3.5 w-3.5 text-[#1d1d1f]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditing(booth)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5 shrink-0"
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
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50/80 text-red-600 hover:bg-red-100 shrink-0"
                        title={`Delete ${booth.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Booth Actions: Schedule & Invites */}
                  <div className="mt-4 pt-3 border-t border-[#f0f0f2] space-y-3">
                    <button
                      type="button"
                      onClick={() =>
                        setScheduleModal({
                          isOpen: true,
                          targetType: 'booth',
                          targetId: booth.id,
                          title: `${booth.name} Schedule`,
                          description: 'Configure automated operating hours for this stall counter.',
                          initialSchedule: booth.schedule,
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f]"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Configure Opening Hours</span>
                    </button>

                    {/* Vendor invite section */}
                    <div className="rounded-xl bg-[#f5f5f7] p-3 space-y-2">
                      <p className="text-[11px] font-semibold text-[#86868b]">Authorized Vendor Email</p>

                      {hasAuthorizedUsers ? (
                        <div className="space-y-1.5">
                          {activeMembers.map((m) => (
                            <div key={m.userId} className="flex items-center justify-between text-xs">
                              <span className="truncate text-[#1d1d1f] font-medium">{m.email}</span>
                              <button
                                type="button"
                                onClick={() => void handleRemoveAccess(booth.id, m.email)}
                                disabled={removingState[`${booth.id}-${m.email}`]}
                                className="text-red-600 hover:underline text-[10px] font-semibold disabled:opacity-50"
                              >
                                Revoke
                              </button>
                            </div>
                          ))}
                          {pendingInvites.map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between text-xs text-[#86868b]">
                              <span className="truncate">{inv.email} (Pending)</span>
                              <button
                                type="button"
                                onClick={() => void handleRemoveAccess(booth.id, inv.email)}
                                disabled={removingState[`${booth.id}-${inv.email}`]}
                                className="text-red-600 hover:underline text-[10px] font-semibold disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#6e6e73]">No vendor connected yet.</p>
                      )}

                      <div className="flex gap-2 pt-1">
                        <input
                          type="email"
                          value={emailInputs[booth.id] ?? ''}
                          onChange={(e) => setEmailInputs({ ...emailInputs, [booth.id]: e.target.value })}
                          placeholder="vendor@stall.com"
                          className="flex-1 rounded-lg bg-white px-2.5 py-1.5 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => void handleSendLink(booth.id)}
                          disabled={isSending || !emailInputs[booth.id]?.trim()}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
                        >
                          {isSending ? <LoaderCircle className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          <span>Invite</span>
                        </button>
                      </div>

                      {feedback && (
                        <div className="text-[11px] mt-1">
                          <p className={feedback.type === 'error' ? 'text-red-600 font-medium' : 'text-emerald-700 font-medium'}>
                            {feedback.message}
                          </p>
                          {feedback.link && (
                            <div className="mt-1 flex items-center gap-2">
                              <input
                                readOnly
                                value={feedback.link}
                                className="flex-1 rounded bg-white px-2 py-1 font-mono text-[10px] text-[#6e6e73]"
                              />
                              <button
                                type="button"
                                onClick={() => copyLink(feedback.link!, booth.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1d1d1f]"
                              >
                                {copiedLinks[booth.id] ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedLinks[booth.id] ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* CREATE BOOTH SLOT MODAL */}
        {isAddSlotOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <form
              onSubmit={handleCreateSlot}
              className="w-full max-w-md rounded-[28px] bg-white p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1d1d1f]">Add Booth Slot</h2>
                <button
                  type="button"
                  onClick={() => setIsAddSlotOpen(false)}
                  className="p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <label className="block text-xs font-semibold text-[#1d1d1f]">
                Slot Identifier / Name
                <input
                  required
                  value={newSlot.slotName}
                  onChange={(e) => setNewSlot({ ...newSlot, slotName: e.target.value })}
                  placeholder="e.g. Ah Huat Curry Mee (Slot #02)"
                  className="mt-1.5 w-full rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5 text-xs focus:bg-white"
                />
              </label>

              <label className="block text-xs font-semibold text-[#1d1d1f]">
                Vendor Email (Optional Setup Invite)
                <input
                  type="email"
                  value={newSlot.vendorEmail}
                  onChange={(e) => setNewSlot({ ...newSlot, vendorEmail: e.target.value })}
                  placeholder="vendor@stall.com"
                  className="mt-1.5 w-full rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5 text-xs focus:bg-white"
                />
              </label>

              <button
                type="submit"
                disabled={isCreatingSlot || !newSlot.slotName.trim()}
                className="mt-4 w-full rounded-full bg-[#111827] py-3 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
              >
                {isCreatingSlot ? 'Provisioning...' : 'Create Booth Slot'}
              </button>
            </form>
          </div>
        )}

        {/* RENT INVOICING MODAL */}
        {rentModalBooth && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <form
              onSubmit={handleBillRent}
              className="w-full max-w-md rounded-[28px] bg-white p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#1d1d1f]">Bill Rent</h2>
                  <p className="text-xs text-[#6e6e73]">{rentModalBooth.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRentModalBooth(null)}
                  className="p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {rentFeedback && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium ${
                    rentFeedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {rentFeedback.message}
                </div>
              )}

              <label className="block text-xs font-semibold text-[#1d1d1f]">
                Amount (MYR)
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  placeholder="500.00"
                  className="mt-1.5 w-full rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5 text-xs focus:bg-white"
                />
              </label>

              <label className="block text-xs font-semibold text-[#1d1d1f]">
                Description
                <input
                  required
                  value={rentDescription}
                  onChange={(e) => setRentDescription(e.target.value)}
                  placeholder="Monthly Stall Rent"
                  className="mt-1.5 w-full rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5 text-xs focus:bg-white"
                />
              </label>

              <button
                type="submit"
                disabled={isBillingRent || !rentAmount}
                className="mt-4 w-full rounded-full bg-[#111827] py-3 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
              >
                {isBillingRent ? 'Issuing Bill...' : 'Issue Rent Bill'}
              </button>
            </form>
          </div>
        )}

        {/* EDIT BOOTH SLOT MODAL */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <form
              onSubmit={handleSaveBooth}
              className="w-full max-w-md rounded-[28px] bg-white p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1d1d1f]">Edit Booth Slot</h2>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <label className="block text-xs font-semibold text-[#1d1d1f]">
                Booth Slot Identifier
                <input
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="mt-1.5 w-full rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5 text-xs focus:bg-white"
                />
              </label>

              <button
                type="submit"
                className="mt-4 w-full rounded-full bg-[#111827] py-3 text-xs font-semibold text-white hover:bg-black"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* DELETE BOOTH MODAL */}
        {boothToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-[28px] bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#1d1d1f]">Delete Booth Slot</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setBoothToDelete(null)}
                  className="p-1 rounded-full text-[#6e6e73] hover:text-[#1d1d1f]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Are you sure you want to delete <strong className="text-[#1d1d1f]">{boothToDelete.name}</strong>?
                This will immediately remove vendor access for this stall.
              </p>

              {deleteError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{deleteError}</div>
              )}

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBoothToDelete(null)}
                  className="flex-1 rounded-full py-2.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingBooth}
                  onClick={() => void handleDeleteBooth(boothToDelete.id)}
                  className="flex-1 rounded-full bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeletingBooth ? 'Deleting...' : 'Delete Slot'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OPERATING SCHEDULE MODAL */}
        <OperatingScheduleModal
          isOpen={scheduleModal.isOpen}
          onClose={() => setScheduleModal((prev) => ({ ...prev, isOpen: false }))}
          title={scheduleModal.title}
          description={scheduleModal.description}
          initialSchedule={scheduleModal.initialSchedule}
          onSave={handleSaveSchedule}
        />
      </div>
    </main>
  );
}

