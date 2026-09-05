'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

type OrderRecord = {
  dish: string;
  place: string;
  price: number;
  date: string;
  category: 'Main course' | 'Drinks' | 'Desserts';
};

const storageKey = 'hawker-profile';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();

  const order = useMemo<OrderRecord | null>(() => {
    if (typeof window === 'undefined') return null;

    const savedRaw = window.localStorage.getItem(storageKey);
    if (!savedRaw) return null;

    try {
      const saved = JSON.parse(savedRaw) as { orders?: OrderRecord[] };
      const targetId = (params.id ?? '').trim();
      return (saved.orders ?? []).find((entry) => `${entry.place}-${entry.date}-${entry.dish}` === decodeURIComponent(targetId)) ?? null;
    } catch {
      return null;
    }
  }, [params.id]);

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
        <div className="mx-auto max-w-[430px]">
          <div className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-[#6e6e73]">Order not found.</p>
            <Link href="/profile" className="mt-4 inline-flex rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">
              Back to profile
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px]">
        <div className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <Link href="/profile" className="text-sm font-medium text-[#3c3c43] underline-offset-4 hover:underline">
            Back
          </Link>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em]">Order details</h1>

          <div className="mt-5 rounded-[22px] bg-[#111827] p-4 text-white">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">Placed</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{order.date}</p>
            <p className="mt-1 text-sm text-white/75">Total RM {order.price.toFixed(2)}</p>
          </div>

          <div className="mt-5 space-y-3 rounded-[20px] bg-[#f5f5f7] p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#6e6e73]">Dish</span>
              <span className="font-medium text-[#1d1d1f]">{order.dish}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#6e6e73]">Stall</span>
              <span className="font-medium text-[#1d1d1f]">{order.place}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#6e6e73]">Category</span>
              <span className="font-medium text-[#1d1d1f]">{order.category}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#6e6e73]">Amount</span>
              <span className="font-semibold text-[#1d1d1f]">RM {order.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
