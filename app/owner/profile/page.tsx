'use client';

import Link from 'next/link';
import { ArrowLeft, LogOut, Store } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export default function OwnerProfilePage() {
  const { profile, signOut } = useAuth();

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[760px]">
        <header className="flex items-center gap-3">
          <Link href="/owner" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Back to owner dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">Owner app</p>
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
          <Link href="/profile" className="mt-4 flex w-full items-center justify-center rounded-full bg-[#f5f5f7] px-4 py-3 text-sm font-semibold">
            Switch to customer app
          </Link>
          <button type="button" onClick={() => void signOut()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </section>
      </div>
    </main>
  );
}
