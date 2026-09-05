'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { useMemo, useState } from 'react';
import { HawkerSearchBar } from '@/components/hawker-search-bar';
import { fallbackDishes } from '@/lib/search/fallback-data';

type FeaturedDish = {
  id: string;
  name: string;
  restaurantName: string;
  stallName: string;
  price: number;
  isVegetarian: boolean;
  isHalal: boolean;
  spiceLevel: number;
  proteinGrams: number;
};

const quickFilters = [
  { label: 'Vegetarian', query: 'vegetarian food' },
  { label: 'Halal', query: 'halal food' },
  { label: 'Spicy', query: 'spicy noodles under RM10' },
  { label: 'Under RM10', query: 'food under RM10' },
  { label: 'High Protein', query: 'something high in protein' },
  { label: 'Popular', query: 'popular hawker dishes' },
];

const stallDirectory = [
  {
    name: 'Ah Seng Chicken Rice',
    description: 'Chicken rice, roasted meats & noodles',
    eta: '10 min',
    busy: 'Busy',
    dishCount: 12,
  },
  {
    name: 'Penang Corner',
    description: 'Penang favourites',
    eta: '12 min',
    busy: 'Moderate',
    dishCount: 9,
  },
  {
    name: 'Curry House',
    description: 'Curry noodles & rice dishes',
    eta: 'Closed',
    busy: 'Closed',
    dishCount: 8,
  },
  {
    name: 'Green Garden Vegetarian',
    description: 'Vegetarian staples',
    eta: '8 min',
    busy: 'Quiet',
    dishCount: 11,
  },
];

function LeafIcon() {
  return <Leaf className="h-[14px] w-[14px]" strokeWidth={1.8} />;
}

