'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CartSummary } from '@/components/cart-summary';
import { ResultCard } from '@/components/result-card';
import { addItemToCart, buildCartSummary, removeCartItem, updateCartItemQuantity, useCartItems } from '@/lib/order/cart';
import type { SearchResult } from '@/lib/search/schema';

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsFallback />}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsFallback() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-[#e5e7eb] bg-white p-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="rounded-[24px] border border-[#e5e7eb] bg-[#fafafa] p-6 text-sm text-[#6e6e73]">
            Loading results…
          </div>
        </div>
      </div>
    </main>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cartItems, setCartItems } = useCartItems();
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const query = searchParams.get('query') ?? 'I want a vegetarian meal under RM15 with medium spice.';
  const maxPrice = searchParams.get('maxPrice') ?? '15';
  const vegetarian = searchParams.get('vegetarian') ?? 'true';
  const halal = searchParams.get('halal') ?? 'true';
  const spiceLevel = searchParams.get('spiceLevel') ?? '3';
  const limit = searchParams.get('limit') ?? '5';

  const resolvedQuery = useMemo(() => query || 'I want a vegetarian meal under RM15 with medium spice.', [query]);
  const cartSummary = useMemo(() => buildCartSummary(cartItems), [cartItems]);

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

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCartItems((currentItems) => updateCartItemQuantity(currentItems, itemId, quantity));
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((currentItems) => removeCartItem(currentItems, itemId));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutMessage(
      `Order placed for ${cartSummary.merchantGroups.length} stall${cartSummary.merchantGroups.length === 1 ? '' : 's'} · total RM ${cartSummary.total.toFixed(2)}`,
    );
    setCartItems([]);
  };

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: resolvedQuery,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            vegetarian: vegetarian === 'true' ? true : vegetarian === 'false' ? false : undefined,
            halal: halal === 'true' ? true : halal === 'false' ? false : undefined,
            spiceLevel: spiceLevel ? Number(spiceLevel) : undefined,
            limit: limit ? Number(limit) : 5,
          }),
        });

        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error ?? 'Search failed');
        setResults(payload.results ?? []);
      } catch (searchError) {
        setError(searchError instanceof Error ? searchError.message : 'Unknown search error');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [halal, limit, maxPrice, resolvedQuery, spiceLevel, vegetarian]);

  const isDark = theme === 'dark';
  const shellClasses = isDark ? 'bg-[#0a0a0d] text-[#f5f5f7]' : 'bg-[#f5f5f7] text-[#1d1d1f]';
  const cardClasses = isDark ? 'border-[#2a2b2f] bg-[#111214]' : 'border-[#e5e7eb] bg-white';
  const mutedText = isDark ? 'text-[#a1a1aa]' : 'text-[#6e6e73]';

  return (
    <main className={`${shellClasses} min-h-screen transition-colors duration-200`}>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className={`rounded-[32px] border ${cardClasses} p-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-6`}>
          <header className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111827] text-sm font-semibold text-white">
                H
              </Link>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${mutedText}`}>Search results</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${isDark ? 'border-[#2a2b2f] bg-[#17181d] text-[#f5f5f7]' : 'border-[#dfe3ea] bg-white text-[#1d1d1f]'}`}
              >
                {isDark ? 'Light mode' : 'Dark mode'}
              </button>
              <Link href="/" className={`rounded-full border px-3 py-1.5 text-sm font-medium ${isDark ? 'border-[#2a2b2f] bg-[#17181d] text-[#f5f5f7]' : 'border-[#dfe3ea] bg-[#f7f7f7] text-[#1d1d1f]'}`}>
                New search
              </Link>
            </div>
          </header>

          <div className={`rounded-[28px] border ${isDark ? 'border-[#2a2b2f] bg-[#111214]' : 'border-[#e5e7eb] bg-[#fafafa]'} p-4`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${mutedText}`}>Intent</p>
            <h1 className={`mt-2 text-2xl font-semibold tracking-[-0.05em] ${isDark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]'}`}>
              {resolvedQuery}
            </h1>
          </div>

          {loading && (
            <div className={`mt-6 rounded-[24px] border ${isDark ? 'border-[#2a2b2f] bg-[#111214]' : 'border-[#e5e7eb] bg-white'} p-6 text-sm ${mutedText}`}>
              Finding hawker matches for you…
            </div>
          )}

          {error && (
            <div className={`mt-6 rounded-[24px] border ${isDark ? 'border-[#fca5a5]/30 bg-[#2b1017] text-[#fecaca]' : 'border-[#fecaca] bg-[#fff1f2] text-[#9f1239]'} p-4 text-sm`}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_0.85fr]">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {results.length > 0 ? (
                  results.map((dish) => <ResultCard key={dish.id} dish={dish} onAddToCart={handleAddToCart} />)
                ) : (
                  <div className={`col-span-full rounded-[24px] border ${isDark ? 'border-[#2a2b2f] bg-[#111214] text-[#a1a1aa]' : 'border-dashed border-[#d9d9df] bg-[#fafafa] text-[#6e6e73]'} p-10 text-center`}>
                    No matches yet. Try a slightly broader search.
                  </div>
                )}
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
          )}

          {checkoutMessage && (
            <div className="mt-5 rounded-[22px] border border-[#bbf7d0] bg-[#ecfdf5] p-3 text-sm font-medium text-[#166534]">
              {checkoutMessage}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
