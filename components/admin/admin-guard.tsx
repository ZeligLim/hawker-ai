'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { ShieldAlert, ArrowLeft, LogIn, Lock } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { status, roles, user, isGuest } = useAuth();

  // 1. Loading state: resolving authentication and platform RBAC
  if (status === 'loading' || roles.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] px-4 text-white">
        <div className="flex items-center gap-3.5 rounded-2xl bg-[#111827] px-6 py-5 shadow-2xl border border-white/10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="text-sm font-medium text-slate-300">
            Verifying SaaS Superadmin credentials…
          </p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated or guest mode: prompt to sign in
  if (status === 'unauthenticated' || isGuest) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] px-4 text-white">
        <div className="max-w-md w-full rounded-3xl bg-[#111827] p-8 text-center shadow-2xl border border-white/10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
            SaaS Platform Admin
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            This control plane is restricted strictly to platform owners and SaaS superadmins.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={'/auth?redirect=/admin' as any}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-semibold text-slate-950 shadow-md hover:bg-amber-400 transition"
            >
              <LogIn className="h-4 w-4" /> Sign In as Superadmin
            </Link>
            <Link
              href={'/home' as any}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/5 py-3.5 text-sm font-medium text-slate-300 hover:bg-white/10 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Return to Diner App
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated, but lacking platform admin credentials (403 Forbidden)
  const isAuthorized = roles.isSuperAdmin || roles.isSaasOwner;
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#090d16] px-4 text-white">
        <div className="max-w-lg w-full rounded-3xl bg-[#111827] p-8 text-center shadow-2xl border border-red-500/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <span className="mt-4 inline-block rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/20">
            403 Forbidden
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
            SaaS Superadmin Access Required
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Your account <strong className="text-white font-mono">{user?.email ?? 'Unknown'}</strong> does not have platform administrative privileges to access this control plane or modify monetization settings.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            To gain access, ensure your email is added to <code className="text-slate-400">SUPERADMIN_EMAILS</code> or assigned a role in the <code className="text-slate-400">platform_roles</code> database table.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href={'/home' as any}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 text-sm font-medium text-slate-200 hover:bg-white/15 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Diner App
            </Link>
            {roles.hasShopOwner && (
              <Link
                href={'/shop-owner/booths' as any}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 text-sm font-medium text-slate-200 hover:bg-white/15 transition"
              >
                Food Hall Portal
              </Link>
            )}
            <Link
              href={'/auth?redirect=/admin' as any}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition"
            >
              Switch Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Superadmin
  return <>{children}</>;
}
