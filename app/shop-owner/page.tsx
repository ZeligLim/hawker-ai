'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarRange, Store, Users } from 'lucide-react';

type ShopMembership = {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  role: string;
  booths: Array<{ id: string; name: string }>;
};

const quickLinks = [
  { label: 'Booths', href: '/shop-owner/booths', icon: Store },
  { label: 'Analytics', href: '/shop-owner/analytics', icon: CalendarRange },
];

export default function ShopOwnerPage() {
  const [shops, setShops] = useState<ShopMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShops = async () => {
      try {
        const response = await fetch('/api/owner/shops');
        if (!response.ok) {
          setShops([]);
          return;
        }

        const payload = (await response.json()) as { shops?: ShopMembership[] };
        setShops(payload.shops ?? []);
      } catch {
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    void loadShops();
  }, []);

  const totalBooths = shops.reduce((sum, shop) => sum + shop.booths.length, 0);

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[980px]">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Shop overview</h1>
          </div>
        </header>

        <nav className="mt-6 grid gap-3 sm:grid-cols-2">
          {quickLinks.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href as any} className="rounded-[18px] bg-white p-3 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <Icon className="h-5 w-5 text-[#6e6e73]" />
              <p className="mt-3 text-sm font-semibold">{label}</p>
            </Link>
          ))}
        </nav>

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-[#6e6e73]">Managed shops</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{shops.length}</p>
          </div>
          <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-[#6e6e73]">Total booths</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{totalBooths}</p>
          </div>
          <div className="rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-[#6e6e73]">Role</p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.04em]">{shops[0]?.role ?? 'Owner'}</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.04em]">Shop memberships</h2>
                <p className="mt-1 text-sm text-[#6e6e73]">Your current restaurant and booth access.</p>
              </div>
              <Users className="h-6 w-6 text-[#6e6e73]" />
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <p className="text-sm text-[#6e6e73]">Loading shop access…</p>
              ) : shops.length === 0 ? (
                <div className="rounded-[18px] bg-[#f5f5f7] px-3 py-4 text-sm text-[#6e6e73]">
                  No shop memberships found yet. This user is not currently assigned to a restaurant.
                </div>
              ) : (
                shops.map((shop) => (
                  <div key={shop.id} className="rounded-[18px] bg-[#f5f5f7] px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{shop.name}</p>
                        <p className="mt-1 text-xs text-[#6e6e73]">{shop.role} · {shop.booths.length} booths</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1d1d1f]">{shop.slug ?? 'shop'}</span>
                    </div>
                    {shop.booths.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {shop.booths.map((booth) => (
                          <div key={booth.id} className="rounded-[14px] bg-white px-2.5 py-2 text-sm text-[#1d1d1f]">
                            {booth.name}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <h2 className="text-xl font-semibold tracking-[-0.04em]">Quick actions</h2>
            <div className="mt-4 space-y-2.5">
              <Link href={'/shop-owner/booths' as any} className="flex items-center justify-between rounded-[18px] bg-[#f5f5f7] px-4 py-3 text-sm font-medium hover:bg-[#e5e5ea] transition-colors">
                <span>Generate booth tokens</span>
                <span className="text-xs text-[#6e6e73]">→</span>
              </Link>
              <Link href={'/shop-owner/analytics' as any} className="flex items-center justify-between rounded-[18px] bg-[#f5f5f7] px-4 py-3 text-sm font-medium hover:bg-[#e5e5ea] transition-colors">
                <span>View venue analytics</span>
                <span className="text-xs text-[#6e6e73]">→</span>
              </Link>
              <Link href={'/shop-owner/profile' as any} className="flex items-center justify-between rounded-[18px] bg-[#f5f5f7] px-4 py-3 text-sm font-medium hover:bg-[#e5e5ea] transition-colors">
                <span>Food hall settings</span>
                <span className="text-xs text-[#6e6e73]">→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
