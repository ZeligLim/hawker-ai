'use client';

import Link from 'next/link';
import { Edit3, Plus, UtensilsCrossed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { getStallRoute, getStallSlug } from '@/lib/stall-route';

type OwnerDish = {
 id: string;
 name: string;
 category: string;
 price: number;
 available: boolean;
 vegetarian?: boolean;
 imageUrl?: string;
 description?: string;
 tags?: string[];
 customizations?: {
 large: { enabled: boolean; price: number };
 egg: { enabled: boolean; price: number };
 spice: { enabled: boolean; levels: number };
 };
};

function MenuLoadingState() {
 return (
 <div role="status" aria-live="polite" aria-label="Loading menu" className="space-y-4">
 <div className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-3.5 shadow-sm shadow-black/[0.03]">
 <div className="h-9 w-9 animate-pulse rounded-xl bg-[#f0f0f2] motion-reduce:animate-none" />
 <div className="min-w-0 flex-1">
 <p className="text-xs font-semibold text-[#1d1d1f]">Getting your menu ready</p>
 <p className="mt-0.5 text-[11px] text-[#86868b]">Loading dishes and availability</p>
 </div>
 <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0071e3] motion-reduce:animate-none" />
 </div>

 <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2" aria-hidden="true">
 {Array.from({ length: 4 }, (_, index) => (
 <div key={index} className="flex items-center gap-3 rounded-[22px] bg-white p-3.5 shadow-sm shadow-black/[0.03]">
 <div className="h-12 w-12 shrink-0 animate-pulse rounded-[14px] bg-[#f0f0f2] motion-reduce:animate-none" />
 <div className="min-w-0 flex-1 space-y-2">
 <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-[#ededf0] motion-reduce:animate-none" />
 <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-[#f2f2f4] motion-reduce:animate-none" />
 </div>
 <div className="h-8 w-8 shrink-0 animate-pulse rounded-xl bg-[#f2f2f4] motion-reduce:animate-none" />
 <div className="h-7 w-12 shrink-0 animate-pulse rounded-full bg-[#e9eaed] motion-reduce:animate-none" />
 </div>
 ))}
 </div>
 </div>
 );
}

export default function OwnerMenuPage() {
 const { centreSlug } = useParams<{ centreSlug: string }>();
 const router = useRouter();
 const { roles } = useAuth();
 const selectedBooth = roles.booths.find((booth) => getStallSlug(booth) === centreSlug);
 const selectedBoothId = selectedBooth?.id ?? null;

 const [dishes, setDishes] = useState<OwnerDish[]>([]);
 const [foodOutletIds, setFoodOutletIds] = useState<string[]>([]);
 const [isLoading, setIsLoading] = useState(true);

 const [error, setError] = useState('');

 useEffect(() => {
 let active = true;
 const loadBackendDishes = async () => {
 if (roles.isLoading) return;
 if (!selectedBoothId) {
 if (active) {
 setError('This stall is not linked to your account.');
 setIsLoading(false);
 }
 return;
 }
 const token = (await supabase?.auth.getSession())?.data.session?.access_token;
 if (!token) {
 if (active) {
 setError('Please sign in to load your menu.');
 setIsLoading(false);
 }
 return;
 }

 try {
 const fetchUrl = `/api/owner/dishes?foodOutletId=${encodeURIComponent(selectedBoothId)}`;
 const response = await fetch(fetchUrl, {
 headers: { Authorization: `Bearer ${token}` },
 });

 if (!response.ok) {
 const errPayload = (await response.json().catch(() => ({}))) as { error?: string };
 if (active) {
 setError(errPayload.error || 'Unable to load your menu from the backend. Please try again.');
 setIsLoading(false);
 }
 return;
 }

 const payload = (await response.json()) as {
 dishes?: Array<Record<string, unknown>>;
 foodOutletIds?: string[];
 };

 if (active) {
 setFoodOutletIds(payload.foodOutletIds ?? []);
 if (Array.isArray(payload.dishes)) {
 setDishes(
 payload.dishes.map((dish) => ({
 id: String(dish.id),
 name: String(dish.name ?? ''),
 category: 'Main course',
 price: Number(dish.price ?? 0),
 available: Boolean(dish.is_available),
 imageUrl: typeof dish.image_url === 'string' ? dish.image_url : undefined,
 vegetarian: Boolean(dish.is_vegetarian),
 description: typeof dish.description === 'string' ? dish.description : undefined,
 tags: Array.isArray(dish.tags) ? dish.tags.map(String) : [],
 })),
 );
 }
 setError('');
 setIsLoading(false);
 }
 } catch {
 if (active) {
 setError('Network error. Unable to load your menu.');
 setIsLoading(false);
 }
 }
 };

 void loadBackendDishes();
 return () => {
 active = false;
 };
 }, [roles.isLoading, selectedBoothId]);

 const toggleAvailability = async (id: string) => {
 const next = dishes.map((dish) => (dish.id === id ? { ...dish, available: !dish.available } : dish));
 setDishes(next);
 const token = (await supabase?.auth.getSession())?.data.session?.access_token;
 if (!token) return;
 const dish = next.find((item) => item.id === id);
 if (!dish) return;
 const response = await fetch(`/api/owner/dishes/${id}`, {
 method: 'PATCH',
 headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
 body: JSON.stringify({ isAvailable: dish.available }),
 });
 if (!response.ok) setError('Availability could not be saved. Please try again.');
 };

 return (
 <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f] sm:px-6">
 <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
 

 {error ? (
 <div className="mt-4 rounded-[18px] bg-[#fff1f2] p-4 text-xs sm:text-sm text-[#9f1239] truncate">
 {error}
 </div>
 ) : null}

 
 {/* Booth Selector */}
 {roles.booths && roles.booths.length > 1 && (
 <div className="mb-4 flex justify-end">
 <select
 value={selectedBoothId || ''}
 onChange={(event) => {
 const booth = roles.booths.find((item) => item.id === event.target.value);
 if (booth) router.push(getStallRoute(booth, 'menu') as any);
 }}
 className="inline-flex h-9 items-center justify-center rounded-full bg-white px-3 text-xs font-semibold text-[#1d1d1f] cursor-pointer"
 aria-label="Select booth"
 >
 {roles.booths.map((b) => (
 <option key={b.id} value={b.id}>
 {b.name}
 </option>
 ))}
 </select>
 </div>
 )}

 <section className="mt-6">
 {isLoading ? (
 <MenuLoadingState />
 ) : null}

 {!isLoading && dishes.length === 0 && !error ? (
 <div className="rounded-[24px] bg-white p-8 text-center ">
 <UtensilsCrossed className="mx-auto h-8 w-8 text-[#86868b] mb-3" />
 <h3 className="text-base font-semibold text-[#1d1d1f] truncate">No dishes on your menu yet</h3>
 <p className="mt-1 text-xs text-[#6e6e73] max-w-sm mx-auto truncate">
 {foodOutletIds.length === 0
 ? 'You have not joined a booth yet. Use an invitation code to link your account, or add a dish below.'
 : 'Add your first dish to start receiving table-side customer orders.'}
 </p>
 <div className="mt-5 flex flex-wrap justify-center gap-3">
 <Link
 href={`/${encodeURIComponent(centreSlug)}/owner/menu/new${selectedBoothId ? `?boothId=${selectedBoothId}` : ''}` as any}
 className="inline-flex h-9 items-center rounded-full bg-[#111827] px-4 text-xs font-semibold text-white hover:bg-black "
 >
 Add your first dish
 </Link>
 {foodOutletIds.length === 0 && (
 <Link
 href="/booths/join"
 className="inline-flex h-9 items-center rounded-full bg-white px-4 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.04] "
 >
 Join booth with code
 </Link>
 )}
 </div>
 </div>
 ) : null}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
 {dishes.map((dish) => (
 <article
 key={dish.id}
 className="flex items-center justify-between gap-3 sm:gap-4 rounded-[22px] bg-white p-3.5 sm:p-4 "
 >
 <Link href={`/${encodeURIComponent(centreSlug)}/owner/menu/${dish.id}?foodOutletId=${selectedBoothId ?? ''}` as any} className="flex min-w-0 flex-1 items-center gap-3">
 {dish.imageUrl ? (
 <img src={dish.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-[14px] object-cover" />
 ) : (
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#f5f5f7] text-[#86868b]">
 <UtensilsCrossed className="h-5 w-5" />
 </div>
 )}
 <div className="min-w-0">
 <h2 className="truncate text-base font-semibold">{dish.name}</h2>
 <p className="mt-1 text-xs text-[#6e6e73] truncate">
 {dish.category} · RM {dish.price.toFixed(2)}
 {dish.vegetarian ? ' · Vegetarian' : ''}
 </p>
 </div>
 </Link>
 <Link
 href={`/${encodeURIComponent(centreSlug)}/owner/menu/${dish.id}?foodOutletId=${selectedBoothId ?? ''}` as any}
 className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5 "
 aria-label={`Edit ${dish.name}`}
 title={`Edit ${dish.name}`}
 >
 <Edit3 className="h-3.5 w-3.5" />
 </Link>
 <button
 type="button"
 role="switch"
 aria-checked={dish.available}
 onClick={() => toggleAvailability(dish.id)}
 className={`relative h-7 w-12 shrink-0 rounded-full ${ dish.available ? 'bg-emerald-500' : 'bg-[#d1d5db]' }`}
 aria-label={`${dish.name} ${dish.available ? 'available' : 'unavailable'}`}
 >
 <span
 className={`absolute top-1 h-5 w-5 rounded-full bg-white ${ dish.available ? 'left-6' : 'left-1' }`}
 />
 </button>
 </article>
 ))}
 </div>
 </section>
 </div>
 

 <Link
 href={`/${encodeURIComponent(centreSlug)}/owner/menu/new${selectedBoothId ? `?boothId=${selectedBoothId}` : ''}` as any}
 className="fixed bottom-40 sm:bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-white hover:bg-black "
 aria-label="Add dish"
 title="Add dish"
 >
 <Plus className="h-6 w-6" />
 </Link>
 </main>
 );
}
