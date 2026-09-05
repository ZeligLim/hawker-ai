'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type OrderRecord = {
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
  { dish: 'Nasi Lemak', place: 'Ah Seng Chicken Rice', price: 8.5, date: 'Today', category: 'Main course' },
  { dish: 'Teh Tarik', place: 'Penang Corner', price: 3.5, date: 'Yesterday', category: 'Drinks' },
  { dish: 'Curry Mee', place: 'Curry House', price: 12, date: '2 days ago', category: 'Main course' },
  { dish: 'Cendol', place: 'Green Garden Vegetarian', price: 5, date: 'Last week', category: 'Desserts' },
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileState>(defaultProfileState);
  const [isMounted, setIsMounted] = useState(false);

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

  const { name, signedIn, orders } = profile;

  const favoriteDishes = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((order) => {
      counts.set(order.dish, (counts.get(order.dish) ?? 0) + 1);
    });

    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [orders]);

  const favoriteCategory = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((order) => {
      counts.set(order.category, (counts.get(order.category) ?? 0) + 1);
    });

    const [topCategory] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['Main course', 0];
    return topCategory;
  }, [orders]);

  const orderLinks = useMemo(
    () =>
      orders.map((order) => ({
        id: `${order.place}-${order.date}-${order.dish}`,
        order,
      })),
    [orders],
  );

  const handleSignOut = () => {
    const nextProfile: ProfileState = { name: 'Guest diner', signedIn: false, orders: defaultOrders };
    setProfile(nextProfile);
    window.localStorage.setItem(storageKey, JSON.stringify(nextProfile));
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
        <div className="mx-auto max-w-[430px] sm:max-w-[480px] lg:max-w-[960px]">
          <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Sign in</h1>
            <p className="mt-3 text-sm text-[#6e6e73]">Save your favourite hawker picks and revisit your recent orders in one place.</p>
            <Link href="/auth" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-medium text-white">
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
            <Link href="/auth" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-medium text-white">
              Sign in
            </Link>
          </section>
        ) : (
          <>
            <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-semibold tracking-[-0.06em]">{name}</h1>
                </div>
                <button type="button" onClick={handleSignOut} className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-[11px] font-medium text-[#1d1d1f]">
                  Sign out
                </button>
              </div>

              <div className="mt-5 rounded-[22px] bg-[#111827] p-4 text-white">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">Member profile</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{favoriteCategory}</p>
                <p className="mt-1 text-sm text-white/75">Your most frequent order type</p>
              </div>
            </section>
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
