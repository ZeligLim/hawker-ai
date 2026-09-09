'use client';

import Link from 'next/link';
import {
  ClipboardList,
  UtensilsCrossed,
  Store,
  RefreshCw,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Completed';

const backendStatusMap: Record<string, OrderStatus> = {
  waiting: 'New',
  accepted: 'New',
  preparing: 'Preparing',
  ready: 'Ready',
  served: 'Completed',
  cancelled: 'Completed',
};

type LiveOrder = {
  id: string;
  order_id: string;
  food_outlet_id: string;
  status: string;
  subtotal: number;
  merchant_payout_amount: number;
  payment_status: string;
  refund_amount: number;
  created_at: string;
  orders?: {
    table_session_id?: string;
  };
  order_items?: Array<{
    id: string;
    dish_name: string;
    quantity: number;
    unit_price: number;
  }>;
};

type LiveDish = {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  is_vegetarian: boolean;
  spice_level: number;
};

export default function StallOverviewPage() {
  const { profile, roles } = useAuth();
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [dishes, setDishes] = useState<LiveDish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const stallName = roles.booths?.[0]?.name || 'Stall';
  const venueName = roles.shops?.[0]?.name;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (!supabase) return;
      const session = (await supabase.auth.getSession())?.data?.session;
      if (!session?.access_token) return;
      const token = session.access_token;
      const headers = { Authorization: `Bearer ${token}` };

      const [ordersRes, dishesRes] = await Promise.all([
        fetch('/api/owner/orders', { headers }),
        fetch('/api/owner/dishes', { headers }),
      ]);

      if (ordersRes.ok) {
        const orderData = await ordersRes.json();
        if (Array.isArray(orderData.orders)) setOrders(orderData.orders);
      }
      if (dishesRes.ok) {
        const dishData = await dishesRes.json();
        if (Array.isArray(dishData.dishes)) setDishes(dishData.dishes);
      }
      setError('');
    } catch {
      setError('Failed to sync stall data with the database.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function fetchData() {
      if (!supabase) {
        if (active) setIsLoading(false);
        return;
      }
      try {
        const session = (await supabase.auth.getSession())?.data?.session;
        if (!session?.access_token) {
          if (active) {
            setError('Please sign in to access stall operations.');
            setIsLoading(false);
          }
          return;
        }
        const token = session.access_token;
        const headers = { Authorization: `Bearer ${token}` };

        const [ordersRes, dishesRes] = await Promise.all([
          fetch('/api/owner/orders', { headers }),
          fetch('/api/owner/dishes', { headers }),
        ]);

        if (ordersRes.ok && active) {
          const orderData = await ordersRes.json();
          if (Array.isArray(orderData.orders)) {
            setOrders(orderData.orders);
          }
        }

        if (dishesRes.ok && active) {
          const dishData = await dishesRes.json();
          if (Array.isArray(dishData.dishes)) {
            setDishes(dishData.dishes);
          }
        }
        if (active) setError('');
      } catch {
        if (active) setError('Failed to sync stall data with the database.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void fetchData();

    // Subscribe to realtime orders for this stall
    if (!supabase) return;
    const channel = supabase
      .channel('stall-overview-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'merchant_orders' }, () => {
        void fetchData();
      })
      .subscribe();

    return () => {
      active = false;
      if (supabase) void supabase.removeChannel(channel);
    };
  }, []);

  // Derived database statistics
  const {
    todayOrdersCount,
    todaySales,
    totalSales,
    activeOrdersCount,
    readyOrdersCount,
    unavailableDishesCount,
    recentOrders,
  } = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let tSales = 0;
    let totSales = 0;
    let tCount = 0;
    let activeCount = 0;
    let readyCount = 0;

    for (const order of orders) {
      const createdAt = new Date(order.created_at);
      const payout = Number(order.merchant_payout_amount ?? order.subtotal ?? 0);
      totSales += payout;

      if (createdAt >= todayStart) {
        tCount++;
        tSales += payout;
      }

      const status = backendStatusMap[order.status] ?? 'New';
      if (status === 'New' || status === 'Preparing') {
        activeCount++;
      } else if (status === 'Ready') {
        readyCount++;
      }
    }

    const unavailDishes = dishes.filter((d) => !d.is_available).length;

    // Sort recent orders descending by date
    const sorted = [...orders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return {
      todayOrdersCount: tCount,
      todaySales: tSales,
      totalSales: totSales,
      activeOrdersCount: activeCount,
      readyOrdersCount: readyCount,
      unavailableDishesCount: unavailDishes,
      recentOrders: sorted,
    };
  }, [orders, dishes]);

  const stats = [
    {
      label: "Today's Orders",
      value: String(todayOrdersCount),
      detail:
        todayOrdersCount > 0
          ? `${activeOrdersCount} in kitchen · ${readyOrdersCount} ready`
          : orders.length > 0
          ? `All-time orders: ${orders.length}`
          : 'Waiting for table orders',
    },
    {
      label: "Today's Sales",
      value: `RM ${todaySales.toFixed(2)}`,
      detail:
        todayOrdersCount > 0
          ? `Avg RM ${(todaySales / todayOrdersCount).toFixed(2)} / order`
          : totalSales > 0
          ? `All-time sales: RM ${totalSales.toFixed(2)}`
          : 'Zero sales recorded today',
    },
    {
      label: 'Menu Dishes',
      value: String(dishes.length),
      detail:
        dishes.length === 0
          ? 'No dishes added yet'
          : unavailableDishesCount > 0
          ? `${unavailableDishesCount} unavailable · ${dishes.length - unavailableDishesCount} active`
          : 'All dishes active & open for order',
    },
  ];

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 sm:px-6 text-[#1d1d1f]">
      <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
        {/* Stall Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 mb-1.5">
              <Store className="h-3 w-3" />
              <span>{stallName}{venueName ? ` • ${venueName}` : ''}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
              Stall Overview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#6e6e73]">
              Live kitchen metrics, ticket queue, and menu status linked directly to your database.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleManualRefresh()}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#1d1d1f] shadow-xs border border-black/5 hover:bg-black/[0.03] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : 'text-[#6e6e73]'}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Database Metric Cards */}
        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[24px] bg-white p-4 sm:p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)] border border-black/[0.04]"
            >
              <p className="text-xs sm:text-sm font-medium text-[#6e6e73]">{stat.label}</p>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.05em] text-[#1d1d1f]">
                {isLoading ? (
                  <span className="inline-block h-8 w-20 animate-pulse rounded bg-black/5" />
                ) : (
                  stat.value
                )}
              </p>
              <p className="mt-1 text-[11px] sm:text-xs text-[#6e6e73]">
                {isLoading ? 'Loading metrics...' : stat.detail}
              </p>
            </div>
          ))}
        </section>

        {/* Action Center & Order Activity */}
        <section className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Quick Management Hub */}
          <div className="rounded-[26px] bg-white p-5 sm:p-6 shadow-[0_12px_26px_rgba(15,23,42,0.04)] border border-black/[0.04] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                    Kitchen Station
                  </h2>
                  <p className="mt-0.5 text-xs sm:text-sm text-[#6e6e73]">
                    Fulfill incoming table tickets and adjust real-time dish availability.
                  </p>
                </div>
                <div className="h-9 w-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <ChefHat className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/owner/orders"
                  className="group rounded-[20px] bg-[#111827] p-4 text-white hover:bg-black transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <ClipboardList className="h-5 w-5 text-amber-400" />
                      <ArrowRight className="h-4 w-4 text-white/50 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="mt-3 text-sm font-semibold">Kitchen Display (KDS)</p>
                    <p className="mt-0.5 text-xs text-white/70">
                      {activeOrdersCount > 0
                        ? `${activeOrdersCount} order${activeOrdersCount === 1 ? '' : 's'} need attention`
                        : 'No orders waiting'}
                    </p>
                  </div>
                  {activeOrdersCount > 0 && (
                    <span className="mt-3 inline-flex self-start items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Live Queue
                    </span>
                  )}
                </Link>

                <Link
                  href="/owner/menu"
                  className="group rounded-[20px] bg-[#f5f5f7] p-4 text-[#1d1d1f] hover:bg-[#ebebeb] transition-all flex flex-col justify-between border border-black/5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <UtensilsCrossed className="h-5 w-5 text-[#1d1d1f]" />
                      <ArrowRight className="h-4 w-4 text-black/40 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="mt-3 text-sm font-semibold">Stall Menu</p>
                    <p className="mt-0.5 text-xs text-[#6e6e73]">
                      {dishes.length > 0 ? `${dishes.length} dishes in menu` : 'Add first dish'}
                    </p>
                  </div>
                  <span className="mt-3 inline-flex self-start items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#1d1d1f] shadow-xs">
                    Edit & toggle dishes
                  </span>
                </Link>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-between text-xs text-[#6e6e73]">
              <span>Database Connection</span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live PostgreSQL Stream
              </span>
            </div>
          </div>

          {/* Live Database Order Activity */}
          <div className="rounded-[26px] bg-white p-5 sm:p-6 shadow-[0_12px_26px_rgba(15,23,42,0.04)] border border-black/[0.04]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
                Recent Orders
              </h2>
              <Link
                href="/owner/orders"
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="mt-4 space-y-2.5">
              {isLoading ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 w-full animate-pulse rounded-[16px] bg-[#f5f5f7]" />
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const status = backendStatusMap[order.status] ?? 'New';
                  const orderNum = (order.order_id || order.id).slice(0, 6).toUpperCase();
                  const timeStr = new Date(order.created_at).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  const payout = Number(order.merchant_payout_amount ?? order.subtotal ?? 0);
                  const firstItem = order.order_items?.[0]?.dish_name;
                  const totalItems = order.order_items?.reduce((sum, item) => sum + (item.quantity || 1), 0) ?? 1;

                  const statusBadgeColor =
                    status === 'New'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : status === 'Preparing'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : status === 'Ready'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200';

                  const dotColor =
                    status === 'New'
                      ? 'bg-blue-500'
                      : status === 'Preparing'
                      ? 'bg-amber-400'
                      : status === 'Ready'
                      ? 'bg-emerald-500'
                      : 'bg-slate-300';

                  return (
                    <Link
                      key={order.id}
                      href="/owner/orders"
                      className="flex items-center justify-between gap-3 rounded-[16px] bg-[#f5f5f7] p-3 hover:bg-[#ededf0] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1d1d1f]">#{orderNum}</span>
                          <span className="text-[11px] text-[#86868b]">• {timeStr}</span>
                          <span className="text-[11px] font-semibold text-[#1d1d1f] ml-auto sm:ml-0">
                            RM {payout.toFixed(2)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-[#6e6e73]">
                          {firstItem ? `${firstItem}${totalItems > 1 ? ` +${totalItems - 1} more` : ''}` : `${totalItems} items`}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${statusBadgeColor} shrink-0`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                        {status}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-[18px] border border-dashed border-black/10 p-6 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-[#86868b]">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-[#1d1d1f]">No orders yet</p>
                  <p className="mt-0.5 text-[11px] text-[#86868b]">
                    Diners scanning table QR codes will generate live tickets here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
