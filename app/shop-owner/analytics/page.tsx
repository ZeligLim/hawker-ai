'use client';

import { CalendarRange } from 'lucide-react';

const sales = [
  { label: 'Mon', value: 'RM 520' },
  { label: 'Tue', value: 'RM 610' },
  { label: 'Wed', value: 'RM 740' },
  { label: 'Thu', value: 'RM 690' },
  { label: 'Fri', value: 'RM 980' },
  { label: 'Sat', value: 'RM 1,180' },
  { label: 'Sun', value: 'RM 1,260' },
];

const filters = ['d', 'w', 'm', 'y'];
const booths = ['All booths', 'Ah Seng Chicken Rice', 'Penang Corner', 'Curry House'];

export default function ShopOwnerAnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[980px]">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.06em]">Analytics</h1>
          </div>
        </header>

        <section className="mt-6 rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex self-start rounded-full bg-[#f5f5f7] p-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`min-w-[40px] rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${filter === 'w' ? 'bg-[#111827] text-white' : 'text-[#6e6e73]'}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 self-start text-sm text-[#6e6e73]">
              <span>Filter booth</span>
              <select className="h-[40px] rounded-full border border-[#e5e7eb] bg-[#f5f5f7] px-3 text-sm text-[#1d1d1f] outline-none">
                {booths.map((booth) => (
                  <option key={booth} value={booth}>{booth}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-7">
            {sales.map((day) => (
              <div key={day.label} className="rounded-[18px] bg-[#f5f5f7] p-3 text-center">
                <p className="text-xs text-[#6e6e73]">{day.label}</p>
                <p className="mt-2 text-sm font-semibold">{day.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
