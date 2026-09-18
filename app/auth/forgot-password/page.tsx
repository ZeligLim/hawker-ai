'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter the email linked to your account.');
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(email.trim());
      setSuccess('Check your email for the password reset link.');
      setTimeout(() => router.replace('/auth' as any), 1500);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to send reset link.');
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
            <p className="text-xs font-semibold text-[#86868b]">Password reset</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em]">Forgot password?</h1>
            <p className="mt-2 text-sm text-[#6e6e73]">We will send a reset link to your email.</p>
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
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
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Send reset link'}
            </button>
          </form>

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
