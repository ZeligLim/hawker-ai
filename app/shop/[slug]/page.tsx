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
          <h1 className="text-3xl font-semibold tracking-[-0.06em]">Not found</h1>
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
        <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white text-sm font-semibold text-[#1d1d1f] shadow-[0_6px_16px_rgba(15,23,42,0.04)] ring-1 ring-[#f1f5f9]">
                {shop.name
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')}
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-[-0.06em]">{shop.name}</h1>
                <p className="mt-1 text-sm text-[#6e6e73]">{shop.description}</p>
              </div>
            </div>

            <div className="flex min-w-[88px] shrink-0 flex-col items-end gap-1 text-right">
              <span className={`whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${
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
              {shop.busy !== 'Closed' ? (
                <span className="whitespace-nowrap text-[10px] font-medium leading-none text-[#6e6e73]">ETA {shop.eta}</span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            {shop.dishes.map((dish) => (
              <article key={dish.name} className="overflow-hidden rounded-[22px] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
                <div className="relative h-40 overflow-hidden bg-[#f3efe8]">
                  <div className="flex h-full items-center justify-center text-lg font-semibold uppercase tracking-[0.22em] text-[#5c4b1d]">
                    {dish.name.split(' ')[0]}
                  </div>

                  <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                    RM {dish.price.toFixed(2)}
                  </div>

                  {dish.vegetarian ? (
                    <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#ecfdf5] text-[#166534] shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-[14px] w-[14px]">
                        <path d="M18 3c-4.5 2.4-7.1 5.1-8.3 9.2C8.5 16 7.2 17.1 4 19.3c3.5 0 6.7-1.1 9.5-4.5C15.8 10.3 17.2 7 18 3Z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : null}

                  <div className="absolute bottom-2 right-2">
                    <button
                      type="button"
                      className="rounded-full bg-[#1d1d1f] px-2.5 py-1.5 text-[10px] font-medium text-white shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
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

        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-[#111827] px-4 py-2.5 text-sm font-medium text-white">
          Back to shops
        </Link>
      </div>
    </main>
  );
}
