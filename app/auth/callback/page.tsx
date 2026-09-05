'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing your sign-in...');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      if (error) {
        setMessage(errorDescription ?? 'Google sign-in was cancelled or failed.');
        setTimeout(() => router.replace('/auth' as any), 1200);
        return;
      }

      if (!supabase) {
        setMessage('Supabase is not configured. Please add your credentials.');
        setTimeout(() => router.replace('/auth' as any), 1500);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setMessage(exchangeError.message || 'Unable to finish Google sign-in.');
          setTimeout(() => router.replace('/auth' as any), 1500);
          return;
        }
      }

      router.replace('/' as any);
    };

    void handleCallback();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-8 text-[#1d1d1f]">
      <div className="mx-auto flex min-h-[80vh] max-w-[420px] items-center justify-center">
        <div className="w-full rounded-[30px] bg-white p-6 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-[#1d1d1f]" />
          </div>
          <p className="mt-4 text-sm text-[#6e6e73]">{message}</p>
        </div>
      </div>
    </main>
  );
}
