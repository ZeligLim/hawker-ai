'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Store, UtensilsCrossed, UserRound, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';

interface RoleModeSwitcherProps {
  currentMode: 'customer' | 'booth' | 'shop_owner';
}

export function RoleModeSwitcher({ currentMode }: RoleModeSwitcherProps) {
  const { roles, switchMode } = useAuth();

  if (roles.isLoading) {
    return null;
  }

  // If user only has Customer mode (neither shop owner nor booth owner)
  if (!roles.hasShopOwner && !roles.hasBooth) {
    return (
      <div className="rounded-[24px] bg-[#f5f5f7] p-5 text-xs text-[#6e6e73] border border-black/[0.04]">
        <div className="flex items-center gap-2 font-semibold text-[#1d1d1f]">
          <UserRound className="w-4 h-4 text-[#0071e3]" />
          <span>Standard Diner Account</span>
        </div>
        <p className="mt-1.5 leading-relaxed text-[#6e6e73]">
          You are currently in Diner mode. Food hall management and stall kitchen access are strictly role-gated.
        </p>
        <div className="mt-3.5 pt-3 border-t border-black/[0.06] flex flex-wrap items-center gap-3">
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-1 font-semibold text-[#0071e3] hover:underline"
          >
            Register a Food Hall &rsaquo;
          </Link>
          <span className="text-black/20">&bull;</span>
          <span className="text-[#86868b]">
            Stall access is invite-only via operator token
          </span>
        </div>
      </div>
    );
  }

  // User has authorized operator or stall roles!
  return (
    <div className="rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)] border border-black/[0.04]">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
            Switch Active Mode
          </p>
          <p className="text-xs text-[#6e6e73] mt-0.5">
            Switch between ordering as a diner, cooking at your stall, or managing your venue.
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3]">
          {roles.hasShopOwner && roles.hasBooth
            ? 'Multi-Role'
            : roles.hasShopOwner
              ? 'Food Hall Owner'
              : 'Stall Vendor'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* 1. Customer / Diner Mode (Always present) */}
        <button
          type="button"
          onClick={() => switchMode('customer')}
          className={`flex items-center gap-3 p-3.5 rounded-[18px] text-left transition-all ${
            currentMode === 'customer'
              ? 'bg-[#111827] text-white shadow-sm ring-2 ring-[#111827]'
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
          <div className="min-w-0">
            <p className="text-xs font-semibold">Diner App</p>
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
            className={`flex items-center gap-3 p-3.5 rounded-[18px] text-left transition-all ${
              currentMode === 'booth'
                ? 'bg-[#111827] text-white shadow-sm ring-2 ring-[#111827]'
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
            <div className="min-w-0">
              <p className="text-xs font-semibold">Stall Kitchen</p>
              <p className={`text-[10px] truncate ${currentMode === 'booth' ? 'text-white/70' : 'text-[#86868b]'}`}>
                {roles.booths?.[0]?.name || 'Manage Woks'}
              </p>
            </div>
          </button>
        )}

        {/* 3. Shop Owner Mode (Only visible if applied from landing page) */}
        {roles.hasShopOwner && (
          <button
            type="button"
            onClick={() => switchMode('shop_owner')}
            className={`flex items-center gap-3 p-3.5 rounded-[18px] text-left transition-all ${
              currentMode === 'shop_owner'
                ? 'bg-[#111827] text-white shadow-sm ring-2 ring-[#111827]'
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
            <div className="min-w-0">
              <p className="text-xs font-semibold">Food Hall</p>
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
      </div>
    </div>
  );
}
