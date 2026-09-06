'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="#4285F4" d="M21.35 12.2c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z" />
      <path fill="#34A853" d="M12 21.67c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.67Z" />
      <path fill="#FBBC05" d="M6.54 13.75a5.85 5.85 0 0 1 0-3.5V7.72H3.3a9.75 9.75 0 0 0 0 8.56l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.22c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.3 14.63 2.33 12 2.33a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53C7.31 7.94 9.46 6.22 12 6.22Z" />
    </svg>
  );
}

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

    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address, such as name@example.com.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const result = await signInWithEmail(email.trim(), password);
        if (result === 'activation-sent') {
          setSuccess('We sent an account activation email. Please check your inbox before signing in.');
          setPassword('');
          return;
        }
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
            {isGoogleLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
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
