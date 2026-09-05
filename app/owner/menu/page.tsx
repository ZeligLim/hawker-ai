'use client';

import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';

type OwnerDish = {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  imageUrl?: string;
  customizations?: {
    large: { enabled: boolean; price: number };
    egg: { enabled: boolean; price: number };
    spice: { enabled: boolean; levels: number };
  };
};

const initialDishes: OwnerDish[] = [
  { id: 'nasi-lemak', name: 'Nasi Lemak', category: 'Main course', price: 8.5, available: true },
  { id: 'curry-mee', name: 'Curry Mee', category: 'Main course', price: 12, available: true },
  { id: 'chicken-rice', name: 'Chicken Rice', category: 'Main course', price: 8.5, available: false },
  { id: 'teh-tarik', name: 'Teh Tarik', category: 'Drinks', price: 3.5, available: true },
  { id: 'cendol', name: 'Cendol', category: 'Desserts', price: 5, available: true },
];

const storageKey = 'hawker-owner-menu';

function loadDishes() {
  if (typeof window === 'undefined') return initialDishes;
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return initialDishes;
  try {
    const parsed = JSON.parse(stored) as OwnerDish[];
    return Array.isArray(parsed) ? parsed : initialDishes;
  } catch {
    window.localStorage.removeItem(storageKey);
    return initialDishes;
  }
}

export default function OwnerMenuPage() {
  const [dishes, setDishes] = useState<OwnerDish[]>(loadDishes);

  const toggleAvailability = (id: string) => {
    const next = dishes.map((dish) => (dish.id === id ? { ...dish, available: !dish.available } : dish));
    setDishes(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-8 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[760px]">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/owner" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Back to owner dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">Owner app</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em]">Menu</h1>
            </div>
          </div>
          <Link href={'/owner/menu/new' as any} className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-xs font-semibold text-white">
            <Plus className="h-4 w-4" /> Add dish
          </Link>
        </header>

        <p className="mt-4 text-sm text-[#6e6e73]">Turn availability off when a dish is sold out. Customers will see the change immediately.</p>

        <section className="mt-5 space-y-3">
          {dishes.map((dish) => (
            <article key={dish.id} className="flex items-center justify-between gap-4 rounded-[22px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <Link href={`/owner/menu/${dish.id}` as any} className="flex min-w-0 flex-1 items-center gap-3">
                {dish.imageUrl ? <img src={dish.imageUrl} alt="" className="h-12 w-12 rounded-[14px] object-cover" /> : null}
                <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{dish.name}</h2>
                <p className="mt-1 text-xs text-[#6e6e73]">{dish.category} · RM {dish.price.toFixed(2)}</p>
                </div>
              </Link>
              <button type="button" role="switch" aria-checked={dish.available} onClick={() => toggleAvailability(dish.id)} className={`relative h-7 w-12 shrink-0 rounded-full transition ${dish.available ? 'bg-emerald-500' : 'bg-[#d1d5db]'}`} aria-label={`${dish.name} ${dish.available ? 'available' : 'unavailable'}`}>
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${dish.available ? 'left-6' : 'left-1'}`} />
              </button>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
