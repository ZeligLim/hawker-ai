'use client';

import Link from 'next/link';
import { fallbackDishes } from '@/lib/search/fallback-data';

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

function SearchIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16L21 21" />
    </svg>
  );
}

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
    { name: 'Nasi Lemak', price: 8.5, vegetarian: false, tag: 'Popular' },
    { name: 'Chicken Rice', price: 7, vegetarian: false, tag: 'Classic' },
  ],
  noodles: [
    { name: 'Curry Mee', price: 12, vegetarian: false, tag: 'Spicy' },
    { name: 'Char Kway Teow', price: 11.5, vegetarian: false, tag: 'Wok-fried' },
    { name: 'Mee Goreng', price: 9.5, vegetarian: false, tag: 'Mamak' },
    { name: 'Vegetarian Curry Laksa', price: 13, vegetarian: true, tag: 'Vegetarian' },
  ],
  drinks: [
    { name: 'Teh Tarik', price: 3.5, vegetarian: true, tag: 'Best seller' },
    { name: 'Bandung', price: 3, vegetarian: true, tag: 'Sweet' },
    { name: 'Lime Juice', price: 4.5, vegetarian: true, tag: 'Fresh' },
  ],
  desserts: [
    { name: 'Cendol', price: 5, vegetarian: true, tag: 'Cool' },
    { name: 'Kuih', price: 2.5, vegetarian: true, tag: 'Snack' },
  ],
};

export function MenuPage() {
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

          <div className="mt-6 flex items-center gap-3 rounded-[28px] border border-[#e5e7eb] bg-white px-3 py-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.03)]">
            <span className="flex h-8 w-8 items-center justify-center text-[#1d1d1f]">
              <SearchIcon />
            </span>
            <input
              aria-label="Search the hawker menu"
              placeholder="Search the menu"
              className="h-10 flex-1 border-0 bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#6e6e73] focus:outline-none"
            />
            <button
              type="button"
              aria-label="Search menu"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d1d1f] text-white"
            >
              <SearchIcon />
            </button>
          </div>

          <section className="mt-6">
            <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={`Browse ${id} category`}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#f5f5f7] text-[#1d1d1f] shadow-[0_8px_18px_rgba(15,23,42,0.02)] transition hover:border-[#d4d9df]"
                >
                  <Icon />
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8 space-y-5">
            {categories.map(({ id, label, icon: Icon }) => (
              <div key={id}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f]">
                    <Icon />
                  </div>
                </div>

                <div className="space-y-3">
                  {(menuItems[id as keyof typeof menuItems] ?? []).map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3 rounded-[18px] border border-[#e5e7eb] bg-[#fafafa] p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#f5f5f7] text-[#1d1d1f]">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">{item.name.slice(0, 2)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1d1d1f]">{item.name}</p>
                          <div className="mt-1 flex items-center gap-2">
                            {item.vegetarian ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-medium text-[#065f46]">
                                <svg {...iconProps} aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
                                  <path d="M18 3c-7 0-12 5-12 12 0 2.2.7 4.3 2 6 2.1-1.3 4.2-2.6 6.2-4.4 2.5-2.2 4.8-4.9 5.8-9.6Z" />
                                  <path d="M7 14c2.5-1.8 4.5-4 6-7" />
                                </svg>
                                Veg
                              </span>
                            ) : null}
                            <span className="rounded-full bg-[#f5f3ff] px-2 py-0.5 text-[10px] font-medium text-[#6d28d9]">{item.tag}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#1d1d1f]">RM {item.price.toFixed(2)}</span>
                        <button
                          type="button"
                          aria-label={`Add ${item.name} to order`}
                          className="rounded-full bg-[#1d1d1f] px-2.5 py-1.5 text-[10px] font-medium text-white"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
