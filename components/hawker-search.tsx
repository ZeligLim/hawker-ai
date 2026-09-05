'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CartSummary } from '@/components/cart-summary';
import { ResultCard } from '@/components/result-card';
import type { SearchResult } from '@/lib/search/schema';
import { addItemToCart, buildCartSummary, readCartItems, removeCartItem, updateCartItemQuantity, writeCartItems, type CartItem } from '@/lib/order/cart';

const quickIdeas = [
  'I want a halal meal under RM15',
  'Give me a vegetarian dish with medium spice',
  'Something filling with more protein',
  'Best spicy noodles under RM12',
];

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
  if (lower.includes('more protein')) return 'Follow-up context: you are comparing protein density.';
  if (lower.includes('halal')) return 'Follow-up context: halal preference remains active.';
  if (lower.includes('vegetarian')) return 'Follow-up context: vegetarian-only filter remains active.';
  return 'Conversation context: your last search is still active.';
};

export function HawkerSearch({ initialQuery = 'I want a vegetarian meal under RM15 with medium spice and halal-friendly options.' }: { initialQuery?: string }) {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [query, setQuery] = useState(initialQuery);
  const [maxPrice, setMaxPrice] = useState('15');
  const [vegetarian, setVegetarian] = useState('true');
  const [halal, setHalal] = useState('true');
  const [spiceLevel, setSpiceLevel] = useState('3');
  const [limit, setLimit] = useState('5');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readCartItems());
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  useEffect(() => {
    writeCartItems(cartItems);
  }, [cartItems]);

  const isDark = theme === 'dark';
  const shellBg = isDark ? 'bg-[#0a0a0d] text-[#f5f5f7]' : 'bg-[#f5f5f7] text-[#1d1d1f]';
  const cardBg = isDark ? 'bg-[#111214]' : 'bg-white';
  const mutedText = isDark ? 'text-[#a1a1aa]' : 'text-[#6e6e73]';
  const chipBg = isDark ? 'bg-[#1a1b1e] text-[#f5f5f7]' : 'bg-[#f7f7f7] text-[#1d1d1f]';
  const border = isDark ? 'border-[#2a2b2f]' : 'border-[#e5e7eb]';
  const inputBg = isDark ? 'bg-[#15171c] text-[#f5f5f7]' : 'bg-white text-[#1d1d1f]';

  const allergyDisclaimer = useMemo(() => getAllergyDisclaimer(query), [query]);
  const followUpHint = useMemo(() => getFollowUpHint(query), [query]);
  const cartSummary = useMemo(() => buildCartSummary(cartItems), [cartItems]);
  const resultsHref = {
    pathname: '/results',
    query: {
      query,
      maxPrice: maxPrice || '',
      vegetarian,
      halal,
      spiceLevel: spiceLevel || '',
      limit: limit || '5',
    },
  };

  const handleAddToCart = (dish: SearchResult) => {
    const stallId = `${dish.restaurantName}:${dish.stallName}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    setCheckoutMessage(null);
    setCartItems((currentItems) =>
      addItemToCart(currentItems, {
        dishId: dish.id,
        name: dish.name,
        restaurantName: dish.restaurantName,
        stallName: dish.stallName,
        stallId,
        price: dish.price,
        quantity: 1,
      }),
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    setCheckoutMessage(
      `Order placed for ${cartSummary.merchantGroups.length} stall${cartSummary.merchantGroups.length === 1 ? '' : 's'} · total RM ${cartSummary.total.toFixed(2)}`,
    );
    setCartItems([]);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCartItems((currentItems) => updateCartItemQuantity(currentItems, itemId, quantity));
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((currentItems) => removeCartItem(currentItems, itemId));
  };

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
      if (!response.ok) throw new Error(payload?.error ?? 'Search failed');

      const nextResults = payload.results ?? [];
      setResults(nextResults);
      router.push(resultsHref as any);
    } catch (searchError) {
      setResults([]);
      setError(searchError instanceof Error ? searchError.message : 'Unknown search error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${shellBg} min-h-screen transition-colors duration-200`}>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className={`rounded-[32px] border ${border} bg-white/10 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6 lg:p-8`}>
          <header className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isDark ? 'bg-[#f5f5f7] text-[#111214]' : 'bg-[#111827] text-white'}`}>
                H
              </div>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${mutedText}`}>Hawker Menu Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${border} ${chipBg}`}
              >
                {isDark ? 'Light mode' : 'Dark mode'}
              </button>
              <Link href={resultsHref as any} className={`hidden rounded-full border px-3 py-1.5 text-sm font-medium transition sm:inline-flex ${border} ${chipBg}`}>
                Browse results
              </Link>
            </div>
          </header>

          <section className={`rounded-[30px] border ${border} px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:px-6 sm:py-7 ${isDark ? 'bg-[radial-gradient(circle_at_top,_#111214_0%,_#0d0d10_55%,_#0b0b0d_100%)]' : 'bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#f5f5f7_55%,_#f0f0f2_100%)]'}`}>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${mutedText}`}>Find your next craving</p>
                <h1 className={`mt-2 text-3xl font-semibold tracking-[-0.06em] sm:text-5xl ${isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
                  Discover hawker food that fits your mood.
                </h1>
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-5">
              <label className="block">
                <span className={`mb-2 block text-sm font-medium ${isDark ? 'text-[#d4d4d8]' : 'text-[#3c3c43]'}`}>What are you craving?</span>
                <textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  rows={3}
                  className={`w-full resize-none rounded-[22px] border ${border} ${inputBg} px-4 py-3 text-base outline-none transition focus:border-[#8c8c93] ${isDark ? 'shadow-[0_10px_30px_rgba(12,12,15,0.6)]' : 'shadow-[0_10px_30px_rgba(15,23,42,0.04)]'}`}
                  placeholder="I want a vegetarian meal under RM15 with medium spice and halal-friendly options."
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {quickIdeas.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => setQuery(idea)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${border} ${isDark ? 'bg-[#17181d] text-[#f5f5f7] hover:bg-[#1d1f24]' : 'bg-white text-[#3c3c43] hover:bg-[#fafafa]'}`}
                  >
                    {idea}
                  </button>
                ))}
              </div>

              <div className={`flex flex-col gap-3 rounded-[22px] border ${border} p-3 sm:flex-row sm:items-center sm:justify-between ${isDark ? 'bg-[#101113]' : 'bg-white/80'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVegetarian((current) => (current === 'true' ? '' : 'true'))}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      vegetarian === 'true'
                        ? isDark
                          ? 'bg-[#f5f5f7] text-[#111214]'
                          : 'bg-[#111827] text-white'
                        : isDark
                          ? 'border border-[#2a2b2f] bg-[#17181d] text-[#f5f5f7]'
                          : 'border border-[#dfe3ea] bg-[#f9fafb] text-[#3c3c43]'
                    }`}
                  >
                    Vegetarian
                  </button>
                  <button
                    type="button"
                    onClick={() => setHalal((current) => (current === 'true' ? '' : 'true'))}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      halal === 'true'
                        ? isDark
                          ? 'bg-[#f5f5f7] text-[#111214]'
                          : 'bg-[#111827] text-white'
                        : isDark
                          ? 'border border-[#2a2b2f] bg-[#17181d] text-[#f5f5f7]'
                          : 'border border-[#dfe3ea] bg-[#f9fafb] text-[#3c3c43]'
                    }`}
                  >
                    Halal
                  </button>
                  <label className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${isDark ? 'border-[#2a2b2f] bg-[#17181d] text-[#f5f5f7]' : 'border-[#dfe3ea] bg-[#f9fafb] text-[#3c3c43]'}`}>
                    <span>Budget</span>
                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                      className={`w-16 bg-transparent text-right outline-none ${isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}
                    />
                  </label>
                  <label className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${isDark ? 'border-[#2a2b2f] bg-[#17181d] text-[#f5f5f7]' : 'border-[#dfe3ea] bg-[#f9fafb] text-[#3c3c43]'}`}>
                    <span>Heat</span>
                    <select value={spiceLevel} onChange={(event) => setSpiceLevel(event.target.value)} className={`bg-transparent outline-none ${isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
                      <option value="">Any</option>
                      {[0, 1, 2, 3, 4, 5].map((level) => (
                        <option key={level} value={String(level)}>
                          {spiceLabels[level as keyof typeof spiceLabels]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <label className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${isDark ? 'border-[#2a2b2f] bg-[#17181d] text-[#f5f5f7]' : 'border-[#dfe3ea] bg-[#f9fafb] text-[#3c3c43]'}`}>
                    <span>Results</span>
                    <input type="number" min="1" max="20" value={limit} onChange={(event) => setLimit(event.target.value)} className={`w-12 bg-transparent text-right outline-none ${isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`} />
                  </label>
                  <button type="submit" disabled={loading} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${isDark ? 'bg-[#f5f5f7] text-[#111214] hover:bg-white' : 'bg-[#111827] text-white hover:bg-[#1f2937]'} disabled:cursor-not-allowed disabled:opacity-60`}>
                    {loading ? 'Searching…' : 'Search'}
                  </button>
                </div>
              </div>
            </form>

            {(allergyDisclaimer || followUpHint) && (
              <div className={`mt-5 rounded-[20px] border p-3 text-sm ${isDark ? 'border-[#f5d57b]/40 bg-[#2b2416] text-[#f7d98f]' : 'border-[#f5d57b] bg-[#fff6d6] text-[#5c4b1d]'}`}>
                {allergyDisclaimer && <p className="mb-1 font-medium">{allergyDisclaimer}</p>}
                <p>{followUpHint}</p>
              </div>
            )}

            {error && (
              <div className={`mt-5 rounded-[20px] border p-3 text-sm ${isDark ? 'border-[#fca5a5]/30 bg-[#2b1017] text-[#fecaca]' : 'border-[#fecaca] bg-[#fff1f2] text-[#9f1239]'}`}>
                {error}
              </div>
            )}
          </section>

          {results.length > 0 && (
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className={`text-xl font-semibold tracking-[-0.04em] ${isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>Top matches</h2>
                <Link href={resultsHref as any} className={`text-sm font-medium underline underline-offset-4 ${isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
                  View all
                </Link>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.5fr_0.85fr]">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {results.slice(0, 3).map((dish) => (
                    <ResultCard key={dish.id} dish={dish} onAddToCart={handleAddToCart} />
                  ))}
                </div>

                <div className="lg:pt-1">
                  <CartSummary
                    items={cartItems}
                    subtotal={cartSummary.subtotal}
                    serviceFee={cartSummary.serviceFee}
                    total={cartSummary.total}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={handleCheckout}
                  />
                </div>
              </div>

              {checkoutMessage && (
                <div className="mt-5 rounded-[22px] border border-[#bbf7d0] bg-[#ecfdf5] p-3 text-sm font-medium text-[#166534]">
                  {checkoutMessage}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
