'use client';

import Link from 'next/link';
import { fallbackDishes } from '@/lib/search/fallback-data';

const quickFilters = ['Vegetarian', 'Halal', 'Spicy', 'Under RM10', 'High Protein', 'Popular'];

const stallDirectory = [
  {
    name: 'Ah Seng Chicken Rice',
    description: 'Chicken rice, roasted meats & noodles',
    open: true,
    dishCount: 12,
  },
  {
    name: 'Penang Corner',
    description: 'Penang favourites',
    open: true,
    dishCount: 9,
  },
  {
    name: 'Curry House',
    description: 'Curry noodles & rice dishes',
    open: false,
    dishCount: 8,
  },
  {
    name: 'Green Garden Vegetarian',
    description: 'Vegetarian staples',
    open: true,
    dishCount: 11,
  },
];

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

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      {active ? <path d="M9 20v-6h6v6" /> : null}
    </svg>
  );
}

function SearchNavIcon({ active }: { active: boolean }) {
  return (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16L21 21" />
      {active ? <circle cx="11" cy="11" r="2.25" fill="currentColor" stroke="none" /> : null}
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
  { href: '/', label: 'Home', icon: HomeIcon, active: true },
  { href: '/search', label: 'Search', icon: SearchNavIcon, active: false },
  { href: '/orders', label: 'Orders', icon: OrdersIcon, active: false },
  { href: '/profile', label: 'Profile', icon: ProfileIcon, active: false },
];

export function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="mx-auto min-h-screen max-w-[430px] px-4 pb-28 pt-5 sm:max-w-[480px] lg:max-w-[960px] lg:px-6">
        <div className="lg:rounded-[32px] lg:border lg:border-[#e5e7eb] lg:bg-white lg:p-5 lg:shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#1d1d1f] text-sm font-semibold text-white">
                H
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6e6e73]">Hawker</p>
                <p className="mt-0.5 text-sm font-medium text-[#1d1d1f]">Setia Hawker Centre · Table 12</p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Open account menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] bg-white text-[#1d1d1f] shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
            >
              <svg {...iconProps} aria-hidden="true">
                <path d="M5 7h14M5 12h14M5 17h14" />
              </svg>
            </button>
          </header>

          <section className="mt-6 rounded-[24px] border border-[#e5e7eb] bg-white p-4 shadow-[0_14px_28px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Table session</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-2 py-1 text-[10px] font-medium text-[#166534]">
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                Active
              </span>
            </div>

            <h1 className="mt-4 text-[2.5rem] font-semibold leading-[0.96] tracking-[-0.07em] text-[#1d1d1f]">
              What are you craving?
            </h1>
            <p className="mt-2 text-base text-[#4b5563]">Find dishes from every stall around you.</p>

            <Link
              href={'/search' as any}
              aria-label="Search for dishes, ingredients or cravings"
              className="mt-5 flex items-center gap-3 rounded-[18px] border border-[#dfe3ea] bg-[#f7f7f7] px-4 py-3.5 text-left text-sm text-[#6e6e73] transition hover:border-[#c7ced8] hover:bg-[#f2f2f2]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                <SearchIcon />
              </span>
              <span className="block truncate">Search for dishes, ingredients or cravings...</span>
            </Link>
          </section>

          <section className="mt-6">
            <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {quickFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className="shrink-0 rounded-full border border-[#e5e7eb] bg-white px-3.5 py-2 text-sm font-medium text-[#1d1d1f] shadow-[0_8px_18px_rgba(15,23,42,0.02)] transition hover:border-[#d4d9df]"
                >
                  {filter}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[1.3rem] font-semibold tracking-[-0.05em] text-[#1d1d1f]">Popular right now</h2>
              <Link href={'/search' as any} className="text-sm font-medium text-[#3c3c43] underline-offset-4 hover:underline">
                See all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {fallbackDishes.slice(0, 4).map((dish) => (
                <article key={dish.id} className="flex items-center gap-3 rounded-[22px] border border-[#e5e7eb] bg-white p-3 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#f8e6c1_0%,#e6d4b0_100%)] text-xs font-semibold uppercase tracking-[0.22em] text-[#5c4b1d]">
                    {dish.name.split(' ')[0]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-[#1d1d1f]">{dish.name}</h3>
                        <p className="mt-1 text-xs text-[#6e6e73]">{dish.stallName}</p>
                      </div>
                      <div className="rounded-full bg-[#f5f5f7] px-2 py-1 text-sm font-medium text-[#1d1d1f]">
                        RM {dish.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-medium">
                      <span className="rounded-full bg-[#ecfdf5] px-2 py-1 text-[#065f46]">
                        {dish.isVegetarian ? 'Vegetarian' : 'Non-veg'}
                      </span>
                      <span className="rounded-full bg-[#ecfeff] px-2 py-1 text-[#0f766e]">{dish.isHalal ? 'Halal' : 'Non-halal'}</span>
                      <span className="rounded-full bg-[#f5f3ff] px-2 py-1 text-[#6d28d9]">
                        {dish.spiceLevel <= 1 ? 'Mild' : dish.spiceLevel <= 3 ? 'Medium' : 'Spicy'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-[#3c3c43]">{dish.proteinGrams}g protein</span>
                      <button
                        type="button"
                        className="rounded-full bg-[#1d1d1f] px-3 py-1.5 text-xs font-medium text-white"
                        aria-label={`Add ${dish.name} to your order`}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-[1.3rem] font-semibold tracking-[-0.05em] text-[#1d1d1f]">Browse stalls</h2>
              <Link href={'/search' as any} className="text-sm font-medium text-[#3c3c43] underline-offset-4 hover:underline">
                Explore
              </Link>
            </div>

            <div className="space-y-3">
              {stallDirectory.map((stall) => (
                <div key={stall.name} className="flex items-center justify-between gap-3 rounded-[20px] border border-[#e5e7eb] bg-white p-3 shadow-[0_10px_22px_rgba(15,23,42,0.03)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f5f5f7] text-sm font-semibold text-[#1d1d1f]">
                      {stall.name
                        .split(' ')
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#1d1d1f]">{stall.name}</p>
                      <p className="mt-0.5 text-xs text-[#6e6e73]">{stall.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${stall.open ? 'text-[#166534]' : 'text-[#6e6e73]'}`}>
                      {stall.open ? 'Open' : 'Closed'}
                    </p>
                    <p className="mt-1 text-xs text-[#6e6e73]">{stall.dishCount} dishes</p>
                  </div>
                </div>
              ))}
            </div>
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
