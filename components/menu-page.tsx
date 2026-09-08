'use client';

import { CupSoda, IceCreamCone, UtensilsCrossed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HawkerSearchBar } from '@/components/hawker-search-bar';
import { CustomizationCard } from '@/components/customization-card';
import { DishCard } from '@/components/dish-card';
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
      <div className="mx-auto min-h-screen w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl px-4 pb-32 pt-5 sm:px-6">
        <div className="lg:rounded-[32px] lg:border lg:border-black/[0.04] lg:bg-white lg:p-6 lg:shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
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
                    className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#1d1d1f] shadow-xs border border-black/5 hover:bg-[#f5f5f7] active:scale-95 transition-all shrink-0"
                  >
                    <Icon />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-8 space-y-8">
            {categories.map(({ id, label, icon: Icon }) => {
              const categoryDishes = menuItems[id as keyof typeof menuItems] ?? [];
              if (categoryDishes.length === 0) return null;

              return (
                <section key={id} id={`category-${id}`} className="scroll-mt-24">
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-white shadow-xs">
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
