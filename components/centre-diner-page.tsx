'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, MapPin, QrCode, ScanLine, UtensilsCrossed, Store } from 'lucide-react';
import { HawkerSearchBar } from '@/components/hawker-search-bar';
import { CustomizationCard } from '@/components/customization-card';
import { DishCard } from '@/components/dish-card';
import { getDishQuantity, removeCartItem, updateCartItemQuantity } from '@/lib/order/cart';
import { useCartAdd } from '@/components/use-cart-add';
import { getDishCustomization } from '@/lib/order/customizations';
import type { HawkerCentreSummary } from '@/lib/hawker-centres/service';
import {
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

const quickFilters = [
  { label: 'All Dishes', query: '' },
  { label: 'Vegetarian', query: 'vegetarian food' },
  { label: 'Halal', query: 'halal food' },
  { label: 'Spicy', query: 'spicy noodles' },
  { label: 'Under RM10', query: 'food under RM10' },
  { label: 'High Protein', query: 'high protein' },
];

type StallDirectoryItem = {
  id: string;
  name: string;
  description: string;
  eta: string;
  dishCount: number;
  isOpen: boolean;
};

export function CentreDinerPage({ centre }: { centre: HawkerCentreSummary }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FeaturedDish[]>([]);
  const [initialDishes, setInitialDishes] = useState<FeaturedDish[]>([]);
  const [stalls, setStalls] = useState<StallDirectoryItem[]>([]);
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All Dishes');

  const [tableSession, setTableSession] = useState<CurrentTableSession | null>(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [manualTableInput, setManualTableInput] = useState('04');
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  const { cartItems, setCartItems, addDish: addToCartWithWarning, CartWarningModal } = useCartAdd();
  const [customizingDish, setCustomizingDish] = useState<FeaturedDish | null>(null);

  // Check stored table session
  useEffect(() => {
    const timer = setTimeout(() => {
      const existing = getStoredTableSession();
      if (existing && existing.tableNumber) {
        // Automatically sync the centre ID and AI state when the user visits the centre menu page while having a table
        if (existing.centreId !== centre.id || existing.aiEnabled !== centre.aiEnabled) {
          setCurrentTableSession(existing.tableNumber, existing.tableId, {
            centreId: centre.id,
            centreSlug: centre.slug,
            centreName: centre.name,
            aiEnabled: centre.aiEnabled ?? true,
          });
          setTableSession(getStoredTableSession());
        } else {
          setTableSession(existing);
        }
        setManualTableInput(existing.tableNumber);
      }
      setHasCheckedSession(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [centre]);

  // Load stalls and dishes for this specific hawker centre
  useEffect(() => {
    let active = true;
    const fetchCentreOutlets = async () => {
      try {
        const res = await fetch(`/api/outlets?centre=${encodeURIComponent(centre.slug)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !Array.isArray(data.outlets)) return;

        const loaded: FeaturedDish[] = [];
        const loadedStalls: StallDirectoryItem[] = [];

        for (const outlet of data.outlets) {
          const restaurantName = outlet.restaurants?.name || centre.name;
          const dishList = outlet.dishes ?? [];

          loadedStalls.push({
            id: outlet.id,
            name: outlet.name,
            description: dishList.length > 0
              ? dishList.map((d: any) => d.name).join(', ')
              : `${restaurantName} · ${outlet.name}`,
            eta: '10–15m',
            dishCount: dishList.length,
            isOpen: outlet.is_open ?? true,
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
              imageUrl: dish.image_url,
              customizations: dish.customizations || undefined,
            });
          }
        }

        if (active) {
          setStalls(loadedStalls);
          setInitialDishes(loaded);
          setResults(loaded);
        }
      } catch (err) {
        console.error('Error fetching centre dishes:', err);
      }
    };

    void fetchCentreOutlets();
    return () => {
      active = false;
    };
  }, [centre]);

  // Filter dishes by search term or selected stall
  const displayedDishes = useMemo(() => {
    let list = results;
    if (selectedStallId) {
      list = list.filter((d) => d.stallId === selectedStallId);
    }
    return list;
  }, [results, selectedStallId]);

  const handleSearch = async (searchTerm: string) => {
    setQuery(searchTerm);
    if (!searchTerm.trim()) {
      setResults(initialDishes);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (data.results && Array.isArray(data.results)) {
        // Filter search results to this hawker centre
        const matched = data.results.filter((d: any) => {
          return !d.restaurantName || d.restaurantName === centre.name;
        });
        setResults(matched);
      } else {
        setResults([]);
      }
    } catch {
      // Deterministic client fallback matching
      const term = searchTerm.toLowerCase();
      const filtered = initialDishes.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.stallName.toLowerCase().includes(term) ||
          (term.includes('veg') && d.isVegetarian) ||
          (term.includes('halal') && d.isHalal) ||
          (term.includes('spicy') && d.spiceLevel > 0) ||
          (term.includes('under') && d.price <= 10)
      );
      setResults(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFilter = (filter: (typeof quickFilters)[number]) => {
    setActiveFilter(filter.label);
    if (!filter.query) {
      setQuery('');
      setResults(initialDishes);
      return;
    }
    void handleSearch(filter.query);
  };

  const unlockTable = (tblNum: string) => {
    const cleaned = tblNum.trim().toUpperCase() || '01';
    setCurrentTableSession(cleaned, null, {
      centreId: centre.id,
      centreSlug: centre.slug,
      centreName: centre.name,
      aiEnabled: centre.aiEnabled ?? true,
    });
    setTableSession({
      tableNumber: cleaned,
      tableId: null,
      centreId: centre.id,
      centreSlug: centre.slug,
      centreName: centre.name,
      scannedAt: new Date().toISOString(),
    });
    setIsTableModalOpen(false);
  };

  const addDish = (dish: FeaturedDish) => {
    const customization = getDishCustomization(dish);
    if (customization) {
      setCustomizingDish(dish);
      return;
    }
    const stallId = dish.stallId || `${dish.restaurantName}:${dish.stallName}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    addToCartWithWarning({
      dishId: dish.id,
      name: dish.name,
      restaurantName: dish.restaurantName,
      stallName: dish.stallName,
      stallId,
      price: dish.price,
      quantity: 1,
    });
  };

  const updateQuantity = (dish: FeaturedDish, delta: number) => {
    const stallId = dish.stallId || `${dish.restaurantName}:${dish.stallName}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const existing = cartItems.find((i) => i.dishId === dish.id);
    if (delta > 0 && !existing) {
      addToCartWithWarning({
        dishId: dish.id,
        name: dish.name,
        restaurantName: dish.restaurantName,
        stallName: dish.stallName,
        stallId,
        price: dish.price,
        quantity: 1,
      });
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
    addToCartWithWarning({
      dishId: dish.id,
      customizationKey: selection.options.map((option) => option.id).sort().join('|'),
      customizations: selection.options.map((option) => option.label),
      name: dish.name,
      restaurantName: dish.restaurantName,
      stallName: dish.stallName,
      stallId,
      price: selection.price,
      quantity: 1,
    });
    setCustomizingDish(null);
  };

  const cartTotalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Diner App Should Not Show Until Scan QR Code
  if (hasCheckedSession && (!tableSession || !tableSession.tableNumber)) {
    return (
      <main className="min-h-[82vh] flex flex-col items-center justify-center px-4">
        <Link
          href={`/scan?centre=${encodeURIComponent(centre.slug)}` as any}
          className="group flex flex-col items-center justify-center"
          aria-label="Scan QR for table number"
        >
          <div className="flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center rounded-full bg-white border border-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.08)] group-hover:scale-105 active:scale-95 transition-all">
            <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-[#111827] text-white shadow-md group-hover:bg-black transition-colors">
              <QrCode className="h-12 w-12 sm:h-14 sm:w-14" strokeWidth={1.8} />
            </div>
          </div>
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-36 text-[#1d1d1f]">
      {/* Top Venue Header */}
      <div className="bg-white border-b border-black/5">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All Centres</span>
            </Link>

            {/* Table Number Pill (0 border, no Change word, standard h-11) */}
            <button
              type="button"
              onClick={() => setIsTableModalOpen(true)}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-emerald-100 px-4 text-xs font-bold text-emerald-900 hover:bg-emerald-200 transition-colors shadow-xs"
            >
              <ScanLine className="h-4 w-4" />
              <span>{formatTableLabel(tableSession?.tableNumber || manualTableInput)}</span>
            </button>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-[#1d1d1f]">
                  {centre.name}
                </h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  Open
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#6e6e73]">
              <span className="font-semibold text-[#1d1d1f]">{centre.stallsCount} Food Stalls</span>
              <span>•</span>
              <span className="font-semibold text-[#1d1d1f]">{centre.dishesCount} Dishes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-6 space-y-5">
        {/* Search Bar */}
        <div className="w-full">
          <HawkerSearchBar
            placeholder={`Search dishes or stalls at ${centre.name}…`}
            value={query}
            onChange={(val) => {
              setQuery(val);
              void handleSearch(val);
            }}
            onSubmit={(e) => {
              e.preventDefault();
              void handleSearch(query);
            }}
          />
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => handleQuickFilter(filter)}
              className={`h-9 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === filter.label
                  ? 'bg-[#1d1d1f] text-white shadow-xs'
                  : 'bg-[#f2f2f7] text-[#8e8e93] hover:text-[#1d1d1f] hover:bg-[#e5e5ea]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Stall Selector Carousel / Chips */}
        {stalls.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#86868b]">
              <span>Stalls in this food hall ({stalls.length})</span>
              {selectedStallId && (
                <button
                  type="button"
                  onClick={() => setSelectedStallId(null)}
                  className="text-[#007aff] hover:underline"
                >
                  Show all
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedStallId(null)}
                className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStallId === null
                    ? 'bg-[#1d1d1f] text-white shadow-xs'
                    : 'bg-[#f2f2f7] text-[#8e8e93] hover:text-[#1d1d1f] hover:bg-[#e5e5ea]'
                }`}
              >
                <Store className="h-3.5 w-3.5" />
                <span>All Stalls</span>
              </button>

              {stalls.map((stall) => (
                <button
                  key={stall.id}
                  type="button"
                  onClick={() => setSelectedStallId(stall.id === selectedStallId ? null : stall.id)}
                  className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedStallId === stall.id
                      ? 'bg-[#1d1d1f] text-white shadow-xs'
                      : 'bg-[#f2f2f7] text-[#8e8e93] hover:text-[#1d1d1f] hover:bg-[#e5e5ea]'
                  }`}
                >
                  <span>{stall.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedStallId === stall.id ? 'bg-white/20 text-white' : 'bg-black/[0.06] text-[#8e8e93]'}`}>
                    {stall.dishCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dishes Listing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#1d1d1f]">
              {selectedStallId
                ? stalls.find((s) => s.id === selectedStallId)?.name ?? 'Menu'
                : 'Available Menu Dishes'}
            </h2>
            <span className="text-xs text-[#6e6e73]">
              {displayedDishes.length} {displayedDishes.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {displayedDishes.length === 0 ? (
            <div className="rounded-[24px] bg-white p-8 text-center border border-black/5 shadow-sm">
              <UtensilsCrossed className="mx-auto h-8 w-8 text-[#9ca3af]" />
              <p className="mt-3 text-sm font-semibold text-[#1d1d1f]">No dishes match your selection</p>
              <p className="mt-1 text-xs text-[#6e6e73]">Try a different filter or search term.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedStallId(null);
                  setActiveFilter('All Dishes');
                  setResults(initialDishes);
                }}
                className="mt-4 rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayedDishes.map((dish) => {
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
                    onUpdateQuantity={(delta) => updateQuantity(dish, delta)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Table Change Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#1d1d1f]">Select Table Number</h3>
            <p className="mt-1 text-xs text-[#6e6e73]">
              Ordering for table delivery at <span className="font-semibold text-[#1d1d1f]">{centre.name}</span>.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#86868b] mb-1.5">
                Table number or identifier
              </label>
              <input
                type="text"
                value={manualTableInput}
                onChange={(e) => setManualTableInput(e.target.value)}
                placeholder="e.g. 04, A12, Booth 3"
                className="w-full rounded-[14px] bg-[#f5f5f7] px-4 py-3 text-base font-bold text-[#1d1d1f] outline-none"
                autoFocus
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {['01', '02', '03', '04', '05', '08', '10', '12'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setManualTableInput(num)}
                  className={`h-9 px-3.5 rounded-full text-xs font-semibold transition-colors ${
                    manualTableInput === num
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-[#f2f2f7] text-[#1d1d1f] hover:bg-[#e5e5ea]'
                  }`}
                >
                  Table {num}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="h-11 w-1/2 rounded-full bg-[#f2f2f7] hover:bg-[#e5e5ea] text-sm font-semibold text-[#1d1d1f] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => unlockTable(manualTableInput)}
                className="h-11 w-1/2 rounded-full bg-black hover:bg-neutral-800 text-sm font-semibold text-white shadow-xs transition-colors"
              >
                Confirm Table
              </button>
            </div>
          </div>
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

      {/* Floating Bottom Cart Bar */}
      {cartTotalItems > 0 && (
        <aside
          aria-label="Current Cart Order"
          className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-lg"
        >
          <div className="flex h-11 items-center justify-between rounded-full bg-black px-5 shadow-lg text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                {cartTotalItems}
              </span>
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-white/70">
                  {cartTotalItems === 1 ? '1 item' : `${cartTotalItems} items`} · {formatTableLabel(tableSession?.tableNumber || manualTableInput)}
                </p>
                <p className="text-sm font-bold text-white">RM {cartSubtotal.toFixed(2)}</p>
              </div>
            </div>

            <Link
              href="/orders"
              className="inline-flex h-8 items-center gap-1 rounded-full bg-white px-3.5 text-xs font-semibold text-black hover:bg-neutral-100 transition-colors shadow-xs"
            >
              <span>View Order</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>
      )}
      <CartWarningModal />
    </div>
  );
}
