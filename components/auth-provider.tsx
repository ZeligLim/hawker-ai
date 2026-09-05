'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  profile: AuthUser | null;
  isGuest: boolean;
  continueAsGuest: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<'signed-in' | 'activation-sent'>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const publicRoutes = ['/auth', '/auth/callback', '/auth/forgot-password', '/auth/reset-password'];

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
}

function getFriendlyAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Something went wrong. Please try again.';

  const candidate = error as { message?: string; status?: number; code?: string };
  const message = candidate.message ?? '';

  if (candidate.code === 'user_already_exists' || message.toLowerCase().includes('already registered')) {
    return 'An account with this email already exists.';
  }

  if (message.toLowerCase().includes('invalid login credentials') || message.toLowerCase().includes('invalid credentials')) {
    return 'Incorrect email or password.';
  }

  if (message.toLowerCase().includes('weak password')) {
    return 'Your password is too weak. Please choose a stronger one.';
  }

  if (message.toLowerCase().includes('email not confirmed') || message.toLowerCase().includes('confirmation')) {
    return 'Please confirm your email before continuing.';
  }

  if (message.toLowerCase().includes('oauth') || message.toLowerCase().includes('provider')) {
    return 'Google sign-in could not be completed. Please try again.';
  }

  if (message.toLowerCase().includes('network')) {
    return 'A network error occurred. Please check your connection and try again.';
  }

  if (message.toLowerCase().includes('invalid or expired')) {
    return 'This reset link has expired. Please request a new one.';
  }

  if (message) {
    return message;
  }

  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('hawker-guest-mode') === 'true';
  });
  const [status, setStatus] = useState<AuthStatus>(() => (supabase ? 'loading' : 'unauthenticated'));

  useEffect(() => {
    const client = supabase;

    if (!client) {
      return;
    }

    const initializeSession = async () => {
      const { data } = await client.auth.getSession();
      setUser(data.session?.user ?? null);
      setStatus(data.session ? 'authenticated' : 'unauthenticated');
    };

    void initializeSession();

    const { data: authData } = client.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setStatus(nextUser ? 'authenticated' : 'unauthenticated');

      if (nextUser) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('hawker-guest-mode', 'false');
        }
        setIsGuest(false);
      }
    });

    return () => {
      authData.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hawker-guest-mode', String(isGuest));
    }
  }, [isGuest]);

  const effectiveStatus: AuthStatus = status === 'loading' ? 'loading' : user || isGuest ? 'authenticated' : 'unauthenticated';

  useEffect(() => {
    if (effectiveStatus === 'loading') return;

    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

    if (effectiveStatus === 'unauthenticated' && !isPublicRoute) {
      router.replace('/auth' as any);
    }

    if (effectiveStatus === 'authenticated' && user && isPublicRoute && pathname.startsWith('/auth')) {
      router.replace('/' as any);
    }
  }, [effectiveStatus, isGuest, pathname, router, user]);

  const profile = useMemo<AuthUser | null>(() => {
    if (!user || isGuest) return null;

    const rawDisplayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? null;

    return {
      id: user.id,
      email: user.email ?? null,
      displayName: rawDisplayName?.split('@')[0] ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
    };
  }, [isGuest, user]);

  const continueAsGuest = useCallback(async () => {
    setIsGuest(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hawker-guest-mode', 'true');
    }
    router.replace('/' as any);
  }, [router]);

  const signInWithGoogle = async () => {
    const client = supabase;
    if (!client) throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');

    setIsGuest(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hawker-guest-mode', 'false');
    }

    const redirectUrl = `${getAppUrl()}/auth/callback`;

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      throw new Error(getFriendlyAuthError(error));
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const client = supabase;
    if (!client) throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');

    setIsGuest(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hawker-guest-mode', 'false');
    }

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (!error) return 'signed-in';

    if (error.message.toLowerCase().includes('invalid login credentials')) {
      const { data, error: signUpError } = await client.auth.signUp({ email, password });

      if (!signUpError && data.user && (data.user.identities?.length ?? 0) > 0) {
        return 'activation-sent';
      }

      if (signUpError) {
        throw new Error(getFriendlyAuthError(signUpError));
      }
    }

    throw new Error(getFriendlyAuthError(error));
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const client = supabase;
    if (!client) throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');

    const { error } = await client.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(getFriendlyAuthError(error));
    }
  };

  const signOut = useCallback(async () => {
    if (isGuest) {
      setIsGuest(false);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hawker-guest-mode', 'false');
      }
      router.replace('/auth' as any);
      return;
    }

    const client = supabase;
    if (!client) return;

    const { error } = await client.auth.signOut();
    if (error) {
      throw new Error(getFriendlyAuthError(error));
    }

    router.replace('/auth' as any);
  }, [isGuest, router]);

  const resetPassword = async (email: string) => {
    const client = supabase;
    if (!client) throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAppUrl()}/auth/reset-password`,
    });

    if (error) {
      throw new Error(getFriendlyAuthError(error));
    }
  };

  const updatePassword = async (newPassword: string) => {
    const client = supabase;
    if (!client) throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');

    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(getFriendlyAuthError(error));
    }
  };

  const updateProfile = useCallback(async (displayName: string) => {
    const client = supabase;
    if (!client) throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');

    const trimmedName = displayName.trim();
    if (!trimmedName) throw new Error('Please enter a name.');

    const { data, error } = await client.auth.updateUser({
      data: { full_name: trimmedName, name: trimmedName },
    });

    if (error) throw new Error(getFriendlyAuthError(error));
    setUser(data.user);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const client = supabase;
    if (!client || !user?.email) throw new Error('You must be signed in to change your password.');

    const { error: verifyError } = await client.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) throw new Error('Current password is incorrect.');

    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) throw new Error(getFriendlyAuthError(error));
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: effectiveStatus,
      user,
      profile,
      isGuest,
      continueAsGuest,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      changePassword,
    }),
    [changePassword, continueAsGuest, effectiveStatus, isGuest, profile, signOut, updateProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export function formatFriendlyAuthError(error: unknown) {
  return getFriendlyAuthError(error);
}
