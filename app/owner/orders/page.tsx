'use client';

import Link from 'next/link';
import { Check, Clock3, PackageCheck, AlertCircle, RefreshCw, XCircle, ChevronRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Completed';

type TicketItem = {
  id: string;
  dishId?: string;
  name: string;
  unitPrice: number;
  quantity: number;
  customizations?: string[];
  notes?: string;
  isRefunded?: boolean;
  refundAmount?: number;
};

type OwnerOrder = {
  id: string;
  backendId: string;
  orderId: string;
  table: string;
  time: string;
  items: TicketItem[];
  stallSubtotal: number;
  merchantPayout: number;
  refundAmount: number;
  paymentStatus: string;
  status: OrderStatus;
};

const statusOrder: OrderStatus[] = ['New', 'Preparing', 'Ready', 'Completed'];
const backendStatus: Record<string, OrderStatus> = {
  waiting: 'New',
  accepted: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Completed',
  cancelled: 'Completed',
};
const nextBackendStatus: Record<OrderStatus, string> = {
  New: 'preparing',
  Preparing: 'ready',
  Ready: 'served',
  Completed: 'served',
};

function nextStatus(status: OrderStatus) {
  const index = statusOrder.indexOf(status);
  return statusOrder[Math.min(index + 1, statusOrder.length - 1)];
}

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<OwnerOrder[]>([]);
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [refundingItemId, setRefundingItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      if (!supabase) {
        if (active) setLoading(false);
        return;
      }
      const session = (await supabase.auth.getSession())?.data.session;
      if (!session?.access_token) {
        if (active) setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/owner/orders', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!response.ok) {
          if (active) {
            setError('Unable to load live orders.');
            setLoading(false);
          }
          return;
        }

        const payload = (await response.json()) as { orders?: any[] };
        if (active && Array.isArray(payload.orders)) {
          setOrders(
            payload.orders.map((mo: any) => {
              const rawItems: TicketItem[] = Array.isArray(mo.order_items)
                ? mo.order_items.map((i: any) => ({
                    id: i.id,
                    dishId: i.dish_id,
                    name: i.dish_name,
                    unitPrice: Number(i.unit_price ?? 0),
                    quantity: Number(i.quantity ?? 1),
                    customizations: Array.isArray(i.customizations) ? i.customizations : [],
                    notes: i.notes ?? '',
                    isRefunded: Boolean(i.is_refunded),
                    refundAmount: Number(i.refund_amount ?? 0),
                  }))
                : [];

              const subtotal = Number(mo.subtotal ?? 0);
              const refund = Number(mo.refund_amount ?? 0);
              const payout = Number(mo.merchant_payout_amount ?? Math.max(0, subtotal - refund));

              return {
                id: `#${(mo.order_id || mo.id).slice(0, 6).toUpperCase()}`,
                backendId: mo.id,
                orderId: mo.order_id,
                table: mo.orders?.table_session_id ? `Table Session` : 'Counter / Table',
                time: new Date(mo.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                items: rawItems,
                stallSubtotal: subtotal,
                merchantPayout: payout,
                refundAmount: refund,
                paymentStatus: mo.payment_status ?? 'PAID',
                status: backendStatus[mo.status] ?? 'New',
              };
            })
          );
        }
      } catch {
        if (active) setError('Connection error while fetching orders.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchOrders();

    // Subscribe to realtime merchant orders
    if (!supabase) return;
    const channel = supabase
      .channel('owner-kitchen-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'merchant_orders' },
        () => {
          void fetchOrders();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase?.removeChannel(channel);
    };
  }, [refreshTrigger]);

  const visibleOrders = useMemo(
    () => orders.filter((order) => (filter === 'active' ? order.status !== 'Completed' : order.status === 'Completed')),
    [filter, orders]
  );

  const advanceOrder = async (backendId: string, currentStatus: OrderStatus) => {
    if (!supabase) return;
    const nextSt = nextStatus(currentStatus);
    const backendSt = nextBackendStatus[currentStatus];

    setOrders((current) =>
      current.map((order) => (order.backendId === backendId ? { ...order, status: nextSt } : order))
    );

    const token = (await supabase.auth.getSession())?.data.session?.access_token;
    if (!token) return;

    const response = await fetch(`/api/owner/orders/${backendId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: backendSt }),
    });

    if (!response.ok) {
      setError('Order status could not be saved. Please try again.');
      setRefreshTrigger((c) => c + 1);
    }
  };

  // 1-Tap Item Sold Out & Refund Flow
  const handleItemSoldOut = async (order: OwnerOrder, item: TicketItem) => {
    if (!supabase) return;
    const confirmMessage = `Mark "${item.name}" as Sold Out and issue an automatic refund of RM ${(item.unitPrice * item.quantity).toFixed(2)} to the customer?`;
    if (!window.confirm(confirmMessage)) return;

    setRefundingItemId(item.id);
    setError('');

    try {
      const token = (await supabase.auth.getSession())?.data.session?.access_token;
      if (!token) throw new Error('Not authenticated.');

      const response = await fetch(`/api/owner/orders/${order.backendId}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_ids: [item.id],
          reason: 'Item Sold Out',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Refund failed.');
      }

      setActionSuccess(
        `✓ "${item.name}" marked SOLD OUT. RM ${data.refundAmount.toFixed(2)} refunded to customer and dish turned unavailable.`
      );
      setTimeout(() => setActionSuccess(null), 6000);

      setRefreshTrigger((c) => c + 1);
    } catch (err: any) {
      setError(err.message || 'Failed to refund sold-out item.');
    } finally {
      setRefundingItemId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-6 text-[#1d1d1f] sm:px-6">
      <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071e3] truncate block">
              Live Kitchen Ticket Stream
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] truncate">
              Kitchen Tickets
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setRefreshTrigger((c) => c + 1)}
            title="Refresh tickets"
            aria-label="Refresh tickets"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-black/10 text-[#1d1d1f] hover:bg-black/5 shadow-xs transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : 'text-[#6e6e73]'}`} />
          </button>
        </header>

        {/* Filter Tabs */}
        <div className="mt-5 grid grid-cols-2 rounded-[20px] bg-white p-1 shadow-[0_12px_26px_rgba(15,23,42,0.04)] border border-black/[0.04]">
          {(['active', 'completed'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`inline-flex h-9 items-center justify-center rounded-[16px] px-4 text-xs font-bold capitalize transition-all ${
                filter === option ? 'bg-[#111827] text-white shadow-xs' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              {option} tickets
            </button>
          ))}
        </div>

        {/* Notification alerts */}
        {actionSuccess ? (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {/* Tickets Section */}
        <section className="mt-6">
          {loading ? (
            <div className="rounded-[24px] bg-white p-8 text-center text-xs text-[#6e6e73] shadow-sm">
              Loading kitchen tickets…
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="rounded-[24px] bg-white p-10 text-center shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <PackageCheck className="mx-auto h-8 w-8 text-[#86868b]" />
              <p className="mt-3 text-sm font-medium text-[#1d1d1f]">No {filter} tickets</p>
              <p className="text-xs text-[#86868b] mt-1">Orders dispatched by diners will appear here in real time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleOrders.map((order) => {
                const hasRefund = order.refundAmount > 0;
                return (
                  <article
                    key={order.backendId}
                    className="flex flex-col justify-between rounded-[26px] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.04)] border border-black/[0.04]"
                  >
                  {/* Ticket Header: Table & Time */}
                  <div className="flex items-start justify-between gap-3 border-b border-black/[0.05] pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold tracking-tight text-[#1d1d1f]">
                          {order.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#111827] text-white text-[11px] font-semibold">
                          {order.table}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#6e6e73]">
                        Received at {order.time}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          order.status === 'New'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'Preparing'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Line Items with 1-Tap Sold Out Refund */}
                  <div className="mt-4 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">
                      Kitchen Line Items
                    </p>

                    <div className="divide-y divide-black/[0.04]">
                      {order.items.map((item) => {
                        const lineTotal = item.unitPrice * item.quantity;
                        const isRefundingThis = refundingItemId === item.id;

                        return (
                          <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold text-[#1d1d1f]">
                                  {item.quantity}×
                                </span>
                                <span
                                  className={`text-sm font-semibold ${
                                    item.isRefunded ? 'line-through text-[#86868b]' : 'text-[#1d1d1f]'
                                  }`}
                                >
                                  {item.name}
                                </span>
                              </div>

                              {item.customizations && item.customizations.length > 0 ? (
                                <p className="text-xs text-[#6e6e73] ml-5 mt-0.5">
                                  {item.customizations.join(', ')}
                                </p>
                              ) : null}

                              {item.notes ? (
                                <p className="text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md inline-block ml-5 mt-1">
                                  Note: {item.notes}
                                </p>
                              ) : null}

                              {item.isRefunded ? (
                                <p className="text-[11px] font-semibold text-rose-600 ml-5 mt-1">
                                  [SOLD OUT - REFUNDED -RM {lineTotal.toFixed(2)}]
                                </p>
                              ) : null}
                            </div>

                            {/* 1-Tap Out-of-Stock Sold Out Refund Button */}
                            <div className="text-right shrink-0 flex items-center gap-2">
                              <span
                                className={`text-xs font-semibold ${
                                  item.isRefunded ? 'line-through text-[#86868b]' : 'text-[#1d1d1f]'
                                }`}
                              >
                                RM {lineTotal.toFixed(2)}
                              </span>

                              {!item.isRefunded && order.status !== 'Completed' ? (
                                <button
                                  type="button"
                                  onClick={() => void handleItemSoldOut(order, item)}
                                  disabled={isRefundingThis}
                                  title="Mark item sold out & trigger customer refund"
                                  aria-label="Mark item sold out & trigger customer refund"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50 shrink-0 shadow-xs"
                                >
                                  {isRefundingThis ? (
                                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hawker Earnings Subtotal (Customer Platform Fee OMITTED) */}
                  <div className="mt-4 pt-3.5 border-t border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#86868b] truncate">
                        Stall Payout (0% Commission)
                      </p>
                      <p className="text-sm font-bold text-[#1d1d1f] truncate">
                        STALL TOTAL: RM {order.merchantPayout.toFixed(2)}{' '}
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          [PAID]
                        </span>
                      </p>
                      {hasRefund ? (
                        <p className="text-[11px] text-rose-600 truncate">
                          (Original: RM {order.stallSubtotal.toFixed(2)} &bull; Refunded: -RM {order.refundAmount.toFixed(2)})
                        </p>
                      ) : null}
                    </div>

                    {order.status !== 'Completed' ? (
                      <button
                        type="button"
                        onClick={() => advanceOrder(order.backendId, order.status)}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#111827] px-4 text-xs font-semibold text-white shadow-xs hover:bg-black transition-colors shrink-0"
                      >
                        {order.status === 'Ready' ? <Check className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                        <span>Mark {nextStatus(order.status)}</span>
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      </div>
    </main>
  );
}
