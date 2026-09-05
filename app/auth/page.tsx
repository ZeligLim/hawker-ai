'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';

export default function AuthPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, signUpWithEmail, continueAsGuest } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
        router.replace('/');
        return;
      }

      await signUpWithEmail(email.trim(), password);
      setSuccess('Account created. Please check your inbox to confirm the email before signing in.');
      setMode('signin');
      setPassword('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to continue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
    } catch (googleError) {
      setError(googleError instanceof Error ? googleError.message : 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-8 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px]">
        <div className="rounded-[32px] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-[-0.06em] text-[#1d1d1f]">Hawker AI</h1>
            <p className="mt-2 text-sm text-[#6e6e73]">Discover hawker favourites with a faster table-side order flow.</p>
          </div>

          <button
            type="button"
            onClick={() => void handleGoogleSignIn()}
            disabled={isGoogleLoading || isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-medium text-[#1d1d1f] shadow-[0_8px_18px_rgba(15,23,42,0.03)] transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGoogleLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => void continueAsGuest()}
            disabled={isGoogleLoading || isSubmitting}
            className="mt-3 flex w-full items-center justify-center rounded-full border border-[#dfe1e6] bg-[#f5f5f7] px-4 py-3 text-sm font-medium text-[#1d1d1f] transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue as guest
          </button>

          <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6e6e73]">
            <div className="h-px flex-1 bg-[#e5e7eb]" />
            or
            <div className="h-px flex-1 bg-[#e5e7eb]" />
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#1d1d1f]">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-[18px] bg-[#f5f5f7] px-3 py-3 ring-1 ring-transparent focus-within:ring-[#cbd5e1]">
                <Mail className="h-4 w-4 text-[#6e6e73]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#6e6e73] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#1d1d1f]">
                Password
              </label>
              <div className="flex items-center gap-2 rounded-[18px] bg-[#f5f5f7] px-3 py-3 ring-1 ring-transparent focus-within:ring-[#cbd5e1]">
                <LockKeyhole className="h-4 w-4 text-[#6e6e73]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full bg-transparent text-sm text-[#1d1d1f] placeholder:text-[#6e6e73] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link href={'/auth/forgot-password' as any} className="text-sm font-medium text-[#3c3c43] underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>

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
              disabled={isSubmitting || isGoogleLoading}
              className="flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(17,24,39,0.18)] transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[#6e6e73]">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode((current) => (current === 'signin' ? 'signup' : 'signin'));
                setError('');
                setSuccess('');
              }}
              className="font-semibold text-[#1d1d1f] underline-offset-4 hover:underline"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
