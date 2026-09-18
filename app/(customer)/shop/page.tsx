import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  let shops: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    eta: string;
    busy: string;
  }> = [];

  if (supabase) {
    const { data: outlets } = await supabase
      .from('food_outlets')
      .select('id, name, restaurant_id, is_open, restaurants(name, slug, is_active)');

    if (outlets && outlets.length > 0) {
      shops = outlets.map((outlet: any) => {
        const slug = outlet.restaurants?.slug || outlet.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const isOpen = outlet.is_open ?? true;
        const isShopActive = outlet.restaurants?.is_active ?? true;
        const isClosed = !isOpen || !isShopActive;

        return {
          id: outlet.id,
          name: outlet.name,
          slug,
          description: `${outlet.restaurants?.name ?? 'Hawker Stall'} · Local specialty`,
          eta: '10 min',
          busy: isClosed ? 'Closed' : 'Open',
        };
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px] sm:max-w-[480px] lg:max-w-[960px]">
        <section className="rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <h1 className="text-3xl font-semibold tracking-[-0.06em]">Shop directory</h1>
        </section>

        <div className="mt-5 grid grid-cols-1 gap-3">
          {shops.map((shop) => {
            const slug = shop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            return (
              <Link key={shop.name} href={`/shop/${slug}`} className="block">
                <article className="rounded-[22px] bg-white p-3 shadow-[0_8px_18px_rgba(15,23,42,0.02)]">
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
                        <p className="text-base font-semibold text-[#1d1d1f] truncate">{shop.name}</p>
                        <p className="mt-0.5 text-xs text-[#6e6e73] truncate">{shop.description}</p>
                      </div>
                    </div>

                    <div className="flex min-w-[88px] shrink-0 flex-col items-end gap-1 text-right">
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
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
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
