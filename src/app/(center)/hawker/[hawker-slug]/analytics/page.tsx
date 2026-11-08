'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, ChevronLeft, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { authenticatedFetch } from '@/lib/supabase/client';
import { HawkerCalendar, type HawkerShop } from '@/components/hawker/hawker-calendar';

export default function HawkerAnalyticsPage() {
  const params = useParams<{ 'hawker-slug': string; hawkerSlug?: string }>();
  const router = useRouter();
  const rawSlug = params['hawker-slug'] || params.hawkerSlug || '';
  const hawkerSlug = decodeURIComponent(rawSlug).trim().toLowerCase();

  const { status, roles } = useAuth();
  const [shops, setShops] = useState<HawkerShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadShops = useCallback(async () => {
    try {
      const res = await authenticatedFetch('/api/owner/shops');
      if (res.ok) {
        const payload = await res.json();
        const loadedShops = (payload.shops || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          slug: s.slug || null,
          address: s.address || null,
          role: s.role || 'owner',
          isActive: s.isActive ?? true,
          booths: (s.booths || []).map((b: any) => ({
            id: b.id,
            name: b.name,
            isOpen: b.isOpen ?? true,
            isActive: b.isActive ?? true,
          })),
        }));
        setShops(loadedShops);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (active) {
        if (status === 'authenticated') {
          void loadShops();
        } else if (status === 'unauthenticated') {
          setIsLoading(false);
        }
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [status, loadShops]);

  // Loading skeleton matching stall app view
  if (status === 'loading' || roles.isLoading || isLoading) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 pt-5 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-14 animate-pulse rounded-2xl bg-white" />
          <div className="h-[420px] animate-pulse rounded-[24px] bg-white" />
        </div>
      </main>
    );
  }

  // Find matching shop by slug or ID
  const shop = shops.find((s) => {
    const sSlug = (s.slug || '').toLowerCase();
    const sId = (s.id || '').toLowerCase();
    return sSlug === hawkerSlug || sId === hawkerSlug;
  });

  if (!shop) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 pt-12 text-center text-sm text-[#6e6e73]">
        <div className="mx-auto max-w-md rounded-[24px] bg-white p-8">
          <Building2 className="mx-auto h-10 w-10 text-[#86868b] opacity-60 mb-3" />
          <h2 className="text-lg font-bold text-[#1d1d1f]">Hawker Centre Not Found</h2>
          <p className="mt-1 text-xs text-[#6e6e73]">
            No managed food centre matches &ldquo;{rawSlug}&rdquo; under your operator account.
          </p>

          {shops.length > 0 ? (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold text-[#86868b]">Select from your managed venues:</p>
              {shops.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => router.push(`/hawker/${encodeURIComponent(s.slug || s.id)}/analytics` as any)}
                  className="w-full flex items-center justify-between rounded-xl bg-[#f5f5f7] p-3 text-xs font-semibold text-[#1d1d1f] hover:bg-black/5"
                >
                  <span>{s.name}</span>
                  <span className="text-[#86868b]">{s.booths.length} stalls &rarr;</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/shop-owner/profile"
                className="rounded-full bg-[#111827] px-4 py-2 text-xs font-semibold text-white"
              >
                Go to Venue Profile
              </Link>
            </div>
          )}
        </div>
      </main>
    );
  }

  return <HawkerCalendar key={shop.id} shop={shop} availableShops={shops} />;
}
