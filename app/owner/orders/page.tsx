'use client';

import Link from 'next/link';
import { Check, Clock3, PackageCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Completed';

type OwnerOrder = {
  id: string;
  table: string;
  time: string;
  items: string[];
  total: number;
  status: OrderStatus;
};

const initialOrders: OwnerOrder[] = [
  { id: '#1042', table: 'Table 12', time: '2 min ago', items: ['Nasi Lemak × 2', 'Teh Tarik × 1'], total: 20.5, status: 'New' },
  { id: '#1041', table: 'Table 6', time: '8 min ago', items: ['Curry Mee × 1', 'Kopi O × 1'], total: 15, status: 'Preparing' },
  { id: '#1040', table: 'Table 3', time: '22 min ago', items: ['Chicken Rice × 2'], total: 17, status: 'Ready' },
  { id: '#1039', table: 'Takeaway', time: '41 min ago', items: ['Cendol × 1'], total: 5, status: 'Completed' },
];

const statusOrder: OrderStatus[] = ['New', 'Preparing', 'Ready', 'Completed'];
const storageKey = 'hawker-owner-orders';

function nextStatus(status: OrderStatus) {
  const index = statusOrder.indexOf(status);
  return statusOrder[Math.min(index + 1, statusOrder.length - 1)];
}

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<OwnerOrder[]>(() => {
    if (typeof window === 'undefined') return initialOrders;
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return initialOrders;
    try {
      const parsed = JSON.parse(stored) as OwnerOrder[];
      return Array.isArray(parsed) ? parsed : initialOrders;
    } catch {
      window.localStorage.removeItem(storageKey);
      return initialOrders;
    }
  });
  const [filter, setFilter] = useState<'active' | 'completed'>('active');

  const visibleOrders = useMemo(
    () => orders.filter((order) => (filter === 'active' ? order.status !== 'Completed' : order.status === 'Completed')),
    [filter, orders],
  );

  const advanceOrder = (id: string) => {
    setOrders((current) => {
      const next = current.map((order) => (order.id === id ? { ...order, status: nextStatus(order.status) } : order));
      window.localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-8 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[760px]">
        <header className="flex items-center gap-3">
          <div>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em]">Orders</h1>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-2 rounded-[18px] bg-white p-1 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          {(['active', 'completed'] as const).map((option) => (
            <button key={option} type="button" onClick={() => setFilter(option)} className={`rounded-[14px] px-4 py-3 text-sm font-semibold capitalize ${filter === option ? 'bg-[#111827] text-white' : 'text-[#6e6e73]'}`}>
              {option} orders
            </button>
          ))}
        </div>

        <section className="mt-4 space-y-3">
          {visibleOrders.length === 0 ? (
            <div className="rounded-[24px] bg-white p-8 text-center shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <PackageCheck className="mx-auto h-8 w-8 text-[#6e6e73]" />
              <p className="mt-3 text-sm font-medium">No {filter} orders</p>
            </div>
          ) : visibleOrders.map((order) => (
            <article key={order.id} className="rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{order.id}</h2>
                  <p className="mt-1 text-xs text-[#6e6e73]">{order.table} · {order.time}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.status === 'New' ? 'bg-amber-100 text-amber-800' : order.status === 'Preparing' ? 'bg-blue-100 text-blue-800' : order.status === 'Ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                  {order.status}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {order.items.map((item) => <p key={item} className="text-sm text-[#4b5563]">{item}</p>)}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#f0f0f2] pt-3">
                <span className="text-sm font-semibold">RM {order.total.toFixed(2)}</span>
                {order.status !== 'Completed' ? (
                  <button type="button" onClick={() => advanceOrder(order.id)} className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2.5 text-xs font-semibold text-white">
                    {order.status === 'Ready' ? <Check className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                    Mark {nextStatus(order.status).toLowerCase()}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
