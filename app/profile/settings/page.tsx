'use client';

import Link from 'next/link';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';

export default function ProfileSettingsPage() {
  const { status, profile, isGuest, updatePassword, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setName(profile?.displayName ?? ''));
  }, [profile?.displayName]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setIsSaving(true);

    try {
      if (name.trim() && name.trim() !== profile?.displayName) {
        await updateProfile(name);
      }
      if (password) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }
        await updatePassword(password);
      }
      setPassword('');
      setMessage('Settings updated.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update settings.');
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
            <h1 className="text-2xl font-semibold tracking-[-0.05em]">Sign in to edit settings</h1>
            <Link href="/auth" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
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
        <Link href="/profile" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Back to profile">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <section className="mt-5 rounded-[26px] bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
          <h1 className="text-3xl font-semibold tracking-[-0.06em]">Settings</h1>
          <p className="mt-2 text-sm text-[#6e6e73]">Update your account details.</p>
          <form onSubmit={(event) => void handleSubmit(event)} className="mt-5">
            <label className="block text-sm font-medium">
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#cbd5e1]" />
            </label>
            <label className="mt-4 block text-sm font-medium">
              New password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Leave blank to keep current password" className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#cbd5e1]" />
            </label>
            {error ? <p className="mt-3 text-sm text-[#9f1239]">{error}</p> : null}
            {message ? <p className="mt-3 text-sm text-[#166534]">{message}</p> : null}
            <button type="submit" disabled={isSaving} className="mt-5 flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Save settings'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
