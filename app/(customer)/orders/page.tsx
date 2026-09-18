'use client';

import Link from 'next/link';
import { Settings2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomizationCard } from '@/components/customization-card';
import { useAuth } from '@/components/auth-provider';
import { buildCartSummary, updateCartItemCustomization, updateCartItemQuantity, useCartItems, type CartItem } from '@/lib/order/cart';
import { getDishCustomization } from '@/lib/order/customizations';
import { supabase } from '@/lib/supabase/client';
import { CustomerReceipt, type ReceiptData } from '@/components/customer-receipt';
import { getCurrentTableSession } from '@/lib/table-session';

export default function OrdersPage() {
  const { cartItems, setCartItems } = useCartItems();
  const { status, isGuest } = useAuth();
  const router = useRouter();
  const [customizingItem, setCustomizingItem] = useState<CartItem | null>(null);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [checkoutError, setCheckoutError] = useState('');
  const [placedReceipt, setPlacedReceipt] = useState<ReceiptData | null>(null);

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

  const checkout = async () => {
    setCheckoutError('');
    if (status !== 'authenticated' || isGuest || !supabase) {
      setCheckoutError('Please sign in before placing an order.');
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutError('Add at least one dish before checking out.');
      return;
    }

    setCheckoutState('submitting');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      setCheckoutState('idle');
      setCheckoutError('Your session has expired. Please sign in again.');
      return;
    }

    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({
        tableSessionId: getCurrentTableSession().tableId ?? null,
        subtotal: summary.subtotal,
        serviceFee: summary.serviceFee,
        total: summary.total,
        subtotalAmount: summary.subtotal,
        platformFeeAmount: summary.serviceFee,
        totalAmount: summary.total,
        merchantPayoutAmount: summary.merchantPayoutAmount,
        paymentReference: paymentIntentId,
        paymentIntentId,
        items: cartItems.map((item) => ({
          dishId: item.dishId,
          stallId: item.stallId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations ?? [],
          notes: item.notes ?? '',
        })),
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      orderId?: string;
      paymentIntentId?: string;
    };

    if (!response.ok) {
      setCheckoutState('idle');
      setCheckoutError(payload.error ?? 'Unable to place your order.');
      return;
    }

    setPlacedReceipt({
      id: payload.orderId ?? `ord_${Date.now()}`,
      venueName: cartItems[0]?.restaurantName ?? 'Hawker Centre',
      subtotal: summary.subtotal,
      serviceFee: summary.serviceFee,
      total: summary.total,
      paymentStatus: 'PAID',
      refundAmount: 0,
      paymentIntentId: payload.paymentIntentId ?? paymentIntentId,
      createdAt: new Date().toISOString(),
      items: cartItems.map((item) => ({
        id: item.id,
        dishId: item.dishId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations ?? [],
        notes: item.notes ?? '',
        isRefunded: false,
        refundAmount: 0,
      })),
    });

    setCartItems([]);
    setCheckoutState('success');
  };

  if (placedReceipt) {
    return (
      <main className="min-h-screen bg-white px-4 pb-28 pt-8 text-black">
        <div className="mx-auto max-w-[480px]">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              ✓ Order placed successfully
            </span>
          </div>

          <CustomerReceipt initialData={placedReceipt} onBack={() => setPlacedReceipt(null)} />

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/home"
              className="inline-flex h-11 items-center justify-center rounded-full bg-black hover:bg-neutral-800 px-6 text-sm font-semibold text-white shadow-xs transition-colors"
            >
              Order more items
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-black sm:px-6">
      <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
        <div className="md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_380px] md:gap-6 md:items-start">
          {/* Left Column: Order Items */}
          <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-black">Cart Items</h2>
              <span className="text-xs sm:text-sm text-neutral-500 font-semibold">{cartItems.length} items</span>
            </div>

            {cartItems.length === 0 ? (
              <div className="rounded-2xl bg-neutral-50 p-8 text-center shadow-xs">
                <p className="text-sm font-bold text-black">Your cart is empty</p>
                <p className="mt-1 text-xs text-neutral-500">Add dishes from the menu to start ordering.</p>
                <Link
                  href="/home"
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-black hover:bg-neutral-800 px-6 text-sm font-semibold text-white shadow-xs transition-colors"
                >
                  Browse dishes
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-neutral-50 p-4 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-bold text-black truncate">{item.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">RM {item.price.toFixed(2)} each</p>
                        {item.customizations?.length ? (
                          <p className="mt-1 text-xs text-neutral-600 bg-white px-2 py-0.5 rounded-full font-medium shadow-xs truncate max-w-full inline-block">
                            Customised: {item.customizations.join(' · ')}
                          </p>
                        ) : null}
                      </div>
                      <p className="text-sm sm:text-base font-bold text-black shrink-0">
                        RM {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base font-bold text-black hover:bg-neutral-100 transition-colors shadow-xs"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-xs sm:text-sm font-bold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-base font-bold text-white hover:bg-neutral-800 transition-colors shadow-xs"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      {getDishCustomization(item.name) ? (
                        <button
                          type="button"
                          onClick={() => openCustomization(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-neutral-100 transition-colors shadow-xs"
                          aria-label={`Customize ${item.name}`}
                        >
                          <Settings2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>

                    <label className="mt-3 block">
                      <span className="sr-only">Comment for {item.name}</span>
                      <textarea
                        value={item.notes ?? ''}
                        onChange={(event) => updateComment(item.id, event.target.value)}
                        placeholder="Add special instructions or allergies..."
                        rows={2}
                        className="w-full resize-none rounded-xl bg-white px-3 py-2 text-xs text-black outline-none placeholder:text-neutral-400 shadow-xs"
                      />
                    </label>
                  </div>
                ))}

                <div className="pt-2">
                  <Link
                    href="/home"
                    className="inline-flex items-center text-xs font-semibold text-black hover:underline"
                  >
                    + Add more dishes
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Checkout & Bill Summary */}
          <div className="mt-6 md:mt-0 space-y-4 md:sticky md:top-6">
            <section className="rounded-3xl bg-black p-5 sm:p-6 text-white shadow-xl">
              <div className="text-xs font-bold text-white/70">
                <span>Order summary</span>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-bold tracking-tight">RM {summary.total.toFixed(2)}</p>
                <p className="mt-1 text-xs text-white/70">
                  {cartItems.reduce((count, item) => count + item.quantity, 0)} items from {summary.merchantGroups.length} stalls
                </p>
              </div>

              {cartItems.length > 0 && (
                <div className="mt-5 space-y-2.5 pt-4 text-xs">
                  <div className="flex justify-between text-white/75">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">RM {summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/75">
                    <span className="flex items-center gap-1.5">
                      Platform Fee
                      <span className="text-[10px] text-white bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                        Flat
                      </span>
                    </span>
                    <span className="font-semibold text-white">RM {summary.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2">
                    <span>Total</span>
                    <span className="text-base">RM {summary.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => void checkout()}
                disabled={checkoutState === 'submitting' || checkoutState === 'success' || cartItems.length === 0}
                className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black disabled:opacity-50 shadow-xs hover:bg-neutral-100 transition-colors"
              >
                {checkoutState === 'submitting'
                  ? 'Placing Order...'
                  : checkoutState === 'success'
                    ? 'Order Placed!'
                    : (
                      <span>
                        Pay & Place Order • RM {summary.total.toFixed(2)}
                      </span>
                    )}
              </button>

              {checkoutError && (
                <p className="mt-3 text-center text-xs text-rose-300 bg-rose-950/60 p-2.5 rounded-xl font-medium">
                  {checkoutError}
                </p>
              )}
              {checkoutState === 'success' && (
                <p className="mt-3 text-center text-xs text-emerald-300 bg-emerald-950/60 p-2.5 rounded-xl font-medium">
                  Order placed successfully!
                </p>
              )}
            </section>
          </div>
        </div>

        {customizingItem ? (
          <CustomizationCard
            dishName={customizingItem.name}
            basePrice={(() => {
              const customization = getDishCustomization(customizingItem.name);
              const allAvailableOptions = [
                ...(customization?.options || []),
                ...(customization?.spiceOptions || []),
              ];
              return (
                customizingItem.price -
                (customizingItem.customizations ?? []).reduce((total, label) => {
                  const option = allAvailableOptions.find((candidate) => candidate.label === label);
                  return total + (option?.price ?? 0);
                }, 0)
              );
            })()}
            customization={getDishCustomization(customizingItem.name)!}
            initialSelection={(() => {
              const customization = getDishCustomization(customizingItem.name);
              const allAvailableOptions = [
                ...(customization?.options || []),
                ...(customization?.spiceOptions || []),
              ];
              return allAvailableOptions
                .filter((option) => customizingItem.customizations?.includes(option.label))
                .map((option) => option.id);
            })()}
            onCancel={() => setCustomizingItem(null)}
            onConfirm={confirmCustomization}
          />
        ) : null}
      </div>
    </main>
  );
}
