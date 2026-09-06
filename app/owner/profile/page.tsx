'use client';

import Link from 'next/link';
import { LogOut, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';

export default function OwnerProfilePage() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [isOwnerMode, setIsOwnerMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem('hawker-user-mode') !== 'customer';
  });
  const [isShopOwnerMode, setIsShopOwnerMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('hawker-shop-owner-mode') === 'true';
  });
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  const handleModeChange = (ownerMode: boolean) => {
    setIsOwnerMode(ownerMode);
    window.localStorage.setItem('hawker-user-mode', ownerMode ? 'owner' : 'customer');
    if (!ownerMode) {
      router.push('/' as any);
    }
  };

  const handleShopOwnerToggle = (open: boolean) => {
    setIsShopOwnerMode(open);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hawker-shop-owner-mode', open ? 'true' : 'false');
    }
    if (open) {
      router.push('/shop-owner' as any);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[760px]">
        <header className="flex items-center gap-3">
          <div>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.06em]">Profile</h1>
          </div>
        </header>

        <section className="mt-6 rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111827] text-lg font-semibold text-white">
              {profile?.displayName?.slice(0, 1).toUpperCase() ?? 'H'}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{profile?.displayName ?? 'Hawker owner'}</h2>
              <p className="mt-1 text-sm text-[#6e6e73]">{profile?.email}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-[18px] bg-[#f5f5f7] p-4">
            <Store className="h-5 w-5 text-[#6e6e73]" />
            <div>
              <p className="text-sm font-semibold">Your stall</p>
              <p className="mt-1 text-xs text-[#6e6e73]">Ah Seng Chicken Rice</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-[18px] bg-[#f5f5f7] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Hawker owner mode</p>
              <p className="mt-1 text-xs text-[#6e6e73]">Switch between managing and ordering</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isOwnerMode}
              onClick={() => handleModeChange(!isOwnerMode)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${isOwnerMode ? 'bg-[#111827]' : 'bg-[#d1d5db]'}`}
              aria-label="Toggle hawker owner mode"
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${isOwnerMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-[18px] bg-[#f5f5f7] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Shop owner app</p>
              <p className="mt-1 text-xs text-[#6e6e73]">Open the multi-booth management dashboard</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isShopOwnerMode}
              onClick={() => handleShopOwnerToggle(!isShopOwnerMode)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${isShopOwnerMode ? 'bg-[#111827]' : 'bg-[#d1d5db]'}`}
              aria-label="Toggle shop owner app"
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${isShopOwnerMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <button type="button" onClick={() => setIsSignOutDialogOpen(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
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
