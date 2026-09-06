'use client';

import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { status, isGuest, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => router.replace('/profile/settings'), 700);
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : 'Unable to change your password.');
    } finally {
      setIsSaving(false);
    }
  };

  if (status !== 'authenticated' || isGuest) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
        <div className="mx-auto max-w-[430px]">
          <Link href="/profile" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Back to profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <section className="mt-5 rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
            <h1 className="text-2xl font-semibold tracking-[-0.05em]">Sign in to change your password</h1>
            <Link href="/auth?redirect=/profile/settings/password" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
              Sign in
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 pb-28 pt-5 text-[#1d1d1f]">
      <div className="mx-auto max-w-[430px]">
        <Link href="/profile/settings" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Back to settings">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <section className="mt-5 rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <h1 className="text-3xl font-semibold tracking-[-0.06em]">Change password</h1>
          <p className="mt-2 text-sm text-[#6e6e73]">Use a strong password with at least 8 characters.</p>
          <form onSubmit={(event) => void handleSubmit(event)} className="mt-5">
            <label className="block text-sm font-medium">
              Current password
              <input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#cbd5e1]" />
            </label>
            <label className="mt-4 block text-sm font-medium">
              New password
              <input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#cbd5e1]" />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Confirm new password
              <input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#cbd5e1]" />
            </label>
            <button type="button" onClick={() => setShowPasswords((visible) => !visible)} className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#6e6e73]">
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPasswords ? 'Hide passwords' : 'Show passwords'}
            </button>
            {error ? <p className="mt-3 text-sm text-[#9f1239]">{error}</p> : null}
            {success ? <p className="mt-3 text-sm text-[#166534]">{success}</p> : null}
            <button type="submit" disabled={isSaving} className="mt-5 flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Save password'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
