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
import { formatTableLabel, getCurrentTableSession } from '@/lib/table-session';

export default function OrdersPage() {
  const { cartItems, setCartItems } = useCartItems();
  const { status, isGuest } = useAuth();
  const router = useRouter();
  const [customizingItem, setCustomizingItem] = useState<CartItem | null>(null);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [checkoutError, setCheckoutError] = useState('');
  const [tableLabel] = useState(() => formatTableLabel(getCurrentTableSession().tableNumber));
  const [placedReceipt, setPlacedReceipt] = useState<ReceiptData | null>(null);

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
      tableLabel,
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
      <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-8 text-[#1d1d1f]">
        <div className="mx-auto max-w-[480px]">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              ✓ Order placed successfully
            </span>
          </div>

          <CustomerReceipt initialData={placedReceipt} onBack={() => setPlacedReceipt(null)} />

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#007aff] hover:bg-[#0071e3] px-5 text-sm font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
            >
              Order more items
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f] sm:px-6">
      <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">Your order</h1>
            <p className="text-xs sm:text-sm text-[#6e6e73] mt-0.5">Review items and checkout</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            {tableLabel}
          </span>
        </div>

        <div className="md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_380px] md:gap-6 md:items-start">
          {/* Left Column: Order Items */}
          <section className="rounded-[28px] bg-white p-5 sm:p-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)] border border-black/[0.04]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1d1d1f]">Cart Items</h2>
              <span className="text-xs sm:text-sm text-[#6e6e73] font-medium">{cartItems.length} items</span>
            </div>

            {cartItems.length === 0 ? (
              <div className="rounded-[20px] bg-[#f5f5f7] p-8 text-center">
                <p className="text-sm font-medium text-[#1d1d1f]">Your cart is empty</p>
                <p className="mt-1 text-xs text-[#6e6e73]">Add some delicious hawker dishes from the menu to start ordering.</p>
                <Link
                  href="/home"
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[#007aff] hover:bg-[#0071e3] px-5 text-sm font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
                >
                  Browse dishes
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="rounded-[20px] bg-[#f5f5f7] p-4 border border-black/[0.02]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-[#1d1d1f]">{item.name}</p>
                        <p className="text-xs text-[#6e6e73] mt-0.5">RM {item.price.toFixed(2)} each</p>
                        {item.customizations?.length ? (
                          <p className="mt-1 text-xs text-[#6e6e73] bg-white/70 px-2 py-0.5 rounded-md inline-block">
                            Customised: {item.customizations.join(' · ')}
                          </p>
                        ) : null}
                      </div>
                      <p className="text-sm sm:text-base font-bold text-[#1d1d1f]">
                        RM {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-black/[0.04]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base font-semibold text-[#1d1d1f] shadow-xs hover:bg-[#f0f0f2] active:scale-95 transition-all"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-xs sm:text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1d1f] text-base font-semibold text-white shadow-xs hover:bg-black active:scale-95 transition-all"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      {getDishCustomization(item.name) ? (
                        <button
                          type="button"
                          onClick={() => setCustomizingItem(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-xs hover:bg-[#f0f0f2] active:scale-95 transition-all"
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
                        className="w-full resize-none rounded-[14px] border border-black/5 bg-white px-3 py-2 text-xs text-[#1d1d1f] outline-none placeholder:text-[#8e8e93] focus:border-black/20 focus:ring-1 focus:ring-black/10"
                      />
                    </label>
                  </div>
                ))}

                <div className="pt-2">
                  <Link
                    href="/home"
                    className="inline-flex items-center text-xs font-semibold text-[#0071e3] hover:underline"
                  >
                    + Add more dishes
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Right Column: Checkout & Bill Summary (Sticky on Desktop/Tablet) */}
          <div className="mt-6 md:mt-0 space-y-4 md:sticky md:top-6">
            <section className="rounded-[28px] bg-[#111827] p-5 sm:p-6 text-white shadow-[0_16px_36px_rgba(17,24,39,0.18)]">
              <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                <span>Order summary</span>
                <button
                  type="button"
                  onClick={() => router.push('/scan' as any)}
                  className="text-white hover:text-white/80 underline-offset-4 hover:underline"
                >
                  {tableLabel}
                </button>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-bold tracking-tight">RM {summary.total.toFixed(2)}</p>
                <p className="mt-1 text-xs text-white/70">
                  {cartItems.reduce((count, item) => count + item.quantity, 0)} items from {summary.merchantGroups.length} stalls
                </p>
              </div>

              {cartItems.length > 0 && (
                <div className="mt-5 space-y-2.5 pt-4 border-t border-white/10 text-xs">
                  <div className="flex justify-between text-white/75">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">RM {summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/75">
                    <span className="flex items-center gap-1.5">
                      Platform Fee
                      <span className="text-[10px] text-white/60 bg-white/10 px-1.5 py-0.5 rounded font-medium">
                        Flat
                      </span>
                    </span>
                    <span className="font-semibold text-white">RM {summary.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-dashed border-white/20">
                    <span>Total</span>
                    <span className="text-base">RM {summary.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => void checkout()}
                disabled={checkoutState === 'submitting' || checkoutState === 'success' || cartItems.length === 0}
                className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#1d1d1f] disabled:opacity-50 shadow-xs hover:bg-[#f2f2f7] active:scale-[0.98] transition-all"
              >
                {checkoutState === 'submitting'
                  ? 'Placing Order...'
                  : checkoutState === 'success'
                    ? 'Order Placed!'
                    : (
                      <span>
                        <span className="hidden xs:inline">Pay & Place Order • </span>
                        <span className="xs:hidden">Pay </span>
                        RM {summary.total.toFixed(2)}
                      </span>
                    )}
              </button>

              {checkoutError && (
                <p className="mt-3 text-center text-xs text-rose-300 bg-rose-950/40 p-2 rounded-xl border border-rose-800/50">
                  {checkoutError}
                </p>
              )}
              {checkoutState === 'success' && (
                <p className="mt-3 text-center text-xs text-emerald-300 bg-emerald-950/40 p-2 rounded-xl border border-emerald-800/50">
                  Order placed successfully! Keep your eye on the Orders tab.
                </p>
              )}
            </section>
          </div>
        </div>

        {customizingItem ? (
          <CustomizationCard
            dishName={customizingItem.name}
            basePrice={
              customizingItem.price -
              (customizingItem.customizations ?? []).reduce((total, label) => {
                const option = getDishCustomization(customizingItem.name)?.options.find(
                  (candidate) => candidate.label === label,
                );
                return total + (option?.price ?? 0);
              }, 0)
            }
            customization={getDishCustomization(customizingItem.name)!}
            initialSelection={getDishCustomization(customizingItem.name)
              ?.options.filter((option) =>
                customizingItem.customizations?.includes(option.label),
              )
              .map((option) => option.id)}
            onCancel={() => setCustomizingItem(null)}
            onConfirm={confirmCustomization}
          />
        ) : null}
      </div>
    </main>
  );
}
