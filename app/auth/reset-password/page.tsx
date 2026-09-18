'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatFriendlyAuthError, useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let recoverySubscription: { unsubscribe: () => void } | null = null;

    const verifyResetLink = async () => {
      if (!supabase) {
        setError('Supabase is not configured. Please add your credentials.');
        setIsChecking(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const hashType = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('type');

      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
          setIsRecoverySession(true);
        } catch (exchangeFailure) {
          setError(formatFriendlyAuthError(exchangeFailure));
        }
      }

      const { data } = await supabase.auth.getSession();
      if (hashType === 'recovery') {
        setIsRecoverySession(true);
      } else if (!data.session) {
        setError('This reset link is invalid or has expired. Please request a new one.');
      }

      const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') setIsRecoverySession(true);
      });
      recoverySubscription = authListener.subscription;

      setIsChecking(false);
    };

    void verifyResetLink();
    return () => recoverySubscription?.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!password.trim() || password.length < 8) {
      setError('Please choose a password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePassword(password);
      setSuccess('Password updated. Redirecting you back to the app...');
      setTimeout(() => router.replace('/profile' as any), 1200);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to update your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-8 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px]">
        <div className="rounded-[32px] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#1d1d1f] text-lg font-semibold text-white">
              H
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs font-semibold text-[#86868b]">Reset password</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Create a new password</h1>
          </div>

          {isChecking ? (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#6e6e73]">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Verifying your reset link...
            </div>
          ) : isRecoverySession ? (
            <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#1d1d1f]">
                  New password
                </label>
                <input
                  id="new-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="w-full rounded-[18px] bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#6e6e73] outline-none ring-1 ring-transparent focus:ring-[#cbd5e1]"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-[#1d1d1f]">
                  Confirm new password
                </label>
                <input
                  id="confirm-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-[18px] bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f] outline-none ring-1 ring-transparent focus:ring-[#cbd5e1]"
                />
              </div>
              <button type="button" onClick={() => setShowPasswords((visible) => !visible)} className="inline-flex items-center gap-2 text-xs font-medium text-[#6e6e73]">
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPasswords ? 'Hide passwords' : 'Show passwords'}
              </button>

              {error ? (
                <div className="rounded-[18px] border border-[#fecaca] bg-[#fff1f2] px-3 py-2 text-sm text-[#9f1239]">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-[18px] border border-[#bbf7d0] bg-[#ecfdf5] px-3 py-2 text-sm text-[#166534]">
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(17,24,39,0.18)] transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Update password'}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-[18px] border border-[#fecaca] bg-[#fff1f2] px-3 py-3 text-sm text-[#9f1239]">
              This reset link is invalid or has expired. Please request a new one.
            </div>
          )}

          {!error && !isChecking && isRecoverySession ? (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#166534]">
              <ShieldCheck className="h-4 w-4" />
              Secure reset flow is ready.
            </div>
          ) : null}

          <div className="mt-5 text-center text-sm text-[#6e6e73]">
            <Link href={'/auth' as any} className="font-medium text-[#1d1d1f] underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
