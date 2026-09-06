'use client';

import { Save } from 'lucide-react';

export default function ShopOwnerProfilePage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[760px]">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Shop information</h1>
          </div>
        </header>

        <section className="mt-6 rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-lg font-semibold text-white">S</div>
            <div>
              <h2 className="text-lg font-semibold">Sunset Hawker Centre</h2>
              <p className="mt-1 text-sm text-[#6e6e73]">8 booths · 3 managers</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[18px] bg-[#f5f5f7] px-3 py-3">
              <p className="text-xs text-[#6e6e73]">Shop name</p>
              <p className="mt-1 text-sm font-semibold">Sunset Hawker Centre</p>
            </div>
            <div className="rounded-[18px] bg-[#f5f5f7] px-3 py-3">
              <p className="text-xs text-[#6e6e73]">Location</p>
              <p className="mt-1 text-sm font-semibold">Jalan Alor, Kuala Lumpur</p>
            </div>
          </div>

          <button type="button" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
            <Save className="h-4 w-4" /> Save changes
          </button>
        </section>
      </div>
    </main>
  );
}
