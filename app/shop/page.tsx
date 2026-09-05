import Link from 'next/link';

const shops = [
  { name: 'Ah Seng Chicken Rice', eta: '10 min', busy: 'Busy', dishes: 12 },
  { name: 'Penang Corner', eta: '12 min', busy: 'Moderate', dishes: 9 },
  { name: 'Curry House', eta: 'Closed', busy: 'Closed', dishes: 8 },
  { name: 'Green Garden Vegetarian', eta: '8 min', busy: 'Quiet', dishes: 11 },
];

export default function ShopPage() {
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6e6e73]">Stalls</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Shop directory</h1>
        </section>

        <div className="mt-5 grid grid-cols-1 gap-3">
          {shops.map((shop) => {
            const slug = shop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            return (
              <Link key={shop.name} href={`/shop/${slug}`} className="block">
                <article className="rounded-[22px] bg-white p-3 shadow-[0_8px_18px_rgba(15,23,42,0.02)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f5f5f7] text-sm font-semibold text-[#1d1d1f]">
                        {shop.name
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[#1d1d1f]">{shop.name}</p>
                        <p className="mt-0.5 text-xs text-[#6e6e73]">{shop.dishes} dishes</p>
                      </div>
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

                  <div className="mt-3 text-xs text-[#6e6e73]">ETA {shop.eta}</div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
