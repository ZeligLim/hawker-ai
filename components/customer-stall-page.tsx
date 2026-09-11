'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Camera, ArrowRight, Store, UtensilsCrossed } from 'lucide-react';
import { HawkerSearchBar } from '@/components/hawker-search-bar';
import { CustomizationCard } from '@/components/customization-card';
import { DishCard } from '@/components/dish-card';
import { addItemToCart, getDishQuantity, removeCartItem, updateCartItemQuantity, useCartItems } from '@/lib/order/cart';
import { getDishCustomization } from '@/lib/order/customizations';
import type { HawkerCentreSummary } from '@/lib/hawker-centres/service';
import {
  clearTableSession,
  formatTableLabel,
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

type StallDirectoryItem = {
  id: string;
  name: string;
  description: string;
  eta: string;
  dishCount: number;
  isOpen: boolean;
};

const quickFilters = [
  { label: 'All Dishes', query: '' },
  { label: 'Vegetarian', query: 'vegetarian food' },
  { label: 'Halal', query: 'halal food' },
  { label: 'Spicy', query: 'spicy noodles' },
  { label: 'Under RM10', query: 'food under RM10' },
  { label: 'High Protein', query: 'high protein' },
];

function CustomerStallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCentreParam = searchParams.get('centre') || searchParams.get('slug') || '';

  const [centres, setCentres] = useState<HawkerCentreSummary[]>([]);
  const [activeCentre, setActiveCentre] = useState<HawkerCentreSummary | null>(null);
  const [tableSession, setTableSession] = useState<CurrentTableSession | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // Stall ordering state (when table is unlocked)
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FeaturedDish[]>([]);
  const [initialDishes, setInitialDishes] = useState<FeaturedDish[]>([]);
  const [stalls, setStalls] = useState<StallDirectoryItem[]>([]);
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All Dishes');

  const { cartItems, setCartItems } = useCartItems();
  const [customizingDish, setCustomizingDish] = useState<FeaturedDish | null>(null);

  // 1. Check stored table session
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = getStoredTableSession();
      if (stored && stored.tableNumber) {
        setTableSession(stored);
      }
      setHasCheckedSession(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 2. Fetch hawker centres to resolve target centre
  useEffect(() => {
    let active = true;
    const loadCentres = async () => {
      try {
        const res = await fetch('/api/hawker-centres');
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !Array.isArray(data.hawkerCentres)) return;

        setCentres(data.hawkerCentres);

        // Find centre matching query param or stored session
        const targetSlug = (rawCentreParam || tableSession?.centreSlug || '').toLowerCase();
        let matched = data.hawkerCentres.find(
          (c: HawkerCentreSummary) =>
            c.slug.toLowerCase() === targetSlug ||
            c.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(targetSlug.replace(/[^a-z0-9]/g, ''))
        );

        if (!matched && data.hawkerCentres.length > 0) {
          matched = data.hawkerCentres[0];
        }

        if (matched) {
          setActiveCentre(matched);
        }
      } catch (err) {
        console.error('Failed to load hawker centres:', err);
      }
    };

    void loadCentres();
    return () => {
      active = false;
    };
  }, [rawCentreParam, tableSession?.centreSlug]);

  // 3. Load stalls and dishes if table is unlocked and centre is resolved
  useEffect(() => {
    if (!activeCentre || !tableSession?.tableNumber) return;

    let active = true;
    const fetchCentreOutlets = async () => {
      try {
        const res = await fetch(`/api/outlets?centre=${encodeURIComponent(activeCentre.slug)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !Array.isArray(data.outlets)) return;

        const loaded: FeaturedDish[] = [];
        const loadedStalls: StallDirectoryItem[] = [];

        for (const outlet of data.outlets) {
          const restaurantName = outlet.restaurants?.name || activeCentre.name;
          const dishList = outlet.dishes ?? [];
          const isStallOpen = outlet.status !== 'inactive' && outlet.is_open !== false;

          loadedStalls.push({
            id: outlet.id,
            name: outlet.name,
            description:
              dishList.length > 0
                ? dishList.map((d: any) => d.name).join(', ')
                : `${restaurantName} · ${outlet.name}`,
            eta: outlet.eta || '10-15 min',
            dishCount: dishList.length,
            isOpen: isStallOpen,
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
          }
        }

        setInitialDishes(loaded);
        setResults(loaded);
        setStalls(loadedStalls);
      } catch (err) {
        console.error('Failed to load outlets for centre:', err);
      }
    };

    void fetchCentreOutlets();
    return () => {
      active = false;
    };
  }, [activeCentre, tableSession?.tableNumber]);

  const displayedDishes = useMemo(() => {
    let list = results;
    if (selectedStallId) {
      list = list.filter((dish) => dish.stallId === selectedStallId);
    }
    return list;
  }, [results, selectedStallId]);

  const addDish = (dish: FeaturedDish) => {
    const customization = getDishCustomization(dish);
    if (customization) {
      setCustomizingDish(dish);
      return;
    }
    updateQuantity(dish, 1);
  };

  const updateQuantity = (dish: FeaturedDish, delta: number) => {
    const stallId = dish.stallId || `${dish.restaurantName}:${dish.stallName}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const existing = cartItems.find((i) => i.dishId === dish.id);
    if (delta > 0) {
      setCartItems((currentItems) =>
        addItemToCart(currentItems, {
          dishId: dish.id,
          name: dish.name,
          restaurantName: dish.restaurantName,
          stallName: dish.stallName,
          stallId,
          price: dish.price,
          quantity: 1,
        })
      );
    } else if (existing) {
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        setCartItems((current) => removeCartItem(current, existing.id));
      } else {
        setCartItems((current) => updateCartItemQuantity(current, existing.id, nextQty));
      }
    }
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
      })
    );
    setCustomizingDish(null);
  };

  const handleClearTable = () => {
    clearTableSession();
    setTableSession(null);
  };

  const centreSlugForScan = activeCentre?.slug || rawCentreParam || '';

  // STATE A: Table is NOT scanned yet
  // "when click enter and order, switch to the stall tab, add a camera logo there to scan qr for table number, do not add anything else."
  if (!hasCheckedSession || !tableSession?.tableNumber) {
    return (
      <main className="min-h-[82vh] flex flex-col items-center justify-center px-4">
        <Link
          href={`/scan${centreSlugForScan ? `?centre=${encodeURIComponent(centreSlugForScan)}` : ''}` as any}
          className="group flex flex-col items-center justify-center"
          aria-label="Scan QR for table number"
        >
          <div className="flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center rounded-full bg-white border border-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.08)] group-hover:scale-105 active:scale-95 transition-all">
            <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-[#111827] text-white shadow-md group-hover:bg-black transition-colors">
              <Camera className="h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.8} />
            </div>
          </div>
        </Link>
      </main>
    );
  }

  // STATE B: Table is scanned (table number is set) -> Diner can browse stalls & order
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <main className="mx-auto max-w-[430px] px-4 pt-3 pb-28 sm:max-w-[480px] lg:max-w-[720px]">
      {/* Top Bar: Table Number Badge with Camera Icon to re-scan */}
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm border border-black/[0.04]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <p className="text-xs font-bold text-[#1d1d1f]">
              {formatTableLabel(tableSession.tableNumber)}
              {activeCentre ? ` • ${activeCentre.name}` : ''}
            </p>
            <p className="text-[10px] text-[#6e6e73]">Table linked • Ordering unlocked</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/scan${centreSlugForScan ? `?centre=${encodeURIComponent(centreSlugForScan)}` : ''}` as any}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5 transition-colors"
            title="Scan different table QR"
            aria-label="Scan different table QR"
          >
            <Camera className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={handleClearTable}
            className="text-[11px] font-semibold text-[#86868b] hover:text-[#e03e3e] transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Stalls Carousel Filter */}
      {stalls.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6e6e73]">
              Stalls ({stalls.length})
            </h2>
            {selectedStallId && (
              <button
                type="button"
                onClick={() => setSelectedStallId(null)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Show All
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedStallId(null)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border ${
                selectedStallId === null
                  ? 'bg-[#111827] text-white border-[#111827] shadow-sm'
                  : 'bg-white text-[#1d1d1f] border-black/10 hover:border-black/30'
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>All Stalls</span>
            </button>

            {stalls.map((stall) => {
              const isSelected = selectedStallId === stall.id;
              return (
                <button
                  key={stall.id}
                  type="button"
                  onClick={() => setSelectedStallId(isSelected ? null : stall.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-[#111827] text-white border-[#111827] shadow-sm'
                      : 'bg-white text-[#1d1d1f] border-black/10 hover:border-black/30'
                  }`}
                >
                  <span>{stall.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#f5f5f7] text-[#6e6e73]'
                    }`}
                  >
                    {stall.dishCount}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Dishes List */}
      <section className="space-y-3">
        {displayedDishes.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-[#86868b] border border-black/[0.04]">
            No dishes available for this selection.
          </div>
        ) : (
          displayedDishes.map((dish) => (
            <DishCard
              key={dish.id}
              id={dish.id}
              name={dish.name}
              price={dish.price}
              isVegetarian={dish.isVegetarian}
              spiceLevel={dish.spiceLevel}
              imageUrl={dish.imageUrl}
              quantity={getDishQuantity(cartItems, dish.id)}
              onAdd={() => addDish(dish)}
              onUpdateQuantity={(delta) => updateQuantity(dish, delta)}
            />
          ))
        )}
      </section>

      {/* Floating Sticky Cart Bar */}
      {totalCartCount > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-[430px] px-4 sm:max-w-[480px] lg:max-w-[720px] animate-scale-in">
          <Link
            href="/orders"
            className="flex w-full items-center justify-between rounded-full bg-[#111827] px-5 py-3.5 text-white shadow-[0_12px_28px_rgba(0,0,0,0.25)] hover:bg-black transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#111827]">
                {totalCartCount}
              </span>
              <span className="text-xs font-bold tracking-tight">View Cart ({formatTableLabel(tableSession.tableNumber)})</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-sm">
              <span>RM {cartSubtotal.toFixed(2)}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}

      {/* Customization Modal */}
      {customizingDish && (
        <CustomizationCard
          dishName={customizingDish.name}
          basePrice={customizingDish.price}
          customization={getDishCustomization(customizingDish)!}
          onCancel={() => setCustomizingDish(null)}
          onConfirm={(selection) => confirmCustomization(customizingDish, selection)}
        />
      )}
    </main>
  );
}

export function CustomerStallPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f7]" />}>
      <CustomerStallContent />
    </Suspense>
  );
}
