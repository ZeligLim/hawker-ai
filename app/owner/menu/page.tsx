'use client';

import Link from 'next/link';
import { Edit3, Plus, UtensilsCrossed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

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

export default function OwnerMenuPage() {
  const [dishes, setDishes] = useState<OwnerDish[]>([]);
  const [foodOutletIds, setFoodOutletIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadBackendDishes = async () => {
      const token = (await supabase?.auth.getSession())?.data.session?.access_token;
      if (!token) {
        if (active) {
          setError('Please sign in to load your menu.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch('/api/owner/dishes', {
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
  }, []);

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
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] truncate">Menu</h1>
          </div>
          <Link
            href={'/owner/menu/new' as any}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#111827] px-4 text-xs font-semibold text-white shadow-xs hover:bg-black transition-colors shrink-0"
            aria-label="Add dish"
            title="Add dish"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">Add dish</span>
          </Link>
        </header>

        <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] truncate">
          Turn availability off when a dish is sold out. Customers will see the change immediately.
        </p>

        {error ? (
          <div className="mt-4 rounded-[18px] border border-[#fecaca] bg-[#fff1f2] p-4 text-xs sm:text-sm text-[#9f1239] truncate">
            {error}
          </div>
        ) : null}

        <section className="mt-6">
          {isLoading ? (
            <div className="rounded-[24px] bg-white p-8 text-center text-xs sm:text-sm text-[#6e6e73] truncate">Loading menu...</div>
          ) : null}

          {!isLoading && dishes.length === 0 && !error ? (
            <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <UtensilsCrossed className="mx-auto h-8 w-8 text-[#86868b] mb-3" />
              <h3 className="text-base font-semibold text-[#1d1d1f] truncate">No dishes on your menu yet</h3>
              <p className="mt-1 text-xs text-[#6e6e73] max-w-sm mx-auto truncate">
                {foodOutletIds.length === 0
                  ? 'You have not joined a booth yet. Use an invitation code to link your account, or add a dish below.'
                  : 'Add your first dish to start receiving table-side customer orders.'}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href={'/owner/menu/new' as any}
                  className="inline-flex h-9 items-center rounded-full bg-[#111827] px-4 text-xs font-semibold text-white hover:bg-black transition-colors shadow-xs"
                >
                  Add your first dish
                </Link>
                {foodOutletIds.length === 0 && (
                  <Link
                    href="/booths/join"
                    className="inline-flex h-9 items-center rounded-full border border-black/15 bg-white px-4 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.04] transition-colors shadow-xs"
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
                className="flex items-center justify-between gap-3 sm:gap-4 rounded-[22px] bg-white p-3.5 sm:p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)] border border-black/[0.04]"
              >
                <Link href={`/owner/menu/${dish.id}` as any} className="flex min-w-0 flex-1 items-center gap-3">
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
                  href={`/owner/menu/${dish.id}` as any}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5 transition-all shadow-xs"
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
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    dish.available ? 'bg-emerald-500' : 'bg-[#d1d5db]'
                  }`}
                  aria-label={`${dish.name} ${dish.available ? 'available' : 'unavailable'}`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      dish.available ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
