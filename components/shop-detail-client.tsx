'use client';

import Link from 'next/link';
import { Ban, Plus } from 'lucide-react';
import { useState } from 'react';
import { CustomizationCard } from '@/components/customization-card';
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
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px] sm:max-w-[480px] lg:max-w-[960px]">
        <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white text-sm font-semibold text-[#1d1d1f] shadow-[0_6px_16px_rgba(15,23,42,0.04)] ring-1 ring-[#f1f5f9]">
                {shop.name
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-[-0.06em]">{shop.name}</h1>
                <p className="mt-1 text-sm text-[#6e6e73]">{shop.description}</p>
              </div>
            </div>

            <div className="flex min-w-[88px] shrink-0 flex-col items-end gap-1 text-right">
              <span className={`whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                shop.busy === 'Busy'
                  ? 'bg-[#fef3c7] text-[#b45309]'
                  : shop.busy === 'Moderate'
                    ? 'bg-[#dbeafe] text-[#1d4ed8]'
                    : shop.busy === 'Closed'
                      ? 'bg-[#f5f5f7] text-[#6e6e73]'
                      : 'bg-[#dcfce7] text-[#166534]'
              }`}>
                {shop.busy}
              </span>
              {shop.busy !== 'Closed' ? (
                <span className="whitespace-nowrap text-[10px] font-medium leading-none text-[#6e6e73]">ETA {shop.eta}</span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            {shop.dishes.map((dish) => {
              const quantity = getDishQuantity(cartItems, `${slug}:${dish.name}`);

              return (
                <article key={dish.name} className="overflow-hidden rounded-[22px] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
                  <div className="relative h-40 overflow-hidden bg-[#f3efe8]">
                    <div className="flex h-full items-center justify-center text-lg font-semibold uppercase tracking-[0.22em] text-[#5c4b1d]">
                      {dish.name.split(' ')[0]}
                    </div>

                    <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                      RM {dish.price.toFixed(2)}
                    </div>

                    {dish.vegetarian ? (
                      <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#ecfdf5] text-[#166534] shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[14px] w-[14px]">
                          <path d="M18 3c-4.5 2.4-7.1 5.1-8.3 9.2C8.5 16 7.2 17.1 4 19.3c3.5 0 6.7-1.1 9.5-4.5C15.8 10.3 17.2 7 18 3Z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : null}

                    <div className="absolute bottom-2 left-2 right-2">
                      {shop.busy === 'Closed' ? (
                        <div
                          aria-label={`${dish.name} is unavailable`}
                          title="Unavailable"
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e5e7eb] text-[#6e6e73]"
                        >
                          <Ban className="h-4 w-4" strokeWidth={2} />
                        </div>
                      ) : quantity > 0 ? (
                        <div className="flex w-full items-center justify-between gap-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-[#1d1d1f] shadow-[0_8px_20px_rgba(15,23,42,0.18)] backdrop-blur-sm">
                          <button
                            type="button"
                            aria-label={`Decrease ${dish.name} quantity`}
                            onClick={() => updateDishQuantity(dish, -1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-lg font-semibold text-[#1d1d1f]"
                          >
                            −
                          </button>
                          <span className="min-w-4 text-center text-[11px] font-semibold">{quantity}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${dish.name} quantity`}
                            onClick={() => addDish(dish)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1d1f] text-lg font-semibold text-white"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => addDish(dish)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1d1f] text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
                            aria-label={`Add ${dish.name} to your order`}
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
