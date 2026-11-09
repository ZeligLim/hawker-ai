'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Building2, UserRound, UtensilsCrossed, ShieldCheck } from 'lucide-react';

interface RoleModeSwitcherProps {
 currentMode: 'customer' | 'booth' | 'shop_owner' | 'admin';
}

export function RoleModeSwitcher({ currentMode }: RoleModeSwitcherProps) {
 const { roles, switchMode } = useAuth();

 if (roles.isLoading) {
 return null;
 }

 if (!roles.hasShopOwner && !roles.hasBooth && !roles.isSuperAdmin && !roles.isSaasOwner) {
 return (
 <div className="rounded-[24px] bg-[#f5f5f7] p-4 sm:p-5 text-xs text-[#6e6e73]">
 <div className="flex items-center gap-2 font-semibold text-[#1d1d1f]">
 <UserRound className="w-4 h-4 text-[#0071e3] shrink-0" />
 <span>Standard Diner Account</span>
 </div>
 <p className="mt-1.5 leading-relaxed text-[#6e6e73]">
 Diner menus are available by scanning a table QR code. Food hall management and stall kitchen access are role-gated.
 </p>
 <div className="mt-3.5 pt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
 <Link
 href="/shop-owner/profile"
 className="inline-flex items-center gap-1 font-semibold text-[#0071e3] hover:underline"
 >
 Start Free: Register Your Shop &rsaquo;
 </Link>
 <span className="text-black/20 hidden sm:inline">&bull;</span>
 <span className="text-[#86868b]">
 Stall access is invite-only via operator token
 </span>
 </div>
 </div>
 );
 }

 // User has authorized operator or stall roles!
 const showStallMode = roles.hasBooth && currentMode !== 'booth';
 const showShopOwnerMode = roles.hasShopOwner && currentMode !== 'shop_owner';
 const showAdminMode = (roles.isSuperAdmin || roles.isSaasOwner) && currentMode !== 'admin';

 return (
 <div className="rounded-[26px] bg-white p-4 sm:p-5 ">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
 {/* Booth / Stall Kitchen Mode (Only visible if redeemed invite) */}
 {showStallMode && (
 <button
 type="button"
 onClick={() => switchMode('booth')}
 className="flex min-w-0 items-center gap-3 rounded-[18px] bg-[#f5f5f7] p-3 text-left text-[#1d1d1f] hover:bg-black/[0.05] sm:p-3.5"
 >
 <div
 className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1d1d1f]"
 >
 <UtensilsCrossed className="w-4 h-4" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-semibold truncate">Stall Kitchen</p>
 <p className="truncate text-[10px] text-[#86868b]">
 {roles.booths?.[0]?.name || 'Live Tickets'}
 </p>
 </div>
 </button>
 )}

 {/* Shop Owner Mode (Only visible if applied from landing page) */}
 {showShopOwnerMode && (
 <button
 type="button"
 onClick={() => switchMode('shop_owner')}
 className="flex min-w-0 items-center gap-3 rounded-[18px] bg-[#f5f5f7] p-3 text-left text-[#1d1d1f] hover:bg-black/[0.05] sm:p-3.5"
 >
 <div
 className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#1d1d1f]"
 >
 <Building2 className="w-4 h-4" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-semibold truncate">Food Hall</p>
 <p
 className="truncate text-[10px] text-[#86868b]"
 >
 {roles.shops?.[0]?.name || 'Venue Operator'}
 </p>
 </div>
 </button>
 )}

 {/* SaaS Superadmin Mode (Strictly for superadmin / saas_owner) */}
 {showAdminMode && (
 <Link
 href={'/admin' as any}
 className="flex min-w-0 items-center gap-3 rounded-[18px] bg-amber-500/10 p-3 text-left text-amber-950 hover:bg-amber-500/20 sm:p-3.5"
 >
 <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-500 text-slate-950 ">
 <ShieldCheck className="w-4 h-4" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-bold text-slate-900 truncate">SaaS Admin</p>
 <p className="text-[10px] text-amber-800/80 truncate">
 Platform Control Plane
 </p>
 </div>
 </Link>
 )}
 </div>
 </div>
 );
}
