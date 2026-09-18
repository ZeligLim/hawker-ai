'use client';

import { LogOut, Store } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { RoleModeSwitcher } from '@/components/role-mode-switcher';

export default function OwnerProfilePage() {
  const { profile, signOut, roles } = useAuth();
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  const primaryStall = roles.booths?.[0]?.name ?? 'Assigned Stall';

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[760px]">
        <header className="flex items-center gap-3">
          <div>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em]">Stall Profile</h1>
          </div>
        </header>

        <section className="mt-6 rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-lg font-semibold text-white">
              {profile?.displayName?.slice(0, 1).toUpperCase() ?? 'H'}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{profile?.displayName ?? 'Stall Operator'}</h2>
              <p className="mt-1 text-sm text-[#6e6e73]">{profile?.email}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-[18px] bg-[#f5f5f7] p-4">
            <Store className="h-5 w-5 text-[#0071e3]" />
            <div>
              <p className="text-sm font-semibold">Your Stall Kitchen</p>
              <p className="mt-1 text-xs text-[#6e6e73] font-medium">{primaryStall}</p>
            </div>
          </div>

          <div className="mt-4">
            <RoleModeSwitcher currentMode="booth" />
          </div>

          <button
            type="button"
            onClick={() => setIsSignOutDialogOpen(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white hover:bg-black transition-all"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </section>

        {isSignOutDialogOpen ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4" role="presentation">
            <div role="dialog" aria-modal="true" aria-labelledby="owner-sign-out-title" className="w-full max-w-[360px] rounded-[24px] bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
              <h2 id="owner-sign-out-title" className="text-xl font-semibold tracking-[-0.04em]">Sign out?</h2>
              <p className="mt-2 text-sm text-[#6e6e73]">You can sign in again anytime to manage your stall.</p>
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => setIsSignOutDialogOpen(false)} className="flex-1 rounded-full bg-[#f5f5f7] px-4 py-3 text-sm font-semibold text-[#1d1d1f]">
                  Cancel
                </button>
                <button type="button" onClick={() => void signOut()} className="flex-1 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
