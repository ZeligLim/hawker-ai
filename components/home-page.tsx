'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, QrCode, ScanLine, UtensilsCrossed } from 'lucide-react';
import { HawkerSearchBar } from '@/components/hawker-search-bar';
import { CustomizationCard } from '@/components/customization-card';
import { DishCard } from '@/components/dish-card';
import { addItemToCart, getDishQuantity, removeCartItem, updateCartItemQuantity, useCartItems } from '@/lib/order/cart';
import { getDishCustomization } from '@/lib/order/customizations';
import {
  clearTableSession,
  formatTableLabel,
  getCurrentTableSession,
  getStoredTableSession,
  setCurrentTableSession,
  type CurrentTableSession,
} from '@/lib/table-session';

type FeaturedDish = {
  id: string;
  stallId?: string;
  name: string;
  restaurantName: string;
  stallName: string;
  price: number;
  isVegetarian: boolean;
  isHalal: boolean;
  spiceLevel: number;
  proteinGrams: number;
  imageUrl?: string | null;
  customizations?: any[];
};

const quickFilters = [
  { label: 'Vegetarian', query: 'vegetarian food' },
  { label: 'Halal', query: 'halal food' },
  { label: 'Spicy', query: 'spicy noodles under RM10' },
  { label: 'Under RM10', query: 'food under RM10' },
  { label: 'High Protein', query: 'something high in protein' },
  { label: 'Popular', query: 'popular hawker dishes' },
];

type StallDirectoryItem = {
  id: string;
  name: string;
  description: string;
  eta: string;
  busy: string;
  dishCount: number;
};

