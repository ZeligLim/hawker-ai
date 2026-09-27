'use client';

import Link from 'next/link';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { authenticatedFetch } from '@/lib/supabase/client';
import { RoleModeSwitcher } from '@/components/role-mode-switcher';

export default function ProfileSettingsPage() {
 const router = useRouter();
 const { status, profile, isGuest, updateProfile } = useAuth();
 const [name, setName] = useState('');
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError('');
    try {
      const response = await authenticatedFetch('/api/user/delete', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }
      
      window.location.href = '/';
    } catch (e: any) {
      setError(e.message || 'Failed to delete account');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };


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
 <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f] sm:px-6">
 <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl">
 <Link href="/profile" className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white shadow-xs hover:bg-black/[0.04] " aria-label="Back to profile">
 <ArrowLeft className="h-5 w-5" />
 </Link>
 <section className="mt-5 rounded-[28px] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)] .04]">
 <h1 className="text-2xl font-bold tracking-tight">Sign in to edit settings</h1>
 <Link href="/auth?redirect=/profile/settings" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#111827] px-4 py-3 text-sm font-semibold text-white hover:bg-black ">
 Sign in
 </Link>
 </section>
 </div>
 </main>
 );
 }

 return (
 <main className="min-h-screen bg-[#f5f5f7] px-4 pb-32 pt-5 text-[#1d1d1f] sm:px-6">
 <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl">
 <Link href="/profile" className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white shadow-xs hover:bg-black/[0.04] " aria-label="Back to profile">
 <ArrowLeft className="h-5 w-5" />
 </Link>
 <section className="mt-5 rounded-[28px] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.04)] .04]">
 <h1 className="text-3xl font-semibold tracking-[-0.06em]">Settings</h1>
 <p className="mt-2 text-sm text-[#6e6e73]">Update your account details.</p>
 <form onSubmit={(event) => void handleSubmit(event)} className="mt-5">
 <label className="block text-sm font-medium">
 Name
 <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-[14px] bg-[#f5f5f7] px-3 py-3 text-sm outline-none focus: focus:]" />
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
 {isSaving ? <LoaderCircle className="h-4 w-4 " /> : 'Save settings'}
 </button>

 </form>
          <div className="mt-5 pt-5">
            <h2 className="text-sm font-semibold text-[#1d1d1f]">Danger Zone</h2>
            
            {showDeleteConfirm ? (
              <div className="mt-3 rounded-[16px] bg-[#fff1f2] p-4">
                <p className="text-sm text-[#9f1239] font-medium">Are you absolutely sure you want to delete your account? This action cannot be undone.</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex flex-1 items-center justify-center rounded-full bg-[#9f1239] px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {isDeleting ? <LoaderCircle className="h-3 w-3 animate-spin mr-1" /> : 'Yes, Delete My Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex flex-1 items-center justify-center rounded-full bg-white px-3 py-2.5 text-xs font-medium text-[#1d1d1f] shadow-sm disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-3 w-full rounded-[16px] bg-[#fff1f2] px-3 py-3 text-sm font-medium text-[#9f1239] text-left transition-colors"
              >
                Delete account
              </button>
            )}
          </div>


 </section>
 </div>
 </main>
 );
}
