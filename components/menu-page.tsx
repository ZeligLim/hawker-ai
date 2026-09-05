'use client';

import { CupSoda, IceCreamCone, Leaf, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { HawkerSearchBar } from '@/components/hawker-search-bar';

function MainCourseIcon() {
  return <UtensilsCrossed className="h-[18px] w-[18px]" strokeWidth={1.8} />;
}

function DrinkIcon() {
  return <CupSoda className="h-[18px] w-[18px]" strokeWidth={1.8} />;
}

function DessertIcon() {
  return <IceCreamCone className="h-[18px] w-[18px]" strokeWidth={1.8} />;
}

const categories = [
  { id: 'main-course', label: 'Main Course', icon: MainCourseIcon },
  { id: 'drinks', label: 'Drinks', icon: DrinkIcon },
  { id: 'desserts', label: 'Desserts', icon: DessertIcon },
] as const;

const menuItems = {
  'main-course': [
    { name: 'Nasi Lemak', price: 8.5, vegetarian: false },
    { name: 'Chicken Rice', price: 7, vegetarian: false },
    { name: 'Curry Mee', price: 12, vegetarian: false },
    { name: 'Char Kway Teow', price: 11.5, vegetarian: false },
    { name: 'Mee Goreng', price: 9.5, vegetarian: false },
    { name: 'Vegetarian Curry Laksa', price: 13, vegetarian: true },
  ],
  drinks: [
    { name: 'Teh Tarik', price: 3.5, vegetarian: true },
    { name: 'Bandung', price: 3, vegetarian: true },
    { name: 'Lime Juice', price: 4.5, vegetarian: true },
  ],
  desserts: [
    { name: 'Cendol', price: 5, vegetarian: true },
    { name: 'Kuih', price: 2.5, vegetarian: true },
  ],
} as const;

export function MenuPage() {
  const [searchValue, setSearchValue] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQuantity = (name: string, delta: number) => {
    setQuantities((current: Record<string, number>) => {
      const nextValue = (current[name] ?? 0) + delta;
      if (nextValue <= 0) {
        const { [name]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [name]: nextValue };
    });
  };

  const scrollToCategory = (id: (typeof categories)[number]['id']) => {
    document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="mx-auto min-h-screen max-w-[430px] px-4 pb-28 pt-5 sm:max-w-[480px] lg:max-w-[960px] lg:px-6">
        <div className="lg:rounded-[32px] lg:bg-white lg:p-5 lg:shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#1d1d1f] text-sm font-semibold text-white">
                H
              </div>
              <p className="text-sm font-medium text-[#1d1d1f]">Setia Hawker Centre · Table 12</p>
            </div>
          </header>

          <div className="sticky top-0 z-10 bg-transparent pb-2 pt-1">
            <HawkerSearchBar
              placeholder="Search the menu"
              value={searchValue}
              onChange={setSearchValue}
              buttonLabel="Search menu"
            />

            <section className="mt-2">
              <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={`Browse ${id} category`}
                    onClick={() => scrollToCategory(id)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-[0_8px_18px_rgba(15,23,42,0.02)] transition hover:bg-[#f5f5f7]"
                  >
                    <Icon />
                  </button>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-8 space-y-5">
            {categories.map(({ id, icon: Icon }) => (
              <section key={id} id={`category-${id}`} className="scroll-mt-24">
                <div className="mb-3 flex items-center justify-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f]">
                    <Icon />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(menuItems[id as keyof typeof menuItems] ?? []).map((item) => {
                    const quantity = quantities[item.name] ?? 0;

                    return (
                      <article key={item.name} className="overflow-hidden rounded-[22px] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
                        <div className="relative h-40 overflow-hidden bg-[#f3efe8]">
                          <div className="flex h-full items-center justify-center text-lg font-semibold uppercase tracking-[0.22em] text-[#5c4b1d]">
                            {item.name.split(' ')[0]}
                          </div>

                          <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                            RM {item.price.toFixed(2)}
                          </div>

                          {item.vegetarian ? (
                            <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#ecfdf5] text-[#166534] shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                              <Leaf className="h-[14px] w-[14px]" strokeWidth={1.8} />
                            </div>
                          ) : null}

                          <div className="absolute bottom-2 right-2">
                            {quantity > 0 ? (
                              <div className="flex items-center gap-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-[#1d1d1f] shadow-[0_8px_20px_rgba(15,23,42,0.18)] backdrop-blur-sm">
                                <button
                                  type="button"
                                  aria-label={`Decrease ${item.name} quantity`}
                                  onClick={() => updateQuantity(item.name, -1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f5f5f7] text-base font-semibold text-[#1d1d1f]"
                                >
                                  −
                                </button>
                                <span className="min-w-4 text-center text-[11px] font-semibold">{quantity}</span>
                                <button
                                  type="button"
                                  aria-label={`Increase ${item.name} quantity`}
                                  onClick={() => updateQuantity(item.name, 1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d1d1f] text-base font-semibold text-white"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.name, 1)}
                                className="rounded-full bg-[#1d1d1f] px-2.5 py-1.5 text-[10px] font-medium text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
                                aria-label={`Add ${item.name} to your order`}
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </section>
        </div>
      </div>

    </main>
  );
}
