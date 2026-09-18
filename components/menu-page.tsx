'use client';

import { ArrowRight, CupSoda, IceCreamCone, MapPin, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { HawkerSearchBar } from '@/components/hawker-search-bar';
import { CustomizationCard } from '@/components/customization-card';
import { DishCard } from '@/components/dish-card';
import { addItemToCart, getDishQuantity, removeCartItem, updateCartItemQuantity, useCartItems } from '@/lib/order/cart';
import { getDishCustomization } from '@/lib/order/customizations';
import { getStoredTableSession } from '@/lib/table-session';

function MainCourseIcon() {
  return <UtensilsCrossed className="h-[18px] w-[18px]" strokeWidth={1.8} />;
}

function DrinkIcon() {
  return <CupSoda className="h-[18px] w-[18px]" strokeWidth={1.8} />;
}

function DessertIcon() {
  return <IceCreamCone className="h-[18px] w-[18px]" strokeWidth={1.8} />;
}

const categories = [
  { id: 'main-course', label: 'Main Course', icon: MainCourseIcon },
  { id: 'drinks', label: 'Drinks', icon: DrinkIcon },
  { id: 'desserts', label: 'Desserts', icon: DessertIcon },
] as const;

type MenuItem = {
  id: string;
  foodOutletId: string;
  restaurantName: string;
  stallName: string;
  name: string;
  price: number;
  vegetarian: boolean;
  spiceLevel?: number;
  category: 'main-course' | 'drinks' | 'desserts';
  imageUrl?: string | null;
  customizations?: any[];
};

function categorizeDish(name: string, tags: string[] = []): 'main-course' | 'drinks' | 'desserts' {
  const text = `${name} ${tags.join(' ')}`.toLowerCase();
  if (/tea|teh|kopi|coffee|drink|juice|bandung|water|beverage|soda|milo/i.test(text)) return 'drinks';
  if (/cendol|dessert|sweet|ice|cake|kuih|ais/i.test(text)) return 'desserts';
  return 'main-course';
}

function MenuContent() {
  const searchParams = useSearchParams();
  const rawCentre = searchParams.get('centre') || searchParams.get('slug') || '';
  const [centreName, setCentreName] = useState<string>('');

  const [searchValue, setSearchValue] = useState('');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { cartItems, setCartItems } = useCartItems();
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    let active = true;
    const loadDishes = async () => {
      try {
        const stored = getStoredTableSession();
        const targetCentre = rawCentre || stored?.centreSlug || '';
        if (stored?.centreName) setCentreName(stored.centreName);

        const centreQuery = targetCentre ? `?centre=${encodeURIComponent(targetCentre)}` : '';
        const res = await fetch(`/api/outlets${centreQuery}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !Array.isArray(data.outlets)) return;

        const loaded: MenuItem[] = [];
        for (const outlet of data.outlets) {
          const restaurantName = outlet.restaurants?.name || outlet.name;
          if (!centreName && outlet.restaurants?.name) {
            setCentreName(outlet.restaurants.name);
          }
          for (const dish of outlet.dishes ?? []) {
            if (dish.is_available === false) continue;
            loaded.push({
              id: dish.id,
              foodOutletId: outlet.id,
              restaurantName,
              stallName: outlet.name,
              name: dish.name,
              price: Number(dish.price),
              vegetarian: Boolean(dish.is_vegetarian),
              spiceLevel: Number(dish.spice_level ?? 0),
              category: categorizeDish(dish.name, dish.tags),
              imageUrl: dish.image_url ?? null,
              customizations: dish.customizations ?? [],
            });
          }
        }
        setItems(loaded);
      } catch {
        // network error handled gracefully
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadDishes();
    return () => {
      active = false;
    };
  }, [rawCentre, centreName]);

  const filteredItems = items.filter((item) =>
    searchValue.trim() ? item.name.toLowerCase().includes(searchValue.toLowerCase().trim()) : true,
  );

  const menuItems = {
    'main-course': filteredItems.filter((i) => i.category === 'main-course'),
    drinks: filteredItems.filter((i) => i.category === 'drinks'),
    desserts: filteredItems.filter((i) => i.category === 'desserts'),
  };

  const updateQuantity = (item: MenuItem, delta: number) => {
    setCartItems((currentItems) => {
      const matchingItem = currentItems.find((ci) => ci.dishId === item.id);

      if (!matchingItem) {
        if (delta <= 0) return currentItems;

        return addItemToCart(currentItems, {
          dishId: item.id,
          name: item.name,
          restaurantName: item.restaurantName,
          stallName: item.stallName,
          stallId: item.foodOutletId,
          price: item.price,
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

  const addMenuItem = (item: MenuItem) => {
    if (getDishCustomization(item)) {
      setCustomizingItem(item);
      return;
    }
    updateQuantity(item, 1);
  };

  const confirmCustomization = (item: MenuItem, selection: { options: { id: string; label: string; price: number }[]; price: number }) => {
    setCartItems((currentItems) =>
      addItemToCart(currentItems, {
        dishId: item.id,
        customizationKey: selection.options.map((option) => option.id).sort().join('|'),
        customizations: selection.options.map((option) => option.label),
        name: item.name,
        restaurantName: item.restaurantName,
        stallName: item.stallName,
        stallId: item.foodOutletId,
        price: selection.price,
        quantity: 1,
      }),
    );
    setCustomizingItem(null);
  };

  const scrollToCategory = (id: (typeof categories)[number]['id']) => {
    document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="mx-auto min-h-screen w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl px-4 pb-32 pt-5 sm:px-6">
        <div>
          {centreName && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-[#6e6e73]">
              <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <span className="font-semibold text-[#1d1d1f]">{centreName}</span>
              <span>• Full Food Menu</span>
            </div>
          )}

          <div className="sticky top-0 z-10 bg-transparent pb-3 pt-1">
            <HawkerSearchBar
              placeholder="Search the menu"
              value={searchValue}
              onChange={setSearchValue}
              buttonLabel="Search menu"
            />

            <section className="mt-3">
              <div className="flex gap-2.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={`Browse ${label} category`}
                    onClick={() => scrollToCategory(id)}
                    className="flex h-11 items-center gap-2 rounded-full bg-white text-black hover:bg-neutral-100 shadow-xs px-4 text-xs font-semibold transition-colors shrink-0"
                  >
                    <Icon />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs sm:text-sm text-[#86868b]">
              Loading menu items...
            </div>
          ) : (
            <section className="mt-8 space-y-8">
              {categories.map(({ id, label, icon: Icon }) => {
                const categoryDishes = menuItems[id as keyof typeof menuItems] ?? [];
                if (categoryDishes.length === 0) return null;

                return (
                  <section key={id} id={`category-${id}`} className="scroll-mt-24">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow-xs">
                        <Icon />
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-[#1d1d1f]">
                        {label}
                      </h2>
                      <span className="text-xs text-[#86868b] font-medium">
                        ({categoryDishes.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {categoryDishes.map((item) => {
                        const quantity = getDishQuantity(cartItems, item.id);

                        return (
                          <DishCard
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            price={item.price}
                            isVegetarian={item.vegetarian}
                            spiceLevel={item.spiceLevel}
                            imageUrl={item.imageUrl}
                            quantity={quantity}
                            onAdd={() => addMenuItem(item)}
                            onUpdateQuantity={(delta) =>
                              delta > 0 ? addMenuItem(item) : updateQuantity(item, -1)
                            }
                          />
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </section>
          )}

          {customizingItem ? (
            <CustomizationCard
              dishName={customizingItem.name}
              basePrice={customizingItem.price}
              customization={getDishCustomization(customizingItem)!}
              onCancel={() => setCustomizingItem(null)}
              onConfirm={(selection) => confirmCustomization(customizingItem, selection)}
            />
          ) : null}
        </div>
      </div>

      {totalCartCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md">
          <Link
            href="/orders"
            className="flex h-11 items-center justify-between rounded-full bg-black px-5 text-white shadow-lg hover:bg-neutral-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                {totalCartCount}
              </span>
              <span className="text-sm font-semibold">View Order</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">RM {cartSubtotal.toFixed(2)}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}
    </main>
  );
}

export function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-xs text-[#86868b]">
          Loading menu...
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
