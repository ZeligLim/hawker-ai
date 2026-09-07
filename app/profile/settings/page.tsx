'use client';

import Link from 'next/link';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { RoleModeSwitcher } from '@/components/role-mode-switcher';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { status, profile, isGuest, updateProfile } = useAuth();
  const [name, setName] = useState('');
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
      setMessage('Settings updated.');
      setTimeout(() => router.replace('/profile'), 500);
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
            <Link href="/auth?redirect=/profile/settings" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white">
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
            <Link href={'/profile/settings/password' as any} className="mt-4 flex items-center justify-between rounded-[16px] bg-[#f5f5f7] px-3 py-3 text-sm font-medium text-[#1d1d1f]">
              <span>Change password</span>
              <span aria-hidden="true">→</span>
            </Link>
            <div className="mt-5">
              <RoleModeSwitcher currentMode="customer" />
            </div>
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
