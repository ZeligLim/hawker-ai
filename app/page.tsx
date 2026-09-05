'use client';

import { useMemo, useState } from 'react';
import type { SearchResult } from '@/lib/search/schema';

const initialFilters = {
  query: 'vegetarian, RM15, spicy',
  maxPrice: '15',
  vegetarian: 'true',
  halal: 'true',
  spiceLevel: '3',
  limit: '5',
};

const spiceLabels: Record<number, string> = {
  0: 'Mild',
  1: 'Low heat',
  2: 'Warm',
  3: 'Medium',
  4: 'Spicy',
  5: 'Very spicy',
};

const getAllergyDisclaimer = (query: string) => {
  const text = query.toLowerCase();
  const mentionsAllergy = /allergy|allergic|nuts|shellfish|seafood|peanut|sesame|gluten|dairy|soy|halal/.test(text);

  if (!mentionsAllergy) return null;

  return 'Caution: I cannot guarantee allergy safety without exact ingredient data for this stall. Please verify ingredients directly with the vendor before eating.';
};

const getFollowUpHint = (query: string) => {
  const lower = query.toLowerCase();
  if (lower.includes('more protein')) {
    return 'Follow-up context detected: you are comparing protein density.';
  }

  if (lower.includes('halal')) {
    return 'Follow-up context detected: halal preference remains active.';
  }

  if (lower.includes('vegetarian')) {
    return 'Follow-up context detected: vegetarian-only filter remains active.';
  }

  return 'Conversation context: recent search remains active for this session.';
};

export default function Home() {
  const [query, setQuery] = useState(initialFilters.query);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [vegetarian, setVegetarian] = useState(initialFilters.vegetarian);
  const [halal, setHalal] = useState(initialFilters.halal);
  const [spiceLevel, setSpiceLevel] = useState(initialFilters.spiceLevel);
  const [limit, setLimit] = useState(initialFilters.limit);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState(initialFilters.query);

  const allergyDisclaimer = useMemo(() => getAllergyDisclaimer(query), [query]);
  const followUpHint = useMemo(() => getFollowUpHint(query), [query]);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          vegetarian: vegetarian === 'true' ? true : vegetarian === 'false' ? false : undefined,
          halal: halal === 'true' ? true : halal === 'false' ? false : undefined,
          spiceLevel: spiceLevel ? Number(spiceLevel) : undefined,
          limit: limit ? Number(limit) : 5,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Search failed');
      }

      setResults(payload.results ?? []);
      setLastQuery(query);
    } catch (searchError) {
      setResults([]);
      setError(searchError instanceof Error ? searchError.message : 'Unknown search error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-400">Hawker Menu Intelligence</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Discover your next hawker fix</h1>
              <p className="mt-2 max-w-2xl text-slate-300">
                Filter by budget, dietary needs, spice, and natural-language intent.
              </p>
            </div>
            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
              Phase 4 + Phase 5-ready UI
            </div>
          </div>
        </header>

        <form onSubmit={handleSearch} className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Search query
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none ring-0 transition focus:border-amber-400"
                placeholder="vegetarian, RM15, spicy"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Max price (RM)
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none focus:border-amber-400"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Vegetarian
              <select
                value={vegetarian}
                onChange={(event) => setVegetarian(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none focus:border-amber-400"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Halal
              <select
                value={halal}
                onChange={(event) => setHalal(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none focus:border-amber-400"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_120px]">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Spice level
              <select
                value={spiceLevel}
                onChange={(event) => setSpiceLevel(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none focus:border-amber-400"
              >
                <option value="">Any</option>
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <option key={level} value={String(level)}>
                    {spiceLabels[level as keyof typeof spiceLabels]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Limit results
              <input
                type="number"
                min="1"
                max="20"
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-50 outline-none focus:border-amber-400"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="self-end rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>

        {(allergyDisclaimer || followUpHint) && (
          <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            {allergyDisclaimer && <p className="mb-2 font-medium">{allergyDisclaimer}</p>}
            <p>{followUpHint}</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Results</h2>
            {lastQuery && <span className="text-sm text-slate-400">Last search: “{lastQuery}”</span>}
          </div>

          {!loading && results.length === 0 && !error && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center text-slate-400">
              No matches yet. Try a broader search like “halal under RM15”.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((dish) => (
              <article key={dish.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-amber-300">{dish.restaurantName}</p>
                    <h3 className="mt-1 text-xl font-bold">{dish.name}</h3>
                  </div>
                  <div className="rounded-full bg-slate-800 px-2 py-1 text-sm font-medium text-slate-100">RM {dish.price.toFixed(2)}</div>
                </div>

                <p className="mt-3 text-sm text-slate-300">Stall: {dish.stallName}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-300">
                    {dish.isVegetarian ? 'Vegetarian' : 'Non-veg'}
                  </span>
                  <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-cyan-300">
                    {dish.isHalal ? 'Halal' : 'Non-halal'}
                  </span>
                  <span className="rounded-full bg-violet-500/10 px-2 py-1 text-violet-300">
                    {spiceLabels[dish.spiceLevel as keyof typeof spiceLabels] ?? 'Unknown'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300">
                  <div className="rounded-lg bg-slate-800 p-2">
                    <p className="text-slate-400">Protein</p>
                    <p className="font-semibold text-slate-50">{dish.proteinGrams}g</p>
                  </div>
                  <div className="rounded-lg bg-slate-800 p-2">
                    <p className="text-slate-400">Match</p>
                    <p className="font-semibold text-slate-50">{dish.matchScore.toFixed(0)}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Why this matches</p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-200">
                    {dish.reasons.map((reason) => (
                      <li key={reason} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
