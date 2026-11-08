"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { CustomizationCard } from "@/components/customization-card";
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
import { PageLoader } from "@/components/page-loader";
import { connectTableFromLink } from "@/lib/customer-table-link";

export default function OrdersPage(
 { centreSlug, tableId }: { centreSlug: string; tableId: string },
) {
 const searchParams = useSearchParams();
 const returnOrderId = searchParams.get('orderId');
 const { cartItems, setCartItems } = useCartItems();
 const router = useRouter();
 const [tableLinkStatus, setTableLinkStatus] = useState<'checking' | 'ready' | 'invalid'>(
 tableId ? 'checking' : 'invalid',
 );
 const [tableLinkError, setTableLinkError] = useState(
 tableId ? '' : 'Open orders using the table QR code or the link from its menu.',
 );
 const [customizingItem, setCustomizingItem] = useState<CartItem | null>(null);
 const [checkoutState, setCheckoutState] = useState<
    | "idle"
    | "submitting"
    | "success"
  >("idle");
 const [checkoutError, setCheckoutError] = useState("");
 const [placedReceipt, setPlacedReceipt] = useState<ReceiptData | null>(null);

 useEffect(() => {
 let active = true;
 if (!tableId) return;
 void connectTableFromLink(tableId, centreSlug)
 .then(() => {
 if (!active) return;
 const activeOrder = getActiveOrder(tableId);
 if (activeOrder) setPlacedReceipt(activeOrder);
 setTableLinkStatus('ready');
 })
 .catch((error: unknown) => {
 if (!active) return;
 setTableLinkError(error instanceof Error ? error.message : 'Could not verify this table link.');
 setTableLinkStatus('invalid');
 });
 return () => {
 active = false;
 };
 }, [centreSlug, tableId]);

 useEffect(() => {
 if (returnOrderId && tableLinkStatus === 'ready') {
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
 router.replace(`/${centreSlug}/orders?table_id=${encodeURIComponent(tableId)}`);
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
  }, [returnOrderId, router, setCartItems, placedReceipt, tableLinkStatus, centreSlug, tableId]);

 useEffect(() => {
 if (cartItems.length > 0 && checkoutState === "success") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
setCheckoutState("idle");
    }
  }, [cartItems.length, checkoutState]);
 const summary = useMemo(
    () => buildCartSummary(cartItems, { platformFeeFixed: 0, platformFeePercent: 0 }),
    [cartItems],
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
 setCheckoutState("submitting");

 try {
 const session = getCurrentTableSession();
 if (!session.tableId || !session.sessionId || session.tableId !== tableId || session.centreSlug?.toLowerCase() !== centreSlug.toLowerCase()) {
 throw new Error("No active table session found");
      }

 await submitFinalOrder();
    } catch (err: any) {
 console.error(err);
 setCheckoutError(err.message || "Failed to create order");
 setCheckoutState("idle");
    }
  };

 const submitFinalOrder = useCallback(
 async () => {
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
 tableSessionId: getCurrentTableSession().sessionId ?? null,
 subtotal: summary.subtotal,
 serviceFee: summary.serviceFee,
 total: summary.total,
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
 paymentStatus: 'PENDING',
 status: "PENDING",
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

  if (tableLinkStatus === 'checking') {
  return <PageLoader text="Checking table session" />;
  }
  if (tableLinkStatus === 'invalid') {
  return (
  <main className="flex min-h-[70vh] items-center justify-center px-4 text-center">
  <div className="max-w-sm rounded-3xl bg-white p-6">
  <h1 className="text-lg font-bold text-black">Table link unavailable</h1>
  <p className="mt-2 text-sm text-neutral-500">{tableLinkError}</p>
  </div>
  </main>
  );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-black sm:px-6">
      <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
        <div className="md:grid md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_380px] md:gap-6 md:items-start">
          {/* Left Column: Order Items */}
          <section className="rounded-3xl bg-white p-5 sm:p-6 ">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-black">
                Cart Items
              </h2>
              <span className="text-xs sm:text-sm text-neutral-500 font-semibold">
                {cartItems.length} items
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="rounded-2xl bg-neutral-50 p-8 text-center ">
                <p className="text-sm font-bold text-black">
                  Your cart is empty
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Add dishes from the menu to start ordering.
                </p>
                <Link
 href={`/${centreSlug}/menu?table_id=${encodeURIComponent(tableId)}`}
 className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-black hover:bg-neutral-800 px-6 text-sm font-semibold text-white "
                >
                  Back to menu
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
 key={item.id}
 className="rounded-2xl bg-neutral-50 p-4 "
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
                          <p className="mt-1 text-xs text-neutral-600 bg-white px-2 py-0.5 rounded-full font-medium truncate max-w-full inline-block">
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
 className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base font-bold text-black hover:bg-neutral-100 "
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
 className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-base font-bold text-white hover:bg-neutral-800 "
 aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      {getDishCustomization(item.name) ? (
                        <button
 type="button"
 onClick={() => openCustomization(item)}
 className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-neutral-100 "
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
 className="w-full resize-none rounded-xl bg-white px-3 py-2 text-xs text-black placeholder:text-neutral-400 "
                      />
                    </label>
                  </div>
                ))}

                <div className="pt-2">
                  <Link
 href={`/${centreSlug}/menu?table_id=${encodeURIComponent(tableId)}`}
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
            <section className="rounded-3xl bg-black p-5 sm:p-6 text-white ">
              <div className="text-xs font-bold text-white/70">
                <span>Order summary</span>
              </div>

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
                      <div className="flex justify-between text-sm font-bold text-white pt-2">
                        <span>Total</span>
                        <span className="text-base">
                          RM {summary.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="mt-3 text-center text-xs text-white/70">
                    No online payment required. Pay at the counter.
                  </p>
                </>
              <button
 type="button"
 onClick={handleCheckout}
 disabled={
 checkoutState === "submitting" ||
 checkoutState === "success" ||
 cartItems.length === 0
                  }
 className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black disabled:opacity-50 hover:bg-neutral-100 "
                >
                  {checkoutState === "submitting"
                      ? "Processing Order..."
                      : checkoutState === "success"
                        ? "Order placed"
                        : "Place order"}
                </button>

              {checkoutError && (
                <p className="mt-3 text-center text-xs text-rose-300 bg-rose-950/60 p-2.5 rounded-xl font-medium">
                  {checkoutError}
                </p>
              )}
              {checkoutState === "success" && (
                <p className="mt-3 text-center text-xs text-emerald-300 bg-emerald-950/60 p-2.5 rounded-xl font-medium">
                  Order placed successfully. Please pay at the counter.
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
