'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { ShieldAlert, ArrowLeft, LogIn, Lock } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
 const { status, roles, user, isGuest, signOut } = useAuth();

 // 1. Loading state: resolving authentication and platform RBAC
 if (status === 'loading' || roles.isLoading) {
 return (
 <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] px-4 text-[#1d1d1f]">
 <div className="flex items-center gap-3.5 rounded-2xl bg-white px-6 py-5 shadow-sm .08]">
 <div className="h-4 w-4 rounded-full ] " />
 <p className="text-xs sm:text-sm font-medium text-[#6e6e73]">
 Verifying SaaS Superadmin credentials…
 </p>
 </div>
 </div>
 );
 }

 // 2. Unauthenticated or guest mode: prompt to sign in
 if (status === 'unauthenticated' || isGuest) {
 return (
 <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] px-4 text-[#1d1d1f]">
 <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-sm .08]">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.04] text-[#1d1d1f] .06]">
 <Lock className="h-6 w-6" />
 </div>
 <h2 className="mt-4 text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
 SaaS Platform Admin
 </h2>
 <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
 This control plane is restricted strictly to platform owners and SaaS superadmins.
 </p>
 <div className="mt-6 flex flex-col gap-2.5">
 <Link
 href={'/auth?redirect=/admin' as any}
 className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1d1d1f] py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-black "
 >
 <LogIn className="h-4 w-4" /> Sign In as Superadmin
 </Link>
 <Link
 href={'/home' as any}
 className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs sm:text-sm font-medium text-[#1d1d1f] hover:bg-black/[0.03] shadow-xs"
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
 <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] px-4 text-[#1d1d1f]">
 <div className="max-w-lg w-full rounded-3xl bg-white p-8 text-center shadow-sm .08]">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ">
 <ShieldAlert className="h-6 w-6" />
 </div>
 <span className="mt-4 inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 ">
 403 Forbidden
 </span>
 <h2 className="mt-3 text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#1d1d1f]">
 SaaS Superadmin Access Required
 </h2>
 <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
 Your account <strong className="text-[#1d1d1f] font-mono">{user?.email ?? 'Unknown'}</strong> does not have platform administrative privileges to access this control plane or modify monetization settings.
 </p>
 <p className="mt-2 text-[11px] text-[#86868b]">
 To gain access, ensure your email is added to <code className="text-[#1d1d1f] font-mono">SUPERADMIN_EMAILS</code> or assigned a role in the <code className="text-[#1d1d1f] font-mono">platform_roles</code> database table.
 </p>
 <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
 <Link
 href={'/home' as any}
 className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.03] shadow-xs"
 >
 <ArrowLeft className="h-3.5 w-3.5" /> Diner App
 </Link>
 {roles.hasShopOwner && (
 <Link
 href={'/shop-owner/booths' as any}
 className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white py-2.5 text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.03] shadow-xs"
 >
 Food Hall Portal
 </Link>
 )}
 <button
 onClick={async () => {
 await signOut();
 window.location.href = '/auth?redirect=/admin';
 }}
 className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1d1d1f] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-black "
 >
 Switch Account
 </button>
 </div>
 </div>
 </div>
 );
 }

 // 4. Authorized Superadmin
 return <>{children}</>;
}