export function HomePage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FeaturedDish[]>([]);
  const [initialDishes, setInitialDishes] = useState<FeaturedDish[]>([]);
  const [stalls, setStalls] = useState<StallDirectoryItem[]>([]);
  const [venueName, setVenueName] = useState('Hawker Centre');
  const [tableSession, setTableSession] = useState<CurrentTableSession | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [manualTableInput, setManualTableInput] = useState('04');

  const router = useRouter();
  const { cartItems, setCartItems } = useCartItems();
  const [customizingDish, setCustomizingDish] = useState<FeaturedDish | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTableSession(getStoredTableSession());
      setHasCheckedSession(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      try {
        const centreParam = tableSession?.centreSlug ? `?centre=${encodeURIComponent(tableSession.centreSlug)}` : '';
        const res = await fetch(`/api/outlets${centreParam}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !Array.isArray(data.outlets)) return;

        const loaded: FeaturedDish[] = [];
        const loadedStalls: StallDirectoryItem[] = [];

        for (const outlet of data.outlets) {
          const restaurantName = outlet.restaurants?.name || outlet.name;
          const dishList = outlet.dishes ?? [];

          loadedStalls.push({
            id: outlet.id,
            name: outlet.name,
            description: dishList.length > 0
              ? dishList.map((d: any) => d.name).join(', ')
              : `${restaurantName} · ${outlet.name}`,
            eta: '10 min',
            busy: dishList.length > 0 ? 'Open' : 'Prep Shift',
            dishCount: dishList.length,
          });

          for (const dish of dishList) {
            if (dish.is_available === false) continue;
            loaded.push({
              id: dish.id,
              stallId: outlet.id,
              name: dish.name,
              restaurantName,
              stallName: outlet.name,
              price: Number(dish.price),
              isVegetarian: Boolean(dish.is_vegetarian),
              isHalal: Boolean(dish.is_halal),
              spiceLevel: Number(dish.spice_level ?? 0),
              proteinGrams: Number(dish.protein_grams ?? 0),
              imageUrl: dish.image_url ?? null,
              customizations: dish.customizations ?? [],
            });
            if (loaded.length >= 8) break;
          }
        }

        if (active) {
          setStalls(loadedStalls);
          if (loaded.length > 0) {
            setInitialDishes(loaded);
          }
          if (data.outlets[0]?.restaurants?.name) {
            setVenueName(data.outlets[0].restaurants.name);
          }
        }
      } catch {
        // gracefully handle
      }
    };
    void fetchInitial();
    return () => {
      active = false;
    };
  }, [tableSession?.centreSlug]);

  const unlockTable = (selectedTable: string) => {
    const trimmed = selectedTable.trim();
    if (!trimmed) return;
    setCurrentTableSession(trimmed, null, {
      centreName: venueName,
      centreSlug: tableSession?.centreSlug,
    });
    setTableSession(getStoredTableSession());
  };

  const featuredDishes = useMemo<FeaturedDish[]>(() => {
    if (results.length > 0) return results;
    if (initialDishes.length > 0) return initialDishes;
    return [];
  }, [results, initialDishes]);

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
        stallId: dish.stallId,
        name: dish.name,
        restaurantName: dish.restaurantName,
        stallName: dish.stallName,
        price: Number(dish.price),
        isVegetarian: Boolean(dish.isVegetarian),
        isHalal: Boolean(dish.isHalal),
        spiceLevel: Number(dish.spiceLevel),
        proteinGrams: Number(dish.proteinGrams),
        imageUrl: dish.imageUrl || dish.image_url || null,
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

  const updateQuantity = (dish: FeaturedDish, delta: number) => {
    setCartItems((currentItems) => {
      const matchingItem = currentItems.find((item) => item.dishId === dish.id);

      if (!matchingItem) {
        if (delta <= 0) return currentItems;

        const stallId = dish.stallId || `${dish.restaurantName}:${dish.stallName}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        return addItemToCart(currentItems, {
          dishId: dish.id,
          name: dish.name,
          restaurantName: dish.restaurantName,
          stallName: dish.stallName,
          stallId,
          price: dish.price,
          quantity: 1,
        });
      }

      const nextQuantity = matchingItem.quantity + delta;
      if (nextQuantity <= 0) {
        return removeCartItem(currentItems, matchingItem.id);
      }

      return updateCartItemQuantity(currentItems, matchingItem.id, nextQuantity);
    });
  };

  const addDish = (dish: FeaturedDish) => {
    const customization = getDishCustomization(dish);
    if (customization) {
      setCustomizingDish(dish);
      return;
    }
    updateQuantity(dish, 1);
  };

  const confirmCustomization = (dish: FeaturedDish, selection: { options: { id: string; label: string; price: number }[]; price: number }) => {
    const stallId = dish.stallId || `${dish.restaurantName}:${dish.stallName}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    setCartItems((currentItems) =>
      addItemToCart(currentItems, {
        dishId: dish.id,
        customizationKey: selection.options.map((option) => option.id).sort().join('|'),
        customizations: selection.options.map((option) => option.label),
        name: dish.name,
        restaurantName: dish.restaurantName,
        stallName: dish.stallName,
        stallId,
        price: selection.price,
        quantity: 1,
      }),
    );
    setCustomizingDish(null);
  };

  // Diner App Should Not Show Until Scan QR Code
  if (hasCheckedSession && (!tableSession || !tableSession.tableNumber)) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 py-8 text-[#1d1d1f] flex flex-col justify-center items-center selection:bg-[#0071e3] selection:text-white">
        <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-[0_16px_36px_rgba(0,0,0,0.06)] border border-black/[0.05] text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#30d158]/10 text-[#30d158] text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
            {venueName}
          </div>

          <div className="w-20 h-20 rounded-[24px] bg-[#1d1d1f] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <QrCode className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
            Scan Table QR to Order
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
            Please scan the QR code located on your table to view menus and order dishes directly to your seat.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/scan"
              className="w-full py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_2px_10px_rgba(0,113,227,0.25)] transition-all"
            >
              <ScanLine className="w-4 h-4" />
              Open Camera Scanner
            </Link>

            <div className="pt-3 border-t border-black/[0.06]">
              <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-2">
                Quick Table Selection (Demo)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['04', '12', '01'].map((tbl) => (
                  <button
                    key={tbl}
                    type="button"
                    onClick={() => unlockTable(tbl)}
                    className="py-2 px-2.5 rounded-xl bg-[#f5f5f7] hover:bg-black/5 font-semibold text-xs text-[#1d1d1f] border border-black/[0.04] transition-colors"
                  >
                    Table {tbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <input
                value={manualTableInput}
                onChange={(e) => setManualTableInput(e.target.value)}
                placeholder="Table No. (e.g. 04)"
                className="w-full rounded-full border border-black/[0.08] bg-[#f5f5f7] px-3.5 py-2 text-xs outline-none focus:border-[#1d1d1f]"
              />
              <button
                type="button"
                onClick={() => unlockTable(manualTableInput)}
                className="px-4 py-2 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold shrink-0"
              >
                Unlock
              </button>
            </div>
          </div>

          <p className="mt-5 text-[11px] text-[#86868b]">
            0% extra fees &bull; Hot food delivered straight to table
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="mx-auto min-h-screen w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl px-4 pb-32 pt-5 sm:px-6">
        <div>
          <div className="mb-4 flex items-center justify-between gap-2.5 rounded-[22px] bg-white border border-black/[0.06] shadow-xs px-3.5 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#1d1d1f] text-xs font-semibold text-white shadow-xs shrink-0">
                H
              </div>
              <p className="text-sm font-semibold text-[#1d1d1f] truncate">{venueName}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-[#1d1d1f] text-white px-3 py-1 text-xs font-semibold whitespace-nowrap">
                {formatTableLabel(tableSession?.tableNumber ?? '')}
              </span>
              <button
                type="button"
                onClick={() => {
                  clearTableSession();
                  setTableSession(null);
                }}
                className="text-[11px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] underline whitespace-nowrap"
              >
                Change
              </button>
            </div>
          </div>

          <HawkerSearchBar
            placeholder="Describe your cravings"
            value={query}
            onChange={setQuery}
            onSubmit={handleSubmit}
            buttonLabel="Search for dishes"
          />

          <section className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#1d1d1f]">
                Popular right now
              </h2>
              <button
                type="button"
                onClick={() => void handleSearch(query || 'popular hawker dishes')}
                className="text-xs sm:text-sm font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
              >
                Refresh
              </button>
            </div>

            {isLoading && (
              <div className="mt-4 rounded-[22px] border border-black/[0.06] bg-white p-6 text-center text-xs sm:text-sm text-[#6e6e73]">
                Finding dishes near your table…
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-[22px] border border-[#f5c2c7] bg-[#fff1f2] p-4 text-xs sm:text-sm text-[#9f1239]">
                {error}
              </div>
            )}

            {!isLoading && !error && (
              featuredDishes.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {featuredDishes.map((dish) => {
                    const quantity = getDishQuantity(cartItems, dish.id);

                    return (
                      <DishCard
                        key={dish.id}
                        id={dish.id}
                        name={dish.name}
                        price={dish.price}
                        isVegetarian={dish.isVegetarian}
                        spiceLevel={dish.spiceLevel}
                        imageUrl={dish.imageUrl}
                        quantity={quantity}
                        onAdd={() => addDish(dish)}
                        onUpdateQuantity={(delta) =>
                          delta > 0 ? addDish(dish) : updateQuantity(dish, -1)
                        }
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-[22px] border border-black/[0.06] bg-white p-8 text-center text-xs sm:text-sm text-[#6e6e73]">
                  No dishes found. Browse the stalls below to view their menus!
                </div>
              )
            )}
          </section>

          {customizingDish ? (
            <CustomizationCard
              dishName={customizingDish.name}
              basePrice={customizingDish.price}
              customization={getDishCustomization(customizingDish)!}
              onCancel={() => setCustomizingDish(null)}
              onConfirm={(selection) => confirmCustomization(customizingDish, selection)}
            />
          ) : null}

          <section className="mt-9">
            <div className="mb-3.5 flex items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#1d1d1f]">
                Hawker stalls
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
              {stalls.map((stall) => {
                const slug = stall.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                return (
                  <Link key={stall.id} href={`/shop/${slug}`} className="block">
                    <article className="rounded-[22px] bg-white p-3 shadow-[0_8px_18px_rgba(15,23,42,0.02)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white text-sm font-semibold text-[#1d1d1f] shadow-[0_6px_16px_rgba(15,23,42,0.04)] ring-1 ring-[#f1f5f9]">
                            {stall.name
                              .split(' ')
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-[#1d1d1f] truncate">{stall.name}</p>
                            <p className="mt-0.5 text-xs text-[#6e6e73] truncate">{stall.description}</p>
                          </div>
                        </div>

                        <div className="flex min-w-[88px] shrink-0 flex-col items-end gap-1 text-right">
                          <span className={`whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${
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
                          {stall.busy !== 'Closed' ? (
                            <span className="whitespace-nowrap text-[10px] font-medium leading-none text-[#6e6e73]">ETA {stall.eta}</span>
                          ) : null}
                        </div>
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
