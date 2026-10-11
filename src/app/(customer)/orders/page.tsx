"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { CustomizationCard } from "@/components/customization-card";
import { useAuth } from "@/components/auth-provider";
import {
  buildCartSummary,
  updateCartItemCustomization,
  updateCartItemQuantity,
  useCartItems,
  type CartItem,
} from "@/lib/order/cart";
import { getDishCustomization } from "@/lib/order/customizations";
import { supabase } from "@/lib/supabase/client";
import {
  CustomerReceipt,
  type ReceiptData,
} from "@/components/customer-receipt";
import { getCurrentTableSession } from "@/lib/table-session";
import {
  saveActiveOrder,
  getActiveOrder,
  clearActiveOrder,
} from "@/lib/active-order";

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const returnOrderId = searchParams.get('orderId');
  const { cartItems, setCartItems } = useCartItems();
  const router = useRouter();
  const { status, isGuest } = useAuth();
  const [customizingItem, setCustomizingItem] = useState<CartItem | null>(null);
    const [checkoutState, setCheckoutState] = useState<
    | "idle"
    | "generating_intent"
    | "tng_redirect"
    | "submitting"
    | "success"
  >("idle");
  const [checkoutError, setCheckoutError] = useState("");
  const [placedReceipt, setPlacedReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    if (returnOrderId) {
      // Poll or fetch receipt
      let active = true;
      const fetchReceipt = async () => {
        try {
          const res = await fetch(`/api/orders/${returnOrderId}`);
          if (res.ok) {
            const data = await res.json();
            if (active && data.receipt) {
              setPlacedReceipt(data.receipt);
              saveActiveOrder(data.receipt, getCurrentTableSession().tableId ?? null);
              if (data.receipt.paymentStatus === 'PAID') {
                setCartItems([]);
                setCheckoutState("success");
                router.replace('/orders'); // Clean URL
              }
            }
          }
        } catch(e) {}
      };
      
      const timer = setInterval(() => {
         if (active && !placedReceipt) fetchReceipt();
      }, 2000);
      
      fetchReceipt();
      return () => { active = false; clearInterval(timer); };
    }
  }, [returnOrderId, router, setCartItems]);

  

  useEffect(() => {
    const active = getActiveOrder(getCurrentTableSession().tableId ?? null);
    if (active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
setPlacedReceipt(active);
    }
  }, []);

  useEffect(() => {
    if (cartItems.length > 0 && checkoutState === "success") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
setCheckoutState("idle");
    }
  }, [cartItems.length, checkoutState]);
  const [feeConfig, setFeeConfig] = useState<any>(undefined);
  const [isFeeConfigLoading, setIsFeeConfigLoading] = useState(true);

  const firstStallId = cartItems.length > 0 ? cartItems[0].stallId : null;
  useEffect(() => {
    let active = true;
    async function fetchFeeConfig() {
      if (cartItems.length === 0) {
        setIsFeeConfigLoading(false);
        return;
      }
      setIsFeeConfigLoading(true);
      try {
        const res = await fetch(`/api/outlets?id=${cartItems[0].stallId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (active && data.outlets?.[0]) {
          const outlet = data.outlets[0];
          const r = Array.isArray(outlet.restaurants)
            ? outlet.restaurants[0]
            : outlet.restaurants;
          setFeeConfig({
            feePayer: r?.fee_payer ?? outlet.fee_payer ?? "CUSTOMER",
            platformFeeFixed: Number(
              r?.platform_fee_fixed ?? outlet.platform_fee_fixed ?? 0.5,
            ),
            platformFeePercent: Number(
              r?.platform_fee_percent ?? outlet.platform_fee_percent ?? 0.0,
            ),
          });
        }
      } catch {
      } finally {
        if (active) setIsFeeConfigLoading(false);
      }
    }
    fetchFeeConfig();
    return () => {
      active = false;
    };
  }, [firstStallId, cartItems]);

  const summary = useMemo(
    () => buildCartSummary(cartItems, feeConfig),
    [cartItems, feeConfig],
  );

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems((currentItems) =>
      updateCartItemQuantity(currentItems, itemId, quantity),
    );
  };

  const updateComment = (itemId: string, notes: string) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, notes } : item,
      ),
    );
  };

  const openCustomization = (item: CartItem) => {
    if (getDishCustomization(item.name)) {
      setCustomizingItem(item);
    }
  };

  const confirmCustomization = (selection: {
    options: { id: string; label: string; price: number }[];
    price: number;
  }) => {
    if (!customizingItem) return;

    setCartItems((currentItems) =>
      updateCartItemCustomization(currentItems, customizingItem.id, {
        customizationKey: selection.options
          .map((option) => option.id)
          .sort()
          .join("|"),
        customizations: selection.options.map((option) => option.label),
        price: selection.price,
      }),
    );
    setCustomizingItem(null);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setCheckoutError("");
    setCheckoutState("generating_intent");

    try {
      const session = getCurrentTableSession();
      if (!session || !session.tableId) {
        throw new Error("No active table session found");
      }

      const payloadItems = cartItems.map(item => ({
        dishId: item.dishId,
        name: item.name,
        quantity: item.quantity,
        customizations: item.customizations,
        specialInstructions: item.notes
      }));

      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: payloadItems,
          tableSessionId: session.tableId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      // Redirect to payment provider
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || "Payment service unavailable");
      setCheckoutState("idle");
    }
  };

  const submitFinalOrder = useCallback(
    async (paymentIntentId: string) => {
      setCheckoutState("submitting");
      if (!supabase) {
        setCheckoutError("Supabase is not configured.");
      setCheckoutState("idle");
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionData.session) {
        headers["Authorization"] = `Bearer ${sessionData.session.access_token}`;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers,
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
          items: cartItems.map((item) => ({
            dishId: item.dishId,
            stallId: item.stallId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
            customizations: item.customizations,
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        setCheckoutError(
          err.error || "Failed to submit order. Please check with counter.",
        );
      setCheckoutState("idle");
        return;
      }
      const result = await response.json();
      setCartItems([]);

      const receiptData: ReceiptData = {
        id: result.orderId || (result.order && result.order.id),
        venueName: cartItems[0]?.restaurantName ?? "Hawker Centre",
        createdAt: new Date().toISOString(),
        subtotal: summary.subtotal,
        serviceFee: summary.serviceFee,
        total: summary.total,
        paymentStatus: "PAID",
        refundAmount: 0,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations,
        })),
      };

      setPlacedReceipt(receiptData);
      saveActiveOrder(receiptData, getCurrentTableSession().tableId ?? null);
      setCheckoutState("success");
    },
    [cartItems, summary, setCartItems],
  );

  

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-black sm:px-6">
      <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
        <div className="md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_380px] md:gap-6 md:items-start">
          {/* Left Column: Order Items */}
          <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-black">
                Cart Items
              </h2>
              <span className="text-xs sm:text-sm text-neutral-500 font-semibold">
                {cartItems.length} items
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="rounded-2xl bg-neutral-50 p-8 text-center shadow-xs">
                <p className="text-sm font-bold text-black">
                  Your cart is empty
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Add dishes from the menu to start ordering.
                </p>
                <Link
                  href="/home"
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-black hover:bg-neutral-800 px-6 text-sm font-semibold text-white shadow-xs "
                >
                  Browse dishes
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-neutral-50 p-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-bold text-black truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          RM {item.price.toFixed(2)} each
                        </p>
                        {item.customizations?.length ? (
                          <p className="mt-1 text-xs text-neutral-600 bg-white px-2 py-0.5 rounded-full font-medium shadow-xs truncate max-w-full inline-block">
                            Customised: {item.customizations.join(" · ")}
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
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base font-bold text-black hover:bg-neutral-100 shadow-xs"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-xs sm:text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-base font-bold text-white hover:bg-neutral-800 shadow-xs"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      {getDishCustomization(item.name) ? (
                        <button
                          type="button"
                          onClick={() => openCustomization(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-neutral-100 shadow-xs"
                          aria-label={`Customize ${item.name}`}
                        >
                          <Settings2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>

                    <label className="mt-3 block">
                      <span className="sr-only">Comment for {item.name}</span>
                      <textarea
                        value={item.notes ?? ""}
                        onChange={(event) =>
                          updateComment(item.id, event.target.value)
                        }
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

              {isFeeConfigLoading ? (
                <div className="mt-4 space-y-4 ">
                  <div className="h-9 w-32 bg-white/20 rounded-lg"></div>
                  <div className="h-4 w-48 bg-white/10 rounded"></div>
                  <div className="mt-5 space-y-2.5 pt-4">
                    <div className="h-4 w-full bg-white/10 rounded"></div>
                    <div className="h-4 w-full bg-white/10 rounded"></div>
                    <div className="h-5 w-full bg-white/20 rounded pt-2"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight">
                      RM {summary.total.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-white/70">
                      {cartItems.reduce(
                        (count, item) => count + item.quantity,
                        0,
                      )}{" "}
                      items from {summary.merchantGroups.length} stalls
                    </p>
                  </div>

                  {cartItems.length > 0 && (
                    <div className="mt-5 space-y-2.5 pt-4 text-xs">
                      <div className="flex justify-between text-white/75">
                        <span>Subtotal</span>
                        <span className="font-semibold text-white">
                          RM {summary.subtotal.toFixed(2)}
                        </span>
                      </div>
                      {feeConfig?.feePayer !== "MERCHANT" && (
                        <div className="flex justify-between text-white/75">
                          <span className="flex items-center gap-1.5">
                            Platform Fee
                            <span className="text-[10px] text-white bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                              {feeConfig?.platformFeePercent > 0
                                ? `${(feeConfig.platformFeePercent * 100).toFixed(1)}%`
                                : "Flat"}
                            </span>
                          </span>
                          <span className="font-semibold text-white">
                            RM {summary.serviceFee.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-bold text-white pt-2">
                        <span>Total</span>
                        <span className="text-base">
                          RM {summary.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
              <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={
                    checkoutState === "generating_intent" ||
                    checkoutState === "submitting" ||
                    checkoutState === "success" ||
                    cartItems.length === 0 ||
                    isFeeConfigLoading
                  }
                  className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black disabled:opacity-50 shadow-xs hover:bg-neutral-100 "
                >
                  {checkoutState === "generating_intent"
                    ? "Secure Checkout..."
                    : checkoutState === "submitting"
                      ? "Processing Order..."
                      : checkoutState === "success"
                        ? "Paid!"
                        : "Pay with TNG"}
                </button>

              {checkoutError && (
                <p className="mt-3 text-center text-xs text-rose-300 bg-rose-950/60 p-2.5 rounded-xl font-medium">
                  {checkoutError}
                </p>
              )}
              {checkoutState === "success" && (
                <p className="mt-3 text-center text-xs text-emerald-300 bg-emerald-950/60 p-2.5 rounded-xl font-medium">
                  Order placed successfully!
                </p>
              )}
            </section>

            {placedReceipt && (
              <div className="mt-6 mb-8">
                <CustomerReceipt
                  simplified
                  initialData={placedReceipt}
                  onClearActive={() => {
                    clearActiveOrder();
                    setPlacedReceipt(null);
      setCheckoutState("idle");
                  }}
                />
              </div>
            )}
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
                (customizingItem.customizations ?? []).reduce(
                  (total, label) => {
                    const option = allAvailableOptions.find(
                      (candidate) => candidate.label === label,
                    );
                    return total + (option?.price ?? 0);
                  },
                  0,
                )
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
                .filter((option) =>
                  customizingItem.customizations?.includes(option.label),
                )
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
