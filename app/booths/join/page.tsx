'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Store, KeyRound, ArrowRight, LoaderCircle, CheckCircle2 } from 'lucide-react';

function JoinBoothContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, profile } = useAuth();
  const [token, setToken] = useState(() => searchParams.get('token') ?? '');
  const [stallName, setStallName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token.trim()) {
      setMessage('Please enter your booth invitation token.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/owner/booths/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          stallName: stallName.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; status?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to join the booth.');
      }

      setIsSuccess(true);
      setMessage(
        payload.status === 'already-member'
          ? 'You are already an authorized vendor for this booth. Redirecting to Kitchen Display…'
          : 'Stall registered successfully! Redirecting to your Kitchen Display…'
      );

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hawker-active-mode', 'booth');
        window.localStorage.setItem('hawker-user-mode', 'owner');
      }

      window.setTimeout(() => {
        router.push('/owner');
      }, 1000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to join the booth.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 py-12 flex items-center justify-center text-[#1d1d1f]">
        <div className="flex items-center gap-2.5 text-xs text-[#86868b]">
          <LoaderCircle className="w-4 h-4 animate-spin text-[#0071e3]" />
          <span>Validating stall credentials…</span>
        </div>
      </main>
    );
  }

  if (status !== 'authenticated') {
    const redirectUrl = `/booths/join${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 py-12 text-[#1d1d1f] flex items-center justify-center">
        <div className="w-full max-w-[480px] rounded-[32px] bg-white p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.04)] border border-black/[0.06]">
          <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center mb-4">
            <Store className="w-5 h-5" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0071e3]">Vendor Invitation</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
            Activate your stall kitchen
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
            You have received an invite to join a food hall. Sign in or create your stall account to redeem this invitation key and access your live Kitchen Display System (KDS).
          </p>
          <Link
            href={`/auth?redirect=${encodeURIComponent(redirectUrl)}` as any}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-xs font-semibold text-white hover:bg-black transition-all shadow-sm"
          >
            Sign In to Claim Stall
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-12 text-[#1d1d1f] flex items-center justify-center">
      <div className="w-full max-w-[480px] rounded-[32px] bg-white p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.04)] border border-black/[0.06]">
        <div className="w-10 h-10 rounded-2xl bg-[#30d158]/10 text-[#30d158] flex items-center justify-center mb-4">
          <KeyRound className="w-5 h-5" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#30d158]">Invite-Only Access</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
          Join your food stall
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
          Signed in as <strong className="text-[#1d1d1f]">{profile?.displayName || profile?.email}</strong>. Enter your invitation token and name your stall to activate.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
              Booth Invitation Token
            </label>
            <input
              type="text"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="e.g. HKR-8F92-KL"
              className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 text-sm font-mono tracking-wider text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all uppercase placeholder:font-sans placeholder:normal-case placeholder:text-[#86868b]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
              Your Stall / Brand Name
            </label>
            <input
              type="text"
              value={stallName}
              onChange={(event) => setStallName(event.target.value)}
              placeholder="e.g. Ah Fatt Hainanese Chicken Rice"
              className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 text-sm text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all placeholder:text-[#86868b]"
            />
            <p className="mt-1 text-[11px] text-[#86868b]">
              This is the brand name diners will see on the food court digital menu.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full h-[46px] mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#111827] px-5 py-3 text-xs font-semibold text-white hover:bg-black transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                Validating Token…
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
                Connected!
              </>
            ) : (
              <>
                Redeem Token & Launch Kitchen
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 rounded-2xl p-3.5 text-xs font-medium ${
              isSuccess ? 'bg-[#30d158]/10 text-[#248a3d] border border-[#30d158]/20' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </main>
  );
}

export default function JoinBoothPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f5f7] px-4 py-12 flex items-center justify-center text-[#1d1d1f]">
          <div className="flex items-center gap-2.5 text-xs text-[#86868b]">
            <LoaderCircle className="w-4 h-4 animate-spin text-[#0071e3]" />
            <span>Loading invitation portal…</span>
          </div>
        </main>
      }
    >
      <JoinBoothContent />
    </Suspense>
  );
}
