'use client';

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
  const [draftName, setDraftName] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const restoreProfile = () => {
      const saved = readStoredProfile();
      if (!saved) {
        setProfile(defaultProfileState);
        setDraftName('');
        return;
      }

      const nextProfile: ProfileState = {
        name: saved.name ?? defaultProfileState.name,
        signedIn: Boolean(saved.signedIn),
        orders: saved.orders && saved.orders.length > 0 ? saved.orders : defaultProfileState.orders,
      };

      setProfile(nextProfile);
      setDraftName(nextProfile.name === defaultProfileState.name ? '' : nextProfile.name);
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

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = draftName.trim();
    if (!trimmedName) return;

    const nextProfile: ProfileState = { name: trimmedName, signedIn: true, orders };
    setProfile(nextProfile);
    setDraftName(trimmedName);
    window.localStorage.setItem(storageKey, JSON.stringify(nextProfile));
  };

  const handleSignOut = () => {
    const nextProfile: ProfileState = { name: 'Guest diner', signedIn: false, orders: defaultOrders };
    setProfile(nextProfile);
    setDraftName('');
    window.localStorage.setItem(storageKey, JSON.stringify(nextProfile));
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
        <div className="mx-auto max-w-[430px] sm:max-w-[480px] lg:max-w-[960px]">
          <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Profile</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Sign in</h1>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#1d1d1f]">
                  Your name
                </label>
                <input
                  id="name"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-[18px] bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#6e6e73] outline-none"
                />
              </div>
              <button type="button" className="w-full rounded-full bg-[#111827] px-4 py-3 text-sm font-medium text-white">
                Sign in
              </button>
            </div>
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Profile</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Sign in</h1>
            <form onSubmit={handleSignIn} className="mt-5 space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#1d1d1f]">
                  Your name
                </label>
                <input
                  id="name"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-[18px] bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#6e6e73] outline-none"
                />
              </div>

              <button type="submit" className="w-full rounded-full bg-[#111827] px-4 py-3 text-sm font-medium text-white">
                Sign in
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Profile</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{name}</h1>
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
            <span className="text-sm text-[#6e6e73]">{orders.length} items</span>
          </div>

          <div className="space-y-3">
            {orders.map((order) => (
              <div key={`${order.dish}-${order.date}`} className="rounded-[18px] bg-[#f5f5f7] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#1d1d1f]">{order.dish}</p>
                    <p className="mt-0.5 text-xs text-[#6e6e73]">{order.place}</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-[#3c3c43]">
                    {order.category}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[#6e6e73]">
                  <span>{order.date}</span>
                  <span>RM {order.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
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
