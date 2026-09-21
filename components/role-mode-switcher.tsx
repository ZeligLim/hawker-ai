'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Building2, UserRound, UtensilsCrossed, ShieldCheck } from 'lucide-react';

interface RoleModeSwitcherProps {
 currentMode: 'customer' | 'booth' | 'shop_owner';
}

export function RoleModeSwitcher({ currentMode }: RoleModeSwitcherProps) {
 const { roles, switchMode } = useAuth();

 if (roles.isLoading) {
 return null;
 }

 // If user only has Customer mode (neither shop owner nor booth owner nor platform admin)
 if (!roles.hasShopOwner && !roles.hasBooth && !roles.isSuperAdmin && !roles.isSaasOwner) {
 return (
 <div className="rounded-[24px] bg-[#f5f5f7] p-4 sm:p-5 text-xs text-[#6e6e73] .04]">
 <div className="flex items-center gap-2 font-semibold text-[#1d1d1f]">
 <UserRound className="w-4 h-4 text-[#0071e3] shrink-0" />
 <span>Standard Diner Account</span>
 </div>
 <p className="mt-1.5 leading-relaxed text-[#6e6e73]">
 You are currently in Diner mode. Food hall management and stall kitchen access are strictly role-gated.
 </p>
 <div className="mt-3.5 pt-3 .06] flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
 <Link
 href="/apply"
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
 return (
 <div className="rounded-[26px] bg-white p-4 sm:p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)] .04]">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
 {/* 1. Customer / Diner Mode (Always present) */}
 <button
 type="button"
 onClick={() => switchMode('customer')}
 className={`flex min-w-0 items-center gap-3 p-3 sm:p-3.5 rounded-[18px] text-left ${
 currentMode === 'customer'
 ? 'bg-[#111827] text-white shadow-sm ]'
 : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/[0.05]'
 }`}
 >
 <div
 className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
 currentMode === 'customer' ? 'bg-white/15 text-white' : 'bg-white text-[#1d1d1f] shadow-xs'
 }`}
 >
 <UserRound className="w-4 h-4" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-semibold truncate">Diner App</p>
 <p className={`text-[10px] truncate ${currentMode === 'customer' ? 'text-white/70' : 'text-[#86868b]'}`}>
 Browse & Order
 </p>
 </div>
 </button>

 {/* 2. Booth / Stall Kitchen Mode (Only visible if redeemed invite) */}
 {roles.hasBooth && (
 <button
 type="button"
 onClick={() => switchMode('booth')}
 className={`flex min-w-0 items-center gap-3 p-3 sm:p-3.5 rounded-[18px] text-left ${
 currentMode === 'booth'
 ? 'bg-[#111827] text-white shadow-sm ]'
 : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/[0.05]'
 }`}
 >
 <div
 className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
 currentMode === 'booth' ? 'bg-white/15 text-white' : 'bg-white text-[#1d1d1f] shadow-xs'
 }`}
 >
 <UtensilsCrossed className="w-4 h-4" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-semibold truncate">Stall Kitchen</p>
 <p className={`text-[10px] truncate ${currentMode === 'booth' ? 'text-white/70' : 'text-[#86868b]'}`}>
 {roles.booths?.[0]?.name || 'Live Tickets'}
 </p>
 </div>
 </button>
 )}

 {/* 3. Shop Owner Mode (Only visible if applied from landing page) */}
 {roles.hasShopOwner && (
 <button
 type="button"
 onClick={() => switchMode('shop_owner')}
 className={`flex min-w-0 items-center gap-3 p-3 sm:p-3.5 rounded-[18px] text-left ${
 currentMode === 'shop_owner'
 ? 'bg-[#111827] text-white shadow-sm ]'
 : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/[0.05]'
 }`}
 >
 <div
 className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
 currentMode === 'shop_owner' ? 'bg-white/15 text-white' : 'bg-white text-[#1d1d1f] shadow-xs'
 }`}
 >
 <Building2 className="w-4 h-4" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-semibold truncate">Food Hall</p>
 <p
 className={`text-[10px] truncate ${
 currentMode === 'shop_owner' ? 'text-white/70' : 'text-[#86868b]'
 }`}
 >
 {roles.shops?.[0]?.name || 'Venue Operator'}
 </p>
 </div>
 </button>
 )}

 {/* 4. SaaS Superadmin Mode (Strictly for superadmin / saas_owner) */}
 {(roles.isSuperAdmin || roles.isSaasOwner) && (
 <Link
 href={'/admin' as any}
 className="flex min-w-0 items-center gap-3 p-3 sm:p-3.5 rounded-[18px] text-left bg-amber-500/10 text-amber-950 hover:bg-amber-500/20"
 >
 <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-500 text-slate-950 shadow-xs">
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
