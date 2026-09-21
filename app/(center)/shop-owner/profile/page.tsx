'use client';

import { LogOut, Save, Check, Clock, ShieldAlert, Settings, X, LoaderCircle } from 'lucide-react';
import { OperatingScheduleModal } from '@/components/operating-schedule-modal';
import { SaveCancelButtons } from '@/components/save-cancel-buttons';
import type { OperatingSchedule } from '@/lib/schedule/operating-hours';
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
 booths: Array<{ id: string; name: string }>;
 isActive?: boolean;
 schedule?: OperatingSchedule;
};

export default function ShopOwnerProfilePage() {
 const { signOut } = useAuth();
 const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
 const [isEditing, setIsEditing] = useState(false);
 const [shop, setShop] = useState<Shop | null>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [saveSuccess, setSaveSuccess] = useState(false);
 const [creating, setCreating] = useState(false);
 const [draft, setDraft] = useState({
 name: '',
 address: '',
 slug: '',
 });
 const [createForm, setCreateForm] = useState({ name: '', address: '' });

 const [scheduleModal, setScheduleModal] = useState<{
 isOpen: boolean;
 targetType: 'shop' | 'booth';
 targetId: string;
 title: string;
 description: string;
 initialSchedule?: any;
 }>({ isOpen: false, targetType: 'shop', targetId: '', title: '', description: '' });



 const handleToggleShopActive = async () => {
 if (!shop) return;
 const nextActive = shop.isActive !== false ? false : true;
 
 if (nextActive === false) {
 if (!window.confirm('Are you sure you want to deactivate this venue? It will no longer be visible to customers.')) {
 return;
 }
 } else {
 if (!window.confirm('Are you sure you want to activate this venue?')) {
 return;
 }
 }
 
 setShop({ ...shop, isActive: nextActive });
 try {
 const res = await authenticatedFetch(`/api/owner/shops/${shop.id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ is_active: nextActive }),
 });
 if (!res.ok) throw new Error('Failed to update shop status');
 } catch (err) {
 alert('Failed to update status');
 setShop({ ...shop, isActive: !nextActive });
 }
 };

 const handleSaveSchedule = async (schedule: any) => {
 if (!shop) return;
 const res = await authenticatedFetch(`/api/owner/shops/${shop.id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ schedule }),
 });
 if (!res.ok) throw new Error('Failed to save schedule');
 await loadShop();
 };

 const loadShop = useCallback(async () => {
 try {
 const response = await authenticatedFetch('/api/owner/shops');
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
 

 {/* General Shop Profile */}
 <section className="rounded-[26px] bg-white p-5 sm:p-6 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-lg font-semibold text-white">
 {shop.name.charAt(0).toUpperCase()}
 </div>
 <div>
 <h2 className="text-lg font-semibold">{shop.name}</h2>
 <p className="mt-1 text-sm text-[#6e6e73]">{shop.booths.length} booths · {shop.role}</p>
 </div>
 </div>
 {!isEditing && (
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setIsEditing(true)}
 className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-neutral-200 shadow-xs"
 aria-label="Edit Profile"
 >
 <Settings className="h-4 w-4" />
 </button>
 <button
 type="button"
 onClick={() => setIsSignOutDialogOpen(true)}
 className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-neutral-200 shadow-xs"
 aria-label="Sign out"
 >
 <LogOut className="h-4 w-4" />
 </button>
 </div>
 )}
 </div>


 
 {isEditing && (
 <div className="mt-5 pt-5 slide-in-from-top-2">
 <div className="space-y-3">
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
 <SaveCancelButtons
 isSaving={saving}
 onSave={() => { void handleSave(); setIsEditing(false); }}
 onCancel={() => setIsEditing(false)}
 saveLabel="Save shop details"
 cancelLabel="Cancel editing"
 />
 {saveSuccess ? (
 <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 ml-auto">
 <Check className="h-4 w-4" /> Updated
 </span>
 ) : null}
 </div>
 </div>
 )}
 </section>



 <section className="mt-6 rounded-[26px] bg-white p-5 sm:p-6 shadow-xs">
 <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Venue Operations</h3>
 <div className="flex flex-col sm:flex-row gap-3">
 <button
 type="button"
 onClick={() =>
 setScheduleModal({
 isOpen: true,
 targetType: 'shop',
 targetId: shop.id,
 title: `${shop.name} Operating Hours`,
 description: '',
 initialSchedule: shop.schedule,
 })
 }
 className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#f5f5f7] px-4 text-xs font-semibold text-[#1d1d1f] hover:bg-neutral-200 shadow-xs"
 >
 <Clock className="h-4 w-4 text-blue-600" />
 Venue Hours
 </button>
 <button
 type="button"
 onClick={handleToggleShopActive}
 className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold shadow-xs ${
 shop.isActive !== false
 ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
 : 'bg-[#f5f5f7] text-[#6e6e73] hover:bg-neutral-200'
 }`}
 >
 <ShieldAlert className="h-4 w-4" />
 {shop.isActive !== false ? 'Put Inactive' : 'Activate Venue'}
 </button>
 </div>
 </section>

 <div className="mt-6">
 <RoleModeSwitcher currentMode="shop_owner" />
 </div>

 

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

 <OperatingScheduleModal
 isOpen={scheduleModal.isOpen}
 onClose={() => setScheduleModal((prev) => ({ ...prev, isOpen: false }))}
 title={scheduleModal.title}
 description={scheduleModal.description}
 initialSchedule={scheduleModal.initialSchedule}
 onSave={async (schedule: OperatingSchedule) => {
 await handleSaveSchedule(schedule);
 setScheduleModal((prev) => ({ ...prev, isOpen: false }));
 }}
 />

 </div>
 </main>
 );
}
