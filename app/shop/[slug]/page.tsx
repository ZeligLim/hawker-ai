import Link from 'next/link';
import type { Metadata } from 'next';

const shops = {
  'ah-seng-chicken-rice': {
    name: 'Ah Seng Chicken Rice',
    eta: '10 min',
    busy: 'Busy',
    description: 'Chicken rice, roasted meats & noodles',
    dishes: [
      { name: 'Nasi Lemak', price: 8.5, vegetarian: false },
      { name: 'Chicken Rice', price: 7, vegetarian: false },
      { name: 'Roasted Chicken', price: 9, vegetarian: false },
    ],
  },
  'penang-corner': {
    name: 'Penang Corner',
    eta: '12 min',
    busy: 'Moderate',
    description: 'Penang favourites',
    dishes: [
      { name: 'Curry Mee', price: 12, vegetarian: false },
      { name: 'Char Kway Teow', price: 11.5, vegetarian: false },
      { name: 'Teh Tarik', price: 3.5, vegetarian: true },
    ],
  },
  'curry-house': {
    name: 'Curry House',
    eta: 'Closed',
    busy: 'Closed',
    description: 'Curry noodles & rice dishes',
    dishes: [
      { name: 'Laksa', price: 10, vegetarian: false },
      { name: 'Curry Rice', price: 8, vegetarian: false },
      { name: 'Bandung', price: 3, vegetarian: true },
    ],
  },
  'green-garden-vegetarian': {
    name: 'Green Garden Vegetarian',
    eta: '8 min',
    busy: 'Quiet',
    description: 'Vegetarian staples',
    dishes: [
      { name: 'Vegetarian Curry Laksa', price: 13, vegetarian: true },
      { name: 'Vegetarian Bee Hoon', price: 9.5, vegetarian: true },
      { name: 'Cendol', price: 5, vegetarian: true },
    ],
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const shop = shops[slug as keyof typeof shops];

  return {
    title: shop ? `${shop.name} | Hawker Menu Intelligence` : 'Shop | Hawker Menu Intelligence',
  };
}

export default async function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const shop = shops[slug as keyof typeof shops];

  if (!shop) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 py-6 text-[#1d1d1f]">
        <div className="mx-auto max-w-[430px] rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Shop</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Not found</h1>
          <Link href="/shop" className="mt-5 inline-flex rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">
            Back to shops
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px] sm:max-w-[480px] lg:max-w-[960px]">
        <header className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#1d1d1f] text-sm font-semibold text-white">
            H
          </div>
          <p className="text-sm font-medium text-[#1d1d1f]">Setia Hawker Centre</p>
        </header>

        <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Stall</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{shop.name}</h1>
            </div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
              shop.busy === 'Busy'
                ? 'bg-[#fef3c7] text-[#b45309]'
                : shop.busy === 'Moderate'
                  ? 'bg-[#dbeafe] text-[#1d4ed8]'
                  : shop.busy === 'Closed'
                    ? 'bg-[#f5f5f7] text-[#6e6e73]'
                    : 'bg-[#dcfce7] text-[#166534]'
            }`}>
              {shop.busy}
            </span>
          </div>

          <p className="mt-3 text-sm text-[#6e6e73]">{shop.description}</p>

          <div className="mt-4 flex items-center justify-between text-xs text-[#6e6e73]">
            <span>ETA {shop.eta}</span>
            <span>{shop.dishes.length} dishes</span>
          </div>
        </section>

        <section className="mt-6 rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <h2 className="text-lg font-semibold tracking-[-0.04em]">Popular dishes</h2>

          <div className="mt-4 space-y-3">
            {shop.dishes.map((dish) => (
              <div key={dish.name} className="flex items-center justify-between gap-3 rounded-[18px] bg-[#f5f5f7] px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-[#1d1d1f]">{dish.name}</p>
                  {dish.vegetarian ? <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#166534]">Vegetarian</p> : null}
                </div>
                <p className="text-sm font-semibold text-[#1d1d1f]">RM {dish.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>

        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">
          Back to shops
        </Link>
      </div>
    </main>
  );
}
