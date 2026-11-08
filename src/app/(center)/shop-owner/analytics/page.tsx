'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export default function ShopOwnerAnalyticsRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, roles } = useAuth();

  useEffect(() => {
    if (status === 'loading' || roles.isLoading) return;

    if (status === 'unauthenticated') {
      router.replace('/auth?redirect=%2Fshop-owner%2Fanalytics');
      return;
    }

    if (roles.shops.length > 0) {
      const primaryShop = roles.shops[0];
      const targetSlug = primaryShop.slug || primaryShop.id;
      const queryString = searchParams?.toString();
      const destination = `/hawker/${encodeURIComponent(targetSlug)}/analytics${queryString ? `?${queryString}` : ''}`;
      router.replace(destination as any);
    } else {
      router.replace('/shop-owner/profile');
    }
  }, [status, roles.isLoading, roles.shops, router, searchParams]);

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 sm:px-6 text-[#1d1d1f]">
      <div className="mx-auto max-w-7xl flex items-center justify-center min-h-[50vh] text-xs text-[#6e6e73]">
        <LoaderCircle className="h-5 w-5 mr-2 text-[#111827] animate-spin" />
        Redirecting to hawker analytics...
      </div>
    </main>
  );
}
