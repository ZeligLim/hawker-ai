'use client';

import { useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { ShopOwnerNav } from '@/components/shop-owner-nav';
import { booths, type Booth } from '@/lib/shop-owner-data';

export default function BoothsPage() {
  const [boothList, setBoothList] = useState(booths);
  const [editing, setEditing] = useState<Booth | null>(null);

  const saveBooth = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;

    setBoothList((current) => current.map((booth) => (booth.id === editing.id ? editing : booth)));
    setEditing(null);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-6 text-[#1d1d1f]">
      <div className="mx-auto max-w-[960px]">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">Shop owner</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em]">Your booths</h1>
          <p className="mt-2 text-sm text-[#6e6e73]">Manage the booths connected to your shop.</p>
        </header>
        <ShopOwnerNav active="booths" />
        <section className="grid gap-3 sm:grid-cols-2">
          {boothList.map((booth) => (
            <article key={booth.id} className="rounded-[22px] bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{booth.name}</h2>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${booth.status === 'Open' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                      {booth.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#6e6e73]">{booth.location}</p>
                </div>
                <button type="button" onClick={() => setEditing(booth)} className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] px-3 py-1.5 text-xs font-semibold text-[#3c3c43] hover:bg-[#f5f5f7]">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#f1f5f9] pt-4">
                <div><p className="text-xs text-[#6e6e73]">Orders</p><p className="mt-1 font-semibold">{booth.orders}</p></div>
                <div><p className="text-xs text-[#6e6e73]">Revenue</p><p className="mt-1 font-semibold">RM {booth.revenue.toLocaleString()}</p></div>
                <div><p className="text-xs text-[#6e6e73]">Avg. order</p><p className="mt-1 font-semibold">RM {booth.averageOrder.toFixed(2)}</p></div>
              </div>
            </article>
          ))}
        </section>
      </div>
      {editing ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-[#111827]/35 p-4 sm:items-center">
          <form onSubmit={saveBooth} className="w-full max-w-md rounded-[24px] bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit booth</h2>
              <button type="button" aria-label="Close edit booth form" onClick={() => setEditing(null)}><X className="h-5 w-5 text-[#6e6e73]" /></button>
            </div>
            <label className="mt-5 block text-sm font-medium">Booth name<input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none ring-1 ring-transparent focus:ring-[#cbd5e1]" /></label>
            <label className="mt-4 block text-sm font-medium">Location<input value={editing.location} onChange={(event) => setEditing({ ...editing, location: event.target.value })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none ring-1 ring-transparent focus:ring-[#cbd5e1]" /></label>
            <label className="mt-4 block text-sm font-medium">Status<select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value as Booth['status'] })} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none"><option>Open</option><option>Closed</option></select></label>
            <button type="submit" className="mt-5 w-full rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">Save changes</button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
