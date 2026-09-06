'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';

export default function JoinBoothPage() {
  const router = useRouter();
  const { status } = useAuth();
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token.trim()) {
      setMessage('Please enter a booth invitation token.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/owner/booths/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; status?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to join the booth.');
      }

      setMessage(payload.status === 'already-member' ? 'You are already a member of this booth.' : 'Booth access granted. Redirecting…');
      window.setTimeout(() => {
        router.push('/owner');
      }, 900);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to join the booth.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 py-6 text-[#1d1d1f]">
        <div className="mx-auto max-w-[480px] rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <p className="text-sm text-[#6e6e73]">Checking your account…</p>
        </div>
      </main>
    );
  }

  if (status !== 'authenticated') {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 py-6 text-[#1d1d1f]">
        <div className="mx-auto max-w-[480px] rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <h1 className="text-3xl font-semibold tracking-[-0.06em]">Join a booth</h1>
          <p className="mt-3 text-sm text-[#6e6e73]">Sign in to redeem a booth invite and access the booth owner dashboard.</p>
          <Link href="/auth?redirect=/booths/join" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-medium text-white">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-6 text-[#1d1d1f]">
      <div className="mx-auto max-w-[480px] rounded-[26px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">Booth access</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Join a booth</h1>
        <p className="mt-3 text-sm text-[#6e6e73]">Enter the invitation token sent by a shop owner.</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-medium">
            Invitation token
            <input
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="X7K9-PQ2M"
              className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 outline-none ring-1 ring-transparent focus:ring-[#cbd5e1]"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? 'Joining…' : 'Join booth'}
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-[16px] bg-[#f5f5f7] px-3 py-3 text-sm text-[#1d1d1f]">{message}</p>
        ) : null}
      </div>
    </main>
  );
}
