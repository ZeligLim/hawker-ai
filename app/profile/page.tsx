'use client';

import Link from 'next/link';
import { LogOut, Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase/client';

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

const defaultOrders: OrderRecord[] = [
  { id: 'fallback-1', dish: 'Nasi Lemak', place: 'Ah Seng Chicken Rice', price: 8.5, date: 'Today', category: 'Main course' },
  { id: 'fallback-2', dish: 'Teh Tarik', place: 'Penang Corner', price: 3.5, date: 'Yesterday', category: 'Drinks' },
  { id: 'fallback-3', dish: 'Curry Mee', place: 'Curry House', price: 12, date: '2 days ago', category: 'Main course' },
  { id: 'fallback-4', dish: 'Cendol', place: 'Green Garden Vegetarian', price: 5, date: 'Last week', category: 'Desserts' },
];

const defaultProfileState: ProfileState = {
  name: 'Guest diner',
  signedIn: false,
  orders: defaultOrders,
};

const storageKey = 'hawker-profile';

function readStoredProfile(): Partial<ProfileState> | null {
  if (typeof window === 'undefined') return null;

  const savedRaw = window.localStorage.getItem(storageKey);
  if (!savedRaw) return null;

  try {
    return JSON.parse(savedRaw) as Partial<ProfileState>;
  } catch {
    return null;
  }
}

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
      const orderItems = Array.isArray(entry?.merchant_orders) ? entry.merchant_orders.flatMap((merchant: any) => Array.isArray(merchant.order_items) ? merchant.order_items : []) : [];
      const firstItem = orderItems[0];
      const label = firstItem?.dish_name ?? 'Hawker order';
      const amount = Number(entry?.total ?? 0);
      const stallName = Array.isArray(entry?.merchant_orders) && entry.merchant_orders.length > 0 ? entry.merchant_orders[0]?.food_outlet_id ?? 'Hawker Centre' : 'Hawker Centre';
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
  const { status, profile: authProfile, isGuest, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileState>(defaultProfileState);
  const [isMounted, setIsMounted] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);
  const { name, orders } = profile;
  const signedIn = status === 'authenticated' && !isGuest && Boolean(authProfile);
  const displayName = authProfile?.displayName ?? name;

  useEffect(() => {
    const restoreProfile = () => {
      const saved = readStoredProfile();
      if (!saved) {
        setProfile(defaultProfileState);
        return;
      }

      const nextProfile: ProfileState = {
        name: saved.name ?? defaultProfileState.name,
        signedIn: Boolean(saved.signedIn),
        orders: saved.orders && saved.orders.length > 0 ? saved.orders : defaultProfileState.orders,
      };

      setProfile(nextProfile);
    };

    queueMicrotask(() => {
      setIsMounted(true);
      restoreProfile();
    });
  }, []);

  useEffect(() => {
    const loadRemoteOrders = async () => {
      if (!supabase || status !== 'authenticated' || isGuest) return;

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
      if (remoteOrders.length === 0) return;

      setProfile((current) => ({
        ...current,
        orders: remoteOrders,
      }));

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({
            name: displayName,
            signedIn,
            orders: remoteOrders,
          }),
        );
      }
    };

    void loadRemoteOrders();
  }, [isGuest, status]);

  const initials = displayName
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

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
        <div className="mx-auto max-w-[430px] sm:max-w-[480px] lg:max-w-[960px]">
          <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Sign in</h1>
            <p className="mt-3 text-sm text-[#6e6e73]">Save your favourite hawker picks and revisit your recent orders in one place.</p>
            <Link href="/auth?redirect=/profile" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-medium text-white">
              Sign in
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px] sm:max-w-[480px] lg:max-w-[960px]">
        {!signedIn ? (
          <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Sign in</h1>
            <p className="mt-3 text-sm text-[#6e6e73]">Save your favourite hawker picks and revisit your recent orders in one place.</p>
            <Link href="/auth?redirect=/profile" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-medium text-white">
              Sign in
            </Link>
          </section>
        ) : (
          <>
            <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-3">
                    {authProfile?.avatarUrl ? (
                      <img src={authProfile.avatarUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111827] text-sm font-semibold text-white">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h1 className="max-w-[190px] truncate text-3xl font-semibold tracking-[-0.06em]" title={displayName}>{displayName}</h1>
                      <p className="mt-1 max-w-[190px] truncate text-xs text-[#6e6e73]" title={authProfile?.email ?? undefined}>{authProfile?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex w-[104px] shrink-0 items-center justify-end gap-2">
                  <Link href={'/profile/settings' as any} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f]" aria-label="Edit settings">
                    <Settings className="h-5 w-5" />
                  </Link>
                  <button type="button" onClick={() => setIsSignOutDialogOpen(true)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f]" aria-label="Sign out">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </section>
            {isSignOutDialogOpen ? (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4" role="presentation">
                <div role="dialog" aria-modal="true" aria-labelledby="sign-out-title" className="w-full max-w-[360px] rounded-[24px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
                  <h2 id="sign-out-title" className="text-xl font-semibold tracking-[-0.04em]">Sign out?</h2>
                  <p className="mt-2 text-sm text-[#6e6e73]">You can sign in again anytime to access your profile.</p>
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
          </>
        )}

        <section className="mt-6 rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-[-0.04em]">Previous orders</h2>
            <span className="text-sm text-[#6e6e73]">{orders.length} orders</span>
          </div>

          <div className="space-y-3">
            {orderLinks.map(({ id, order }) => {
              const orderHref = `/profile/order/${encodeURIComponent(id)}` as any;

              return (
                <Link
                  key={id}
                  href={orderHref}
                  className="flex items-center justify-between gap-3 rounded-[18px] border border-[#e5e7eb] bg-[#f5f5f7] p-3 text-left transition hover:border-[#d1d5db]"
                >
                  <span className="text-sm font-medium text-[#1d1d1f]">{order.date}</span>
                  <span className="text-sm font-semibold text-[#1d1d1f]">RM {order.price.toFixed(2)}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold tracking-[-0.04em]">Eating pattern</h2>

          <div className="mt-3 rounded-[22px] bg-[#f5f5f7] p-4">
            <p className="text-sm text-[#6e6e73]">Most ordered</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {favoriteDishes.map(([dish, count]) => (
                <span key={dish} className="rounded-full bg-white px-2.5 py-1.5 text-xs font-medium text-[#1d1d1f]">
                  {dish} · {count}x
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