export function HomePage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FeaturedDish[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const featuredDishes = useMemo<FeaturedDish[]>(() => {
    if (results.length > 0) return results;
    return fallbackDishes.slice(0, 4).map((dish) => ({
      id: dish.id,
      name: dish.name,
      restaurantName: dish.restaurantName,
      stallName: dish.stallName,
      price: dish.price,
      isVegetarian: dish.isVegetarian,
      isHalal: dish.isHalal,
      spiceLevel: dish.spiceLevel,
      proteinGrams: dish.proteinGrams,
    }));
  }, [results]);

  const handleSearch = async (nextQuery: string) => {
    const trimmed = nextQuery.trim();
    const payloadQuery = trimmed || 'spicy noodles under RM10';

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: payloadQuery,
          limit: 4,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error ?? 'Search failed');

      const nextResults = (payload.results ?? []).map((dish: any) => ({
        id: dish.id,
        name: dish.name,
        restaurantName: dish.restaurantName,
        stallName: dish.stallName,
        price: Number(dish.price),
        isVegetarian: Boolean(dish.isVegetarian),
        isHalal: Boolean(dish.isHalal),
        spiceLevel: Number(dish.spiceLevel),
        proteinGrams: Number(dish.proteinGrams),
      }));

      setResults(nextResults);
    } catch (searchError) {
      setResults([]);
      setError(searchError instanceof Error ? searchError.message : 'Unable to search right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSearch(query);
  };

  const handleQuickFilter = (nextQuery: string) => {
    setQuery(nextQuery);
    void handleSearch(nextQuery);
  };

  const updateQuantity = (dishId: string, delta: number) => {
    setQuantities((current: Record<string, number>) => {
      const nextValue = (current[dishId] ?? 0) + delta;
      if (nextValue <= 0) {
        const { [dishId]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [dishId]: nextValue };
    });
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="mx-auto min-h-screen max-w-[430px] px-4 pb-28 pt-5 sm:max-w-[480px] lg:max-w-[960px] lg:px-6">
        <div className="lg:rounded-[32px] lg:border lg:border-[#e5e7eb] lg:bg-white lg:p-5 lg:shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <header className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#1d1d1f] text-sm font-semibold text-white">
              H
            </div>
            <p className="text-sm font-medium text-[#1d1d1f]">Setia Hawker Centre</p>
          </header>

          <HawkerSearchBar
            placeholder="Describe your cravings"
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            buttonLabel="Search for dishes"
          />


          <section className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[1.3rem] font-semibold tracking-[-0.05em] text-[#1d1d1f]">Popular right now</h2>
              <button type="button" onClick={() => void handleSearch(query || 'popular hawker dishes')} className="text-sm font-medium text-[#3c3c43] underline-offset-4 hover:underline">
                Refresh
              </button>
            </div>

            {isLoading && (
              <div className="mt-4 rounded-[20px] border border-[#e5e7eb] bg-white p-4 text-sm text-[#6e6e73]">
                Finding dishes near your table…
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-[20px] border border-[#f5c2c7] bg-[#fff1f2] p-4 text-sm text-[#9f1239]">
                {error}
              </div>
            )}

            {!isLoading && !error && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {featuredDishes.map((dish) => {
                  const quantity = quantities[dish.id] ?? 0;

                  return (
                    <article key={dish.id} className="overflow-hidden rounded-[22px] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
                      <div className="relative h-40 overflow-hidden bg-[#f3efe8]">
                        <div className="flex h-full items-center justify-center text-lg font-semibold uppercase tracking-[0.22em] text-[#5c4b1d]">
                          {dish.name.split(' ')[0]}
                        </div>

                        <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                          RM {dish.price.toFixed(2)}
                        </div>

                        {dish.isVegetarian ? (
                          <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#ecfdf5] text-[#166534] shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                            <LeafIcon />
                          </div>
                        ) : null}

                        <div className="absolute bottom-2 right-2">
                          {quantity > 0 ? (
                            <div className="flex items-center gap-2.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-[#1d1d1f] shadow-[0_8px_20px_rgba(15,23,42,0.18)] backdrop-blur-sm">
                              <button
                                type="button"
                                aria-label={`Decrease ${dish.name} quantity`}
                                onClick={() => updateQuantity(dish.id, -1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-lg font-semibold text-[#1d1d1f]"
                              >
                                −
                              </button>
                              <span className="min-w-5 text-center text-sm font-semibold">{quantity}</span>
                              <button
                                type="button"
                                aria-label={`Increase ${dish.name} quantity`}
                                onClick={() => updateQuantity(dish.id, 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1d1f] text-lg font-semibold text-white"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateQuantity(dish.id, 1)}
                              className="rounded-full bg-[#1d1d1f] px-2.5 py-1.5 text-[10px] font-medium text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
                              aria-label={`Add ${dish.name} to your order`}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-[1.3rem] font-semibold tracking-[-0.05em] text-[#1d1d1f]">Hawker directory</h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {stallDirectory.map((stall) => {
                const slug = stall.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                return (
                  <Link key={stall.name} href={`/shop/${slug}`} className="block">
                    <article className="rounded-[22px] bg-white p-3 shadow-[0_8px_18px_rgba(15,23,42,0.02)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white text-sm font-semibold text-[#1d1d1f] shadow-[0_6px_16px_rgba(15,23,42,0.04)] ring-1 ring-[#f1f5f9]">
                            {stall.name
                              .split(' ')
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join('')}
                          </div>
                          <div>
                            <p className="text-base font-semibold text-[#1d1d1f]">{stall.name}</p>
                            <p className="mt-0.5 text-xs text-[#6e6e73]">{stall.description}</p>
                          </div>
                        </div>

                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                          stall.busy === 'Busy'
                            ? 'bg-[#fef3c7] text-[#b45309]'
                            : stall.busy === 'Moderate'
                              ? 'bg-[#dbeafe] text-[#1d4ed8]'
                              : stall.busy === 'Closed'
                                ? 'bg-[#f5f5f7] text-[#6e6e73]'
                                : 'bg-[#dcfce7] text-[#166534]'
                        }`}>
                          {stall.busy}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-[#6e6e73]">
                        <span>{stall.dishCount} dishes</span>
                        <span className="text-right">ETA {stall.eta}</span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>

    </main>
  );
}
