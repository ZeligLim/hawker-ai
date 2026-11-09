'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { PageLoader } from '@/components/page-loader';

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

  return <PageLoader text="Redirecting to hawker analytics" variant="analytics" />;
}
