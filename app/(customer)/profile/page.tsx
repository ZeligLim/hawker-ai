'use client';

import Link from 'next/link';
import { LogOut, Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { RoleModeSwitcher } from '@/components/role-mode-switcher';

type OrderRecord = {
 id: string;
 dish: string;
 place: string;
 price: number;
 date: string;
 category: 'Main course' | 'Drinks' | 'Desserts';
};

type ProfileState = {
 name: string;
 signedIn: boolean;
 orders: OrderRecord[];
};

const defaultOrders: OrderRecord[] = [];

const defaultProfileState: ProfileState = {
 name: 'Guest diner',
 signedIn: false,
 orders: defaultOrders,
};

function formatOrderDate(value: string | null | undefined) {
 if (!value) return 'Today';

 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return 'Today';

 return new Intl.DateTimeFormat('en-SG', {
 month: 'short',
 day: 'numeric',
 }).format(date);
}

function deriveCategory(label: string): OrderRecord['category'] {
 if (/tea|drink|juice|milk/i.test(label)) return 'Drinks';
 if (/cendol|dessert|sweet|cake|ice/i.test(label)) return 'Desserts';
 return 'Main course';
}

function mapOrderPayload(payload: any): OrderRecord[] {
 if (!Array.isArray(payload?.orders)) return [];

 return payload.orders
 .map((entry: any) => {
 const orderItems = Array.isArray(entry?.merchant_orders)
 ? entry.merchant_orders.flatMap((merchant: any) =>
 Array.isArray(merchant.order_items) ? merchant.order_items : []
 )
 : [];
 const firstItem = orderItems[0];
 const label = firstItem?.dish_name ?? 'Hawker order';
 const amount = Number(entry?.total_amount ?? entry?.total ?? 0);
 const stallName =
 Array.isArray(entry?.merchant_orders) && entry.merchant_orders.length > 0
 ? entry.merchant_orders[0]?.food_outlet_id ?? 'Hawker Centre'
 : 'Hawker Centre';
 return {
 id: String(entry?.id ?? `${stallName}-${entry?.created_at ?? Date.now()}`),
 dish: label,
 place: stallName,
 price: Number.isFinite(amount) ? amount : 0,
 date: formatOrderDate(entry?.created_at),
 category: deriveCategory(label),
 };
 })
 .filter((order: OrderRecord) => Boolean(order.id));
}

export default function ProfilePage() {
 const { status, profile: authProfile, isGuest, signOut, updateProfile } = useAuth();
 const [profile, setProfile] = useState<ProfileState>(defaultProfileState);
 const [isMounted, setIsMounted] = useState(false);
 useEffect(() => {
 if (authProfile?.displayName) {
 setEditName(authProfile.displayName);
 }
 }, [authProfile?.displayName]);
 const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
 const [isEditing, setIsEditing] = useState(false);
 const [editName, setEditName] = useState('');
 const [isSaving, setIsSaving] = useState(false);
 const { name, orders } = profile;
 const signedIn = status === 'authenticated' && !isGuest && Boolean(authProfile);
 const displayName = authProfile?.displayName ?? name;

 // Account-specific local state restoration
 useEffect(() => {
 queueMicrotask(() => {
 setIsMounted(true);
 if (!signedIn || !authProfile?.id) {
 setProfile(defaultProfileState);
 return;
 }

 const userKey = `hawker-profile-${authProfile.id}`;
 try {
 const saved = window.localStorage.getItem(userKey);
 if (saved) {
 const parsed = JSON.parse(saved);
 setProfile({
 name: parsed.name ?? authProfile.displayName ?? defaultProfileState.name,
 signedIn: true,
 orders: Array.isArray(parsed.orders) ? parsed.orders : [],
 });
 return;
 }
 } catch {
 // ignore JSON parse error
 }

 setProfile({
 name: authProfile.displayName ?? defaultProfileState.name,
 signedIn: true,
 orders: [],
 });
 });
 }, [signedIn, authProfile?.id, authProfile?.displayName]);

 // Account-specific remote orders fetch (overwrites state cleanly for each user)
 useEffect(() => {
 const loadRemoteOrders = async () => {
 if (!supabase || status !== 'authenticated' || isGuest || !authProfile?.id) return;

 const { data: sessionData } = await supabase.auth.getSession();
 if (!sessionData.session?.access_token) return;

 const response = await fetch('/api/orders', {
 headers: {
 Authorization: `Bearer ${sessionData.session.access_token}`,
 },
 });

 if (!response.ok) return;

 const payload = (await response.json().catch(() => ({}))) as { orders?: unknown[] };
 const remoteOrders = mapOrderPayload(payload);

 setProfile((current) => {
 const next = {
 ...current,
 orders: remoteOrders,
 };

 if (typeof window !== 'undefined' && authProfile?.id) {
 window.localStorage.setItem(`hawker-profile-${authProfile.id}`, JSON.stringify(next));
 }

 return next;
 });
 };

 void loadRemoteOrders();
 }, [isGuest, status, authProfile?.id]);

 const initials =
 displayName
 .split(/\s+/)
 .filter(Boolean)
 .slice(0, 2)
 .map((part) => part[0]?.toUpperCase())
 .join('') || 'H';

 const favoriteDishes = useMemo(() => {
 const counts = new Map<string, number>();
 orders.forEach((order) => {
 counts.set(order.dish, (counts.get(order.dish) ?? 0) + 1);
 });

 return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
 }, [orders]);

 const orderLinks = useMemo(
 () =>
 orders.map((order, index) => ({
 id: `${order.id}-${index}`,
 order,
 })),
 [orders],
 );


 const handleSaveProfile = async () => {
 if (editName.trim() && editName.trim() !== authProfile?.displayName) {
 setIsSaving(true);
 try {
 await updateProfile(editName);
 } catch (e) {
 console.error(e);
 } finally {
 setIsSaving(false);
 }
 }
 setIsEditing(false);
 };

 const handleSignOut = async () => {
 setIsSignOutDialogOpen(false);
 setProfile(defaultProfileState);
 await signOut();
 };

 if (!isMounted) {
 return (
 <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-black sm:px-6">
 <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl">
 <section className="rounded-3xl bg-white p-6 shadow-sm">
 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Sign in</h1>
 <p className="mt-2 text-sm text-neutral-500">
 Save your favourite hawker picks and revisit your recent orders in one place.
 </p>
 <Link
 href="/auth?redirect=/profile"
 className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 "
 >
 Sign in
 </Link>
 </section>
 </div>
 </main>
 );
 }

 return (
 <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-black sm:px-6">
 <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl">
 {!signedIn ? (
 <section className="rounded-3xl bg-white p-6 shadow-sm">
 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Diner Profile</h1>
 <p className="mt-2 text-sm text-neutral-500">
 Sign in with your email or social account to view your past orders, manage preferences, and reorder favourite dishes in one tap.
 </p>
 <Link
 href="/auth?redirect=/profile"
 className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white shadow-xs hover:bg-neutral-800 "
 >
 Sign In / Sign Up
 </Link>
 </section>
 ) : (
 <>
 <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm">
 <div className="flex items-center justify-between gap-4">
 <div className="flex min-w-0 items-center gap-3.5">
 <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full bg-black text-base sm:text-lg font-bold text-white shadow-xs">
 {initials}
 </div>
 <div className="min-w-0">
 <p className="truncate text-base sm:text-lg font-bold text-black">{displayName}</p>
 <p className="truncate text-xs text-neutral-500">{authProfile?.email ?? 'Diner Account'}</p>
 </div>
 </div>
 <div className="flex shrink-0 items-center justify-end gap-2">
 {!isEditing && (
 <button
 type="button"
 onClick={() => setIsEditing(true)}
 className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-black hover:bg-neutral-200 shadow-xs"
 aria-label="Edit settings"
 >
 <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
 </button>
 )}
 <button
 type="button"
 onClick={() => setIsSignOutDialogOpen(true)}
 className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-black hover:bg-neutral-200 shadow-xs"
 aria-label="Sign out"
 >
 <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
 </button>
 </div>
 </div>

 {isEditing && (
 <div className="mt-4 pt-4 slide-in-from-top-2">
 <label className="block text-sm font-bold text-black mb-2">
 Display Name
 </label>
 <input
 value={editName}
 onChange={(e) => setEditName(e.target.value)}
 className="w-full h-11 rounded-full bg-neutral-100 px-4 text-sm outline-none focus:bg-neutral-200 mb-4"
 />
 
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setIsEditing(false)}
 className="flex h-11 flex-1 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-black hover:bg-neutral-200 "
 >
 Cancel
 </button>
 <button
 type="button"
 onClick={handleSaveProfile}
 disabled={isSaving}
 className="flex h-11 flex-1 items-center justify-center rounded-full bg-black text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50"
 >
 {isSaving ? 'Saving...' : 'Save Changes'}
 </button>
 </div>
 
 <div className="mt-4 flex flex-col gap-2">
 <Link href="/profile/settings/password" className="flex h-11 w-full items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-black hover:bg-neutral-200 ">
 Change Password
 </Link>
 </div>
 </div>
 )}

 </section>

 <div className="mt-4">
 <RoleModeSwitcher currentMode="customer" />
 </div>

 {isSignOutDialogOpen ? (
 <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4" role="presentation">
 <div role="dialog" aria-modal="true" aria-labelledby="sign-out-title" className="w-full max-w-[360px] rounded-3xl bg-white p-6 shadow-2xl">
 <h2 id="sign-out-title" className="text-xl font-bold">Sign out?</h2>
 <p className="mt-2 text-sm text-neutral-500">You can sign in again anytime to access your profile.</p>
 <div className="mt-5 flex gap-2">
 <button
 type="button"
 onClick={() => setIsSignOutDialogOpen(false)}
 className="flex-1 h-11 rounded-full bg-neutral-100 text-sm font-semibold text-black hover:bg-neutral-200 "
 >
 Cancel
 </button>
 <button
 type="button"
 onClick={() => void handleSignOut()}
 className="flex-1 h-11 rounded-full bg-black text-sm font-semibold text-white hover:bg-neutral-800 "
 >
 Sign out
 </button>
 </div>
 </div>
 </div>
 ) : null}
 </>
 )}

 {/* Previous Orders Section: 0 Border, Account-Specific */}
 <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
 <div className="mb-3 flex items-center justify-between">
 <h2 className="text-base sm:text-lg font-bold text-black">Previous orders</h2>
 <span className="text-xs sm:text-sm font-semibold text-neutral-500">{orders.length} orders</span>
 </div>

 {orders.length === 0 ? (
 <div className="rounded-2xl bg-neutral-50 p-6 text-center text-xs sm:text-sm text-neutral-500 shadow-xs">
 No previous orders found for this account.
 </div>
 ) : (
 <div className="space-y-2.5">
 {orderLinks.map(({ id, order }) => {
 const orderHref = `/profile/order/${encodeURIComponent(id)}` as any;

 return (
 <Link
 key={id}
 href={orderHref}
 className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-50 p-4 text-left shadow-xs hover:bg-neutral-100 "
 >
 <div>
 <p className="text-sm font-bold text-black">{order.dish}</p>
 <p className="text-xs text-neutral-500 mt-0.5">{order.place} • {order.date}</p>
 </div>
 <span className="text-sm font-bold text-black">RM {order.price.toFixed(2)}</span>
 </Link>
 );
 })}
 </div>
 )}
 </section>

 {/* Eating Pattern */}
 {orders.length > 0 && favoriteDishes.length > 0 && (
 <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
 <h2 className="text-base sm:text-lg font-bold text-black">Eating pattern</h2>

 <div className="mt-3 rounded-2xl bg-neutral-50 p-4 shadow-xs">
 <p className="text-xs font-semibold text-neutral-500">Most ordered</p>
 <div className="mt-3 flex flex-wrap gap-2">
 {favoriteDishes.map(([dish, count]) => (
 <span key={dish} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">
 {dish} · {count}x
 </span>
 ))}
 </div>
 </div>
 </section>
 )}
 </div>
 </main>
 );
}
