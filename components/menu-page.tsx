'use client';

import { CupSoda, IceCreamCone, Leaf, Plus, UtensilsCrossed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HawkerSearchBar } from '@/components/hawker-search-bar';
import { CustomizationCard } from '@/components/customization-card';
import { addItemToCart, getDishQuantity, removeCartItem, updateCartItemQuantity, useCartItems } from '@/lib/order/cart';
import { getDishCustomization } from '@/lib/order/customizations';

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
  category: 'main-course' | 'drinks' | 'desserts';
};

function categorizeDish(name: string, tags: string[] = []): 'main-course' | 'drinks' | 'desserts' {
  const text = `${name} ${tags.join(' ')}`.toLowerCase();
  if (/tea|teh|kopi|coffee|drink|juice|bandung|water|beverage|soda|milo/i.test(text)) return 'drinks';
  if (/cendol|dessert|sweet|ice|cake|kuih|ais/i.test(text)) return 'desserts';
  return 'main-course';
}

export function MenuPage() {
  const [searchValue, setSearchValue] = useState('');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { cartItems, setCartItems } = useCartItems();
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    let active = true;
    const loadDishes = async () => {
      try {
        const res = await fetch('/api/outlets');
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !Array.isArray(data.outlets)) return;

        const loaded: MenuItem[] = [];
        for (const outlet of data.outlets) {
          const restaurantName = outlet.restaurants?.name || outlet.name;
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
              category: categorizeDish(dish.name, dish.tags),
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
  }, []);

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
    if (getDishCustomization(item.name)) {
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

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="mx-auto min-h-screen max-w-[430px] px-4 pb-28 pt-5 sm:max-w-[480px] lg:max-w-[960px] lg:px-6">
        <div className="lg:rounded-[32px] lg:bg-white lg:p-5 lg:shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="sticky top-0 z-10 bg-transparent pb-2 pt-1">
            <HawkerSearchBar
              placeholder="Search the menu"
              value={searchValue}
              onChange={setSearchValue}
              buttonLabel="Search menu"
            />

            <section className="mt-2">
              <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={`Browse ${id} category`}
                    onClick={() => scrollToCategory(id)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-[0_8px_18px_rgba(15,23,42,0.02)] transition hover:bg-[#f5f5f7]"
                  >
                    <Icon />
                  </button>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-8 space-y-5">
            {categories.map(({ id, icon: Icon }) => (
              <section key={id} id={`category-${id}`} className="scroll-mt-24">
                <div className="mb-3 flex items-center justify-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f]">
                    <Icon />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(menuItems[id as keyof typeof menuItems] ?? []).map((item) => {
                    const quantity = getDishQuantity(cartItems, item.id);

                    return (
                      <article key={item.id} className="overflow-hidden rounded-[22px] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
                        <div className="relative h-40 overflow-hidden bg-[#f3efe8]">
                          <div className="flex h-full items-center justify-center text-lg font-semibold uppercase tracking-[0.22em] text-[#5c4b1d]">
                            {item.name.split(' ')[0]}
                          </div>

                          <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                            RM {item.price.toFixed(2)}
                          </div>

                          {item.vegetarian ? (
                            <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#ecfdf5] text-[#166534] shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                              <Leaf className="h-[14px] w-[14px]" strokeWidth={1.8} />
                            </div>
                          ) : null}

                          <div className="absolute bottom-2 left-2 right-2">
                            {quantity > 0 ? (
                              <div className="flex w-full items-center justify-between gap-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-[#1d1d1f] shadow-[0_8px_20px_rgba(15,23,42,0.18)] backdrop-blur-sm">
                                <button
                                  type="button"
                                  aria-label={`Decrease ${item.name} quantity`}
                                  onClick={() => updateQuantity(item, -1)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-lg font-semibold text-[#1d1d1f]"
                                >
                                  −
                                </button>
                                <span className="min-w-4 text-center text-[11px] font-semibold">{quantity}</span>
                                <button
                                  type="button"
                                  aria-label={`Increase ${item.name} quantity`}
                                  onClick={() => addMenuItem(item)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1d1f] text-lg font-semibold text-white"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => addMenuItem(item)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1d1f] text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
                                  aria-label={`Add ${item.name} to your order`}
                                >
                                  <Plus className="h-4 w-4" strokeWidth={2} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </section>
          {customizingItem ? (
            <CustomizationCard
              dishName={customizingItem.name}
              basePrice={customizingItem.price}
              customization={getDishCustomization(customizingItem.name)!}
              onCancel={() => setCustomizingItem(null)}
              onConfirm={(selection) => confirmCustomization(customizingItem, selection)}
            />
          ) : null}
        </div>
      </div>

    </main>
  );
}
