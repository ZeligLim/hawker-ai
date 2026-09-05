'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CustomizationCard } from '@/components/customization-card';
import { buildCartSummary, updateCartItemCustomization, updateCartItemQuantity, useCartItems, type CartItem } from '@/lib/order/cart';
import { getDishCustomization } from '@/lib/order/customizations';

const directory = [
  { name: 'Ah Seng Chicken Rice', open: true, items: 12, eta: '10 min' },
  { name: 'Penang Corner', open: true, items: 9, eta: '12 min' },
  { name: 'Green Garden Vegetarian', open: true, items: 11, eta: '8 min' },
  { name: 'Curry House', open: false, items: 8, eta: 'Closed' },
];

export default function OrdersPage() {
  const { cartItems, setCartItems } = useCartItems();
  const [customizingItem, setCustomizingItem] = useState<CartItem | null>(null);

  const orderItems = useMemo(
    () =>
      cartItems.map((item) => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
      })),
    [cartItems],
  );

  const summary = useMemo(() => buildCartSummary(cartItems), [cartItems]);

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems((currentItems) => updateCartItemQuantity(currentItems, itemId, quantity));
  };

  const updateComment = (itemId: string, notes: string) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, notes } : item)),
    );
  };

  const openCustomization = (item: CartItem) => {
    if (getDishCustomization(item.name)) {
      setCustomizingItem(item);
    }
  };

  const confirmCustomization = (selection: { options: { id: string; label: string; price: number }[]; price: number }) => {
    if (!customizingItem) return;

    setCartItems((currentItems) =>
      updateCartItemCustomization(currentItems, customizingItem.id, {
        customizationKey: selection.options.map((option) => option.id).sort().join('|'),
        customizations: selection.options.map((option) => option.label),
        price: selection.price,
      }),
    );
    setCustomizingItem(null);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px] sm:max-w-[480px] lg:max-w-[960px]">
        <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.06em]">Your order</h1>
            </div>
            <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3c3c43]">
              Ready
            </span>
          </div>

          <div className="mt-5 rounded-[22px] bg-[#111827] p-4 text-white shadow-[0_16px_32px_rgba(17,24,39,0.18)]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-white/70">
              <span>Current order</span>
              <span>Table 12</span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold tracking-[-0.06em]">RM {summary.total.toFixed(2)}</p>
                <p className="mt-1 text-sm text-white/75">
                  {cartItems.reduce((count, item) => count + item.quantity, 0)} items from {summary.merchantGroups.length} stalls
                </p>
              </div>
              <button type="button" className="rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#111827]">
                Checkout
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-[-0.04em]">Details</h2>
            <span className="text-sm text-[#6e6e73]">{orderItems.length} items</span>
          </div>

          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="rounded-[16px] bg-[#f5f5f7] px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#1d1d1f]">{item.name}</p>
                    <p className="text-xs text-[#6e6e73]">RM {item.price.toFixed(2)} each</p>
                    {item.customizations?.length ? (
                      <p className="mt-1 text-xs text-[#6e6e73]">Customised: {item.customizations.join(' · ')}</p>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">RM {(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#1d1d1f] shadow-sm"
                      aria-label={`Decrease quantity for ${item.name}`}
                    >
                      −
                    </button>
                    <span className="min-w-5 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-lg font-semibold text-white shadow-sm"
                      aria-label={`Increase quantity for ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-[#6e6e73]">{item.stallName}</span>
                </div>

                {getDishCustomization(item.name) ? (
                  <button
                    type="button"
                    onClick={() => openCustomization(item)}
                    className="mt-3 text-xs font-semibold text-[#3c3c43] underline underline-offset-4"
                  >
                    Customize
                  </button>
                ) : null}

                <label className="mt-3 block">
                  <span className="sr-only">Comment for {item.name}</span>
                  <textarea
                    value={item.notes ?? ''}
                    onChange={(event) => updateComment(item.id, event.target.value)}
                    placeholder="Add a comment"
                    rows={2}
                    className="w-full resize-none rounded-[12px] border-0 bg-white px-3 py-2 text-xs text-[#1d1d1f] outline-none placeholder:text-[#8e8e93] focus:ring-2 focus:ring-[#cbd5e1]"
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        {customizingItem ? (
          <CustomizationCard
            dishName={customizingItem.name}
            basePrice={customizingItem.price - (customizingItem.customizations ?? []).reduce((total, label) => {
              const option = getDishCustomization(customizingItem.name)?.options.find((candidate) => candidate.label === label);
              return total + (option?.price ?? 0);
            }, 0)}
            customization={getDishCustomization(customizingItem.name)!}
            initialSelection={getDishCustomization(customizingItem.name)?.options
              .filter((option) => customizingItem.customizations?.includes(option.label))
              .map((option) => option.id)}
            onCancel={() => setCustomizingItem(null)}
            onConfirm={confirmCustomization}
          />
        ) : null}

        <Link href="/" className="mt-6 inline-flex rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">
          Browse dishes
        </Link>
      </div>
    </main>
  );
}
