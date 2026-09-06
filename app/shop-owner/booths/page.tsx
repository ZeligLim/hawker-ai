'use client';

import Link from 'next/link';
import { Plus, Store, Users } from 'lucide-react';

const booths = [
  { name: 'Ah Seng Chicken Rice', manager: 'Alicia Tan', status: 'Active' },
  { name: 'Penang Corner', manager: 'Lim Ewe', status: 'Active' },
  { name: 'Curry House', manager: 'Maya Wong', status: 'Needs update' },
];

export default function ShopOwnerBoothsPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[980px]">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Booths</h1>
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Add booth
          </button>
        </header>

        <section className="mt-6 space-y-3">
          {booths.map((booth) => (
            <article key={booth.name} className="rounded-[24px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f]">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">{booth.name}</p>
                    <p className="mt-1 text-xs text-[#6e6e73]">Owner: {booth.manager}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs font-semibold text-[#1d1d1f]">{booth.status}</span>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-6 flex gap-3">
          <Link href={'/shop-owner' as any} className="rounded-full bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white">Dashboard</Link>
          <Link href={'/shop-owner/profile' as any} className="rounded-full bg-[#f5f5f7] px-4 py-2.5 text-sm font-semibold text-[#1d1d1f]">Profile</Link>
        </div>
      </div>
    </main>
  );
}
