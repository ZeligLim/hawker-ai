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
              className="rounded-full bg-[#111827] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-black transition-colors"
            >
              Order more items
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
              <button type="button" onClick={() => router.push('/scan' as any)} className="text-white underline-offset-4 hover:underline">
                {tableLabel}
              </button>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold tracking-[-0.06em]">RM {summary.total.toFixed(2)}</p>
                <p className="mt-0.5 text-xs text-white/70">
                  Subtotal RM {summary.subtotal.toFixed(2)} + Fee RM {summary.serviceFee.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-white/80">
                  {cartItems.reduce((count, item) => count + item.quantity, 0)} items from {summary.merchantGroups.length} stalls
                </p>
              </div>
              <button
                type="button"
                onClick={() => void checkout()}
                disabled={checkoutState === 'submitting' || checkoutState === 'success' || cartItems.length === 0}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#111827] disabled:opacity-60 shadow-sm"
              >
                {checkoutState === 'submitting' ? 'Placing...' : checkoutState === 'success' ? 'Placed' : `Checkout RM ${summary.total.toFixed(2)}`}
              </button>
            </div>
            {checkoutError ? <p className="mt-3 text-xs text-rose-200">{checkoutError}</p> : null}
            {checkoutState === 'success' ? <p className="mt-3 text-xs text-emerald-200">Order placed successfully.</p> : null}
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
                  {getDishCustomization(item.name) ? (
                    <button
                      type="button"
                      onClick={() => openCustomization(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-sm"
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
                    placeholder="Add a comment"
                    rows={2}
                    className="w-full resize-none rounded-[12px] border-0 bg-white px-3 py-2 text-xs text-[#1d1d1f] outline-none placeholder:text-[#8e8e93] focus:ring-2 focus:ring-[#cbd5e1]"
                  />
                </label>
              </div>
            ))}
          </div>

          {cartItems.length > 0 ? (
            <div className="mt-4 pt-4 border-t border-black/[0.06] space-y-2">
              <div className="flex justify-between text-xs text-[#6e6e73]">
                <span>Subtotal ({cartItems.reduce((count, item) => count + item.quantity, 0)} items)</span>
                <span className="font-medium text-[#1d1d1f]">RM {summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#6e6e73]">
                <span className="flex items-center gap-1.5">
                  Platform / Service Fee
                  <span className="text-[10px] text-[#86868b] bg-black/[0.04] px-1.5 py-0.5 rounded font-medium">
                    Flat Diner Fee
                  </span>
                </span>
                <span className="font-medium text-[#1d1d1f]">RM {summary.serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#1d1d1f] pt-2 border-t border-dashed border-black/10">
                <span>Total Amount</span>
                <span className="text-base text-[#1d1d1f]">RM {summary.total.toFixed(2)}</span>
              </div>
            </div>
          ) : null}
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
