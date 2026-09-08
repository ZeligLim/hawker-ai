'use client';

import Link from 'next/link';
import { Ban, Store } from 'lucide-react';
import { useState } from 'react';
import { CustomizationCard } from '@/components/customization-card';
import { DishCard } from '@/components/dish-card';
import { addItemToCart, getDishQuantity, removeCartItem, updateCartItemQuantity, useCartItems } from '@/lib/order/cart';
import { getDishCustomization } from '@/lib/order/customizations';

export type ShopData = {
  id?: string;
  restaurantId?: string;
  restaurantName?: string;
  name: string;
  eta: string;
  busy: string;
  description: string;
  dishes: ReadonlyArray<{ id?: string; name: string; price: number; vegetarian: boolean }>;
};

export function ShopDetailClient({ shop, slug }: { shop: ShopData; slug: string }) {
  const { cartItems, setCartItems } = useCartItems();
  const [customizingDish, setCustomizingDish] = useState<ShopData['dishes'][number] | null>(null);

  const updateDishQuantity = (dish: ShopData['dishes'][number], delta: number) => {
    const targetDishId = dish.id || `${slug}:${dish.name}`;

    setCartItems((currentItems) => {
      const matchingItem = currentItems.find((item) => item.dishId === targetDishId);

      if (!matchingItem) {
        if (delta <= 0) return currentItems;

        const stallId = shop.id || `${shop.name}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        return addItemToCart(currentItems, {
          dishId: targetDishId,
          name: dish.name,
          restaurantName: shop.restaurantName ?? shop.name,
          stallName: shop.name,
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

  const addDish = (dish: ShopData['dishes'][number]) => {
    if (getDishCustomization(dish.name)) {
      setCustomizingDish(dish);
      return;
    }
    updateDishQuantity(dish, 1);
  };

  const confirmCustomization = (dish: ShopData['dishes'][number], selection: { options: { id: string; label: string; price: number }[]; price: number }) => {
    const targetDishId = dish.id || `${slug}:${dish.name}`;
    const stallId = shop.id || `${shop.name}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

    setCartItems((currentItems) =>
      addItemToCart(currentItems, {
        dishId: targetDishId,
        customizationKey: selection.options.map((option) => option.id).sort().join('|'),
        customizations: selection.options.map((option) => option.label),
        name: dish.name,
        restaurantName: shop.restaurantName ?? shop.name,
        stallName: shop.name,
        stallId,
        price: selection.price,
        quantity: 1,
      }),
    );
    setCustomizingDish(null);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f] sm:px-6">
      <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
        <section className="rounded-[28px] bg-white p-5 sm:p-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)] border border-black/[0.04]">
          <div className="flex items-start justify-between gap-2.5 sm:gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-3.5">
              <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-[14px] sm:rounded-[16px] bg-[#111827] text-sm sm:text-lg font-bold text-white shadow-sm">
                {shop.name
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] truncate">
                  {shop.name}
                </h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#6e6e73] line-clamp-2">
                  {shop.description}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 text-right">
              <span
                className={`whitespace-nowrap rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                  shop.busy === 'Busy'
                    ? 'bg-[#fef3c7] text-[#b45309]'
                    : shop.busy === 'Moderate'
                      ? 'bg-[#dbeafe] text-[#1d4ed8]'
                      : shop.busy === 'Closed'
                        ? 'bg-[#f5f5f7] text-[#6e6e73]'
                        : 'bg-[#dcfce7] text-[#166534]'
                }`}
              >
                {shop.busy}
              </span>
              {shop.busy !== 'Closed' ? (
                <span className="whitespace-nowrap text-[10px] sm:text-[11px] font-medium leading-none text-[#6e6e73]">
                  ETA {shop.eta}
                </span>
              ) : null}
            </div>
          </div>

          {shop.busy === 'Closed' && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
              <Ban className="h-4 w-4 shrink-0 text-amber-600" />
              <span>This stall is currently closed and not accepting new orders.</span>
            </div>
          )}
        </section>

        <section className="mt-7">
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#1d1d1f]">
              Stall Menu
            </h2>
            <span className="text-xs text-[#86868b] font-medium">
              {shop.dishes.length} items
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {shop.dishes.map((dish) => {
              const dishKey = dish.id || `${slug}:${dish.name}`;
              const quantity = getDishQuantity(cartItems, dishKey);
              const isClosed = shop.busy === 'Closed';

              return (
                <DishCard
                  key={dish.name}
                  id={dishKey}
                  name={dish.name}
                  price={dish.price}
                  isVegetarian={dish.vegetarian}
                  quantity={isClosed ? 0 : quantity}
                  onAdd={() => !isClosed && addDish(dish)}
                  onUpdateQuantity={(delta) =>
                    !isClosed &&
                    (delta > 0 ? addDish(dish) : updateDishQuantity(dish, -1))
                  }
                />
              );
            })}
          </div>
        </section>
        {customizingDish ? (
          <CustomizationCard
            dishName={customizingDish.name}
            basePrice={customizingDish.price}
            customization={getDishCustomization(customizingDish.name)!}
            onCancel={() => setCustomizingDish(null)}
            onConfirm={(selection) => confirmCustomization(customizingDish, selection)}
          />
        ) : null}

        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">
          Back to shops
        </Link>
      </div>
    </main>
  );
}
