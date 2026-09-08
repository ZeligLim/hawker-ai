'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Building2, ShieldAlert, ArrowLeft } from 'lucide-react';

export function OwnerGuard({ children }: { children: React.ReactNode }) {
  const { status, roles, isGuest } = useAuth();

  // If still resolving authentication or roles, render lightweight loading state
  if (status === 'loading' || roles.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] px-4 text-[#1d1d1f]">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm border border-black/5">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1d1d1f] border-t-transparent" />
          <p className="text-sm font-medium text-[#6e6e73]">Verifying shop owner credentials...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or in guest mode
  if (status === 'unauthenticated' || isGuest) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] px-4 text-[#1d1d1f]">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-lg border border-black/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">Shop Owner Access</h2>
          <p className="mt-2 text-sm text-[#6e6e73]">
            This portal is reserved for hawker centre operators and food hall business owners.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={'/auth?redirect=/shop-owner/booths' as any}
              className="w-full rounded-2xl bg-[#1d1d1f] py-3 text-sm font-semibold text-white shadow-sm hover:bg-black transition"
            >
              Sign In to Business Portal
            </Link>
            <Link
              href={'/apply' as any}
              className="w-full rounded-2xl bg-[#f5f5f7] py-3 text-sm font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition"
            >
              Register Your Hawker Centre
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated, but not registered as a shop owner
  if (!roles.hasShopOwner) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] px-4 text-[#1d1d1f]">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-lg border border-black/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">Register Your Shop</h2>
          <p className="mt-2 text-sm text-[#6e6e73]">
            You do not currently have a registered hawker shop. Register your food hall or hawker centre to unlock multi-stall management, stall invites, and financial analytics.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={'/apply' as any}
              className="w-full rounded-2xl bg-[#1d1d1f] py-3 text-sm font-semibold text-white shadow-sm hover:bg-black transition"
            >
              Start Free: Register Your Shop
            </Link>
            <Link
              href={'/home' as any}
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#f5f5f7] py-3 text-sm font-medium text-[#1d1d1f] hover:bg-[#e8e8ed] transition"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Customer App
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
