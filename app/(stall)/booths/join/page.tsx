'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Store, KeyRound, ArrowRight, LoaderCircle, CheckCircle2, Building2, AlertCircle } from 'lucide-react';
import { authenticatedFetch } from '@/lib/supabase/client';

function extractTokenString(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes('token=')) {
    const match = trimmed.match(/token=([^&]+)/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]).trim();
    }
  }
  return trimmed;
}

function JoinBoothContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, profile } = useAuth();
  const initialToken = searchParams.get('token') ?? '';
  const [token, setToken] = useState(() => extractTokenString(initialToken));
  const [stallName, setStallName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [invitationPreview, setInvitationPreview] = useState<{
    valid?: boolean;
    venueName?: string;
    boothName?: string;
    invitedEmail?: string;
    error?: string;
  } | null>(null);

  // Fetch token details for instant preview
  useEffect(() => {
    const cleanToken = extractTokenString(token);
    if (!cleanToken) return;

    let isMounted = true;
    fetch(`/api/owner/booths/join?token=${encodeURIComponent(cleanToken)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data && typeof data === 'object') {
          setInvitationPreview(data);
          if (data.boothName) {
            setStallName((current) => current || data.boothName);
          }
        }
      })
      .catch(() => {
        if (isMounted) setInvitationPreview(null);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanToken = extractTokenString(token);
    if (!cleanToken) {
      setMessage('Please enter your booth invitation token or paste your setup link.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await authenticatedFetch('/api/owner/booths/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: cleanToken,
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
          <p className="text-xs font-semibold text-[#0071e3]">Vendor invitation</p>
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
            Sign in to claim stall
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    );
  }

  const userEmail = profile?.email?.toLowerCase().trim() ?? '';
  const invitedEmail = invitationPreview?.invitedEmail?.toLowerCase().trim() ?? '';
  const emailMismatch = invitedEmail && userEmail && invitedEmail !== userEmail;

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-12 text-[#1d1d1f] flex items-center justify-center">
      <div className="w-full max-w-[480px] rounded-[32px] bg-white p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.04)] border border-black/[0.06]">
        <div className="w-10 h-10 rounded-2xl bg-[#30d158]/10 text-[#30d158] flex items-center justify-center mb-4">
          <KeyRound className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-[#248a3d]">Invite-only access</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">
          Join your food stall
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
          Signed in as <strong className="text-[#1d1d1f]">{profile?.displayName || profile?.email}</strong>. Enter your invitation token and name your stall to activate.
        </p>

        {invitationPreview?.valid && (
          <div className="mt-4 rounded-2xl bg-[#0071e3]/5 border border-[#0071e3]/15 p-3.5 text-xs">
            <div className="flex items-center gap-2 text-[#0071e3] font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>{invitationPreview.venueName || 'Food Hall'} &bull; {invitationPreview.boothName || 'Stall Slot'}</span>
            </div>
            {invitationPreview.invitedEmail && (
              <p className="mt-1 text-[11px] text-[#6e6e73]">
                Assigned to: <strong className="text-[#1d1d1f]">{invitationPreview.invitedEmail}</strong>
              </p>
            )}
          </div>
        )}

        {emailMismatch && (
          <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Email mismatch</p>
              <p className="mt-0.5 text-[11px] text-amber-800 leading-relaxed">
                This setup link was sent specifically to <strong>{invitationPreview?.invitedEmail}</strong>. You are currently signed in as <strong>{profile?.email}</strong>. Please sign in with the invited email to claim this stall.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
              Booth Invitation Token or Setup Link
            </label>
            <input
              type="text"
              value={token}
              onChange={(event) => {
                const next = extractTokenString(event.target.value);
                setToken(next);
                if (!next) setInvitationPreview(null);
              }}
              placeholder="Paste token or link"
              className="w-full h-[46px] rounded-2xl border border-black/10 bg-white px-4 text-sm font-mono tracking-wide text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all placeholder:font-sans placeholder:normal-case placeholder:text-[#86868b]"
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
