'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase, authenticatedFetch } from '@/lib/supabase/client';
import {
  clearAuthRedirect,
  resolveAuthRedirect,
  resolveSignOutDestination,
  resolveUserDestination,
  saveAuthRedirect,
} from '@/lib/auth-redirect';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export type UserRoles = {
  isCustomer: boolean;
  hasShopOwner: boolean;
  hasBooth: boolean;
  isSuperAdmin: boolean;
  isSaasOwner: boolean;
  platformRole: 'superadmin' | 'saas_owner' | 'support' | null;
  isLoading: boolean;
  shops: Array<{ id: string; name: string; role: string; isActive?: boolean; schedule?: any }>;
  booths: Array<{
    id: string;
    name: string;
    role: string;
    isOpen?: boolean;
    isActive?: boolean;
    schedule?: any;
    airwallex_account_id?: string | null;
    venueId?: string;
    venueName?: string;
    venueIsActive?: boolean;
    venueSchedule?: any;
  }>;
};

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  profile: AuthUser | null;
  isGuest: boolean;
  roles: UserRoles;
  refreshRoles: () => Promise<void>;
  switchMode: (mode: 'customer' | 'booth' | 'shop_owner') => void;
  continueAsGuest: (customRedirect?: string) => Promise<void>;
  signInWithGoogle: (customRedirect?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<'signed-in' | 'activation-sent'>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: (redirectTo?: string) => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const publicRoutes = [
  '/',
  '/customer',
  '/plans',
  '/pricing',
  '/subscribe',
  '/apply',
  '/home',
  '/menu',
  '/shop',
  '/results',
  '/scan',
  '/profile',
  '/booths/join',
  '/auth',
  '/auth/callback',
  '/auth/forgot-password',
  '/auth/reset-password',
];

function getAppUrl(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
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
  const isSigningOutRef = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = window.localStorage.getItem('hawker-guest-mode');
    return stored === null ? true : stored === 'true';
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

  const [roles, setRoles] = useState<UserRoles>({
    isCustomer: true,
    hasShopOwner: false,
    hasBooth: false,
    isSuperAdmin: false,
    isSaasOwner: false,
    platformRole: null,
    isLoading: true,
    shops: [],
    booths: [],
  });

  const refreshRoles = useCallback(async () => {
    if (!user) {
      setRoles({
        isCustomer: true,
        hasShopOwner: false,
        hasBooth: false,
        isSuperAdmin: false,
        isSaasOwner: false,
        platformRole: null,
        isLoading: false,
        shops: [],
        booths: [],
      });
      return;
    }

    try {
      const res = await authenticatedFetch('/api/user/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles({
          isCustomer: data.isCustomer ?? true,
          hasShopOwner: data.hasShopOwner ?? false,
          hasBooth: data.hasBooth ?? false,
          isSuperAdmin: data.isSuperAdmin ?? false,
          isSaasOwner: data.isSaasOwner ?? false,
          platformRole: data.platformRole ?? null,
          isLoading: false,
          shops: data.shops ?? [],
          booths: data.booths ?? [],
        });
      }
    } catch {
      // Ignore network errors in role fetch
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      if (active && status === 'authenticated' && user) {
        void refreshRoles();
      }
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [status, user, refreshRoles]);

  const effectiveStatus: AuthStatus = isGuest ? 'authenticated' : status;

  const switchMode = useCallback(
    (mode: 'customer' | 'booth' | 'shop_owner') => {
      if (mode === 'customer') {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('hawker-user-mode', 'customer');
          window.localStorage.setItem('hawker-shop-owner-mode', 'false');
          router.push('/home');
        }
      } else if (mode === 'booth') {
        if (roles.hasBooth && typeof window !== 'undefined') {
          window.localStorage.setItem('hawker-user-mode', 'owner');
          window.localStorage.setItem('hawker-shop-owner-mode', 'false');
          router.push('/owner/orders');
        }
      } else if (mode === 'shop_owner') {
        if (roles.hasShopOwner && typeof window !== 'undefined') {
          window.localStorage.setItem('hawker-user-mode', 'customer');
          window.localStorage.setItem('hawker-shop-owner-mode', 'true');
          router.push('/shop-owner/booths');
        }
      }
    },
    [roles.hasBooth, roles.hasShopOwner, router],
  );

  useEffect(() => {
    if (effectiveStatus === 'loading' || isSigningOutRef.current) return;

    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

    if (effectiveStatus === 'unauthenticated' && !isPublicRoute) {
      const returnUrl = pathname + (typeof window !== 'undefined' ? window.location.search : '');
      saveAuthRedirect(returnUrl);
      router.replace(`/auth?redirect=${encodeURIComponent(returnUrl)}` as any);
      return;
    }

    if (effectiveStatus === 'authenticated' && user && isPublicRoute && pathname.startsWith('/auth')) {
      const searchRedirect = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect') : null;
      void resolveUserDestination(supabase, user, searchRedirect).then((destination) => {
        router.replace(destination as any);
      });
      return;
    }

    // Role-based route protection
    if (effectiveStatus === 'authenticated' && user && !roles.isLoading) {
      if (pathname.startsWith('/shop-owner') && !roles.hasShopOwner) {
        router.replace('/apply');
        return;
      }
      if ((pathname.startsWith('/owner') || pathname.startsWith('/stall')) && !roles.hasBooth && !roles.hasShopOwner) {
        router.replace('/profile');
        return;
      }
    }
  }, [effectiveStatus, isGuest, pathname, roles.hasBooth, roles.hasShopOwner, roles.isLoading, router, user]);

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

  const continueAsGuest = useCallback(async (customRedirect?: string) => {
    setIsGuest(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hawker-guest-mode', 'true');
    }
    const target = resolveAuthRedirect(customRedirect);
    router.replace(target as any);
  }, [router]);

  const signInWithGoogle = async (customRedirect?: string) => {
    const client = supabase;
    if (!client) throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');

    setIsGuest(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hawker-guest-mode', 'false');
    }

    const redirectTarget = resolveAuthRedirect(customRedirect);
    saveAuthRedirect(redirectTarget);

    const redirectUrl = `${getAppUrl()}/auth/callback?redirect=${encodeURIComponent(redirectTarget)}`;

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
      const { data, error: signUpError } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${getAppUrl()}/auth/callback`,
        },
      });

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
      options: {
        emailRedirectTo: `${getAppUrl()}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(getFriendlyAuthError(error));
    }
  };

  const signOut = useCallback(
    async (redirectTo?: string) => {
      isSigningOutRef.current = true;
      const targetDestination = resolveSignOutDestination(redirectTo);

      if (isGuest) {
        setIsGuest(false);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('hawker-guest-mode', 'false');
          window.location.href = targetDestination;
        } else {
          router.replace(targetDestination as any);
        }
        return;
      }

      const client = supabase;
      if (!client) {
        if (typeof window !== 'undefined') {
          window.location.href = targetDestination;
        } else {
          router.replace(targetDestination as any);
        }
        return;
      }

      setUser(null);
      setStatus('unauthenticated');
      setRoles({
        isCustomer: true,
        hasShopOwner: false,
        hasBooth: false,
        isSuperAdmin: false,
        isSaasOwner: false,
        platformRole: null,
        isLoading: false,
        shops: [],
        booths: [],
      });

      try {
        await client.auth.signOut();
      } catch (error) {
        console.error('Sign out error:', error);
      }

      if (typeof window !== 'undefined') {
        window.location.href = targetDestination;
      } else {
        router.replace(targetDestination as any);
      }
    },
    [isGuest, router],
  );

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
      roles,
      refreshRoles,
      switchMode,
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
    [
      changePassword,
      continueAsGuest,
      effectiveStatus,
      isGuest,
      profile,
      refreshRoles,
      roles,
      signOut,
      switchMode,
      updateProfile,
      user,
    ],
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
