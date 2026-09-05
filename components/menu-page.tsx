'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HawkerSearchBar } from '@/components/hawker-search-bar';

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function RiceIcon() {
  return (
    <svg {...iconProps} aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 13c2-3 5-5 8-5s6 2 8 5c-1.4 3.8-4.7 6-8 6s-6.6-2.2-8-6Z" />
      <path d="M8 13h8" />
      <path d="M9 10c.7 1.2 1.7 2 3 2s2.3-.8 3-2" />
    </svg>
  );
}

function NoodleIcon() {
  return (
    <svg {...iconProps} aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 3v12a5 5 0 0 0 10 0V3" />
      <path d="M7 7h10M7 11h10" />
      <path d="M10 3v12" />
      <path d="M14 3v12" />
    </svg>
  );
}

function DrinkIcon() {
  return (
    <svg {...iconProps} aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 4h10l-1 13a4 4 0 0 1-8 0L7 4Z" />
      <path d="M10 4V2M14 4V2" />
      <path d="M9 19h6" />
    </svg>
  );
}

function DessertIcon() {
  return (
    <svg {...iconProps} aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 12h10a3 3 0 1 1-3 3h-4a3 3 0 1 1-3-3Z" />
      <path d="M12 6v6M9.5 8.5h5" />
    </svg>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      {active ? <path d="M9 20v-6h6v6" /> : null}
    </svg>
  );
}

function MenuIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
      {active ? <path d="M7 8.5h10M7 13.5h10" /> : null}
    </svg>
  );
}

function OrdersIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M7 4h10l2 2v14H5V6l2-2Z" />
      <path d="M9 10h6M9 14h6" />
      {active ? <path d="M9 4v4h6V4" /> : null}
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 19c1.7-2.8 4-4.2 7-4.2s5.3 1.4 7 4.2" />
      {active ? <path d="M9 6.5a3 3 0 0 1 6 0" /> : null}
    </svg>
  );
}

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon, active: false },
  { href: '/menu', label: 'Menu', icon: MenuIcon, active: true },
  { href: '/orders', label: 'Orders', icon: OrdersIcon, active: false },
  { href: '/profile', label: 'Profile', icon: ProfileIcon, active: false },
];

const categories = [
  { id: 'rice', label: 'Rice', icon: RiceIcon },
  { id: 'noodles', label: 'Noodles', icon: NoodleIcon },
  { id: 'drinks', label: 'Drinks', icon: DrinkIcon },
  { id: 'desserts', label: 'Desserts', icon: DessertIcon },
] as const;

const menuItems = {
  rice: [
    { name: 'Nasi Lemak', price: 8.5, vegetarian: false },
    { name: 'Chicken Rice', price: 7, vegetarian: false },
  ],
  noodles: [
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

function LeafIcon() {
  return (
    <svg {...iconProps} aria-hidden="true" viewBox="0 0 24 24">
      <path d="M18 3c-7 0-12 5-12 12 0 2.2.7 4.3 2 6 2.1-1.3 4.2-2.6 6.2-4.4 2.5-2.2 4.8-4.9 5.8-9.6Z" />
      <path d="M7 14c2.5-1.8 4.5-4 6-7" />
    </svg>
  );
}

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
        <div className="lg:rounded-[32px] lg:border lg:border-[#e5e7eb] lg:bg-white lg:p-5 lg:shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#1d1d1f] text-sm font-semibold text-white">
                H
              </div>
              <p className="text-sm font-medium text-[#1d1d1f]">Setia Hawker Centre · Table 12</p>
            </div>
          </header>

          <HawkerSearchBar
            placeholder="Search the menu"
            value={searchValue}
            onChange={setSearchValue}
            buttonLabel="Search menu"
          />

          <section className="mt-6">
            <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={`Browse ${id} category`}
                  onClick={() => scrollToCategory(id)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#1d1d1f] shadow-[0_8px_18px_rgba(15,23,42,0.02)] transition hover:border-[#d4d9df]"
                >
                  <Icon />
                </button>
              ))}
            </div>
          </section>

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
                      <article key={item.name} className="overflow-hidden rounded-[22px] border border-[#e5e7eb] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
                        <div className="relative h-40 overflow-hidden bg-[linear-gradient(135deg,#f8e6c1_0%,#e6d4b0_100%)]">
                          <div className="flex h-full items-center justify-center text-lg font-semibold uppercase tracking-[0.22em] text-[#5c4b1d]">
                            {item.name.split(' ')[0]}
                          </div>

                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />

                          <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                            RM {item.price.toFixed(2)}
                          </div>

                          {item.vegetarian ? (
                            <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#ecfdf5] text-[#166534] shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                              <LeafIcon />
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

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] border-t border-[#e4e4e7] bg-[#f7f7f7]/95 px-2 py-2 backdrop-blur-xl sm:max-w-[480px] lg:max-w-[960px] lg:rounded-t-[22px] lg:border-x lg:border-b lg:border-[#e5e7eb] lg:bg-white/95 lg:px-4">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={label}
              href={href as any}
              className={`flex flex-col items-center justify-center gap-1 rounded-[14px] px-2 py-2 text-[11px] font-medium transition ${
                active ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className={`flex h-7 w-7 items-center justify-center ${active ? 'text-[#1d1d1f]' : 'text-[#6e6e73]'}`}>
                <Icon active={active} />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
