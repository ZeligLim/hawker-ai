'use client';

import { useState } from 'react';
import { Pencil, Plus, Store, X } from 'lucide-react';

type Booth = {
  name: string;
  manager: string;
  status: 'Active' | 'Needs update';
};

const initialBooths: Booth[] = [
  { name: 'Ah Seng Chicken Rice', manager: 'Alicia Tan', status: 'Active' },
  { name: 'Penang Corner', manager: 'Lim Ewe', status: 'Active' },
  { name: 'Curry House', manager: 'Maya Wong', status: 'Needs update' },
];

export default function ShopOwnerBoothsPage() {
  const [booths, setBooths] = useState(initialBooths);
  const [editing, setEditing] = useState<Booth | null>(null);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;

    setBooths((current) =>
      current.map((booth) => (booth.name === editing.name ? { ...editing } : booth)),
    );
    setEditing(null);
  };

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
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs font-semibold text-[#1d1d1f]">{booth.status}</span>
                  <button
                    type="button"
                    onClick={() => setEditing(booth)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d1d1f]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-[#111827]/35 p-4 sm:items-center">
          <form onSubmit={handleSave} className="w-full max-w-md rounded-[24px] bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Edit booth</h2>
              <button type="button" aria-label="Close edit booth form" onClick={() => setEditing(null)}>
                <X className="h-5 w-5 text-[#6e6e73]" />
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium">
              Booth name
              <input
                value={editing.name}
                onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none ring-1 ring-transparent focus:ring-[#cbd5e1]"
              />
            </label>

            <label className="mt-4 block text-sm font-medium">
              Manager
              <input
                value={editing.manager}
                onChange={(event) => setEditing({ ...editing, manager: event.target.value })}
                className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none ring-1 ring-transparent focus:ring-[#cbd5e1]"
              />
            </label>

            <label className="mt-4 block text-sm font-medium">
              Status
              <select
                value={editing.status}
                onChange={(event) => setEditing({ ...editing, status: event.target.value as Booth['status'] })}
                className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Needs update">Needs update</option>
              </select>
            </label>

            <button type="submit" className="mt-5 w-full rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
              Save changes
            </button>
          </form>
        </div>
      ) : null}
    </main>
  );
}
