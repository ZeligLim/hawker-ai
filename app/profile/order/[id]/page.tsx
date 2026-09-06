'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type OrderRecord = {
  id: string;
  dish: string;
  place: string;
  price: number;
  date: string;
  category: 'Main course' | 'Drinks' | 'Desserts';
};

const storageKey = 'hawker-profile';

function formatOrderDate(value: string | null | undefined) {
  if (!value) return 'Today';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Today';

  return new Intl.DateTimeFormat('en-SG', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function deriveCategory(label: string): OrderRecord['category'] {
  if (/tea|drink|juice|milk/i.test(label)) return 'Drinks';
  if (/cendol|dessert|sweet|cake|ice/i.test(label)) return 'Desserts';
  return 'Main course';
}

function mapOrderPayload(payload: any, targetId: string): OrderRecord | null {
  const orders = Array.isArray(payload?.orders) ? payload.orders : [];
  const direct = orders.find((entry: any) => String(entry?.id ?? '').toLowerCase() === targetId.toLowerCase());
  if (!direct) return null;

  const orderItems = Array.isArray(direct.merchant_orders)
    ? direct.merchant_orders.flatMap((merchant: any) => (Array.isArray(merchant.order_items) ? merchant.order_items : []))
    : [];

  const firstItem = orderItems[0];
  const label = firstItem?.dish_name ?? 'Hawker order';

  return {
    id: String(direct.id),
    dish: label,
    place: Array.isArray(direct.merchant_orders) && direct.merchant_orders.length > 0 ? direct.merchant_orders[0]?.food_outlet_id ?? 'Hawker Centre' : 'Hawker Centre',
    price: Number(direct.total ?? 0),
    date: formatOrderDate(direct.created_at),
    category: deriveCategory(label),
  };
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const targetId = decodeURIComponent((params.id ?? '').trim());

    const fallbackLocalOrder = () => {
      if (typeof window === 'undefined') return null;

      const savedRaw = window.localStorage.getItem(storageKey);
      if (!savedRaw) return null;

      try {
        const saved = JSON.parse(savedRaw) as { orders?: OrderRecord[] };
        return (saved.orders ?? []).find((entry) => entry.id === targetId) ?? null;
      } catch {
        return null;
      }
    };

    const loadOrder = async () => {
      setIsLoading(true);

      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.access_token) {
          const response = await fetch('/api/orders', {
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          });

          if (response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { orders?: unknown[] };
            const nextOrder = mapOrderPayload(payload, targetId);
            if (nextOrder) {
              setOrder(nextOrder);
              setIsLoading(false);
              return;
            }
          }
        }
      }

      const fallbackOrder = fallbackLocalOrder();
      setOrder(fallbackOrder);
      setIsLoading(false);
    };

    void loadOrder();
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
        <div className="mx-auto max-w-[430px]">
          <div className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-[#6e6e73]">Loading your order…</p>
          </div>
        </div>
      </main>
    );
  }

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
