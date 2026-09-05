'use client';

import Link from 'next/link';
import { LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth-provider';

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
const modeStorageKey = 'hawker-user-mode';

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
  const router = useRouter();
  const { status, profile: authProfile, isGuest, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileState>(defaultProfileState);
  const [isMounted, setIsMounted] = useState(false);
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

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
      setIsOwnerMode(window.localStorage.getItem(modeStorageKey) === 'owner');
    });
  }, []);

  const { name, orders } = profile;
  const signedIn = status === 'authenticated' && !isGuest && Boolean(authProfile);
  const displayName = authProfile?.displayName ?? name;
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
      orders.map((order) => ({
        id: `${order.place}-${order.date}-${order.dish}`,
        order,
      })),
    [orders],
  );

  const handleModeChange = (ownerMode: boolean) => {
    setIsOwnerMode(ownerMode);
    window.localStorage.setItem(modeStorageKey, ownerMode ? 'owner' : 'customer');
    if (ownerMode) {
      router.push('/owner' as any);
    }
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
            <section className="mt-4 rounded-[22px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">Hawker owner mode</p>
                  <p className="mt-1 text-xs text-[#6e6e73]">Switch between ordering and managing a stall</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOwnerMode}
                  onClick={() => handleModeChange(!isOwnerMode)}
                  className={`relative h-7 w-12 rounded-full transition ${isOwnerMode ? 'bg-[#111827]' : 'bg-[#d1d5db]'}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${isOwnerMode ? 'left-6' : 'left-1'}`} />
                </button>
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
